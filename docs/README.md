# Projektdokumentation

Das Projekt enthält zwei Anwendungen:

1. einen Python-GPX-Visualizer für Wanderungen,
2. das lokale Webdashboard **CampusKompass** für Studierende.

Die Anwendungen sind unabhängig voneinander und besitzen jeweils einen
eigenen Startpunkt.

## 1. GPX-Visualizer

### Zweck

Der GPX-Visualizer liest eine GPX-Datei ein und stellt eine Wanderung
grafisch dar. Die Standarddatei ist `assets/Wanderung.gpx`.

### Ablauf

1. `src/main.py` ruft `GpxTrack.from_gpx(...)` auf.
2. `src/model/track.py` liest die XML-Datei und erzeugt für jeden Trackpunkt
   ein `GeoPoint`-Objekt.
3. Die Punkte werden in einer `Route` gesammelt.
4. `main.py` berechnet daraus Entfernung, Zeit, Höhenmeter und
   Durchschnittsgeschwindigkeit.
5. Matplotlib zeigt eine 2D-Karte, ein Höhenprofil und einen Strecken-Slider.
6. Über **3D Ansicht** kann die Route mit der Höhe als dritter Dimension
   angezeigt werden.

### Wichtige Klassen und Funktionen

| Datei | Element | Aufgabe |
|---|---|---|
| `src/model/track.py` | `GeoPoint` | Speichert Breiten- und Längengrad, Höhe und Zeitstempel. |
| `src/model/track.py` | `Route` | Enthält die Punkte einer Route. |
| `src/model/track.py` | `GpxTrack` | Liest eine GPX-Datei und erstellt eine Route. |
| `src/main.py` | `haversine_m` | Berechnet die Entfernung zwischen zwei GPS-Punkten. |
| `src/main.py` | `compute_statistics` | Berechnet Gesamtstrecke, Zeit, Höhenmeter und Geschwindigkeit. |
| `src/main.py` | `main` | Erstellt die Matplotlib-Oberfläche. |

### Darstellung

- Die GPS-Koordinaten werden näherungsweise in Web Mercator (EPSG:3857)
  umgerechnet.
- `contextily` lädt eine Hintergrundkarte.
- Der obere Bereich zeigt die Route und Gesamtstatistiken.
- Der untere Bereich zeigt das Höhenprofil.
- Der gelbe Marker folgt beim Bewegen des Sliders der Route.
- Fehlende Höhenwerte werden für die Darstellung als `0.0` behandelt.

### Start

Im Projektordner:

```powershell
python .\src\main.py
```

Der GPX-Visualizer benötigt unter anderem `matplotlib` und `contextily`.
Die verwendete GPX-Datei muss relativ zum Projektordner unter
`assets/Wanderung.gpx` vorhanden sein.

### Bekannte Grenzen

`Route.get_distance`, `Statistics.calculate` und
`HeightProfile.get_gradient` in `src/model/` sind derzeit Platzhalter.
Die aktuell verwendeten Gesamtstatistiken werden direkt in `src/main.py`
berechnet.

## 2. CampusKompass

### Zweck

CampusKompass ist ein lokales, browserbasiertes Dashboard. Es bündelt:

- den Stunden- bzw. Studienplan,
- den Mensaplan,
- Wetterinformationen,
- eine Wegbeschreibung zum passenden Campus.

### Aufbau

- `campuskompass/index.html` enthält Oberfläche, CSS und JavaScript.
- `campuskompass/study-plan.json` enthält die strukturierten Termine.
- `campuskompass/server.py` startet den lokalen Webserver.
- `campuskompass/assets/` enthält die Logos.

### Ablauf einer Datumsänderung

1. Die Nutzerin oder der Nutzer wählt ein Datum.
2. Das JavaScript sucht passende Termine in `study-plan.json`.
3. Aus dem Studienort werden Mensa, Wetterstandort und Routenziel bestimmt.
4. Der Mensaplan wird über `/api/mensa` geladen.
5. Wetterdaten werden von Open-Meteo geladen.
6. Die Route wird als Google-Maps-Wegbeschreibung angezeigt.

Der Python-Server stellt die statischen Dateien bereit und fungiert beim
Mensaplan als Proxy. Dadurch wird der externe Mensa-Endpunkt vom Browser aus
nicht direkt wegen CORS angesprochen.

### Start

```powershell
cd ".\campuskompass"
python .\server.py
```

Danach im Browser öffnen:

<http://127.0.0.1:8000/>

Der Port kann über die Umgebungsvariable `PORT` geändert werden:

```powershell
$env:PORT = "8001"
python .\server.py
```

### Mensa-Endpunkt

Der Server akzeptiert:

```text
/api/mensa?date=JJJJ-MM-TT&resource_id=67
/api/mensa?date=JJJJ-MM-TT&resource_id=73
```

Die Ressourcen-ID `67` steht für die Mensa in Gera, `73` für die Mensa
Blechhammer in Schmalkalden. Ungültige IDs oder Datumswerte werden mit einem
HTTP-Fehler beantwortet. Fehler beim externen Studierendenwerk werden als
`502 Bad Gateway` gemeldet.

## Verzeichnisübersicht

```text
assets/              GPX- und Höhendaten
campuskompass/       Webdashboard und lokaler Server
docs/                Projektdokumentation und PlantUML
modellierung/        weitere UML-Entwürfe
src/                 GPX-Visualizer und Datenmodell
requirements/        Anforderungen und User Stories
tools/               zusätzliche Werkzeuge
```

## Diagramm

Das vereinfachte Architekturdiagramm liegt in
[`komponenten.puml`](./komponenten.puml). Es kann mit PlantUML oder einer
PlantUML-Erweiterung für Visual Studio Code in eine Grafik umgewandelt werden.

## User Stories und Präsentation

Die User Stories mit MoSCoW-Priorisierung und Akzeptanzkriterien stehen in
[`userstories-moscow.md`](./userstories-moscow.md).

Die Präsentation liegt als Marp-kompatible Markdown-Datei in
[`praesentation.md`](./praesentation.md). Sie kann in Visual Studio Code mit
der Marp-Erweiterung als Folienansicht oder PDF geöffnet werden.
