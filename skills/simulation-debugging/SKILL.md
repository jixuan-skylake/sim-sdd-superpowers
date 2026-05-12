---
name: simulation-debugging
description: Use when a simulation build, unit test, integration test, or trace comparison fails and you must root-cause it without random edits
---

# simulation-debugging

## Usage

Run a disciplined debugging loop for a single failure. Never patch symptoms by
guessing. Compare against the closest known-working similar module from the
context pack.

## Workflow

1. Capture the exact failing command and full first error.
2. Classify the failure: compile, link, unit test, integration test, trace
   mismatch, simulation crash, state-machine misorder, IRQ/event timing.
3. Identify the first divergence point (line, cycle, or event index).
4. Read the matching region of the closest similar module.
5. Form ONE hypothesis. Change ONE thing.
6. Re-run the narrowest failing command.
7. Record outcome and update `.opencode/sim-sdd/state.json`.
8. Hand off via `team-handoff` if blocked > 1 iteration.

## Stop Conditions

- Two hypotheses fail in a row: STOP and request human review.
- The root cause appears to be outside the allowed paths: STOP, escalate.

## Example

```text
Use simulation-debugging for this trace mismatch: make test-timer-compare.
```

Expected output:

```text
Failure class: trace mismatch
First divergence: cycle 124, IRQ asserted before compare status update
Likely area: timer_update_compare()
Next action: inspect similar module foo_timer.c
```

## References

- `references/debug-playbook.md`
