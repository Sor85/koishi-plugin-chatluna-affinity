/**
 * 好感度增量应用
 * 提供可复用的好感度更新函数，供 XML 拦截调用
 */

import type { Session } from 'koishi'
import type { ActionStats, CoefficientState, LogFn } from '../../types'
import { appendActionEntry } from './calculator'

export interface ApplyAffinityDeltaParams {
    session: Session
    userId: string
    delta: number
    action: 'increase' | 'decrease'
    store: {
        ensureForUser: (
            session: Session,
            userId: string,
            clampFn: (value: number, low: number, high: number) => number
        ) => Promise<{
            longTermAffinity?: number
            shortTermAffinity?: number
            actionStats?: ActionStats
            coefficientState?: CoefficientState
        }>
        save: (seed: { platform: string; userId: string; selfId?: string; session?: Session }, value: number, relation: string, extra?: Record<string, unknown>) => Promise<unknown>
        clamp: (value: number) => number
    }
    levelResolver: {
        resolveLevelByAffinity: (affinity: number) => { relation?: string } | null
    }
    maxIncrease: number
    maxDecrease: number
    maxActionEntries: number
    shortTermConfig: {
        promoteThreshold: number
        demoteThreshold: number
        longTermPromoteStep: number
        longTermDemoteStep: number
    }
    log?: LogFn
}

export interface ApplyAffinityDeltaResult {
    success: boolean
    message: string
    shortTermAffinity?: number
    longTermAffinity?: number
    combinedAffinity?: number
    coefficient?: number
    delta?: number
    actionStats?: ActionStats
}

export async function applyAffinityDelta(params: ApplyAffinityDeltaParams): Promise<ApplyAffinityDeltaResult> {
    const {
        session,
        userId,
        delta,
        action,
        store,
        levelResolver,
        maxIncrease,
        maxDecrease,
        maxActionEntries,
        shortTermConfig,
        log
    } = params

    try {
        if (!session) {
            return { success: false, message: 'No session context available.' }
        }

        const platform = session.platform
        const selfId = session.selfId

        const current = await store.ensureForUser(
            session,
            userId,
            (value, low, high) => Math.min(Math.max(value, low), high)
        )
        const longTerm = current?.longTermAffinity ?? 0
        const shortTerm = current?.shortTermAffinity ?? 0
        const coefficient = current?.coefficientState?.coefficient ?? 1
        const combined = Math.round(longTerm * coefficient)

        let actualDelta = Math.abs(delta)
        if (action === 'increase') {
            actualDelta = Math.min(actualDelta, maxIncrease)
        } else {
            actualDelta = Math.min(actualDelta, maxDecrease)
            actualDelta = -actualDelta
        }

        const rawShortTerm = shortTerm + actualDelta
        let newLongTerm = longTerm
        let pendingShortTerm = rawShortTerm
        if (rawShortTerm >= shortTermConfig.promoteThreshold) {
            newLongTerm = store.clamp(longTerm + shortTermConfig.longTermPromoteStep)
            pendingShortTerm = rawShortTerm - shortTermConfig.promoteThreshold
        } else if (rawShortTerm <= shortTermConfig.demoteThreshold) {
            newLongTerm = store.clamp(longTerm - shortTermConfig.longTermDemoteStep)
            pendingShortTerm = rawShortTerm - shortTermConfig.demoteThreshold
        }
        const newShortTerm = store.clamp(pendingShortTerm)
        const newActionStats: ActionStats = {
            total: (current?.actionStats?.total || 0) + 1,
            counts: {
                increase: (current?.actionStats?.counts?.increase || 0) + (action === 'increase' ? 1 : 0),
                decrease: (current?.actionStats?.counts?.decrease || 0) + (action === 'decrease' ? 1 : 0)
            },
            entries: appendActionEntry(current?.actionStats?.entries, action, Date.now(), maxActionEntries)
        }
        const newCombined = store.clamp(Math.round(newLongTerm * coefficient))

        await store.save(
            { platform, userId, selfId, session },
            newCombined,
            '',
            {
                shortTermAffinity: newShortTerm,
                longTermAffinity: newLongTerm,
                actionStats: newActionStats,
                coefficientState: current?.coefficientState || undefined,
                lastInteractionAt: new Date()
            }
        )

        const message = `好感度调整: user=${userId}, action=${action}, delta=${Math.abs(actualDelta)}, shortTerm=${newShortTerm}, longTerm=${newLongTerm}, coefficient=${coefficient}, combined=${newCombined}, stats=increase:${newActionStats.counts.increase}/decrease:${newActionStats.counts.decrease}`
        log?.('info', message)

        return {
            success: true,
            message,
            shortTermAffinity: newShortTerm,
            longTermAffinity: newLongTerm,
            combinedAffinity: newCombined,
            coefficient,
            delta: actualDelta,
            actionStats: newActionStats
        }
    } catch (error) {
        const errorMessage = `applyAffinityDelta failed: ${(error as Error).message}`
        params.log?.('warn', errorMessage, error)
        return { success: false, message: errorMessage }
    }
}
