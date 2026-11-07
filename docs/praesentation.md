---
marp: true
theme: default
paginate: true
header: "SE-Projekt Team A"
footer: "GPX-Visualizer und CampusKompass"
---

# Softwareprojekt

## GPX-Visualizer und CampusKompass

Vereinfachte Code- und Anforderungspräsentation

---

## Projekt auf einen Blick

- **GPX-Visualizer**: Wanderungen aus GPX-Dateien auswerten
- **CampusKompass**: Studienplan, Mensa, Wetter und Campusroute bündeln
- Zwei unabhängige Anwendungen in einem Repository
- Python für Analyse und Server
- Matplotlib bzw. HTML/CSS/JavaScript für die Darstellung

---

## GPX-Visualizer: Datenfluss

```text
Wanderung.gpx
      |
      v
GpxTrack.from_gpx()
      |
      v
GeoPoint -> Route -> Statistikberechnung
      |
      v
2D-Karte + Höhenprofil + Slider + 3D-Ansicht
```

---

## GPX-Visualizer: wichtige Bausteine

- `GeoPoint`: GPS-Koordinate, Höhe und Zeitstempel
- `Route`: Sammlung der Trackpunkte
- `GpxTrack`: liest die GPX-XML-Datei
- `haversine_m`: berechnet Entfernungen
- `compute_statistics`: berechnet Strecke, Dauer, Höhenmeter und Tempo
- Matplotlib: Diagramme und Interaktion
- Contextily: Kartenhintergrund

---

## GPX-Visualizer: Benutzeroberfläche

- Route mit Start- und Zielmarkierung
- Karten-Overlay in Web Mercator
- Gesamtstatistiken im Kartenbereich
- Höhenprofil über die Entfernung
- Slider verschiebt den aktuellen Positionsmarker
- Umschaltung zwischen 2D- und 3D-Ansicht

---

## CampusKompass: Architektur

```text
Browser
  |
  +--> index.html / JavaScript
  |       +--> study-plan.json
  |       +--> Open-Meteo
  |       +--> Google Maps
  |       +--> /api/mensa
  |
  +--> server.py
          +--> statische Dateien
          +--> Proxy zum Studierendenwerk Thüringen
```

---

## CampusKompass: Ablauf

1. Nutzer wählt ein Datum.
2. Der Studienplan wird nach diesem Datum gefiltert.
3. Der Studienort bestimmt Mensa, Wetterstandort und Routenziel.
4. Mensaplan und Wetter werden geladen.
5. Die Campusroute wird als Wegbeschreibung angezeigt.

Der Proxy in `server.py` verhindert, dass der Browser den Mensa-Endpunkt
direkt wegen CORS ansprechen muss.

---

## MoSCoW-Methode

- **Must have**: unverzichtbar für das MVP
- **Should have**: wichtig, aber verschiebbar
- **Could have**: nützliche Erweiterung
- **Won't have**: in dieser Version bewusst ausgeschlossen

Die vollständige Liste steht in
`docs/userstories-moscow.md`.

---

## Priorisierte GPX-User-Stories

### Must have

- GPX-Datei importieren
- Route in 2D anzeigen
- Strecke, Dauer, Höhenmeter und Geschwindigkeit anzeigen

### Should have

- Höhenprofil anzeigen
- Karten-Overlay anzeigen
- Position über Slider verfolgen

### Could have

- Interaktive 3D-Ansicht

### Won't have (in dieser Version)

- Mehrere GPX-Dateien gleichzeitig vergleichen

---

## Priorisierte CampusKompass-Stories

### Must have

- Studienplan für ein Datum anzeigen

### Should have

- Passenden Mensaplan anzeigen
- Wetter am Campus anzeigen

### Could have

- Route zum Campus planen

---

## Qualitäts- und Umsetzungsstand

- GPX-Import und zentrale Visualisierung sind vorhanden.
- Statistiken werden aktuell direkt in `src/main.py` berechnet.
- Einige Modellmethoden in `src/model/analysis.py` sind noch vorbereitet,
  aber nicht vollständig implementiert.
- CampusKompass wird mit `python .\campuskompass\server.py` gestartet.
- Die Anwendungen benötigen für externe Karten-, Wetter- und Mensadaten eine
  Netzwerkverbindung.

---

## Start der Anwendungen

### GPX-Visualizer

```powershell
python .\src\main.py
```

### CampusKompass

```powershell
cd ".\campuskompass"
python .\server.py
```

Danach: <http://127.0.0.1:8000/>

---

## Fazit

- Das Projekt verbindet Datenmodell, Analyse und Visualisierung.
- Der GPX-Visualizer unterstützt die technische Routenauswertung.
- CampusKompass bündelt studienbezogene Informationen in einer Weboberfläche.
- Die MoSCoW-Priorisierung trennt MVP-Funktionen von Erweiterungen.
- Nächster sinnvoller Ausbau: mehrere GPX-Dateien und vollständige
  Modell-Analysefunktionen.
