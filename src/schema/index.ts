/**
 * Schema 统一导出
 * 组合所有子 Schema 并导出完整配置类型
 */

import { Schema } from 'koishi'
import { AffinitySchema } from './affinity'
import { BlacklistSchema } from './blacklist'
import { RelationshipSchema } from './relationship'
import { ScheduleSchema } from './schedule'
import { WeatherSchema } from './weather'
import { OtherVariablesSchema } from './variables'
import { OneBotToolsSchema, OtherCommandsSchema, OtherSettingsSchema } from './tools'

export * from './affinity'
export * from './blacklist'
export * from './relationship'
export * from './schedule'
export * from './weather'
export * from './variables'
export * from './tools'

export const name = 'chatluna-affinity'

export const inject = {
    required: ['chatluna', 'database'],
    optional: ['puppeteer', 'console', 'chatluna_group_analysis', 'chatluna_character']
}

export const ConfigSchema = Schema.intersect([
    AffinitySchema,
    BlacklistSchema,
    RelationshipSchema,
    ScheduleSchema,
    WeatherSchema,
    OtherVariablesSchema,
    OneBotToolsSchema,
    OtherCommandsSchema,
    OtherSettingsSchema
])

export { ConfigSchema as Config }
