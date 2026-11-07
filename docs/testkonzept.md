# Testkonzept CampusKompass

## Zweck

Dieses Dokument beschreibt die Prüfungen für das lokale CampusKompass-
Dashboard. Es unterscheidet technische Prüfungen ohne externe Dienste,
fachliche manuelle Prüfungen und Abhängigkeiten zu externen APIs.

## Technische Prüfungen

| Prüfung | Kommando/Aktion | Erwartetes Ergebnis |
|---|---|---|
| Python-Syntax | `python -m py_compile .\server.py` | Kein Syntaxfehler |
| JavaScript-Syntax | `node --check .\js\app.js` | Kein Syntaxfehler |
| JSON-Struktur | `Get-Content .\study-plan.json \| ConvertFrom-Json` | JSON wird erfolgreich gelesen |
| Statischer Server | `python .\server.py`, Browser öffnen | Dashboard wird geladen |
| Ungültige Mensa-ID | `/api/mensa?resource_id=999` aufrufen | HTTP 400 |
| Ungültiges Datum | `/api/mensa?date=abc&resource_id=73` aufrufen | HTTP 400 |

## Fachliche Prüfungen

1. Ein Datum ohne Termin zeigt den Hinweis „keine Vorlesung oder Klausur“.
2. Ein Gera-Termin setzt Mensa, Wetter, Route und Fahrplanziel auf Gera.
3. Ein Schmalkalden-Termin setzt die entsprechenden Schmalkalden-Daten.
4. Ein schneller Datumswechsel zeigt keine verspäteten alten Mensa- oder
   Wetterdaten an.
5. „Jetzt“ setzt Datum und Uhrzeit auf die Zeitzone Europe/Berlin.
6. Ein leerer Startpunkt verhindert das Öffnen einer Route.
7. Eine verweigerte Standortfreigabe zeigt eine verständliche Meldung.
8. Ein nicht erreichbarer externer Dienst zeigt einen sichtbaren Fehlerstatus.

## Grenzen

Die externen Dienste Studierendenwerk Thüringen, Open-Meteo, Google Maps und
VMT können sich ändern oder vorübergehend nicht erreichbar sein. Deshalb
werden deren Antwortstrukturen im Frontend validiert und Fehler sichtbar
angezeigt. Eine vollständige End-to-End-Prüfung benötigt Netzwerkzugriff und
eine laufende Browserumgebung.

## Erweiterung des Testumfangs

Als nächster technischer Schritt können automatisierte Tests mit `unittest`
für den Server und Browser-Tests mit Playwright ergänzt werden. Die
fachlichen Fälle oben dienen dabei als Akzeptanzkriterien.
