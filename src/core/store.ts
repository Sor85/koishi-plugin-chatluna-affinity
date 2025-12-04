import type { Context, Session } from 'koishi'
import type {
  Config,
  AffinityRecord,
  AffinityState,
  AffinityStore,
  ActionStats,
  CoefficientState,
  BlacklistEntry,
  BlacklistDetail,
  TemporaryBlacklistEntry,
  CombinedState,
  InitialRange,
  RelationshipLevel,
  ManualRelationship,
  SessionSeed,
  SaveExtra,
  ClampFn,
  LogFn
} from '../types'
import { formatBeijingTimestamp, clamp as clampUtil } from '../utils/common'

export const MODEL_NAME = 'chatluna_affinity'

declare module 'koishi' {
  interface Tables {
    [MODEL_NAME]: AffinityRecord
  }
}

function extendDatabaseModel(ctx: Context): void {
  ctx.model.extend(MODEL_NAME, {
    selfId: { type: 'string', length: 64 },
    userId: { type: 'string', length: 64 },
    nickname: { type: 'string', length: 255, nullable: true },
    affinity: { type: 'integer', initial: 0 },
    relation: { type: 'string', length: 64, nullable: true },
    shortTermAffinity: { type: 'integer', nullable: true },
    longTermAffinity: { type: 'integer', nullable: true },
    chatCount: { type: 'integer', nullable: true },
    actionStats: { type: 'text', nullable: true },
    lastInteractionAt: { type: 'timestamp', nullable: true },
    coefficientState: { type: 'text', nullable: true }
  }, { primary: ['selfId', 'userId'] })
}

