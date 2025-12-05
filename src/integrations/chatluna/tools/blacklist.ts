/**
 * 黑名单调整工具
 * 为 ChatLuna 提供黑名单管理能力
 */

import { z } from 'zod'
import { StructuredTool } from '@langchain/core/tools'
import type { ToolDependencies } from './types'
import { getSession } from './types'

export function createBlacklistTool(deps: ToolDependencies) {
    const { config, store, cache, clamp, permanentBlacklist, temporaryBlacklist } = deps
    const shortTermCfg = config.shortTermBlacklist || {}

    // @ts-expect-error - Type instantiation depth issue with zod + StructuredTool
    return new (class extends StructuredTool {
        name = 'adjust_blacklist'
        description =
            'Add or remove a user from the affinity blacklist. Supports both permanent and temporary blacklist.'
        schema = z.object({
            action: z
                .enum(['add', 'remove', 'temp_add', 'temp_remove'])
                .describe(
                    'Action: add/remove for permanent blacklist, temp_add/temp_remove for temporary blacklist'
                ),
            targetUserId: z.string().describe('Target user ID'),
            platform: z
                .string()
                .optional()
                .describe('Target platform; defaults to current session'),
            note: z.string().optional().describe('Optional note when adding to blacklist'),
            durationHours: z
                .number()
                .optional()
                .describe('Duration in hours for temporary blacklist (default: 12)'),
            penalty: z
                .number()
                .optional()
                .describe('Affinity penalty for temporary blacklist (default: from config)')
        })

        async _call(
            input: {
                action: 'add' | 'remove' | 'temp_add' | 'temp_remove'
                targetUserId: string
                platform?: string
                note?: string
                durationHours?: number
                penalty?: number
            },
            _manager?: unknown,
            runnable?: unknown
        ) {
            const session = getSession(runnable)
            const platform = input.platform || session?.platform
            const userId = input.targetUserId
            const channelId =
                (session as unknown as { guildId?: string })?.guildId ||
                session?.channelId ||
                (session as unknown as { roomId?: string })?.roomId ||
                ''
            if (!platform || !userId)
                return 'Missing platform or user ID. Unable to adjust blacklist.'

            const selfId = session?.selfId
            if (!selfId) return 'Missing selfId. Unable to adjust blacklist.'

            if (input.action === 'temp_add') {
                let nickname = ''
                try {
                    const existing = await store.load(selfId, userId)
                    nickname = existing?.nickname || ''
                } catch {
                    /* ignore */
                }
                const durationHours = input.durationHours ?? shortTermCfg.durationHours ?? 12
                const penalty = input.penalty ?? shortTermCfg.penalty ?? 5
                const entry = temporaryBlacklist.recordTemporary(
                    platform,
                    userId,
                    durationHours,
                    penalty,
                    { note: input.note ?? 'tool', nickname, channelId }
                )
                if (!entry)
                    return `User ${platform}/${userId} is already in temporary blacklist.`
                if (penalty > 0) {
                    try {
                        const record = await store.load(selfId, userId)
                        if (record) {
                            const newAffinity = clamp(
                                (record.longTermAffinity ?? record.affinity) - penalty
                            )
                            await store.save(
                                { platform, userId, selfId, session },
                                newAffinity,
                                record.relation || ''
                            )
                        }
                    } catch {
                        /* ignore */
                    }
                }
                cache.clear(platform, userId)
                return `User ${platform}/${userId} added to temporary blacklist for ${durationHours} hours with ${penalty} penalty.`
            }

            if (input.action === 'temp_remove') {
                const removed = temporaryBlacklist.removeTemporary(platform, userId)
                cache.clear(platform, userId)
                return removed
                    ? `User ${platform}/${userId} removed from temporary blacklist.`
                    : `User ${platform}/${userId} not found in temporary blacklist.`
            }

            if (input.action === 'add') {
                let nickname = ''
                try {
                    const existing = await store.load(selfId, userId)
                    nickname = existing?.nickname || ''
                } catch {
                    /* ignore */
                }
                permanentBlacklist.record(platform, userId, {
                    note: input.note ?? 'tool',
                    nickname,
                    channelId
                })
                cache.clear(platform, userId)
                return `User ${platform}/${userId} added to blacklist.`
            }

            const removed = permanentBlacklist.remove(platform, userId, channelId)
            cache.clear(platform, userId)
            return removed
                ? `User ${platform}/${userId} removed from blacklist.`
                : `User ${platform}/${userId} not found in blacklist.`
        }
    })()
}
