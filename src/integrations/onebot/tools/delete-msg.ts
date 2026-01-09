/**
 * 消息删除工具
 * 提供消息撤回功能
 */

import { z } from 'zod'
import { StructuredTool } from '@langchain/core/tools'
import type { Session } from 'koishi'
import type { LogFn } from '../../../types'
import { ensureOneBotSession, callOneBotAPI } from '../api'
import { getSession } from '../../chatluna/tools/types'

export interface DeleteMessageToolDeps {
    toolName: string
    log?: LogFn
}

export interface SendDeleteMessageParams {
    session: Session | null
    messageId: string
    log?: LogFn
}

export async function sendDeleteMessage(params: SendDeleteMessageParams): Promise<string> {
    const { session, messageId, log } = params
    if (!session) return 'No session context available.'

    const messageIdRaw = messageId.trim()
    if (!messageIdRaw) return 'messageId is required.'

    const numericId = /^\d+$/.test(messageIdRaw) ? Number(messageIdRaw) : messageIdRaw

    if (session.platform === 'onebot') {
        const { error, internal } = ensureOneBotSession(session)
        if (error) return error
        await callOneBotAPI(internal!, 'delete_msg', { message_id: numericId }, ['deleteMsg'])
        const success = `Message deleted by ID ${messageIdRaw}.`
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
        const success = `Message deleted by ID ${messageIdRaw}.`
        log?.('info', success)
        return success
    }

    return 'Delete message is not supported on this platform.'
}

export function createDeleteMessageTool(deps: DeleteMessageToolDeps) {
    const { toolName, log } = deps

    const tool = {
        name: toolName || 'delete_msg',
        description: 'Deletes (recalls) a message by messageId only. messageId is required.',
        schema: z.object({
            messageId: z.string().min(1, 'messageId is required').describe('Specific message ID to delete.')
        }),
        async _call(
            input: {
                messageId: string
            },
            _manager?: unknown,
            runnable?: unknown
        ) {
            try {
                const session = getSession(runnable)
                return sendDeleteMessage({ session, messageId: input.messageId, log })
            } catch (error) {
                log?.('warn', 'delete_msg failed', error)
                return `delete_msg failed: ${(error as Error).message}`
            }
        }
    }

    return tool as unknown as StructuredTool
}
