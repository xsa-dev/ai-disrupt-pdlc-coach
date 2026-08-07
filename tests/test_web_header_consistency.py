from html.parser import HTMLParser
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
PAGES = {
    "diagnosis.html": "Диагностика",
    "roadmap.html": "Roadmap",
    "methodologies.html": "Методики",
    "antipatterns.html": "Антипаттерны",
}
NAV_ITEMS = [
    ("diagnosis.html", "Диагностика"),
    ("roadmap.html", "Roadmap"),
    ("methodologies.html", "Методики"),
    ("antipatterns.html", "Антипаттерны"),
]
NAV_ROW_CLASSES = {
    "site-nav-row", "max-w-5xl", "mx-auto", "px-4", "sm:px-6",
    "py-2.5", "min-h-[42px]", "flex", "items-center", "justify-between",
}
BRAND_ROW_CLASSES = {
    "site-brand-row", "max-w-5xl", "mx-auto", "px-4", "sm:px-6",
    "py-5", "min-h-[76px]", "flex", "items-center", "justify-between",
}
ACTIVE_CLASSES = {
    "site-nav-link", "font-semibold", "text-emerald-700", "border-b-2",
    "border-emerald-600", "pb-1",
}


class HeaderParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.header_depth = 0
        self.header_attrs = {}
        self.nav_depth = 0
        self.links = []
        self._link = None
        self.elements = []
        self.ids = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("id"):
            self.ids.append(attrs["id"])
        if tag == "header" and "data-site-header" in attrs:
            self.header_depth = 1
            self.header_attrs = attrs
        elif self.header_depth:
            self.header_depth += 1
        if self.header_depth:
            self.elements.append((tag, attrs))
            if tag == "nav" and attrs.get("aria-label") == "Основная навигация":
                self.nav_depth = 1
            elif self.nav_depth:
                self.nav_depth += 1
            if self.nav_depth and tag == "a":
                self._link = {"attrs": attrs, "text": ""}
        if tag in {"br", "img", "meta", "link", "input", "hr"}:
            self.handle_endtag(tag)

    def handle_data(self, data):
        if self._link is not None:
            self._link["text"] += data

    def handle_endtag(self, tag):
        if self._link is not None and tag == "a":
            self._link["text"] = " ".join(self._link["text"].split())
            self.links.append(self._link)
            self._link = None
        if self.nav_depth:
            self.nav_depth -= 1
        if self.header_depth:
            self.header_depth -= 1


def classes(attrs):
    return set(attrs.get("class", "").split())


def parse(page):
    parser = HeaderParser()
    parser.feed((ROOT / "web" / page).read_text(encoding="utf-8"))
    return parser


@pytest.mark.parametrize("page,current_label", PAGES.items())
def test_page_uses_shared_semantic_header_contract(page, current_label):
    parsed = parse(page)
    assert parsed.header_attrs, f"{page}: missing <header data-site-header>"

    nav_rows = [attrs for tag, attrs in parsed.elements if NAV_ROW_CLASSES <= classes(attrs)]
    brand_rows = [attrs for tag, attrs in parsed.elements if BRAND_ROW_CLASSES <= classes(attrs)]
    assert len(nav_rows) == 1, f"{page}: shared nav row classes differ"
    assert len(brand_rows) == 1, f"{page}: shared brand row classes differ"

    actual_nav = [(link["attrs"].get("href"), link["text"]) for link in parsed.links]
    assert actual_nav == NAV_ITEMS

    active = [link for link in parsed.links if link["attrs"].get("aria-current") == "page"]
    assert len(active) == 1
    assert active[0]["text"] == current_label
    assert ACTIVE_CLASSES <= classes(active[0]["attrs"])

    title_nodes = [attrs for _, attrs in parsed.elements if "data-site-title" in attrs]
    subtitle_nodes = [attrs for _, attrs in parsed.elements if "data-site-subtitle" in attrs]
    icon_nodes = [attrs for _, attrs in parsed.elements if "data-site-icon" in attrs]
    assert len(title_nodes) == len(subtitle_nodes) == len(icon_nodes) == 1


@pytest.mark.parametrize("page", PAGES)
def test_page_ids_remain_unique(page):
    parsed = parse(page)
    duplicates = sorted({item for item in parsed.ids if parsed.ids.count(item) > 1})
    assert duplicates == [], f"{page}: duplicate IDs: {duplicates}"
