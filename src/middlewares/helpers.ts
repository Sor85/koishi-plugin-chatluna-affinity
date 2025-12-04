import type { Session } from 'koishi'
import type {
  Config,
  AffinityStore,
  AffinityState,
  LogFn,
  ResolvedShortTermConfig,
  ResolvedActionWindowConfig,
  SummarizedActions,
  CoefficientResult,
  TemporaryBlacklistManager
} from '../types'

interface ValidationContext {
  store: AffinityStore
  temporaryBlacklist: TemporaryBlacklistManager
  shortTermConfig: { enabled: boolean }
  log: LogFn
  debugEnabled: boolean
}

interface ValidationResult {
  valid: boolean
  reason?: string
}

export function validateAnalysisContext(
  session: Session | null | undefined,
  config: Config,
  context: ValidationContext
): ValidationResult {
  const { store, temporaryBlacklist, shortTermConfig, log, debugEnabled } = context
  const channelId = (session as unknown as { guildId?: string; channelId?: string; roomId?: string })?.guildId ||
    session?.channelId ||
    (session as unknown as { roomId?: string })?.roomId || ''

  // 检查短期拉黑
  if (shortTermConfig.enabled && session?.platform && session?.userId) {
    const tempEntry = temporaryBlacklist.isBlocked(session.platform, session.userId)
    if (tempEntry) {
      if (debugEnabled) {
        log('debug', '用户处于短期拉黑名单，跳过分析', {
          platform: session.platform,
          userId: session.userId,
          expiresAt: tempEntry.expiresAt
        })
      }
      return { valid: false, reason: 'temporary_blacklist' }
    }
  }

  // 检查自动拉黑
  if (config.enableAutoBlacklist && session?.platform && session?.userId &&
      store.isBlacklisted(session.platform, session.userId, channelId)) {
    if (debugEnabled) {
      log('debug', '用户处于自动拉黑名单，跳过分析', {
        platform: session.platform,
        userId: session.userId
      })
    }
    return { valid: false, reason: 'auto_blacklist' }
  }

  if (!session?.platform || !session?.userId) {
    return { valid: false, reason: 'missing_identity' }
  }

  return { valid: true }
}

interface PrepareAnalysisDataContext {
  store: AffinityStore
  history: { fetch: (session: Session) => Promise<string[]> }
  resolvePersonaPreset: (session: Session) => string
  log: LogFn
  debugEnabled: boolean
}

interface AnalysisData {
  result: AffinityState
  historyLines: string[]
  personaText: string
  now: Date
}

export async function prepareAnalysisData(
  session: Session,
  config: Config,
  context: PrepareAnalysisDataContext
): Promise<AnalysisData> {
  const { store, history, resolvePersonaPreset, log, debugEnabled } = context

  const clampValue = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))
  const result = await store.ensure(session, clampValue)

  // 读取历史消息
  let historyLines = await history.fetch(session)

  // 过滤掉本次用户消息
  const currentUserMessage = session.content ?? ''
  const currentUserId = session.userId

  if (currentUserMessage && currentUserId) {
    for (let i = historyLines.length - 1; i >= 0; i--) {
      const line = historyLines[i]
      if (line.includes(currentUserId) && line.includes(currentUserMessage.trim())) {
        historyLines.splice(i, 1)
        if (debugEnabled) {
          log('debug', '从历史中移除本次用户消息', {
            removedLine: line.substring(0, 100),
            position: i,
            totalLines: historyLines.length + 1
          })
        }
        break
      }
    }
  }

  if (debugEnabled) {
    log('debug', '准备分析数据', {
      userId: session.userId,
      platform: session.platform,
      affinity: result.affinity,
      shortTerm: result.shortTermAffinity,
      longTerm: result.longTermAffinity,
      historyCount: historyLines.length
    })
  }

  const personaText = resolvePersonaPreset(session)

  return {
    result,
    historyLines,
    personaText,
    now: new Date()
  }
}

interface BuildPromptData {
  result: AffinityState
  historyLines: string[]
  personaText: string
  windowChatCount: number
  actionCountsText: string
  nextCoefficientState: CoefficientResult
  shortTermRules: ResolvedShortTermConfig
  maxIncreaseLimit: number
  maxDecreaseLimit: number
  actionWindow: ResolvedActionWindowConfig
  summarizedActions: SummarizedActions
  session: Session
  botReply: string
}

interface RenderTemplateFn {
  (template: string, variables: Record<string, unknown>): string
}

