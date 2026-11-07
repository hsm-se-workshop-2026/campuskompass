      import { getCampusContext } from "./campus-context.js";

      const menuDataSource = "./mensa-data.json";
      // Zähler verhindern, dass verspätete Antworten einen neueren Stand
      // (z. B. nach einem schnellen Datumswechsel) wieder überschreiben.
      let weatherRequestId = 0;
      let menuRequestId = 0;
      let studyPlanSessions = [];
      let studyPlanLoadError = null;
      let lastRouteOrigin = "";

      const weatherDescriptions = {
        0: ["Klarer Himmel", "☀️"],
        1: ["Überwiegend klar", "🌤️"],
        2: ["Teilweise bewölkt", "⛅"],
        3: ["Bedeckt", "☁️"],
        45: ["Neblig", "🌫️"],
        48: ["Reifnebel", "🌫️"],
        51: ["Leichter Nieselregen", "🌦️"],
        53: ["Nieselregen", "🌦️"],
        55: ["Starker Nieselregen", "🌧️"],
        56: ["Gefrierender Nieselregen", "🌧️"],
        57: ["Starker gefrierender Nieselregen", "🌧️"],
        61: ["Leichter Regen", "🌦️"],
        63: ["Regen", "🌧️"],
        65: ["Starker Regen", "🌧️"],
        66: ["Gefrierender Regen", "🌧️"],
        67: ["Starker gefrierender Regen", "🌧️"],
        71: ["Leichter Schneefall", "🌨️"],
        73: ["Schneefall", "🌨️"],
        75: ["Starker Schneefall", "❄️"],
        77: ["Schneegriesel", "❄️"],
        80: ["Regenschauer", "🌦️"],
        81: ["Regenschauer", "🌧️"],
        82: ["Starke Regenschauer", "🌧️"],
        85: ["Schneeschauer", "🌨️"],
        86: ["Starke Schneeschauer", "❄️"],
        95: ["Gewitter", "⛈️"],
        96: ["Gewitter mit Hagel", "⛈️"],
        99: ["Starkes Gewitter mit Hagel", "⛈️"],
      };

      function updateClock() {
        const now = new Date();
        document.querySelector("#today").textContent = new Intl.DateTimeFormat("de-DE", {
          timeZone: "Europe/Berlin",
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(now);
        document.querySelector("#clock").textContent = new Intl.DateTimeFormat("de-DE", {
          timeZone: "Europe/Berlin",
          hour: "2-digit",
          minute: "2-digit",
        }).format(now) + " Uhr";
      }

      function getSelectedDate() {
        return document.querySelector("#selected-date").value;
      }

      function renderStudyPlan(selectedDate) {
        const list = document.querySelector("#study-events");
        const status = document.querySelector("#study-status");
        list.replaceChildren();
        if (studyPlanLoadError) {
          status.textContent = `Der Studienplan konnte nicht geladen werden: ${studyPlanLoadError}`;
          status.classList.add("error");
          return;
        }

        const dayEvents = studyPlanSessions
          .filter((session) => session.dates.includes(selectedDate))
          .sort((left, right) => left.time.localeCompare(right.time));
        if (!dayEvents.length) {
          status.classList.remove("error");
          status.textContent = "Laut Studienablaufplan ist für dieses Datum keine Vorlesung oder Klausur eingetragen.";
          return;
        }

        status.classList.remove("error");
        status.textContent = `${dayEvents.length} ${dayEvents.length === 1 ? "Termin" : "Termine"} laut Studienablaufplan`;
        for (const session of dayEvents) {
          const item = document.createElement("article");
          item.className = "study-event";
          const time = document.createElement("time");
          time.textContent = `${session.time} Uhr`;
          const details = document.createElement("div");
          const title = document.createElement("strong");
          title.textContent = session.title;
          details.append(title);
          const description = document.createElement("p");
          description.textContent = `${session.type} · ${session.lecturer} · ${session.location}, Raum ${session.room}`;
          details.append(description);
          item.append(time, details);
          list.append(item);
        }
      }

      async function loadStudyPlan() {
        const status = document.querySelector("#study-status");
        try {
          const response = await fetch("./study-plan.json");
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const sessions = await response.json();
          if (!Array.isArray(sessions) || sessions.some((session) =>
            !Array.isArray(session.dates) ||
            session.dates.some((sessionDate) => typeof sessionDate !== "string") ||
            !session.time ||
            !session.title ||
            !session.lecturer ||
            !session.location ||
            !session.room
          )) {
            throw new Error("Die Studienplandaten haben ein ungültiges Format.");
          }
          studyPlanSessions = sessions;
          renderStudyPlan(getSelectedDate());
          updateRouteDestination();
          updateTransitDestination();
        } catch (error) {
          studyPlanLoadError = error.message || "Unbekannter Fehler";
          status.classList.add("error");
          status.textContent = `Der Studienplan konnte nicht geladen werden: ${studyPlanLoadError}`;
          console.error("Studienplan konnte nicht geladen werden:", error);
        }

        // Erst nach dem Studienplan laden, damit der Campus korrekt ermittelt wird.
        await Promise.all([loadMenu(), loadWeather()]);
      }

      function updateMenuDate(selectedDate) {
        const [year, month, day] = selectedDate.split("-").map(Number);
        document.querySelector("#menu-date").textContent = new Intl.DateTimeFormat("de-DE", {
          timeZone: "Europe/Berlin",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(year, month - 1, day, 12));
      }

      function updateStudyPlanDate(selectedDate) {
        const [year, month, day] = selectedDate.split("-").map(Number);
        document.querySelector("#study-plan-date").textContent = new Intl.DateTimeFormat("de-DE", {
          timeZone: "Europe/Berlin",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(year, month - 1, day, 12));
      }

      function updatePlanDate() {
        const selectedDate = getSelectedDate();
        const selectedTime = document.querySelector("#selected-time").value;
        if (!selectedDate || !selectedTime) return;

        const [year, month, day] = selectedDate.split("-");
        const hafasDate = `${day}.${month}.${year}`;
        const hafasTime = selectedTime.replace(":", "");
        const plannerUrl = new URL("https://vmt.hafas.de/index.html");
        plannerUrl.searchParams.set("L", "vs_vmt");
        plannerUrl.searchParams.set("date", hafasDate);
        plannerUrl.searchParams.set("time", hafasTime);
        document.querySelector("#train-planner").src = plannerUrl.toString();

        const plannerLink = new URL("https://www.vmt-thueringen.de/fahrt-planen/fahrplanauskunft/");
        plannerLink.searchParams.set("date", hafasDate);
        plannerLink.searchParams.set("time", hafasTime);
        document.querySelector("#train-planner-link").href = plannerLink.toString();
      }

      function updateTransitDestination() {
        const transit = getCampusContext(studyPlanSessions, getSelectedDate()).transit;
        document.querySelector("#train-destination").textContent = transit.target;
        document.querySelector("#train-planner").title =
          `VMT Fahrplanauskunft zu ${transit.target}`;
      }

      async function loadWeather() {
        const status = document.querySelector("#weather-updated");
        const refresh = document.querySelector("#weather-refresh");
        const requestId = ++weatherRequestId;
        const selectedDate = getSelectedDate();
        const selectedTime = document.querySelector("#selected-time").value;
        if (!selectedDate) return;
        const campusContext = getCampusContext(studyPlanSessions, selectedDate);
        updateWebcam(campusContext.webcam);
        if (!selectedTime) return;
        const weatherLocation = campusContext.weather;

        refresh.disabled = true;
        status.classList.remove("error");
        status.textContent = "Quelle: Open-Meteo · Wetterdaten werden geladen";
        document.querySelector("#weather-location").textContent = `📍 ${campusContext.name}`;
        document.querySelector("#weather-period").textContent =
          `${campusContext.name} · ${new Intl.DateTimeFormat("de-DE", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Europe/Berlin",
          }).format(new Date(`${selectedDate}T12:00:00`))} um ${selectedTime} Uhr`;

        const selectedDay = new Date(`${selectedDate}T00:00:00Z`);
        const todayString = new Intl.DateTimeFormat("sv-SE", {
          timeZone: "Europe/Berlin",
        }).format(new Date());
        const today = new Date(`${todayString}T00:00:00Z`);
        const isHistorical = selectedDay < today;
        const daysAhead = Math.floor((selectedDay - today) / 86400000);
        const endpoint = isHistorical
          ? "https://archive-api.open-meteo.com/v1/archive"
          : "https://api.open-meteo.com/v1/forecast";
        const params = new URLSearchParams({
          latitude: weatherLocation.latitude,
          longitude: weatherLocation.longitude,
          hourly: "temperature_2m,apparent_temperature,weather_code,wind_speed_10m",
          daily: isHistorical
            ? "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum"
            : "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
          start_date: selectedDate,
          end_date: selectedDate,
          timezone: "Europe/Berlin",
        });

        try {
          if (!isHistorical && daysAhead > 15) {
            throw new Error("Die Wettervorhersage ist nur bis zu 16 Tage im Voraus verfügbar.");
          }

          const response = await fetch(`${endpoint}?${params}`);
          if (!response.ok) throw new Error(`Wetterdienst antwortet mit HTTP ${response.status}`);
          const data = await response.json();
          if (!data.hourly?.time?.length || !data.daily?.time?.length) {
            throw new Error("Für diesen Tag sind keine Wetterdaten verfügbar.");
          }

          const selectedHour = `${selectedDate}T${selectedTime.slice(0, 2)}:00`;
          const hourlyIndex = data.hourly.time.indexOf(selectedHour);
          if (hourlyIndex < 0 || data.hourly.temperature_2m[hourlyIndex] == null) {
            throw new Error("Für diese Uhrzeit sind keine Wetterdaten verfügbar.");
          }
          if (
            data.hourly.apparent_temperature?.[hourlyIndex] == null ||
            data.hourly.wind_speed_10m?.[hourlyIndex] == null ||
            data.daily.temperature_2m_min?.[0] == null ||
            data.daily.temperature_2m_max?.[0] == null ||
            (isHistorical
              ? data.daily.precipitation_sum?.[0] == null
              : data.daily.precipitation_probability_max?.[0] == null)
          ) {
            throw new Error("Die Wetterdaten sind für diesen Zeitraum unvollständig.");
          }
          if (requestId !== weatherRequestId) return;

          const weatherCode = data.hourly.weather_code[hourlyIndex] ?? data.daily.weather_code[0];
          const weather = weatherDescriptions[weatherCode] ?? ["Wetterlage nicht verfügbar", "🌡️"];
          document.querySelector("#temperature").textContent = Math.round(data.hourly.temperature_2m[hourlyIndex]);
          document.querySelector("#weather-description").textContent = weather[0];
          document.querySelector("#weather-icon").textContent = weather[1];
          document.querySelector("#feels-like").textContent =
            `${Math.round(data.hourly.apparent_temperature[hourlyIndex])} °C`;
          document.querySelector("#temperature-range").textContent =
            `${Math.round(data.daily.temperature_2m_min[0])}° / ${Math.round(data.daily.temperature_2m_max[0])}°`;
          document.querySelector("#rain-label").textContent = isHistorical ? "Niederschlag" : "Regenrisiko";
          document.querySelector("#rain-chance").textContent = isHistorical
            ? `${data.daily.precipitation_sum[0]} mm`
            : `${data.daily.precipitation_probability_max[0]} %`;
          document.querySelector("#temperature-range-label").textContent = "Tagesbereich";
          document.querySelector("#wind-speed").textContent =
            `${Math.round(data.hourly.wind_speed_10m[hourlyIndex])} km/h`;
          if (requestId !== weatherRequestId) return;
          status.textContent = `Quelle: Open-Meteo · ${isHistorical ? "Messwerte" : "Vorhersage"} für ${selectedTime.slice(0, 2)}:00 Uhr`;
        } catch (error) {
          if (requestId !== weatherRequestId) return;
          document.querySelector("#weather-description").textContent = "Wetterdaten gerade nicht erreichbar";
          status.textContent = error.message || "Wetter konnte nicht geladen werden. Bitte prüfe deine Internetverbindung.";
          status.classList.add("error");
          console.error("Wetter konnte nicht geladen werden:", error);
        } finally {
          if (requestId === weatherRequestId) refresh.disabled = false;
        }
      }

      function formatDate(date) {
        return new Intl.DateTimeFormat("de-DE").format(new Date(`${date}T12:00:00`));
      }

      function formatMenuUpdate(updatedAt) {
        if (!updatedAt) return "";
        const timestamp = new Intl.DateTimeFormat("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Berlin",
        }).format(new Date(updatedAt));
        return ` · Datenstand ${timestamp} Uhr`;
      }

      async function loadMenu() {
        const status = document.querySelector("#menu-status");
        const list = document.querySelector("#meal-list");
        const refresh = document.querySelector("#menu-refresh");
        const requestId = ++menuRequestId;
        const selectedDate = getSelectedDate();
        const mensa = getCampusContext(studyPlanSessions, selectedDate).mensa;
        const sourceLink = document.querySelector("#menu-source");
        updateMenuDate(selectedDate);
        document.querySelector("#menu-title").textContent = mensa.name;
        sourceLink.href = mensa.sourceUrl;
        status.classList.remove("error");
        status.textContent = `${mensa.name} · Speiseplan wird geladen …`;
        refresh.disabled = true;
        list.replaceChildren(Object.assign(document.createElement("p"), {
          className: "loading",
          textContent: "Gerichte werden geladen …",
        }));

        try {
          const response = await fetch(menuDataSource, { cache: "no-store" });
          if (requestId !== menuRequestId) return;
          if (!response.ok) throw new Error(`Speiseplandaten antworten mit HTTP ${response.status}`);

          const menuData = await response.json();
          if (requestId !== menuRequestId) return;
          if (!menuData || typeof menuData.menus !== "object" || !menuData.menus) {
            throw new Error("Die gespeicherten Speiseplandaten haben ein ungültiges Format.");
          }
          const inRange = selectedDate >= menuData.rangeStart && selectedDate <= menuData.rangeEnd;
          if (!inRange) {
            list.replaceChildren(Object.assign(document.createElement("div"), {
              className: "menu-empty",
              textContent: `Automatisch aktualisierte Speisepläne sind für ${formatDate(menuData.rangeStart)} bis ${formatDate(menuData.rangeEnd)} verfügbar.`,
            }));
            status.textContent = `${mensa.name} · Datum außerhalb des aktuellen Zeitraums`;
            return;
          }
          const meals = menuData.menus[mensa.resourceId]?.[selectedDate] ?? [];
          if (!Array.isArray(meals)) {
            throw new Error("Für dieses Datum sind keine gültigen Speiseplandaten vorhanden.");
          }

          if (meals.length === 0) {
            list.replaceChildren(Object.assign(document.createElement("div"), {
              className: "menu-empty",
              textContent: "Für diesen Tag sind in der offiziellen Quelle keine Gerichte eingetragen.",
            }));
            status.textContent = `${mensa.name} · kein Speiseplan für diesen Tag${formatMenuUpdate(menuData.updatedAt)}`;
            return;
          }

          list.replaceChildren();
          for (const meal of meals) {
            if (!meal || typeof meal.name !== "string" || !meal.name.trim()) {
              throw new Error("Ein Gericht enthält keinen gültigen Namen.");
            }
            const article = document.createElement("article");
            article.className = "meal-item";

            const name = document.createElement("h3");
            name.className = "meal-name";
            name.textContent = meal.name;
            article.append(name);

            if (meal.price) {
              const price = document.createElement("p");
              price.className = "meal-price";
              price.textContent = meal.price;
              article.append(price);
            }

            for (const detail of [meal.allergens, meal.additives].filter(Boolean)) {
              const note = document.createElement("p");
              note.className = "meal-details";
              note.textContent = detail;
              article.append(note);
            }

            if (Array.isArray(meal.symbols) && meal.symbols.length) {
              const badges = document.createElement("div");
              badges.className = "meal-badges";
              for (const symbol of meal.symbols) {
                const badge = document.createElement("span");
                badge.className = "meal-badge";
                badge.textContent = symbol;
                badges.append(badge);
              }
              article.append(badges);
            }

            list.append(article);
          }

          status.textContent = `${meals.length} ${meals.length === 1 ? "Gericht" : "Gerichte"} in ${mensa.name}${formatMenuUpdate(menuData.updatedAt)}`;
        } catch (error) {
          if (requestId !== menuRequestId) return;
          const message = document.createElement("div");
          message.className = "menu-empty";
          message.textContent = error.message || "Der Speiseplan konnte nicht geladen werden.";
          list.replaceChildren(message);
          status.textContent = `${mensa.name} · Speiseplan derzeit nicht verfügbar`;
          status.classList.add("error");
          console.error("Speiseplan konnte nicht geladen werden:", error);
        } finally {
          if (requestId === menuRequestId) refresh.disabled = false;
        }

      }

      function mapsDirections(origin) {
        const destination = getCampusContext(studyPlanSessions, getSelectedDate()).route;
        const url = new URL("https://www.google.com/maps/dir/");
        url.searchParams.set("api", "1");
        url.searchParams.set("origin", origin);
        url.searchParams.set("destination", destination.address);
        url.searchParams.set("travelmode", "driving");
        return url;
      }

      function renderEmbeddedRoute(origin) {
        const destination = getCampusContext(studyPlanSessions, getSelectedDate()).route;
        const embeddedDirections = new URL("https://maps.google.com/maps");
        embeddedDirections.searchParams.set("output", "embed");
        if (origin) embeddedDirections.searchParams.set("saddr", origin);
        embeddedDirections.searchParams.set("daddr", destination.address);
        embeddedDirections.searchParams.set("dirflg", "d");
        document.querySelector("#map").src = embeddedDirections.toString();
      }

      function updateRouteDestination() {
        const destination = getCampusContext(studyPlanSessions, getSelectedDate()).route;
        document.querySelector("#route-destination").textContent = destination.label;
        if (lastRouteOrigin) {
          renderEmbeddedRoute(lastRouteOrigin);
          document.querySelector("#route-message").textContent =
            `Route von „${lastRouteOrigin}“ zur ${destination.label}. Für die Navigation in Google Maps öffnen.`;
          return;
        }

        const map = new URL("https://maps.google.com/maps");
        map.searchParams.set("q", destination.address);
        map.searchParams.set("output", "embed");
        document.querySelector("#map").src = map.toString();
      }

      function showRoute(origin) {
        const directions = mapsDirections(origin);
        const destination = getCampusContext(studyPlanSessions, getSelectedDate()).route;
        lastRouteOrigin = origin;
        renderEmbeddedRoute(origin);
        document.querySelector("#route-message").textContent =
          `Route von „${origin}“ zur ${destination.label}. Für die Navigation in Google Maps öffnen.`;
        window.open(directions.toString(), "_blank", "noopener,noreferrer");
      }

      document.querySelector("#route-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const origin = document.querySelector("#origin").value.trim();
        if (!origin) {
          document.querySelector("#route-message").textContent = "Bitte gib einen Startpunkt ein.";
          document.querySelector("#origin").focus();
          return;
        }
        showRoute(origin);
      });

      document.querySelector("#use-location").addEventListener("click", () => {
        const message = document.querySelector("#route-message");
        if (!navigator.geolocation) {
          message.textContent = "Dein Browser unterstützt keine Standortfreigabe. Gib den Startpunkt bitte manuell ein.";
          return;
        }

        message.textContent = "Standortfreigabe wird angefragt …";
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            const origin = `${coords.latitude},${coords.longitude}`;
            document.querySelector("#origin").value = origin;
            showRoute(origin);
          },
          (error) => {
            const reason = error.code === error.PERMISSION_DENIED
              ? "Standortzugriff wurde nicht erlaubt."
              : "Dein Standort konnte nicht ermittelt werden.";
            message.textContent = `${reason} Du kannst deinen Startpunkt auch eingeben.`;
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
        );
      });

      document.querySelector("#weather-refresh").addEventListener("click", loadWeather);
      document.querySelector("#menu-refresh").addEventListener("click", loadMenu);
      const webcamImage = document.querySelector("#webcam-image");
      const webcamStatus = document.querySelector("#webcam-status");
      const webcamSource = document.querySelector("#webcam-source");
      let activeWebcam = getCampusContext(studyPlanSessions, getSelectedDate()).webcam;
      const refreshWebcam = () => {
        const imageUrl = new URL(activeWebcam.imageUrl);
        imageUrl.searchParams.set("refresh", Date.now().toString());
        webcamStatus.textContent = "Webcam-Bild wird aktualisiert …";
        webcamImage.src = imageUrl.toString();
      };
      const updateWebcam = (webcam) => {
        activeWebcam = webcam;
        webcamImage.alt = webcam.alt;
        webcamSource.href = webcam.sourceUrl;
        webcamSource.textContent = webcam.sourceLabel;
        refreshWebcam();
      };
      document.querySelector("#webcam-refresh").addEventListener("click", refreshWebcam);
      webcamImage.addEventListener("load", () => {
        webcamStatus.textContent = `Webcam aus ${activeWebcam.name} geladen · automatische Aktualisierung jede Minute`;
      });
      webcamImage.addEventListener("error", () => {
        webcamStatus.textContent = "Webcam-Bild gerade nicht erreichbar";
      });
      window.setInterval(refreshWebcam, 60000);

      const selectedDateInput = document.querySelector("#selected-date");
      const selectedTimeInput = document.querySelector("#selected-time");
      const selectedDateTimeFormatter = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Europe/Berlin",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      });
      const updateSelectionToNow = () => {
        const parts = Object.fromEntries(
          selectedDateTimeFormatter.formatToParts(new Date())
            .map(({ type, value }) => [type, value]),
        );
        selectedDateInput.value = `${parts.year}-${parts.month}-${parts.day}`;
        selectedTimeInput.value = `${parts.hour}:${parts.minute}`;
        lastPlannedDate = selectedDateInput.value;
        updateMenuDate(selectedDateInput.value);
        updateStudyPlanDate(selectedDateInput.value);
        updatePlanDate();
        renderStudyPlan(selectedDateInput.value);
        updateRouteDestination();
        updateTransitDestination();
        loadMenu();
        loadWeather();
      };
      const now = new Date();
      selectedDateInput.value = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Europe/Berlin",
      }).format(now);
      selectedTimeInput.value = new Intl.DateTimeFormat("de-DE", {
        timeZone: "Europe/Berlin",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(now);
      updateMenuDate(selectedDateInput.value);
      updateStudyPlanDate(selectedDateInput.value);
      let lastPlannedDate = selectedDateInput.value;
      const handleDateChange = () => {
        const selectedDate = selectedDateInput.value;
        if (!selectedDate || selectedDate === lastPlannedDate) return;
        lastPlannedDate = selectedDate;
        updateMenuDate(selectedDate);
        updateStudyPlanDate(selectedDate);
        updatePlanDate();
        updateRouteDestination();
        updateTransitDestination();
        loadMenu();
        loadWeather();
        renderStudyPlan(selectedDate);
      };
      selectedDateInput.addEventListener("input", handleDateChange);
      selectedDateInput.addEventListener("change", handleDateChange);
      selectedTimeInput.addEventListener("change", () => {
        updatePlanDate();
        loadWeather();
      });
      document.querySelector("#reset-to-now").addEventListener("click", updateSelectionToNow);
      updateClock();
      updatePlanDate();
      updateTransitDestination();
      loadStudyPlan();
      window.setInterval(updateClock, 30000);
