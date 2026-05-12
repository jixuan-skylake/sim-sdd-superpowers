# SimSDD Superpowers

面向 OpenCode / Code CLI 的芯片仿真 SDD 插件包。

核心流程：Spec Markdown → 契约抽取 → 相似模块检索 → context pack → TDD/实现 → 测试 → review → handoff。

首版目标是可本地安装、可试点、可逐步接入公司内部 OpenCode SDK。

## 快速开始

```bash
# 1. 仅需 Node 18+ 与 Python 3.8+，无第三方依赖
node --version
python3 --version

# 2. 运行全部验证
npm run verify

# 3. 安装到目标项目
node install.mjs --target /path/to/your/project
```

## 目录结构

- `src/`：OpenCode 插件入口、custom tools、hooks 骨架。
- `scripts/`：Spec 契约抽取、相似模块检索、context pack、trace 摘要、handoff 等确定性 Python 脚本。
- `skills/`：八个面向弱模型友好的 Skill（英文 frontmatter 与硬约束）。
- `templates/`：context pack / implementation plan / review report / handoff 模板。
- `fixtures/tiny-sim/`：用于自测的小型仿真仓库。
- `docs/`：中文使用、安装、维护、团队推广说明。
- `tests/`：Node 内建 `node:test` 测试。

## 文档入口

- [安装指南](docs/install.md)
- [GitHub 发布与团队安装指南](docs/github-publish.md)
- [使用指南](docs/user-guide.md)
- [维护者指南](docs/maintainer-guide.md)
- [团队推广](docs/team-rollout.md)
- [OpenCode 兼容性](docs/opencode-compatibility.md)
- [MVP 交接](docs/mvp-handoff.md)

## 设计与计划原文

- [设计文档](docs/superpowers/specs/2026-05-12-sim-sdd-superpowers-design.md)
- [实施计划](docs/superpowers/plans/2026-05-12-sim-sdd-superpowers-mvp.md)
