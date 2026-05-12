import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

describe('context pack pipeline', () => {
  it('finds similar modules and builds a compact context pack', () => {
    const contract = spawnSync('python3', [
      'scripts/extract_spec_contract.py',
      'fixtures/tiny-sim/specs/timer_compare.md'
    ], { encoding: 'utf8' });
    assert.equal(contract.status, 0, contract.stderr);

    const search = spawnSync('python3', [
      'scripts/find_similar_modules.py',
      '--contract-json', contract.stdout,
      '--root', 'fixtures/tiny-sim',
      '--max-results', '3'
    ], { encoding: 'utf8' });
    assert.equal(search.status, 0, search.stderr);
    assert.match(search.stdout, /foo_timer\.c/);

    const pack = spawnSync('python3', [
      'scripts/build_context_pack.py',
      '--contract-json', contract.stdout,
      '--similar-json', search.stdout,
      '--token-budget', '12000'
    ], { encoding: 'utf8' });
    assert.equal(pack.status, 0, pack.stderr);
    assert.match(pack.stdout, /# Context Pack/);
    assert.match(pack.stdout, /timer_compare/);
    assert.match(pack.stdout, /foo_timer\.c/);
    assert.match(pack.stdout, /Explicit Spec Facts/);
    assert.match(pack.stdout, /Inferences/);
  });
});
