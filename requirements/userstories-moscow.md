# User Stories und MoSCoW-Priorisierung

Die Priorisierung verwendet die MoSCoW-Methode:

- **Must have**: unverzichtbar für den Kernnutzen bzw. das MVP.
- **Should have**: wichtig, aber notfalls nach dem MVP umsetzbar.
- **Could have**: sinnvoller Zusatz ohne hohe Dringlichkeit.
- **Won't have (in dieser Version)**: bewusst nicht Bestandteil der aktuellen
  Version.

## GPX-Visualizer

| ID | User Story | Priorität | Begründung | Use Case |
|---|---|---|---|---|
| GPX-01 | Als Nutzer möchte ich eine GPX-Datei importieren, damit ich meine Route auswerten kann. | **Must have** | Ohne GPX-Daten ist keine Analyse möglich. | UC-GPX-01 |
| GPX-02 | Als Nutzer möchte ich meine Route in einer 2D-Ansicht sehen, damit ich den Verlauf nachvollziehen kann. | **Must have** | Die 2D-Ansicht ist die zentrale Ausgabe des Visualizers. | UC-GPX-02 |
| GPX-03 | Als Nutzer möchte ich Strecke, Dauer, Höhenmeter und Geschwindigkeit sehen, damit ich meine Wanderung bewerten kann. | **Must have** | Die Kennzahlen bilden den Kern der Auswertung. | UC-GPX-03 |
| GPX-04 | Als Nutzer möchte ich ein beschriftetes Höhenprofil sehen, damit ich Steigungen und Gefälle erkenne. | **Should have** | Erhöht den Analysewert, ist aber für die reine Routendarstellung nicht zwingend. | UC-GPX-04 |
| GPX-05 | Als Nutzer möchte ich die Route auf einer Hintergrundkarte sehen, damit ich den geografischen Kontext erkenne. | **Should have** | Verbessert die Orientierung, benötigt aber einen externen Kartendienst. | UC-GPX-02 |
| GPX-06 | Als Nutzer möchte ich die Position auf der Route über einen Slider verfolgen, damit ich einzelne Streckenabschnitte analysieren kann. | **Should have** | Unterstützt die Detailanalyse mit Zeit, Höhe und Geschwindigkeit. | UC-GPX-05 |
| GPX-07 | Als Nutzer möchte ich eine 3D-Ansicht öffnen, damit ich die Route räumlich betrachten kann. | **Could have** | Anschauliches Zusatzfeature, aber nicht für das MVP erforderlich. | UC-GPX-06 |
| GPX-08 | Als Nutzer möchte ich mehrere GPX-Dateien gleichzeitig vergleichen, damit ich verschiedene Wanderungen auswerten kann. | **Won't have (in dieser Version)** | Der aktuelle Einstieg lädt eine einzelne Standarddatei. | — |

### Akzeptanzkriterien der wichtigsten Stories

**GPX-01 – Import**

- `assets/Wanderung.gpx` wird ohne manuelle XML-Verarbeitung durch den Nutzer
  eingelesen.
- GPS-Koordinaten werden als `GeoPoint` gespeichert.
- Höhe und Zeitstempel werden übernommen, wenn sie in der Datei vorhanden sind.

**GPX-02 – 2D-Ansicht**

- Die Route wird als Linie dargestellt.
- Start und Ziel sind optisch markiert.
- Die Ansicht enthält eine Kartenhinterlegung, sofern der Kartendienst
  erreichbar ist.

**GPX-03 – Statistiken**

- Die Entfernung wird aus den GPS-Punkten mit der Haversine-Formel berechnet.
- Auf- und Abstieg werden getrennt summiert.
- Dauer und Durchschnittsgeschwindigkeit werden aus den Zeitstempeln
  berechnet.

## CampusKompass

| ID | User Story | Priorität | Begründung | Use Case |
|---|---|---|---|---|
| CAMPUS-01 | Als Student möchte ich den Studienplan für ein Datum sehen, damit ich meine Termine kenne. | **Must have** | Der Studienplan ist die zentrale Information des Dashboards. | UC-02 |
| CAMPUS-02 | Als Student möchte ich den passenden Mensaplan sehen, damit ich mein Essen planen kann. | **Should have** | Wichtige Alltagshilfe, aber nicht Voraussetzung für den Studienplan. | UC-03 |
| CAMPUS-03 | Als Student möchte ich das Wetter am passenden Campus sehen, damit ich mich auf den Tag vorbereiten kann. | **Should have** | Unterstützt die Tagesplanung, ist aber von einem externen Dienst abhängig. | UC-04 |
| CAMPUS-04 | Als Student möchte ich eine Route zu meinem Campus planen, damit ich den Anfahrtsweg finde. | **Could have** | Nützliche Ergänzung, aber für die Anzeige des Studienplans nicht erforderlich. | UC-05 |
| CAMPUS-05 | Als Student möchte ich eine passende Fahrplanauskunft für Datum und Uhrzeit öffnen, damit ich meine Anreise planen kann. | **Could have** | Ergänzt die Campusroute um den öffentlichen Nahverkehr. | UC-06 |
| CAMPUS-06 | Als Student möchte ich Datum und Uhrzeit auf „Jetzt“ setzen, damit ich schnell die aktuellen Tagesdaten sehe. | **Could have** | Komfortfunktion für die tägliche Nutzung. | UC-07 |

## Umsetzungsstand

| Bereich | Stand |
|---|---|
| GPX-Datei einlesen | umgesetzt für eine Standarddatei |
| 2D-Route und Start/Ziel | umgesetzt |
| Karten-Overlay | umgesetzt über Contextily |
| Höhenprofil und Slider | umgesetzt |
| Statistiken | umgesetzt in `src/main.py` |
| 3D-Ansicht | umgesetzt als Umschaltung |
| Mehrere GPX-Dateien | noch nicht umgesetzt |
| CampusKompass-Studienplan | umgesetzt |
| CampusKompass-Mensa-Proxy | umgesetzt in `campuskompass/server.py` |
| CampusKompass-Wetter und Route | umgesetzt im JavaScript des Dashboards |
| CampusKompass-Fahrplan | umgesetzt als VMT-Widget und externer Link |
| CampusKompass-Use-Cases | dokumentiert in `requirements/usecases.md` |

## Rückverfolgbarkeit

Die Use-Case-IDs verbinden Anforderungen und Umsetzung. Die vollständigen
Abläufe, Alternativfälle und beteiligten externen Dienste stehen in
[`usecases.md`](./usecases.md).
