/**
 * 插件入口
 * 导出插件元信息和 apply 函数
 */
export { name, inject, ConfigSchema as Config } from './schema';
export { apply } from './plugin';
export * from './types';
export * from './constants';
export * from './utils';
export * from './helpers';
export * from './models';
export * from './services';
export * from './renders';
export * from './commands';
export * from './integrations';
export { ConfigSchema, AffinitySchema, BlacklistSchema, RelationshipSchema, ScheduleSchema, OtherVariablesSchema, OneBotToolsSchema, OtherCommandsSchema, OtherSettingsSchema } from './schema';
