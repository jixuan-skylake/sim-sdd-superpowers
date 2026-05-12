# 团队推广计划

## 1. 阶段一：3 人试点（2 周）

- 选 3 个不同子系统：例如 timer、DMA、interrupt controller。
- 每位试点工程师在自己模块上至少跑两次完整流程。
- 收集：模型跳步次数、context pack 漏掉的依赖、误改路径、handoff 是否够用。
- 反馈每周一次集中讨论，转化为 Skill / hook / 脚本改动。

## 2. 阶段二：子系统级推广（4 周）

- 平台团队为 3 个子系统编写项目级 `.opencode/sim-sdd/project.json`：
  - 默认 token 预算
  - 允许修改根目录
  - 禁止修改路径
  - 推荐的测试命令
- 子系统负责人审阅并校准默认值。
- 试点结束后，把曾出错的失败用例沉淀为 `fixtures/`。

## 3. 阶段三：部门级强制（按需）

- 当试点指标稳定（跳步率、误改率显著下降）后：
  - 把 warning 升级为 blocking 的 guardrail 列表交由架构师评审；
  - 把统一的 handoff 模板纳入 PR 模板；
  - 在内部 OpenCode 服务端记录调用次数与失败次数作为审计输入。

## 4. 接收度策略

- 培训：30 分钟例会 + 一份 5 分钟 demo 视频；
- 文档：所有中文文档放在 `docs/`，避免要求工程师阅读英文 `SKILL.md`；
- 演示：使用 `fixtures/tiny-sim` 演示一个完整 Spec→handoff 流程；
- 反馈：保留一个简短 Markdown 表单，避免重型工单流程。

## 5. 风险

- 模型不稳定遵守 Skill：增加 hook 拦截、增加确定性脚本；
- 流程过重：先以 warning 为主，3 个月内最多 2 个 blocking 规则；
- 团队分叉私改 Skill：把 Skill 版本号纳入 Code Review 自动检查。
