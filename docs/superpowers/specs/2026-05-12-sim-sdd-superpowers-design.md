# 面向 OpenCode 的 SimSDD Superpowers 设计文档

日期：2026-05-12

## 1. 目标

SimSDD Superpowers 是一套面向芯片仿真开发的本地 OpenCode 扩展包。它参考 Superpowers 的核心思想：把大模型的工作方式拆成可复用、可触发、可审查的 Skill，而不是只靠一段很长的通用提示词。

它不是复制 Superpowers，而是把这种“技能化工作流”改造成适合你们场景的工程插件：

- C 语言仿真平台，形态类似自研 QEMU；
- 从 Spec 转换出来的 Markdown 文档驱动开发；
- 每个 Markdown 文档通常只描述一个模块或子模块；
- 模型需要参考仓库里已有模块、公共框架、测试和风格；
- 公司内部模型能力相对有限，当前上下文约 200K；
- 部门规模约 100 人，需要统一流程、统一交接、统一审查。

这套插件的主要目标是：**让模型不要直接“读全仓库然后写代码”，而是先抽取 Spec 契约、检索相似模块、构建小型上下文包，再按流程实现、测试、审查和交接。**

## 2. 设计原则

### 2.1 弱模型友好

Minimax 2.7 或 GLM4.7 这类模型不能假设它会稳定遵守复杂长提示词。容易出错的步骤要尽量交给工具和脚本，而不是让模型自由发挥。

核心做法：

- `SKILL.md` 只保留短流程和硬约束；
- 检索、上下文裁剪、日志摘要、测试执行交给确定性脚本；
- hook 负责拦截明显危险的行为；
- 每个任务都落一个可恢复的状态文件。

### 2.2 先事实，后实现

任何模块实现都必须先经过：

1. 读取目标 Spec；
2. 抽取模块契约；
3. 查找相似模块；
4. 构建 context pack；
5. 写实现计划；
6. 再改代码。

模型不能在没有 context pack 的情况下直接开始写 C 代码。

### 2.3 面向团队协作

这不是个人 prompt，而是部门级工程插件。它必须支持：

- 从 GitHub 或内部包安装；
- 项目级版本锁定；
- 每个 Skill 都有使用说明；
- 插件整体有安装、使用、维护说明；
- 能输出适合交接和上下文压缩的摘要；
- 能记录测试命令、失败日志、风险和下一步。

## 3. 已知 OpenCode 扩展能力

根据你从公司模型得到的信息，当前 Code CLI / OpenCode 魔改版支持程度为“中等偏上”，适合采用：

```text
Skills + Plugin Hooks + Custom Tools
```

已知能力：

- 项目级 Skill 路径：`.opencode/skills/`
- 全局级 Skill 路径：通常是 `~/.opencode/skills/`
- Skill 支持递归扫描；
- `SKILL.md` frontmatter 必填 `name` 和 `description`；
- `description` 用于语义匹配触发；
- Skill 可以带 `references/`、`scripts/`、`assets/`；
- 模型不会自动读取这些资源，需要在 `SKILL.md` 里说明何时读取；
- 插件 SDK 为 `@opencode-ai/plugin`；
- 支持 TypeScript / JavaScript 插件；
- 支持 custom tools；
- 支持若干 hook；
- 不支持原生多 agent；
- 可用外部 Python 脚本加 CLI 调用模拟多角色协作；
- 项目插件依赖位置据称是 `.opencode/package.json`。

需要实机确认的点：

- 内部 SDK 的准确 hook 名；
- hook payload 类型；
- 全局 Skill 路径是否一定是 `~/.opencode/skills/`；
- 是否仍支持公开版常见的 `opencode.json`；
- custom tool 能返回结构化 JSON 还是只能返回字符串；
- tool 输出大小限制；
- message transform 大小限制；
- 是否可以稳定模拟 slash command。

## 4. 推荐架构

推荐采用方案 C：

```text
Skills + Plugin Hooks + Custom Tools + Scripts
```

分工如下：

