/**
 * 黑名单拦截中间件
 * 提供消息拦截守卫，阻止黑名单用户的消息
 */

import type { Session } from 'koishi'
import type { Config, LogFn } from '../../types'
import type { PermanentBlacklistManager } from './permanent'
import type { TemporaryBlacklistService } from './temporary'

export interface BlacklistGuardOptions {
    config: Config
    permanent: PermanentBlacklistManager
    temporary: TemporaryBlacklistService
    log: LogFn
}

export function createBlacklistGuard(options: BlacklistGuardOptions) {
    const { config, permanent, temporary, log } = options

    const shouldBlock = (session: Session): boolean => {
        const platform = session?.platform
        const userId = session?.userId
        if (!platform || !userId) return false

        const channelId =
            (session as unknown as { guildId?: string })?.guildId ||
            session?.channelId ||
            ''

        if (permanent.isBlacklisted(platform, userId, channelId)) {
            if (config.blacklistLogInterception) {
                log('debug', '消息被永久黑名单拦截', { platform, userId })
            }
            return true
        }

        const tempEntry = temporary.isBlocked(platform, userId)
        if (tempEntry) {
            if (config.blacklistLogInterception) {
                log('debug', '消息被临时黑名单拦截', {
                    platform,
                    userId,
                    expiresAt: tempEntry.expiresAt
                })
            }
            return true
        }

        const configTemp = temporary.isTemporarilyBlacklisted(platform, userId)
        if (configTemp) {
            if (config.blacklistLogInterception) {
                log('debug', '消息被配置临时黑名单拦截', {
                    platform,
                    userId,
                    expiresAt: configTemp.expiresAt
                })
            }
            return true
        }

        return false
    }

    const middleware = async (
        session: Session,
        next: () => Promise<void>
    ): Promise<void> => {
        if (shouldBlock(session)) return
        return next()
    }

    return {
        shouldBlock,
        middleware
    }
}

export type BlacklistGuard = ReturnType<typeof createBlacklistGuard>
