# CampusKompass starten

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
dem Studienplan: Bei Gera-Terminen führt sie zur DHGE Gera, sonst zur Hochschule
Schmalkalden. Mit „Jetzt“ stellst du Datum und Uhrzeit auf die aktuelle Zeit in
Deutschland zurück und aktualisierst die Tagesansichten.

1. Öffne ein Terminal im Ordner `Dashboard`.
2. Starte den Dashboard-Server:

   ```bash
   python3 server.py
   ```

3. Öffne im Browser <http://127.0.0.1:8000/>.
4. Zum Beenden im Terminal `Ctrl+C` drücken.

Nicht `python3 -m http.server` verwenden: Der eingebaute statische Server stellt
den benötigten `/api/mensa`-Endpunkt nicht bereit.
Falls Port 8000 bereits belegt ist, kann der Server beispielsweise mit
`PORT=8001 python3 server.py` gestartet werden; dann `http://127.0.0.1:8001/`
öffnen.

## Studienablaufplan

Der Abschnitt „Dein Studienplan für den Tag“ filtert die aus der PDF
„Studienablaufplanung_ELT2526_050926.pdf“ übernommenen Vorlesungs- und
Klausurtermine anhand der zentralen Datumsauswahl. Angezeigt werden Uhrzeit,
Veranstaltung, Lehrende/r, Ort und Raum. Die PDF liegt ebenfalls im
Dashboard-Ordner und kann über „PDF öffnen“ eingesehen werden.

Der Mensaplan passt den Standort an die Vorlesung im Studienplan an. Für
Veranstaltungen in Gera wird „Mensa Weg der Freundschaft“ (Studierendenwerk-ID
67) geladen; für Schmalkalden wird „Mensa Blechhammer“ (ID 73) verwendet.
Auch die Wetterabfrage nutzt für Gera-Termine Gera als Standort, ansonsten
Schmalkalden. Open-Meteo stellt Vorhersagen nur bis zu 16 Tage im Voraus bereit;
für den 10.–13. Dezember 2026 wird der Gera-Standort verwendet, sobald die
Vorhersage für diese Tage verfügbar ist.

Die strukturierten Daten liegen in `study-plan.json`. Der Plan umfasst die im
PDF aufgeführten Termine für den Studienstart Wintersemester 2025/2026 bis
August 2027; für andere Tage wird kein Termin ausgewiesen. Änderungen am
offiziellen Plan müssen in dieser JSON-Datei nachgetragen werden.
