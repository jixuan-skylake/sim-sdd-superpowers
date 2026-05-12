---
name: c-sim-tdd
description: Use when you must write or extend a C chip-simulation test before implementing or modifying module behavior
---

# c-sim-tdd

## Usage

Enforce test-first thinking for C simulation modules. Always add or extend a
narrow test before changing module behavior. If no test framework exists for
the target area, mirror the closest similar module's test style — do NOT invent
a new framework.

## Workflow

1. Read the context pack's "Interface Contract" and "Tests" sections.
2. Identify the smallest observable behavior to test.
3. Find an existing test that exercises the closest similar module.
4. Write or extend a unit test, integration test, or trace comparison.
5. Run only the narrowest test target. Capture the exact command.
6. Confirm the test is failing for the right reason before implementation.

Allowed test forms:

- Unit test
- Integration test
- Trace comparison or golden output
- Compile-only check
- Bug reproduction script (must be reproducible)

## Stop Conditions

- No similar test exists anywhere AND no test framework is configured: STOP,
  ask for guidance.
- Behavior cannot be observed (e.g., side-effect only on hardware): document
  the verification strategy and flag risk.

## Example

```text
Use c-sim-tdd to add coverage for DMA channel priority arbitration before implementation.
```

## References

- `references/test-patterns.md`
