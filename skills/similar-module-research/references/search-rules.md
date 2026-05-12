# Similar Module Search Rules

Use this reference when ranking examples from a large C simulation repository.

## Search Keys

- Module name and aliases.
- Register, field, command, interrupt, and event names.
- Lifecycle functions such as reset, init, realize, finalize, destroy.
- Ops structs, callback names, memory region handlers, trace events.
- Test names and golden trace names.

## Ranking

Prefer files that share interfaces and lifecycle shape over files that only
share a directory. Always include why each result matters and what not to copy.

