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
    id: { type: 'string', length: 255 },
    platform: { type: 'string', length: 64 },
    selfId: { type: 'string', length: 64, nullable: true },
    userId: { type: 'string', length: 64 },
    nickname: { type: 'string', length: 255, nullable: true },
    affinity: { type: 'integer', initial: 0 },
    affinityInited: { type: 'boolean', initial: false },
    relation: { type: 'string', length: 64, nullable: true },
    shortTermAffinity: { type: 'integer', nullable: true },
    longTermAffinity: { type: 'integer', nullable: true },
    shortTermUpdatedAt: { type: 'timestamp', nullable: true },
    longTermUpdatedAt: { type: 'timestamp', nullable: true },
    updatedAt: { type: 'timestamp', nullable: true },
    relationUpdatedAt: { type: 'timestamp', nullable: true },
    chatCount: { type: 'integer', nullable: true },
    actionStats: { type: 'text', nullable: true },
    lastInteractionAt: { type: 'timestamp', nullable: true },
    coefficientState: { type: 'text', nullable: true }
  }, { primary: 'id' })
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

  const makeId = (platform: string, userId: string) => `${platform}:${userId}`

  for (const entry of config.autoBlacklist || []) {
    if (entry?.platform && entry?.userId) blacklistSet.add(makeId(entry.platform, entry.userId))
  }

  const applyConfigUpdate = (): void => {
    const scope = (ctx as unknown as { scope?: { update?: (config: unknown, silent?: boolean) => void } }).scope
    scope?.update?.(config, true)
  }

  const isBlacklisted = (platform: string, userId: string, _channelId?: string): boolean => blacklistSet.has(makeId(platform, userId))

  const recordBlacklist = (platform: string, userId: string, detail?: BlacklistDetail): BlacklistEntry | null => {
    const key = makeId(platform, userId)
    if (blacklistSet.has(key)) return null
    blacklistSet.add(key)
    const entry: BlacklistEntry = { platform, userId, blockedAt: formatBeijingTimestamp(new Date()), nickname: detail?.nickname || '', note: detail?.note || '', channelId: detail?.channelId || detail?.guildId || detail?.groupId || '' }
    if (!config.autoBlacklist) config.autoBlacklist = []
    config.autoBlacklist.push(entry)
    applyConfigUpdate()
    return entry
  }

  const removeBlacklist = (platform: string, userId: string, _channelId?: string): boolean => {
    const key = makeId(platform, userId)
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

  const updateRelationshipConfig = (userId: string, relationName: string, affinityValue?: number): void => {
    if (!config.relationships) config.relationships = []
    const existing = config.relationships.find((r) => r.userId === userId)
    if (existing) {
      existing.relation = relationName
      if (affinityValue !== undefined) existing.initialAffinity = affinityValue
    } else {
      config.relationships.push({ userId, relation: relationName, initialAffinity: affinityValue ?? null })
    }
    applyConfigUpdate()
  }

  const extractState = (record: AffinityRecord | null): AffinityState => {
    const now = new Date()
    if (!record) {
      const base = randomInitial()
      return { affinity: base, longTermAffinity: base, shortTermAffinity: 0, updatedAt: now, shortTermUpdatedAt: now, longTermUpdatedAt: now, chatCount: 0, actionStats: { entries: [], total: 0, counts: { increase: 0, decrease: 0, hold: 0 } }, lastInteractionAt: null, coefficientState: { streak: 0, coefficient: 1, decayPenalty: 0, streakBoost: 0, inactivityDays: 0, lastInteractionAt: null }, isNew: true }
    }
    let actionStats: ActionStats = { entries: [], total: 0, counts: { increase: 0, decrease: 0, hold: 0 } }
    if (record.actionStats) {
      try { const parsed = JSON.parse(record.actionStats); actionStats = { entries: parsed.entries || [], total: parsed.total || 0, counts: parsed.counts || { increase: 0, decrease: 0, hold: 0 } } } catch { /* ignore */ }
    }
    let coefficientState: CoefficientState = { streak: 0, coefficient: 1, decayPenalty: 0, streakBoost: 0, inactivityDays: 0, lastInteractionAt: null }
    if (record.coefficientState) {
      try { const parsed = JSON.parse(record.coefficientState); coefficientState = { streak: parsed.streak || 0, coefficient: parsed.coefficient ?? 1, decayPenalty: parsed.decayPenalty || 0, streakBoost: parsed.streakBoost || 0, inactivityDays: parsed.inactivityDays || 0, lastInteractionAt: parsed.lastInteractionAt ? new Date(parsed.lastInteractionAt) : null } } catch { /* ignore */ }
    }
    return { affinity: record.affinity, longTermAffinity: record.longTermAffinity ?? record.affinity, shortTermAffinity: record.shortTermAffinity ?? 0, updatedAt: record.updatedAt || now, shortTermUpdatedAt: record.shortTermUpdatedAt || record.updatedAt || now, longTermUpdatedAt: record.longTermUpdatedAt || record.updatedAt || now, chatCount: record.chatCount || 0, actionStats, lastInteractionAt: record.lastInteractionAt || null, coefficientState }
  }

  const load = async (platform: string, userId: string): Promise<AffinityRecord | null> => {
    const records = await ctx.database.get(MODEL_NAME, { id: makeId(platform, userId) })
    return records[0] || null
  }

  const save = async (seed: SessionSeed, value: number, inited = true, relation = '', extra?: Partial<SaveExtra>): Promise<AffinityRecord | null> => {
    const platform = seed.platform || seed.session?.platform
    const userId = seed.userId || seed.session?.userId
    const selfId = seed.selfId || seed.session?.selfId || null
    if (!platform || !userId) return null
    const id = makeId(platform, userId)
    const author = (seed.session as unknown as { author?: { nickname?: string; name?: string } })?.author
    const user = (seed.session as unknown as { user?: { nickname?: string; name?: string } })?.user
    const nickname = seed.nickname || seed.authorNickname || author?.nickname || author?.name || user?.nickname || user?.name || seed.session?.username || (seed.session as unknown as { nickname?: string })?.nickname || null
    const now = new Date()

    // 获取现有记录
    const existing = await load(platform, userId)

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
    const manual = findManualRelationship(platform, userId)
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

    const row: Partial<AffinityRecord> = {
      id, platform, selfId, userId, nickname,
      affinity: clamp(longTerm + shortTerm),
      longTermAffinity: clamp(longTerm),
      shortTermAffinity: Math.round(shortTerm),
      affinityInited: inited,
      relation: relationText,
      updatedAt: now
    }

    if (extra?.shortTermUpdatedAt) row.shortTermUpdatedAt = extra.shortTermUpdatedAt
    if (extra?.longTermUpdatedAt) row.longTermUpdatedAt = extra.longTermUpdatedAt
    if (extra?.chatCount !== undefined) row.chatCount = extra.chatCount
    if (extra?.actionStats) row.actionStats = JSON.stringify(extra.actionStats)
    if (extra?.coefficientState) row.coefficientState = JSON.stringify(extra.coefficientState)
    if (extra?.lastInteractionAt) row.lastInteractionAt = extra.lastInteractionAt
    if (relation) row.relationUpdatedAt = now

    await ctx.database.upsert(MODEL_NAME, [row as AffinityRecord])
    return row as AffinityRecord
  }

  const ensure = async (session: Session, clampFn: ClampFn, fallbackInitial?: number): Promise<AffinityState> => {
    const platform = session.platform
    const userId = session.userId
    if (!platform || !userId) return extractState(null)
    const existing = await load(platform, userId)
    if (existing?.affinityInited) return extractState(existing)
    const initial = fallbackInitial !== undefined ? clampFn(fallbackInitial, resolveMin(), resolveMax()) : randomInitial()
    const initialState = createInitialState(initial)
    await save({ platform, userId, selfId: session.selfId, session }, initialState.affinity, true, '', { longTermAffinity: initialState.longTermAffinity, shortTermAffinity: initialState.shortTermAffinity })
    return { ...extractState(null), ...initialState, isNew: true }
  }

  return {
    clamp, save, load, ensure,
    resolveLevelByAffinity, resolveLevelByRelation, findManualRelationship, updateRelationshipConfig,
    recordBlacklist, removeBlacklist, listBlacklist, isBlacklisted,
    recordTemporaryBlacklist, removeTemporaryBlacklist, listTemporaryBlacklist, isTemporarilyBlacklisted,
    defaultInitial, randomInitial, initialRange, composeState, createInitialState, extractState
  }
}
