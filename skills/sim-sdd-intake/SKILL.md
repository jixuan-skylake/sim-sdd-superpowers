---
name: sim-sdd-intake
description: Use when a user asks to implement, review, debug, test, or plan a C chip-simulation module from a Markdown Spec
---

# sim-sdd-intake

## Usage

Convert a free-form user request that references a Markdown Spec into a bounded
single-module task card. Always the first Skill in the SimSDD flow. NEVER skip
this Skill and jump directly to implementation.

Required inputs:

- Spec path or module name
- Task type: implement, modify, review, debug, test, handoff
- Optional: known source path

## Workflow

1. Confirm the Spec path exists and points to a single module or submodule.
2. If the request spans multiple modules, split into one task per module and stop.
3. Identify likely source directory and likely test directory.
4. Emit a task card with: Task, Spec, Likely source, Likely tests, Required next step.
5. Require `spec-to-context-pack` as the next Skill.
6. Write the task into `.opencode/sim-sdd/state.json` if the plugin runtime is available.

## Stop Conditions

- Spec is missing or empty: STOP and ask the user.
- Request covers more than one module: STOP, propose a split.
- Task type is unclear: STOP and ask.

## Example

```text
Use sim-sdd-intake for docs/spec/timer_unit.md. Target: implement timer compare behavior.
```

Expected output:

```text
Task: implement timer compare behavior
Spec: docs/spec/timer_unit.md
Likely source: src/devices/timer/
Likely tests: tests/timer/
Required next step: spec-to-context-pack
```

## References

- `references/usage.md`
