#!/usr/bin/env python3
"""Fail-closed first-publication gate with redacted evidence."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
from typing import Iterable, Protocol

from scripts.artifact_manifest import ArtifactError, build_manifest

EXPECTED_SCANNER = {
    "version": "8.30.1",
    "image": "zricethezav/gitleaks@sha256:b109bc5f8f76a38196a3e413704fc5b9e3c32360bce4e4b603bd6f45b3721dbb",
    "platform": "linux/amd64",
}


class PolicyError(RuntimeError):
    pass


class GateError(RuntimeError):
    pass


class Runner(Protocol):
    def run(self, args: list[str], cwd: Path, check: bool = True): ...


class SubprocessRunner:
    def run(self, args: list[str], cwd: Path, check: bool = True):
        completed = subprocess.run(args, cwd=cwd, text=True, stdout=subprocess.PIPE,
                                   stderr=subprocess.PIPE, check=False)
        if check and completed.returncode:
            raise GateError("required command failed (details redacted)")
        return completed


def validate_paths(paths: Iterable[str], policy: dict) -> None:
    allowed_top = set(policy["allowed_top_level"])
    allowed_web = set(policy["allowed_web_files"])
    forbidden_prefixes = tuple(policy["forbidden_prefixes"])
    forbidden_segments = set(policy["forbidden_path_segments"])
    forbidden_suffixes = tuple(s.lower() for s in policy["forbidden_suffixes"])
    for raw in paths:
        path = raw.replace("\\", "/")
        while path.startswith("./"):
            path = path[2:]
        parts = PurePosixPath(path).parts
        if not path or ".." in parts or parts[0] not in allowed_top:
            raise PolicyError(f"path outside public allowlist: {raw}")
        lower = path.lower()
        if path.startswith(forbidden_prefixes):
            raise PolicyError(f"forbidden path: {raw}")
        if any(part in forbidden_segments for part in parts) or lower.endswith(forbidden_suffixes):
            raise PolicyError(f"forbidden path type: {raw}")
        if parts[0] == ".github" and not any(path.startswith(p) for p in policy["allowed_github_prefixes"]):
            raise PolicyError(f"unapproved .github path: {raw}")
        if parts[0] == "web" and path not in allowed_web:
            raise PolicyError(f"unexpected web artifact: {raw}")
        if parts[0].startswith(".env") and path != ".env.example":
            raise PolicyError(f"environment file: {raw}")
        if any(x in lower for x in ("secret", "credential", "gate-report")):
            raise PolicyError(f"sensitive/generated path: {raw}")


def scanner_commands(root: Path, policy: dict) -> list[list[str]]:
    scanner = policy["scanner"]
    base = ["docker", "run", "--rm", "--platform", scanner["platform"]]
    mount = ["-v", f"{root.resolve()}:/repo:ro", scanner["image"]]
    common = ["--config", "/repo/.gitleaks.toml", "--redact", "--no-banner", "--exit-code", "1"]
    return [
        base + [scanner["image"], "version"],
        base + mount + ["git", "/repo", "--log-opts=--all"] + common,
        base + mount + ["dir", "/repo"] + common,
    ]


def _split_z(value: str) -> list[str]:
    return [item for item in value.split("\0") if item]


def _sha_json(value) -> str:
    encoded = json.dumps(value, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(encoded).hexdigest()


def _write_evidence(path: Path, root: Path, report: dict) -> None:
    resolved = path.resolve()
    if resolved == root.resolve() or root.resolve() in resolved.parents:
        raise GateError("evidence must be written outside repository")
    resolved.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(resolved, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    try:
        os.fchmod(fd, 0o600)
        os.write(fd, (json.dumps(report, sort_keys=True, separators=(",", ":")) + "\n").encode())
    finally:
        os.close(fd)


def _check_clean(status: str, policy: dict) -> None:
    tolerated = tuple(policy.get("tolerated_ignored_prefixes", ()))
    for line in status.splitlines():
        if not line:
            continue
        code, path = line[:2], line[3:]
        # Ignored files (marked "!!") are excluded from the public repository
        # by design and must never block the gate. The tolerated set allows
        # specific ignored paths to be reported without failing, but all
        # ignored paths are fundamentally safe.
        if code == "!!":
            continue
        if tolerated and path.startswith(tolerated):
            continue
        raise GateError("repository has non-approved local changes")


def _remote_checks(mode: str, root: Path, policy: dict, runner: Runner) -> None:
    repository = policy["repository"]
    target_url = f"https://github.com/{repository}.git"
    origin = runner.run(["git", "remote", "get-url", "origin"], root, check=False)
    target = runner.run(["gh", "repo", "view", repository, "--json", "nameWithOwner"], root, check=False)
    if mode == "pre-create":
        if origin.returncode == 0 or target.returncode == 0:
            raise GateError("pre-create requires absent target and no origin")
    elif mode == "pre-push":
        if origin.returncode or origin.stdout.strip() != target_url:
            raise GateError("origin does not exactly match credential-free target")
        if target.returncode:
            raise GateError("target repository does not exist")
        try:
            identity = json.loads(target.stdout)["nameWithOwner"]
        except (ValueError, KeyError, TypeError) as exc:
            raise GateError("target identity could not be verified") from exc
        if identity != repository:
            raise GateError("target identity mismatch")
        remote_refs = runner.run(["git", "ls-remote", "origin"], root)
        if remote_refs.stdout.strip():
            raise GateError("target repository is not empty")
    else:
        raise GateError("unknown gate mode")


def run_gate(mode: str, approved_sha: str, root: Path, policy_path: Path,
             evidence_path: Path, runner: Runner | None = None) -> dict:
    runner = runner or SubprocessRunner()
    root, policy_path = root.resolve(), policy_path.resolve()
    if not re.fullmatch(r"[0-9a-f]{40}", approved_sha):
        raise GateError("approved SHA must be a full lowercase commit SHA")
    policy_bytes = policy_path.read_bytes()
    policy = json.loads(policy_bytes)
    if policy.get("scanner") != EXPECTED_SCANNER:
        raise GateError("scanner policy identity mismatch")
    report = {
        "approved_sha": approved_sha,
        "policy_sha256": hashlib.sha256(policy_bytes).hexdigest(),
        "scanner": policy["scanner"],
        "refs": [],
        "path_manifest_sha256": "",
        "artifact_manifest_sha256": "",
        "checks": {"gate_passed": False},
    }
    try:
        if runner.run(["git", "rev-parse", "HEAD"], root).stdout.strip() != approved_sha:
            raise GateError("HEAD differs from approved SHA")
        status = runner.run(["git", "status", "--porcelain=v1", "--untracked-files=all", "--ignored=matching"], root).stdout
        _check_clean(status, policy)
        tracked = sorted(_split_z(runner.run(["git", "ls-files", "-z"], root).stdout))
        validate_paths(tracked, policy)
        refs = sorted(x for x in runner.run(["git", "for-each-ref", "--format=%(refname)"], root).stdout.splitlines() if x)
        if any(ref.startswith(("refs/original/", "refs/backup/", "refs/replace/")) for ref in refs):
            raise GateError("history rewrite or backup ref remains reachable")
        for ref in refs:
            historical = _split_z(runner.run(["git", "ls-tree", "-r", "--name-only", "-z", ref], root).stdout)
            validate_paths(historical, policy)
        report["refs"] = refs
        report["path_manifest_sha256"] = _sha_json(tracked)
        if runner.run(["gh", "api", "user", "--jq", ".login"], root).stdout.strip() != policy["repository"].split("/", 1)[0]:
            raise GateError("authenticated GitHub account mismatch")
        _remote_checks(mode, root, policy, runner)
        commands = scanner_commands(root, policy)
        reported_version = runner.run(commands[0], root).stdout.strip().lstrip("v")
        if reported_version != policy["scanner"]["version"]:
            raise GateError("scanner runtime version mismatch")
        runner.run(commands[1], root)
        runner.run(commands[2], root)
        report["artifact_manifest_sha256"] = build_manifest(root, policy_path)["manifest_sha256"]
        report["checks"] = {
            "approved_head": True, "clean_state": True, "path_policy": True,
            "history_refs": True, "github_identity": True, "remote_state": True,
            "scanner_history": True, "scanner_worktree": True, "artifact": True,
            "gate_passed": True,
        }
    except (PolicyError, ArtifactError, GateError, OSError, ValueError) as exc:
        _write_evidence(evidence_path, root, report)
        if isinstance(exc, GateError):
            raise
        raise GateError("gate validation failed (details redacted)") from exc
    _write_evidence(evidence_path, root, report)
    return report


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=("pre-create", "pre-push"))
    parser.add_argument("--approved-sha", required=True)
    parser.add_argument("--root", type=Path, default=Path.cwd())
    parser.add_argument("--policy", type=Path, default=Path("publish-policy.json"))
    parser.add_argument("--evidence", type=Path, required=True)
    args = parser.parse_args()
    policy = args.policy if args.policy.is_absolute() else args.root / args.policy
    try:
        run_gate(args.mode, args.approved_sha, args.root, policy, args.evidence)
    except GateError:
        print("publish gate failed; sensitive command details redacted", file=sys.stderr)
        return 1
    print("publish gate passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
