# Handoff template reference

## Required fields

- Task
- Spec
- Context pack path
- Phase
- Changed files
- Last test command
- Last test status
- Open questions
- Known risks
- Next step recommendation

## Layout

```
# Handoff <taskId>

Task: <verb> <module behavior>
Spec: <path>
Context pack: <path>
Phase: intake | context | tdd | implementation | debug | review | done
Changed files:
- <path>
Tests:
- last command: <cmd>
- last status: <pass|fail|skipped>
Open questions:
- <question>
Risks:
- <risk>
Next:
- <one or two sentences>
```

## Stop conditions

- More than 10 changed files: split per subsystem.
- No state file: ask user to confirm the active task.
