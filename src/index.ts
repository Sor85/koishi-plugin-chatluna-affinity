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
export { ConfigSchema, AffinitySchema, BlacklistSchema, RelationshipSchema, ScheduleSchema, OtherVariablesSchema, OneBotToolsSchema, OtherCommandsSchema, OtherSettingsSchema } from './schema'
export const usage = `
## 更新日志

0.2.2-alpha.11
- 撤回工具修改为按 messageid 撤回，移除 lastN/关键词等模糊匹配路径
- 新增 set_msg_emoji 工具，按 messageid + emoji_id 对消息添加表情
- 新增 send_forward_msg 合并转发工具（未完成）
- 新增 varslist/toolslist 指令，分别列出已启用的变量与工具

0.2.2-alpha.10
- 好感度详情新增“印象”显示开关 inspectShowImpression，可关闭印象获取与展示（affinity.inspect）

0.2.2-alpha.9
- 新增群昵称工具，支持修改群成员昵称（OneBot 平台，需群管理权限）
- 好感度分析提示词调整：若 Bot 回复已包含好感度变化倾向，则以回复为准，避免冲突
`;