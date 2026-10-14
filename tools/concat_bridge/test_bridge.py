"""Loopback-only fake-server contract tests, not actual video exports."""
import json
from pathlib import Path
import socketserver
import tempfile
import threading
import unittest
from bridge import BridgeError, ConcatBridge

class FakeHandler(socketserver.StreamRequestHandler):
    def handle(self):
        for line in self.rfile:
            req=json.loads(line)
            if req["method"]=="auth":
                data=({"result":{"authorized":True}} if req["params"].get("token")=="test-only" else {"error":{"code":-32000}})
            elif req["method"]=="version":
                self.wfile.write(b'{"jsonrpc":"2.0","method":"status.changed","params":{}}\n')
                data={"result":{"version":"test-mock"}}
            elif req["method"]=="export.run":
                data={"result":{"job":"mock-job","output":req["params"]["output"]}}
            else:
                data={"result":{"items":[]}}
            self.wfile.write(json.dumps({"jsonrpc":"2.0","id":req["id"],**data}).encode()+b"\n")

class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address=True
    daemon_threads=True

class SafetyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server=Server(("127.0.0.1",0),FakeHandler)
        cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True)
        cls.thread.start()
    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=3)
    def client(self, **kwargs):
        return ConcatBridge(port=self.server.server_address[1],token="test-only",**kwargs)
    def test_absent_token(self):
        with self.assertRaises(BridgeError):
            ConcatBridge(port=self.server.server_address[1],token="").read("version")
    def test_block_remote_hosts(self):
        for host in ("0.0.0.0","localhost","::1","192.0.2.1"):
            with self.subTest(host=host),self.assertRaises(BridgeError):
                ConcatBridge(host=host,token="test-only")
    def test_bad_timeouts(self):
        with self.assertRaises(BridgeError):
            self.client(timeout=99)
    def test_version_authenticated_and_event_ignored(self):
        self.assertEqual(self.client().read("version")["version"],"test-mock")
    def test_catalogue_read(self):
        self.assertEqual(self.client().read("catalogue.list",{"kind":"filter"}),{"items":[]})
    def test_bad_auth_rejected(self):
        with self.assertRaises(BridgeError):
            ConcatBridge(port=self.server.server_address[1],token="incorrect").read("version")
    def test_mutation_method_allowlist(self):
        for method in ("edit.apply","export.run","project.create","media.import"):
            with self.subTest(method=method),self.assertRaises(BridgeError):
                self.client().read(method)
    def test_export_off_by_default(self):
        with self.assertRaises(BridgeError):
            self.client().export_sandbox("/tmp/unused","/tmp/no.mp4")
    def test_mock_export_with_explicit_opt_in(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/"project"
            p.mkdir()
            out=Path(d)/"output.mp4"
            response=self.client(root=d,allow_export=True).export_sandbox(p,out)
            self.assertEqual(response["job"],"mock-job")
            self.assertEqual(response["output"],str(out))
    def test_reject_path_escape(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/"project"
            p.mkdir()
            with self.assertRaises(BridgeError):
                self.client(root=d,allow_export=True).export_sandbox(p,"/tmp/out.mp4")
    def test_reject_symlink_escape(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/"project"
            p.mkdir()
            (Path(d)/"link").symlink_to("/tmp")
            with self.assertRaises(BridgeError):
                self.client(root=d,allow_export=True).export_sandbox(p,Path(d)/"link"/"out.mp4")
    def test_reject_overwrite(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/"project"
            p.mkdir()
            out=Path(d)/"file.mp4"
            out.write_bytes(b"keep")
            with self.assertRaises(BridgeError):
                self.client(root=d,allow_export=True).export_sandbox(p,out)
            self.assertEqual(out.read_bytes(),b"keep")
    def test_reject_nonmedia_export(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/"project"
            p.mkdir()
            with self.assertRaises(BridgeError):
                self.client(root=d,allow_export=True).export_sandbox(p,Path(d)/"x.sh")
    def test_fail_closed_without_listener(self):
        with self.assertRaises(BridgeError):
            ConcatBridge(port=1,token="test-only",timeout=.3).read("version")

if __name__=="__main__":
    unittest.main(verbosity=2)