- **Skills**：承载 SDD 流程、C 仿真开发规范、审查清单、调试方法；
- **Plugin Hooks**：注入短系统规则、记录状态、压缩上下文、拦截危险操作；
- **Custom Tools**：提供模型可调用的确定性工具；
- **Scripts**：实现重活，比如 Spec 解析、相似模块检索、测试执行、trace 摘要；
- **Docs**：给团队提供安装说明、使用说明、维护说明和示例。

Skills 解决“模型应该怎么做”的问题；hooks 和 tools 解决“模型不照做怎么办”的问题。

## 5. 插件包目录设计

推荐源码仓库结构：

```text
sim-sdd-superpowers/
  README.md
  package.json
  src/
    index.ts
    hooks/
      guardrails.ts
      contextTransforms.ts
      compaction.ts
      audit.ts
    tools/
      extractSpecContract.ts
      findSimilarModules.ts
      buildContextPack.ts
      runModuleTests.ts
      summarizeTrace.ts
      createHandoff.ts
    policy/
      workflowState.ts
      protectedPaths.ts
      riskRules.ts
  skills/
    sim-sdd-intake/
      SKILL.md
      references/usage.md
    spec-to-context-pack/
      SKILL.md
      references/context-pack-format.md
    similar-module-research/
      SKILL.md
      references/search-rules.md
    c-sim-tdd/
      SKILL.md
      references/test-patterns.md
    module-implementation/
      SKILL.md
      references/c-style-rules.md
    simulation-debugging/
      SKILL.md
      references/debug-playbook.md
    code-review-c-sim/
      SKILL.md
      references/review-checklist.md
    team-handoff/
      SKILL.md
      references/handoff-template.md
  scripts/
    extract_spec_contract.py
    find_similar_modules.py
    build_context_pack.py
    run_module_tests.py
    summarize_trace.py
    detect_public_api_changes.py
  templates/
    context-pack.md
    implementation-plan.md
    review-report.md
    handoff.md
  docs/
    install.md
    user-guide.md
    maintainer-guide.md
    team-rollout.md
    opencode-compatibility.md
```

安装到业务项目后的结构：

```text
target-repo/
  .opencode/
    package.json
    plugins/
      sim-sdd-superpowers/
    skills/
      sim-sdd-intake/
      spec-to-context-pack/
      similar-module-research/
      c-sim-tdd/
      module-implementation/
      simulation-debugging/
      code-review-c-sim/
      team-handoff/
```

## 6. 整体使用说明

### 6.1 标准模块开发流程

用户输入类似：

```text
Use sim-sdd-intake for docs/spec/timer_compare.md. Goal: implement compare interrupt behavior.
```

插件引导模型按下面流程走：

```text
1. sim-sdd-intake：确认任务边界和目标模块；
2. extractSpecContract：从 Markdown Spec 抽取模块契约；
3. similar-module-research：查找相似模块和测试；
4. buildContextPack：构建小型上下文包；
5. module-implementation：基于上下文包写实现计划；
6. c-sim-tdd：补测试或写 trace 验证方案；
7. module-implementation：实现 C 代码；
8. runModuleTests：执行窄范围构建和测试；
9. simulation-debugging：失败时系统化定位；
10. code-review-c-sim：按芯片仿真审查清单 review；
11. team-handoff：输出交接摘要。
```

### 6.2 无 slash command 时的用法

如果公司 Code CLI 不支持自定义 `/命令`，就用自然语言显式调用 Skill：

```text
Use sim-sdd-intake for docs/spec/dma_arbiter.md. Goal: implement channel arbitration.
```

```text
Use spec-to-context-pack. Build a context pack under 12K tokens and include top 5 similar modules.
```

```text
Use module-implementation with .opencode/sim-sdd/context/dma_arbiter.md. Keep edits under src/dma and tests/dma.
```

```text
Use code-review-c-sim to review the current diff against the context pack.
```

### 6.3 如果可以模拟 slash command

如果后续确认 command hook 可以稳定拦截命令，可以提供这些快捷入口：

```text
/sdd-intake docs/spec/timer_compare.md
/sdd-context timer_compare --budget 12000
/sdd-implement .opencode/sim-sdd/context/timer_compare.md
/sdd-test timer_compare
/sdd-review
/sdd-handoff
```

