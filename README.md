# SimSDD Superpowers

面向 OpenCode / Code CLI 的芯片仿真 SDD 插件包。

核心流程：Spec Markdown → 契约抽取 → 相似模块检索 → context pack → TDD/实现 → 测试 → review → handoff。

首版目标是可本地安装、可试点、可逐步接入公司内部 OpenCode SDK。

## 快速开始

```bash
# 1. 推荐具备 Node 18+ 与 Python 3.8+
node --version
python3 --version

# 2. 运行全部验证
npm run verify

# 3. 安装到目标项目（任意本地路径，绝对/相对均可）
node install.mjs --target /path/to/your/project
```

没有 Node 时，可以只用 Python 安装：

```bash
python3 install.py --target /path/to/your/project

# 如果你手里已经是 .opencode 路径，也可以直接指定：
python3 install.py --opencode-dir 99A_AI_Test/NinA_Module/.opencode
```

> `--target` 可以指向任意本地业务项目目录，安装产物会写入 `<target>/.opencode/`。
> 详见 [安装指南](docs/install.md) 第 0 节：路径要求与离线分发。

## 常见问题

- **安装时是否限定路径？** 不限。`--target` 接受任意绝对或相对路径，安装脚本只在 `<target>/.opencode/` 下写入文件，不会改动目标项目其它内容。
- **机器没有 Node 怎么办？** 使用 `python3 install.py --target <业务项目根目录>`，或 `python3 install.py --opencode-dir <业务项目/.opencode>`。
- **公司不能通过 GitHub 账号下载怎么办？** 本仓库为 **public**，无需 GitHub 账号即可 `git clone` 或下载 ZIP；网络完全无法访问 github.com 时，可在外部机器下载 ZIP/tarball，通过内网制品库、共享盘或代码镜像把整个目录搬入内网，再运行 `python3 install.py`。安装与运行均不依赖 GitHub。

## 目录结构

- `src/`：OpenCode 插件入口、custom tools、hooks 骨架。
- `install.py`：无 Node 环境可用的 Python 安装器。
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
