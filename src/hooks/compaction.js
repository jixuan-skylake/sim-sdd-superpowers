import { readState } from './workflowState.js';

export function createSystemTransformHook() {
  return async function systemTransform(input = {}) {
    const rules = [
      'You must NOT implement Spec behavior without a context pack.',
      'You must look up similar modules before writing new C code.',
      'You must respect allowedPaths and forbiddenPaths recorded by SimSDD.',
      'You must run a narrow test (or document why not) before claiming a task done.',
      'You must produce a handoff before context compaction.',
    ];
    const block = `\n\nSimSDD operating rules:\n- ${rules.join('\n- ')}\n`;
    if (typeof input.system === 'string') {
      return { system: input.system + block };
    }
    return { system: block };
  };
}

export function createCompactionHook({ cwd = process.cwd() } = {}) {
  return async function compaction(input = {}) {
    const state = await readState(cwd);
    if (!state) {
      return { summary: 'No SimSDD state yet — nothing to compact deterministically.' };
    }
    const lines = [
      '# SimSDD Handoff Summary',
      `Task: ${state.taskId ?? '(unknown)'}`,
      `Phase: ${state.phase ?? '(unknown)'}`,
      `Spec: ${state.specPath ?? '(none)'}`,
      `Context pack: ${state.contextPackPath ?? '(none)'}`,
      `Allowed paths: ${(state.allowedPaths ?? []).join(', ') || '(none)'}`,
      `Forbidden paths: ${(state.forbiddenPaths ?? []).join(', ') || '(none)'}`,
      `Last test: ${state.lastTestCommand ?? '(none)'} → ${state.lastTestStatus ?? '(unknown)'}`,
      `Open risks: ${(state.openRisks ?? []).join('; ') || '(none)'}`,
    ];
    return { summary: lines.join('\n') };
  };
}
