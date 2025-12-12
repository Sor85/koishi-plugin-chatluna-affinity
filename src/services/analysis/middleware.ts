/**
 * 好感度分析中间件
 * 监听用户消息和机器人回复，自动分析并更新好感度
 */

import type { Context, Session } from 'koishi'
import type { Config, LogFn } from '../../types'
import type {
    PendingAnalysis,
    AnalysisMiddlewareResult,
    AnalysisMiddlewareDeps
} from './types'
import {
    resolveShortTermConfig,
    resolveActionWindowConfig,
    resolveCoefficientConfig,
    summarizeActionEntries,
    appendActionEntry,
    computeDailyStreak,
    computeCoefficientValue,
    computeShortTermReset
} from '../affinity/calculator'
import type { ActionEntry, CoefficientState } from '../../types'

interface EnsuredRecord {
    affinity?: number
    shortTermAffinity?: number
    longTermAffinity?: number
    actionStats?: { entries?: ActionEntry[]; total?: number; counts?: { increase: number; decrease: number; hold: number } }
    chatCount?: number
    coefficientState?: CoefficientState
    lastInteractionAt?: Date
}

async function resolveGroupNickname(session: Session): Promise<string> {
    const fallback = session?.username || session?.userId || ''
    try {
        const bot = session?.bot as { internal?: { getGroupMemberInfo?: Function; getGuildMember?: Function }; getGuildMember?: Function } | undefined
        const guildId = (session as unknown as { guildId?: string })?.guildId || session?.channelId
        const userId = session?.userId
        if (!bot || !guildId || !userId) return fallback

        let member: Record<string, unknown> | null = null
        if (bot.internal?.getGroupMemberInfo) {
            member = await bot.internal.getGroupMemberInfo(guildId, userId, false).catch(() => null)
        } else if (bot.internal?.getGuildMember) {
            member = await bot.internal.getGuildMember(guildId, userId).catch(() => null)
        } else if (bot.getGuildMember) {
            member = await bot.getGuildMember(guildId, userId).catch(() => null)
        }

        if (!member) return fallback
        const card = member.card || (member.user as Record<string, unknown>)?.card
        const nick = member.nickname || member.nick || (member.user as Record<string, unknown>)?.nickname || (member.user as Record<string, unknown>)?.nick
        return String(card || nick || fallback).trim() || fallback
    } catch {
        return fallback
    }
}

function shouldAnalyzeSession(session: Session, nicknames: string[], log: LogFn, debugEnabled: boolean): boolean {
    const text = String(session.content ?? '')
    const lowerText = text.toLowerCase()
    const nicknameHit = nicknames.some((name) => lowerText.includes(name.toLowerCase()))
    if (debugEnabled && nicknameHit) log('debug', '昵称匹配命中', { text, nicknames })

    const selfIdLower = String(session.selfId ?? '').toLowerCase()
    const elements = (session as unknown as { elements?: Array<{ type: string; attrs?: Record<string, unknown> }> })?.elements
    const mentionHit = Boolean(
        elements?.some((el) => {
            if (el.type !== 'at') return false
            const attrs = el.attrs ?? {}
            const candidates = [attrs.id, attrs.userId, attrs.cid, attrs.name, attrs.nickname]
                .filter(Boolean)
                .map((value) => String(value).toLowerCase())
            return selfIdLower ? candidates.includes(selfIdLower) : candidates.length > 0
        })
    )
    if (debugEnabled && mentionHit) log('debug', '@ 匹配命中', { elements })

    const quote = (session as unknown as { quote?: { userId?: string; author?: { userId?: string; id?: string }; user?: { id?: string } } })?.quote
    const quoteHit = Boolean(
        quote && (
            quote.userId === session.selfId ||
            quote?.author?.userId === session.selfId ||
            quote?.author?.id === session.selfId ||
            quote?.user?.id === session.selfId
        )
    )

    const isDirect = (session as unknown as { isDirect?: boolean })?.isDirect
    const atMe = (session as unknown as { atMe?: boolean })?.atMe

    return isDirect || atMe || nicknameHit || mentionHit || quoteHit
}

