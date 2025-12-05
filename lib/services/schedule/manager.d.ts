/**
 * 日程管理器
 * 整合日程生成、缓存、命令和变量注册
 */
import type { Context, Session } from 'koishi';
import type { Config, ScheduleEntry, LogFn, ScheduleManager } from '../../types';
export interface ScheduleManagerDeps {
    getModel: () => {
        invoke?: (prompt: string) => Promise<{
            content?: unknown;
        }>;
    } | null;
    getMessageContent: (content: unknown) => string;
    resolvePersonaPreset: (session?: Session) => string;
    renderSchedule: (data: {
        title: string;
        description: string;
        entries: ScheduleEntry[];
        date: string;
    }) => Promise<Buffer | null>;
    log: LogFn;
}
export declare function createScheduleManager(ctx: Context, config: Config, deps: ScheduleManagerDeps): ScheduleManager;
