#!/usr/bin/env python3
"""Local-only, fail-closed API adapter. Not a running video-editing agent."""
import json
import os
from pathlib import Path
import socket

class BridgeError(RuntimeError):
    pass

class ConcatBridge:
    READ = frozenset(("version", "catalogue.list"))
    def __init__(self, host="127.0.0.1", port=7420, token=None, root=None,
                 allow_export=False, timeout=5):
        if host != "127.0.0.1":
            raise BridgeError("Remote host prohibited; 127.0.0.1 only")
        if not (1 <= port <= 65535 and 0 < timeout <= 30):
            raise BridgeError("Port or timeout out of allowed range")
        self.host, self.port, self.timeout = host, port, timeout
        self.token = token if token is not None else os.environ.get("CONCAT_API_TOKEN")
        self.root = Path(root).resolve(strict=True) if root else None
        self.allow_export = allow_export

    def _in_sandbox(self, path, existing_dir=False):
        if self.root is None:
            raise BridgeError("Dedicated sandbox root required")
        target = Path(path).resolve(strict=existing_dir)
        if not target.is_relative_to(self.root) or target == self.root:
            raise BridgeError("Path outside sandbox")
        if existing_dir and not target.is_dir():
            raise BridgeError("Missing project directory")
        return target

    @staticmethod
    def _answer(reader, expected_id):
        for _ in range(32):
            line = reader.readline(65537)
            if not line or len(line) > 65536:
                raise BridgeError("Missing or oversized response")
            try:
                msg = json.loads(line)
            except (ValueError, UnicodeError) as exc:
                raise BridgeError("Invalid JSON-RPC reply") from exc
            if not isinstance(msg, dict):
                raise BridgeError("Invalid response object")
            if msg.get("id") != expected_id:
                if "method" in msg and "id" not in msg:
                    continue
                raise BridgeError("Unmatched response ID")
            if "error" in msg:
                raise BridgeError("Local API rejected request")
            if "result" not in msg:
                raise BridgeError("Missing result")
            return msg["result"]
        raise BridgeError("Too many events")

    def _authorize(self, method, params):
        """Every network write enforces the method and sandbox gate itself."""
        import math
        import re
        if not isinstance(params, dict):
            raise BridgeError("Parameters must be an object")
        if method in self.READ:
            return
        if not self.allow_export or self.root is None:
            raise BridgeError("Mutation API disabled pending QC")
        if method == "project.create":
            if set(params) != {"location", "name", "video"}:
                raise BridgeError("Unexpected project parameters")
            if Path(params["location"]).resolve(strict=True) != self.root:
                raise BridgeError("Project location outside sandbox")
            name = params["name"]
            if not isinstance(name, str) or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]{0,47}", name):
                raise BridgeError("Unsafe project name")
            if (self.root / name).exists():
                raise BridgeError("Project already exists")
            video=params["video"]
            if (not isinstance(video, dict) or
                set(video) != {"width", "height", "rateNum", "rateDen"} or
                type(video["width"]) is not int or type(video["height"]) is not int or
                type(video["rateNum"]) is not int or type(video["rateDen"]) is not int or
                not 1 <= video["width"] <= 1920 or
                not 1 <= video["height"] <= 1080 or
                not 1 <= video["rateNum"] <= 60 or video["rateDen"] != 1):
                raise BridgeError("Unsafe sample video settings")
            return
        if method == "media.import":
            if set(params) != {"path", "file"}:
                raise BridgeError("Unexpected media parameters")
            self._in_sandbox(params["path"], existing_dir=True)
            source=self._in_sandbox(params["file"])
            if not source.is_file() or source.suffix.lower() not in (".mp4", ".mov"):
                raise BridgeError("Only existing local video media permitted")
            return
        if method == "edit.apply":
            if set(params) != {"path", "command"}:
                raise BridgeError("Unexpected edit parameters")
            self._in_sandbox(params["path"], existing_dir=True)
            command=params["command"]
            if (not isinstance(command, dict) or
                set(command) != {"op", "mediaId", "start"} or
                command["op"] != "addClipAtFirstFree" or
                not isinstance(command["mediaId"], str) or
                not re.fullmatch(r"m[0-9]+", command["mediaId"]) or
                not isinstance(command["start"], (int, float)) or
                not math.isfinite(command["start"]) or command["start"] != 0):
                raise BridgeError("Unsafe edit command")
            return
        if method == "export.run":
            if set(params) != {"path", "output"}:
                raise BridgeError("Unexpected export parameters")
            self._in_sandbox(params["path"], existing_dir=True)
            output=self._in_sandbox(params["output"])
            if (output.suffix.lower() not in (".mp4", ".mov") or
                    not output.parent.is_dir() or output.exists()):
                raise BridgeError("Unsafe export target")
            return
        raise BridgeError("Method not on sandbox command allowlist")

    def _request(self, method, params):
        self._authorize(method, params)
        if not self.token or not self.token.strip():
            raise BridgeError("CONCAT_API_TOKEN required")
        try:
            with socket.create_connection((self.host, self.port), timeout=self.timeout) as s:
                s.settimeout(self.timeout)
                with s.makefile("rwb", buffering=0) as channel:
                    def send(ident, method_name, values):
                        payload = {"jsonrpc":"2.0","id":ident,"method":method_name,"params":values}
                        channel.write(json.dumps(payload).encode() + b"\n")
                    send(0, "auth", {"token": self.token})
                    self._answer(channel, 0)
                    send(1, method, params)
                    return self._answer(channel, 1)
        except (OSError, TimeoutError) as exc:
            raise BridgeError("Local API unavailable") from exc

    def read(self, method, params=None):
        if method not in self.READ:
            raise BridgeError("Operation not on read-only allowlist")
        if params is not None and not isinstance(params, dict):
            raise BridgeError("Invalid arguments")
        return self._request(method, params or {})

    def export_sandbox(self, project, output):
        if not self.allow_export:
            raise BridgeError("Export disabled pending independent QC")
        source = self._in_sandbox(project, existing_dir=True)
        target = self._in_sandbox(output)
        if target.suffix.lower() not in (".mp4", ".mov"):
            raise BridgeError("Unsupported export format")
        if not target.parent.is_dir() or target.exists():
            raise BridgeError("Refuse overwrite or missing parent")
        return self._request("export.run", {"path":str(source),"output":str(target)})
