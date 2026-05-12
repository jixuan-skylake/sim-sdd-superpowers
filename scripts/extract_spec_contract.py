#!/usr/bin/env python3
"""Extract a compact simulation module contract from a Markdown Spec.

Deterministic on purpose: the OpenCode plugin calls this instead of
asking the model to parse markdown, so weak models cannot drift.
"""
import argparse
import json
import re
import sys
from pathlib import Path
from typing import Optional


REGISTER_NAME_RE = re.compile(r"^[A-Z][A-Z0-9_]*$")


def extract_table_registers(text):
    registers = []
    in_table = False
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped.startswith("|"):
            in_table = False
            continue
        if "---" in stripped:
            in_table = True
            continue
        cells = [cell.strip() for cell in stripped.strip("|").split("|")]
        if len(cells) < 3:
            continue
        if not in_table and cells[0].lower() in {"name", "register", "field"}:
            continue
        if REGISTER_NAME_RE.match(cells[0]):
            registers.append(
                {"name": cells[0], "offset": cells[1], "description": cells[2]}
            )
    return registers


def section_lines(text, heading):
    pattern = re.compile(rf"^##\s+{re.escape(heading)}\s*$", re.MULTILINE)
    match = pattern.search(text)
    if not match:
        return []
    rest = text[match.end():]
    next_heading = re.search(r"^##\s+", rest, re.MULTILINE)
    body = rest[: next_heading.start()] if next_heading else rest
    return [line.strip() for line in body.splitlines() if line.strip()]


def derive_open_questions(text):
    questions = []
    for marker in ("TBD", "TODO", "FIXME", "???"):
        if marker in text:
            questions.append(
                f"Spec contains explicit {marker} marker; clarify before implementation."
            )
    return questions


def build_contract(path: Path, module_name: Optional[str] = None) -> dict:
    text = path.read_text(encoding="utf-8")
    title = next(
        (line[2:].strip() for line in text.splitlines() if line.startswith("# ")),
        path.stem,
    )
    overview = section_lines(text, "Overview")
    reset = section_lines(text, "Reset")
    interrupts = section_lines(text, "Interrupts")
    registers = extract_table_registers(text)
    missing = []
    if not overview:
        missing.append("Overview section missing")
    if not registers:
        missing.append("No register table detected")
    return {
        "module": module_name or title,
        "specPath": str(path),
        "overview": overview,
        "registers": registers,
        "reset": reset,
        "interrupts": interrupts,
        "openQuestions": derive_open_questions(text),
        "missingSections": missing,
    }


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Extract a compact simulation module contract from a Markdown Spec.",
    )
    parser.add_argument("spec_path", nargs="?", help="Path to the Markdown Spec file.")
    parser.add_argument("--module-name", help="Optional module name override.")
    args = parser.parse_args(argv)
    if not args.spec_path:
        parser.print_help()
        return 0
    path = Path(args.spec_path)
    if not path.exists():
        print(f"spec not found: {path}", file=sys.stderr)
        return 2
    contract = build_contract(path, args.module_name)
    print(json.dumps(contract, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
