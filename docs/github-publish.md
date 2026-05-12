# GitHub 发布与团队安装指南

## 1. 推荐发布方式

先创建一个公司内部可见的 GitHub 仓库，例如：

```text
git@github.com:<org>/sim-sdd-superpowers.git
```

仓库建议设为 private 或 internal。首批试点不要直接发布到公网 npm。

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
git tag v0.1.0
git push origin v0.1.0
```

业务项目可以记录使用的插件 tag，方便回滚。

## 4. 团队成员安装

```bash
git clone git@github.com:<org>/sim-sdd-superpowers.git
cd sim-sdd-superpowers
npm run verify
node install.mjs --target /path/to/company-sim-project
```

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
node install.mjs --target /path/to/company-sim-project
```

再在业务项目中提交 `.opencode/` 变更。

