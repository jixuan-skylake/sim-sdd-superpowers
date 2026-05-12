import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

describe('extract_spec_contract.py', () => {
  it('extracts module identity, registers, reset, and interrupts', () => {
    const result = spawnSync('python3', [
      'scripts/extract_spec_contract.py',
      'fixtures/tiny-sim/specs/timer_compare.md'
    ], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const contract = JSON.parse(result.stdout);
    assert.equal(contract.module, 'timer_compare');
    assert.deepEqual(contract.registers.map((r) => r.name), ['CTRL', 'CMP', 'STATUS']);
    assert.match(contract.reset.join('\n'), /CMP resets to 0/);
    assert.match(contract.interrupts.join('\n'), /IRQ_COMPARE/);
  });

  it('allows module name override for tool wrappers', () => {
    const result = spawnSync('python3', [
      'scripts/extract_spec_contract.py',
      'fixtures/tiny-sim/specs/timer_compare.md',
      '--module-name',
      'timer_override'
    ], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const contract = JSON.parse(result.stdout);
    assert.equal(contract.module, 'timer_override');
  });
});
