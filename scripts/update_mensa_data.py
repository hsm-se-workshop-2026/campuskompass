"""Fetch current canteen menus from Studierendenwerk Thüringen."""

from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.request import Request, urlopen


PROJECT_DIR = Path(__file__).resolve().parents[1]
OUTPUT_FILE = PROJECT_DIR / "mensa-data.json"
ENDPOINT = "https://www.stw-thueringen.de/xhr/loadspeiseplan.html"
CANTEENS = {
    "73": "Mensa Blechhammer",
    "67": "Mensa Weg der Freundschaft",
}
LOOKAHEAD_DAYS = 14
FIELDS = {"mealText", "mealPreise", "allergene", "zusatzstoffe"}


class MenuParser(HTMLParser):
    """Extract meal names, prices, dietary symbols and details from the menu."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.div_classes = []
        self.div_depth = 0
        self.active_field = None
        self.active_field_depth = None
        self.meal = None
        self.meals = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        classes = set(attributes.get("class", "").split())
        if tag == "div":
            self.div_depth += 1
            self.div_classes.append(classes)
            if "rowMeal" in classes:
                self.meal = {
                    "mealText": "",
                    "mealPreise": "",
                    "allergene": "",
                    "zusatzstoffe": "",
                    "symbols": [],
                }
            if self.meal is not None:
                field = next(iter(FIELDS.intersection(classes)), None)
                if field:
                    self.active_field = field
                    self.active_field_depth = self.div_depth
        elif tag == "img" and self.meal is not None and "splIconMeal" in classes:
            label = attributes.get("alt", "").lower()
            if "vegan" in label:
                self.meal["symbols"].append("Vegan")
            elif "vegetarisch" in label:
                self.meal["symbols"].append("Vegetarisch")

    def handle_endtag(self, tag):
        if tag != "div" or not self.div_classes:
            return
        classes = self.div_classes.pop()
        if self.active_field_depth == self.div_depth:
            self.active_field = None
            self.active_field_depth = None
        if "rowMeal" in classes and self.meal is not None:
            self._finish_meal()
        self.div_depth -= 1

    def handle_data(self, data):
        if self.meal is not None and self.active_field:
            self.meal[self.active_field] += data

    def _finish_meal(self):
        meal = self.meal
        self.meal = None
        meal["name"] = clean_text(meal.pop("mealText"))
        meal["allergens"] = clean_text(meal.pop("allergene"))
        meal["additives"] = clean_text(meal.pop("zusatzstoffe"))
        meal["price"] = format_prices(meal.pop("mealPreise"))
        meal["symbols"] = list(dict.fromkeys(meal["symbols"]))
        if meal["name"]:
            self.meals.append(meal)


def clean_text(value):
    return re.sub(r"\s+", " ", value).strip()


def format_prices(value):
    amounts = re.findall(r"\d+(?:[,.]\d+)?", clean_text(value))
    labels = ("Studierende", "Bedienstete", "Gäste")
    formatted = [
        f"{label}: {amount.replace('.', ',')} €"
        for label, amount in zip(labels, amounts)
    ]
    return " · ".join(formatted)


def fetch_menu(resource_id, date):
    form_data = f"resources_id={resource_id}&date={date.strftime('%d.%m.%Y')}".encode()
    request = Request(
        ENDPOINT,
        data=form_data,
        headers={
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Referer": "https://www.stw-thueringen.de/mensen/",
            "User-Agent": "CampusKompass/1.0 (scheduled menu data refresh)",
            "X-Requested-With": "XMLHttpRequest",
        },
        method="POST",
    )
    with urlopen(request, timeout=30) as response:
        if response.status != 200:
            raise RuntimeError(
                f"Speiseplan für Ressource {resource_id} antwortet mit HTTP {response.status}."
            )
        html = response.read().decode("utf-8")

    if "rowMeal" not in html and "keine Essen" not in html:
        raise RuntimeError(
            f"Unerwartetes Speiseplanformat für Ressource {resource_id} "
            f"am {date.isoformat()}."
        )

    parser = MenuParser()
    parser.feed(html)
    parser.close()
    return parser.meals


def main():
    berlin_today = datetime.now().astimezone().date()
    dates = [berlin_today + timedelta(days=offset) for offset in range(LOOKAHEAD_DAYS)]
    menus = {resource_id: {} for resource_id in CANTEENS}

    for resource_id, canteen_name in CANTEENS.items():
        for menu_date in dates:
            meals = fetch_menu(resource_id, menu_date)
            menus[resource_id][menu_date.isoformat()] = meals
        print(f"{canteen_name}: {sum(map(len, menus[resource_id].values()))} Gerichte")

    data = {
        "updatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "rangeStart": dates[0].isoformat(),
        "rangeEnd": dates[-1].isoformat(),
        "menus": menus,
    }
    temporary_file = OUTPUT_FILE.with_suffix(".json.tmp")
    temporary_file.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    temporary_file.replace(OUTPUT_FILE)
    print(f"Speiseplandaten gespeichert: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
