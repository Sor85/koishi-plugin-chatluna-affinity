/**
 * 上下文好感度变量提供者
 * 为 ChatLuna 提供最近消息用户的好感度概览，直接从数据库读取
 */

import type { Session } from 'koishi'
import type { Config } from '../../../types'
import type { AffinityStore } from '../../../services/affinity/store'
import type { HistoryEntry } from '../../../services/message/history'

interface ProviderConfigurable {
    session?: Session
}

export interface ContextAffinityProviderDeps {
    config: Config
    store: AffinityStore
    fetchEntries?: (session: Session, count: number) => Promise<HistoryEntry[]>
}

export function createContextAffinityProvider(deps: ContextAffinityProviderDeps) {
    const { config, store, fetchEntries } = deps

    return async (
        _args: unknown,
        _variables: unknown,
        configurable?: ProviderConfigurable
    ): Promise<string> => {
        const overview = config.contextAffinityOverview
        const session = configurable?.session
        if (!session?.platform) return ''

        if (typeof fetchEntries !== 'function') return ''

        const windowSize = Math.max(1, overview?.messageWindow ?? 20)
        const entries = await fetchEntries(session, windowSize)
        if (!entries?.length) return ''

        const orderedUsers: { userId: string; username: string; timestamp: number }[] = []
        const seen = new Set<string>()

        for (const entry of entries) {
            const userId = entry.userId
            if (!userId || userId === session.selfId) continue
            if (seen.has(userId)) continue
            seen.add(userId)
            orderedUsers.push({
                userId,
                username: entry.username || userId,
                timestamp: entry.timestamp
            })
        }

        if (!orderedUsers.length) return ''

        const results = await Promise.all(
            orderedUsers.map(async ({ userId, username }) => {
                const record = await store.load(session.selfId, userId)
                if (!record) return null
                const affinity = record.affinity ?? 0
                const relation = record.specialRelation || record.relation || '未知'
                const name = username || record?.nickname || userId
                return `id:${userId} name:${name} affinity:${affinity} relationship:${relation}`
            })
        )

        return results.filter(Boolean).join('\n')
    }
}

export type ContextAffinityProvider = ReturnType<typeof createContextAffinityProvider>
