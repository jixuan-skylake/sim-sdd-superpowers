import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import plugin from '../src/index.js';

describe('plugin export', () => {
  it('exports an async OpenCode plugin factory', async () => {
    assert.equal(typeof plugin, 'function');
    const instance = await plugin({ cwd: process.cwd() });
    assert.ok(instance.tool, 'instance.tool missing');
    assert.ok(instance.hooks, 'instance.hooks missing');
    assert.ok(instance.tool.extractSpecContract, 'extractSpecContract tool missing');
    assert.ok(instance.tool.findSimilarModules, 'findSimilarModules tool missing');
    assert.ok(instance.tool.buildContextPack, 'buildContextPack tool missing');
    assert.equal(typeof instance.tool.extractSpecContract.execute, 'function');
  });

  it('exposes hook handlers for compaction and guardrails', async () => {
    const instance = await plugin({ cwd: process.cwd() });
    assert.equal(typeof instance.hooks['tool.execute.before'], 'function');
    assert.equal(typeof instance.hooks['tool.execute.after'], 'function');
    assert.equal(typeof instance.hooks['experimental.chat.system.transform'], 'function');
    assert.equal(typeof instance.hooks['experimental.session.compacting'], 'function');
  });
});
