# SimSDD Superpowers MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a locally installable OpenCode plugin package for chip-simulation SDD workflows, including Skills, deterministic scripts, plugin tools, guardrail hooks, docs, and fixture tests.

**Architecture:** Keep the MVP dependency-light and runnable outside the company environment. Use plain JavaScript for the plugin entry and Node built-in `node:test` for tests. Use Python scripts for deterministic repository analysis so weak models call tools instead of improvising.

**Tech Stack:** OpenCode plugin SDK compatibility layer, JavaScript ESM, Python 3 standard library, Node `node:test`, Markdown Skills.

---

## File Structure

- Create `package.json`: npm metadata, scripts, and plugin entry.
- Create `README.md`: short Chinese overview and quick start.
- Create `src/index.js`: OpenCode plugin entry that registers tools and hooks.
- Create `src/tools/*.js`: JavaScript tool wrappers that call Python scripts.
- Create `src/hooks/*.js`: workflow state, guardrail, output-summary, and compaction hooks.
- Create `scripts/*.py`: deterministic Spec extraction, similar-module search, context pack generation, test-log summarization, and handoff generation.
- Create `skills/*/SKILL.md`: eight OpenCode skills written in English for reliable model triggering and execution.
- Create `skills/*/references/*.md`: detailed English references loaded only when needed.
- Create `templates/*.md`: context pack, implementation plan, review report, handoff templates.
- Create `docs/*.md`: install guide, user guide, maintainer guide, team rollout, compatibility notes.
- Create `fixtures/tiny-sim/**`: small fake C simulation repository for tests.
- Create `tests/*.test.mjs`: tests for scripts, skill metadata, and plugin export shape.
- Create `install.mjs`: installer that copies skills into a target `.opencode/skills` and writes example `.opencode/package.json`.

## Task 1: Initialize Package and Test Harness

**Files:**
- Create: `package.json`
- Create: `README.md`
- Create: `tests/package-shape.test.mjs`

- [ ] **Step 1: Write failing package shape test**

Create `tests/package-shape.test.mjs`:

```js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

describe('package metadata', () => {
  it('declares an ESM OpenCode-compatible plugin package', async () => {
    const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
    assert.equal(pkg.name, 'sim-sdd-superpowers');
    assert.equal(pkg.type, 'module');
    assert.equal(pkg.main, 'src/index.js');
    assert.equal(pkg.scripts.test, 'node --test tests/*.test.mjs');
  });
});
```

- [ ] **Step 2: Run test and verify it fails**

Run: `npm test`

Expected: fails because `package.json` does not exist.

- [ ] **Step 3: Create package metadata**

Create `package.json`:

```json
{
  "name": "sim-sdd-superpowers",
  "version": "0.1.0",
  "description": "OpenCode Skills and plugin tools for C chip-simulation SDD workflows.",
  "type": "module",
  "main": "src/index.js",
  "bin": {
    "sim-sdd-install": "./install.mjs"
  },
  "scripts": {
    "test": "node --test tests/*.test.mjs",
    "lint:skills": "node tests/skill-metadata.test.mjs",
    "verify": "npm test && python3 scripts/extract_spec_contract.py --help && python3 scripts/find_similar_modules.py --help && python3 scripts/build_context_pack.py --help"
  },
  "keywords": ["opencode", "skills", "chip-simulation", "sdd"],
  "license": "UNLICENSED",
  "peerDependencies": {
    "@opencode-ai/plugin": ">=1.2.0"
  },
  "peerDependenciesMeta": {
    "@opencode-ai/plugin": {
      "optional": true
    }
  }
}
```

- [ ] **Step 4: Create README**

Create `README.md` with Chinese quick start:

```md
# SimSDD Superpowers

面向 OpenCode / Code CLI 的芯片仿真 SDD 插件包。

核心流程：Spec Markdown -> 契约抽取 -> 相似模块检索 -> context pack -> TDD/实现 -> 测试 -> review -> handoff。

首版目标是可本地安装、可试点、可逐步接入公司内部 OpenCode SDK。
```

- [ ] **Step 5: Run test and verify it passes**

