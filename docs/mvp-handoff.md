# SimSDD Superpowers MVP 交接

日期：2026-05-12
范围：首版 MVP，已完成可本地试用。

## 1. 已构建的内容

- 八个 Skill（英文 frontmatter 与硬约束）：
  - `sim-sdd-intake`
  - `spec-to-context-pack`
  - `similar-module-research`
  - `c-sim-tdd`
  - `module-implementation`
  - `simulation-debugging`
  - `code-review-c-sim`
  - `team-handoff`
- 三个 custom tool 包装：`extractSpecContract`、`findSimilarModules`、`buildContextPack`。
- 四个 hook 工厂（字符串键，便于 SDK adapter 翻译）：
  - `experimental.chat.system.transform`
  - `experimental.session.compacting`
  - `tool.execute.before`
  - `tool.execute.after`
- 三个确定性 Python 脚本：
  - `scripts/extract_spec_contract.py`
  - `scripts/find_similar_modules.py`
  - `scripts/build_context_pack.py`
- 安装脚本 `install.py` / `install.mjs`，把 Skill 拷贝到 `<target>/.opencode/skills/`，并维护 `.opencode/package.json`。
- 测试夹具 `fixtures/tiny-sim/`，包含 timer 模块 Spec、源码、测试占位。
- 四个 Markdown 模板：context pack、implementation plan、review report、handoff。
- 中文文档：安装、使用、维护、团队推广、OpenCode 兼容性。
- Node `node:test` 套件：package shape、spec contract、context pack pipeline、skill metadata、plugin shape、Node/Python installer，全部绿色。

## 2. 如何安装

```bash
git clone <internal-or-github-url> sim-sdd-superpowers
cd sim-sdd-superpowers
npm run verify
node install.mjs --target /path/to/your-project
# 没有 Node 时：
python3 install.py --target /path/to/your-project
# 已有 .opencode 路径时：
python3 install.py --opencode-dir /path/to/your-project/.opencode
```

详见 `docs/install.md`。

## 3. 如何运行测试

```bash
npm test          # 仅 Node 测试
npm run verify    # 测试 + Python 脚本 --help 冒烟
```

verify 在本机已通过（exit 0）。

## 4. 已知 SDK 兼容性假设

- 假设 OpenCode 插件入口为 `async (context) => ({ tool, hooks })`。
- 假设 hook 名包括 `experimental.chat.system.transform`、`experimental.session.compacting`、`tool.execute.before`、`tool.execute.after`。如果公司 SDK 不同，按 `docs/opencode-compatibility.md` 提供的 adapter 范例改名即可，无需修改核心逻辑。
- custom tool 包装目前返回 `string`（context pack 的 Markdown）或 `string`（JSON 字符串，需上层 `JSON.parse`）。后续如果 SDK 要求结构化返回，可以集中在 `src/tools/*.js` 调整，无需触碰脚本。

## 5. 下一步推荐试点路径

1. **平台团队 1 天内**：完成内部 SDK hook 名映射，更新 `src/index.js` 中的键，并补一条 hook 调用 smoke test。
2. **3 位试点工程师，2 周**：分别在 timer / DMA / interrupt 子系统跑完整流程，记录 Skill 跳步、误改、handoff 不足。
3. **2 周后**：将试点中暴露的失败用例沉淀为 `fixtures/`，并将 guardrail 从 warning 升级为 blocking 时审慎评估。
4. **1 个月后**：评估是否发布到内部 npm，并将 `docs/team-rollout.md` 中的二阶段配置项落地。

## 6. 已知限制

- token budget 估算仅按 `len // 4` 粗略估计，未接公司 tokenizer。
- find_similar_modules 仅扫描 `.c` 与 `.h`，未覆盖头文件以外的 ASM 或 verilog。
- guardrail hook 只在存在 `.opencode/sim-sdd/state.json` 时执行硬阻止，否则降级为 warning，符合 MVP 阶段策略。
- 暂未提供 slash command；用户需要通过自然语言显式调用 Skill。

## 7. 后续待确认

- 内部 OpenCode SDK 完整 hook 列表与 payload 字段。
- 公司是否批准本地语义检索接入。
- 是否需要把 handoff 同步到公司内部审计平台。
