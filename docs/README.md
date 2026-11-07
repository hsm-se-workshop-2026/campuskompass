# Projektdokumentation

Das Projekt besteht aus dem lokalen Webdashboard **CampusKompass** für
Studierende. Es bündelt Studienplan, Mensaplan, Wetterinformationen sowie
Anreise- und Campusinformationen in einer browserbasierten Oberfläche.

## CampusKompass

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

Die Speisepläne stammen vom Studierendenwerk Thüringen und werden regelmäßig
über GitHub Actions abgerufen. Je nach Studienort werden Mensa Blechhammer in
Schmalkalden oder Mensa Weg der Freundschaft in Gera angezeigt. Die Website
bleibt statisch und benötigt zur Anzeige keinen Backend-Server.
Die Datumsauswahl im Dashboard lädt den Speiseplan für den gewählten Tag und
übernimmt Datum und Abfahrtszeit in das VMT-Fahrplan-Widget. Das Ziel wird
passend zum Studienort gesetzt; in Schmalkalden ist es „Schmalkalden,
Fachhochschule“, bei Gera-Terminen „Gera, Weg der Freundschaft“.
Die Google-Maps-Route im Abschnitt „Dein Weg zum Campus“ richtet ihr Ziel nach
dem Studienplan: Bei Gera-Terminen führt sie zur DHGE Gera, sonst zur
Hochschule Schmalkalden. Mit „Jetzt“ stellst du Datum und Uhrzeit auf die
aktuelle Zeit in Deutschland zurück und aktualisierst die Tagesansichten.

1. Öffne ein Terminal im Projektordner `campuskompass`.
2. Starte den lokalen Vorschau-Server:

   ```powershell
   python .\server.py
   ```

3. Öffne im Browser <http://127.0.0.1:8000/>.
4. Zum Beenden im Terminal `Ctrl+C` drücken.

Falls Port 8000 bereits belegt ist, kann der Server beispielsweise mit
`$env:PORT = "8001"` gestartet werden; dann
<http://127.0.0.1:8001/> öffnen.

### Veröffentlichung mit GitHub Pages

1. Merge den Branch mit diesen Änderungen in den Standard-Branch `main`.
2. Öffne im Repository **Settings → Pages** und setze **Build and deployment
   → Source** auf **GitHub Actions**.
3. Lege unter **Settings → Secrets and variables → Actions → New repository
   secret** den Namen `TANKERKOENIG_API_KEY` mit einem neu erzeugten
   Tankerkönig-API-Schlüssel an.
4. Öffne den Tab **Actions** und starte **Refresh menus and publish GitHub
   Pages** einmal über **Run workflow**.
5. Öffne die von GitHub Pages angezeigte Website-URL.

Danach veröffentlicht der Workflow die Seite bei Änderungen an `main`, auf
manuelle Anforderung und automatisch alle 15 Minuten für Tankstellenpreise.
Die beiden Tankerkönig-Anfragen je Lauf liegen mindestens eine Minute
auseinander. Mensapläne werden weiterhin alle sechs Stunden abgerufen.
GitHub-Actions-Läufe können sich verzögern; Preise sind daher keine
Echtzeitgarantie.

Bei lokaler Vorschau kannst du den Mensa-Snapshot manuell aktualisieren:

```powershell
python .\scripts\update_mensa_data.py
```

Den Tankstellen-Snapshot kann das Skript lokal aktualisieren, wenn die
Umgebungsvariable `TANKERKOENIG_API_KEY` gesetzt ist:

```powershell
$env:TANKERKOENIG_API_KEY = "<dein API-Schlüssel>"
python .\scripts\update_fuel_stations.py
```

Den Schlüssel nicht in Dateien, Git oder Screenshots speichern.

Wetterdaten werden weiterhin direkt vom Browser bei Open-Meteo abgerufen.
Mensa- und Tankstellendaten werden als statische Dateien von GitHub Pages
ausgeliefert. Der API-Schlüssel bleibt als GitHub Actions Secret verborgen;
er landet weder im Quellcode noch in den veröffentlichten JSON-Dateien.

### Studienablaufplan

Die Webcam Grasberg in Schmalkalden wird als kompaktes Livebild angezeigt und
jede Minute direkt von Antenne Schmalkalden neu geladen. Im Studienplan kann
der Kalender außerdem als `.ics`-Datei heruntergeladen werden.

Der Abschnitt „Dein Studienplan für den Tag“ filtert die aus der PDF
„Studienablaufplanung_ELT2526_050926.pdf“ übernommenen Vorlesungs- und
Klausurtermine anhand der zentralen Datumsauswahl. Angezeigt werden Uhrzeit,
Veranstaltung, Lehrende/r, Ort und Raum. Die PDF liegt ebenfalls im
Projektordner und kann über „PDF öffnen“ eingesehen werden.

Die angezeigte Mensa richtet sich nach dem Studienort des gewählten Datums.
Für Veranstaltungen in Gera wird „Mensa Weg der Freundschaft“ (Studierendenwerk-
Ressourcen-ID 67), für Schmalkalden „Mensa Blechhammer“ (Ressourcen-ID 73)
geladen.
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
- `campuskompass/mensa-data.json` enthält einen Speiseplan-Snapshot; GitHub Actions erzeugt ihn vor jeder Veröffentlichung neu.
- `campuskompass/fuel-stations.json` enthält einen Tankstellen-Snapshot ohne API-Schlüssel.
- `campuskompass/scripts/update_mensa_data.py` liest die Mensapläne vom Studierendenwerk aus.
- `campuskompass/scripts/update_fuel_stations.py` liest Tankerkönig-Daten mit einem GitHub Actions Secret aus.
- `campuskompass/.github/workflows/pages.yml` aktualisiert die Daten und veröffentlicht die Website.
- `campuskompass/study-plan.json` enthält die strukturierten Termine.
- `campuskompass/server.py` startet den lokalen Webserver.
- `campuskompass/assets/` enthält die Logos.

