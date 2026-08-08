from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "web" / "index.html"


class IndexParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta_refresh = []
        self.links = []
        self.scripts = []
        self._script = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta" and (attrs.get("http-equiv") or "").lower() == "refresh":
            self.meta_refresh.append(attrs.get("content"))
        elif tag == "a":
            self.links.append(attrs)
        elif tag == "script":
            self._script = []

    def handle_data(self, data):
        if self._script is not None:
            self._script.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self._script is not None:
            self.scripts.append("".join(self._script))
            self._script = None


def test_index_has_relative_zero_delay_redirect_and_accessible_fallback():
    parser = IndexParser()
    parser.feed(INDEX.read_text(encoding="utf-8"))

    assert parser.meta_refresh == ["0; url=diagnosis.html"]
    assert any(link.get("href") == "diagnosis.html" for link in parser.links)
    script = "\n".join(parser.scripts)
    assert "location.replace(new URL('diagnosis.html', location.href).href)" in script
    assert "github.io" not in script
    assert "trycloudflare.com" not in script
