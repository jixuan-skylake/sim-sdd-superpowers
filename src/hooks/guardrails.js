import { readState } from './workflowState.js';

const DANGEROUS_TOOLS = new Set(['edit', 'write', 'delete', 'patch', 'shell']);

function pathLooksForbidden(targetPath, forbidden) {
  if (!targetPath || !forbidden) return false;
  return forbidden.some((rule) => targetPath.startsWith(rule));
}

function pathLooksAllowed(targetPath, allowed) {
  if (!allowed || allowed.length === 0) return true;
  return allowed.some((rule) => targetPath.startsWith(rule));
}

export function createToolBeforeHook({ cwd = process.cwd() } = {}) {
  return async function toolBefore(input = {}) {
    const tool = (input.tool || input.name || '').toLowerCase();
    if (!DANGEROUS_TOOLS.has(tool)) return { proceed: true };

    const state = await readState(cwd);
    if (!state) {
      return {
        proceed: true,
        warnings: ['No SimSDD state.json yet. Consider running sim-sdd-intake first.'],
      };
    }

    const target = input.args?.path || input.args?.file || input.args?.target;
    const warnings = [];
    const blocks = [];

    if (state.forbiddenPaths && pathLooksForbidden(target, state.forbiddenPaths)) {
      blocks.push(`Edit blocked: ${target} is in forbiddenPaths.`);
    }
    if (state.allowedPaths && target && !pathLooksAllowed(target, state.allowedPaths)) {
      warnings.push(`Edit outside allowedPaths: ${target}. Confirm before proceeding.`);
    }
    if (!state.contextPackPath && !['delete'].includes(tool)) {
      warnings.push('No context pack recorded yet. Run spec-to-context-pack before broad edits.');
    }

    return {
      proceed: blocks.length === 0,
      warnings,
      blocks,
    };
  };
}

export function createToolAfterHook() {
  const LINE_BUDGET = 200;
  return async function toolAfter(output = {}) {
    const text = typeof output.result === 'string' ? output.result : output.stdout;
    if (typeof text !== 'string') return output;
    const lines = text.split('\n');
    if (lines.length <= LINE_BUDGET) return output;
    const head = lines.slice(0, 80).join('\n');
    const tail = lines.slice(-40).join('\n');
    const summary = `(truncated: ${lines.length} lines; showing first 80 and last 40)`;
    return {
      ...output,
      summary,
      result: `${head}\n\n${summary}\n\n${tail}`,
    };
  };
}
