# 维护者指南

本指南面向平台/工具团队，负责长期维护 SimSDD Superpowers。

## 1. 仓库结构速览

- `src/`：JavaScript 入口、custom tools、hooks。
- `scripts/`：所有确定性 Python 脚本。
- `skills/`：八个 Skill 与 references。
- `templates/`：context pack / implementation plan / review / handoff 模板。
- `fixtures/tiny-sim/`：用于自测和示范。
- `docs/`：所有中文文档。
- `tests/`：Node 内建 `node:test`。
- `install.py` / `install.mjs`：分别用于 Python-only 安装与 Node 安装。

## 2. 开发流程

1. 修改前在 `tests/` 增加或更新覆盖。
2. 运行 `npm test` 红色，再改实现，再绿色。
3. Skill 文本变动必须同步更新对应 `references/*.md`。
4. 改变 Python 脚本 CLI 时同步更新：
   - `src/tools/*.js` 包装
   - `tests/*.test.mjs` 断言
   - `docs/user-guide.md` 中的示例。
5. 提交前运行 `npm run verify`。

## 3. 升级 Skill

- 仍然要求 frontmatter `name` / `description` 为英文。
- `description` 必须以 `Use when` 开头（语义触发约定）。
- 三段必备 Markdown 标题：`## Usage`、`## Workflow`、`## Stop Conditions`。
- 任何新增 Skill 都必须更新 `tests/skill-metadata.test.mjs` 的 `requiredSkills` 列表。

## 4. 升级脚本

- 所有脚本必须支持 `--help` 而不报错，因为 `npm run verify` 会调用 `--help` 作为冒烟测试。
- 不允许引入第三方 Python 依赖。
- 输出必须可被 `JSON.parse` 或被视作纯 Markdown。

## 5. Hook 改造

- guardrail hook 必须只在有 `.opencode/sim-sdd/state.json` 时执行硬阻止，否则降级为 warning。
- compaction hook 输出 ≤ 2KB，避免抢占新会话上下文。
- 所有 hook 都必须导出工厂函数（`createXxxHook`），便于测试时显式注入 `cwd`。

## 6. 发布节奏建议

- 0.x：内部 alpha，3 个试点项目；
- 0.y：稳定后发布到内部 npm；
- 1.0：补齐 OpenCode SDK 完整 hook 名映射并冻结。

## 7. 已知坑

- macOS 上 `cp -R` 与 `node:fs/promises` 的 `cp` 行为略有差异，Node 安装脚本依赖后者；无 Node 环境优先使用 `install.py`；
- Python 3.9 的 `argparse` 在某些 stdlib 版本上对 `--help` 的退出码为 0，已经覆盖在 verify 中。
- OpenCode SDK 的 hook 名以 `experimental.` 开头时可能在不同版本有差异，src/index.js 已写成字符串键以便后续映射。
