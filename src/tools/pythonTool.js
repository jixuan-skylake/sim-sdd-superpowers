import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

export function scriptPath(relativePath) {
  return resolve(repoRoot, relativePath);
}

export async function runPythonScript(relativePath, args = [], options = {}) {
  const cwd = options.cwd || repoRoot;
  const child = spawn('python3', [scriptPath(relativePath), ...args], {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  const code = await new Promise((resolveCode, reject) => {
    child.on('error', reject);
    child.on('close', resolveCode);
  });

  if (code !== 0) {
    throw new Error(`python3 ${relativePath} failed with ${code}\n${stderr}`);
  }
  return stdout;
}

