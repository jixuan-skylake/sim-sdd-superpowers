---
name: module-implementation
description: Use when an approved context pack exists and you must implement or modify a C simulation module while staying inside allowed paths
---

# module-implementation

## Usage

Implement module behavior strictly inside the allowed paths declared by the
context pack. NEVER edit forbidden paths, public headers, or unrelated
subsystems in the same change.

Hard rules:

- No context pack → REFUSE to implement.
- No similar-module research → REFUSE to implement.
- One behavior slice per edit batch.
- Respect project style; do not invent new conventions.
- Do not delete unrelated user edits.

## Workflow

1. Read the context pack referenced by `.opencode/sim-sdd/state.json`.
2. Produce a short implementation plan: files to change, new symbols, tests.
3. Implement one behavior slice.
4. Format and lint per project rules.
5. Run the narrowest test or build target.
6. Update `lastTestCommand` and `lastTestStatus` in state.
7. Hand control to `code-review-c-sim`.

## Stop Conditions

- Context pack missing or stale: STOP, run `spec-to-context-pack` again.
- Required change crosses subsystem boundaries: STOP, escalate.
- Tests are missing AND `c-sim-tdd` was not run: STOP.
- Public header would need to change: STOP and require human confirmation.

## Example

```text
Use module-implementation with .opencode/sim-sdd/context/dma_arbiter.md.
Keep edits under src/devices/dma and tests/dma.
```

## References

- `references/c-style-rules.md`
