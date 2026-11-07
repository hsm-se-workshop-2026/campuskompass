"""Lokaler Webserver für das CampusKompass-Dashboard.

Der Mensaplan wird über diesen Server vermittelt, damit der Browser die
Cross-Origin-Beschränkung der externen Quelle nicht direkt umgehen muss.
"""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from datetime import date
import os
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlencode, urlsplit
from urllib.request import Request, urlopen


HOST = "127.0.0.1"
PORT = int(os.environ.get("PORT", "8000"))
UPSTREAM_URL = "https://www.stw-thueringen.de/xhr/loadspeiseplan.html"
PROJECT_DIR = Path(__file__).resolve().parent
MENSA_RESOURCES = {"67", "73"}


class DashboardHandler(SimpleHTTPRequestHandler):
    """Liefert Dashboard-Dateien aus und vermittelt Mensa-Anfragen."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PROJECT_DIR), **kwargs)

    def do_GET(self):
        """Bearbeitet statische GET-Anfragen und den Mensa-Proxy."""
        parsed_path = urlsplit(self.path)
        if parsed_path.path != "/api/mensa":
            return super().do_GET()

        query = parse_qs(parsed_path.query)
        requested_date = query.get("date", [""])[0]
        resource_id = query.get("resource_id", ["73"])[0]
        if resource_id not in MENSA_RESOURCES:
            self.send_error(400, "Unbekannte Mensa.")
            return

        form_data = {"resources_id": resource_id}
        if requested_date:
            try:
                meal_date = date.fromisoformat(requested_date)
            except ValueError:
                self.send_error(400, "Das Datum muss im Format JJJJ-MM-TT angegeben werden.")
                return
            form_data["date"] = meal_date.strftime("%d.%m.%Y")

        request = Request(
            UPSTREAM_URL,
            data=urlencode(form_data).encode("ascii"),
            headers={
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Referer": "https://www.stw-thueringen.de/mensen/",
                "X-Requested-With": "XMLHttpRequest",
            },
            method="POST",
        )

        try:
            with urlopen(request, timeout=15) as response:
                body = response.read()
                self.send_response(response.status)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Cache-Control", "no-store")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
        except HTTPError as error:
            self.log_error("Speiseplan-Quelle antwortet mit HTTP %s", error.code)
            self.send_error(502, "Das Studierendenwerk konnte nicht abgefragt werden.")
        except (TimeoutError, URLError, OSError) as error:
            self.log_error("Speiseplan-Quelle ist nicht erreichbar: %s", error)
            self.send_error(502, "Das Studierendenwerk ist derzeit nicht erreichbar.")


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
