"""Actual synthetic media import/edit/MP4 export, bounded to disposable CI host.

No private media, public publishing, real credentials, cloud charges or website edits.
"""
from datetime import datetime, timezone
import json
import hashlib
import shutil
import os
from pathlib import Path
import re
import secrets
import signal
import subprocess
import sys
import tempfile
import time

from bridge import ConcatBridge, BridgeError

def run_cmd(args, timeout=45):
    return subprocess.run(args, check=True, capture_output=True, text=True, timeout=timeout)

def main():
    results = Path("concat-export-results")
    results.mkdir(exist_ok=True)
    receipt = {"tool":"Concat v0.2.7", "run_id":os.environ.get("GITHUB_RUN_ID"),
               "timestamp_utc":datetime.now(timezone.utc).isoformat(),
               "stage":"starting", "result":"failed", "actual_video_export":False,
               "paid_api":False, "production_or_website_changes":False}
    proc = None
    try:
        app = Path(os.environ["CONCAT_APPIMAGE"])
        if not app.is_file():
            raise RuntimeError("Pinned Concat package not available")
        with tempfile.TemporaryDirectory(prefix="concat-media-e2e-") as temp:
            home = Path(temp)
            root = home / "isolated-projects"
            root.mkdir()
            config_home = home / ".config"
            config = config_home / "app.concat.editor"
            config.mkdir(parents=True)
            token = secrets.token_hex(24)
            (config / "settings.json").write_text(json.dumps({
                "server": {"enabled": True,"listen":"127.0.0.1:7420","token":token}}))
            env = dict(os.environ, HOME=str(home), XDG_CONFIG_HOME=str(config_home),
                       XDG_DATA_HOME=str(home / ".local/share"),
                       LIBGL_ALWAYS_SOFTWARE="1", APPIMAGE_EXTRACT_AND_RUN="1")
            original = root / "synthetic-source.mp4"
            receipt["stage"] = "generate_input"
            run_cmd(["ffmpeg","-y","-hide_banner","-loglevel","error",
                     "-f","lavfi","-i","testsrc2=size=160x90:rate=24",
                     "-t","1.0","-an","-c:v","libx264","-pix_fmt","yuv420p",
                     "-preset","ultrafast",str(original)])
            original_probe = json.loads(run_cmd([
                "ffprobe","-v","error","-show_entries","format=duration:stream=codec_name,width,height",
                "-of","json",str(original)]).stdout)
            receipt["stage"] = "launch"
            with (home / "app.log").open("wb") as app_log:
                proc = subprocess.Popen(["xvfb-run","-a","-s","-screen 0 1280x800x24",str(app)],
                                        stdout=app_log, stderr=subprocess.STDOUT, env=env,
                                        start_new_session=True)
                client = ConcatBridge(token=token, root=root, allow_export=True, timeout=4)
                up = False
                for _ in range(45):
                    if proc.poll() is not None:
                        raise RuntimeError("App exited before API was ready")
                    try:
                        version = client.read("version")
                        up = version.get("concat") == "0.2.7"
                        if up:
                            break
                    except BridgeError:
                        time.sleep(.5)
                if not up:
                    raise RuntimeError("Actual API did not start")
                receipt["stage"] = "create_project"
                created = client._request("project.create", {
                    "location":str(root),"name":"e2e-test",
                    "video":{"width":160,"height":90,"rateNum":24,"rateDen":1}})
                if "project" not in created:
                    raise RuntimeError("Project creation returned no project")
                project = root / "e2e-test"
                if not project.is_dir():
                    raise RuntimeError("Project directory was not created")
                receipt["stage"] = "import_synthetic"
                imported = client._request("media.import", {"path":str(project),
                                                           "file":str(original)})
                media = imported.get("project",{}).get("media",[])
                media_id = next((x.get("id") for x in media
                                 if x.get("path")==str(original)),None)
                if not media_id:
                    raise RuntimeError("Media import produced no media ID")
                receipt["stage"] = "edit_timeline"
                edited = client._request("edit.apply",{"path":str(project),
                    "command":{"op":"addClipAtFirstFree","mediaId":media_id,"start":0.0}})
                timelines = edited.get("project",{}).get("timelines",[])
                if not timelines or not timelines[0].get("clips"):
                    raise RuntimeError("Media was not placed on timeline")
                receipt["stage"] = "export_video"
                output = root / "result.mp4"
                started = client.export_sandbox(project, output)
                if not started.get("job"):
                    raise RuntimeError("Export returned no job ID")
                receipt["stage"] = "verify_render"
                end = time.monotonic()+70
                produced = None
                while time.monotonic()<end:
                    if proc.poll() is not None:
                        raise RuntimeError("Concat exited during render")
                    if output.exists() and output.stat().st_size>1000:
                        try:
                            produced = json.loads(run_cmd(["ffprobe","-v","error",
                                "-show_entries","format=duration:stream=codec_name,width,height",
                                "-of","json",str(output)], timeout=5).stdout)
                            if produced.get("streams") and float(produced["format"]["duration"]) >= .9:
                                break
                        except (subprocess.SubprocessError, ValueError, KeyError, json.JSONDecodeError):
                            pass
                    time.sleep(.5)
                if not produced or float(produced["format"]["duration"]) < .9:
                    raise RuntimeError("Rendered MP4 did not become playable")
                stream=next(x for x in produced["streams"] if x.get("codec_name") in ("h264","hevc","av1"))
                if stream.get("width")!=160 or stream.get("height")!=90:
                    raise RuntimeError("Rendered dimensions incorrect")
                shutil.copyfile(output, results / "rendered-synthetic.mp4")
                digest=hashlib.sha256(output.read_bytes()).hexdigest()
                receipt.update(stage="complete",result="passed",actual_video_export=True,
                               output_sha256=digest,
                               created_project=True,synthetic_clip_imported=True,
                               actual_timeline_edit=True,playable_mp4=True,
                               output_bytes=output.stat().st_size,
                               output_codec=stream["codec_name"],
                               output_duration_seconds=float(produced["format"]["duration"]),
                               media_source="generated synthetic testsrc2; no customer media",
                               limitations=["No captions, Spanish or Android checks",
                                            "No independent human frame review",
                                            "No production integration or public publishing"])
    except Exception as exc:
        receipt.update(error=type(exc).__name__,reason=str(exc))
    finally:
        if proc is not None and proc.poll() is None:
            try:
                os.killpg(proc.pid, signal.SIGTERM)
                proc.wait(timeout=4)
            except (ProcessLookupError, subprocess.TimeoutExpired):
                try:
                    os.killpg(proc.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
        (results / "receipt.json").write_text(json.dumps(receipt,indent=2,sort_keys=True))
        print(json.dumps(receipt,sort_keys=True))
    return 0 if receipt["result"]=="passed" else 1

if __name__ == "__main__":
    sys.exit(main())
