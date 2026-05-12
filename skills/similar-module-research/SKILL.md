---
name: similar-module-research
description: Use when you must learn how this repository already implements similar modules, registers, or tests before writing new code
---

# similar-module-research

## Usage

Force a structured search of the repository for already-implemented modules and
tests that share interface or lifecycle patterns with the target module.
Run after `extractSpecContract` and before `buildContextPack` or any code edit.

Must call `findSimilarModules` (preferred) or `rg` for:

- Module name, aliases, register names, field names
- Lifecycle: `reset`, `init`, `realize`, `finalize`
- Callback / ops struct / device class / memory region handler
- Trace event names, test names

## Workflow

1. Run `findSimilarModules` with the contract JSON and project root.
2. Read the top 3–5 results in full; record reasons for similarity.
3. For each match, write a one-line note: pattern reused, risk to copy blindly.
4. If 0 matches scored > 0, escalate: do not invent a brand-new structure.
5. Feed the resulting list into `buildContextPack`.

## Stop Conditions

- No similar module exists AND the target spec introduces novel public interfaces.
- Top match scores look unrelated (heuristic only): STOP and ask for guidance.

## Example

```text
Use similar-module-research. Find top 5 similar modules for this context pack.
```

## References

- `references/search-rules.md`
