---
name: team-handoff
description: Use when a C chip-simulation task must be paused, compacted, transferred, or summarized for another engineer or model session
---

# team-handoff

## Usage

Create a compact, reusable engineering handoff. Use this before context
compaction, owner switch, PR review, or when a debugging session pauses.

The handoff must be factual. Separate completed work from guesses and open
risks. Do not claim tests passed unless the exact command and result are known.

## Workflow

1. Read `.opencode/sim-sdd/state.json` if it exists.
2. Read the active context pack path from state or from the user's message.
3. Summarize the task goal, Spec path, context pack path, and changed files.
4. Include tests run, exact commands, and pass/fail status.
5. List unresolved questions and known risks.
6. End with the next recommended action.

## Stop Conditions

- No Spec path and no context pack are known: stop and ask for the task anchor.
- Test status is unknown: write `Tests: not run or not recorded` instead of guessing.
- The task spans multiple modules: split the handoff by module.

## Example

```text
Use team-handoff before compaction or owner switch.
```

## References

- `references/handoff-template.md`
