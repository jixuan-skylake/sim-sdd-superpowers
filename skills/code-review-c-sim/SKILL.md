---
name: code-review-c-sim
description: Use when a SimSDD implementation is complete or under PR review and you must audit the diff against the active context pack
---

# code-review-c-sim

## Usage

Review the current diff with a chip-simulation reviewer mindset. Compare every
non-trivial change against the context pack's "Interface Contract" and the top
similar module.

Review dimensions:

- Spec conformance
- Similar-module pattern consistency
- C memory ownership and lifetime
- init / reset / realize / finalize correctness
- State-machine transition completeness
- Register read/write side effects
- Interrupt / event ordering
- Endian / bitfield / mask handling
- Concurrency or reentrancy assumptions
- Test coverage of the critical behavior
- Scope creep into unrelated files

## Workflow

1. Load the context pack and the current diff.
2. For each changed file, list deltas vs. the most similar module.
3. Mark each finding P0/P1/P2 with one-line justification.
4. Note missing tests.
5. Note residual risks.
6. Emit a structured Findings / Missing tests / Residual risk report.

## Stop Conditions

- Diff modifies files outside the allowed paths: STOP, mark P0 and escalate.
- A P0 finding remains unresolved: do NOT mark the task complete.

## Example

```text
Use code-review-c-sim to review the current diff against .opencode/sim-sdd/context/timer.md.
```

Output format:

```text
Findings
1. [P1] ...

Missing tests
- ...

Residual risk
- ...
```

## References

- `references/review-checklist.md`
