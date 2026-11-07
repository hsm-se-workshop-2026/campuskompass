// Zentrale Zuordnung der Termine zu Campus, Mensa, Wetter, Webcam und Routenziel.
const campus = {
  latitude: 50.72,
  longitude: 10.45,
  address: "Hochschule Schmalkalden, Blechhammer, 98574 Schmalkalden",
};

const campuses = {
  Schmalkalden: {
    name: "Schmalkalden",
    route: {
      label: "Hochschule Schmalkalden",
      address: campus.address,
    },
    weather: {
      latitude: campus.latitude,
      longitude: campus.longitude,
    },
    fuelStations: {
      latitude: campus.latitude,
      longitude: campus.longitude,
    },
    webcam: {
      name: "Schmalkalden",
      imageUrl: "https://webcam.antenne-schmalkalden.de/Grasberg.jpg",
      alt: "Aktuelles Webcam-Bild vom Grasberg in Schmalkalden",
      sourceUrl: "https://webcam.antenne-schmalkalden.de/Grasberg.jpg",
      sourceLabel: "Grasberg · Quelle ↗",
    },
    mensa: {
      resourceId: "73",
      name: "Mensa Blechhammer",
      sourceUrl: "https://www.stw-thueringen.de/mensen/schmalkalden/mensa-blechhammer.html",
    },
    transit: {
      target: "Schmalkalden, Fachhochschule",
    },
  },
  Gera: {
    name: "Gera",
    route: {
      label: "DHGE Gera",
      address: "Duale Hochschule Gera-Eisenach, Weg der Freundschaft 4, 07546 Gera",
    },
    weather: {
      latitude: 50.8775,
      longitude: 12.0823,
    },
    fuelStations: {
      latitude: 50.9036892,
      longitude: 12.0703215,
    },
    webcam: {
      name: "Gera",
      imageUrl: "https://webcam-gera.de/cam.php",
      alt: "Aktuelles Webcam-Bild aus Gera",
      sourceUrl: "https://webcam-gera.de/",
      sourceLabel: "Gera · Quelle ↗",
    },
    mensa: {
      resourceId: "67",
      name: "Mensa Weg der Freundschaft",
      sourceUrl: "https://www.stw-thueringen.de/mensen/gera/mensa-weg-der-freundschaft.html",
    },
    transit: {
      target: "Gera, Weg der Freundschaft",
    },
  },
};

export function getCampusContext(studyPlanSessions, selectedDate) {
  // Für Tage ohne Eintrag bleibt Schmalkalden der sichere Standard-Campus.
  const location = studyPlanSessions.find((session) => session.dates.includes(selectedDate))?.location;
  return campuses[location] ?? campuses.Schmalkalden;
}
