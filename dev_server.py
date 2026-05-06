from __future__ import annotations

import json
import os
import threading
import time
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parent
PORT = 3004
WATCH_EXTENSIONS = {".html", ".css", ".js", ".svg"}
last_change_token = str(int(time.time() * 1000))


def compute_snapshot() -> dict[str, int]:
    snapshot: dict[str, int] = {}
    for path in ROOT.rglob("*"):
        if path.is_file() and path.suffix.lower() in WATCH_EXTENSIONS:
            try:
                snapshot[str(path)] = path.stat().st_mtime_ns
            except OSError:
                continue
    return snapshot


def watch_files() -> None:
    global last_change_token
    previous = compute_snapshot()
    while True:
      time.sleep(1)
      current = compute_snapshot()
      if current != previous:
          previous = current
          last_change_token = str(int(time.time() * 1000))


class LiveReloadHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/__reload":
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"token": last_change_token}).encode("utf-8"))
            return

        requested = Path(unquote(parsed.path.lstrip("/")) or "index.html")
        candidate = ROOT / requested
        if candidate.is_dir():
            candidate = candidate / "index.html"

        if candidate.exists():
            self.path = "/" + candidate.relative_to(ROOT).as_posix()
        super().do_GET()


def main() -> None:
    watcher = threading.Thread(target=watch_files, daemon=True)
    watcher.start()

    server = ThreadingHTTPServer(("127.0.0.1", PORT), LiveReloadHandler)
    print(f"Live reload server running on http://localhost:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