这些命令只是人类入口，底层仍然调用 Skills 和 custom tools。

## 7. Context Pack 设计

context pack 是这套插件的核心。它是给弱模型使用的“最小必要上下文包”，不是越大越好。

建议默认控制在 8K 到 20K tokens，按项目实际情况配置。

标准结构：

```text
# Context Pack

## 1. Task
任务目标、Spec 路径、目标模块。

## 2. Explicit Spec Facts
从 Spec 明确抽取出来的事实。

## 3. Inferences
基于相似模块或项目结构推断出来的内容，必须和事实分开。

## 4. Interface Contract
外部接口、寄存器、字段、命令、事件、中断、回调、状态。

## 5. Similar Modules
相似模块列表，以及每个模块值得复用的模式。

## 6. Project APIs
应该复用的公共 API、宏、helper、trace、test harness。

## 7. Allowed Edit Paths
允许修改的路径。

## 8. Forbidden Paths
禁止或需要人工确认的路径。

## 9. Tests
应该运行的构建、单测、集成测试或 trace 验证命令。

## 10. Open Questions
不能从 Spec 或仓库中确定的问题。
```

硬规则：

- 明确事实和推断必须分开；
- 相似模块必须附带原因；
- 不要塞入大段无关代码；
- 不要让模型自己猜项目约定；
- context pack 生成后才能进入实现阶段。

## 8. Skill 设计

每个 Skill 都必须包含：

- Skill 用途；
- 什么时候触发；
- 需要哪些输入；
- 可以输出什么；
- 必须执行的步骤；
- 需要调用哪些工具或脚本；
- 什么时候必须停止并问人；
- 使用示例；
- 需要时才读取的 reference 文件。

### 8.1 `sim-sdd-intake`

用途：
把用户的自然语言需求整理成一个边界清楚的仿真模块任务。

触发场景：

- 用户要求根据 Spec 实现模块；
- 用户要求修改某个模块行为；
- 用户要求 debug 某个 Spec 对应的功能；
- 用户要求 review 某个模块实现；
- 用户只给了 Markdown Spec，需要模型判断下一步。

必需输入：

- Spec 路径或模块名；
- 任务类型：实现、修改、review、debug、测试、交接；
- 已知目标源码路径，如果用户知道的话。

工作流：

1. 判断任务是否是单模块或单子模块范围；
2. 如果范围过大，拆成多个模块任务；
3. 识别 Spec 路径、模块名、子系统、可能源码路径、可能测试路径；
4. 生成 task card；
5. 要求下一步进入 `spec-to-context-pack`；
6. 禁止直接进入代码实现。

使用示例：

```text
Use sim-sdd-intake for docs/spec/timer_unit.md. Target: implement timer compare behavior.
```

预期输出：

```text
Task: implement timer compare behavior
Spec: docs/spec/timer_unit.md
Likely source: src/devices/timer/
Likely tests: tests/timer/
Required next step: spec-to-context-pack
```

### 8.2 `spec-to-context-pack`

用途：
把 Markdown Spec 转换成适合模型使用的 context pack。

触发场景：

- intake 之后；
- 实现或 review 之前；
- 上下文过大，需要裁剪；
- 模型不知道该读哪些文件。

必须调用的工具：

- `extractSpecContract`
- `findSimilarModules`
- `buildContextPack`

工作流：

1. 调用 `extractSpecContract` 抽取 Spec 契约；
2. 调用 `findSimilarModules` 查找相似模块；
3. 汇总项目 API、公共宏、测试入口；
4. 明确允许修改和禁止修改路径；
5. 调用 `buildContextPack` 生成 context pack；
6. 如果 Spec 有歧义，停止并列出问题。

使用示例：

```text
Use spec-to-context-pack for specs/dma/channel_arbiter.md. Keep it under 12K tokens.
```

停止条件：

- Spec 与已有架构冲突；
- 关键行为缺失；
- 找不到任何相似模块且接口风险较高；
- 目标修改范围跨多个子系统。

### 8.3 `similar-module-research`

用途：
强制模型在写代码之前学习仓库里已有模块的实现方式。

触发场景：

