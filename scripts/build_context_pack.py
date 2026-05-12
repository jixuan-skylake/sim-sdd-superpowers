#!/usr/bin/env python3
"""Build a compact Markdown context pack from a module contract and similar modules.

The context pack is the artifact the model MUST consume before implementation.
We keep the structure rigid so even weak models can rely on the section names.
"""
import argparse
import json
import sys
from pathlib import Path


def render_list(items, fallback="(none)"):
    items = [item for item in items if item]
    if not items:
        return fallback
    return "\n".join(f"- {item}" for item in items)


def render_registers(registers):
    if not registers:
        return "(no registers extracted)"
    lines = ["| Name | Offset | Description |", "| --- | --- | --- |"]
    for reg in registers:
        lines.append(
            f"| {reg.get('name','')} | {reg.get('offset','')} | {reg.get('description','')} |"
        )
    return "\n".join(lines)


def render_similar(similar):
    if not similar:
        return "(no similar modules found — STOP and flag risk)"
    lines = []
    for entry in similar:
        reasons = "; ".join(entry.get("reasons", []))
        lines.append(
            f"- `{entry.get('path','')}` (score {entry.get('score',0)}) — {reasons}"
        )
    return "\n".join(lines)


def estimate_tokens(text):
    return max(1, len(text) // 4)


def render_pack(contract, similar, token_budget, allowed_paths, forbidden_paths, project_apis):
    body = []
    body.append("# Context Pack")
    body.append("")
    body.append(f"Module: `{contract.get('module','(unknown)')}`")
    body.append(f"Spec: `{contract.get('specPath','(unknown)')}`")
    body.append(f"Token budget target: {token_budget}")
    body.append("")

    body.append("## 1. Task")
    body.append(
        f"Implement, review, debug, or test the `{contract.get('module','(unknown)')}` "
        "module according to the Spec referenced above. Do not exceed allowed paths."
    )
    body.append("")

    body.append("## 2. Explicit Spec Facts")
    facts = []
    overview = contract.get("overview") or []
    facts.extend(overview)
    reset = contract.get("reset") or []
    if reset:
        facts.append("Reset behavior: " + " ".join(reset))
    interrupts = contract.get("interrupts") or []
    if interrupts:
        facts.append("Interrupts: " + " ".join(interrupts))
    body.append(render_list(facts, "(spec is sparse — STOP and ask)"))
    body.append("")

    body.append("## 3. Inferences")
    inferences = []
    if similar:
        inferences.append(
            "Reset/lifecycle patterns inferred from highest-scoring similar module; not a Spec fact."
        )
    if contract.get("missingSections"):
        inferences.append(
            "Some sections were missing from the Spec: "
            + ", ".join(contract["missingSections"])
        )
    body.append(render_list(inferences, "(none yet)"))
    body.append("")

    body.append("## 4. Interface Contract")
    body.append("Registers extracted from Spec:")
    body.append("")
    body.append(render_registers(contract.get("registers", [])))
    body.append("")

    body.append("## 5. Similar Modules")
    body.append(render_similar(similar))
    body.append("")

    body.append("## 6. Project APIs")
    body.append(render_list(project_apis, "(populate during similar-module review)"))
    body.append("")

    body.append("## 7. Allowed Edit Paths")
    body.append(render_list(allowed_paths, "(set by intake before implementation)"))
    body.append("")

    body.append("## 8. Forbidden Paths")
    body.append(render_list(forbidden_paths, "(default: include/public/**)"))
    body.append("")

    body.append("## 9. Tests")
    body.append("- Narrow build/test command per project conventions")
    body.append("- Add or extend module unit tests before behavior changes")
    body.append("")

    body.append("## 10. Open Questions")
    body.append(render_list(contract.get("openQuestions") or [], "(none)"))
    body.append("")

    text = "\n".join(body)
    estimated = estimate_tokens(text)
    if estimated > token_budget:
        text += (
            "\n\n> WARNING: estimated tokens "
            f"{estimated} exceed budget {token_budget}; trim similar modules.\n"
        )
    return text


def parse_list_arg(value):
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Build a Markdown context pack from contract and similar modules.",
    )
    parser.add_argument("--contract-json", help="Contract JSON string.")
    parser.add_argument("--contract-file", help="Path to contract JSON file.")
    parser.add_argument("--similar-json", help="Similar modules JSON string.")
    parser.add_argument("--similar-file", help="Path to similar modules JSON file.")
    parser.add_argument("--token-budget", type=int, default=12000)
    parser.add_argument("--allowed-paths", default="", help="Comma-separated allowed edit paths.")
    parser.add_argument("--forbidden-paths", default="", help="Comma-separated forbidden paths.")
    parser.add_argument("--project-apis", default="", help="Comma-separated project APIs to reuse.")
    args = parser.parse_args(argv)

    if not (args.contract_json or args.contract_file):
        parser.print_help()
        return 0

    if args.contract_json:
        contract = json.loads(args.contract_json)
    else:
        contract = json.loads(Path(args.contract_file).read_text(encoding="utf-8"))

    if args.similar_json:
        similar = json.loads(args.similar_json)
    elif args.similar_file:
        similar = json.loads(Path(args.similar_file).read_text(encoding="utf-8"))
    else:
        similar = []

    pack = render_pack(
        contract,
        similar,
        args.token_budget,
        parse_list_arg(args.allowed_paths),
        parse_list_arg(args.forbidden_paths),
        parse_list_arg(args.project_apis),
    )
    print(pack)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
