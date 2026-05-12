# sim-sdd-intake Reference

Use this reference when the request is vague or spans more than one module.

## Task Card Format

```text
Task:
Spec:
Module:
Likely source:
Likely tests:
Allowed next skill:
Blocked questions:
```

## Scope Rules

- One Markdown Spec should map to one module or submodule task.
- If a request crosses modules, split it before context-pack work.
- If the user only gives a module name, search for the nearest Spec first.
- Do not infer implementation files without listing why each path is likely.

