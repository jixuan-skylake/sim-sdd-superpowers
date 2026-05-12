---
name: spec-to-context-pack
description: Use when a SimSDD task has been intaked and you must turn a Markdown Spec into a compact context pack before implementation
---

# spec-to-context-pack

## Usage

Convert the active Spec into a minimum necessary context pack. The context pack
is the only artifact downstream skills may consume. NEVER write production C
code without a context pack.

Required tools:

- `extractSpecContract` (custom tool, wraps `scripts/extract_spec_contract.py`)
- `findSimilarModules` (custom tool, wraps `scripts/find_similar_modules.py`)
- `buildContextPack` (custom tool, wraps `scripts/build_context_pack.py`)

## Workflow

1. Call `extractSpecContract` with the Spec path.
2. Call `findSimilarModules` with the contract JSON and the project root.
3. Inspect the top similar modules; if all are weakly scored, STOP and flag.
4. Call `buildContextPack` with contract JSON, similar JSON, and the project's
   token budget (default 12000).
5. Save the resulting Markdown to `.opencode/sim-sdd/context/<module>.md`.
6. Require `module-implementation` or `c-sim-tdd` as the next Skill.

## Stop Conditions

- Spec lacks an Overview or Registers section AND no similar module exists.
- The context pack exceeds the budget after pruning similar modules.
- Spec contradicts a similar module in critical interface fields.

## Example

```text
Use spec-to-context-pack for fixtures/tiny-sim/specs/timer_compare.md. Keep it under 12K tokens.
```

## References

- `references/context-pack-format.md`
