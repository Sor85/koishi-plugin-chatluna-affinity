import type { Context, Session } from 'koishi';
import type { Config, ScheduleManager, LogFn } from '../types';
interface RenderOptions {
    heading?: string;
    subHeading?: string;
}
interface ScheduleManagerDeps {
    getModel: () => unknown;
    getMessageContent: (content: unknown) => string;
    resolvePersonaPreset: (session?: Session) => string;
    renderTableImage: (title: string, headers: string[], rows: string[][], options?: RenderOptions) => Promise<Buffer | null>;
    log: LogFn;
}
export declare function createScheduleManager(ctx: Context, config: Config, deps: ScheduleManagerDeps): ScheduleManager;
export {};
