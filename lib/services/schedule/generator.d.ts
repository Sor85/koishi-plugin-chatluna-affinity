/**
 * 日程生成器
 * 提供基于 LLM 的日程生成功能
 */
import type { Schedule, ScheduleConfig, LogFn } from '../../types';
export interface ScheduleGeneratorOptions {
    scheduleConfig: ScheduleConfig;
    getModel: () => {
        invoke?: (prompt: string) => Promise<{
            content?: unknown;
        }>;
    } | null;
    getMessageContent: (content: unknown) => string;
    resolvePersonaPreset: () => string;
    log: LogFn;
}
export declare function createScheduleGenerator(options: ScheduleGeneratorOptions): {
    generate: () => Promise<Schedule | null>;
    parseResponse: (text: string, personaTag: string) => Schedule | null;
};
export type ScheduleGenerator = ReturnType<typeof createScheduleGenerator>;
