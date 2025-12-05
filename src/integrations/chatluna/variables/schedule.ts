/**
 * 日程变量提供者
 * 为 ChatLuna 提供今日日程和当前时段变量
 */

import type { Session } from 'koishi'
import type { Schedule, ScheduleConfig } from '../../../types'
import { getCurrentEntry } from '../../../services/schedule/time-utils'

interface ProviderConfigurable {
    session?: Session
}

export interface ScheduleProviderDeps {
    scheduleConfig: ScheduleConfig
    getSchedule: () => Schedule | null
}

export function createScheduleTextProvider(deps: ScheduleProviderDeps) {
    const { getSchedule } = deps

    return async (
        _args: unknown,
        _variables: unknown,
        _configurable?: ProviderConfigurable
    ): Promise<string> => {
        const schedule = getSchedule()
        return schedule?.text || ''
    }
}

export function createCurrentActivityProvider(deps: ScheduleProviderDeps) {
    const { scheduleConfig, getSchedule } = deps
    const timezone = scheduleConfig.timezone || 'Asia/Shanghai'

    return async (
        _args: unknown,
        _variables: unknown,
        _configurable?: ProviderConfigurable
    ): Promise<string> => {
        const schedule = getSchedule()
        if (!schedule) return ''
        const entry = getCurrentEntry(schedule, timezone)
        return entry?.summary || ''
    }
}

export type ScheduleTextProvider = ReturnType<typeof createScheduleTextProvider>
export type CurrentActivityProvider = ReturnType<typeof createCurrentActivityProvider>