- 新模块实现；
- 给已有模块增加行为；
- review 一个声称参考了现有模块的实现；
- 模型准备新增公共框架或 helper。

必须搜索：

- 模块名和别名；
- 寄存器名、字段名、命令名；
- callback、ops struct、device class、memory region handler；
- reset、init、realize、finalize；
- trace event；
- test 名称；
- 同子系统下相似文件。

检索优先级：

1. `rg` 精确搜索；
2. `ctags` 或 `clangd` 索引；
3. 公司批准的本地语义检索，如果有；
4. 基于接口相似度、实现结构、测试覆盖进行排序。

使用示例：

```text
Use similar-module-research. Find top 5 similar modules for this context pack.
```

预期输出：

```text
Similar modules:
1. src/devices/timer/foo_timer.c - same register dispatch pattern
2. src/devices/dma/bar_chan.c - same channel state transition pattern
3. tests/timer/foo_timer_test.c - relevant reset and compare tests
```

### 8.4 `c-sim-tdd`

用途：
让模型先考虑可验证行为，再写或修改 C 代码。

触发场景：

- 实现 Spec 行为前；
- 修 bug 前；
- 添加回归测试；
- trace 不匹配；
- 修改寄存器、中断、状态机、reset 行为。

工作流：

1. 从 Spec 或 bug 中提取最小可观察行为；
2. 找已有测试模式；
3. 优先补单测、集成测试或 trace golden；
4. 如果不能先写测试，写清楚原因和替代验证方案；
5. 运行最窄范围测试；
6. 保存测试命令和结果。

允许的测试形式：

- 单元测试；
- 集成测试；
- trace 对比；
- golden output；
- compile-only；
- bug reproduction script。

使用示例：

```text
Use c-sim-tdd to add coverage for DMA channel priority arbitration before implementation.
```

停止条件：

- 找不到测试框架时，必须先参考相似模块测试；
- 不能自己凭空引入一套新测试框架。

### 8.5 `module-implementation`

用途：
基于已经批准或生成的 context pack 实现 C 模块行为。

触发场景：

- context pack 已经存在；
- 相似模块已经检索；
- 已经有实现计划；
- 允许修改路径已经明确。

硬约束：

- 没有 context pack 不准实现；
- 不准凭空创造项目风格；
- 不准随意改 public header；
- 不准跨越 allowed paths；
- 不准删除用户已有改动；
- 不准把多个无关模块揉成一次修改。

工作流：

1. 读取 context pack；
2. 写简短实现计划；
3. 明确要改的文件；
4. 一次只实现一个行为切片；
5. 按项目规则格式化；
6. 运行窄测试；
7. 更新 workflow state；
8. 进入 review。

使用示例：

```text
Use module-implementation with .opencode/sim-sdd/context/dma-channel.md.
Keep edits under src/devices/dma and tests/dma.
```

### 8.6 `simulation-debugging`

用途：
系统化 debug 仿真失败，避免模型凭感觉乱改。

触发场景：

- 编译失败；
- 链接失败；
- 单测失败；
- trace mismatch；
- 仿真崩溃；
- 状态机行为不符合预期；
- 中断或事件时序错误。

工作流：

1. 记录完整失败命令；
2. 归类失败类型；
3. 找到第一个错误现象；
4. 和相似工作模块对比；
5. 一次只改一个假设；
6. 重新运行最窄失败命令；
7. 把结论写入 handoff。

使用示例：

```text
Use simulation-debugging for this trace mismatch: make test-timer-compare.
```

预期输出：

```text
Failure class: trace mismatch
First divergence: cycle 124, IRQ asserted before compare status update
Likely area: timer_update_compare()
Next action: inspect similar module foo_timer.c
```

### 8.7 `code-review-c-sim`

用途：
以芯片仿真领域 reviewer 的视角审查当前 diff。

触发场景：

- 实现完成后；
- 提交 PR 前；
- 用户要求 review；
- 测试通过但需要确认风险；
- 修改了寄存器、中断、状态机、reset、公共接口。

审查维度：

