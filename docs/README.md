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

### Startanleitung

Im Kopfbereich werden die Logos der Hochschule Schmalkalden und der Dualen
Hochschule Gera-Eisenach angezeigt. Die offiziellen Bilddateien liegen lokal
im Ordner `assets`.

Der Mensa-Speiseplan wird über einen lokalen Python-Endpunkt geladen, damit
der Browser die Anfrage des Studierendenwerks nicht wegen CORS blockiert.
Python 3 ist bereits ausreichend; zusätzliche Pakete werden nicht benötigt.
Die Datumsauswahl im Dashboard lädt den Speiseplan für den gewählten Tag und
übernimmt Datum und Abfahrtszeit in das VMT-Fahrplan-Widget. Im Widget gibst du
deinen Startort ein und wählst als Ziel „Schmalkalden, Fachhochschule“.
Die Google-Maps-Route im Abschnitt „Dein Weg zum Campus“ richtet ihr Ziel nach
dem Studienplan: Bei Gera-Terminen führt sie zur DHGE Gera, sonst zur
Hochschule Schmalkalden. Mit „Jetzt“ stellst du Datum und Uhrzeit auf die
aktuelle Zeit in Deutschland zurück und aktualisierst die Tagesansichten.

1. Öffne ein Terminal im Projektordner `campuskompass`.
2. Starte den Dashboard-Server:

   ```powershell
   python .\server.py
   ```

3. Öffne im Browser <http://127.0.0.1:8000/>.
4. Zum Beenden im Terminal `Ctrl+C` drücken.

Nicht `python -m http.server` verwenden: Der eingebaute statische Server stellt
den benötigten `/api/mensa`-Endpunkt nicht bereit.
Falls Port 8000 bereits belegt ist, kann der Server beispielsweise mit
`$env:PORT = "8001"` gestartet werden; dann
<http://127.0.0.1:8001/> öffnen.

### Studienablaufplan

Die Webcam Grasberg in Schmalkalden wird als kompaktes Livebild angezeigt und
jede Minute direkt von Antenne Schmalkalden neu geladen. Im Studienplan kann
der Kalender außerdem als `.ics`-Datei heruntergeladen werden.

Der Abschnitt „Dein Studienplan für den Tag“ filtert die aus der PDF
„Studienablaufplanung_ELT2526_050926.pdf“ übernommenen Vorlesungs- und
Klausurtermine anhand der zentralen Datumsauswahl. Angezeigt werden Uhrzeit,
Veranstaltung, Lehrende/r, Ort und Raum. Die PDF liegt ebenfalls im
Projektordner und kann über „PDF öffnen“ eingesehen werden.

Der Mensaplan passt den Standort an die Vorlesung im Studienplan an. Für
Veranstaltungen in Gera wird „Mensa Weg der Freundschaft“ (Studierendenwerk-ID
67) geladen; für Schmalkalden wird „Mensa Blechhammer“ (ID 73) verwendet.
Auch die Wetterabfrage nutzt für Gera-Termine Gera als Standort, ansonsten
Schmalkalden. Open-Meteo stellt Vorhersagen nur bis zu 16 Tage im Voraus
bereit; für den 10.–13. Dezember 2026 wird der Gera-Standort verwendet,
sobald die Vorhersage für diese Tage verfügbar ist.

Die strukturierten Daten liegen in `study-plan.json`. Der Plan umfasst die im
PDF aufgeführten Termine für den Studienstart Wintersemester 2025/2026 bis
August 2027; für andere Tage wird kein Termin ausgewiesen. Änderungen am
offiziellen Plan müssen in dieser JSON-Datei nachgetragen werden.

### Aufbau

- `campuskompass/index.html` enthält die HTML-Struktur der Oberfläche.
- `campuskompass/css/style.css` enthält das zentrale Layout und die responsiven Styles.
- `campuskompass/js/app.js` steuert die Benutzerinteraktionen und Datenabfragen.
- `campuskompass/js/campus-context.js` bündelt Campus-, Mensa-, Wetter- und Routenzuordnungen.
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

Die detaillierten Modelle liegen im Ordner
[`modellierung`](../modellierung/):

- [`klassendiagramm_backend.puml`](../modellierung/klassendiagramm_backend.puml)
  beschreibt `DashboardHandler` und den HTTP-Server.
- [`klassendiagramm_frontend.puml`](../modellierung/klassendiagramm_frontend.puml)
  beschreibt die JavaScript-Zuständigkeiten und die verwendeten Datenobjekte.
- [`paketdiagramm.puml`](../modellierung/paketdiagramm.puml) zeigt die
  Paketstruktur und die externen Dienste.

## User Stories und Präsentation

Die User Stories mit MoSCoW-Priorisierung, Akzeptanzkriterien und
Use-Case-Zuordnung stehen in
[`requirements/userstories-moscow.md`](../requirements/userstories-moscow.md).
Die fachlichen Abläufe sind in
[`requirements/usecases.md`](../requirements/usecases.md) beschrieben.

Die Präsentation liegt als Marp-kompatible Markdown-Datei in
[`praesentation.md`](./praesentation.md). Sie kann in Visual Studio Code mit
der Marp-Erweiterung als Folienansicht oder PDF geöffnet werden.
