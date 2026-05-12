# 安装指南

本插件建议先通过 GitHub 源码仓库分发，团队试点稳定后再发布为内部 npm 包。完全无 GitHub 网络的内网环境也支持离线分发，详见第 6 节。

## 0. 路径与网络说明（必读）

- **`--target` 不限路径**：可以是任意本地目录，绝对路径（`/path/to/proj`）或相对路径（`../my-sim`）均可。安装脚本只在 `<target>/.opencode/` 下创建/写入文件，不会动 `<target>` 的其他内容。
- **路径前提**：所在磁盘可写、Node 与 Python 已在该机器上可用即可。无需 GitHub 登录，无需 sudo。
- **不要把本仓库自己的 `.opencode/` 当成业务项目**：除非你只是想自测，否则请把 `--target` 指向真正的业务仓库根目录。
- **GitHub 访问**：本仓库是 public 仓库，公司机器只要能访问 `github.com` 就可以匿名 `git clone`、`gh repo clone` 或直接下载 ZIP，不需要 GitHub 账号、SSO 或个人 token。
- **完全无 GitHub 网络**：参见第 6 节「离线分发」。安装后运行时也不再依赖 GitHub。

## 1. 前置依赖

- Node 18+（用于运行 `install.mjs` 和测试）
- Python 3.8+（用于运行确定性脚本）
- OpenCode / Code CLI 已安装

可选：

- 公司内部 OpenCode 插件 SDK，例如 `@opencode-ai/plugin`。本插件以 SDK 兼容形状声明依赖，未安装时仍可本地运行测试。

## 2. GitHub 源码安装（推荐试点）

```bash
# 1. 克隆插件仓库（public 仓库，HTTPS 或 SSH 任选，无需登录）
git clone https://github.com/jixuan-skylake/sim-sdd-superpowers.git
# 或：git clone git@github.com:jixuan-skylake/sim-sdd-superpowers.git
cd sim-sdd-superpowers

# 2. 运行本地验证
npm run verify

# 3. 安装到目标项目（任意本地路径）
node install.mjs --target /absolute/path/to/your-project
# 也支持相对路径，例如：
# node install.mjs --target ../my-sim
```

`--target` 解析为绝对路径后写入 `<target>/.opencode/`，对该路径之外的文件不做任何修改。

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

## 6. 离线 / 内网分发（无法访问 GitHub）

如果团队所在机器完全不能访问 `github.com`，安装与运行本插件仍然可以做到，因为它们**只依赖本地文件 + Node + Python**，安装完成后不会再回连任何外部网络。

### 6.1 一次性下载，多次内网分发

在一台能访问 GitHub 的外部机器（例如个人办公电脑、跳板机、Ops 网关）上执行：

```bash
# 方案 A：git clone 后打 tarball
git clone https://github.com/jixuan-skylake/sim-sdd-superpowers.git
cd sim-sdd-superpowers
git checkout v0.1.0          # 锁定试点版本
cd ..
tar czf sim-sdd-superpowers-v0.1.0.tar.gz sim-sdd-superpowers

# 方案 B：直接下载 ZIP（无需 git）
curl -L -o sim-sdd-superpowers-v0.1.0.zip \
  https://github.com/jixuan-skylake/sim-sdd-superpowers/archive/refs/tags/v0.1.0.zip
```

把得到的 `tar.gz` / `zip` 通过以下任一通道送入内网：

- 内部制品库（Artifactory、Nexus、内部 OSS、内部 npm registry 的 generic repo 等）；
- 跨网共享盘 / NAS；
- 内部 GitLab、Gitea、内部 GitHub Enterprise 仓库镜像；
- 加密 U 盘或部门标准的离线分发流程。

### 6.2 内网机器上安装

```bash
# 解压
tar xzf sim-sdd-superpowers-v0.1.0.tar.gz
# 或：unzip sim-sdd-superpowers-v0.1.0.zip

cd sim-sdd-superpowers

# 自检（仅依赖本机 Node / Python，不联网）
npm run verify

# 安装到任意本地业务项目
node install.mjs --target /path/to/your-sim-project
```

`npm run verify` 与 `node install.mjs` 都不会发起任何对外网络请求。

### 6.3 升级流程

每次有新版本时，重复 6.1 步骤拿到新的 tarball/zip，分发到内网，覆盖旧目录或并存（推荐保留 `vX.Y.Z` 目录名以便回滚），重新跑 `node install.mjs --target ...` 即可。建议业务项目同时提交本次使用的 tag/commit hash 到 README，方便追溯。

### 6.4 运行期是否依赖 GitHub？

不依赖。安装完成后，业务项目运行流程只用到：

- 业务项目本地的 `<target>/.opencode/skills/`；
- 业务项目本地的 `<target>/.opencode/plugins/sim-sdd-superpowers/`；
- 公司 Code CLI / OpenCode 已具备的本地运行环境；
- 本机 Python 3 与 Node 18+。

因此即便业务机器永久断网或仅有内网，使用过程也不受影响。仅升级版本时才需要再次走 6.1 的离线分发流程。

## 7. 卸载

需要回退时，手动删除以下目录与依赖：

- 目录：`/path/to/your-project/.opencode/skills/sim-sdd-*`
- 目录：`/path/to/your-project/.opencode/plugins/sim-sdd-superpowers`
- 依赖：`.opencode/package.json` 中的 `sim-sdd-superpowers` 项

可使用 OS 自带文件管理器或 IDE 删除，避免误删其他 Skill。