export function createAffinityStore(ctx: Context, config: Config, log: LogFn): AffinityStore {
  extendDatabaseModel(ctx)
  const blacklistSet = new Set<string>()

  const resolveInitialMin = () => Number.isFinite(config.initialRandomMin) ? config.initialRandomMin : config.baseAffinityConfig?.initialRandomMin ?? 20
  const resolveInitialMax = () => Number.isFinite(config.initialRandomMax) ? config.initialRandomMax : config.baseAffinityConfig?.initialRandomMax ?? 40
  const resolveMin = () => Number.isFinite(config.min) ? config.min : config.baseAffinityConfig?.min ?? 0
  const resolveMax = () => Number.isFinite(config.max) ? config.max : config.baseAffinityConfig?.max ?? 100

  const clamp = (value: number): number => clampUtil(Math.round(value), resolveMin(), resolveMax())
  const randomInitial = (): number => { const low = resolveInitialMin(); const high = resolveInitialMax(); return clamp(low + Math.floor(Math.random() * (high - low + 1))) }
  const defaultInitial = (): number => clamp(Math.floor((resolveInitialMin() + resolveInitialMax()) / 2))
  const initialRange = (): InitialRange => ({ low: resolveInitialMin(), high: resolveInitialMax(), min: resolveMin(), max: resolveMax() })

  const composeState = (longTerm: number, shortTerm: number): CombinedState => ({ affinity: clamp(longTerm), longTermAffinity: clamp(longTerm), shortTermAffinity: Math.round(shortTerm) })
  const createInitialState = (base: number): CombinedState => composeState(base, 0)

  const makeKey = (platform: string, userId: string) => `${platform}:${userId}`

  for (const entry of config.autoBlacklist || []) {
    if (entry?.platform && entry?.userId) blacklistSet.add(makeKey(entry.platform, entry.userId))
  }

  const applyConfigUpdate = (): void => {
    const scope = (ctx as unknown as { scope?: { update?: (config: unknown, silent?: boolean) => void } }).scope
    scope?.update?.(config, true)
  }

  const isBlacklisted = (platform: string, userId: string, _channelId?: string): boolean => blacklistSet.has(makeKey(platform, userId))

  const recordBlacklist = (platform: string, userId: string, detail?: BlacklistDetail): BlacklistEntry | null => {
    const key = makeKey(platform, userId)
    if (blacklistSet.has(key)) return null
    blacklistSet.add(key)
    const entry: BlacklistEntry = { platform, userId, blockedAt: formatBeijingTimestamp(new Date()), nickname: detail?.nickname || '', note: detail?.note || '', channelId: detail?.channelId || detail?.guildId || detail?.groupId || '' }
    if (!config.autoBlacklist) config.autoBlacklist = []
    config.autoBlacklist.push(entry)
    applyConfigUpdate()
    return entry
  }

  const removeBlacklist = (platform: string, userId: string, _channelId?: string): boolean => {
    const key = makeKey(platform, userId)
    if (!blacklistSet.has(key)) return false
    blacklistSet.delete(key)
    if (config.autoBlacklist) {
      const index = config.autoBlacklist.findIndex((e) => e.platform === platform && e.userId === userId)
      if (index >= 0) config.autoBlacklist.splice(index, 1)
      applyConfigUpdate()
    }
    return true
  }

  const listBlacklist = (platform?: string, _channelId?: string): BlacklistEntry[] => {
    const all = config.autoBlacklist || []
    if (!platform) return all
    return all.filter((entry) => entry.platform === platform)
  }

  // 临时拉黑功能
  const cleanExpiredTemporaryBlacklist = (): void => {
    if (!config.temporaryBlacklist?.length) return
    const now = Date.now()
    const before = config.temporaryBlacklist.length
    config.temporaryBlacklist = config.temporaryBlacklist.filter((entry) => {
      const expiresAt = new Date(entry.expiresAt).getTime()
      return expiresAt > now
    })
    if (config.temporaryBlacklist.length !== before) {
      applyConfigUpdate()
    }
  }

  const isTemporarilyBlacklisted = (platform: string, userId: string): TemporaryBlacklistEntry | null => {
    cleanExpiredTemporaryBlacklist()
    const list = config.temporaryBlacklist || []
    return list.find((entry) => entry.platform === platform && entry.userId === userId) || null
  }

  const recordTemporaryBlacklist = (
    platform: string,
    userId: string,
    durationHours: number,
    penalty: number,
    detail?: BlacklistDetail
  ): TemporaryBlacklistEntry | null => {
    // 检查是否已在临时黑名单中
    const existing = isTemporarilyBlacklisted(platform, userId)
    if (existing) return null

    const now = new Date()
    const expiresAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000)
    const entry: TemporaryBlacklistEntry = {
      platform,
      userId,
      blockedAt: formatBeijingTimestamp(now),
      expiresAt: formatBeijingTimestamp(expiresAt),
      nickname: detail?.nickname || '',
      note: detail?.note || '',
      channelId: detail?.channelId || detail?.guildId || detail?.groupId || '',
      durationHours: `${durationHours}小时`,
      penalty: `-${penalty}`
    }

    if (!config.temporaryBlacklist) config.temporaryBlacklist = []
    config.temporaryBlacklist.push(entry)
    applyConfigUpdate()
    return entry
  }

  const removeTemporaryBlacklist = (platform: string, userId: string): boolean => {
    if (!config.temporaryBlacklist) return false
    const index = config.temporaryBlacklist.findIndex((e) => e.platform === platform && e.userId === userId)
    if (index < 0) return false
    config.temporaryBlacklist.splice(index, 1)
    applyConfigUpdate()
    return true
  }

  const listTemporaryBlacklist = (platform?: string): TemporaryBlacklistEntry[] => {
    cleanExpiredTemporaryBlacklist()
    const all = config.temporaryBlacklist || []
    if (!platform) return all
    return all.filter((entry) => entry.platform === platform)
  }

  const resolveLevelByAffinity = (value: number): RelationshipLevel | null => {
    const levels = config.relationshipAffinityLevels || []
    for (const level of levels) {
      if (value >= level.min && value <= level.max) return level
    }
    return null
  }

  const resolveLevelByRelation = (relationName: string): RelationshipLevel | null => {
    const levels = config.relationshipAffinityLevels || []
    return levels.find((level) => level.relation === relationName) || null
  }

  const findManualRelationship = (platform: string, userId: string): ManualRelationship | null => {
    const list = config.relationships || []
    return list.find((r) => r.userId === userId) || null
  }

  const updateRelationshipConfig = (userId: string, relationName: string): void => {
    if (!config.relationships) config.relationships = []
    const existing = config.relationships.find((r) => r.userId === userId)
    if (existing) {
      existing.relation = relationName
    } else {
      config.relationships.push({ userId, relation: relationName })
    }
    applyConfigUpdate()
  }

  const removeRelationshipConfig = async (selfId: string, userId: string): Promise<boolean> => {
    if (!config.relationships) return false
    const index = config.relationships.findIndex((r) => r.userId === userId)
    if (index < 0) return false
    config.relationships.splice(index, 1)
    applyConfigUpdate()
    // 同步更新数据库，将关系设置为 null
    const existing = await load(selfId, userId)
    if (existing) {
      await ctx.database.upsert(MODEL_NAME, [{ ...existing, relation: null } as AffinityRecord])
    }
    return true
  }

  const syncRelationshipsToDatabase = async (selfId?: string): Promise<void> => {
    // 获取配置中的所有用户 ID
    const configUserIds = new Set((config.relationships || []).map((r) => r.userId))
    // 获取数据库中所有有关系的记录
    const query: Record<string, unknown> = { relation: { $ne: null } }
    if (selfId) query.selfId = selfId
    const records = await ctx.database.get(MODEL_NAME, query as Record<string, string>)
    // 对于数据库中有关系但配置中没有的记录，清除其关系
    const toUpdate: AffinityRecord[] = []
    for (const record of records) {
      if (!configUserIds.has(record.userId)) {
        toUpdate.push({ ...record, relation: null } as AffinityRecord)
      }
    }
    // 对于配置中有关系的记录，确保数据库中的关系是正确的
    for (const rel of config.relationships || []) {
      const record = records.find((r) => r.userId === rel.userId && (!selfId || r.selfId === selfId))
      if (record && record.relation !== rel.relation) {
        toUpdate.push({ ...record, relation: rel.relation } as AffinityRecord)
      }
    }
    if (toUpdate.length > 0) {
      await ctx.database.upsert(MODEL_NAME, toUpdate)
    }
  }

  const extractState = (record: AffinityRecord | null): AffinityState => {
    if (!record) {
      const base = randomInitial()
      return { affinity: base, longTermAffinity: base, shortTermAffinity: 0, chatCount: 0, actionStats: { entries: [], total: 0, counts: { increase: 0, decrease: 0, hold: 0 } }, lastInteractionAt: null, coefficientState: { streak: 0, coefficient: 1, decayPenalty: 0, streakBoost: 0, inactivityDays: 0, lastInteractionAt: null }, isNew: true }
    }
    let actionStats: ActionStats = { entries: [], total: 0, counts: { increase: 0, decrease: 0, hold: 0 } }
    if (record.actionStats) {
      try { const parsed = JSON.parse(record.actionStats); actionStats = { entries: parsed.entries || [], total: parsed.total || 0, counts: parsed.counts || { increase: 0, decrease: 0, hold: 0 } } } catch { /* ignore */ }
    }
    let coefficientState: CoefficientState = { streak: 0, coefficient: 1, decayPenalty: 0, streakBoost: 0, inactivityDays: 0, lastInteractionAt: null }
    if (record.coefficientState) {
      try { const parsed = JSON.parse(record.coefficientState); coefficientState = { streak: parsed.streak || 0, coefficient: parsed.coefficient ?? 1, decayPenalty: parsed.decayPenalty || 0, streakBoost: parsed.streakBoost || 0, inactivityDays: parsed.inactivityDays || 0, lastInteractionAt: parsed.lastInteractionAt ? new Date(parsed.lastInteractionAt) : null } } catch { /* ignore */ }
    }
    return { affinity: record.affinity, longTermAffinity: record.longTermAffinity ?? record.affinity, shortTermAffinity: record.shortTermAffinity ?? 0, chatCount: record.chatCount || 0, actionStats, lastInteractionAt: record.lastInteractionAt || null, coefficientState }
  }

  const load = async (selfId: string, userId: string): Promise<AffinityRecord | null> => {
    const records = await ctx.database.get(MODEL_NAME, { selfId, userId })
    return records[0] || null
  }

  const save = async (seed: SessionSeed, value: number, relation = '', extra?: Partial<SaveExtra>): Promise<AffinityRecord | null> => {
    const userId = seed.userId || seed.session?.userId
    const selfId = seed.selfId || seed.session?.selfId
    if (!selfId || !userId) return null
    const author = (seed.session as unknown as { author?: { nickname?: string; name?: string } })?.author
    const user = (seed.session as unknown as { user?: { nickname?: string; name?: string } })?.user
    const nickname = seed.nickname || seed.authorNickname || author?.nickname || author?.name || user?.nickname || user?.name || seed.session?.username || (seed.session as unknown as { nickname?: string })?.nickname || null
    const now = new Date()
    const platform = seed.platform || seed.session?.platform || 'unknown'

    // 获取现有记录
    const existing = await load(selfId, userId)

    // 确定好感度状态
    const hasStateOverride = extra && (extra.longTermAffinity !== undefined || extra.shortTermAffinity !== undefined)
    const targetAffinity = Number.isFinite(value) ? clamp(value) : (existing?.affinity ?? defaultInitial())
    let longTerm: number
    let shortTerm: number

    if (hasStateOverride) {
      // 有显式的状态覆盖
      longTerm = extra.longTermAffinity !== undefined ? clamp(extra.longTermAffinity) : (existing?.longTermAffinity ?? targetAffinity)
      shortTerm = extra.shortTermAffinity !== undefined ? Math.round(extra.shortTermAffinity) : (existing?.shortTermAffinity ?? 0)
    } else if (existing) {
      // 有现有记录
      if (Number.isFinite(value)) {
        // 当传入 value 时，重置为该值，短期清零
        longTerm = targetAffinity
        shortTerm = 0
      } else {
        longTerm = existing.longTermAffinity ?? existing.affinity
        shortTerm = existing.shortTermAffinity ?? 0
      }
    } else {
      // 新记录
      longTerm = targetAffinity
      shortTerm = 0
    }

    // 确定关系：手动配置 > 传入参数 > 现有记录
    const manual = findManualRelationship(platform, userId) // platform 仍用于查找手动关系配置
    let relationText: string | null
    if (manual?.relation) {
      // 优先使用手动配置的关系
      relationText = manual.relation
    } else if (relation) {
      // 其次使用传入的关系
      relationText = relation
    } else {
      // 最后使用现有记录的关系
      relationText = existing?.relation || null
    }

    // 获取系数：优先使用传入的系数，否则从现有记录获取，最后使用默认值 1.0
    let coefficient = 1.0
    if (extra?.coefficientState?.coefficient !== undefined) {
      coefficient = extra.coefficientState.coefficient
    } else if (existing?.coefficientState) {
      try {
        const parsed = typeof existing.coefficientState === 'string' ? JSON.parse(existing.coefficientState) : existing.coefficientState
        if (typeof parsed?.coefficient === 'number') coefficient = parsed.coefficient
      } catch { /* ignore */ }
    }

    // affinity 字段存储综合好感度（长期好感 × 系数）
    const compositeAffinity = clamp(Math.round(longTerm * coefficient))

    const row: Partial<AffinityRecord> = {
      selfId, userId, nickname,
      affinity: compositeAffinity,
      longTermAffinity: clamp(longTerm),
      shortTermAffinity: Math.round(shortTerm),
      relation: relationText
    }

    if (extra?.chatCount !== undefined) row.chatCount = extra.chatCount
    if (extra?.actionStats) row.actionStats = JSON.stringify(extra.actionStats)
    if (extra?.coefficientState) row.coefficientState = JSON.stringify(extra.coefficientState)
    if (extra?.lastInteractionAt) row.lastInteractionAt = extra.lastInteractionAt

    await ctx.database.upsert(MODEL_NAME, [row as AffinityRecord])
    return row as AffinityRecord
  }

  const ensure = async (session: Session, clampFn: ClampFn, fallbackInitial?: number): Promise<AffinityState> => {
    const selfId = session.selfId
    const userId = session.userId
    if (!selfId || !userId) return extractState(null)
    const existing = await load(selfId, userId)
    if (existing) return extractState(existing)
    const initial = fallbackInitial !== undefined ? clampFn(fallbackInitial, resolveMin(), resolveMax()) : randomInitial()
    const initialState = createInitialState(initial)
    await save({ platform: session.platform, userId, selfId, session }, initialState.affinity, '', { longTermAffinity: initialState.longTermAffinity, shortTermAffinity: initialState.shortTermAffinity })
    return { ...extractState(null), ...initialState, isNew: true }
  }

  return {
    clamp, save, load, ensure,
    resolveLevelByAffinity, resolveLevelByRelation, findManualRelationship, updateRelationshipConfig, removeRelationshipConfig, syncRelationshipsToDatabase,
    recordBlacklist, removeBlacklist, listBlacklist, isBlacklisted,
    recordTemporaryBlacklist, removeTemporaryBlacklist, listTemporaryBlacklist, isTemporarilyBlacklisted,
    defaultInitial, randomInitial, initialRange, composeState, createInitialState, extractState
  }
}
