from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / ".github/workflows/pages.yml"
PINS = {
    "actions/checkout": "11d5960a326750d5838078e36cf38b85af677262",
    "actions/configure-pages": "983d7736d9b0ae728b81ab479565c72886d7745b",
    "actions/upload-pages-artifact": "56afc609e74202658d3ffba0e8f6dda462b719fa",
    "actions/deploy-pages": "d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e",
}


class PagesWorkflowTests(unittest.TestCase):
    def setUp(self): self.text = WORKFLOW.read_text()

    def test_triggers_master_manual_and_pull_request(self):
        self.assertRegex(self.text, r"push:\s*\n\s+branches:\s*\[master\]")
        self.assertRegex(self.text, r"pull_request:\s*\n\s+branches:\s*\[master\]")
        self.assertIn("workflow_dispatch:", self.text)
        # only the deploy job is gated to master; test runs on PR too
        jobs = re.findall(r"^  ([a-z][\w-]*):\n(?:(?:    .*|\s*)\n)*?    if: \$\{\{ github\.ref == 'refs/heads/master' \}\}", self.text, re.M)
        self.assertEqual(set(jobs), {"deploy"})

    def test_all_official_actions_use_only_reviewed_full_sha_pins(self):
        uses = re.findall(r"uses:\s*([^\s]+)", self.text)
        self.assertTrue(uses)
        for action in uses:
            name, pin = action.split("@", 1)
            self.assertEqual(pin, PINS[name])
            self.assertRegex(pin, r"^[0-9a-f]{40}$")

    def test_test_job_is_read_only_and_runs_all_acceptance_families_and_manifest(self):
        block = self.text.split("  test:\n", 1)[1].split("  deploy:\n", 1)[0]
        self.assertRegex(block, r"permissions:\s*\n\s+contents: read")
        for required in (
            "python3 -m unittest", "npm ci --prefix tests", "quiz_v1_primitives.mjs",
            "quiz_v1_url.mjs", "node tests/headless_methodologies.mjs",
            "viewport_headers.mjs", "viewport_methodologies.mjs", "viewport_entrypoint.mjs",
            "scripts/artifact_manifest.py",
        ):
            self.assertIn(required, block)
        self.assertNotIn("pages: write", block)
        self.assertNotIn("id-token: write", block)

    def test_deploy_is_blocked_by_test_and_has_exact_permissions_environment_and_artifact(self):
        block = self.text.split("  deploy:\n", 1)[1]
        self.assertIn("needs: test", block)
        self.assertNotIn("always()", block)
        self.assertRegex(block, r"permissions:\s*\n\s+contents: read\s*\n\s+pages: write\s*\n\s+id-token: write")
        self.assertRegex(block, r"environment:\s*\n\s+name: github-pages")
        self.assertIn("concurrency:", self.text)
        self.assertRegex(block, r"actions/upload-pages-artifact@[0-9a-f]{40}\s*\n\s+with:\s*\n\s+path: web\s*(?:\n|$)")
        self.assertIn("scripts/artifact_manifest.py", block)
        self.assertIn("artifact-manifest.json", block)

    def test_wrong_ref_and_failed_prerequisite_have_no_write_scoped_path(self):
        # deploy is master-only; test runs on PR too (so branch protection gets its status check)
        self.assertEqual(self.text.count("if: ${{ github.ref == 'refs/heads/master' }}"), 1)
        self.assertEqual(self.text.count("needs: test"), 1)
        self.assertNotRegex(self.text, r"(?:if:.*always|continue-on-error:\s*true)")


if __name__ == "__main__": unittest.main()