async function resolveTriggerNicknames(ctx: Context, config: Config): Promise<string[]> {
    const names = new Set<string>()
    for (const value of config.triggerNicknames || []) {
        if (value) names.add(String(value).trim())
    }

    const chatluna = (ctx as unknown as { chatluna?: { config?: Record<string, unknown>; promptRenderer?: { nicknames?: Set<string>; getNicknames?: () => Promise<string[]> } } }).chatluna
    const chatlunaConfig = chatluna?.config ?? {}
    const possibleNames = [chatlunaConfig.nicknames, chatlunaConfig.nickname, chatlunaConfig.names, chatlunaConfig.name, chatlunaConfig.botNames]

    for (const item of possibleNames) {
        if (Array.isArray(item)) item.forEach((name) => name && names.add(String(name).trim()))
        else if (item) names.add(String(item).trim())
    }

    const rendererNames = chatluna?.promptRenderer?.nicknames
    if (rendererNames?.size) for (const name of rendererNames) names.add(String(name).trim())

    const rendererGetter = chatluna?.promptRenderer?.getNicknames
    if (typeof rendererGetter === 'function') {
        const extra = await rendererGetter()
        if (Array.isArray(extra)) extra.forEach((name) => name && names.add(String(name).trim()))
    }

    return Array.from(names).map((name) => name.toLowerCase())
}

