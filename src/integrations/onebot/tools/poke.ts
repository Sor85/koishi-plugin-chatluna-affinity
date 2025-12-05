/**
 * 戳一戳工具
 * 提供 OneBot 平台的戳一戳功能
 */

import { z } from 'zod'
import { StructuredTool } from '@langchain/core/tools'
import type { Context, Session } from 'koishi'
import type { LogFn } from '../../../types'
import { ensureOneBotSession } from '../api'
import { getSession } from '../../chatluna/tools/types'

export interface PokeToolDeps {
    ctx: Context
    toolName: string
    log?: LogFn
}

export function createPokeTool(deps: PokeToolDeps) {
    const { toolName, log } = deps

    // @ts-expect-error - Type instantiation depth issue with zod + StructuredTool
    return new (class extends StructuredTool {
        name = toolName || 'poke_user'
        description = 'Poke (nudge) a specified user in a group or private conversation.'
        schema = z.object({
            userId: z.string().min(1, 'userId is required').describe('The user ID to poke.'),
            groupId: z
                .string()
                .optional()
                .describe(
                    'Optional: specify a different group ID if the poke should happen in another group.'
                )
        })

        async _call(
            input: { userId: string; groupId?: string },
            _manager?: unknown,
            runnable?: unknown
        ) {
            try {
                const session = getSession(runnable)
                const { error, internal } = ensureOneBotSession(session)
                if (error) return error

                const params: Record<string, unknown> = { user_id: input.userId }
                const groupId =
                    input.groupId?.trim() ||
                    (session as unknown as { guildId?: string })?.guildId ||
                    session?.channelId ||
                    (session as unknown as { roomId?: string })?.roomId
                if (groupId) params.group_id = groupId

                if (typeof internal!._request === 'function') {
                    await internal!._request('send_poke', params)
                } else if (typeof internal!.sendPoke === 'function') {
                    await (internal!.sendPoke as (g: unknown, u: unknown) => Promise<void>)(
                        params.group_id,
                        params.user_id
                    )
                } else if (typeof internal!.pokeUser === 'function') {
                    await (internal!.pokeUser as (p: Record<string, unknown>) => Promise<void>)(
                        params
                    )
                } else {
                    throw new Error('当前适配器未实现 send_poke API。')
                }

                const location = params.group_id ? `群 ${params.group_id}` : '私聊'
                const message = `已在 ${location} 戳了一下 ${params.user_id}。`
                log?.('info', message)
                return message
            } catch (error) {
                log?.('warn', '戳一戳工具执行失败', error)
                return `戳一戳失败：${(error as Error).message}`
            }
        }
    })()
}
