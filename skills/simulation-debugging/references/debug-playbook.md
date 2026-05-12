# Simulation debugging playbook

## Loop

1. Capture: save full failing command and first error.
2. Classify: compile / link / unit / integration / trace / crash / timing.
3. Locate: identify first divergence (line, cycle, event index).
4. Compare: read the matching region of the closest similar module.
5. Hypothesize: form ONE hypothesis.
6. Change ONE thing.
7. Re-run the narrowest failing command.
8. Update state.

## Failure-class hints

- Compile errors usually point to missing headers or include order changes.
- Trace mismatches near reset usually mean missing or wrong default state.
- IRQ ordering errors often appear when status bits are set after IRQ assert.
- State-machine bugs frequently come from missing default transitions.

## Escalation

If two consecutive hypotheses fail to reproduce or fix, STOP and write a
handoff with the failure class, first divergence, and tried hypotheses.