- 是否符合 Spec；
- 是否符合相似模块模式；
- C 内存所有权是否清楚；
- init/reset/finalize 生命周期是否正确；
- 状态机转移是否完整；
- register read/write side effect 是否正确；
- interrupt/event 顺序是否正确；
- endian、bitfield、mask 是否正确；
- 并发或重入假设是否安全；
- 测试是否覆盖关键行为；
- 是否出现过宽修改。

使用示例：

```text
Use code-review-c-sim to review the current diff against .opencode/sim-sdd/context/timer.md.
```

输出格式：

```text
Findings
1. [P1] ...
2. [P2] ...

Missing tests
...

Residual risk
...
```

### 8.8 `team-handoff`

用途：
生成可交接、可压缩、可恢复的任务摘要。

触发场景：

- 上下文即将压缩；
- 当前任务暂停；
- 交给其他同事；
- 交给另一个模型会话；
- PR 前需要总结；
- debug 到一半需要记录现场。

handoff 必须包含：

- 任务目标；
- Spec 路径；
- context pack 路径；
- 修改文件；
- 已运行测试；
- 当前状态；
- 未解决问题；
- 已知风险；
- 下一步建议。

使用示例：

```text
Use team-handoff before compaction or owner switch.
```

预期输出：

```text
Status: implementation done, one trace test failing
Spec: docs/spec/dma_arbiter.md
Context pack: .opencode/sim-sdd/context/dma_arbiter.md
Changed files: src/dma/arbiter.c, tests/dma/arbiter_test.c
Tests: make test-dma-arbiter
Risk: reset behavior inferred from similar module, not explicit in Spec
Next: debug IRQ ordering in dma_arbiter_update()
```

## 9. Custom Tools 设计

### 9.1 `extractSpecContract`

输入：

- `specPath`
- 可选 `moduleName`

输出：
Markdown 或 JSON 格式的模块契约。

职责：

- 解析标题、表格、寄存器字段、状态描述、reset 规则、时序描述、示例；
- 标记缺失章节；
- 区分明确事实和模型推断。

### 9.2 `findSimilarModules`

输入：

- contract 文件路径或 contract 内容；
- 搜索根目录；
- 最大结果数。

输出：
相似源码、头文件、测试文件、实现模式的排序列表。

排序信号：

- 寄存器名相似；
- API 调用相似；
- ops struct 相似；
- reset/init/read/write 模式相似；
- 同子系统路径；
- 测试框架相似。

### 9.3 `buildContextPack`

输入：

- Spec contract；
- 相似模块结果；
- token budget；
- allowed paths；
- forbidden paths。

输出：
一个紧凑的 Markdown context pack。

硬要求：
必须把 Spec 明确事实和推断分开。

### 9.4 `runModuleTests`

输入：

- 目标模块；
- 可选测试命令；
- 可选 build profile。

输出：

- 实际执行的命令；
- pass/fail；
- 错误摘要；
- 完整日志路径。

### 9.5 `summarizeTrace`

输入：

- trace log 路径；
- 可选 expected trace 路径；
- 可选重点 signal 名称。

输出：

- 第一处 divergence；
- 附近状态；
- 可能源码区域；
- 下一步检查建议。

### 9.6 `createHandoff`

输入：

- context pack 路径；
- diff 摘要；
- 测试摘要；
- open risks。

输出：
适合人类 reviewer 或新模型会话继续工作的 handoff 文档。

## 10. Plugin Hooks 设计

### 10.1 System Prompt Transform

如果 `experimental.chat.system.transform` 可用，就注入一小段全局规则：

- 没有 context pack 不得实现 Spec；
- 写 C 代码前必须查相似模块；
- 必须尊重 allowed paths 和 forbidden paths；
- 声称完成前必须运行测试或说明无法运行；
- 上下文压缩前必须生成 handoff。

注意：这里不要注入长篇规范。详细规范放在 Skills 和 references 里。

### 10.2 Message Transform

如果 `experimental.chat.messages.transform` 可用，用它附加当前工作状态：

- 当前 Spec；
- 当前 context pack；
- 当前阶段；
- 允许修改路径；
- 必须下一步。

不要自动塞大文件，避免污染上下文。

### 10.3 Tool Execute Before

如果 `tool.execute.before` 可用，用它拦截危险动作：

