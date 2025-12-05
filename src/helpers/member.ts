/**
 * 成员信息辅助函数
 * 提供群成员信息获取、解析和渲染功能
 */

import type { Session } from 'koishi'
import type {
    MemberInfo,
    MemberInfoField,
    RenderMemberInfoOptions,
    GroupInfo,
    LogFn
} from '../types'
import { stripAtPrefix, pickFirst } from '../utils'
import { formatDateOnly, formatDateTime, normalizeTimestamp } from '../utils'
import { resolveRoleLabel } from './role-mapper'

export function translateGender(value: unknown): string {
    if (value == null) return ''
    const text = String(value).trim()
    if (!text) return ''
    const lower = text.toLowerCase()
    if (['male', 'man', 'm', '1', 'boy'].includes(lower)) return '男'
    if (['female', 'woman', 'f', '2', 'girl'].includes(lower)) return '女'
    if (['未知', 'unknown', '0', 'secret'].includes(lower)) return ''
    return text
}

export function collectNicknameCandidates(
    member: MemberInfo | null | undefined,
    userId: string,
    fallbackNames: string[] = []
): string[] {
    const candidates: (string | undefined)[] = [
        member?.card,
        member?.remark,
        member?.displayName,
        member?.nick,
        member?.nickname,
        member?.name,
        member?.user?.nickname,
        member?.user?.name,
        ...fallbackNames,
        userId
    ]
    return candidates.filter((v): v is string => Boolean(v))
}

interface RenderFieldOptions {
    userId: string
    fallbackNames?: string[]
    logUnknown?: boolean
    log?: LogFn
}

export function renderInfoField(
    fieldName: MemberInfoField,
    member: MemberInfo | null | undefined,
    session: Session | null | undefined,
    options: RenderFieldOptions
): string | null {
    const { userId, log } = options

    switch (fieldName) {
        case 'nickname': {
            const nameCandidates = collectNicknameCandidates(
                member,
                userId,
                options.fallbackNames
            )
            const name = stripAtPrefix(nameCandidates[0] || '')
            return name ? `name:${name}` : null
        }
        case 'userId':
            return userId ? `id:${userId}` : null
        case 'role': {
            const roleLabel =
                resolveRoleLabel(session, member, {
                    logUnknown: options.logUnknown,
                    logger: log
                }) || '群员'
            return `群内身份:${roleLabel}`
        }
        case 'level': {
            const level = pickFirst(
                member?.level,
                member?.levelName,
                member?.level_name,
                member?.level_info?.current_level,
                member?.level_info?.level
            )
            return level !== undefined && level !== null && level !== ''
                ? `群等级:${level}`
                : null
        }
        case 'title': {
            const title = pickFirst(
                member?.title,
                member?.specialTitle,
                member?.special_title
            )
            return title ? `头衔:${title}` : null
        }
        case 'gender': {
            const gender = translateGender(member?.sex ?? member?.gender ?? '')
            return gender ? `性别:${gender}` : null
        }
        case 'age': {
            const age = Number(member?.age)
            return Number.isFinite(age) && age > 0 ? `年龄:${age}` : null
        }
        case 'area': {
            const area = pickFirst(
                member?.area,
                member?.region,
                member?.location
            )
            return area ? `地区:${area}` : null
        }
        case 'joinTime': {
            const ts = normalizeTimestamp(
                pickFirst(
                    member?.join_time,
                    member?.joined_at,
                    member?.joinTime,
                    member?.joinedAt,
                    member?.joinTimestamp
                )
            )
            const formatted = formatDateOnly(ts)
            return formatted ? `入群:${formatted}` : null
        }
        case 'lastSentTime': {
            const ts = normalizeTimestamp(
                pickFirst(
                    member?.last_sent_time,
                    member?.lastSentTime,
                    member?.lastSpeakTimestamp
                )
            )
            const formatted = formatDateTime(ts)
            return formatted ? `活跃:${formatted}` : null
        }
        default:
            return null
    }
}

const DEFAULT_ITEMS: MemberInfoField[] = [
    'nickname',
    'userId',
    'role',
    'level',
    'title',
    'gender',
    'age',
    'area',
    'joinTime',
    'lastSentTime'
]

export function renderMemberInfo(
    session: Session | null | undefined,
    member: MemberInfo | null | undefined,
    userId: string,
    configItems: string[] | undefined,
    options: RenderMemberInfoOptions = {}
): string {
    const {
        fallbackNames = [],
        defaultItems = DEFAULT_ITEMS,
        logUnknown = false,
        log
    } = options

    const items: MemberInfoField[] = []
    const configuredItems =
        Array.isArray(configItems) && configItems.length
            ? configItems
            : defaultItems

    for (const item of configuredItems) {
        const key = String(item || '').trim() as MemberInfoField
        if (!key || items.includes(key)) continue
        items.push(key)
    }

    if (!items.length) items.push('nickname', 'userId')

    const parts: string[] = []
    for (const item of items) {
        const rendered = renderInfoField(item, member, session, {
            userId,
            fallbackNames,
            logUnknown,
            log
        })
        if (rendered) parts.push(rendered)
    }

    if (!parts.length) return userId ? `id:${userId}` : '未知用户'
    return parts.join(', ')
}

