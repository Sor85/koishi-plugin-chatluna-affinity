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

0.2.2-alpha.10
- 好感度详情新增“印象”显示开关 inspectShowImpression，可关闭印象获取与展示（affinity.inspect）

0.2.2-alpha.9
- 新增群昵称工具，支持修改群成员昵称（OneBot 平台，需群管理权限）
- 好感度分析提示词调整：若 Bot 回复已包含好感度变化倾向，则以回复为准，避免冲突

0.2.2-alpha.8
- 好感度设置中新增 \`使用 chatluna-character 的原始输出替代 {botReply}\`，开启后好感度分析直接使用 chatluna-character 的原始输出
- 天气设置新增 get_weather 工具注册，可通过工具查询指定城市天气
`;