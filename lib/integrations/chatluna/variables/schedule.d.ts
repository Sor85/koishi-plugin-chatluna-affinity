/**
 * 日程变量提供者
 * 为 ChatLuna 提供今日日程和当前时段变量
 */
import type { Session } from 'koishi';
import type { Schedule, ScheduleConfig } from '../../../types';
interface ProviderConfigurable {
    session?: Session;
}
export interface ScheduleProviderDeps {
    scheduleConfig: ScheduleConfig;
    getSchedule: () => Schedule | null;
}
export declare function createScheduleTextProvider(deps: ScheduleProviderDeps): (_args: unknown, _variables: unknown, _configurable?: ProviderConfigurable) => Promise<string>;
export declare function createCurrentActivityProvider(deps: ScheduleProviderDeps): (_args: unknown, _variables: unknown, _configurable?: ProviderConfigurable) => Promise<string>;
export type ScheduleTextProvider = ReturnType<typeof createScheduleTextProvider>;
export type CurrentActivityProvider = ReturnType<typeof createCurrentActivityProvider>;
export {};
