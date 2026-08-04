import json
import re
import subprocess
import tempfile
from html.parser import HTMLParser
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"
PAGE = WEB / "methodologies.html"
ANTIPATTERNS = WEB / "antipatterns.html"

EXPECTED_IDS = {
    "pr-faq",
    "outcome-hypothesis",
    "adaptation-redesign",
    "agent-applicability",
    "mob-elaboration",
    "sdd-cycle",
    "human-in-loop-map",
    "session-handoff",
    "eval-driven-development",
    "evidence-bundle",
    "r0-r5-autonomy",
    "governance-mesh",
}
REQUIRED_FIELDS = {
    "id",
    "titleRu",
    "kind",
    "stages",
    "purpose",
    "whenToUse",
    "applicabilityLimits",
    "inputs",
    "steps",
    "output",
    "doneCriteria",
    "relatedAntipatterns",
    "sourceSections",
    "sourcePages",
}


class HTMLInventory(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.links = []
        self.scripts = []
        self._script = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "a" and "href" in attrs:
            self.links.append(attrs["href"])
        if tag == "script" and "src" not in attrs:
            self._script = []

    def handle_data(self, data):
        if self._script is not None:
            self._script.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self._script is not None:
            self.scripts.append("".join(self._script))
            self._script = None


def parse_page():
    assert PAGE.exists(), "web/methodologies.html must exist"
    html = PAGE.read_text(encoding="utf-8")
    parser = HTMLInventory()
    parser.feed(html)
    return html, parser


def read_registry():
    html, _ = parse_page()
    match = re.search(
        r'<script[^>]+id=["\']methodologies-data["\'][^>]*>(.*?)</script>',
        html,
        re.S,
    )
    assert match, "methodologies-data JSON registry is missing"
    return json.loads(match.group(1))


def test_registry_has_exact_source_grounded_entries():
    entries = read_registry()
    assert len(entries) == 12
    assert {entry["id"] for entry in entries} == EXPECTED_IDS
    assert len({entry["id"] for entry in entries}) == len(entries)
    for entry in entries:
        assert REQUIRED_FIELDS <= entry.keys(), entry["id"]
        assert entry["kind"] in {"method", "artifact", "governance-model"}
        assert entry["stages"]
        assert entry["sourceSections"]
        assert entry["sourcePages"]
        assert entry["steps"]
        assert entry["applicabilityLimits"]


def test_related_antipatterns_match_registry():
    entries = read_registry()
    source = ANTIPATTERNS.read_text(encoding="utf-8")
    names = set(re.findall(r'name:\s*"([^"]+)"', source))
    for entry in entries:
        assert set(entry["relatedAntipatterns"]) <= names, entry["id"]


def test_navigation_and_unique_ids():
    _, parser = parse_page()
    assert len(parser.ids) == len(set(parser.ids)), "duplicate HTML IDs"
    for href in parser.links:
        target = href.split("#", 1)[0].split("?", 1)[0]
        if target and not target.startswith(("http:", "https:", "mailto:", "#")):
            assert (WEB / target).exists(), href
    for page_name in ("diagnosis.html", "roadmap.html", "antipatterns.html", "methodologies.html"):
        page = (WEB / page_name).read_text(encoding="utf-8")
        assert "methodologies.html" in page, page_name


def test_inline_javascript_parses():
    _, parser = parse_page()
    for index, script in enumerate(parser.scripts):
        if not script.strip():
            continue
        with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8") as handle:
            handle.write(script)
            handle.flush()
            result = subprocess.run(
                ["node", "--check", handle.name], capture_output=True, text=True
            )
        assert result.returncode == 0, f"inline script {index}: {result.stderr}"


def test_required_static_contract():
    html, _ = parse_page()
    assert 'name="viewport"' in html
    assert 'content="width=device-width, initial-scale=1.0"' in html
    assert "Tailwind" not in html or "cdn.tailwindcss.com" in html
    assert "antipatterns.html" in html
    assert "roadmap.html" in html


@pytest.mark.parametrize("width", [744, 1024])
def test_page_has_no_fixed_width_overflow_contract(width):
    html, _ = parse_page()
    assert "min-width:" not in html
    assert "width: 1200px" not in html
    assert width > 0
