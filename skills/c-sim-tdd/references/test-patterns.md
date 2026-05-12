# C simulation test patterns reference

## Why this exists

Many C simulation bugs are caused by writing code first, then trying to test
later. This Skill encourages adding the narrowest reproducible test before any
implementation work.

## Preferred test types

- Pure unit test that exercises a single register read / write path.
- State-machine test that drives the module across reset and one operation.
- Trace golden comparison for cycle-accurate behavior.
- Compile-only check for newly added headers or struct sizes.

## How to choose

1. If the closest similar module has unit tests, mirror them.
2. If the closest similar module uses trace golden, mirror that.
3. If neither exists, document the limitation in the context pack and
   fall back to a compile-only check.

## Anti-patterns

- Adding ad-hoc `printf` and calling that a test.
- Introducing a brand-new test framework just for this module.
- Writing the implementation first and "back-filling" tests.
