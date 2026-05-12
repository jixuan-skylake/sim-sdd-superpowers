import { extractSpecContract } from './tools/extractSpecContract.js';
import { findSimilarModules } from './tools/findSimilarModules.js';
import { buildContextPack } from './tools/buildContextPack.js';
import { createSystemTransformHook, createCompactionHook } from './hooks/compaction.js';
import { createToolBeforeHook, createToolAfterHook } from './hooks/guardrails.js';

export default async function simSddSuperpowers(context = {}) {
  const cwd = context.cwd ?? process.cwd();
  const systemTransform = createSystemTransformHook();
  const compaction = createCompactionHook({ cwd });
  const toolBefore = createToolBeforeHook({ cwd });
  const toolAfter = createToolAfterHook();

  return {
    name: 'sim-sdd-superpowers',
    version: '0.1.0',
    tool: {
      extractSpecContract,
      findSimilarModules,
      buildContextPack,
    },
    hooks: {
      'experimental.chat.system.transform': systemTransform,
      'experimental.session.compacting': compaction,
      'tool.execute.before': toolBefore,
      'tool.execute.after': toolAfter,
    },
  };
}
