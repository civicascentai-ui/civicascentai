#!/usr/bin/env python3
"""Issue #22: isolated Git-code bundle -> served static site recovery preflight.

Safe scope: local checkout/bundle in an ephemeral CI runner, loopback HTTP only,
no secrets, database access, public traffic changes or live Vercel deployments.
Passing this test does NOT demonstrate a complete application/data restore.
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
import urllib.request

ROUTES = [
    "index.html", "journey-learn.html", "journey-try.html",
    "journey-help.html", "journey-continue.html", "veterans.html",
    "programs.html", "register.html", "es.html", "course.html",
    "free-ai-starter.html", "consultation.html", "learner-questions.html",
    "assets/home-reference.css", "assets/learning-rooms-accessible.css",
    "assets/home-reference.js",
]
ROOMS = ("journey-learn.html", "journey-try.html",
         "journey-help.html", "journey-continue.html")


def git(*args, cwd=None):
    call = subprocess.run(["git", *args], cwd=cwd, capture_output=True,
                          text=True, check=True)
    return call.stdout.strip()


def validate(pages):
    home = pages["index.html"]
    expected_home = ("Learn AI, one step at a time.", 'href="programs.html"',
                     'href="es.html"', 'href="register.html"')
    if not all(v in home for v in expected_home):
        raise AssertionError("Restored home is missing approved navigation/title")
    if len(re.findall(r'<article class="choice(?:\s|")', home)) != 3:
        raise AssertionError("Restored home must contain three choice cards")
    if any(v in home for v in ("Safari Home", "scenery-toggle", 'href="safari-home.html"')):
        raise AssertionError("Retired Safari controls returned after restore")
    for room in ROOMS:
        html = pages[room]
        if not all(s in html for s in
                   ("accessible-learning-rooms-20261015", 'tabindex="-1"',
                    'class="option-link"', "Back to home")):
            raise AssertionError(f"Restored room incomplete: {room}")
    if "Return to the Safari porch" in pages["veterans.html"]:
        raise AssertionError("Outdated Veterans navigation in restored source")
    if not re.search(r'<html[^>]*lang="es"', pages["es.html"]):
        raise AssertionError("Restored Spanish page has no language declaration")


def run(repo, output, ref):
    output.mkdir(parents=True, exist_ok=True)
    sha = git("-C", str(repo), "rev-parse", f"{ref}^{{commit}}")
    with tempfile.TemporaryDirectory(prefix="civicascent-dr-isolated-") as folder:
        folder = pathlib.Path(folder)
        bundle = folder / "production-full.bundle"
        restored = folder / "restored"
        # Ephemeral local ref; no remote branches or protected resources touched.
        git("-C", str(repo), "update-ref", "refs/heads/p1-isolated-restore", sha)
        git("-C", str(repo), "bundle", "create", str(bundle),
            "refs/heads/p1-isolated-restore")
        git("-C", str(repo), "bundle", "verify", str(bundle))
        checksum = hashlib.sha256(bundle.read_bytes()).hexdigest()
        git("clone", "--quiet", "--no-checkout", str(bundle), str(restored))
        git("-C", str(restored), "checkout", "--quiet", "--detach", sha)
        restored_sha = git("-C", str(restored), "rev-parse", "HEAD")
        git("-C", str(restored), "fsck", "--full", "--no-reflogs")
        if sha != restored_sha:
            raise AssertionError("Recovered source SHA differs from production Git main")

        class Handler(http.server.SimpleHTTPRequestHandler):
            def __init__(self, *args, **kwargs):
                super().__init__(*args, directory=str(restored), **kwargs)

            def log_message(self, *_):
                pass

        server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        pages, receipts = {}, {}
        try:
            root = f"http://127.0.0.1:{server.server_address[1]}"
            for route in ROUTES:
                with urllib.request.urlopen(f"{root}/{route}", timeout=10) as response:
                    payload = response.read()
                    receipts[route] = {"http": response.status, "bytes": len(payload)}
                    if response.status != 200 or not payload:
                        raise AssertionError(f"Restored route failure: {route}")
                    if route.endswith(".html"):
                        pages[route] = payload.decode("utf-8")
            validate(pages)
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)

    receipt = {
        "scope": "ISOLATED_GIT_CODE_AND_STATIC_SITE_ONLY",
        "source": "refs/remotes/origin/main",
        "productionSourceSha": sha, "isolatedRestoredSha": restored_sha,
        "ephemeralFullBundleSha256": checksum,
        "gitIntegrity": "PASS", "loopbackRouteSmoke": "PASS",
        "httpRoutes": receipts,
        "artifactContainsSiteSource": False,
        "bundlePersistedOutsideRunner": False,
        "shadowDeploymentParity": "NOT_VERIFIED",
        "dataUploadsConfigSecretsRestore": "NOT_VERIFIED",
        "timedCrossoverAndRollback": "NOT_VERIFIED",
        "fullDisasterRecoveryReady": False,
    }
    (output / "isolated-code-site-recovery.json").write_text(
        json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    print(f"PASS: exact code SHA {sha}, Git fsck and {len(receipts)} loopback routes")
    print("LIMIT: no complete data/config restore, standby parity or rollback proved")
    return receipt


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--repo", default=".")
    p.add_argument("--output", required=True)
    p.add_argument("--ref", default="refs/remotes/origin/main")
    args = p.parse_args()
    run(pathlib.Path(args.repo).resolve(), pathlib.Path(args.output).resolve(),
        args.ref)


if __name__ == "__main__":
    main()
