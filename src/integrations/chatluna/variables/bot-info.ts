/**
 * 机器人信息变量提供者
 * 为 ChatLuna 提供机器人自身的详细信息
 */

import type { Session } from 'koishi'
import type { Config, MemberInfo, LogFn } from '../../../types'
import { resolveBotInfo as resolveBotInfoHelper } from '../../../helpers/member'
import { DEFAULT_MEMBER_INFO_ITEMS } from '../../../constants'

interface ProviderConfigurable {
    session?: Session
}

export interface BotInfoProviderDeps {
    config: Config
    log?: LogFn
    fetchMember: (session: Session, userId: string) => Promise<MemberInfo | null>
}

export function createBotInfoProvider(deps: BotInfoProviderDeps) {
    const { config, log, fetchMember } = deps
    const defaultItems = DEFAULT_MEMBER_INFO_ITEMS

    return async (
        _args: unknown,
        _variables: unknown,
        configurable?: ProviderConfigurable
    ): Promise<string> => {
        const session = configurable?.session
        if (!session) return '未知机器人'

        const botInfoConfig = config.botInfo || config.otherVariables?.botInfo || {
            variableName: 'botInfo',
            items: defaultItems
        }

        try {
            return await resolveBotInfoHelper(session, botInfoConfig.items || [...defaultItems], fetchMember, {
                defaultItems: [...defaultItems],
                logUnknown: config.debugLogging,
                log
            })
        } catch {
            return `${session.selfId || '未知机器人'}`
        }
    }
}

export type BotInfoProvider = ReturnType<typeof createBotInfoProvider>
