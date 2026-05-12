import { runPythonScript } from './pythonTool.js';

export const findSimilarModules = {
  description: 'Rank similar C simulation source, header, and test files for a module contract.',
  args: {
    contractJson: 'Contract JSON string.',
    contractFile: 'Optional path to a contract JSON file.',
    root: 'Repository search root.',
    maxResults: 'Maximum result count.'
  },
  async execute(args = {}, context = {}) {
    const scriptArgs = [];
    if (args.contractJson) {
      scriptArgs.push('--contract-json', args.contractJson);
    }
    if (args.contractFile) {
      scriptArgs.push('--contract-file', args.contractFile);
    }
    scriptArgs.push('--root', args.root || '.');
    scriptArgs.push('--max-results', String(args.maxResults || 5));
    return await runPythonScript('scripts/find_similar_modules.py', scriptArgs, {
      cwd: context.cwd
    });
  }
};

