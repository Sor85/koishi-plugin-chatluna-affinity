/**
 * 好感度数据存储
 * 提供好感度记录的 CRUD 操作和状态管理
 */

import type { Context, Session } from 'koishi'
import type {
    Config,
    AffinityRecord,
    AffinityState,
    ActionStats,
    CoefficientState,
    CombinedState,
    InitialRange,
    SessionSeed,
    SaveExtra,
    ClampFn,
    LogFn
} from '../../types'
import { clamp } from '../../utils'
import { formatBeijingTimestamp } from '../../utils'
import { MODEL_NAME } from '../../models'

export interface AffinityStoreOptions {
    ctx: Context
    config: Config
    log: LogFn
}

export function createAffinityStore(options: AffinityStoreOptions) {
    const { ctx, config, log } = options

    const resolveGroupSelfId = (selfId: string): string => {
        const groups = config.affinityGroups || []
        for (const group of groups) {
            if (group.botIds?.includes(selfId)) {
                return group.botIds[0] || selfId
            }
        }
        return selfId
    }

    const resolveInitialMin = () =>
        Number.isFinite(config.initialRandomMin)
            ? config.initialRandomMin
            : config.baseAffinityConfig?.initialRandomMin ?? 20

    const resolveInitialMax = () =>
        Number.isFinite(config.initialRandomMax)
            ? config.initialRandomMax
            : config.baseAffinityConfig?.initialRandomMax ?? 40

    const resolveMin = () => {
        const levels = config.relationshipAffinityLevels || []
        if (levels.length === 0) return 0
        return Math.min(...levels.map((l) => l.min))
    }

    const resolveMax = () => {
        const levels = config.relationshipAffinityLevels || []
        if (levels.length === 0) return 100
        return Math.max(...levels.map((l) => l.max))
    }

    const clampValue = (value: number): number =>
        clamp(Math.round(value), resolveMin(), resolveMax())

    const resolveRelationByAffinity = (affinity: number): string | null => {
        const levels = config.relationshipAffinityLevels || []
        for (const level of levels) {
            if (affinity >= level.min && affinity <= level.max) {
                return level.relation || null
            }
        }
        return null
    }

    const randomInitial = (): number => {
        const low = resolveInitialMin()
        const high = resolveInitialMax()
        return clampValue(low + Math.floor(Math.random() * (high - low + 1)))
    }

    const defaultInitial = (): number =>
        clampValue(Math.floor((resolveInitialMin() + resolveInitialMax()) / 2))

    const initialRange = (): InitialRange => ({
        low: resolveInitialMin(),
        high: resolveInitialMax(),
        min: resolveMin(),
        max: resolveMax()
    })

    const composeState = (longTerm: number, shortTerm: number): CombinedState => ({
        affinity: clampValue(longTerm),
        longTermAffinity: clampValue(longTerm),
        shortTermAffinity: Math.round(shortTerm)
    })

    const createInitialState = (base: number): CombinedState => composeState(base, 0)

    const extractState = (record: AffinityRecord | null): AffinityState => {
        if (!record) {
            const base = randomInitial()
            return {
                affinity: base,
                longTermAffinity: base,
                shortTermAffinity: 0,
                chatCount: 0,
                actionStats: {
                    entries: [],
                    total: 0,
                    counts: { increase: 0, decrease: 0, hold: 0 }
                },
                lastInteractionAt: null,
                coefficientState: {
                    streak: 0,
                    coefficient: 1,
                    decayPenalty: 0,
                    streakBoost: 0,
                    inactivityDays: 0,
                    lastInteractionAt: null
                },
                isNew: true
            }
        }

        let actionStats: ActionStats = {
            entries: [],
            total: 0,
            counts: { increase: 0, decrease: 0, hold: 0 }
        }
        if (record.actionStats) {
            try {
                const parsed = JSON.parse(record.actionStats)
                actionStats = {
                    entries: parsed.entries || [],
                    total: parsed.total || 0,
                    counts: parsed.counts || { increase: 0, decrease: 0, hold: 0 }
                }
            } catch {
                /* ignore */
            }
        }

        let coefficientState: CoefficientState = {
            streak: 0,
            coefficient: 1,
            decayPenalty: 0,
            streakBoost: 0,
            inactivityDays: 0,
            lastInteractionAt: null
        }
        if (record.coefficientState) {
            try {
                const parsed = JSON.parse(record.coefficientState)
                coefficientState = {
                    streak: parsed.streak || 0,
                    coefficient: parsed.coefficient ?? 1,
                    decayPenalty: parsed.decayPenalty || 0,
                    streakBoost: parsed.streakBoost || 0,
                    inactivityDays: parsed.inactivityDays || 0,
                    lastInteractionAt: parsed.lastInteractionAt
                        ? new Date(parsed.lastInteractionAt)
                        : null
                }
            } catch {
                /* ignore */
            }
        }

        return {
            affinity: record.affinity,
            longTermAffinity: record.longTermAffinity ?? record.affinity,
            shortTermAffinity: record.shortTermAffinity ?? 0,
            chatCount: record.chatCount || 0,
            actionStats,
            lastInteractionAt: record.lastInteractionAt || null,
            coefficientState
        }
    }

    const load = async (selfId: string, userId: string): Promise<AffinityRecord | null> => {
        const resolvedSelfId = resolveGroupSelfId(selfId)
        const records = await ctx.database.get(MODEL_NAME, { selfId: resolvedSelfId, userId })
        return records[0] || null
    }

    const save = async (
        seed: SessionSeed,
        value: number,
        relation = '',
        extra?: Partial<SaveExtra>
    ): Promise<AffinityRecord | null> => {
        const userId = seed.userId || seed.session?.userId
        const rawSelfId = seed.selfId || seed.session?.selfId
        if (!rawSelfId || !userId) return null

        const selfId = resolveGroupSelfId(rawSelfId)
        const existing = await load(rawSelfId, userId)

        const sessionUserId = seed.session?.userId
        const isTargetingSelf = !sessionUserId || sessionUserId === userId

        let nickname: string | null = seed.nickname || null

        if (!nickname && isTargetingSelf) {
            const author = (seed.session as unknown as { author?: { nickname?: string; name?: string } })
                ?.author
            const user = (seed.session as unknown as { user?: { nickname?: string; name?: string } })
                ?.user
            nickname =
                seed.authorNickname ||
                author?.nickname ||
                author?.name ||
                user?.nickname ||
                user?.name ||
                seed.session?.username ||
                (seed.session as unknown as { nickname?: string })?.nickname ||
                null
        }

        if (!nickname) {
            nickname = existing?.nickname || null
        }

        const hasStateOverride =
            extra &&
            (extra.longTermAffinity !== undefined || extra.shortTermAffinity !== undefined)
        const targetAffinity = Number.isFinite(value)
            ? clampValue(value)
            : existing?.affinity ?? defaultInitial()

        let longTerm: number
        let shortTerm: number

        if (hasStateOverride) {
            longTerm =
                extra.longTermAffinity !== undefined
                    ? clampValue(extra.longTermAffinity)
                    : existing?.longTermAffinity ?? targetAffinity
            shortTerm =
                extra.shortTermAffinity !== undefined
                    ? Math.round(extra.shortTermAffinity)
                    : existing?.shortTermAffinity ?? 0
        } else if (existing) {
            if (Number.isFinite(value)) {
                longTerm = targetAffinity
                shortTerm = 0
            } else {
                longTerm = existing.longTermAffinity ?? existing.affinity
                shortTerm = existing.shortTermAffinity ?? 0
            }
        } else {
            longTerm = targetAffinity
            shortTerm = 0
        }

        let coefficient = 1.0
        if (extra?.coefficientState?.coefficient !== undefined) {
            coefficient = extra.coefficientState.coefficient
        } else if (existing?.coefficientState) {
            try {
                const parsed =
                    typeof existing.coefficientState === 'string'
                        ? JSON.parse(existing.coefficientState)
                        : existing.coefficientState
                if (typeof parsed?.coefficient === 'number') coefficient = parsed.coefficient
            } catch {
                /* ignore */
            }
        }

        const compositeAffinity = clampValue(Math.round(longTerm * coefficient))

        const relationText: string | null = relation || existing?.relation || resolveRelationByAffinity(compositeAffinity) || null

        const row: Partial<AffinityRecord> = {
            selfId,
            userId,
            nickname,
            affinity: compositeAffinity,
            longTermAffinity: clampValue(longTerm),
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

    const ensure = async (
        session: Session,
        clampFn: ClampFn,
        fallbackInitial?: number
    ): Promise<AffinityState> => {
        const selfId = session.selfId
        const userId = session.userId
        if (!selfId || !userId) return extractState(null)

        const existing = await load(selfId, userId)
        if (existing) return extractState(existing)

        const initial =
            fallbackInitial !== undefined
                ? clampFn(fallbackInitial, resolveMin(), resolveMax())
                : randomInitial()
        const initialState = createInitialState(initial)

        await save(
            { platform: session.platform, userId, selfId, session },
            initialState.affinity,
            '',
            {
                longTermAffinity: initialState.longTermAffinity,
                shortTermAffinity: initialState.shortTermAffinity
            }
        )

        return { ...extractState(null), ...initialState, isNew: true }
    }

    return {
        clamp: clampValue,
        save,
        load,
        ensure,
        defaultInitial,
        randomInitial,
        initialRange,
        composeState,
        createInitialState,
        extractState
    }
}

export type AffinityStore = ReturnType<typeof createAffinityStore>
