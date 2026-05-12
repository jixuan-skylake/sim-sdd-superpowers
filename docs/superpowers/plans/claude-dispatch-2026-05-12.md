# Claude Code Dispatch: SimSDD Superpowers MVP

请在当前工作目录执行：

`/Users/skylake/Documents/Codex/2026-05-12/claudecode-superpowers-ecc-everything-claude-code`

## 目标

根据以下两个文件开发第一版可试用 MVP：

- 设计文档：`docs/superpowers/specs/2026-05-12-sim-sdd-superpowers-design.md`
- 实施计划：`docs/superpowers/plans/2026-05-12-sim-sdd-superpowers-mvp.md`

## 必须遵守

1. 使用 Superpowers / ECC 能力时，按你当前 Claude Code 环境可用工具执行。
2. 优先使用 `superpowers:executing-plans` 或等价流程，按实施计划 task-by-task 执行。
3. 严格 TDD：每个实现任务先写测试，运行看到失败，再写实现，再运行通过。
4. 不要等待我确认每个小步骤；可以持续推进到 MVP 完成。
5. 不要访问公司私有仓库、不要推送 GitHub、不要提交 commit，除非我后续明确要求。
6. 当前目录不是 git 仓库时，不要强行 git commit。
7. 代码实现要尽量 dependency-light：JavaScript ESM + Python 3 标准库 + Node 内置 `node:test`。
8. OpenCode SDK 接口不确定时，先做 SDK-tolerant 的插件形状和兼容层，不要硬依赖内部 SDK 才能跑测试。
9. `skills/*/SKILL.md` 和 `skills/*/references/*.md` 必须使用英文，尤其是 frontmatter `description`、工作流硬约束和停止条件，方便 OpenCode 语义触发并提升弱模型执行稳定性。`README.md`、`docs/*.md`、`docs/mvp-handoff.md` 使用中文，方便团队阅读。保留必要英文接口名、命令名、目录名。
10. 完成后运行 `npm run verify`，如果失败，继续修到通过；如果受环境限制无法通过，明确说明失败原因和已通过项。

## 交付物

请实现实施计划中的 MVP，包括：

- `package.json`
- `README.md`
- `src/index.js`
- `src/tools/*.js`
- `src/hooks/*.js`
- `scripts/*.py`
- `skills/*/SKILL.md`
- `skills/*/references/*.md`
- `templates/*.md`
- `docs/install.md`
- `docs/user-guide.md`
- `docs/maintainer-guide.md`
- `docs/team-rollout.md`
- `docs/opencode-compatibility.md`
- `install.mjs`
- `fixtures/tiny-sim/**`
- `tests/*.test.mjs`
- `docs/mvp-handoff.md`

## 最终回复格式

完成后请输出：

```text
状态：
已创建/修改文件：
运行过的命令：
测试结果：
已知限制：
下一步建议：
```
