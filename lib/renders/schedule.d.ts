/**
 * 日程渲染器
 * 渲染每日日程图片
 */
import type { Context } from 'koishi';
import type { LogFn, ScheduleEntry } from '../types';
export interface ScheduleRenderData {
    title: string;
    description: string;
    entries: ScheduleEntry[];
    date: string;
}
export declare function createScheduleRenderer(ctx: Context, log?: LogFn): (data: ScheduleRenderData) => Promise<Buffer | null>;
export type ScheduleRenderer = ReturnType<typeof createScheduleRenderer>;
