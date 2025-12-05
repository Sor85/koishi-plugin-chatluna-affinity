/**
 * 数据模型统一导出
 * 提供数据库模型注册入口
 */

import type { Context } from 'koishi'
import { extendAffinityModel, MODEL_NAME } from './affinity'

export { MODEL_NAME }

export function registerModels(ctx: Context): void {
    extendAffinityModel(ctx)
}

export * from './affinity'
