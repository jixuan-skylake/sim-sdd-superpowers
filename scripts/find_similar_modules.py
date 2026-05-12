#!/usr/bin/env python3
"""Rank similar C source / header / test files for a module contract.

Deterministic scoring keeps weak models from improvising "go grep things".
"""
import argparse
import json
import re
import sys
from pathlib import Path

CODE_SUFFIXES = {".c", ".h"}
TEST_HINTS = ("test", "tests", "_test")


def tokenize_name(name: str):
    tokens = set()
    for piece in re.split(r"[_./\\-]", name):
        piece = piece.strip()
        if piece:
            tokens.add(piece.lower())
    return tokens


def score_file(path: Path, module_tokens, register_names, root: Path):
    score = 0
    reasons = []
    rel = path.relative_to(root).as_posix()
    name_tokens = tokenize_name(path.stem)

    shared = module_tokens & name_tokens
    if shared:
        score += 3 * len(shared)
        reasons.append(f"shares name tokens {sorted(shared)}")

    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return None

    hits = []
    for reg in register_names:
        if reg and re.search(rf"\b{re.escape(reg)}\b", text):
            hits.append(reg)
    if hits:
        score += 2 * len(hits)
        reasons.append(f"mentions registers {hits}")

    if any(hint in rel.lower() for hint in TEST_HINTS):
        score += 1
        reasons.append("located under tests path")

    if re.search(r"\b(reset|init|realize|finalize)\b", text):
        score += 1
        reasons.append("has reset/init/realize/finalize lifecycle calls")

    if score == 0:
        return None
    return {"path": rel, "score": score, "reasons": reasons}


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Rank similar modules and tests for a module contract.",
    )
    parser.add_argument("--contract-json", help="Contract JSON string.")
    parser.add_argument("--contract-file", help="Path to contract JSON file.")
    parser.add_argument("--root", default=".", help="Search root.")
    parser.add_argument("--max-results", type=int, default=5)
    args = parser.parse_args(argv)

    if not args.contract_json and not args.contract_file:
        parser.print_help()
        return 0

    if args.contract_json:
        contract = json.loads(args.contract_json)
    else:
        contract = json.loads(Path(args.contract_file).read_text(encoding="utf-8"))

    module = contract.get("module", "")
    module_tokens = tokenize_name(module)
    register_names = [r.get("name", "") for r in contract.get("registers", [])]

    root = Path(args.root).resolve()
    if not root.exists():
        print(f"root not found: {root}", file=sys.stderr)
        return 2

    candidates = []
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix.lower() not in CODE_SUFFIXES:
            continue
        scored = score_file(path, module_tokens, register_names, root)
        if scored is not None:
            candidates.append(scored)

    candidates.sort(key=lambda c: (-c["score"], c["path"]))
    print(json.dumps(candidates[: args.max_results], ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
