/**
 * 日程时间工具
 * 提供时间解析、当前时段查找、日程格式化等功能
 */
import type { Schedule, ScheduleEntry, NormalizedTime } from '../../types';
export declare function normalizeTime(value: string | null | undefined): NormalizedTime | null;
export declare function formatDateForDisplay(date: Date, timezone: string): {
    dateStr: string;
    weekday: string;
};
export declare function getCurrentMinutes(timezone: string): number;
export declare function getCurrentEntry(schedule: Schedule, timezone: string): ScheduleEntry | null;
export declare function formatScheduleText(schedule: Schedule): string;
export declare function buildSummary(title: string, detail: string): string;
export declare function derivePersonaTag(persona: string): string;