Run: `npm test`

Expected: package shape test passes.

## Task 2: Add Fixture Repository and Spec Contract Script

**Files:**
- Create: `fixtures/tiny-sim/specs/timer_compare.md`
- Create: `fixtures/tiny-sim/src/timer/foo_timer.c`
- Create: `fixtures/tiny-sim/tests/timer/foo_timer_test.c`
- Create: `scripts/extract_spec_contract.py`
- Create: `tests/spec-contract.test.mjs`

- [ ] **Step 1: Write failing test for contract extraction**

Create `tests/spec-contract.test.mjs`:

```js
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
});
```

- [ ] **Step 2: Run test and verify it fails**

Run: `npm test`

Expected: fails because fixture and script do not exist.

- [ ] **Step 3: Create tiny simulation fixture**

Create `fixtures/tiny-sim/specs/timer_compare.md`:

```md
# timer_compare

## Overview

The timer_compare module raises IRQ_COMPARE when COUNT reaches CMP and CTRL.EN is set.

## Registers

| Name | Offset | Description |
| --- | --- | --- |
| CTRL | 0x00 | Bit 0 EN enables compare. |
| CMP | 0x04 | Compare value. CMP resets to 0. |
| STATUS | 0x08 | Bit 0 MATCH is set when compare fires. Write 1 to clear. |

## Reset

CMP resets to 0. CTRL.EN resets to 0. STATUS.MATCH resets to 0.

## Interrupts

IRQ_COMPARE is asserted after STATUS.MATCH is set.
```

Create `fixtures/tiny-sim/src/timer/foo_timer.c`:

```c
typedef struct FooTimer {
    unsigned ctrl;
    unsigned cmp;
    unsigned status;
} FooTimer;

void foo_timer_reset(FooTimer *s) {
    s->ctrl = 0;
    s->cmp = 0;
    s->status = 0;
}
```

Create `fixtures/tiny-sim/tests/timer/foo_timer_test.c`:

```c
/* Fixture only: shows timer reset test naming and file placement. */
```

- [ ] **Step 4: Implement minimal contract extractor**

Create `scripts/extract_spec_contract.py`:

```python
#!/usr/bin/env python3
import argparse
import json
import re
from pathlib import Path

def extract_table_registers(text):
    registers = []
    for line in text.splitlines():
        if not line.startswith("|") or "---" in line or "Name" in line:
            continue
        cells = [cell.strip() for cell in line.strip("|").split("|")]
        if len(cells) >= 3 and re.match(r"^[A-Z][A-Z0-9_]*$", cells[0]):
            registers.append({"name": cells[0], "offset": cells[1], "description": cells[2]})
    return registers

def section_lines(text, heading):
    pattern = re.compile(rf"^##\\s+{re.escape(heading)}\\s*$", re.MULTILINE)
    match = pattern.search(text)
    if not match:
        return []
    rest = text[match.end():]
    next_heading = re.search(r"^##\\s+", rest, re.MULTILINE)
    body = rest[:next_heading.start()] if next_heading else rest
    return [line.strip() for line in body.splitlines() if line.strip()]

def main():
    parser = argparse.ArgumentParser(description="Extract a compact simulation module contract from Markdown Spec.")
    parser.add_argument("spec_path", nargs="?")
    args = parser.parse_args()
    if not args.spec_path:
        parser.print_help()
        return 0
    path = Path(args.spec_path)
    text = path.read_text(encoding="utf-8")
    title = next((line[2:].strip() for line in text.splitlines() if line.startswith("# ")), path.stem)
    contract = {
        "module": title,
        "specPath": str(path),
        "overview": section_lines(text, "Overview"),
        "registers": extract_table_registers(text),
        "reset": section_lines(text, "Reset"),
        "interrupts": section_lines(text, "Interrupts"),
        "openQuestions": []
    }
    print(json.dumps(contract, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
```

- [ ] **Step 5: Run test and verify it passes**

Run: `npm test`

Expected: package and contract tests pass.

## Task 3: Add Similar Module Search and Context Pack Scripts

