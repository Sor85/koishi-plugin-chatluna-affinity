/**
 * 分析中间件类型定义
 * 包含分析系统所需的接口和选项
 */

import type { Session } from 'koishi'
import type { Config, LogFn, AffinityCache, ShortTermOptions, InMemoryTemporaryEntry } from '../../types'
export interface AnalysisAffinityStore {
    clamp: (value: number) => number
    ensure: (session: Session, clampFn: (value: number, low: number, high: number) => number) => Promise<Record<string, unknown>>
    save: (seed: { platform: string; userId: string; selfId?: string; session?: Session }, value: number, relation: string, extra?: Record<string, unknown>) => Promise<unknown>
    composeState: (longTerm: number, shortTerm: number) => { affinity: number; longTermAffinity: number; shortTermAffinity: number }
    isBlacklisted: (platform: string, userId: string, channelId?: string) => boolean
    isTemporarilyBlacklisted: (platform: string, userId: string) => { expiresAt: string } | null
    findManualRelationship: (platform: string, userId: string) => { relation?: string } | null
    resolveLevelByAffinity: (affinity: number) => { relation?: string } | null
    recordBlacklist: (platform: string, userId: string, detail?: Record<string, unknown>) => boolean
}

export interface PendingAnalysis {
    session: Session
    timestamp: number
    botReplies: string[]
    timer: ReturnType<typeof setTimeout> | null
}

export interface AnalysisMiddlewareResult {
    middleware: (session: Session, next: () => Promise<void>) => Promise<void>
    addBotReply: (session: Session, botReply: string) => void
    cancelScheduledAnalysis: (session: Session) => void
}

export interface TemporaryBlacklistManager {
    isBlocked: (platform: string, userId: string) => InMemoryTemporaryEntry | null
    activate: (platform: string, userId: string, nickname: string, now: Date) => { activated: boolean; entry: InMemoryTemporaryEntry | null }
    clear: (platform: string, userId: string) => void
}

export interface AnalysisMiddlewareDeps {
    store: AnalysisAffinityStore
    history: { fetch: (session: Session) => Promise<string[]> }
    cache: AffinityCache
    getModel: () => { invoke?: (prompt: string) => Promise<{ content?: unknown }> } | null
    renderTemplate: (template: string, variables: Record<string, unknown>) => string
    getMessageContent: (content: unknown) => string
    log: LogFn
    resolvePersonaPreset: (session?: Session) => string
    temporaryBlacklist: TemporaryBlacklistManager
    shortTermOptions: ShortTermOptions
}
