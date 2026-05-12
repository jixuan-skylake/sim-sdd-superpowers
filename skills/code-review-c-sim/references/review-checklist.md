# Code review checklist for C simulation modules

## Spec conformance

- Every register listed in the Spec is implemented.
- Every reset rule from the Spec is applied during `reset`.
- Every interrupt described in the Spec is asserted and cleared.

## Similar-module consistency

- Naming and file layout match the most similar module unless a deviation is
  justified inline.
- Trace events follow the existing prefix scheme.

## C safety

- All allocations have matched frees in the realize/finalize pair.
- All pointer parameters are validated where the project usually validates.
- No unchecked array indexing.

## Tests

- Behavior added in this change is covered by at least one narrow test.
- Failing tests reproduce the bug rather than only the patch.

## Scope

- No edits outside Allowed Edit Paths.
- No drive-by refactors of unrelated files.
- Public headers untouched unless explicitly cleared.
