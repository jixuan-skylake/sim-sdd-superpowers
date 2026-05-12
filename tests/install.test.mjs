import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, access, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

describe('installer', () => {
  it('copies skills and plugin runtime into target .opencode', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'sim-sdd-install-'));
    try {
      const result = spawnSync('node', ['install.mjs', '--target', dir], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr || result.stdout);
      await access(join(dir, '.opencode', 'skills', 'sim-sdd-intake', 'SKILL.md'));
      await access(join(dir, '.opencode', 'skills', 'team-handoff', 'SKILL.md'));
      await access(join(dir, '.opencode', 'plugins', 'sim-sdd-superpowers', 'src', 'index.js'));
      await access(join(dir, '.opencode', 'plugins', 'sim-sdd-superpowers', 'scripts', 'build_context_pack.py'));
      const pkg = JSON.parse(await readFile(join(dir, '.opencode', 'package.json'), 'utf8'));
      assert.ok(pkg.dependencies, '.opencode/package.json should declare plugin dependency');
      assert.equal(pkg.dependencies['sim-sdd-superpowers'], 'file:.opencode/plugins/sim-sdd-superpowers');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
