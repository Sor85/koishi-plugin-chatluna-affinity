/**
 * 日程缓存
 * 提供按日期的日程缓存，支持全局持久化避免插件重载时重复生成
 */

import type { Schedule } from '../../types'

const globalScheduleCache = new Map<string, { schedule: Schedule; date: string }>()

export function createScheduleCache(cacheKey: string) {
    const cached = globalScheduleCache.get(cacheKey)
    let cachedSchedule: Schedule | null = cached?.schedule || null
    let cachedDate: string | null = cached?.date || null

    const get = (dateStr: string): Schedule | null => {
        if (cachedSchedule && cachedDate === dateStr) {
            return cachedSchedule
        }
        return null
    }

    const set = (schedule: Schedule, dateStr: string): void => {
        cachedSchedule = schedule
        cachedDate = dateStr
        globalScheduleCache.set(cacheKey, { schedule, date: dateStr })
    }

    const invalidate = (): void => {
        cachedSchedule = null
        cachedDate = null
        globalScheduleCache.delete(cacheKey)
    }

    const getCachedDate = (): string | null => cachedDate

    const getSchedule = (): Schedule | null => cachedSchedule

    return {
        get,
        set,
        invalidate,
        getCachedDate,
        getSchedule
    }
}

export type ScheduleCache = ReturnType<typeof createScheduleCache>
