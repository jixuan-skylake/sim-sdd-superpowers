# 使用指南

本插件把仿真开发拆成 8 个 Skill，每个 Skill 负责一段确定性流程。模型只需按顺序触发 Skill，确定性脚本和 hook 会负责剩下的拦截、检索、摘要工作。

## 1. 标准流程

```text
1. sim-sdd-intake           确认任务边界
2. spec-to-context-pack     抽取 Spec、检索相似模块、生成 context pack
3. similar-module-research  深入读相似模块（必要时）
4. c-sim-tdd                先补测试，再改代码
5. module-implementation    在 allowed paths 内实现
6. simulation-debugging     失败时进入系统化 debug
7. code-review-c-sim        按芯片仿真清单审查 diff
8. team-handoff             压缩或交接前生成 handoff
```

## 2. 自然语言触发示例

```text
Use sim-sdd-intake for docs/spec/timer_compare.md. Goal: implement compare interrupt behavior.

Use spec-to-context-pack. Build a context pack under 12K tokens and include top 5 similar modules.

Use similar-module-research. Find top 5 similar modules for this context pack.

Use module-implementation with .opencode/sim-sdd/context/timer-compare.md.
Keep edits under src/devices/timer and tests/timer.

Use c-sim-tdd to add coverage for compare-while-disabled behavior before implementation.

Use simulation-debugging for this trace mismatch: make test-timer-compare.

Use code-review-c-sim to review the current diff against .opencode/sim-sdd/context/timer-compare.md.

Use team-handoff before compaction or owner switch.
```

## 3. 手动运行脚本

即便没有 OpenCode 也可以本地试跑：

```bash
# 1) 抽取 Spec 契约
python3 scripts/extract_spec_contract.py fixtures/tiny-sim/specs/timer_compare.md

# 2) 检索相似模块
python3 scripts/find_similar_modules.py \
  --contract-json "$(python3 scripts/extract_spec_contract.py fixtures/tiny-sim/specs/timer_compare.md)" \
  --root fixtures/tiny-sim \
  --max-results 5

# 3) 生成 context pack
python3 scripts/build_context_pack.py \
  --contract-json "$(python3 scripts/extract_spec_contract.py fixtures/tiny-sim/specs/timer_compare.md)" \
  --similar-json "[]" \
  --token-budget 12000
```

## 4. 工作状态文件

插件在项目下维护：

```text
.opencode/sim-sdd/state.json
```

字段：

- `taskId`：本次任务 ID
- `phase`：intake / context / tdd / implementation / debug / review / done
- `specPath`：Spec 路径
- `contextPackPath`：context pack 路径
- `allowedPaths`：允许修改路径数组
- `forbiddenPaths`：禁止修改路径数组
- `lastTestCommand`、`lastTestStatus`：最近一次窄测试结果
- `openRisks`：仍未解决的风险

guardrail hook 会读取这些字段决定是否拦截编辑动作。

## 5. 项目级配置

允许在 `.opencode/sim-sdd/project.json` 覆盖：

```json
{
  "tokenBudgetDefault": 12000,
  "searchRoot": "src",
  "forbiddenPaths": ["include/public/"]
}
```

配置文件不存在时使用插件默认值。

## 6. 运行期网络要求

安装之后的日常使用完全不依赖 GitHub：

- 所有 Skill 都在 `<target>/.opencode/skills/` 下读取；
- 所有 custom tool / hook 都在 `<target>/.opencode/plugins/sim-sdd-superpowers/` 下执行；
- Python 脚本（`scripts/*.py`）只读写本机文件系统；
- 工作状态写入业务项目下的 `.opencode/sim-sdd/state.json`。

只要本机有可用的 Code CLI / OpenCode、Node 18+、Python 3.8+，即便机器永久断网或仅有内网也可以走完整流程。升级到新版本时才需要重新走 `docs/install.md` 第 6 节描述的离线分发流程。

## 7. 推荐用法

- 不要让模型“通读仓库再写代码”。每次新任务都从 `sim-sdd-intake` 开始。
- 不要直接编辑 Skill 文件；项目层面想要差异化时使用 `project.json`。
- handoff 文件统一保存在 `.opencode/sim-sdd/handoff/`，方便 PR 阶段一并提交。
