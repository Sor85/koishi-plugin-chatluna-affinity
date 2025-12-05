/**
 * 用户信息变量提供者
 * 为 ChatLuna 提供当前用户的详细信息
 */

import type { Session } from 'koishi'
import type { Config, MemberInfo, LogFn } from '../../../types'
import { renderMemberInfo, resolveUserInfo as resolveUserInfoHelper } from '../../../helpers/member'
import { DEFAULT_MEMBER_INFO_ITEMS } from '../../../constants'

interface ProviderConfigurable {
    session?: Session
}

export interface UserInfoProviderDeps {
    config: Config
    log?: LogFn
    fetchMember: (session: Session, userId: string) => Promise<MemberInfo | null>
}

export function createUserInfoProvider(deps: UserInfoProviderDeps) {
    const { config, log, fetchMember } = deps
    const defaultItems = DEFAULT_MEMBER_INFO_ITEMS

    return async (
        _args: unknown,
        _variables: unknown,
        configurable?: ProviderConfigurable
    ): Promise<string> => {
        const session = configurable?.session
        if (!session?.userId) return '未知用户'

        const userInfoConfig = config.userInfo || config.otherVariables?.userInfo || {
            variableName: 'userInfo',
            items: defaultItems
        }

        try {
            return await resolveUserInfoHelper(session, userInfoConfig.items || [...defaultItems], fetchMember, {
                defaultItems: [...defaultItems],
                logUnknown: config.debugLogging,
                log
            })
        } catch {
            return `${session.username || session.userId || '未知用户'}`
        }
    }
}

export type UserInfoProvider = ReturnType<typeof createUserInfoProvider>
