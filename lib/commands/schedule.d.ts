/**
 * 日程命令
 * 查看和刷新今日日程
 */
import type { Session } from 'koishi';
import type { CommandDependencies } from './types';
import type { Schedule, ScheduleConfig } from '../types';
export interface ScheduleCommandDeps extends CommandDependencies {
    scheduleConfig: ScheduleConfig;
    getSchedule: (session?: Session) => Promise<Schedule | null>;
    regenerateSchedule: (session?: Session) => Promise<Schedule | null>;
    renderScheduleImage: (schedule: Schedule) => Promise<Buffer | null>;
    startRetryInterval: () => void;
}
export declare function registerScheduleCommand(deps: ScheduleCommandDeps): void;
