/**
 * 群信息变量提供者
 * 为 ChatLuna 提供当前群聊的信息
 */

import type { Session } from 'koishi'
import type { Config, LogFn } from '../../../types'
import { normalizeGroupList } from '../../../helpers/member'

interface ProviderConfigurable {
    session?: Session
}

interface GroupListItem {
    group_id?: string
    groupId?: string
    id?: string
    group_name?: string
    groupName?: string
    name?: string
    member_count?: number
    memberCount?: number
    create_time?: number | string
    createTime?: number | string
}

export interface GroupInfoProviderDeps {
    config: Config
    log?: LogFn
    fetchGroupList: (session: Session) => Promise<GroupListItem[] | null>
}

export function createGroupInfoProvider(deps: GroupInfoProviderDeps) {
    const { config, log, fetchGroupList } = deps

    return async (
        _args: unknown,
        _variables: unknown,
        configurable?: ProviderConfigurable
    ): Promise<string> => {
        const session = configurable?.session
        if (!session) return '暂无群信息。'
        if (!session.guildId) return ''
        if (session.platform !== 'onebot') return '当前平台暂不支持查询群列表。'

        const groupInfoCfg = config.groupInfo || config.otherVariables?.groupInfo || {
            includeMemberCount: true,
            includeCreateTime: true
        }

        try {
            const list = await fetchGroupList(session)
            if (!list || !list.length) return '未能获取当前群信息。'

            const targetId = String(session.guildId)
            const current = list.find((group) => {
                const id = group.group_id ?? group.groupId ?? group.id
                return id && String(id) === targetId
            })
            if (!current) return ''

            return normalizeGroupList([current], {
                includeMemberCount: groupInfoCfg.includeMemberCount !== false,
                includeCreateTime: groupInfoCfg.includeCreateTime !== false
            })
        } catch (error) {
            log?.('debug', '群列表变量解析失败', error)
            return '获取群列表失败。'
        }
    }
}

export type GroupInfoProvider = ReturnType<typeof createGroupInfoProvider>
