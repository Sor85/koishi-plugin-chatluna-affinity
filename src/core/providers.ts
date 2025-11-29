import type { Session } from 'koishi'
import type { Config, AffinityStore, AffinityCache } from '../types'
import type { HistoryEntry } from '../services/history'

interface ProviderConfigurable {
  session?: {
    platform?: string
    userId?: string
  }
}

interface ProviderDeps {
  config: Config
  cache: AffinityCache
  store: AffinityStore
}

interface ContextHistory {
  fetchEntries?: (session: Session, count: number) => Promise<HistoryEntry[]>
}

export function createAffinityProvider({ config, cache, store }: ProviderDeps) {
  return async (_args: unknown, _variables: unknown, configurable?: ProviderConfigurable): Promise<number> => {
    const session = configurable?.session
    if (!session?.platform || !session?.userId) {
      return store.defaultInitial()
    }

    // 先尝试从缓存获取（缓存中存储的是计算后的综合好感度）
    const cached = cache.get(session.platform, session.userId)
    if (cached !== null) return cached

    // 检查是否有手动配置的特殊关系（可能突破上限）
    const manual = store.findManualRelationship(session.platform, session.userId)
    const hasManualOverride = manual && typeof manual.initialAffinity === 'number'

    // 从数据库加载记录（不自动创建）
    const record = await store.load(session.platform, session.userId)

    // 如果没有记录，返回默认初始值或手动配置的值
    if (!record) {
      const fallback = hasManualOverride ? manual.initialAffinity! : store.defaultInitial()
      cache.set(session.platform, session.userId, fallback)
      return fallback
    }

    // 如果有保存的综合好感度覆盖值，直接使用
    const affinityOverride = (record as unknown as { affinityOverride?: number }).affinityOverride
    if (typeof affinityOverride === 'number') {
      // 特殊关系不受 clamp 限制
      const result = hasManualOverride ? affinityOverride : store.clamp(affinityOverride)
      cache.set(session.platform, session.userId, result)
      return result
    }

    // 否则根据长期好感度和系数计算综合好感度
    const longTermAffinity = record.longTermAffinity ?? record.affinity ?? 0
    let coefficient = config.affinityDynamics?.coefficient?.base ?? 1.0
    if (record.coefficientState) {
      try {
        const parsed = typeof record.coefficientState === 'string' ? JSON.parse(record.coefficientState) : record.coefficientState
        if (typeof parsed?.coefficient === 'number') coefficient = parsed.coefficient
      } catch { /* ignore */ }
    }
    const compositeAffinity = Math.round(coefficient * longTermAffinity)

    // 特殊关系不受 clamp 限制
    const result = hasManualOverride ? compositeAffinity : store.clamp(compositeAffinity)
    cache.set(session.platform, session.userId, result)
    return result
  }
}

export function createRelationshipProvider({ store }: Pick<ProviderDeps, 'store'>) {
  return async (args: unknown[] | undefined, _variables: unknown, configurable?: ProviderConfigurable): Promise<string> => {
    const session = configurable?.session
    const [userArg, platformArg] = args || []
    const userId = String(userArg || session?.userId || '').trim()
    const platform = String(platformArg || session?.platform || '').trim()
    if (!userId) return ''

    const manual = store.findManualRelationship(platform, userId)
    if (manual?.relation) return manual.note ? `${manual.relation}（${manual.note}）` : manual.relation

    const record = await store.load(platform, userId)
    const affinity = record?.affinity
    if (typeof affinity === 'number') {
      const level = store.resolveLevelByAffinity(affinity)
      if (!level) return ''
      return level.note ? `${level.relation}（${level.note}）` : level.relation
    }
    const fallback = store.defaultInitial()
    const level = store.resolveLevelByAffinity(fallback)
    return level ? level.relation : ''
  }
}

export function createContextAffinityProvider({ config, store, history }: { config: Config; store: AffinityStore; history?: ContextHistory }) {
  return async (_args: unknown, _variables: unknown, configurable?: ProviderConfigurable & { session?: Session }): Promise<string> => {
    const overview = config.contextAffinityOverview
    const session = configurable?.session
    if (!session?.platform) return ''

    const fetchEntries = history?.fetchEntries
    if (typeof fetchEntries !== 'function') return ''

    const windowSize = Math.max(1, overview?.messageWindow ?? 20)
    const entries = await fetchEntries(session as Session, windowSize)
    if (!entries?.length) return ''

    const orderedUsers: { userId: string; username: string; timestamp: number }[] = []
    const seen = new Set<string>()

    for (const entry of entries) {
      const userId = entry.userId
      if (!userId || userId === session.selfId) continue
      if (seen.has(userId)) continue
      seen.add(userId)
      orderedUsers.push({ userId, username: entry.username || userId, timestamp: entry.timestamp })
    }

    if (!orderedUsers.length) return ''

    const results = await Promise.all(orderedUsers.map(async ({ userId, username }) => {
      const record = await store.load(session.platform, userId)
      const manual = store.findManualRelationship(session.platform, userId)
      const affinity = typeof record?.affinity === 'number' ? record.affinity : store.defaultInitial()
      const clamped = store.clamp(affinity)
      const level = store.resolveLevelByAffinity(clamped)
      const relation = manual?.relation || level?.relation || '未知'
      const name = username || record?.nickname || userId
      return `id:${userId} name:${name} affinity:${clamped} relationship:${relation}`
    }))

    return results.join('\n')
  }
}
