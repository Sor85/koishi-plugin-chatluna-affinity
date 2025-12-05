/**
 * 好感度调整工具
 * 为 ChatLuna 提供好感度调整能力
 */

import { z } from 'zod'
import { StructuredTool } from '@langchain/core/tools'
import type { ToolDependencies } from './types'
import { getSession } from './types'

export function createAffinityTool(deps: ToolDependencies) {
    const { config, store, cache, clamp, resolveLevelByAffinity, resolveUserIdentity } = deps
    const levels = config.relationshipAffinityLevels || []
    const min = levels.length > 0 ? Math.min(...levels.map((l) => l.min)) : 0
    const max = levels.length > 0 ? Math.max(...levels.map((l) => l.max)) : 100

    // @ts-expect-error - Type instantiation depth issue with zod + StructuredTool
    return new (class extends StructuredTool {
        name = 'adjust_affinity'
        description = 'Adjust affinity for a specific user and sync derived relationship.'
        schema = z.object({
            affinity: z
                .number()
                .min(min)
                .max(max)
                .describe(`Target affinity (range ${min}-${max})`),
            targetUserId: z
                .string()
                .optional()
                .describe('Target user ID; defaults to current session'),
            platform: z
                .string()
                .optional()
                .describe('Target platform; defaults to current session')
        })

        async _call(
            input: { affinity: number; targetUserId?: string; platform?: string },
            _manager?: unknown,
            runnable?: unknown
        ) {
            const session = getSession(runnable)
            const platform = input.platform || session?.platform
            const userId = input.targetUserId || session?.userId
            if (!platform || !userId)
                return 'Missing platform or user ID. Unable to adjust affinity.'

            let nickname: string | undefined
            if (session && userId !== session.userId) {
                const identity = await resolveUserIdentity(session, userId)
                nickname = identity?.nickname
            }

            const value = clamp(input.affinity)
            const level = resolveLevelByAffinity(value)
            await store.save(
                { platform, userId, selfId: session?.selfId, session: session || undefined, nickname },
                value,
                level?.relation ?? ''
            )
            cache.set(platform, userId, value)
            if (level?.relation) {
                return `Affinity for ${platform}/${userId} set to ${value}. Relationship updated to ${level.relation}.`
            }
            return `Affinity for ${platform}/${userId} set to ${value}.`
        }
    })()
}
