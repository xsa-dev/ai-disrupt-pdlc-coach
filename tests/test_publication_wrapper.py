from pathlib import Path
import tempfile
import unittest

from scripts.publish import PublicationError, publish

SHA = "c" * 40


class RecordingRunner:
    def __init__(self): self.calls = []
    def run(self, args, cwd, check=True):
        self.calls.append(tuple(args))
        class R: stdout = ""; returncode = 0
        if args[:3] == ["git", "rev-parse", "HEAD"]: R.stdout = SHA + "\n"
        return R()


class GateStub:
    def __init__(self, fail_mode=None): self.calls = []; self.fail_mode = fail_mode
    def __call__(self, mode, approved_sha, root, policy, evidence, runner):
        self.calls.append(mode)
        if mode == self.fail_mode: raise PublicationError(f"{mode} failed")
        return {"checks": {"gate_passed": True}}


class PublicationTests(unittest.TestCase):
    def test_failed_precreate_never_creates_repository(self):
        runner, gate = RecordingRunner(), GateStub("pre-create")
        with tempfile.TemporaryDirectory() as temp, self.assertRaises(PublicationError):
            publish(SHA, Path(temp), Path(temp).parent / "evidence", runner=runner, gate=gate)
        self.assertFalse(any(call[:3] == ("gh", "repo", "create") for call in runner.calls))

    def test_failed_prepush_never_pushes_source(self):
        runner, gate = RecordingRunner(), GateStub("pre-push")
        with tempfile.TemporaryDirectory() as temp, self.assertRaises(PublicationError):
            publish(SHA, Path(temp), Path(temp).parent / "evidence", runner=runner, gate=gate)
        self.assertTrue(any(call[:3] == ("gh", "repo", "create") for call in runner.calls))
        self.assertFalse(any(call[:2] == ("git", "push") for call in runner.calls))

    def test_success_uses_empty_create_credential_free_origin_and_exact_refspec(self):
        runner, gate = RecordingRunner(), GateStub()
        with tempfile.TemporaryDirectory() as temp:
            publish(SHA, Path(temp), Path(temp).parent / "evidence", runner=runner, gate=gate)
        self.assertEqual(gate.calls, ["pre-create", "pre-push"])
        self.assertIn(("gh", "repo", "create", "xsa-dev/ai-disrupt-pdlc-coach", "--public"), runner.calls)
        self.assertIn(("git", "remote", "add", "origin", "https://github.com/xsa-dev/ai-disrupt-pdlc-coach.git"), runner.calls)
        self.assertEqual(runner.calls[-1], ("git", "push", "origin", f"{SHA}:refs/heads/master"))

    def test_dry_run_performs_precreate_gate_but_no_external_side_effect(self):
        runner, gate = RecordingRunner(), GateStub()
        with tempfile.TemporaryDirectory() as temp:
            plan = publish(SHA, Path(temp), Path(temp).parent / "evidence", runner=runner, gate=gate, dry_run=True)
        self.assertEqual(gate.calls, ["pre-create"])
        self.assertEqual(runner.calls, [])
        self.assertEqual(plan[-1], ["git", "push", "origin", f"{SHA}:refs/heads/master"])


if __name__ == "__main__": unittest.main()
