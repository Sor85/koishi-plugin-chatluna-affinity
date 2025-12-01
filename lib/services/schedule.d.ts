import type { Context, Session } from 'koishi';
import type { Config, ScheduleEntry, ScheduleManager, LogFn } from '../types';
interface ScheduleManagerDeps {
    getModel: () => unknown;
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
export {};
