/**
 * 日程缓存
 * 提供按日期的日程缓存，支持全局持久化避免插件重载时重复生成
 */
import type { Schedule } from '../../types';
export declare function createScheduleCache(cacheKey: string): {
    get: (dateStr: string) => Schedule | null;
    set: (schedule: Schedule, dateStr: string) => void;
    invalidate: () => void;
    getCachedDate: () => string | null;
    getSchedule: () => Schedule | null;
};
export type ScheduleCache = ReturnType<typeof createScheduleCache>;
