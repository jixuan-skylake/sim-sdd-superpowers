import { runPythonScript } from './pythonTool.js';

export const extractSpecContract = {
  description: 'Extract a compact C simulation module contract from a Markdown Spec.',
  args: {
    specPath: 'Path to the Markdown Spec.',
    moduleName: 'Optional module name override.'
  },
  async execute(args = {}, context = {}) {
    if (!args.specPath) {
      throw new Error('extractSpecContract requires specPath');
    }
    const scriptArgs = [args.specPath];
    if (args.moduleName) {
      scriptArgs.push('--module-name', args.moduleName);
    }
    return await runPythonScript('scripts/extract_spec_contract.py', scriptArgs, {
      cwd: context.cwd
    });
  }
};

