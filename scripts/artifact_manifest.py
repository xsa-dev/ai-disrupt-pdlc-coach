#!/usr/bin/env python3
"""Build and validate the exact GitHub Pages artifact."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import stat
from typing import Any


class ArtifactError(RuntimeError):
    pass


def _canonical(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def _walk_web(web: Path) -> dict[str, os.stat_result]:
    found: dict[str, os.stat_result] = {}
    pending = [web]
    while pending:
        directory = pending.pop()
        for entry in os.scandir(directory):
            path = Path(entry.path)
            relative = path.relative_to(web.parent).as_posix()
            info = entry.stat(follow_symlinks=False)
            if stat.S_ISDIR(info.st_mode):
                pending.append(path)
            else:
                found[relative] = info
    return found


def _validate_references(path: Path, data: bytes) -> None:
    if path.suffix.lower() in (".woff", ".woff2", ".ttf", ".otf", ".eot", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".json", ".map"):
        return
    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise ArtifactError(f"artifact is not UTF-8 text: {path}") from exc
    root_absolute = re.compile(r"(?:href|src|action)\s*=\s*['\"]\s*/(?!/)|url\(\s*['\"]?/(?!/)", re.I)
    forbidden_origin = re.compile(r"(?:trycloudflare\.com|github\.io)", re.I)
    if root_absolute.search(text):
        raise ArtifactError(f"root-absolute first-party reference: {path}")
    if forbidden_origin.search(text):
        raise ArtifactError(f"hardcoded preview/production origin: {path}")


def build_manifest(root: Path, policy_path: Path) -> dict[str, Any]:
    root = root.resolve()
    policy_bytes = policy_path.read_bytes()
    policy = json.loads(policy_bytes)
    allowed = sorted(policy["allowed_web_files"])
    found = _walk_web(root / "web")
    if sorted(found) != allowed:
        raise ArtifactError("web path set does not exactly match allowed_web_files")
    files = []
    for relative in allowed:
        path = root / relative
        info = found[relative]
        if not stat.S_ISREG(info.st_mode) or path.is_symlink():
            raise ArtifactError(f"not a regular file: {relative}")
        if info.st_nlink != 1:
            raise ArtifactError(f"hard-linked file: {relative}")
        data = path.read_bytes()
        _validate_references(path, data)
        files.append({
            "path": relative,
            "mode": f"{stat.S_IMODE(info.st_mode):04o}",
            "size": len(data),
            "sha256": hashlib.sha256(data).hexdigest(),
        })
    policy_hash = hashlib.sha256(policy_bytes).hexdigest()
    bound = {"policy_sha256": policy_hash, "files": files}
    return {**bound, "manifest_sha256": hashlib.sha256(_canonical(bound)).hexdigest()}


def manifest_bytes(manifest: dict[str, Any]) -> bytes:
    return _canonical(manifest)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path.cwd())
    parser.add_argument("--policy", type=Path, default=Path("publish-policy.json"))
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    policy = args.policy if args.policy.is_absolute() else args.root / args.policy
    content = manifest_bytes(build_manifest(args.root, policy))
    if args.output:
        args.output.write_bytes(content)
    else:
        os.write(1, content)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
