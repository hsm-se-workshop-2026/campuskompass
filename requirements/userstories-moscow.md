# User Stories und MoSCoW-Priorisierung

Die Priorisierung verwendet die MoSCoW-Methode:

- **Must have**: unverzichtbar für den Kernnutzen bzw. das MVP.
- **Should have**: wichtig, aber notfalls nach dem MVP umsetzbar.
- **Could have**: sinnvoller Zusatz ohne hohe Dringlichkeit.
- **Won't have (in dieser Version)**: bewusst nicht Bestandteil der aktuellen
  Version.

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
| CampusKompass-Studienplan | umgesetzt |
| CampusKompass-Mensa-Proxy | umgesetzt in `campuskompass/server.py` |
| CampusKompass-Wetter und Route | umgesetzt im JavaScript des Dashboards |
| CampusKompass-Fahrplan | umgesetzt als VMT-Widget und externer Link |
| CampusKompass-Use-Cases | dokumentiert in `requirements/usecases.md` |

## Rückverfolgbarkeit

Die Use-Case-IDs verbinden Anforderungen und Umsetzung. Die vollständigen
Abläufe, Alternativfälle und beteiligten externen Dienste stehen in
[`usecases.md`](./usecases.md).
