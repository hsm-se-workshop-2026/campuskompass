# Use Cases

Die Use Cases beschreiben die fachlichen Abläufe des CampusKompass-Dashboards
und ordnen die User Stories den beteiligten Akteuren zu.

## Akteure

- **Student/in**: wählt Datum und Uhrzeit, liest Informationen und startet
  Routen- oder Fahrplanabfragen.
- **Browser**: führt das JavaScript aus und rendert die Oberfläche.
- **CampusKompass-Server**: liefert Dateien aus und vermittelt den
  Mensa-Aufruf.
- **Externe Dienste**: Studierendenwerk Thüringen, Open-Meteo, Google Maps und
  VMT.

## UC-01 – Dashboard öffnen

**Ziel:** Die Startseite des CampusKompass wird angezeigt.

**Akteure:** Student/in, Browser, CampusKompass-Server  
**Vorbedingung:** Der Server läuft lokal.  
**Nachbedingung:** HTML, Logos und JavaScript sind geladen.

1. Der Student öffnet die lokale Dashboard-Adresse.
2. Der Browser fordert `index.html` und die zugehörigen Assets an.
3. Der Server liefert die statischen Dateien aus.
4. Das Frontend setzt Datum und Uhrzeit und startet das Laden des Studienplans.

**Alternativen:** Ist der Server nicht erreichbar, kann das Dashboard nicht
geladen werden.

## UC-02 – Studienplan für ein Datum anzeigen

**Ziel:** Termine des gewählten Tages werden angezeigt.

**Akteure:** Student/in, Browser  
**Vorbedingung:** Das Dashboard ist geöffnet.

1. Der Student wählt ein Datum.
2. Das Frontend filtert `study-plan.json` nach diesem Datum.
3. Die Termine werden nach Uhrzeit sortiert.
4. Uhrzeit, Veranstaltung, Lehrkraft, Ort und Raum werden angezeigt.
5. Aus dem Studienort werden Mensa, Wetterstandort und Routenziel abgeleitet.

**Alternativen:** Für ein Datum ohne Termine wird ein entsprechender Hinweis
angezeigt. Bei ungültigen oder nicht ladbaren JSON-Daten erscheint eine
Fehlermeldung.

**User Story:** CAMPUS-01

## UC-03 – Mensaplan laden

**Ziel:** Der Speiseplan der zum Studienort passenden Mensa wird angezeigt.

**Akteure:** Student/in, Browser, CampusKompass-Server,
Studierendenwerk Thüringen  
**Vorbedingung:** Ein Datum ist ausgewählt.

1. Das Frontend ermittelt die Mensa und ihre Ressourcen-ID.
2. Der Browser fragt `/api/mensa?date=...&resource_id=...` beim Server an.
3. Der Server validiert Datum und Ressourcen-ID.
4. Der Server ruft den Speiseplan beim Studierendenwerk ab.
5. Das Frontend liest Gerichte, Preise, Allergene und Zusatzstoffe aus der
   Antwort und rendert sie.

**Alternativen:** Bei ungültigen Parametern wird HTTP 400, bei einem Fehler des
externen Dienstes HTTP 502 angezeigt.

**User Story:** CAMPUS-02

## UC-04 – Wetterdaten anzeigen

**Ziel:** Wetterdaten für den passenden Campus werden angezeigt.

**Akteure:** Student/in, Browser, Open-Meteo  
**Vorbedingung:** Datum und Uhrzeit sind ausgewählt.

1. Das Frontend bestimmt den Studienort und die zugehörige Wetterposition.
2. Es fragt Open-Meteo nach den passenden Stunden- oder Tagesdaten.
3. Temperatur, Wetterbeschreibung, Niederschlag und Wind werden angezeigt.

**Alternativen:** Bei einem Netzwerk- oder API-Fehler zeigt die Oberfläche eine
Fehlermeldung an.

**User Story:** CAMPUS-03

## UC-05 – Route zum Campus planen

**Ziel:** Eine Route vom Startort zum passenden Campus wird geöffnet.

**Akteure:** Student/in, Browser, Google Maps  
**Vorbedingung:** Ein Startort wurde eingegeben.

1. Der Student gibt einen Startort ein.
2. Das Frontend ermittelt das Ziel anhand des gewählten Studienorts.
3. Eine eingebettete Karte wird aktualisiert.
4. Zusätzlich wird die Route in Google Maps geöffnet.

**Alternativen:** Bei leerem Startort wird keine Anfrage gesendet und ein
Hinweis angezeigt.

**User Story:** CAMPUS-04

## UC-06 – Fahrplan für Datum und Uhrzeit öffnen

**Ziel:** Die Anreise mit dem öffentlichen Nahverkehr kann geplant werden.

**Akteure:** Student/in, Browser, VMT Fahrplanauskunft  
**Vorbedingung:** Datum und Uhrzeit sind ausgewählt.

1. Das Frontend formatiert Datum und Uhrzeit für VMT.
2. Das Frontend bestimmt das Fahrplanziel passend zum Studienort.
3. Das Fahrplan-Widget und der externe Link werden aktualisiert.
4. Der Student kann die Fahrplanauskunft öffnen.

**User Story:** CAMPUS-05

## UC-07 – Auswahl auf aktuelle Zeit setzen

**Ziel:** Das Dashboard zeigt die Daten für den aktuellen Zeitpunkt.

**Akteure:** Student/in, Browser  
**Vorbedingung:** Das Dashboard ist geöffnet.

1. Der Student aktiviert „Jetzt“.
2. Das Frontend setzt Datum und Uhrzeit auf die aktuelle Zeit in Deutschland.
3. Studienplan, Mensaplan, Wetter, Route und Fahrplan werden aktualisiert.

**User Story:** CAMPUS-06

