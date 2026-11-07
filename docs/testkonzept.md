# Testkonzept CampusKompass

## Zweck

Dieses Dokument beschreibt die Prüfungen für das statische CampusKompass-
Dashboard. Es unterscheidet technische Prüfungen ohne externe Dienste,
fachliche manuelle Prüfungen und Abhängigkeiten zu externen APIs.

## Technische Prüfungen

| Prüfung | Kommando/Aktion | Erwartetes Ergebnis |
|---|---|---|
| Python-Syntax | `python -m py_compile .\server.py .\scripts\update_mensa_data.py .\scripts\update_fuel_stations.py` | Kein Syntaxfehler |
| JavaScript-Syntax | `node --check .\js\app.js` | Kein Syntaxfehler |
| JSON-Struktur | `Get-Content .\study-plan.json \| ConvertFrom-Json` | JSON wird erfolgreich gelesen |
| Mensa-Snapshot | `Get-Content .\mensa-data.json \| ConvertFrom-Json` | Speiseplandaten werden erfolgreich gelesen |
| Tankstellen-Snapshot | `Get-Content .\fuel-stations.json \| ConvertFrom-Json` | Tankstellendaten werden erfolgreich gelesen |
| Statischer Server | `python .\server.py`, Browser öffnen | Dashboard wird geladen |
| Speiseplan-Update | `python .\scripts\update_mensa_data.py` | Snapshot für beide Mensen und 14 Tage wird erzeugt |
| Tankerkönig-Update | GitHub-Actions-Workflow mit `TANKERKOENIG_API_KEY` starten | Je Campus bis zu fünf Stationen mit Preisen werden veröffentlicht |

## Fachliche Prüfungen

1. Ein Datum ohne Termin zeigt den Hinweis „keine Vorlesung oder Klausur“.
2. Ein Gera-Termin setzt Mensa, Wetter, Route und Fahrplanziel auf Gera.
3. Ein Gera-Termin zeigt den aktuellen Webcam-Snapshot von Gera; ein Schmalkalden-Termin zeigt die Webcam vom Grasberg.
4. Ein Schmalkalden-Termin setzt die entsprechenden Schmalkalden-Daten.
5. Ein Schmalkalden-Termin lädt Mensadaten aus dem Snapshot für Ressourcen-ID 73.
6. Ein Gera-Termin lädt Mensadaten aus dem Snapshot für Ressourcen-ID 67.
7. Ein schneller Datumswechsel zeigt keine verspäteten alten Mensa- oder
   Wetterdaten an.
8. Ein Gera-Termin zeigt Tankstellen nahe Gera; Schmalkalden-Termine zeigen
   Tankstellen nahe der Hochschule Schmalkalden.
9. Tankstellenkarten zeigen E5, E10 und Diesel auf drei Nachkommastellen,
   Öffnungsstatus, Entfernung, Kartenlink und Routenknopf.
10. Der Routenknopf zeigt den Weg zur Tankstelle in der eingebetteten Karte,
    ausgehend vom eingegebenen Startpunkt oder ohne Startpunkt vom gewählten
    Campus.
11. „Jetzt“ setzt Datum und Uhrzeit auf die Zeitzone Europe/Berlin.
12. Ein leerer Startpunkt verhindert das Öffnen einer Campusroute.
13. Eine verweigerte Standortfreigabe zeigt eine verständliche Meldung.
14. Ein nicht erreichbarer externer Dienst zeigt einen sichtbaren Fehlerstatus.

## Grenzen

Die externen Dienste Studierendenwerk Thüringen, Open-Meteo, Google Maps, VMT
und Tankerkönig können sich ändern oder vorübergehend nicht erreichbar sein. Deshalb
werden deren Antwortstrukturen im Frontend validiert und Fehler sichtbar
angezeigt. Eine vollständige End-to-End-Prüfung benötigt Netzwerkzugriff und
eine laufende Browserumgebung.

## Erweiterung des Testumfangs

Als nächster technischer Schritt können automatisierte Tests mit `unittest`
für den Server und Browser-Tests mit Playwright ergänzt werden. Die
fachlichen Fälle oben dienen dabei als Akzeptanzkriterien.