- 没有 context pack 就大范围改代码；
- 修改 forbidden paths；
- 删除文件；
- 未确认就跑超大规模回归；
- 计划外修改 public header；
- 试图重构多个无关子系统。

### 10.4 Tool Execute After

如果 `tool.execute.after` 可用，用它摘要大型输出：

- 编译错误；
- 测试日志；
- trace 日志；
- 大量 `rg` 结果。

完整日志保存在本地文件，模型上下文只注入摘要。

### 10.5 Session Compacting

如果 `experimental.session.compacting` 可用，把默认压缩替换成结构化工程摘要：

- 当前阶段；
- Spec 路径；
- context pack 路径；
- 修改文件；
- 已运行测试；
- 失败信息；
- 下一步。

## 11. Workflow State

插件维护本地状态文件：

```text
.opencode/sim-sdd/state.json
```

示例：

```json
{
  "taskId": "timer-compare-2026-05-12",
  "phase": "implementation",
  "specPath": "docs/spec/timer.md",
  "contextPackPath": ".opencode/sim-sdd/context/timer-compare.md",
  "allowedPaths": ["src/devices/timer/", "tests/timer/"],
  "forbiddenPaths": ["include/public/"],
  "lastTestCommand": "make test-timer",
  "lastTestStatus": "failed",
  "openRisks": ["IRQ ordering inferred from foo_timer.c"]
}
```

这个文件用于：

- 会话恢复；
- 上下文压缩；
- 交接；
- hook 判断是否允许继续操作；
- 记录测试和风险。

## 12. 安装与分发

### 12.1 GitHub 源码安装

适合早期内部试点。

流程：

1. 团队从 GitHub 下载 `sim-sdd-superpowers`；
2. 项目把它作为 submodule、subtree 或普通目录放到 `.opencode/plugins/sim-sdd-superpowers`；
3. 安装脚本把 skills 复制或链接到 `.opencode/skills/`；
4. `.opencode/package.json` 声明插件依赖；
5. 工程师在项目根目录运行安装脚本。

优点：

- 容易审查；
- 容易在项目内锁版本；
- 适合内部安全审核。

缺点：

- 多项目同步版本需要流程；
- symlink 在不同系统上可能有差异。

### 12.2 内部 npm 包安装

适合 MVP 稳定后。

流程：

1. 发布为内部包，例如 `@company/sim-sdd-superpowers`；
2. 项目的 `.opencode/package.json` 依赖该包；
3. install 脚本安装插件和 skills；
4. 项目锁定包版本。

优点：

- 版本化清晰；
- 升级简单；
- 更适合 100 人团队。

缺点：

- 需要内部 registry；
- 需要包发布流程。

### 12.3 推荐最终形态

采用混合模式：

- GitHub 仓库作为源码和 review 入口；
- 内部 npm 包作为稳定分发方式；
- 项目 pin 版本；
- 平台团队维护兼容性测试；
- 各项目只维护本项目配置，不直接改通用 Skill。

## 13. 团队协作模型

建议职责分工：

- 平台/工具团队：维护插件框架、hooks、custom tools、安装脚本；
- 仿真架构负责人：维护 C 规范、模块生命周期、review checklist；
- 子系统负责人：维护本子系统搜索路径、测试命令、protected paths；
- 普通工程师：使用插件，不直接魔改共享 Skill；
- 试点负责人：收集团队反馈，决定哪些 guardrail 从 warning 升级为 blocking。

团队级规则：

- Skill 和工具必须版本化；
- 项目配置可以覆盖路径、测试命令、token budget；
- 不允许每个人复制一份私改 Skill 后长期分叉；
- handoff 格式统一；
- review 输出格式统一；
- 重要失败案例沉淀为 fixture 或 reference。

## 14. Guardrail 策略

第一阶段以 warning 为主，避免影响团队接受度：

- 没有 context pack 就实现：warning；
- 没有相似模块检索：warning；
- 声称完成但没有测试：warning；
- 修改 public header：warning 或 require confirmation；
- 删除文件：blocking；
- 修改 forbidden paths：blocking；
- 跨多个子系统大改：blocking 或 require confirmation。

