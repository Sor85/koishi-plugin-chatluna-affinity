/**
 * 永久黑名单管理
 * 提供永久黑名单的增删查功能，数据持久化到配置文件
 */

import type { Config, BlacklistEntry, BlacklistDetail, LogFn } from '../../types'
import { formatBeijingTimestamp } from '../../utils'

export interface PermanentBlacklistOptions {
    config: Config
    log: LogFn
    applyConfigUpdate: () => void
}

export function createPermanentBlacklistManager(options: PermanentBlacklistOptions) {
    const { config, log, applyConfigUpdate } = options
    const blacklistSet = new Set<string>()

    const makeKey = (platform: string, userId: string) => `${platform}:${userId}`

    for (const entry of config.autoBlacklist || []) {
        if (entry?.platform && entry?.userId) {
            blacklistSet.add(makeKey(entry.platform, entry.userId))
        }
    }

    const isBlacklisted = (
        platform: string,
        userId: string,
        _channelId?: string
    ): boolean => blacklistSet.has(makeKey(platform, userId))

    const record = (
        platform: string,
        userId: string,
        detail?: BlacklistDetail
    ): BlacklistEntry | null => {
        const key = makeKey(platform, userId)
        if (blacklistSet.has(key)) return null

        blacklistSet.add(key)

        const entry: BlacklistEntry = {
            platform,
            userId,
            blockedAt: formatBeijingTimestamp(new Date()),
            nickname: detail?.nickname || '',
            note: detail?.note || '',
            channelId: detail?.channelId || detail?.guildId || detail?.groupId || ''
        }

        if (!config.autoBlacklist) config.autoBlacklist = []
        config.autoBlacklist.push(entry)
        applyConfigUpdate()

        log('info', '已记录自动拉黑用户', { platform, userId })
        return entry
    }

    const remove = (platform: string, userId: string, _channelId?: string): boolean => {
        const key = makeKey(platform, userId)
        if (!blacklistSet.has(key)) return false

        blacklistSet.delete(key)

        if (config.autoBlacklist) {
            const index = config.autoBlacklist.findIndex(
                (e) => e.platform === platform && e.userId === userId
            )
            if (index >= 0) config.autoBlacklist.splice(index, 1)
            applyConfigUpdate()
        }

        return true
    }

    const list = (platform?: string, _channelId?: string): BlacklistEntry[] => {
        const all = config.autoBlacklist || []
        if (!platform) return all
        return all.filter((entry) => entry.platform === platform)
    }

    return {
        isBlacklisted,
        record,
        remove,
        list
    }
}

export type PermanentBlacklistManager = ReturnType<typeof createPermanentBlacklistManager>
