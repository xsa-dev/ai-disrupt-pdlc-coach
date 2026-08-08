#!/usr/bin/env python3
"""Single fail-closed wrapper for first public publication."""
from __future__ import annotations

import argparse
from pathlib import Path
import sys
from typing import Callable

from scripts.publish_gate import GateError, SubprocessRunner, run_gate

REPOSITORY = "xsa-dev/ai-disrupt-pdlc-coach"
ORIGIN = f"https://github.com/{REPOSITORY}.git"


class PublicationError(RuntimeError):
    pass


def _plan(approved_sha: str) -> list[list[str]]:
    return [
        ["gh", "repo", "create", REPOSITORY, "--public"],
        ["git", "remote", "add", "origin", ORIGIN],
        ["git", "push", "origin", f"{approved_sha}:refs/heads/master"],
    ]


def publish(approved_sha: str, root: Path, evidence_dir: Path, *, runner=None,
            gate: Callable = run_gate, dry_run: bool = False) -> list[list[str]]:
    runner = runner or SubprocessRunner()
    root = root.resolve()
    policy = root / "publish-policy.json"
    evidence_dir = evidence_dir.resolve()
    plan = _plan(approved_sha)
    try:
        gate("pre-create", approved_sha, root, policy, evidence_dir / "pre-create.json", runner)
        if dry_run:
            return plan
        runner.run(plan[0], root)
        if runner.run(["git", "rev-parse", "HEAD"], root).stdout.strip() != approved_sha:
            raise PublicationError("HEAD changed after repository creation")
        if runner.run(["git", "status", "--porcelain=v1", "--untracked-files=all"], root).stdout:
            raise PublicationError("worktree changed after repository creation")
        runner.run(plan[1], root)
        gate("pre-push", approved_sha, root, policy, evidence_dir / "pre-push.json", runner)
        runner.run(plan[2], root)
    except (GateError, PublicationError):
        raise
    except Exception as exc:
        raise PublicationError("publication stopped before subsequent side effects") from exc
    return plan


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--approved-sha", required=True)
    parser.add_argument("--root", type=Path, default=Path.cwd())
    parser.add_argument("--evidence-dir", type=Path, required=True)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    try:
        plan = publish(args.approved_sha, args.root, args.evidence_dir, dry_run=args.dry_run)
    except (GateError, PublicationError):
        print("publication stopped; command details redacted", file=sys.stderr)
        return 1
    if args.dry_run:
        print("dry-run passed pre-create gate; no public side effects executed")
        for command in plan:
            print(" ".join(command))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
