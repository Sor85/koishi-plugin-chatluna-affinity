/**
 * 日程相关类型定义
 * 包含日程条目、日程表、日程管理器接口
 */
import type { Session } from 'koishi';
export interface ScheduleEntry {
    start: string;
    end: string;
    startMinutes: number;
    endMinutes: number;
    summary: string;
}
export interface Schedule {
    source: string;
    date: string;
    title: string;
    description: string;
    entries: ScheduleEntry[];
    text: string;
}
export interface NormalizedTime {
    minutes: number;
    label: string;
    raw: string;
}
export interface ScheduleManager {
    enabled: boolean;
    registerVariables: () => void;
    registerTool: (plugin: ChatLunaPlugin) => void;
    registerCommand: () => void;
    start: () => void;
    regenerateSchedule?: (session?: Session) => Promise<Schedule | null>;
    getSchedule: (session?: Session) => Promise<Schedule | null>;
    getScheduleText: (session?: Session) => Promise<string>;
    getCurrentSummary: (session?: Session) => Promise<string>;
    renderImage?: (payload: Schedule) => Promise<Buffer | null>;
}
export interface ChatLunaPlugin {
    registerTool: (name: string, options: ToolRegistration) => void;
}
export interface ToolRegistration {
    selector: () => boolean;
    createTool: () => unknown;
    authorization?: (session: Session) => boolean;
}
