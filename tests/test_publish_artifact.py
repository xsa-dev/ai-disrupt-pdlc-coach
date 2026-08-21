import hashlib
import json
import os
from pathlib import Path
import stat
import tempfile
import unittest

from scripts.artifact_manifest import ArtifactError, build_manifest, manifest_bytes
from scripts.publish_gate import PolicyError, validate_paths

ROOT = Path(__file__).resolve().parents[1]
POLICY_PATH = ROOT / "publish-policy.json"


class PathPolicyTests(unittest.TestCase):
    def setUp(self):
        self.policy = json.loads(POLICY_PATH.read_text())

    def test_policy_names_exact_web_allowlist_and_all_generated_families(self):
        self.assertEqual(self.policy["allowed_web_files"], [
            "web/antipatterns.html", "web/diagnosis.html", "web/index.html",
            "web/methodologies.html", "web/roadmap.html", "web/openspec.html", "web/course-openspec.html", "web/course-openspec/styles.css", "web/course-openspec/main.js", "web/vendor/tailwind-cdn.js",
            "web/vendor/fontawesome/css/all.min.css",
            "web/vendor/fontawesome/webfonts/fa-brands-400.ttf",
            "web/vendor/fontawesome/webfonts/fa-brands-400.woff2",
            "web/vendor/fontawesome/webfonts/fa-regular-400.ttf",
            "web/vendor/fontawesome/webfonts/fa-regular-400.woff2",
            "web/vendor/fontawesome/webfonts/fa-solid-900.ttf",
            "web/vendor/fontawesome/webfonts/fa-solid-900.woff2",
            "web/vendor/fontawesome/webfonts/fa-v4compatibility.ttf",
            "web/vendor/fontawesome/webfonts/fa-v4compatibility.woff2",
            "web/vendor/js/jspdf.umd.min.js",
            "web/vendor/js/html2pdf.bundle.min.js",
            "web/contact-modal.css",
            "web/contact-modal.js",
            "web/web-mobile.css",
        ])
        generated = [p for p in self.policy["forbidden_prefixes"] if p.startswith(".") and p not in (".github/prompts/", ".github/skills/")]
        self.assertEqual(len(generated), 31)

    def test_path_allowlist_accepts_public_paths_and_only_workflows_under_github(self):
        validate_paths(["README.md", "coach/app.py", ".github/workflows/pages.yml", "web/index.html"], self.policy)
        for path in (".github/prompts/x.md", ".github/skills/x.md", ".github/CODEOWNERS"):
            with self.subTest(path=path), self.assertRaises(PolicyError):
                validate_paths([path], self.policy)

    def test_path_policy_rejects_private_generated_and_unsafe_families(self):
        probes = [p + "probe" for p in self.policy["forbidden_prefixes"]]
        probes += [
            "coach/data/teams/acme.json", ".env", "x.env", "secret.pem", "private.key",
            "report.PDF", "tests/node_modules/x", "tests/__pycache__/x", ".pytest_cache/x",
            "web/unapproved.html", "build/output.js", "gate-report.json",
        ]
        for path in probes:
            with self.subTest(path=path), self.assertRaises(PolicyError):
                validate_paths([path], self.policy)


class ArtifactManifestTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / "web/vendor").mkdir(parents=True)
        self.policy = {
            "allowed_web_files": ["web/index.html", "web/vendor/tailwind-cdn.js"],
        }
        (self.root / "policy.json").write_text(json.dumps(self.policy))
        (self.root / "web/index.html").write_text('<a href="diagnosis.html">go</a>')
        (self.root / "web/vendor/tailwind-cdn.js").write_text("ok")

    def tearDown(self):
        self.tmp.cleanup()

    def build(self):
        return build_manifest(self.root, self.root / "policy.json")

    def test_manifest_is_sorted_deterministic_and_policy_bound(self):
        one = manifest_bytes(self.build())
        two = manifest_bytes(self.build())
        self.assertEqual(one, two)
        document = json.loads(one)
        self.assertEqual([f["path"] for f in document["files"]], sorted(self.policy["allowed_web_files"]))
        self.assertEqual(set(document["files"][0]), {"path", "mode", "size", "sha256"})
        expected_policy_hash = hashlib.sha256((self.root / "policy.json").read_bytes()).hexdigest()
        self.assertEqual(document["policy_sha256"], expected_policy_hash)
        self.assertRegex(document["manifest_sha256"], r"^[0-9a-f]{64}$")

    def test_validator_rejects_unexpected_missing_and_nonregular_paths(self):
        (self.root / "web/extra.txt").write_text("x")
        with self.assertRaises(ArtifactError): self.build()
        (self.root / "web/extra.txt").unlink()
        (self.root / "web/index.html").unlink()
        with self.assertRaises(ArtifactError): self.build()
        os.symlink("vendor/tailwind-cdn.js", self.root / "web/index.html")
        with self.assertRaises(ArtifactError): self.build()

    def test_validator_rejects_hardlinks_and_fifo(self):
        source = self.root / "web/index.html"
        source.unlink()
        os.link(self.root / "web/vendor/tailwind-cdn.js", source)
        with self.assertRaises(ArtifactError): self.build()
        source.unlink()
        os.mkfifo(source)
        with self.assertRaises(ArtifactError): self.build()

    def test_validator_rejects_root_absolute_and_hardcoded_origins(self):
        bad_values = [
            '<a href="/diagnosis.html">x</a>', "url(/asset.css)",
            "https://preview.trycloudflare.com/x", "https://xsa-dev.github.io/ai-disrupt-pdlc-coach/",
        ]
        for value in bad_values:
            with self.subTest(value=value):
                (self.root / "web/index.html").write_text(value)
                with self.assertRaises(ArtifactError): self.build()


if __name__ == "__main__":
    unittest.main()
