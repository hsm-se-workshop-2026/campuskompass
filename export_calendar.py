import hashlib
import json
import re
from datetime import date, datetime, timezone
from pathlib import Path


PROJECT_DIR = Path(__file__).resolve().parent
PLAN_PATH = PROJECT_DIR / "study-plan.json"
CALENDAR_PATH = PROJECT_DIR / "studienablaufplan.ics"
TIME_RANGE = re.compile(r"(\d{2}:\d{2})–(\d{2}:\d{2})")


def escape_text(value):
    return (
        str(value)
        .replace("\\", "\\\\")
        .replace(";", "\\;")
        .replace(",", "\\,")
        .replace("\r\n", "\\n")
        .replace("\n", "\\n")
        .replace("\r", "\\n")
    )


def fold_line(line):
    folded = []
    current = ""
    current_bytes = 0
    for character in line:
        char_bytes = len(character.encode("utf-8"))
        if current_bytes + char_bytes > 75:
            folded.append(current)
            current = " "
            current_bytes = 1
        current += character
        current_bytes += char_bytes
    folded.append(current)
    return "\r\n".join(folded)


def build_calendar(sessions):
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//CampusKompass//Studienablaufplan//DE",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "NAME:Studienablaufplan Elektrotechnik und Management",
        "X-WR-CALNAME:Studienablaufplan Elektrotechnik und Management",
        "BEGIN:VTIMEZONE",
        "TZID:Europe/Berlin",
        "X-LIC-LOCATION:Europe/Berlin",
        "BEGIN:DAYLIGHT",
        "TZOFFSETFROM:+0100",
        "TZOFFSETTO:+0200",
        "TZNAME:CEST",
        "DTSTART:19700329T020000",
        "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
        "END:DAYLIGHT",
        "BEGIN:STANDARD",
        "TZOFFSETFROM:+0200",
        "TZOFFSETTO:+0100",
        "TZNAME:CET",
        "DTSTART:19701025T030000",
        "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
        "END:STANDARD",
        "END:VTIMEZONE",
    ]

    event_number = 0
    for session in sessions:
        match = TIME_RANGE.fullmatch(session["time"])
        if not match:
            raise ValueError(f"Ungültiger Zeitraum: {session['time']}")
        start_time, end_time = match.groups()

        for event_date in session["dates"]:
            parsed_date = date.fromisoformat(event_date)
            event_number += 1
            start = parsed_date.strftime("%Y%m%d") + "T" + start_time.replace(":", "") + "00"
            end = parsed_date.strftime("%Y%m%d") + "T" + end_time.replace(":", "") + "00"
            identity = "\0".join(
                (str(event_number), event_date, session["time"], session["title"], session["location"], session["room"])
            )
            uid = hashlib.sha256(identity.encode("utf-8")).hexdigest()
            description = (
                f"Art: {session['type']}\n"
                f"Dozent/in: {session['lecturer']}\n"
                f"Raum: {session['room']}"
            )
            location = f"{session['location']}, {session['room']}"

            lines.extend(
                [
                    "BEGIN:VEVENT",
                    f"UID:{uid}@campuskompass.local",
                    f"DTSTAMP:{stamp}",
                    f"DTSTART;TZID=Europe/Berlin:{start}",
                    f"DTEND;TZID=Europe/Berlin:{end}",
                    f"SUMMARY:{escape_text(session['title'])}",
                    f"DESCRIPTION:{escape_text(description)}",
                    f"LOCATION:{escape_text(location)}",
                    "STATUS:CONFIRMED",
                    "TRANSP:OPAQUE",
                    "END:VEVENT",
                ]
            )

    lines.append("END:VCALENDAR")
    return "\r\n".join(fold_line(line) for line in lines) + "\r\n"


def main():
    sessions = json.loads(PLAN_PATH.read_text(encoding="utf-8"))
    calendar = build_calendar(sessions)
    CALENDAR_PATH.write_bytes(calendar.encode("utf-8"))
    event_count = sum(len(session["dates"]) for session in sessions)
    print(f"{event_count} Termine exportiert nach {CALENDAR_PATH.name}")


if __name__ == "__main__":
    main()
