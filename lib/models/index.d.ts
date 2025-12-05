/**
 * 数据模型统一导出
 * 提供数据库模型注册入口
 */
import type { Context } from 'koishi';
import { MODEL_NAME } from './affinity';
export { MODEL_NAME };
export declare function registerModels(ctx: Context): void;
export * from './affinity';
