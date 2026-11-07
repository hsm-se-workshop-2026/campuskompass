from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from datetime import date
import json
import os
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlencode, urlsplit
from urllib.request import Request, urlopen


HOST = "127.0.0.1"
PORT = int(os.environ.get("PORT", "8000"))
UPSTREAM_URL = "https://www.stw-thueringen.de/xhr/loadspeiseplan.html"
FUEL_UPSTREAM_URL = "https://creativecommons.tankerkoenig.de/api/v4/stations/search"
PROJECT_DIR = Path(__file__).resolve().parent
MENSA_RESOURCES = {"67", "73"}
CAMPUS_COORDINATES = {"lat": "50.72", "lng": "10.45", "rad": "10"}


def load_env_file(path):
    if not path.is_file():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


load_env_file(PROJECT_DIR / ".env")


class DashboardHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PROJECT_DIR), **kwargs)

    def do_GET(self):
        parsed_path = urlsplit(self.path)
        if parsed_path.path == "/api/fuel":
            return self.do_fuel_prices()
        if parsed_path.path != "/api/mensa":
            return super().do_GET()

        requested_date = parse_qs(parsed_path.query).get("date", [""])[0]
        resource_id = parse_qs(parsed_path.query).get("resource_id", ["73"])[0]
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

    def do_fuel_prices(self):
        api_key = os.environ.get("TANKERKOENIG_API_KEY", "").strip()
        if not api_key:
            self.send_json(503, {
                "error": "Kraftstoffpreise nicht konfiguriert. Setze TANKERKOENIG_API_KEY und starte den Server neu."
            })
            return

        query = urlencode({"apikey": api_key, **CAMPUS_COORDINATES})
        request = Request(
            f"{FUEL_UPSTREAM_URL}?{query}",
            headers={"Accept": "application/json"},
        )

        try:
            with urlopen(request, timeout=15) as response:
                payload = json.loads(response.read())
        except HTTPError as error:
            self.log_error("Tankerkönig-Quelle antwortet mit HTTP %s", error.code)
            if error.code == 401:
                message = "Tankerkönig-API-Schlüssel ungültig. Prüfe TANKERKOENIG_API_KEY."
            elif error.code == 503:
                message = "Tankerkönig ist ausgelastet oder das Anfrage-Limit wurde erreicht. Bitte später erneut versuchen."
            else:
                message = f"Tankerkönig antwortet mit HTTP {error.code}."
            self.send_json(502, {"error": message})
            return
        except (TimeoutError, URLError, OSError, json.JSONDecodeError) as error:
            self.log_error("Tankerkönig-Quelle ist nicht erreichbar: %s", error)
            self.send_json(502, {"error": "Tankerkönig ist derzeit nicht erreichbar."})
            return

        if not isinstance(payload, dict) or not isinstance(payload.get("stations"), list):
            self.log_error("Tankerkönig-Quelle hat ein ungültiges Antwortformat geliefert.")
            self.send_json(502, {"error": "Die Kraftstoffdaten haben ein ungültiges Format."})
            return

        stations = [
            station for station in payload["stations"]
            if isinstance(station, dict)
            and isinstance(station.get("dist"), (int, float))
        ]
        payload["stations"] = sorted(stations, key=lambda station: station["dist"])[:3]
        self.send_json(200, payload)

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
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
