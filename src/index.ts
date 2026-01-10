/**
 * 插件入口
 * 导出插件元信息和 apply 函数
 */

export { name, inject, ConfigSchema as Config } from './schema'
export { apply } from './plugin'

export * from './types'
export * from './constants'
export * from './utils'
export * from './helpers'
export * from './models'
export * from './services'
export * from './renders'
export * from './commands'
export * from './integrations'
export {
    ConfigSchema,
    AffinitySchema,
    BlacklistSchema,
    RelationshipSchema,
    ScheduleSchema,
    OtherVariablesSchema,
    NativeToolsSchema,
    XmlToolsSchema,
    OtherCommandsSchema,
    OtherSettingsSchema
} from './schema'
export const usage = `
## 更新日志

0.2.3-alpha.3
- 修复无法选择日程模型的问题

0.2.3-alpha.2
- 修复好感度更新时未更新 chatCount 的问题

0.2.3-alpha.1
- 新增 XML 工具，解析原始输出中的 &lt;poke id="" /&gt; 戳一戳、&lt;emoji message_id="" emoji_id="" /&gt; 表情回应、&lt;delete message_id="" /&gt; 撤回消息
- 重构好感度，从依赖外部模型改为解析原始输出中的 &lt;affinity delta="" action="increase|decrease" id="" /&gt;
`;