#!/usr/bin/env node
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = { target: process.cwd() };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--target') {
      args.target = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

async function readJsonIfExists(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return fallback;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const target = resolve(args.target);
  const opencodeDir = join(target, '.opencode');
  const skillsDir = join(opencodeDir, 'skills');
  const pluginsDir = join(opencodeDir, 'plugins', 'sim-sdd-superpowers');
  const packagePath = join(opencodeDir, 'package.json');

  await mkdir(skillsDir, { recursive: true });
  await mkdir(pluginsDir, { recursive: true });
  await cp(join(root, 'skills'), skillsDir, { recursive: true, force: true });
  await cp(join(root, 'src'), join(pluginsDir, 'src'), { recursive: true, force: true });
  await cp(join(root, 'scripts'), join(pluginsDir, 'scripts'), { recursive: true, force: true });
  await cp(join(root, 'templates'), join(pluginsDir, 'templates'), { recursive: true, force: true });
  await cp(join(root, 'package.json'), join(pluginsDir, 'package.json'), { force: true });
  await cp(join(root, 'README.md'), join(pluginsDir, 'README.md'), { force: true });
  await cp(join(root, 'install.mjs'), join(pluginsDir, 'install.mjs'), { force: true });
  await cp(join(root, 'install.py'), join(pluginsDir, 'install.py'), { force: true });

  const pkg = await readJsonIfExists(packagePath, {
    private: true,
    dependencies: {}
  });
  pkg.private = true;
  pkg.dependencies = pkg.dependencies || {};
  pkg.dependencies['sim-sdd-superpowers'] = 'file:.opencode/plugins/sim-sdd-superpowers';
  await writeFile(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);

  console.log(`Installed SimSDD plugin into ${pluginsDir}`);
  console.log(`Installed SimSDD skills into ${skillsDir}`);
  console.log('Installed skills: sim-sdd-intake, spec-to-context-pack, similar-module-research, c-sim-tdd, module-implementation, simulation-debugging, code-review-c-sim, team-handoff');
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
