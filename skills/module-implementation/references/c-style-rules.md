# Module implementation C style rules

## Hard rules

- Edit only inside the context pack's Allowed Edit Paths.
- Never modify forbidden paths or public headers without an explicit signal.
- One behavior slice per change batch.
- Mirror style of the most similar module: naming, indentation, comment density.

## State and ownership

- Every allocated structure must have a clear `init` and `finalize` path.
- Reset behavior must be explicit; default to clearing all writable fields.
- Avoid hidden global state. Pass module pointers explicitly.

## Register handlers

- Reads must be side-effect-free unless the Spec says otherwise.
- Writes must check the writable mask before mutating internal state.
- Status bits that "Write 1 to clear" must reuse the project's helper macro.

## Tests after implementation

- Run only the narrowest test target first.
- Save the exact command and its outcome into `.opencode/sim-sdd/state.json`.
