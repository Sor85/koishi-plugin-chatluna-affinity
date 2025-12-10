/**
 * 关系变量提供者
 * 为 ChatLuna 提供当前用户关系变量，直接从数据库读取
 */

import type { AffinityStore } from '../../../services/affinity/store'

interface ProviderConfigurable {
    session?: {
        platform?: string
        userId?: string
        selfId?: string
    }
}

export interface RelationshipProviderDeps {
    store: AffinityStore
}

export function createRelationshipProvider(deps: RelationshipProviderDeps) {
    const { store } = deps

    return async (
        args: unknown[] | undefined,
        _variables: unknown,
        configurable?: ProviderConfigurable
    ): Promise<string> => {
        const session = configurable?.session
        const [userArg] = args || []
        const userId = String(userArg || session?.userId || '').trim()
        if (!userId) return ''

        const selfId = session?.selfId
        if (!selfId) return ''

        const record = await store.load(selfId, userId)
        return record?.specialRelation || record?.relation || ''
    }
}

export type RelationshipProvider = ReturnType<typeof createRelationshipProvider>