**Files:**
- Create: `scripts/find_similar_modules.py`
- Create: `scripts/build_context_pack.py`
- Create: `tests/context-pack.test.mjs`

- [ ] **Step 1: Write failing test for search and context pack**

Create `tests/context-pack.test.mjs`:

```js
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
    assert.match(search.stdout, /foo_timer.c/);

    const pack = spawnSync('python3', [
      'scripts/build_context_pack.py',
      '--contract-json', contract.stdout,
      '--similar-json', search.stdout,
      '--token-budget', '12000'
    ], { encoding: 'utf8' });
    assert.equal(pack.status, 0, pack.stderr);
    assert.match(pack.stdout, /# Context Pack/);
    assert.match(pack.stdout, /timer_compare/);
    assert.match(pack.stdout, /foo_timer.c/);
  });
});
```

- [ ] **Step 2: Run test and verify it fails**

Run: `npm test`

Expected: fails because scripts do not exist.

- [ ] **Step 3: Implement similar module search**

Create `scripts/find_similar_modules.py` with:

- argparse options `--contract-json`, `--root`, `--max-results`;
- JSON parsing from `--contract-json`;
- recursive scan for `.c` and `.h`;
- score by module tokens and register names;
- JSON output array with `path`, `score`, `reasons`.

- [ ] **Step 4: Implement context pack builder**

Create `scripts/build_context_pack.py` with:

- argparse options `--contract-json`, `--similar-json`, `--token-budget`;
- Markdown output with sections from the design doc;
- include explicit facts separately from inferences;
- include similar modules and reasons.

- [ ] **Step 5: Run test and verify it passes**

Run: `npm test`

Expected: package, contract, and context-pack tests pass.

## Task 4: Add Skills and Skill Metadata Tests

**Files:**
- Create: `skills/*/SKILL.md`
- Create: `skills/*/references/*.md`
- Create: `tests/skill-metadata.test.mjs`

- [ ] **Step 1: Write failing test for skill metadata**

Create `tests/skill-metadata.test.mjs`:

```js
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
    assert.deepEqual(requiredSkills.every((skill) => dirs.includes(skill)), true);
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
});
```

- [ ] **Step 2: Run test and verify it fails**

Run: `npm test`

Expected: fails because skills do not exist.

- [ ] **Step 3: Create all eight Skill files**

For each required skill, create a concise English `SKILL.md` using this structure. Keep `description` in English because OpenCode uses it for semantic triggering:

```md
---
name: sim-sdd-intake
description: Use when a user asks to implement, review, debug, test, or plan a C chip-simulation module from a Markdown Spec
---

# sim-sdd-intake

## Usage

...

## Workflow

...

## Stop Conditions

...
```

Each skill must include a concrete usage example and a note about which references to read. Human-facing Chinese explanations belong in `docs/user-guide.md`, not in `SKILL.md`.

- [ ] **Step 4: Add reference files**

Create one `references/*.md` file per skill with deeper English guidance. Keep each reference focused and under 150 lines.

- [ ] **Step 5: Run test and verify it passes**

Run: `npm test`

Expected: skill metadata test passes.

## Task 5: Add Plugin Entry, Tool Wrappers, and Hook Skeletons

**Files:**
- Create: `src/index.js`
- Create: `src/tools/pythonTool.js`
- Create: `src/tools/extractSpecContract.js`
- Create: `src/tools/findSimilarModules.js`
- Create: `src/tools/buildContextPack.js`
- Create: `src/hooks/workflowState.js`
- Create: `src/hooks/guardrails.js`
- Create: `src/hooks/outputSummary.js`
- Create: `src/hooks/compaction.js`
- Create: `tests/plugin-shape.test.mjs`

- [ ] **Step 1: Write failing plugin shape test**

Create `tests/plugin-shape.test.mjs`:

```js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import plugin from '../src/index.js';

describe('plugin export', () => {
  it('exports an async OpenCode plugin factory', async () => {
    assert.equal(typeof plugin, 'function');
    const instance = await plugin({ cwd: process.cwd() });
    assert.ok(instance.tool);
    assert.ok(instance.hooks);
    assert.ok(instance.tool.extractSpecContract);
    assert.ok(instance.tool.findSimilarModules);
    assert.ok(instance.tool.buildContextPack);
  });
});
```

