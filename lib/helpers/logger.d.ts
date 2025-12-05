/**
 * 日志工具
 * 提供统一的日志记录接口，支持按配置开关调试日志
 */
import type { Context } from 'koishi';
import type { LogFn } from '../types';
interface LoggerConfig {
    debugLogging?: boolean;
}
export declare function createLogger(ctx: Context, config: LoggerConfig): LogFn;
export {};
