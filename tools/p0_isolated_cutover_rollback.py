#!/usr/bin/env python3
"""Issue #22: isolate static-site cutover, rollback and recovery on 127.0.0.1 ONLY.

Two full local Git bundles are restored into disposable trees. An HTTP server
changes only an in-process document-root pointer. No Vercel, real DNS, user
traffic, Supabase, provider credentials or payment settings are touched.
"""
import argparse
import hashlib
import http.server
import json
import pathlib
import re
import subprocess
import tempfile
import threading
import time
import urllib.request

DEFAULT_ROLLBACK_SHA = "af7edd4fb1be1507542db899611bcb63a207045c"
ROUTES = (
    "index.html", "journey-learn.html", "journey-try.html",
    "journey-help.html", "journey-continue.html", "veterans.html",
    "programs.html", "register.html", "es.html", "course.html",
    "free-ai-starter.html", "consultation.html", "learner-questions.html",
    "assets/home-reference.css", "assets/learning-rooms-accessible.css",
    "assets/home-reference.js",
)
ROOMS = ("journey-learn.html", "journey-try.html", "journey-help.html",
         "journey-continue.html")


def git(*args, cwd=None):
    return subprocess.run(["git", *args], cwd=cwd, check=True,
                          capture_output=True, text=True).stdout.strip()


def restored_bundle(repo, root, name, sha):
    ref = "refs/heads/p0-local-recovery-" + name
    git("-C", str(repo), "update-ref", ref, sha)
    bundle = root / (name + ".bundle")
    git("-C", str(repo), "bundle", "create", str(bundle), ref)
    git("-C", str(repo), "bundle", "verify", str(bundle))
    digest = hashlib.sha256(bundle.read_bytes()).hexdigest()
    restored = root / name
    git("clone", "--quiet", "--no-checkout", str(bundle), str(restored))
    git("-C", str(restored), "checkout", "--quiet", "--detach", sha)
    assert git("-C", str(restored), "rev-parse", "HEAD") == sha
    git("-C", str(restored), "fsck", "--full", "--no-reflogs")
    return restored, digest


class IsolatedHandler(http.server.SimpleHTTPRequestHandler):
    """Serve a temporary root; never expose local Git object directories."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(args[2].active_root), **kwargs)

    def end_headers(self):
        self.send_header("X-Isolated-Recovery-Sha", self.server.active_commit)
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, *_):
        pass

    def translate_path(self, path):
        self.directory = str(self.server.active_root)
        if ".git" in pathlib.PurePosixPath(path.split("?", 1)[0]).parts:
            return "/nonexistent/private-git-object"
        return super().translate_path(path)


def exercise(base_url, sha):
    pages = {}
    for route in ROUTES:
        with urllib.request.urlopen(base_url + "/" + route, timeout=10) as response:
            assert response.status == 200, (route, response.status)
            assert response.headers.get("X-Isolated-Recovery-Sha") == sha, route
            payload = response.read()
            assert payload, (route, "empty recovered response")
            if route.endswith(".html"):
                pages[route] = payload.decode("utf-8")
    home = pages["index.html"]
    assert "Learn AI, one step at a time." in home
    assert len(re.findall(r'<article class="choice(?:\s|")', home)) == 3
    assert all(name in home for name in (
        'href="programs.html"', 'href="es.html"', 'href="register.html"'))
    for room in ROOMS:
        assert all(x in pages[room] for x in (
            "accessible-learning-rooms-20261015", 'tabindex="-1"',
            'class="option-link"', "Back to home")), room
    assert "Return to the Safari porch" not in pages["veterans.html"]
    assert re.search(r'<html[^>]*lang="es"', pages["es.html"])
    return {"routes": len(ROUTES), "http": "ALL_200", "shaMatch": True,
            "approvedDesignMarkers": "PASS"}


def run(repo, output, current_ref, rollback_sha):
    output.mkdir(parents=True, exist_ok=True)
    current = git("-C", str(repo), "rev-parse", current_ref + "^{commit}")
    git("-C", str(repo), "cat-file", "-e", rollback_sha + "^{commit}")
    git("-C", str(repo), "merge-base", "--is-ancestor", rollback_sha, current)
    with tempfile.TemporaryDirectory(prefix="p0-static-failover-") as folder:
        tmp = pathlib.Path(folder)
        now_root, now_digest = restored_bundle(repo, tmp, "current", current)
        old_root, old_digest = restored_bundle(repo, tmp, "previous", rollback_sha)
        server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), IsolatedHandler)
        server.active_root = old_root
        server.active_commit = rollback_sha
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        base = "http://127.0.0.1:" + str(server.server_address[1])
        receipts = []
        try:
            for label, root, commit in (
                ("previous-release", old_root, rollback_sha),
                ("isolated-cutover-current", now_root, current),
                ("isolated-rollback-previous", old_root, rollback_sha),
                ("isolated-recover-current", now_root, current),
            ):
                server.active_root = root
                server.active_commit = commit
                begin = time.monotonic()
                result = exercise(base, commit)
                receipts.append({"step": label, "commit": commit, **result,
                                 "localSmokeSeconds": round(time.monotonic() - begin, 4)})
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)
    receipt = {
        "scope": "LOOPBACK_ONLY_STATIC_GIT_CODE",
        "productionSourceSha": current,
        "previousPublishedSourceSha": rollback_sha,
        "gitBundles": {"current": now_digest, "previous": old_digest},
        "isolatedGitIntegrity": "PASS",
        "steps": receipts, "checksTotal": len(ROUTES) * len(receipts),
        "realTrafficSwitched": False,
        "realCrossoverSeconds": "NOT_MEASURED",
        "persistentDataRestored": False,
        "vercelStandbyFunctionality": "NOT_TESTED",
        "fullDisasterRecoveryReady": False,
        "bundlesStored": False,
    }
    (output / "isolated-cutover-rollback.json").write_text(
        json.dumps(receipt, indent=2) + "\n", encoding="utf8")
    print("PASS: 4 local phases, %d restored route checks" % receipt["checksTotal"])
    print("NOT VERIFIED: live traffic switch, Vercel preview function, data restoration")
    return receipt


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--repo", default=".")
    p.add_argument("--output", required=True)
    p.add_argument("--current-ref", default="refs/remotes/origin/main")
    p.add_argument("--previous-sha", default=DEFAULT_ROLLBACK_SHA)
    args = p.parse_args()
    run(pathlib.Path(args.repo).resolve(), pathlib.Path(args.output).resolve(),
        args.current_ref, args.previous_sha)


if __name__ == "__main__":
    main()
