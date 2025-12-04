import type { Session } from 'koishi'
import type { Config, AffinityStore, AffinityCache } from '../types'
import type { HistoryEntry } from '../services/history'

interface ProviderConfigurable {
  session?: {
    platform?: string
    userId?: string
    selfId?: string
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
  return async (_args: unknown, _variables: unknown, configurable?: ProviderConfigurable): Promise<number | string> => {
    const session = configurable?.session
    if (!session?.platform || !session?.userId || !session?.selfId) {
      return ''
    }

    // 先尝试从缓存获取（缓存中存储的是计算后的综合好感度）
    const cached = cache.get(session.platform, session.userId)
    if (cached !== null) return cached

    // 检查是否有手动配置的特殊关系（可能突破上限）
    const manual = store.findManualRelationship(session.platform, session.userId)
    const hasManualOverride = !!manual?.relation

    // 从数据库加载记录（不自动创建）
    const record = await store.load(session.selfId, session.userId)

    // 如果没有记录，返回空（首次对话时好感度未初始化）
    if (!record) {
      return ''
    }

    // 根据长期好感度和系数计算综合好感度
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

    // 检查手动配置的特殊关系（最高优先级）
    const manual = store.findManualRelationship(platform, userId)
    
    // 需要 selfId 来查询数据库
    const selfId = session?.selfId
    if (!selfId) return ''
    
    // 从数据库加载记录
    const record = await store.load(selfId, userId)
    
    // 首次对话未初始化时返回空（好感度和关系都不显示）
    if (!record) return ''
    
    // 特殊关系配置优先
    if (manual?.relation) return manual.note ? `${manual.relation}（${manual.note}）` : manual.relation
    
    // 其次使用数据库中存储的关系
    if (record.relation) return record.relation
    
    // 最后根据好感度等级推断关系
    const affinity = record.affinity
    if (typeof affinity === 'number') {
      const level = store.resolveLevelByAffinity(affinity)
      if (!level) return ''
      return level.note ? `${level.relation}（${level.note}）` : level.relation
    }
    return ''
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
      const record = await store.load(session.selfId, userId)
      const manual = store.findManualRelationship(session.platform, userId)
      // 首次对话时未初始化，跳过该用户
      if (!record) return null
      const affinity = record.affinity
      const clamped = store.clamp(affinity)
      const level = store.resolveLevelByAffinity(clamped)
      const relation = manual?.relation || record?.relation || level?.relation || '未知'
      const name = username || record?.nickname || userId
      return `id:${userId} name:${name} affinity:${clamped} relationship:${relation}`
    }))

    return results.filter(Boolean).join('\n')
  }
}