- [ ] **Step 2: Run test and verify it fails**

Run: `npm test`

Expected: fails because plugin files do not exist.

- [ ] **Step 3: Implement SDK-tolerant plugin shape**

Create `src/index.js` as an async factory returning:

```js
{
  tool: {
    extractSpecContract,
    findSimilarModules,
    buildContextPack
  },
  hooks: {
    'experimental.chat.system.transform': systemTransformHook,
    'tool.execute.before': toolBeforeHook,
    'tool.execute.after': toolAfterHook,
    'experimental.session.compacting': compactionHook
  }
}
```

Keep hooks plain functions so internal SDK adaptation can wrap them later.

- [ ] **Step 4: Implement Python tool wrapper**

Create `src/tools/pythonTool.js` with `runPythonScript(script, args)` using `child_process.spawn`.

- [ ] **Step 5: Implement three tool wrappers**

Each wrapper exposes:

```js
{
  description: '...',
  args: { ... },
  async execute(args, context) {
    return await runPythonScript('scripts/name.py', [...]);
  }
}
```

- [ ] **Step 6: Implement hook skeletons**

Hooks should:

- inject short system rules;
- warn/block obvious forbidden path edits from `.opencode/sim-sdd/state.json`;
- summarize long tool output by line count;
- produce compact handoff text from state.

- [ ] **Step 7: Run test and verify it passes**

Run: `npm test`

Expected: plugin shape test passes.

## Task 6: Add Installer and User Documentation

**Files:**
- Create: `install.mjs`
- Create: `docs/install.md`
- Create: `docs/user-guide.md`
- Create: `docs/maintainer-guide.md`
- Create: `docs/team-rollout.md`
- Create: `docs/opencode-compatibility.md`
- Create: `tests/install.test.mjs`

- [ ] **Step 1: Write failing installer test**

Create `tests/install.test.mjs`:

```js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

describe('installer', () => {
  it('copies skills into target .opencode/skills', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'sim-sdd-install-'));
    try {
      const result = spawnSync('node', ['install.mjs', '--target', dir], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      await access(join(dir, '.opencode', 'skills', 'sim-sdd-intake', 'SKILL.md'));
      await access(join(dir, '.opencode', 'package.json'));
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
```

- [ ] **Step 2: Run test and verify it fails**

Run: `npm test`

Expected: fails because installer does not exist.

- [ ] **Step 3: Implement installer**

Create `install.mjs` that:

- accepts `--target <path>`;
- creates `<target>/.opencode/skills`;
- recursively copies local `skills/*`;
- writes `<target>/.opencode/package.json` if missing;
- prints installed skill names.

- [ ] **Step 4: Add Chinese docs**

Docs must explain:

- GitHub source install;
- internal npm install;
- how to invoke each Skill, with Chinese explanation and English command examples;
- how to run scripts manually;
- how to configure project-specific paths;
- how to verify installation.

- [ ] **Step 5: Run test and verify it passes**

Run: `npm test`

Expected: installer test passes.

## Task 7: Final Verification and Handoff

**Files:**
- Modify: `README.md`
- Create: `templates/context-pack.md`
- Create: `templates/implementation-plan.md`
- Create: `templates/review-report.md`
- Create: `templates/handoff.md`

- [ ] **Step 1: Add templates**

Create four Markdown templates matching the design doc sections.

- [ ] **Step 2: Run full verification**

Run:

```bash
npm run verify
```

Expected:

- all Node tests pass;
- Python script `--help` commands succeed;
- no missing skill metadata.

- [ ] **Step 3: Create handoff summary**

Create `docs/mvp-handoff.md` with:

- what was built;
- how to install;
- how to run tests;
- known SDK compatibility assumptions;
- next recommended pilot steps.

- [ ] **Step 4: Report changed files and verification result**

Final output must include:

- files created;
- commands run;
- test status;
- known limitations;
- internal OpenCode SDK points still requiring validation.