### Ablauf einer Datumsänderung

1. Die Nutzerin oder der Nutzer wählt ein Datum.
2. Das JavaScript sucht passende Termine in `study-plan.json`.
3. Aus dem Studienort werden Mensa, Wetterstandort, Tankstellenliste und
   Routenziel bestimmt.
4. Mensa- und Tankstellendaten werden aus ihren JSON-Snapshots geladen.
5. Wetterdaten werden von Open-Meteo geladen.
6. Die Route wird als Google-Maps-Wegbeschreibung angezeigt.

Der Python-Server dient nur der lokalen Vorschau. GitHub Pages stellt den
statischen Inhalt bereit. GitHub Actions aktualisiert vor der Veröffentlichung
den Mensa-Snapshot über den offiziellen Studierendenwerk-Endpunkt und ruft
Tankstellenpreise über das GitHub-Secret ab.

### Fehlerbehandlung und parallele Anfragen

Das Frontend validiert die Struktur von `study-plan.json`, bevor Termine
verwendet werden. Fehlende Studienplandaten, nicht erreichbare externe Dienste
und unvollständige Wetterantworten werden direkt in der jeweiligen Dashboard-Karte
angezeigt und zusätzlich in der Browser-Konsole protokolliert.

Bei Wetter-, Mensa- und Tankstellen-Anfragen wird eine laufende Anfrage über eine
fortlaufende ID markiert. Antwortet eine ältere Anfrage erst nach einem
Datumswechsel, wird sie verworfen. Dadurch bleiben die angezeigten Daten
immer an die zuletzt ausgewählte Kombination aus Datum, Uhrzeit und Campus
gebunden.

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

### Mensa-Daten

Das Skript `scripts/update_mensa_data.py` ruft den Speiseplan-Endpunkt des
Studierendenwerks mit den Ressourcen-IDs 73 (Blechhammer) und 67 (Weg der
Freundschaft) für jeden Tag des 14-Tage-Zeitraums ab. Es extrahiert Gerichte,
Preise, Allergene, Zusatzstoffe und Kennzeichnungen aus der HTML-Antwort und
schreibt sie nach `mensa-data.json`. Der GitHub-Actions-Workflow bricht bei
Abruffehlern ab, statt eine unvollständige Aktualisierung zu veröffentlichen.

### Tankstellen-Daten

Das Skript `scripts/update_fuel_stations.py` sucht im 10-km-Umkreis der
Hochschule Schmalkalden und der DHGE Gera nach jeweils fünf nahegelegenen
Tankstellen. Es speichert Super E5, Super E10, Diesel, Öffnungsstatus und
Entfernung in `fuel-stations.json`. Die Anfragen sind mindestens 61 Sekunden
voneinander getrennt, entsprechend dem Tankerkönig-Limit von einer Anfrage
pro Minute. Das Repository-Secret `TANKERKOENIG_API_KEY` wird nur vom
GitHub-Workflow verwendet und weder protokolliert noch veröffentlicht.

### Prüfung nach Änderungen

Die wichtigsten Dateien können ohne zusätzliche Abhängigkeiten geprüft werden:

```powershell
python -m py_compile .\server.py
python -m py_compile .\scripts\update_mensa_data.py
python -m py_compile .\scripts\update_fuel_stations.py
node --check .\js\app.js
node --check .\js\campus-context.js
Get-Content .\study-plan.json | ConvertFrom-Json | Out-Null
Get-Content .\mensa-data.json | ConvertFrom-Json | Out-Null
Get-Content .\fuel-stations.json | ConvertFrom-Json | Out-Null
```

`node --check` prüft ausschließlich die JavaScript-Syntax. Die Speisepläne
hängen von der Verfügbarkeit und Struktur der offiziellen Website ab;
GitHub-Actions-Läufe können sich verzögern.

## Verzeichnisübersicht

```text
assets/              Logos der beteiligten Hochschulen
docs/                Projektdokumentation und PlantUML
modellierung/        UML-Entwürfe
requirements/        Anforderungen und User Stories
css/, js/            Oberfläche und Campuslogik
server.py            lokaler Vorschau-Webserver
index.html           Dashboard-Oberfläche
```

## Diagramm

Das vereinfachte Architekturdiagramm liegt in
[`komponenten.puml`](./komponenten.puml). Es kann mit PlantUML oder einer
PlantUML-Erweiterung für Visual Studio Code in eine Grafik umgewandelt werden.

Die detaillierten Modelle liegen im Ordner
[`modellierung`](../modellierung/):

- [`klassendiagramm_backend.puml`](../modellierung/klassendiagramm_backend.puml)
  beschreibt den optionalen lokalen Vorschau-Server.
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

Die Präsentation behandelt verbindlich die fünf Themen **Ziel und Funktionen**,
**User Stories und Use Cases**, **MoSCoW-Analyse**, **Architektur** sowie
**Bedienung und Weboberfläche**. Das zugehörige Testkonzept steht in
[`testkonzept.md`](./testkonzept.md).
