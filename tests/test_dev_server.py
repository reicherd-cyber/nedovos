from __future__ import annotations

import json
import threading
import unittest
from contextlib import contextmanager
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.request import urlopen
from unittest.mock import patch

import dev_server
from http.server import ThreadingHTTPServer


class QuietLiveReloadHandler(dev_server.LiveReloadHandler):
    def log_message(self, format: str, *args) -> None:
        return


@contextmanager
def running_server(root: Path, token: str = "test-token"):
    with (
        patch.object(dev_server, "ROOT", root),
        patch.object(dev_server, "last_change_token", token),
    ):
        server = ThreadingHTTPServer(("127.0.0.1", 0), QuietLiveReloadHandler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            yield f"http://127.0.0.1:{server.server_address[1]}"
        finally:
            server.shutdown()
            thread.join(timeout=5)
            server.server_close()


class ComputeSnapshotTests(unittest.TestCase):
    def test_filters_to_watched_extensions(self) -> None:
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            watched = root / "page.html"
            ignored = root / "notes.txt"
            watched.write_text("<h1>ok</h1>", encoding="utf-8")
            ignored.write_text("ignore me", encoding="utf-8")

            with patch.object(dev_server, "ROOT", root):
                snapshot = dev_server.compute_snapshot()

            self.assertIn(str(watched), snapshot)
            self.assertNotIn(str(ignored), snapshot)
            self.assertEqual(snapshot[str(watched)], watched.stat().st_mtime_ns)


class LiveReloadHandlerTests(unittest.TestCase):
    def test_reload_endpoint_returns_current_token(self) -> None:
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "index.html").write_text("home", encoding="utf-8")

            with running_server(root, token="abc123") as base_url:
                with urlopen(f"{base_url}/__reload") as response:
                    payload = json.load(response)
                    cache_control = response.headers["Cache-Control"]
                    content_type = response.headers["Content-Type"]

            self.assertEqual(payload, {"token": "abc123"})
            self.assertEqual(cache_control, "no-store, no-cache, must-revalidate")
            self.assertIn("application/json", content_type)

    def test_directory_request_serves_nested_index_file(self) -> None:
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            nested = root / "campaigns"
            nested.mkdir()
            (nested / "index.html").write_text("campaign page", encoding="utf-8")

            with running_server(root) as base_url:
                with urlopen(f"{base_url}/campaigns/") as response:
                    body = response.read().decode("utf-8")

            self.assertIn("campaign page", body)


if __name__ == "__main__":
    unittest.main()
