/**
 * 好感度分析中间件
 * 监听用户消息和机器人回复，自动分析并更新好感度
 */
import type { Context } from 'koishi';
import type { Config } from '../../types';
import type { AnalysisMiddlewareResult, AnalysisMiddlewareDeps } from './types';
export declare function createAnalysisMiddleware(ctx: Context, config: Config, deps: AnalysisMiddlewareDeps): AnalysisMiddlewareResult;
