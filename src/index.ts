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

0.2.2-alpha.13
- 新增 send_fake_msg 工具，用于伪造消息并发送合并转发

0.2.2-alpha.12
- groupInfo 变量新增 includeOwnersAndAdmins 配置，用于展示群主/管理员名单
- 关系设置新增新增好感度区间变量 relationshipAffinityLevel ，按配置逐行展示所有好感度区间、关系与备注

0.2.2-alpha.11
- 撤回工具修改为按 messageid 撤回，移除 lastN/关键词等模糊匹配路径
- 新增 set_msg_emoji 工具，按 messageid + emoji_id 对消息添加表情
- 新增 send_forward_msg 合并转发工具（未完成）
- 新增 varslist/toolslist 指令，分别列出已启用的变量与工具
`;