type FetchMemberFn = (
    session: Session,
    userId: string
) => Promise<MemberInfo | null>

export async function resolveUserInfo(
    session: Session,
    configItems: string[] | undefined,
    fetchMemberFn: FetchMemberFn,
    options: RenderMemberInfoOptions = {}
): Promise<string> {
    const userId = stripAtPrefix(session.userId || '')
    const candidates = [
        userId ? await fetchMemberFn(session, userId) : null,
        (session as unknown as { member?: MemberInfo })?.member,
        (session as unknown as { author?: MemberInfo })?.author,
        (session as unknown as { event?: { member?: MemberInfo } })?.event
            ?.member,
        (session as unknown as { event?: { sender?: MemberInfo } })?.event
            ?.sender,
        (session as unknown as { payload?: { sender?: MemberInfo } })?.payload
            ?.sender
    ].filter(Boolean) as MemberInfo[]

    const member = candidates[0] || null
    return renderMemberInfo(session, member, userId, configItems, {
        ...options,
        fallbackNames: [session.username].filter((v): v is string => Boolean(v))
    })
}

export async function resolveBotInfo(
    session: Session,
    configItems: string[] | undefined,
    fetchMemberFn: FetchMemberFn,
    options: RenderMemberInfoOptions = {}
): Promise<string> {
    const botId = stripAtPrefix(
        session.selfId ||
            (session as unknown as { bot?: { selfId?: string } }).bot?.selfId ||
            ''
    )
    const candidates = [
        botId ? await fetchMemberFn(session, botId) : null,
        (session as unknown as { self?: MemberInfo })?.self,
        (session as unknown as { bot?: { user?: MemberInfo } })?.bot?.user,
        (session as unknown as { event?: { self?: MemberInfo } })?.event?.self,
        (session as unknown as { event?: { bot?: MemberInfo } })?.event?.bot
    ].filter(Boolean) as MemberInfo[]

    const member = candidates[0] || null
    const fallbacks = [
        (session as unknown as { self?: { nickname?: string } })?.self
            ?.nickname,
        (session as unknown as { self?: { name?: string } })?.self?.name,
        (session as unknown as { bot?: { nickname?: string } })?.bot?.nickname,
        (session as unknown as { bot?: { name?: string } })?.bot?.name
    ].filter((v): v is string => Boolean(v))

    return renderMemberInfo(session, member, botId, configItems, {
        ...options,
        fallbackNames: fallbacks
    })
}

