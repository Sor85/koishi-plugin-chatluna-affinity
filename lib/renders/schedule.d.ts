import type { Context } from 'koishi';
interface ScheduleEntry {
    start: string;
    end: string;
    summary: string;
}
interface ScheduleData {
    title: string;
    description: string;
    entries: ScheduleEntry[];
    date: string;
}
export declare function createRenderSchedule(ctx: Context): (data: ScheduleData) => Promise<Buffer | null>;
export {};
