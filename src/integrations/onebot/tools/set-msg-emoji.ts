/**
 * 消息表情工具
 * 使用表情 ID 对指定消息点表情
 */

import { z } from 'zod'
import { StructuredTool } from '@langchain/core/tools'
import type { LogFn } from '../../../types'
import type { Session } from 'koishi'
import { ensureOneBotSession, callOneBotAPI } from '../api'
import { getSession } from '../../chatluna/tools/types'

export interface SetMsgEmojiToolDeps {
    toolName: string
    log?: LogFn
}

export interface SendMsgEmojiParams {
    session: Session | null
    messageId: string
    emojiId: string
    log?: LogFn
}

export async function sendMsgEmoji(params: SendMsgEmojiParams): Promise<string> {
    try {
        const { session, messageId, emojiId, log } = params
        if (!session) return 'No session context available.'
        if (session.platform !== 'onebot') return 'This tool only supports OneBot platform.'

        const messageIdRaw = messageId.trim()
        const emojiIdRaw = emojiId.trim()
        if (!messageIdRaw) return 'message_id is required.'
        if (!emojiIdRaw) return 'emoji_id is required.'

        const numericMessageId = /^\d+$/.test(messageIdRaw) ? Number(messageIdRaw) : messageIdRaw

        const { error, internal } = ensureOneBotSession(session)
        if (error) return error

        await callOneBotAPI(
            internal!,
            'set_msg_emoji_like',
            { message_id: numericMessageId, emoji_id: emojiIdRaw },
            ['setMsgEmojiLike']
        )

        const success = `Emoji ${emojiIdRaw} sent to message ${messageIdRaw}.`
        log?.('info', success)
        return success
    } catch (error) {
        params.log?.('warn', 'set_msg_emoji failed', error)
        return `set_msg_emoji failed: ${(error as Error).message}`
    }
}

export function createSetMsgEmojiTool(deps: SetMsgEmojiToolDeps): StructuredTool {
    const { toolName, log } = deps

    // @ts-ignore - Type instantiation depth issue with zod + StructuredTool
    return new (class extends StructuredTool {
        name = toolName || 'set_msg_emoji'
        description =
            'React to a message with an emoji by messageId. Required: message_id and emoji_id (emoji ID).'
        schema = z.object({
            messageId: z.string().min(1, 'message_id is required').describe('Target message ID.'),
            emojiId: z.string().min(1, 'emoji_id is required').describe('Emoji ID to send.')
        })

        async _call(
            input: {
                messageId: string
                emojiId: string
            },
            _manager?: unknown,
            runnable?: unknown
        ) {
            const session = getSession(runnable)
            return sendMsgEmoji({ session, messageId: input.messageId, emojiId: input.emojiId, log })
        }
    })() as StructuredTool
}
