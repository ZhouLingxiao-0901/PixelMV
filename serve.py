"""Local static server for the pixel MV.

Only the Python standard library is used.

Usage:
    cd D:\\PixelMV
    python serve.py                 # http://127.0.0.1:8123/
    python serve.py --port 9000
    python serve.py --host 0.0.0.0  # expose on the LAN (optional)
"""

from __future__ import annotations

import argparse
import functools
import http.server
import os
import socketserver

ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    # Explicit MIME types: Windows sometimes reports .js as text/plain from the
    # registry, which makes browsers refuse to load ES modules.
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".mjs": "text/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".png": "image/png",
        ".svg": "image/svg+xml",
    }

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt: str, *args) -> None:
        # Keep the terminal quiet unless something is actually broken.
        code = str(args[1])[:1] if len(args) > 1 else ""
        if code in ("4", "5"):
            super().log_message(fmt, *args)


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve the pixel MV locally.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8123)
    args = parser.parse_args()

    handler = functools.partial(Handler, directory=ROOT)
    with Server((args.host, args.port), handler) as httpd:
        print(f"Pixel MV: http://{args.host}:{args.port}/")
        print("Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")


if __name__ == "__main__":
    main()
