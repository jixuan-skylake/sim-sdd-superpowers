import { runPythonScript } from './pythonTool.js';

export const buildContextPack = {
  description: 'Build a compact Markdown context pack from a contract and similar-module search results.',
  args: {
    contractJson: 'Contract JSON string.',
    similarJson: 'Similar module JSON string.',
    tokenBudget: 'Approximate token budget.',
    allowedPaths: 'Comma-separated allowed paths.',
    forbiddenPaths: 'Comma-separated forbidden paths.'
  },
  async execute(args = {}, context = {}) {
    if (!args.contractJson) {
      throw new Error('buildContextPack requires contractJson');
    }
    if (!args.similarJson) {
      throw new Error('buildContextPack requires similarJson');
    }
    const scriptArgs = [
      '--contract-json',
      args.contractJson,
      '--similar-json',
      args.similarJson,
      '--token-budget',
      String(args.tokenBudget || 12000)
    ];
    if (args.allowedPaths) {
      scriptArgs.push('--allowed-paths', args.allowedPaths);
    }
    if (args.forbiddenPaths) {
      scriptArgs.push('--forbidden-paths', args.forbiddenPaths);
    }
    return await runPythonScript('scripts/build_context_pack.py', scriptArgs, {
      cwd: context.cwd
    });
  }
};

