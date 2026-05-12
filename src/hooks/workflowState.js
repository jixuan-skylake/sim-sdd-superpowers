import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const STATE_REL = '.opencode/sim-sdd/state.json';

export async function readState(cwd) {
  try {
    const text = await readFile(join(cwd, STATE_REL), 'utf8');
    return JSON.parse(text);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

export async function writeState(cwd, state) {
  const path = join(cwd, STATE_REL);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(state, null, 2));
}

export function statePath(cwd) {
  return join(cwd, STATE_REL);
}
