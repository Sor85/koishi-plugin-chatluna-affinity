# koishi-plugin-chatluna-affinity

为 ChatLuna Character 提供「综合好感度」「关系」「工具」等一整套 Affinity 能力。

## 特性速览

1. **综合好感度模型**：采用「系数 × 长期好感」的复合结果，短期情绪仅作为分析输入。
2. **延迟分析**：在 `chatluna-character` 输出完成后收集 Bot 的多段回复，再启动模型分析，确保上下文与回复一致。
3. **互动系数继承**：记录每日 increase/decrease，满足“连续互动且 increase > decrease”或“长时间未互动/负向占优”时，按天数累积提升或衰减系数。
4. **自定义关系链**：提供综合好感度区间→称谓映射、特殊关系初始值、自动调整工具，便于角色扮演差异化。
5. **多工具联动**：支持手动调整好感、切换关系、管理黑名单、NapCat/OneBot Poke、自定义随机变量等实用工具。
6. **查看状态**：
   - `affinity.inspect`：查看综合好感度、长期好感、短期好感、系数、连续互动天数。
   - `affinity.rank`：查看排行榜，支持文本/图片输出。

## 核心概念

| 概念 | 说明 |
| --- | --- |
| 综合好感度 | `affinity()` 变量与 `{affinity}` 模板均返回「系数 × 长期好感」，实时缓存与数据库一致。 |
| 长期好感度 | 代表关系基准，满足短期阈值后才会被调节。 |
| 短期好感度 | 描述即时情绪波动，仅用于分析与可视化，不再直接参与综合结果。 |
| 互动系数 | 记录连续天数与日增减。`increase > decrease` 时提升，长时间未互动或 `decrease > increase` 则衰减，可设置上下限。 |

## 好感度是如何计算的

1. **长期好感度 (LongTerm Affinity)**
   - 存储于数据库 `longTermAffinity` 字段，由短期阈值触发的 promote/demote 事件在 `longTermPromoteStep` / `longTermDemoteStep` 控制下递增或递减。
   - 任何手动调整（如 `adjust_affinity`）会直接写入该值并同步关系。

2. **互动系数 (Coefficient)**
   - 基于 `affinityDynamics.coefficient` 配置，包含 `base`、`maxDrop`、`maxBoost`、`decayPerDay`、`boostPerDay`。
   - 每日统计 `increase` / `decrease` 次数：
     - 长时间未互动或 `decrease > increase` → 按天数衰减，累计不超过 `maxDrop`。
     - 连续互动且 `increase > decrease` → 按连续天数提升，累计不超过 `maxBoost`。
   - 结果保存到 `coefficientState` 中（含 `coefficient` 与 `streak`）。

3. **综合好感度 (Composite Affinity)**
   - 计算公式：`composite = clamp(coefficient * longTermAffinity, min, max)`。
   - `affinity()` 变量、`{affinity}` 模板与提示词 `{{currentAffinity}}` 均使用该值。
   - 写入数据库的字段为 `affinityOverride`，供后续读取与缓存。

4. **历史与上下文参与方式**
   - 短期好感度、历史上下文、Bot 回复等信息只影响模型输出的 `delta`，不会直接参与最终公式。
   - 每次模型执行产生的行动记录会写入 `actionStats`，下一次分析会参考这些数据决定阈值与提示信息。

## 变量与模板占位符

| 变量 | 说明 |
| --- | --- |
| `{affinity}` / `affinity()` | 综合好感度（系数 × 长期好感）。 |
| `{relationship}` / `relationship()` | 当前综合好感度区间对应的称谓。 |
| `{{currentAffinity}}` | 渲染提示词时的综合好感度。 |
| `{{historyText}}` | 上下文。 |
| `{{userMessage}}` / `{{botReply}}` | 当前轮消息与聚合后的 Bot 回复。 |
| `{{longTermCoefficient}}` | 计算后的系数结果，可在提示词中显式提醒模型。 |

## 指令

- `affinity.inspect [userId] [platform]`：查看综合好感、长期/短期、系数、连续互动天数、交互统计。
- `affinity.rank [limit] [platform] [image|text]`：查看排行榜，支持图片输出（依赖 `koishi-plugin-puppeteer`）。
- `affinity.blacklist [limit] [platform] [image|text]`：查看自动黑名单。
- `affinity.block <userId> [platform] [-n note]` / `affinity.unblock <userId> [platform]`：手动维护黑名单。
- `affinity.groupList`（NapCat/OneBot）：列出 Bot 所在群，便于复制群号。

## 工具

| 工具 | 功能 |
| --- | --- |
| `adjust_affinity` | 将综合好感度设置为指定值，并重新计算关系。 |
| `adjust_relationship` | 强制切换关系到指定称谓，同时把好感调整到区间下限。 |
| `adjust_blacklist` | 管理自动黑名单，支持新增或解除。 |
| `poke_user` | （可选）NapCat/OneBot「戳一戳」工具。 |
| `set_self_profile` | （可选）NapCat/OneBot 修改机器人资料。 |

## 数据存储

插件会在数据库中维护 `chatluna_affinity_records` 表，常见字段：

- `platform` / `userId` / `selfId`
- `longTermAffinity`、`shortTermAffinity`、`affinityOverride`（综合值）
- `coefficientState`（记录 `coefficient` 与 `streak`）
- `actionStats`（模型建议的行为历史）
- `chatCount`、`lastInteractionAt`
- `temporaryBlacklist` 与黑名单相关记录

旧版本数据会在首次读取时自动迁移。

## 调试与排查

- 开启 `debugLogging` 可查看：触发条件、聚合后的 Bot 回复、模型原始输出、delta、综合好感变化、系数计算过程等。
- `affinity.inspect` 将展示：综合/长期/短期好感、系数、连续互动天数、动态阈值、最近聊天次数，便于调参。

## 许可证

MIT © 2024-present chatluna-affinity contributors
