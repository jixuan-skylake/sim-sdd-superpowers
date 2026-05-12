# OpenCode 兼容性说明

本插件的目标是在公司内部 OpenCode/Code CLI 上落地。下列内容描述了当前 MVP 对 SDK 的假设，以及在不同 SDK 版本下的兼容策略。

## 1. SDK 接口假设

```ts
type PluginFactory = (context: { cwd?: string }) => Promise<{
  name: string;
  version: string;
  tool: Record<string, Tool>;
  hooks: Record<string, HookFn>;
}>;
```

具体未确认点：

- hook 名是否仍为 `experimental.chat.system.transform` 等；
- tool.execute.before / tool.execute.after 的 payload 字段名；
- session.compacting 是否提供原会话摘要；
- custom tool 是否支持返回结构化 JSON，本插件以字符串/对象兼容形式返回。

## 2. SDK-tolerant 设计

- `src/index.js` 仅导出工厂函数和字符串键 hooks，未直接 import 任何 SDK 类型；
- tool wrapper 中的 `args` 字段提供 description 文本，不假设特定 schema 库；
- 任何 hook 返回结构都是简单 plain object，便于后续 adapter 翻译；
- Python 脚本不依赖 OpenCode SDK，可独立调用，方便在不同 CLI 中复用。

## 3. 推荐适配方式

如内部 SDK 的 hook 名为 `tool.before` 而非 `tool.execute.before`：

```js
// .opencode/plugins/sim-sdd-superpowers/adapter.js
import plugin from 'sim-sdd-superpowers';

export default async function adapter(ctx) {
  const original = await plugin(ctx);
  return {
    ...original,
    hooks: {
      'tool.before': original.hooks['tool.execute.before'],
      'tool.after': original.hooks['tool.execute.after'],
      'chat.system.transform': original.hooks['experimental.chat.system.transform'],
      'session.compacting': original.hooks['experimental.session.compacting']
    }
  };
}
```

## 4. 已知差异点

- macOS 与 Linux 上 spawn Python 子进程时 stdio 行为一致，但内网容器内可能没有 `python3`，需要在 `package.json` 的 verify 步骤前提供 `python3` 符号链接。
- 部分 OpenCode 版本不支持 `experimental.session.compacting`，此时 compaction 仍可以通过 `team-handoff` Skill 手动触发。

## 5. 待回归

- 等公司模型确认 SDK 完整事件清单后，更新 `src/index.js` 的 hook 名映射并补充测试。
- 等模型确认 tool args schema 是否要使用 zod 等库后，统一升级 tool 包装。
