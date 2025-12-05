/**
 * 黑名单相关类型定义
 * 包含永久黑名单、临时黑名单、短期自动拉黑配置
 */

export interface BlacklistEntry {
    platform: string
    userId: string
    blockedAt: string
    nickname?: string
    note: string
    channelId?: string
}

export interface TemporaryBlacklistEntry {
    platform: string
    userId: string
    blockedAt: string
    expiresAt: string
    nickname?: string
    note: string
    channelId?: string
    durationHours: number | string
    penalty: number | string
}

export interface BlacklistDetail {
    note?: string
    nickname?: string
    channelId?: string
    guildId?: string
    groupId?: string
}

export interface ShortTermBlacklistConfig {
    enabled: boolean
    windowHours?: number
    decreaseThreshold?: number
    durationHours?: number
    penalty?: number
    replyTemplate?: string
    renderAsImage?: boolean
}

export interface ShortTermOptions {
    enabled: boolean
    windowHours: number
    windowMs: number
    decreaseThreshold: number
    durationHours: number
    durationMs: number
    penalty: number
}

export interface InMemoryTemporaryEntry {
    expiresAt: number
    nickname: string
}

export interface TemporaryBlacklistManager {
    isBlocked: (platform: string, userId: string) => InMemoryTemporaryEntry | null
    activate: (platform: string, userId: string, nickname: string, now: Date) => {
        activated: boolean
        entry: InMemoryTemporaryEntry | null
    }
    clear: (platform: string, userId: string) => void
}
