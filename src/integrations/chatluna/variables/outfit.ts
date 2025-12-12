/**
 * 穿搭变量提供者
 * 为 ChatLuna 提供今日穿搭和当前穿搭变量
 */

import type { Session } from 'koishi'
import type { Schedule, ScheduleConfig, OutfitEntry } from '../../../types'
import { getCurrentMinutes } from '../../../services/schedule/time-utils'

interface ProviderConfigurable {
    session?: Session
}

export interface OutfitProviderDeps {
    scheduleConfig: ScheduleConfig
    getSchedule: () => Schedule | null
}

function formatOutfitsText(outfits: OutfitEntry[]): string {
    if (!outfits?.length) return ''
    return outfits.map((o) => `${o.start}-${o.end}：${o.description}`).join('\n')
}

function getCurrentOutfit(outfits: OutfitEntry[], timezone: string): OutfitEntry | null {
    if (!outfits?.length) return null
    const currentMinutes = getCurrentMinutes(timezone)
    return outfits.find((o) => currentMinutes >= o.startMinutes && currentMinutes < o.endMinutes) || null
}

export function createOutfitTextProvider(deps: OutfitProviderDeps) {
    const { getSchedule } = deps

    return async (
        _args: unknown,
        _variables: unknown,
        _configurable?: ProviderConfigurable
    ): Promise<string> => {
        const schedule = getSchedule()
        return formatOutfitsText(schedule?.outfits || [])
    }
}

export function createCurrentOutfitProvider(deps: OutfitProviderDeps) {
    const { scheduleConfig, getSchedule } = deps
    const timezone = scheduleConfig.timezone || 'Asia/Shanghai'

    return async (
        _args: unknown,
        _variables: unknown,
        _configurable?: ProviderConfigurable
    ): Promise<string> => {
        const schedule = getSchedule()
        if (!schedule) return ''
        const outfit = getCurrentOutfit(schedule.outfits, timezone)
        return outfit?.description || ''
    }
}

export type OutfitTextProvider = ReturnType<typeof createOutfitTextProvider>
export type CurrentOutfitProvider = ReturnType<typeof createCurrentOutfitProvider>
