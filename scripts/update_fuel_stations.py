"""Fetch nearby fuel stations and prices into a public static snapshot."""

from datetime import datetime, timezone
from html import unescape
import json
import math
import os
from pathlib import Path
import time
from urllib.error import URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


PROJECT_DIR = Path(__file__).resolve().parents[1]
OUTPUT_FILE = PROJECT_DIR / "fuel-stations.json"
ENDPOINT = "https://creativecommons.tankerkoenig.de/json/list.php"
RADIUS_KM = 10
STATION_LIMIT = 5
REQUEST_INTERVAL_SECONDS = 61
CAMPUS_SEARCHES = {
    "Schmalkalden": {
        "latitude": 50.72,
        "longitude": 10.45,
    },
    "Gera": {
        "latitude": 50.9036892,
        "longitude": 12.0703215,
    },
}


def fetch_stations(api_key, campus_name, latitude, longitude, last_request):
    remaining = REQUEST_INTERVAL_SECONDS - (time.monotonic() - last_request)
    if last_request > 0 and remaining > 0:
        time.sleep(remaining)

    query = urlencode({
        "lat": latitude,
        "lng": longitude,
        "rad": RADIUS_KM,
        "sort": "dist",
        "type": "all",
        "apikey": api_key,
    })
    request = Request(
        f"{ENDPOINT}?{query}",
        headers={"User-Agent": "CampusKompass/1.0 (scheduled fuel price snapshot)"},
    )
    try:
        with urlopen(request, timeout=30) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (URLError, TimeoutError, OSError, json.JSONDecodeError):
        raise RuntimeError(
            f"Tankerkönig-Abfrage für {campus_name} ist fehlgeschlagen."
        ) from None

    if (
        not isinstance(payload, dict)
        or payload.get("ok") is not True
        or not isinstance(payload.get("stations"), list)
    ):
        raise RuntimeError(
            f"Tankerkönig lieferte für {campus_name} keine gültigen Tankstellendaten."
        )

    stations = []
    for station in payload["stations"]:
        if not isinstance(station, dict):
            continue
        if not isinstance(station.get("id"), str) or not isinstance(station.get("name"), str):
            continue
        distance = station.get("dist")
        if (
            not isinstance(distance, (int, float))
            or isinstance(distance, bool)
            or not math.isfinite(distance)
        ):
            continue

        stations.append({
            "id": station["id"],
            "name": unescape(station["name"]),
            "brand": unescape(station.get("brand") or ""),
            "street": unescape(station.get("street") or ""),
            "houseNumber": unescape(station.get("houseNumber") or ""),
            "place": unescape(station.get("place") or ""),
            "postCode": station.get("postCode") or "",
            "latitude": station.get("lat"),
            "longitude": station.get("lng"),
            "distanceKm": round(distance, 1),
            "isOpen": station.get("isOpen") is True,
            "prices": {
                fuel: price
                if isinstance(price, (int, float))
                and not isinstance(price, bool)
                and math.isfinite(price)
                else None
                for fuel, price in (
                    ("e5", station.get("e5")),
                    ("e10", station.get("e10")),
                    ("diesel", station.get("diesel")),
                )
            },
        })

    return sorted(stations, key=lambda station: station["distanceKm"])[:STATION_LIMIT]


def main():
    api_key = os.environ.get("TANKERKOENIG_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError(
            "Das GitHub-Actions-Secret TANKERKOENIG_API_KEY ist nicht konfiguriert."
        )

    campus_stations = {}
    last_request = 0.0
    for campus_name, coordinates in CAMPUS_SEARCHES.items():
        campus_stations[campus_name] = fetch_stations(
            api_key,
            campus_name,
            coordinates["latitude"],
            coordinates["longitude"],
            last_request,
        )
        last_request = time.monotonic()
        print(f"{campus_name}: {len(campus_stations[campus_name])} Tankstellen")

    snapshot = {
        "updatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "license": "CC BY 4.0",
        "campuses": campus_stations,
    }
    temporary_file = OUTPUT_FILE.with_suffix(".json.tmp")
    temporary_file.write_text(
        json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    temporary_file.replace(OUTPUT_FILE)
    print(f"Tankstellendaten gespeichert: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
