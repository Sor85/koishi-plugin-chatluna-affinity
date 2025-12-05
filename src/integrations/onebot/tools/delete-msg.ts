/**
 * 消息删除工具
 * 提供消息撤回功能
 */

import { z } from 'zod'
import { StructuredTool } from '@langchain/core/tools'
import type { Context, Session } from 'koishi'
import type { LogFn } from '../../../types'
import type { MessageStore } from '../../../services/message/store'
import { ensureOneBotSession, callOneBotAPI } from '../api'
import { getSession } from '../../chatluna/tools/types'

export interface DeleteMessageToolDeps {
    ctx: Context
    toolName: string
    messageStore?: MessageStore
    log?: LogFn
}

export function createDeleteMessageTool(deps: DeleteMessageToolDeps) {
    const { toolName, messageStore, log } = deps

    // @ts-expect-error - Type instantiation depth issue with zod + StructuredTool
    return new (class extends StructuredTool {
        name = toolName || 'delete_msg'
        description = `Deletes (recalls) a message. You can specify the message by:
1. messageId: directly provide the message ID
2. lastN: delete the Nth most recent message (1 = most recent). Can combine with userId to target a specific user.
3. contentMatch: delete the most recent message containing this keyword. Can combine with userId.
4. If none provided, will try to use the quoted message.
As a group admin, you can delete messages from any user.`
        schema = z.object({
            messageId: z.string().optional().describe('Specific message ID to delete.'),
            lastN: z
                .number()
                .int()
                .min(1)
                .optional()
                .describe(
                    'Delete the Nth most recent message (1 = latest). Example: 1 to delete the latest message, 2 for second latest.'
                ),
            userId: z
                .string()
                .optional()
                .describe(
                    "Target user ID. Use with lastN or contentMatch to delete a specific user's message."
                ),
            contentMatch: z
                .string()
                .optional()
                .describe(
                    'Delete the most recent message containing this keyword/phrase.'
                )
        })

        async _call(
            input: {
                messageId?: string
                lastN?: number
                userId?: string
                contentMatch?: string
            },
            _manager?: unknown,
            runnable?: unknown
        ) {
            try {
                const session = getSession(runnable)
                if (!session) return 'No session context available.'

                let resolvedMessageId = ''
                let matchInfo = ''

                if (typeof input.messageId === 'string' && input.messageId.trim()) {
                    resolvedMessageId = input.messageId.trim()
                    matchInfo = `by ID ${resolvedMessageId}`
                } else if (input.lastN && input.lastN > 0 && messageStore) {
                    const found = messageStore.findByLastN(session, input.lastN, input.userId)
                    if (found) {
                        resolvedMessageId = found.messageId
                        const userInfo = input.userId
                            ? ` from user ${found.username}(${found.userId})`
                            : ''
                        matchInfo = `#${input.lastN} recent message${userInfo}: "${found.content.slice(0, 30)}${found.content.length > 30 ? '...' : ''}"`
                    } else {
                        const userHint = input.userId ? ` from user ${input.userId}` : ''
                        return `No message found at position ${input.lastN}${userHint}.`
                    }
                } else if (input.contentMatch && messageStore) {
                    const found = messageStore.findByContent(
                        session,
                        input.contentMatch,
                        input.userId
                    )
                    if (found) {
                        resolvedMessageId = found.messageId
                        const userInfo = input.userId
                            ? ` from user ${found.username}(${found.userId})`
                            : ''
                        matchInfo = `matching "${input.contentMatch}"${userInfo}: "${found.content.slice(0, 30)}${found.content.length > 30 ? '...' : ''}"`
                    } else {
                        const userHint = input.userId ? ` from user ${input.userId}` : ''
                        return `No message found containing "${input.contentMatch}"${userHint}.`
                    }
                } else {
                    resolvedMessageId =
                        (session as unknown as { quote?: { id?: string } })?.quote?.id ||
                        (
                            session as unknown as {
                                event?: { quote?: { messageId?: string }; message?: { id?: string } }
                            }
                        )?.event?.quote?.messageId ||
                        (session as unknown as { event?: { message?: { id?: string } } })?.event
                            ?.message?.id ||
                        ''
                    if (resolvedMessageId) {
                        matchInfo = 'quoted message'
                    }
                }

                if (!resolvedMessageId) {
                    return 'No message found to delete. Please provide messageId, use lastN/contentMatch to search, or quote a message.'
                }

                const messageIdRaw = resolvedMessageId.trim()
                const numericId = /^\d+$/.test(messageIdRaw) ? Number(messageIdRaw) : messageIdRaw

                if (session.platform === 'onebot') {
                    const { error, internal } = ensureOneBotSession(session)
                    if (error) return error
                    await callOneBotAPI(internal!, 'delete_msg', { message_id: numericId }, [
                        'deleteMsg'
                    ])
                    const success = `Message deleted (${matchInfo}).`
                    log?.('info', success)
                    return success
                }

                const bot = session.bot as unknown as {
                    deleteMessage?: (channelId: string, messageId: string) => Promise<void>
                }
                if (typeof bot?.deleteMessage === 'function') {
                    const channelId =
                        session.channelId ||
                        (session as unknown as { guildId?: string })?.guildId ||
                        (session as unknown as { roomId?: string })?.roomId ||
                        (session as unknown as { channel?: { id?: string } })?.channel?.id ||
                        ''
                    if (!channelId) return 'Cannot determine channel to delete message.'
                    await bot.deleteMessage(channelId, messageIdRaw)
                    const success = `Message deleted (${matchInfo}).`
                    log?.('info', success)
                    return success
                }

                return 'Delete message is not supported on this platform.'
            } catch (error) {
                log?.('warn', 'delete_msg failed', error)
                return `delete_msg failed: ${(error as Error).message}`
            }
        }
    })()
}