团队稳定使用后，可以升级严格模式：

- 无 Spec 不得进入实现；
- 无 context pack 不得进入实现；
- 无测试或验证说明不得完成；
- 无 handoff 不得压缩或交接；
- protected architecture paths 必须人工确认。

## 15. MVP 范围

首版 MVP 必须交付：

### 15.1 Skills

- `sim-sdd-intake`
- `spec-to-context-pack`
- `similar-module-research`
- `c-sim-tdd`
- `module-implementation`
- `simulation-debugging`
- `code-review-c-sim`
- `team-handoff`

### 15.2 Custom Tools

- `extractSpecContract`
- `findSimilarModules`
- `buildContextPack`

### 15.3 Hooks

- system prompt transform；
- tool execute before；
- tool execute after；
- session compacting。

### 15.4 文档

- 安装说明；
- 总体使用说明；
- 每个 Skill 的使用说明；
- 维护者说明；
- 团队试点说明；
- 至少 3 个模块任务示例。

暂缓到 v2：

- 多角色辩论 wrapper；
- 语义向量检索；
- clangd 深度符号图；
- dashboard 或 Web UI；
- 自动创建 PR；
- 完整 policy-as-code 引擎。

## 16. 测试策略

插件本身要有 fixture 仓库：

```text
fixtures/
  tiny-sim/
    specs/
    src/
    tests/
  medium-sim/
    specs/
    src/
    tests/
```

自动化测试覆盖：

- Skill metadata 校验；
- `extractSpecContract` 能处理标题、表格、缺失章节；
- `findSimilarModules` 能在 fixture 中排出正确相似模块；
- `buildContextPack` 不超过 token budget；
- guardrail hook 能拦截 forbidden paths；
- compaction 能生成可用 handoff；
- 一个完整 fixture 任务能从 Spec 走到 context pack 和 review。

人工试点：

- 选择 3 个真实模块；
- 找 3 位工程师使用；
- 对比插件流程和当前人工流程；
- 记录模型跳步、幻觉、误改、测试缺口；
- 把问题转化为 hook、tool 或 Skill 更新。

## 17. 风险与应对

### 17.1 弱模型不稳定遵守流程

应对：
把关键步骤放进 tools 和 hooks。`SKILL.md` 保持短、硬、明确。

### 17.2 Context pack 漏掉必要代码

应对：
context pack 生成工具加入 missing dependency 检查；允许模型请求补充上下文，但必须说明原因。

### 17.3 流程太重影响效率

应对：
MVP 先 warning，少 blocking；只强制最关键节点；提供快捷入口。

### 17.4 内部 OpenCode hook 与公开文档不同

应对：
实现前先写兼容性探针，读取 SDK 类型和可用事件名，不凭公开文档硬写。

### 17.5 团队各自私改 Skill

应对：
共享 Skill 版本化；项目只覆盖配置，不直接复制分叉；重要修改走 review。

## 18. 需要继续确认的问题

实现计划开始前需要确认：

1. 内部 SDK 精确 hook 名和 payload 类型；
2. 全局 Skill 路径到底是什么；
3. custom tool 能否返回结构化 JSON；
4. tool 输出和 message transform 的大小限制；
5. 是否有公司批准的本地语义检索服务；
6. MVP 第一批支持哪些构建系统和测试框架；
7. 哪些路径属于 protected architecture paths；
8. 团队希望 handoff 用 Markdown、JSON，还是两者都要；
9. 是否允许插件安装脚本创建 symlink；
10. 是否需要审计日志进入公司内部平台。

## 19. 验收标准

这套设计成功的标准：

- 工程师可以从 GitHub 或内部包安装插件；
- 插件有总体使用说明；
- 每个 Skill 都有单独使用说明；
- 模型能把模块 Spec 转成 context pack；
- 写代码前能找到相似模块；
- 实现阶段受 allowed paths 限制；
- 测试命令和日志能被摘要；
- 上下文压缩或交接时能生成 handoff；
- Minimax 2.7 和 GLM4.7 这类较弱模型也能稳定走完主流程；
- 试点工程师认为它减少了乱读代码、乱改代码和交接不清的问题。

