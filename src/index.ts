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
## 更新日志（0.2.2-alpha.8）

- 好感度设置中新增“使用原始输出”开关，开启后好感度分析直接使用 chatluna-character 的原始输出
- 天气设置新增 get_weather 工具注册，可通过工具查询指定城市天气
`;