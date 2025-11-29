import type { Context, Session } from 'koishi'
import type {
  Config,
  AffinityStore,
  AffinityCache,
  LogFn,
  TemporaryBlacklistManager,
  ShortTermOptions,
  AnalysisMiddlewareResult,
  PendingAnalysis
} from '../types'
import {
  resolveShortTermConfig,
  resolveActionWindowConfig,
  resolveCoefficientConfig,
  summarizeActionEntries,
  appendActionEntry,
  computeDailyStreak,
  computeCoefficientValue,
  computeShortTermReset
} from '../core/dynamics'

interface MiddlewareDeps {
  store: AffinityStore
  history: { fetch: (session: Session) => Promise<string[]> }
  cache: AffinityCache
  getModel: () => { invoke?: (prompt: string) => Promise<{ content?: unknown }> } | null
  renderTemplate: (template: string, variables: Record<string, unknown>) => string
  getMessageContent: (content: unknown) => string
  log: LogFn
  resolvePersonaPreset: (session: Session) => string
  temporaryBlacklist: TemporaryBlacklistManager
  shortTermOptions: ShortTermOptions
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

const tryBlacklistUser = async (
  _ctx: Context,
  session: Session,
  store: AffinityStore,
  cache: AffinityCache,
  log: LogFn
): Promise<{ skipped?: boolean; recorded?: boolean }> => {
  const platform = session?.platform
  const userId = session?.userId
  const channelId = (session as unknown as { guildId?: string; channelId?: string; roomId?: string })?.guildId ||
    session?.channelId ||
    (session as unknown as { roomId?: string })?.roomId || ''
  if (!platform || !userId) return { skipped: true }
  if (store.isBlacklisted(platform, userId, channelId)) {
    log('debug', '用户已在自动拉黑列表，跳过重复处理', { platform, userId })
    return { skipped: true }
  }

  const author = (session as unknown as { author?: { nickname?: string; name?: string } })?.author
  const user = (session as unknown as { user?: { nickname?: string; name?: string } })?.user
  const nickname = author?.nickname || author?.name || user?.nickname || user?.name || ''
  const recorded = store.recordBlacklist(platform, userId, { note: 'local guard', nickname, channelId })
  if (recorded) log('info', '已记录自动拉黑用户', { platform, userId, note: 'local guard' })
  cache?.clear?.(platform, userId)

  return { recorded: Boolean(recorded) }
}

export function createAnalysisMiddleware(ctx: Context, config: Config, deps: MiddlewareDeps): AnalysisMiddlewareResult {
  const { store, history, cache, getModel, renderTemplate, getMessageContent, log, resolvePersonaPreset, temporaryBlacklist, shortTermOptions } = deps
  const debugEnabled = config.debugLogging
  const pendingAnalysis = new Map<string, PendingAnalysis>()

  const actionWindow = resolveActionWindowConfig(config)
  const coefficientRules = resolveCoefficientConfig(config)
  const shortTermRules = resolveShortTermConfig(config)

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
    clear: () => {}
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

  const describeModelResponse = ({ parsed, delta, action, session, nickname }: { parsed: Record<string, unknown>; delta: number; action: string; session: Session; nickname: string }) => {
    const rawAction = typeof parsed?.action === 'string' ? parsed.action.toLowerCase() : ''
    return {
      本次增减: parsed?.delta ?? '',
      原始动作: resolveActionLabel(rawAction),
      原因说明: parsed?.reason ?? '',
      修正增减: delta,
      动作判定: resolveActionLabel(action || rawAction),
      用户id: session?.userId ?? '',
      用户昵称: nickname || ''
    }
  }

  const describeAffinityUpdate = (detail: Record<string, unknown>) => ({
    原始综合好感: detail.originalAffinity,
    原始长期好感: detail.initialLongTerm,
    原始短期好感: detail.initialShortTerm,
    本次增减: detail.limitedDelta,
    额外正向: detail.positiveBonusApplied,
    额外负向: detail.negativeBonusApplied,
    综合好感系数: detail.coefficient,
    系数衰减: detail.coefficientDecay,
    系数加成: detail.coefficientBoost,
    新的综合好感: detail.nextAffinity,
    新的长期好感: detail.longTerm,
    新的短期好感: detail.shortTerm,
    长期调整: detail.longTermShift,
    聊天次数: detail.chatCount,
    调整历史: detail.historyStats,
    临时封禁: detail.temporaryBlocked ? '是' : '否',
    临时惩罚: detail.temporaryPenalty,
    临时到期: detail.temporaryExpiresAt ? String(detail.temporaryExpiresAt) : '——',
    用户id: detail.userId,
    用户昵称: detail.nickname || ''
  })

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

  const executeAnalysis = async (session: Session, botReply: string): Promise<void> => {
    const channelId = (session as unknown as { guildId?: string; channelId?: string; roomId?: string })?.guildId ||
      session?.channelId ||
      (session as unknown as { roomId?: string })?.roomId || ''

    if (shortTermConfig.enabled) {
      const tempEntry = temporaryManager.isBlocked(session?.platform!, session?.userId!)
      if (tempEntry) {
        if (debugEnabled) log('debug', '用户处于短期拉黑名单，跳过分析', { platform: session?.platform, userId: session?.userId, expiresAt: tempEntry.expiresAt })
        return
      }
    }

    if (config.enableAutoBlacklist && store.isBlacklisted(session?.platform!, session?.userId!, channelId)) {
      cache.clear(session?.platform!, session?.userId!)
      if (debugEnabled) log('debug', '用户处于自动拉黑名单，跳过分析', { platform: session?.platform, userId: session?.userId })
      return
    }

    // 检查手动临时拉黑
    const tempBlacklistEntry = store.isTemporarilyBlacklisted(session?.platform!, session?.userId!)
    if (tempBlacklistEntry) {
      if (debugEnabled) log('debug', '用户处于临时拉黑名单，跳过分析', { platform: session?.platform, userId: session?.userId, expiresAt: tempBlacklistEntry.expiresAt })
      return
    }

    const nicknames = await resolveTriggerNicknames(ctx, config)
    if (!shouldAnalyzeSession(session, nicknames, log, debugEnabled)) return
    if (!session?.platform || !session?.userId) return

    try {
      const manual = store.findManualRelationship(session.platform, session.userId)
      const fallback = manual && typeof manual.initialAffinity === 'number' ? manual.initialAffinity : undefined
      const result = await store.ensure(session, clampValue, fallback)
      const now = new Date()
      const storedShortTerm = Number(result.shortTermAffinity ?? 0)
      const storedLongTerm = Number(result.longTermAffinity ?? result.affinity ?? 0)
      const baselineShortTerm = Math.round(storedShortTerm)
      const baselineState = store.composeState(storedLongTerm, baselineShortTerm)
      let longTermTarget = baselineState.longTermAffinity
      const initialLongTerm = longTermTarget
      const initialShortTerm = baselineShortTerm
      const previousCoefficient = Number.isFinite(result.coefficientState?.coefficient)
        ? result.coefficientState.coefficient
        : coefficientRules.base
      const computedComposite = store.clamp(previousCoefficient * longTermTarget)
      const storedComposite = Number.isFinite((result as unknown as { affinityOverride?: number }).affinityOverride)
        ? Math.round((result as unknown as { affinityOverride: number }).affinityOverride)
        : computedComposite
      const needsCompositeRepair = storedComposite !== computedComposite
      const oldAffinity = computedComposite

      let historyLines = await history.fetch(session)
      const currentUserMessage = session.content ?? ''
      const currentUserId = session.userId

      if (debugEnabled) log('debug', '读取已有好感度', {
        userId: session.userId,
        platform: session.platform,
        affinity: oldAffinity,
        shortTerm: baselineShortTerm,
        longTerm: longTermTarget,
        actionStats: result.actionStats,
        chatCount: result.chatCount,
        lastInteractionAt: result.lastInteractionAt,
        coefficientState: result.coefficientState
      })

      if (currentUserMessage && currentUserId) {
        const originalLength = historyLines.length
        for (let i = historyLines.length - 1; i >= 0; i--) {
          const line = historyLines[i]
          if (line.includes(currentUserId) && line.includes(currentUserMessage.trim())) {
            historyLines.splice(i, 1)
            if (debugEnabled) log('debug', '从历史中移除本次用户消息', { removedLine: line.substring(0, 100), position: i, totalLines: originalLength })
            break
          }
        }
      }

      if (debugEnabled) log('debug', '历史消息和bot回复', {
        historyCount: historyLines.length,
        hasBotReply: !!botReply,
        botReplyPreview: botReply ? botReply.substring(0, 100) : '',
        historyPreview: historyLines.slice(-3).join('\n')
      })

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
        const entryTime = typeof entry.timestamp === 'object' && entry.timestamp !== null && 'getTime' in entry.timestamp ? (entry.timestamp as Date).getTime() : (entry.timestamp as number)
        return entryTime >= todayStartMs && entryTime <= nowMs
      })
      const todayIncreaseCount = todayActions.filter(entry => entry.action === 'increase').length
      const todayDecreaseCount = todayActions.filter(entry => entry.action === 'decrease').length

      const nextCoefficientState = computeCoefficientValue(coefficientRules, streak, result.coefficientState?.lastInteractionAt, now, todayIncreaseCount, todayDecreaseCount)

      const prompt = renderTemplate(config.analysisPrompt, {
        currentAffinity: oldAffinity,
        minAffinity: config.min,
        maxAffinity: config.max,
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
      const nickname = author?.nickname || author?.name || user?.nickname || user?.name || session?.username || (session as unknown as { nickname?: string })?.nickname || ''

      if (match) {
        try {
          const parsed = JSON.parse(match[0]) as { delta?: number | string; action?: string; reason?: string }
          const raw = typeof parsed.delta === 'number' ? parsed.delta : parseInt(String(parsed.delta), 10)
          if (Number.isFinite(raw)) delta = Math.trunc(raw)
          const action = typeof parsed.action === 'string' ? parsed.action.toLowerCase() : ''
          if (action === 'increase' && delta <= 0) delta = Math.max(1, Math.abs(delta))
          if (action === 'decrease' && delta >= 0) delta = -Math.max(1, Math.abs(delta))
          if (action === 'hold') delta = 0
          if (debugEnabled) log('info', '模型返回', describeModelResponse({ parsed, delta, action, session, nickname }))
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
        longTermTarget = store.clamp(longTermTarget + longTermShift)
        workingShortTerm = computeShortTermReset()
        longTermChanged = true
      } else if (workingShortTerm <= shortTermRules.demoteThreshold) {
        longTermShift = -shortTermRules.longTermDemoteStep
        longTermTarget = store.clamp(longTermTarget + longTermShift)
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
              longTermTarget = store.clamp(longTermTarget - temporaryPenaltyApplied)
              longTermShift -= temporaryPenaltyApplied
              longTermChanged = true
            }
          }
        }
      }

      const combinedState = store.composeState(longTermTarget, workingShortTerm)
      const nextCompositeAffinity = store.clamp(nextCoefficientState.coefficient * combinedState.longTermAffinity)
      const shortTermChanged = combinedState.shortTermAffinity !== result.shortTermAffinity || appliedDelta !== 0
      const hasChanges = needsCompositeRepair || (nextCompositeAffinity !== oldAffinity) || shortTermChanged || longTermChanged
      const actionEntries = appendActionEntry(result.actionStats?.entries, actionType, nowMs, actionWindow.maxEntries)
      const summarizedNextActions = summarizeActionEntries(actionEntries, actionWindow.windowMs, nowMs)
      const nextCounts = summarizedNextActions.counts
      const nextChatCount = (result.chatCount || 0) + 1
      const shouldPersist = hasChanges || actionType === 'hold'

      if (shouldPersist) {
        const level = store.resolveLevelByAffinity(nextCompositeAffinity)
        const nextShortTermUpdatedAt = shortTermChanged ? now : (result.shortTermUpdatedAt || result.updatedAt || now)
        const nextLongTermUpdatedAt = longTermChanged ? now : (result.longTermUpdatedAt || result.updatedAt || now)
        const extra = {
          longTermAffinity: combinedState.longTermAffinity,
          shortTermAffinity: combinedState.shortTermAffinity,
          shortTermUpdatedAt: nextShortTermUpdatedAt,
          longTermUpdatedAt: nextLongTermUpdatedAt,
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
          lastInteractionAt: now,
          affinityOverride: nextCompositeAffinity
        }
        await store.save({ platform: session.platform, userId: session.userId, selfId: session?.selfId, session }, combinedState.affinity, true, level?.relation ?? '', extra)
        cache.set(session.platform, session.userId, nextCompositeAffinity)
        if (hasChanges) {
          log('info', '好感度已更新', describeAffinityUpdate({
            originalAffinity: oldAffinity,
            initialLongTerm,
            initialShortTerm,
            limitedDelta,
            positiveBonusApplied: extraFromHistory > 0 ? extraFromHistory : 0,
            negativeBonusApplied: extraFromHistory < 0 ? Math.abs(extraFromHistory) : 0,
            coefficient: nextCoefficientState.coefficient,
            coefficientDecay: nextCoefficientState.decayPenalty,
            coefficientBoost: nextCoefficientState.streakBoost,
            nextAffinity: nextCompositeAffinity,
            shortTerm: combinedState.shortTermAffinity,
            longTerm: combinedState.longTermAffinity,
            longTermShift,
            chatCount: summarizedNextActions.total,
            historyStats: nextCounts,
            temporaryBlocked: temporaryBlockTriggered,
            temporaryPenalty: temporaryPenaltyApplied,
            temporaryExpiresAt: temporaryBlockExpiresAt,
            userId: session.userId,
            nickname
          }))
        }
      }

      if (config.enableAutoBlacklist && nextCompositeAffinity < config.blacklistThreshold) {
        const resultBlack = await tryBlacklistUser(ctx, session, store, cache, log)
        if (resultBlack?.recorded) temporaryManager.clear(session.platform, session.userId)
      }
    } catch (error) {
      log('warn', '分析流程异常', error)
    }
  }

  const scheduleAnalysis = (session: Session): void => {
    resolveTriggerNicknames(ctx, config).then((names) => {
      if (shouldAnalyzeSession(session, names, log, debugEnabled)) {
        const channelId = (session as unknown as { guildId?: string; channelId?: string; roomId?: string })?.guildId ||
          session?.channelId ||
          (session as unknown as { roomId?: string })?.roomId || 'dm'
        const key = `${session.platform}:${channelId}:${session.userId}`
        pendingAnalysis.set(key, { session, timestamp: Date.now(), botReplies: [], timer: null })
      }
    })
  }

  const addBotReply = (session: Session, botReply: string): void => {
    if (!botReply) return
    const channelId = (session as unknown as { guildId?: string; channelId?: string; roomId?: string })?.guildId ||
      session?.channelId ||
      (session as unknown as { roomId?: string })?.roomId || 'dm'
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
        const dataChannelId = (data.session as unknown as { guildId?: string; channelId?: string; roomId?: string })?.guildId ||
          data.session?.channelId ||
          (data.session as unknown as { roomId?: string })?.roomId || 'dm'
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
    const channelId = (session as unknown as { guildId?: string; channelId?: string; roomId?: string })?.guildId ||
      session?.channelId ||
      (session as unknown as { roomId?: string })?.roomId || 'dm'
    const platform = session?.platform
    if (!platform) return

    for (const [key, data] of pendingAnalysis.entries()) {
      const dataChannelId = (data.session as unknown as { guildId?: string; channelId?: string; roomId?: string })?.guildId ||
        data.session?.channelId ||
        (data.session as unknown as { roomId?: string })?.roomId || 'dm'
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
