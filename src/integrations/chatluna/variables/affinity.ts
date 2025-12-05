/**
 * 好感度变量提供者
 * 为 ChatLuna 提供当前用户好感度变量，直接从数据库读取
 */

import type { AffinityCache } from '../../../types'
import type { AffinityStore } from '../../../services/affinity/store'

interface ProviderConfigurable {
    session?: {
        platform?: string
        userId?: string
        selfId?: string
    }
}

export interface AffinityProviderDeps {
    cache: AffinityCache
    store: AffinityStore
}

export function createAffinityProvider(deps: AffinityProviderDeps) {
    const { cache, store } = deps

    return async (
        _args: unknown,
        _variables: unknown,
        configurable?: ProviderConfigurable
    ): Promise<number | string> => {
        const session = configurable?.session
        if (!session?.platform || !session?.userId || !session?.selfId) {
            return ''
        }

        const cached = cache.get(session.platform, session.userId)
        if (cached !== null) return cached

        const record = await store.load(session.selfId, session.userId)
        if (!record) return ''

        const affinity = record.affinity ?? 0
        cache.set(session.platform, session.userId, affinity)
        return affinity
    }
}

export type AffinityProvider = ReturnType<typeof createAffinityProvider>
