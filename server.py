"""Statischer lokaler Webserver für das CampusKompass-Dashboard."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
from pathlib import Path


HOST = "127.0.0.1"
PORT = int(os.environ.get("PORT", "8000"))
PROJECT_DIR = Path(__file__).resolve().parent


class DashboardHandler(SimpleHTTPRequestHandler):
    """Liefert statische Dashboard-Dateien aus."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PROJECT_DIR), **kwargs)


def main():
    """Startet den lokalen Server und fährt ihn kontrolliert herunter."""
    server = ThreadingHTTPServer((HOST, PORT), DashboardHandler)
    print(f"Campus-Dashboard läuft unter http://{HOST}:{PORT}/")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer wird beendet.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
