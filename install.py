#!/usr/bin/env python3
"""Install SimSDD Superpowers into an OpenCode project using Python only."""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path
from typing import Any, Dict


ROOT = Path(__file__).resolve().parent
PLUGIN_NAME = "sim-sdd-superpowers"
SKILLS = (
    "sim-sdd-intake",
    "spec-to-context-pack",
    "similar-module-research",
    "c-sim-tdd",
    "module-implementation",
    "simulation-debugging",
    "code-review-c-sim",
    "team-handoff",
)


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Install SimSDD Superpowers skills and plugin runtime into .opencode."
    )
    target_group = parser.add_mutually_exclusive_group()
    target_group.add_argument(
        "--target",
        default=None,
        help="Business project root. Installs into <target>/.opencode. Defaults to current directory.",
    )
    target_group.add_argument(
        "--opencode-dir",
        default=None,
        help="Exact .opencode directory to install into, for example 99A_AI_Test/NinA_Module/.opencode.",
    )
    target_group.add_argument(
        "--global",
        action="store_true",
        dest="global_install",
        help="Install into the current user's ~/.opencode directory.",
    )
    return parser.parse_args(argv)


def resolve_opencode_dir(args: argparse.Namespace) -> Path:
    if args.global_install:
        return Path.home().joinpath(".opencode").resolve()

    if args.opencode_dir:
        opencode_dir = Path(args.opencode_dir).expanduser().resolve()
        if opencode_dir.name != ".opencode":
            raise SystemExit("--opencode-dir must point to a directory named .opencode")
        return opencode_dir

    target = Path(args.target or ".").expanduser().resolve()
    if target.name == ".opencode":
        raise SystemExit(
            "--target expects a business project root, not a .opencode directory. "
            "Use --opencode-dir for an exact .opencode path."
        )
    return target.joinpath(".opencode")


def copy_dir(src: Path, dst: Path) -> None:
    if not src.exists():
        raise SystemExit(f"Missing required source directory: {src}")
    shutil.copytree(src, dst, dirs_exist_ok=True)


def copy_file(src: Path, dst: Path) -> None:
    if not src.exists():
        raise SystemExit(f"Missing required source file: {src}")
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)


def read_json_or_default(path: Path, fallback: Dict[str, Any]) -> Dict[str, Any]:
    try:
        with path.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
            return data if isinstance(data, dict) else fallback.copy()
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return fallback.copy()


def write_package_json(opencode_dir: Path) -> None:
    package_path = opencode_dir.joinpath("package.json")
    package = read_json_or_default(package_path, {"private": True, "dependencies": {}})
    package["private"] = True
    dependencies = package.get("dependencies")
    if not isinstance(dependencies, dict):
        dependencies = {}
    dependencies[PLUGIN_NAME] = f"file:.opencode/plugins/{PLUGIN_NAME}"
    package["dependencies"] = dependencies
    package_path.write_text(
        json.dumps(package, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def install(opencode_dir: Path) -> None:
    skills_dir = opencode_dir.joinpath("skills")
    plugin_dir = opencode_dir.joinpath("plugins", PLUGIN_NAME)

    skills_dir.mkdir(parents=True, exist_ok=True)
    plugin_dir.mkdir(parents=True, exist_ok=True)

    copy_dir(ROOT.joinpath("skills"), skills_dir)
    copy_dir(ROOT.joinpath("src"), plugin_dir.joinpath("src"))
    copy_dir(ROOT.joinpath("scripts"), plugin_dir.joinpath("scripts"))
    copy_dir(ROOT.joinpath("templates"), plugin_dir.joinpath("templates"))

    for filename in ("package.json", "README.md", "install.mjs", "install.py"):
        copy_file(ROOT.joinpath(filename), plugin_dir.joinpath(filename))

    write_package_json(opencode_dir)

    print(f"Installed SimSDD plugin into {plugin_dir}")
    print(f"Installed SimSDD skills into {skills_dir}")
    print("Installed skills: " + ", ".join(SKILLS))


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    opencode_dir = resolve_opencode_dir(args)
    install(opencode_dir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
