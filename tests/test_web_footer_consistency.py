from html.parser import HTMLParser
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
PAGES = [
    "diagnosis.html",
    "roadmap.html",
    "methodologies.html",
    "antipatterns.html",
    "openspec.html",
    "course-openspec.html",
]

GUIDE_URL = "https://aipdlc.ru/documents/ru/whitepaper_full_ru.pdf"
METHODOLOGY_ATTRIBUTION = "aipdlc.ru"
METHODOLOGY_ORG = "Сбербанк"
DEVELOPER_NICK = "xsa-dev"


class FooterParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.footer_attrs = None
        self.in_footer = 0
        self.footer_text = ""
        self.links = []
        self._current_link = None

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "footer" and "data-site-footer" in attrs_dict:
            self.footer_attrs = attrs_dict
            self.in_footer = 1
        elif self.in_footer > 0:
            self.in_footer += 1
            if tag == "a":
                self._current_link = {"attrs": attrs_dict, "text": ""}
        if tag in {"br", "img", "meta", "link", "input", "hr"}:
            self.handle_endtag(tag)

    def handle_data(self, data):
        if self.in_footer > 0:
            self.footer_text += " " + data
        if self._current_link is not None:
            self._current_link["text"] += data

    def handle_endtag(self, tag):
        if self._current_link is not None and tag == "a":
            self.links.append(self._current_link)
            self._current_link = None
        if self.in_footer > 0:
            self.in_footer -= 1


def parse_page(page_name):
    parser = FooterParser()
    content = (ROOT / "web" / page_name).read_text(encoding="utf-8")
    parser.feed(content)
    return parser


@pytest.mark.parametrize("page", PAGES)
def test_page_renders_shared_semantic_footer(page):
    parsed = parse_page(page)
    assert parsed.footer_attrs is not None, f"{page} missing <footer data-site-footer>"

    # Check link to whitepaper guide
    guide_links = [
        link for link in parsed.links
        if link["attrs"].get("href") == GUIDE_URL
    ]
    assert len(guide_links) >= 1, f"{page} missing link to {GUIDE_URL}"
    assert any("Руководство по генеративной разработке ПО" in link["text"] for link in guide_links), (
        f"{page} link text does not contain 'Руководство по генеративной разработке ПО'"
    )

    # Check attribution
    text = " ".join(parsed.footer_text.split())
    assert METHODOLOGY_ATTRIBUTION in text, f"{page} missing methodology attribution '{METHODOLOGY_ATTRIBUTION}'"
    assert METHODOLOGY_ORG in text, f"{page} missing methodology org '{METHODOLOGY_ORG}'"
    assert DEVELOPER_NICK in text, f"{page} missing developer attribution '{DEVELOPER_NICK}'"

    # Check attribution links (aipdlc.ru and github.com/xsa-dev)
    gh_links = [link for link in parsed.links if "github.com/xsa-dev" in link["attrs"].get("href", "")]
    assert len(gh_links) >= 1, f"{page} missing link to https://github.com/xsa-dev in footer"

    # Check disclaimer
    assert "Отказ от ответственности:" in text or "отказ от ответственности" in text.lower(), (
        f"{page} missing disclaimer text"
    )
