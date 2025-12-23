/**
 * 群昵称设置工具
 * 提供 OneBot 平台修改群成员昵称功能
 */

import { z } from 'zod'
import { StructuredTool } from '@langchain/core/tools'
import type { Context } from 'koishi'
import type { LogFn } from '../../../types'
import { ensureOneBotSession, callOneBotAPI } from '../api'
import { getSession } from '../../chatluna/tools/types'

export interface SetGroupCardToolDeps {
    ctx: Context
    toolName: string
    log?: LogFn
}

export function createSetGroupCardTool(deps: SetGroupCardToolDeps) {
    const { toolName, log } = deps

    // @ts-expect-error - Type instantiation depth issue with zod + StructuredTool
    return new (class extends StructuredTool {
        name = toolName || 'set_group_card'
        description =
            'Update a group member nickname (group card). Requires group admin/owner permission. Provide groupId if not in current session.'
        schema = z.object({
            groupId: z.string().optional().describe('Target group ID. Defaults to current session group.'),
            userId: z.string().min(1, 'userId is required').describe('Target member user ID.'),
            card: z.string().min(1, 'card is required').describe('New group card for the member.')
        })

        async _call(
            input: { groupId?: string; userId: string; card: string },
            _manager?: unknown,
            runnable?: unknown
        ) {
            try {
                const session = getSession(runnable)
                if (!session) return 'No session context available.'

                const groupId =
                    input.groupId?.trim() ||
                    (session.guildId ? String(session.guildId).trim() : '') ||
                    (session.channelId ? String(session.channelId).trim() : '')
                if (!groupId) return 'Missing groupId. Provide groupId explicitly or run inside a group session.'

                const userId = input.userId.trim()
                const card = input.card.trim()
                if (!userId) return 'userId is required.'
                if (!card) return 'card is required.'

                const { error, internal } = ensureOneBotSession(session)
                if (error) return error

                await callOneBotAPI(
                    internal!,
                    'set_group_card',
                    { group_id: groupId, user_id: userId, card },
                    ['setGroupCard']
                )
                const message = `群昵称已更新：${userId} -> ${card}`
                log?.('info', message)
                return message
            } catch (error) {
                log?.('warn', 'set_group_card failed', error)
                return `set_group_card failed: ${(error as Error).message}`
            }
        }
    })()
}
