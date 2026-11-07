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
    mensa: {
      resourceId: "73",
      name: "Mensa Blechhammer",
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
    mensa: {
      resourceId: "67",
      name: "Mensa Weg der Freundschaft",
    },
  },
};

export function getCampusContext(studyPlanSessions, selectedDate) {
  const location = studyPlanSessions.find((session) => session.dates.includes(selectedDate))?.location;
  return campuses[location] ?? campuses.Schmalkalden;
}