export function createAnalysisMiddleware(ctx: Context, config: Config, deps: AnalysisMiddlewareDeps): AnalysisMiddlewareResult {
    const { store, history, cache, getModel, renderTemplate, getMessageContent, log, resolvePersonaPreset, temporaryBlacklist, shortTermOptions } = deps
    const debugEnabled = config.debugLogging
    const pendingAnalysis = new Map<string, PendingAnalysis>()

    const actionWindow = resolveActionWindowConfig(config)
    const coefficientRules = resolveCoefficientConfig(config)
    const shortTermRules = resolveShortTermConfig(config)

    const levels = config.relationshipAffinityLevels || []
    const minAffinity = levels.length > 0 ? Math.min(...levels.map((l) => l.min)) : 0
    const maxAffinity = levels.length > 0 ? Math.max(...levels.map((l) => l.max)) : 100

    const shortTermConfig = shortTermOptions || {
        enabled: false,
        windowHours: 24,
        windowMs: 24 * 3600 * 1000,
        decreaseThreshold: Infinity,
        durationHours: 0,
        durationMs: 0,
        penalty: 0
    }

    const temporaryManager = temporaryBlacklist || {
        isBlocked: () => null,
        activate: () => ({ activated: false, entry: null }),
        clear: () => { }
    }

    const shortTermTriggerMap = new Map<string, number[]>()

    const clampValue = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))

    const resolveActionLabel = (value: string): string => {
        const action = typeof value === 'string' ? value.toLowerCase() : ''
        if (action === 'increase') return '提升'
        if (action === 'decrease') return '降低'
        if (action === 'hold') return '保持'
        return action || '未知'
    }

    const formatActionCounts = (counts: { increase?: number; decrease?: number; hold?: number }) => {
        const safe = counts || {}
        const increase = Number(safe.increase) || 0
        const decrease = Number(safe.decrease) || 0
        const hold = Number(safe.hold) || 0
        return `提升 ${increase} / 降低 ${decrease} / 保持 ${hold}`
    }

    const resolveIncreaseLimit = () => {
        if (Number.isFinite(config.maxIncreasePerMessage)) return Math.abs(config.maxIncreasePerMessage)
        return 5
    }

    const resolveDecreaseLimit = () => {
        if (Number.isFinite(config.maxDecreasePerMessage)) return Math.abs(config.maxDecreasePerMessage)
        return 5
    }

    const getChannelId = (session: Session): string => {
        return (session as unknown as { guildId?: string })?.guildId ||
            session?.channelId ||
            (session as unknown as { roomId?: string })?.roomId || ''
    }

    const executeAnalysis = async (session: Session, botReply: string): Promise<void> => {
        const channelId = getChannelId(session)

        if (shortTermConfig.enabled) {
            const tempEntry = temporaryManager.isBlocked(session?.platform!, session?.userId!)
            if (tempEntry) {
                if (debugEnabled) log('debug', '用户处于短期拉黑名单，跳过分析', { platform: session?.platform, userId: session?.userId })
                return
            }
        }

        if (config.enableAutoBlacklist && store.isBlacklisted(session?.platform!, session?.userId!, channelId)) {
            cache.clear(session?.platform!, session?.userId!)
            if (debugEnabled) log('debug', '用户处于自动拉黑名单，跳过分析', { platform: session?.platform, userId: session?.userId })
            return
        }

        const tempBlacklistEntry = store.isTemporarilyBlacklisted(session?.platform!, session?.userId!)
        if (tempBlacklistEntry) {
            if (debugEnabled) log('debug', '用户处于临时拉黑名单，跳过分析', { platform: session?.platform, userId: session?.userId })
            return
        }

        const nicknames = await resolveTriggerNicknames(ctx, config)
        if (!shouldAnalyzeSession(session, nicknames, log, debugEnabled)) return
        if (!session?.platform || !session?.userId) return

        try {
            const manual = store.findManualRelationship(session.platform, session.userId)
            const hasManualOverride = !!manual?.relation
            const conditionalClamp = (value: number) => hasManualOverride ? Math.round(value) : store.clamp(value)
            const result = await store.ensure(session, clampValue) as EnsuredRecord
            const now = new Date()
            const storedShortTerm = Number(result.shortTermAffinity ?? 0)
            const storedLongTerm = Number(result.longTermAffinity ?? result.affinity ?? 0)
            const baselineShortTerm = Math.round(storedShortTerm)
            const baselineState = hasManualOverride
                ? { affinity: Math.round(storedLongTerm), longTermAffinity: Math.round(storedLongTerm), shortTermAffinity: baselineShortTerm }
                : store.composeState(storedLongTerm, baselineShortTerm)
            let longTermTarget = baselineState.longTermAffinity
            const initialLongTerm = longTermTarget
            const initialShortTerm = baselineShortTerm
            const previousCoefficient = Number.isFinite(result.coefficientState?.coefficient)
                ? result.coefficientState!.coefficient
                : coefficientRules.base
            const oldAffinity = conditionalClamp(previousCoefficient * longTermTarget)

            let historyLines = await history.fetch(session)
            const currentUserMessage = session.content ?? ''
            const currentUserId = session.userId

            if (currentUserMessage && currentUserId) {
                for (let i = historyLines.length - 1; i >= 0; i--) {
                    const line = historyLines[i]
                    if (line.includes(currentUserId) && line.includes(currentUserMessage.trim())) {
                        historyLines.splice(i, 1)
                        break
                    }
                }
            }

            const personaText = resolvePersonaPreset(session)
            const maxIncreaseLimit = resolveIncreaseLimit()
            const maxDecreaseLimit = resolveDecreaseLimit()
            const nowMs = now.getTime()
            const summarizedActions = summarizeActionEntries(result?.actionStats?.entries, actionWindow.windowMs, nowMs)
            const windowChatCount = summarizedActions.total
            const actionCountsText = formatActionCounts(summarizedActions.counts)
            const streak = computeDailyStreak(result.coefficientState?.streak, result.coefficientState?.lastInteractionAt, now)

            const todayStart = new Date(now)
            todayStart.setHours(0, 0, 0, 0)
            const todayStartMs = todayStart.getTime()
            const todayActions = (result?.actionStats?.entries || []).filter(entry => {
                const entryTime = typeof entry.timestamp === 'object' && entry.timestamp !== null && 'getTime' in entry.timestamp
                    ? (entry.timestamp as Date).getTime()
                    : (entry.timestamp as number)
                return entryTime >= todayStartMs && entryTime <= nowMs
            })
            const todayIncreaseCount = todayActions.filter(entry => entry.action === 'increase').length
            const todayDecreaseCount = todayActions.filter(entry => entry.action === 'decrease').length

            const nextCoefficientState = computeCoefficientValue(coefficientRules, streak, result.coefficientState?.lastInteractionAt, now, todayIncreaseCount, todayDecreaseCount)

            const currentRelationship = manual?.relation || store.resolveLevelByAffinity(oldAffinity)?.relation || '未知'

            const prompt = renderTemplate(config.analysisPrompt, {
                currentAffinity: oldAffinity,
                currentRelationship,
                minAffinity,
                maxAffinity,
                maxIncreasePerMessage: maxIncreaseLimit,
                maxDecreasePerMessage: maxDecreaseLimit,
                historyCount: historyLines.length,
                historyText: historyLines.join('\n'),
                historyJson: JSON.stringify(historyLines, null, 2),
                userMessage: session.content ?? '',
                botReply: botReply || '',
                shortTermAffinity: baselineShortTerm,
                longTermAffinity: longTermTarget,
                shortTermPromoteThreshold: shortTermRules.promoteThreshold,
                shortTermDemoteThreshold: shortTermRules.demoteThreshold,
                actionStatsText: summarizedActions.entries.length ? `${summarizedActions.entries.length} 条有效记录` : '暂无记录',
                recentActionWindowHours: actionWindow.windowHours,
                recentActionCountsText: actionCountsText,
                chatCount: windowChatCount,
                longTermCoefficient: nextCoefficientState.coefficient,
                persona: personaText || '',
                personaPreset: personaText || ''
            })

            const model = getModel()
            if (!model) {
                log('warn', '模型尚未就绪，跳过分析', { userId: session.userId, platform: session.platform })
                return
            }

            const message = await model.invoke!(prompt)
            const text = getMessageContent(message?.content ?? message)
            const jsonCandidate = typeof text === 'string' ? text : String(text ?? '')
            const match = jsonCandidate.match(/\{[\s\S]*\}/)
            let delta = 0
            const author = (session as unknown as { author?: { nickname?: string; name?: string } })?.author
            const user = (session as unknown as { user?: { nickname?: string; name?: string } })?.user
            const nickname = author?.nickname || author?.name || user?.nickname || user?.name || session?.username || ''

            if (match) {
                try {
                    const parsed = JSON.parse(match[0]) as { delta?: number | string; action?: string; reason?: string }
                    const raw = typeof parsed.delta === 'number' ? parsed.delta : parseInt(String(parsed.delta), 10)
                    if (Number.isFinite(raw)) delta = Math.trunc(raw)
                    const action = typeof parsed.action === 'string' ? parsed.action.toLowerCase() : ''
                    if (action === 'increase' && delta <= 0) delta = Math.max(1, Math.abs(delta))
                    if (action === 'decrease' && delta >= 0) delta = -Math.max(1, Math.abs(delta))
                    if (action === 'hold') delta = 0
                    if (debugEnabled) log('info', '模型返回', {
                        delta: parsed?.delta,
                        action: resolveActionLabel(action),
                        reason: parsed?.reason,
                        修正增减: delta,
                        用户id: session?.userId,
                        用户昵称: nickname
                    })
                } catch (error) {
                    log('warn', '解析模型响应失败', { text: jsonCandidate, error })
                }
            }

            const positiveLimit = resolveIncreaseLimit()
            const negativeLimit = resolveDecreaseLimit()
            const limitedDelta = delta >= 0 ? Math.min(delta, positiveLimit) : Math.max(delta, -negativeLimit)
            const eligibleChatCount = summarizedActions.total
            const bonusEligible = eligibleChatCount > actionWindow.bonusChatThreshold
            const positiveBonus = bonusEligible ? (actionWindow.increaseBonus || 0) : 0
            const negativeBonus = bonusEligible ? (actionWindow.decreaseBonus || 0) : 0
            const allowOverflow = Boolean(actionWindow.allowBonusOverflow)
            const positiveCapacity = allowOverflow ? Math.max(0, positiveBonus) : Math.max(0, Math.min(positiveLimit - limitedDelta, positiveBonus))
            const negativeCapacity = allowOverflow ? Math.max(0, negativeBonus) : Math.max(0, Math.min(negativeLimit - Math.abs(limitedDelta), negativeBonus))
            const extraFromHistory = limitedDelta > 0 ? positiveCapacity : limitedDelta < 0 ? -negativeCapacity : 0
            const appliedDelta = limitedDelta + extraFromHistory
            const actionType: 'increase' | 'decrease' | 'hold' = limitedDelta > 0 ? 'increase' : limitedDelta < 0 ? 'decrease' : 'hold'
            let workingShortTerm = baselineShortTerm + appliedDelta
            let longTermShift = 0
            let longTermChanged = false
            let temporaryBlockTriggered = false
            let temporaryBlockExpiresAt: number | null = null
            let temporaryPenaltyApplied = 0

            if (workingShortTerm >= shortTermRules.promoteThreshold) {
                longTermShift = shortTermRules.longTermPromoteStep
                longTermTarget = conditionalClamp(longTermTarget + longTermShift)
                workingShortTerm = computeShortTermReset()
                longTermChanged = true
            } else if (workingShortTerm <= shortTermRules.demoteThreshold) {
                longTermShift = -shortTermRules.longTermDemoteStep
                longTermTarget = conditionalClamp(longTermTarget + longTermShift)
                workingShortTerm = computeShortTermReset()
                longTermChanged = true
            }

            if (shortTermConfig.enabled && actionType === 'decrease') {
                const key = `${session.platform || 'unknown'}:${session.userId || 'anonymous'}`
                const historyEntry = shortTermTriggerMap.get(key) || []
                const filteredHistory = historyEntry.filter((ts) => nowMs - ts < shortTermConfig.windowMs)
                filteredHistory.push(nowMs)
                shortTermTriggerMap.set(key, filteredHistory)
                if (filteredHistory.length >= shortTermConfig.decreaseThreshold) {
                    const activation = temporaryManager.activate(session.platform, session.userId, nickname, now)
                    if (activation?.activated) {
                        filteredHistory.length = 0
                        temporaryBlockTriggered = true
                        temporaryBlockExpiresAt = activation.entry?.expiresAt ?? null
                        temporaryPenaltyApplied = Math.max(0, shortTermConfig.penalty || 0)
                        if (temporaryPenaltyApplied > 0) {
                            longTermTarget = conditionalClamp(longTermTarget - temporaryPenaltyApplied)
                            longTermShift -= temporaryPenaltyApplied
                            longTermChanged = true
                        }
                        const replyTemplate = config.shortTermBlacklist?.replyTemplate
                        if (replyTemplate) {
                            const groupNickname = await resolveGroupNickname(session)
                            const replyText = replyTemplate
                                .replace(/\{nickname\}/g, groupNickname || session.userId)
                                .replace(/\{@user\}/g, `<at id="${session.userId}"/>`)
                                .replace(/\{duration\}/g, String(shortTermOptions.durationHours))
                                .replace(/\{penalty\}/g, String(temporaryPenaltyApplied))
                            session.send?.(replyText).catch(() => { })
                        }
                    }
                }
            }

            const combinedState = hasManualOverride
                ? { affinity: Math.round(longTermTarget), longTermAffinity: Math.round(longTermTarget), shortTermAffinity: Math.round(workingShortTerm) }
                : store.composeState(longTermTarget, workingShortTerm)
            const nextCompositeAffinity = conditionalClamp(nextCoefficientState.coefficient * combinedState.longTermAffinity)
            const shortTermChanged = combinedState.shortTermAffinity !== result.shortTermAffinity || appliedDelta !== 0
            const hasChanges = (nextCompositeAffinity !== oldAffinity) || shortTermChanged || longTermChanged
            const actionEntries = appendActionEntry(result.actionStats?.entries, actionType, nowMs, actionWindow.maxEntries)
            const summarizedNextActions = summarizeActionEntries(actionEntries, actionWindow.windowMs, nowMs)
            const nextCounts = summarizedNextActions.counts
            const nextChatCount = (result.chatCount || 0) + 1
            const shouldPersist = hasChanges || actionType === 'hold'

            if (shouldPersist) {
                const extra = {
                    longTermAffinity: combinedState.longTermAffinity,
                    shortTermAffinity: combinedState.shortTermAffinity,
                    actionStats: { entries: actionEntries, total: summarizedNextActions.total, counts: nextCounts },
                    chatCount: nextChatCount,
                    coefficientState: {
                        streak,
                        coefficient: nextCoefficientState.coefficient,
                        decayPenalty: nextCoefficientState.decayPenalty,
                        streakBoost: nextCoefficientState.streakBoost,
                        inactivityDays: nextCoefficientState.inactivityDays,
                        lastInteractionAt: now
                    },
                    lastInteractionAt: now
                }
                await store.save({ platform: session.platform, userId: session.userId, selfId: session?.selfId, session }, combinedState.affinity, '', extra)
                cache.set(session.platform, session.userId, nextCompositeAffinity)
                if (hasChanges) {
                    log('info', '好感度已更新', {
                        原始综合好感: oldAffinity,
                        原始长期好感: initialLongTerm,
                        原始短期好感: initialShortTerm,
                        本次增减: appliedDelta,
                        额外正向: extraFromHistory > 0 ? extraFromHistory : 0,
                        额外负向: extraFromHistory < 0 ? Math.abs(extraFromHistory) : 0,
                        综合好感系数: nextCoefficientState.coefficient,
                        系数衰减: nextCoefficientState.decayPenalty,
                        系数加成: nextCoefficientState.streakBoost,
                        新的综合好感: nextCompositeAffinity,
                        新的长期好感: combinedState.longTermAffinity,
                        新的短期好感: combinedState.shortTermAffinity,
                        长期调整: longTermShift,
                        聊天次数: nextChatCount,
                        调整历史: nextCounts,
                        用户id: session.userId,
                        用户昵称: nickname || ''
                    })
                }
            }

            if (config.enableAutoBlacklist && nextCompositeAffinity < config.blacklistThreshold) {
                const recorded = store.recordBlacklist(session.platform, session.userId, { note: 'local guard', nickname, channelId })
                if (recorded) {
                    temporaryManager.clear(session.platform, session.userId)
                    const replyTemplate = config.autoBlacklistReply
                    if (replyTemplate) {
                        const groupNickname = await resolveGroupNickname(session)
                        const replyText = replyTemplate
                            .replace(/\{nickname\}/g, groupNickname || session.userId)
                            .replace(/\{@user\}/g, `<at id="${session.userId}"/>`)
                        session.send?.(replyText).catch(() => { })
                    }
                }
            }
        } catch (error) {
            log('warn', '分析流程异常', error)
        }
    }

    const scheduleAnalysis = (session: Session): void => {
        resolveTriggerNicknames(ctx, config).then((names) => {
            if (shouldAnalyzeSession(session, names, log, debugEnabled)) {
                const channelId = getChannelId(session) || 'dm'
                const key = `${session.platform}:${channelId}:${session.userId}`
                pendingAnalysis.set(key, { session, timestamp: Date.now(), botReplies: [], timer: null })
            }
        })
    }

    const addBotReply = (session: Session, botReply: string): void => {
        if (!botReply) return
        const channelId = getChannelId(session) || 'dm'
        const platform = session?.platform
        if (!platform) return

        const now = Date.now()
        const timeout = 30000

        for (const [key, data] of pendingAnalysis.entries()) {
            if (now - data.timestamp > timeout) {
                if (data.timer) clearTimeout(data.timer)
                pendingAnalysis.delete(key)
            }
        }

        let matchedKey: string | null = null
        let matchedData: PendingAnalysis | null = null

        if (session?.userId) {
            const fullKey = `${platform}:${channelId}:${session.userId}`
            if (pendingAnalysis.has(fullKey)) {
                matchedKey = fullKey
                matchedData = pendingAnalysis.get(fullKey)!
            }
        }

        if (!matchedData) {
            for (const [key, data] of pendingAnalysis.entries()) {
                const dataChannelId = getChannelId(data.session) || 'dm'
                if (data.session.platform === platform && dataChannelId === channelId) {
                    matchedKey = key
                    matchedData = data
                    break
                }
            }
        }

        if (matchedData && matchedKey) {
            matchedData.botReplies.push(botReply)
            if (matchedData.timer) clearTimeout(matchedData.timer)

            const capturedKey = matchedKey
            const capturedData = matchedData
            matchedData.timer = setTimeout(async () => {
                const botReplyText = capturedData.botReplies.join('\n')
                pendingAnalysis.delete(capturedKey)
                await executeAnalysis(capturedData.session, botReplyText)
            }, 3000)
        }
    }

    const cancelScheduledAnalysis = (session: Session): void => {
        const channelId = getChannelId(session) || 'dm'
        const platform = session?.platform
        if (!platform) return

        for (const [key, data] of pendingAnalysis.entries()) {
            const dataChannelId = getChannelId(data.session) || 'dm'
            if (data.session.platform === platform && dataChannelId === channelId) {
                if (data.timer) clearTimeout(data.timer)
                return
            }
        }
    }

    return {
        middleware: async (session, next) => {
            if (!config.enableAnalysis) return next()
            scheduleAnalysis(session)
            return next()
        },
        addBotReply,
        cancelScheduledAnalysis
    }
}