export function buildPrompt(
  config: Config,
  data: BuildPromptData,
  deps: { renderTemplate: RenderTemplateFn }
): string {
  const { result, historyLines, personaText, nextCoefficientState } = data
  const { shortTermRules, maxIncreaseLimit, maxDecreaseLimit, actionWindow } = data

  const storedShortTerm = Number(result.shortTermAffinity ?? 0)
  const storedLongTerm = Number(result.longTermAffinity ?? result.affinity ?? 0)
  const oldAffinity = Math.round(nextCoefficientState.coefficient * storedLongTerm)

  return deps.renderTemplate(config.analysisPrompt, {
    currentAffinity: oldAffinity,
    minAffinity: config.min,
    maxAffinity: config.max,
    maxIncreasePerMessage: maxIncreaseLimit,
    maxDecreasePerMessage: maxDecreaseLimit,
    historyCount: historyLines.length,
    historyText: historyLines.join('\n'),
    historyJson: JSON.stringify(historyLines, null, 2),
    userMessage: data.session.content ?? '',
    botReply: data.botReply || '',
    shortTermAffinity: storedShortTerm,
    longTermAffinity: storedLongTerm,
    shortTermPromoteThreshold: shortTermRules.promoteThreshold,
    shortTermDemoteThreshold: shortTermRules.demoteThreshold,
    actionStatsText: data.summarizedActions.entries.length ? `${data.summarizedActions.entries.length} 条有效记录` : '暂无记录',
    recentActionWindowHours: actionWindow.windowHours,
    recentActionCountsText: data.actionCountsText,
    chatCount: data.windowChatCount,
    longTermCoefficient: nextCoefficientState.coefficient,
    persona: personaText || '',
    personaPreset: personaText || ''
  })
}

interface HandleTemporaryBlacklistData {
  shortTermConfig: { enabled: boolean; windowMs: number; decreaseThreshold: number; penalty: number }
  temporaryBlacklist: TemporaryBlacklistManager
  store: AffinityStore
  log: LogFn
  debugEnabled: boolean
  nickname: string
  now: Date
  shortTermTriggerMap: Map<string, number[]>
  longTermTarget: number
  longTermShift: number
  longTermChanged: boolean
}

interface TemporaryBlacklistResult {
  temporaryBlockTriggered: boolean
  temporaryBlockExpiresAt: number | null
  temporaryPenaltyApplied: number
  longTermTarget: number
  longTermShift: number
  longTermChanged: boolean
}

export function handleTemporaryBlacklist(
  actionType: 'increase' | 'decrease' | 'hold',
  session: Session,
  data: HandleTemporaryBlacklistData
): TemporaryBlacklistResult {
  const { shortTermConfig, temporaryBlacklist, store, nickname, now } = data

  let temporaryBlockTriggered = false
  let temporaryBlockExpiresAt: number | null = null
  let temporaryPenaltyApplied = 0
  let updatedLongTermTarget = data.longTermTarget
  let updatedLongTermShift = data.longTermShift

  if (shortTermConfig.enabled && actionType === 'decrease') {
    const key = `${session.platform || 'unknown'}:${session.userId || 'anonymous'}`
    const nowMs = now.getTime()
    const historyEntry = data.shortTermTriggerMap.get(key) || []
    const filteredHistory = historyEntry.filter((ts) => nowMs - ts < shortTermConfig.windowMs)
    filteredHistory.push(nowMs)
    data.shortTermTriggerMap.set(key, filteredHistory)

    if (filteredHistory.length >= shortTermConfig.decreaseThreshold) {
      const activation = temporaryBlacklist.activate(session.platform!, session.userId!, nickname, now)
      if (activation?.activated) {
        filteredHistory.length = 0
        temporaryBlockTriggered = true
        temporaryBlockExpiresAt = activation.entry?.expiresAt ?? null
        temporaryPenaltyApplied = Math.max(0, shortTermConfig.penalty || 0)

        if (temporaryPenaltyApplied > 0) {
          updatedLongTermTarget = store.clamp(updatedLongTermTarget - temporaryPenaltyApplied)
          updatedLongTermShift -= temporaryPenaltyApplied
        }
      }
    }
  }

  return {
    temporaryBlockTriggered,
    temporaryBlockExpiresAt,
    temporaryPenaltyApplied,
    longTermTarget: updatedLongTermTarget,
    longTermShift: updatedLongTermShift,
    longTermChanged: data.longTermChanged || temporaryPenaltyApplied > 0
  }
}
