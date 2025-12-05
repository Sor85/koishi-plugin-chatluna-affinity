/**
 * 临时黑名单管理
 * 提供临时黑名单的内存缓存和配置持久化功能
 */

import type {
    Config,
    TemporaryBlacklistEntry,
    BlacklistDetail,
    InMemoryTemporaryEntry,
    ShortTermOptions,
    LogFn
} from '../../types'
import { formatBeijingTimestamp } from '../../utils'

export interface TemporaryBlacklistOptions {
    config: Config
    shortTermOptions: ShortTermOptions
    log: LogFn
    applyConfigUpdate: () => void
}

export function createTemporaryBlacklistManager(options: TemporaryBlacklistOptions) {
    const { config, shortTermOptions, log, applyConfigUpdate } = options
    const memoryCache = new Map<string, InMemoryTemporaryEntry>()

    const makeKey = (platform: string, userId: string) =>
        `${platform || 'unknown'}:${userId || 'anonymous'}`

    const cleanExpired = (): void => {
        if (!config.temporaryBlacklist?.length) return
        const now = Date.now()
        const before = config.temporaryBlacklist.length
        config.temporaryBlacklist = config.temporaryBlacklist.filter((entry) => {
            const expiresAt = new Date(entry.expiresAt).getTime()
            return expiresAt > now
        })
        if (config.temporaryBlacklist.length !== before) {
            applyConfigUpdate()
        }
    }

    const isBlocked = (platform: string, userId: string): InMemoryTemporaryEntry | null => {
        if (!shortTermOptions.enabled) return null
        const key = makeKey(platform, userId)
        const entry = memoryCache.get(key)
        if (!entry) return null
        if (entry.expiresAt <= Date.now()) {
            memoryCache.delete(key)
            return null
        }
        return entry
    }

    const activate = (
        platform: string,
        userId: string,
        nickname: string,
        now: Date
    ): { activated: boolean; entry: InMemoryTemporaryEntry | null } => {
        if (!shortTermOptions.enabled) return { activated: false, entry: null }

        const key = makeKey(platform, userId)
        const existing = memoryCache.get(key)
        if (existing && existing.expiresAt > now.getTime()) {
            return { activated: false, entry: existing }
        }

        const expiresAt = now.getTime() + shortTermOptions.durationMs
        const entry: InMemoryTemporaryEntry = { expiresAt, nickname }
        memoryCache.set(key, entry)

        log('info', '已激活临时拉黑', { platform, userId, nickname, expiresAt: new Date(expiresAt) })
        return { activated: true, entry }
    }

    const clear = (platform: string, userId: string): void => {
        const key = makeKey(platform, userId)
        memoryCache.delete(key)
    }

    const isTemporarilyBlacklisted = (
        platform: string,
        userId: string
    ): TemporaryBlacklistEntry | null => {
        cleanExpired()
        const list = config.temporaryBlacklist || []
        return list.find((entry) => entry.platform === platform && entry.userId === userId) || null
    }

    const recordTemporary = (
        platform: string,
        userId: string,
        durationHours: number,
        penalty: number,
        detail?: BlacklistDetail
    ): TemporaryBlacklistEntry | null => {
        const existing = isTemporarilyBlacklisted(platform, userId)
        if (existing) return null

        const now = new Date()
        const expiresAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000)
        const entry: TemporaryBlacklistEntry = {
            platform,
            userId,
            blockedAt: formatBeijingTimestamp(now),
            expiresAt: formatBeijingTimestamp(expiresAt),
            nickname: detail?.nickname || '',
            note: detail?.note || '',
            channelId: detail?.channelId || detail?.guildId || detail?.groupId || '',
            durationHours: `${durationHours}小时`,
            penalty: `-${penalty}`
        }

        if (!config.temporaryBlacklist) config.temporaryBlacklist = []
        config.temporaryBlacklist.push(entry)
        applyConfigUpdate()

        return entry
    }

    const removeTemporary = (platform: string, userId: string): boolean => {
        if (!config.temporaryBlacklist) return false
        const index = config.temporaryBlacklist.findIndex(
            (e) => e.platform === platform && e.userId === userId
        )
        if (index < 0) return false
        config.temporaryBlacklist.splice(index, 1)
        applyConfigUpdate()
        return true
    }

    const listTemporary = (platform?: string): TemporaryBlacklistEntry[] => {
        cleanExpired()
        const all = config.temporaryBlacklist || []
        if (!platform) return all
        return all.filter((entry) => entry.platform === platform)
    }

    return {
        isBlocked,
        activate,
        clear,
        isTemporarilyBlacklisted,
        recordTemporary,
        removeTemporary,
        listTemporary
    }
}

export type TemporaryBlacklistService = ReturnType<typeof createTemporaryBlacklistManager>
