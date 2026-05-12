# GitHub 发布与团队安装指南

> 当前 MVP 仓库：`https://github.com/jixuan-skylake/sim-sdd-superpowers`，visibility = **public**。
>
> public 仓库无需 GitHub 账号即可匿名 clone 或下载，下文也覆盖完全无 GitHub 网络的离线分发方案。

## 1. 推荐发布方式

可选三种方式，按团队网络条件挑选：

1. **public GitHub 仓库（当前 MVP）**：任何能访问 `github.com` 的机器匿名即可 clone / 下载 ZIP，无需登录。
2. **公司内部 GitHub / GitLab 镜像**：在 internal 主机上镜像本仓库，团队从内部主机克隆。
3. **离线压缩包**：在外网机器导出 tarball/zip，通过制品库或共享盘送入完全无 GitHub 的内网。

首批试点不直接发布到公网 npm。

## 2. 首次上传

在本插件目录运行：

```bash
git init
git add .
git commit -m "feat: add sim-sdd superpowers mvp"
git branch -M main
git remote add origin git@github.com:<org>/sim-sdd-superpowers.git
git push -u origin main
```

如果 GitHub 上仓库还没创建，可以先创建空仓库，再执行上面的命令。

## 3. 打版本标签

建议每次给团队试点版本打 tag：

```bash
git tag v0.1.1
git push origin v0.1.1
```

业务项目可以记录使用的插件 tag，方便回滚。

## 4. 团队成员安装

### 4.1 能直接访问 github.com（推荐，无需 GitHub 账号）

```bash
# HTTPS 匿名 clone（不需要 GitHub 登录）
git clone https://github.com/jixuan-skylake/sim-sdd-superpowers.git
cd sim-sdd-superpowers
npm run verify
node install.mjs --target /path/to/company-sim-project
```

没有 Node 的机器可跳过 `npm run verify`，改用 Python 安装器：

```bash
python3 install.py --target /path/to/company-sim-project
# 或直接写入现有 .opencode 目录：
python3 install.py --opencode-dir 99A_AI_Test/NinA_Module/.opencode
```

`--target` 接受任意本地路径（绝对或相对均可），安装产物只写入 `<target>/.opencode/`。
`--opencode-dir` 接受最终 `.opencode` 目录，不会追加嵌套 `.opencode`。

### 4.2 完全无法访问 github.com（离线分发）

外部机器一次性下载：

```bash
# 方案 A：git clone 后打 tarball
git clone https://github.com/jixuan-skylake/sim-sdd-superpowers.git
cd sim-sdd-superpowers && git checkout v0.1.1 && cd ..
tar czf sim-sdd-superpowers-v0.1.1.tar.gz sim-sdd-superpowers

# 方案 B：直接拉 ZIP（不需要 git）
curl -L -o sim-sdd-superpowers-v0.1.1.zip \
  https://github.com/jixuan-skylake/sim-sdd-superpowers/archive/refs/tags/v0.1.1.zip
```

把得到的压缩包通过下列任一通道送入内网：

- 内部制品库（Artifactory / Nexus / 内部 OSS / 内部 npm registry 的 generic repo 等）；
- 跨网共享盘 / NAS；
- 内部 GitLab、Gitea、GitHub Enterprise 仓库镜像；
- 加密 U 盘或部门标准离线分发流程。

内网机器：

```bash
tar xzf sim-sdd-superpowers-v0.1.1.tar.gz   # 或 unzip ZIP
cd sim-sdd-superpowers
npm run verify                              # 可选，需要 Node；不联网
python3 install.py --target /path/to/your-sim-project
```

详细步骤见 `docs/install.md` 第 6 节。

### 4.3 运行期网络要求

安装完成后，业务项目运行 SimSDD 流程不再依赖 GitHub，所有逻辑都跑在 `<target>/.opencode/skills/` 与 `<target>/.opencode/plugins/sim-sdd-superpowers/` 之下，外加本机的 Code CLI / OpenCode 与 Python 运行时。Node 只在运行 `npm run verify` 或 Node 安装器时需要。即便业务机器永久断网也能正常使用。

安装后进入业务项目，启动公司 Code CLI / OpenCode，并输入：

```text
Use sim-sdd-intake for docs/spec/example.md. Goal: identify the module implementation task.
```

## 5. 业务项目提交

试点阶段建议业务项目提交安装结果：

```bash
git add .opencode/package.json .opencode/skills .opencode/plugins/sim-sdd-superpowers
git commit -m "chore: install sim-sdd superpowers"
```

这样同一个项目里的工程师不需要各自猜安装路径。

## 6. 后续升级

```bash
cd sim-sdd-superpowers
git fetch --tags
git checkout v0.1.1
npm run verify
python3 install.py --target /path/to/company-sim-project
```

再在业务项目中提交 `.opencode/` 变更。