export function normalizeGroupList(
    groups: GroupInfo[],
    options: { includeMemberCount?: boolean; includeCreateTime?: boolean } = {}
): string {
    const { includeMemberCount = true, includeCreateTime = true } = options

    if (!Array.isArray(groups) || !groups.length) return '暂无群信息。'

    const lines = groups.map((group) => {
        const id = group.group_id ?? group.groupId ?? group.id ?? '未知群号'
        const name = group.group_name ?? group.groupName ?? group.name ?? '未命名群'
        const memberCount =
            group.member_count ?? group.memberCount ?? group.max_member_count

        let createTime = ''
        if (includeCreateTime) {
            const raw = group.create_time ?? group.createTime
            if (raw) {
                const timestamp = Number(raw)
                if (Number.isFinite(timestamp)) {
                    const date = new Date(
                        timestamp < 1e11 ? timestamp * 1000 : timestamp
                    )
                    if (!Number.isNaN(date.valueOf())) {
                        createTime = `，创建时间：${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                    }
                }
            }
        }

        const members = includeMemberCount
            ? `，人数: ${memberCount ?? '未知'}`
            : ''
        return `群号：${id}，群名称：${name}${members}${createTime}`
    })

    return lines.join('\n')
}

export async function fetchMember(
    session: Session,
    userId: string
): Promise<MemberInfo | null> {
    try {
        const guildId =
            session.guildId ||
            (session as unknown as { event?: { guild?: { id?: string } } })
                ?.event?.guild?.id
        if (!guildId) return null

        const bot = session.bot
        if (!bot) return null

        if (session.platform === 'onebot') {
            const internal = (bot as unknown as { internal?: Record<string, unknown> })?.internal
            if (internal) {
                if (typeof internal.getGroupMemberInfo === 'function') {
                    const result = await (internal.getGroupMemberInfo as (
                        groupId: string | number,
                        userId: string | number,
                        noCache?: boolean
                    ) => Promise<MemberInfo>)(Number(guildId), Number(userId), false)
                    if (result) return result
                } else if (typeof internal._request === 'function') {
                    const result = await (internal._request as (
                        action: string,
                        params: unknown
                    ) => Promise<MemberInfo>)('get_group_member_info', {
                        group_id: Number(guildId),
                        user_id: Number(userId),
                        no_cache: false
                    })
                    if (result) return result
                }
            }
        }

        if (typeof bot.getGuildMember === 'function') {
            const member = await bot.getGuildMember(guildId, userId)
            return member as MemberInfo | null
        }

        return null
    } catch {
        return null
    }
}

export async function resolveUserIdentity(
    session: Session,
    input: string
): Promise<{ userId: string; nickname: string } | null> {
    const stripped = stripAtPrefix(input)
    if (!stripped) return null

    if (/^\d+$/.test(stripped)) {
        const member = await fetchMember(session, stripped)
        const nickname = collectNicknameCandidates(member, stripped)[0] || stripped
        return { userId: stripped, nickname }
    }

    return null
}

export async function findMemberByName(
    session: Session,
    name: string,
    log?: LogFn
): Promise<{ userId: string; nickname: string } | null> {
    const searchName = name.trim().toLowerCase()
    if (!searchName) return null

    try {
        const guildId =
            session.guildId ||
            (session as unknown as { event?: { guild?: { id?: string } } })
                ?.event?.guild?.id
        if (!guildId) return null

        const bot = session.bot
        if (!bot || typeof bot.getGuildMemberList !== 'function') return null

        const list = await bot.getGuildMemberList(guildId)
        if (!list?.data) return null

        for (const member of list.data) {
            const info = member as MemberInfo
            const candidates = collectNicknameCandidates(info, info.userId || info.id || '')
            for (const candidate of candidates) {
                if (candidate.toLowerCase().includes(searchName)) {
                    const userId = info.userId || info.id || info.qq || info.uid || ''
                    return { userId, nickname: candidates[0] || userId }
                }
            }
        }
    } catch (error) {
        log?.('debug', '查找成员失败', error)
    }

    return null
}

export function resolveGroupId(session: Session): string {
    return String(
        session.guildId ||
            (session as unknown as { groupId?: string })?.groupId ||
            session.channelId ||
            (session as unknown as { roomId?: string })?.roomId ||
            ''
    ).trim()
}

export async function fetchGroupMemberIds(
    session: Session,
    log?: LogFn
): Promise<Set<string> | null> {
    try {
        const guildId = resolveGroupId(session)
        if (!guildId) return null

        const bot = session.bot
        if (!bot) return null

        const ids = new Set<string>()

        const internal = (bot as unknown as { internal?: Record<string, unknown> })?.internal
        if (internal) {
            let members: MemberInfo[] | null = null

            if (typeof internal.getGroupMemberList === 'function') {
                members = await (internal.getGroupMemberList as (groupId: string) => Promise<MemberInfo[]>)(guildId)
            } else if (typeof internal._request === 'function') {
                members = await (internal._request as (action: string, params: unknown) => Promise<MemberInfo[]>)(
                    'get_group_member_list',
                    { group_id: Number(guildId) }
                )
            }

            if (Array.isArray(members) && members.length > 0) {
                for (const member of members) {
                    const userId = String(member.user_id || member.userId || member.id || member.qq || member.uid || '')
                    if (userId) ids.add(userId)
                }
                return ids
            }
        }

        if (typeof bot.getGuildMemberList === 'function') {
            const list = await bot.getGuildMemberList(guildId)
            if (list?.data) {
                for (const member of list.data) {
                    const info = member as MemberInfo
                    const userId = info.userId || info.id || info.qq || info.uid || ''
                    if (userId) ids.add(userId)
                }
                return ids
            }
        }

        return null
    } catch (error) {
        log?.('debug', '获取群成员列表失败', error)
        return null
    }
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

export async function fetchGroupList(
    session: Session,
    log?: LogFn
): Promise<GroupListItem[] | null> {
    try {
        if (session.platform !== 'onebot') return null

        const bot = session.bot
        if (!bot) return null

        const internal = (bot as unknown as { internal?: Record<string, unknown> })?.internal

        const extractList = (response: unknown): GroupListItem[] | null => {
            if (Array.isArray(response) && response.length > 0) return response
            if (response && typeof response === 'object') {
                const obj = response as Record<string, unknown>
                if (Array.isArray(obj.data) && obj.data.length > 0) return obj.data
                if (Array.isArray(obj.result) && obj.result.length > 0) return obj.result
            }
            return null
        }

        if (internal) {
            if (typeof internal.getGroupList === 'function') {
                const response = await (internal.getGroupList as (noCache?: boolean) => Promise<unknown>)(false)
                const list = extractList(response)
                if (list) return list
            }

            if (typeof internal._request === 'function') {
                const response = await (internal._request as (
                    action: string,
                    params: unknown
                ) => Promise<unknown>)('get_group_list', { no_cache: false })
                const list = extractList(response)
                if (list) return list
            }
        }

        if (typeof bot.getGuildList === 'function') {
            const response = await bot.getGuildList()
            const data = extractList(response) || (response as { data?: unknown[] })?.data
            if (Array.isArray(data) && data.length > 0) {
                return data.map((guild) => ({
                    group_id: (guild as { id?: string }).id,
                    group_name: (guild as { name?: string }).name
                }))
            }
        }

        return null
    } catch (error) {
        log?.('debug', '获取群列表失败', error)
        return null
    }
}
