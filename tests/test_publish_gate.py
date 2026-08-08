import json
import os
from pathlib import Path
import tempfile
import unittest

from scripts.publish_gate import GateError, run_gate, scanner_commands

ROOT = Path(__file__).resolve().parents[1]
APPROVED = "a" * 40


class Result:
    def __init__(self, stdout="", returncode=0):
        self.stdout, self.returncode = stdout, returncode


class FakeRunner:
    def __init__(self, overrides=None):
        self.overrides = overrides or {}
        self.calls = []

    def run(self, args, cwd, check=True):
        key = tuple(args)
        self.calls.append(key)
        value = self.overrides.get(key, Result())
        if isinstance(value, Exception):
            raise value
        if check and value.returncode:
            raise GateError("command failed (redacted)")
        return value


def valid_overrides(mode="pre-create"):
    expected = "https://github.com/xsa-dev/ai-disrupt-pdlc-coach.git"
    values = {
        ("git", "rev-parse", "HEAD"): Result(APPROVED + "\n"),
        ("git", "status", "--porcelain=v1", "--untracked-files=all", "--ignored=matching"): Result(),
        ("git", "ls-files", "-z"): Result("README.md\0web/index.html\0"),
        ("git", "for-each-ref", "--format=%(refname)"): Result("refs/heads/master\n"),
        ("git", "ls-tree", "-r", "--name-only", "-z", "refs/heads/master"): Result("README.md\0web/index.html\0"),
        ("gh", "api", "user", "--jq", ".login"): Result("xsa-dev\n"),
        ("git", "remote", "get-url", "origin"): Result(returncode=2),
        ("gh", "repo", "view", "xsa-dev/ai-disrupt-pdlc-coach", "--json", "nameWithOwner"): Result(returncode=1),
    }
    if mode == "pre-push":
        values[("git", "remote", "get-url", "origin")] = Result(expected + "\n")
        values[("gh", "repo", "view", "xsa-dev/ai-disrupt-pdlc-coach", "--json", "nameWithOwner")] = Result('{"nameWithOwner":"xsa-dev/ai-disrupt-pdlc-coach"}\n')
        values[("git", "ls-remote", "origin")] = Result()
    return values


class PublishGateTests(unittest.TestCase):
    def make_repo(self):
        tmp = tempfile.TemporaryDirectory()
        root = Path(tmp.name)
        (root / "web").mkdir()
        (root / "web/index.html").write_text('<a href="diagnosis.html">go</a>')
        policy = json.loads((ROOT / "publish-policy.json").read_text())
        policy["allowed_web_files"] = ["web/index.html"]
        policy["allowed_top_level"] = ["README.md", "web", "publish-policy.json", ".gitleaks.toml"]
        (root / "publish-policy.json").write_text(json.dumps(policy))
        (root / ".gitleaks.toml").write_text("title='reviewed'\n")
        return tmp, root

    def run_valid(self, mode="pre-create", overrides=None):
        tmp, root = self.make_repo()
        evidence = Path(tmp.name).parent / (Path(tmp.name).name + "-evidence.json")
        values = valid_overrides(mode)
        image = json.loads((root / "publish-policy.json").read_text())["scanner"]["image"]
        values[("docker", "run", "--rm", "--platform", "linux/amd64", image, "version")] = Result("8.30.1\n")
        if overrides: values.update(overrides)
        runner = FakeRunner(values)
        try:
            report = run_gate(mode, APPROVED, root, root / "publish-policy.json", evidence, runner)
            return tmp, root, evidence, runner, report
        except Exception:
            if evidence.exists(): evidence.unlink()
            tmp.cleanup()
            raise

    def test_scanner_is_exactly_pinned_and_both_scans_are_constructed(self):
        policy = json.loads((ROOT / "publish-policy.json").read_text())
        self.assertEqual(policy["scanner"], {
            "version": "8.30.1",
            "image": "zricethezav/gitleaks@sha256:b109bc5f8f76a38196a3e413704fc5b9e3c32360bce4e4b603bd6f45b3721dbb",
            "platform": "linux/amd64",
        })
        commands = scanner_commands(ROOT, policy)
        self.assertEqual(len(commands), 3)
        self.assertIn("--log-opts=--all", commands[1])
        self.assertIn("dir", commands[2])
        self.assertTrue(all("--redact" in c for c in commands[1:]))

    def test_precreate_passes_and_writes_redacted_private_evidence_outside_repo(self):
        tmp, root, evidence, runner, report = self.run_valid()
        try:
            self.assertTrue(report["checks"]["gate_passed"])
            self.assertEqual(stat_mode(evidence), 0o600)
            self.assertFalse(evidence.resolve().is_relative_to(root.resolve()))
            data = json.loads(evidence.read_text())
            for key in ("approved_sha", "policy_sha256", "scanner", "refs", "path_manifest_sha256", "artifact_manifest_sha256", "checks"):
                self.assertIn(key, data)
            self.assertNotIn("finding", evidence.read_text().lower())
        finally:
            evidence.unlink(missing_ok=True); tmp.cleanup()

    def test_negative_state_probes_fail_closed(self):
        probes = {
            "head": {("git", "rev-parse", "HEAD"): Result("b" * 40 + "\n")},
            "dirty": {("git", "status", "--porcelain=v1", "--untracked-files=all", "--ignored=matching"): Result(" M README.md\n")},
            "untracked": {("git", "status", "--porcelain=v1", "--untracked-files=all", "--ignored=matching"): Result("?? .env\n")},
            "account": {("gh", "api", "user", "--jq", ".login"): Result("someone-else\n")},
            "stale-ref": {("git", "for-each-ref", "--format=%(refname)"): Result("refs/original/refs/heads/master\n")},
        }
        for name, override in probes.items():
            with self.subTest(name=name), self.assertRaises(GateError):
                self.run_valid(overrides=override)

    def test_prepush_rejects_wrong_remote_nonempty_remote_and_bad_scanner(self):
        expected_url = ("git", "remote", "get-url", "origin")
        probes = [
            {expected_url: Result("https://user@example.invalid/repo.git\n")},
            {("git", "ls-remote", "origin"): Result(f"{APPROVED}\trefs/heads/master\n")},
        ]
        for override in probes:
            with self.assertRaises(GateError): self.run_valid("pre-push", override)
        tmp, root = self.make_repo()
        image = json.loads((root / "publish-policy.json").read_text())["scanner"]["image"]
        tmp.cleanup()
        with self.assertRaises(GateError):
            self.run_valid(overrides={("docker", "run", "--rm", "--platform", "linux/amd64", image, "version"): Result("8.30.0\n")})

    def test_manifest_tamper_is_rejected(self):
        tmp, root = self.make_repo()
        try:
            os.symlink("index.html", root / "web/extra.html")
            evidence = Path(tmp.name).parent / "tamper-evidence.json"
            with self.assertRaises(GateError):
                run_gate("pre-create", APPROVED, root, root / "publish-policy.json", evidence, FakeRunner(valid_overrides()))
            evidence.unlink(missing_ok=True)
        finally: tmp.cleanup()


def stat_mode(path):
    return path.stat().st_mode & 0o777


if __name__ == "__main__": unittest.main()
