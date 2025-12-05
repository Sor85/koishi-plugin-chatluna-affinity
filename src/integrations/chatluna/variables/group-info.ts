/**
 * 群信息变量提供者
 * 为 ChatLuna 提供当前群聊的信息
 */

import type { Session } from 'koishi'
import type { Config, LogFn } from '../../../types'

interface ProviderConfigurable {
    session?: Session
}

interface GroupInfo {
    group_id?: string | number
    groupId?: string | number
    id?: string | number
    group_name?: string
    groupName?: string
    name?: string
    member_count?: number
    memberCount?: number
    max_member_count?: number
    create_time?: number | string
    createTime?: number | string
}

export interface GroupInfoProviderDeps {
    config: Config
    log?: LogFn
    fetchGroupList: (session: Session) => Promise<unknown[] | null>
}

async function fetchGroupInfo(session: Session): Promise<GroupInfo | null> {
    if (session.platform !== 'onebot') return null

    const bot = session.bot
    const internal = (bot as unknown as { internal?: Record<string, unknown> })?.internal
    if (!internal) return null

    const groupId = Number(session.guildId)
    if (!groupId || !Number.isFinite(groupId)) return null

    try {
        if (typeof internal.getGroupInfo === 'function') {
            return await (internal.getGroupInfo as (
                groupId: number,
                noCache?: boolean
            ) => Promise<GroupInfo>)(groupId, false)
        } else if (typeof internal._request === 'function') {
            return await (internal._request as (
                action: string,
                params: unknown
            ) => Promise<GroupInfo>)('get_group_info', {
                group_id: groupId,
                no_cache: false
            })
        }
    } catch {
        return null
    }

    return null
}

function formatGroupInfo(group: GroupInfo, options: { includeMemberCount: boolean; includeCreateTime: boolean }): string {
    const { includeMemberCount, includeCreateTime } = options

    const id = group.group_id ?? group.groupId ?? group.id ?? '未知群号'
    const name = group.group_name ?? group.groupName ?? group.name ?? '未命名群'
    const memberCount = group.member_count ?? group.memberCount ?? group.max_member_count

    let createTime = ''
    if (includeCreateTime) {
        const raw = group.create_time ?? group.createTime
        if (raw) {
            const timestamp = Number(raw)
            if (Number.isFinite(timestamp)) {
                const date = new Date(timestamp < 1e11 ? timestamp * 1000 : timestamp)
                if (!Number.isNaN(date.valueOf())) {
                    createTime = `，创建时间：${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                }
            }
        }
    }

    const members = includeMemberCount ? `，人数: ${memberCount ?? '未知'}` : ''
    return `群号：${id}，群名称：${name}${members}${createTime}`
}

export function createGroupInfoProvider(deps: GroupInfoProviderDeps) {
    const { config, log } = deps

    return async (
        _args: unknown,
        _variables: unknown,
        configurable?: ProviderConfigurable
    ): Promise<string> => {
        const session = configurable?.session
        if (!session) return '暂无群信息。'
        if (!session.guildId) return ''
        if (session.platform !== 'onebot') return '当前平台暂不支持查询群信息。'

        const groupInfoCfg = config.groupInfo || config.otherVariables?.groupInfo || {
            includeMemberCount: true,
            includeCreateTime: true
        }

        try {
            const groupInfo = await fetchGroupInfo(session)
            if (!groupInfo) return '未能获取当前群信息。'

            return formatGroupInfo(groupInfo, {
                includeMemberCount: groupInfoCfg.includeMemberCount !== false,
                includeCreateTime: groupInfoCfg.includeCreateTime !== false
            })
        } catch (error) {
            log?.('debug', '群信息变量解析失败', error)
            return '获取群信息失败。'
        }
    }
}

export type GroupInfoProvider = ReturnType<typeof createGroupInfoProvider>
