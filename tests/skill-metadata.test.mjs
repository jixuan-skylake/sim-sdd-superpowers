import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const requiredSkills = [
  'sim-sdd-intake',
  'spec-to-context-pack',
  'similar-module-research',
  'c-sim-tdd',
  'module-implementation',
  'simulation-debugging',
  'code-review-c-sim',
  'team-handoff'
];

function frontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(match, 'missing YAML frontmatter');
  return match[1];
}

describe('skill metadata', () => {
  it('provides all MVP skills with name and description', async () => {
    const dirs = await readdir('skills');
    for (const skill of requiredSkills) {
      assert.ok(dirs.includes(skill), `missing skill directory: ${skill}`);
    }
    for (const skill of requiredSkills) {
      const text = await readFile(join('skills', skill, 'SKILL.md'), 'utf8');
      const yaml = frontmatter(text);
      assert.match(yaml, new RegExp(`name:\\s*${skill}`));
      assert.match(yaml, /description:\s*Use when/);
      assert.match(text, /## Usage/);
      assert.match(text, /## Workflow/);
      assert.match(text, /## Stop Conditions/);
    }
  });

  it('skills reference a corresponding reference file', async () => {
    for (const skill of requiredSkills) {
      const refs = await readdir(join('skills', skill, 'references'));
      assert.ok(refs.length >= 1, `skill ${skill} must include at least one reference`);
    }
  });
});
