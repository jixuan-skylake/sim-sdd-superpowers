# 安装指南

本插件建议先通过 GitHub 源码仓库分发，团队试点稳定后再发布为内部 npm 包。

## 1. 前置依赖

- Node 18+（用于运行 `install.mjs` 和测试）
- Python 3.8+（用于运行确定性脚本）
- OpenCode / Code CLI 已安装

可选：

- 公司内部 OpenCode 插件 SDK，例如 `@opencode-ai/plugin`。本插件以 SDK 兼容形状声明依赖，未安装时仍可本地运行测试。

## 2. GitHub 源码安装（推荐试点）

```bash
# 1. 克隆插件仓库
git clone git@github.com:<org>/sim-sdd-superpowers.git
cd sim-sdd-superpowers

# 2. 运行本地验证
npm run verify

# 3. 安装到目标项目
node install.mjs --target /path/to/your-project
```

安装脚本会做：

1. 在目标项目下创建 `.opencode/skills/`；
2. 把所有 Skill 目录递归拷贝到 `.opencode/skills/`；
3. 把插件运行时代码复制到 `.opencode/plugins/sim-sdd-superpowers/`；
4. 在 `.opencode/package.json` 中声明 `sim-sdd-superpowers` 依赖（`file:` 协议指向 `.opencode/plugins/sim-sdd-superpowers`）。

安装后目标项目结构应包含：

```text
/path/to/your-project/.opencode/
  package.json
  skills/
    sim-sdd-intake/
    spec-to-context-pack/
    similar-module-research/
    c-sim-tdd/
    module-implementation/
    simulation-debugging/
    code-review-c-sim/
    team-handoff/
  plugins/
    sim-sdd-superpowers/
      package.json
      src/
      scripts/
      templates/
```

## 3. 内部 npm 安装（v2 推荐）

```bash
cd /path/to/your-project/.opencode
npm install @company/sim-sdd-superpowers
```

仓库已经把 `@opencode-ai/plugin` 声明为 optional peerDependency，因此即便内部 SDK 名称不同，也可以通过 `npm install --legacy-peer-deps` 或在 `.opencode/package.json` 中显式 override 解决。

## 4. 验证安装

```bash
ls /path/to/your-project/.opencode/skills
# 期望看到：
# sim-sdd-intake
# spec-to-context-pack
# similar-module-research
# c-sim-tdd
# module-implementation
# simulation-debugging
# code-review-c-sim
# team-handoff
```

启动 OpenCode 后，在会话中输入：

```text
Use sim-sdd-intake for fixtures/tiny-sim/specs/timer_compare.md. Target: implement compare interrupt behavior.
```

如能触发 `sim-sdd-intake` 流程，说明安装成功。

## 5. 项目内提交建议

建议把以下内容提交进业务项目仓库，保证团队成员一致：

- `.opencode/package.json`
- `.opencode/skills/**`
- `.opencode/plugins/sim-sdd-superpowers/**`

如果团队希望业务项目不保存插件源码，也可以只提交 `.opencode/package.json` 和 `.opencode/skills/**`，再让每位工程师本地运行安装脚本。但试点阶段更推荐提交完整 `.opencode/` 结果，方便复现。

## 6. 卸载

需要回退时，手动删除以下目录与依赖：

- 目录：`/path/to/your-project/.opencode/skills/sim-sdd-*`
- 目录：`/path/to/your-project/.opencode/plugins/sim-sdd-superpowers`
- 依赖：`.opencode/package.json` 中的 `sim-sdd-superpowers` 项

可使用 OS 自带文件管理器或 IDE 删除，避免误删其他 Skill。
