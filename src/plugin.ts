/**
 * 插件主逻辑
 * 组装所有模块并初始化插件功能
 */

import * as path from 'path'
import { Context, Session } from 'koishi'
import { ChatLunaPlugin } from 'koishi-plugin-chatluna/services/chat'
import { getMessageContent } from 'koishi-plugin-chatluna/utils/string'
import { modelSchema } from 'koishi-plugin-chatluna/utils/schema'

import type { Config, LogFn } from './types'
import { BASE_AFFINITY_DEFAULTS } from './constants'
import { registerModels } from './models'
import { createLogger } from './helpers'
import { stripAtPrefix, renderTemplate, formatTimestamp } from './utils'
import { createAffinityStore } from './services/affinity/store'
import { createAffinityCache } from './services/affinity/cache'
import { createMessageHistory } from './services/message/history'
import { createMessageStore } from './services/message/store'
import { createPermanentBlacklistManager } from './services/blacklist/permanent'
import { createTemporaryBlacklistManager } from './services/blacklist/temporary'
import { createBlacklistGuard } from './services/blacklist/guard'
import { createLevelResolver } from './services/relationship/level-resolver'
import { createManualRelationshipManager } from './services/relationship/manual-config'
import { createAnalysisMiddleware } from './services/analysis'
import { createScheduleManager } from './services/schedule'
import { createRenderService } from './renders'
import {
    createAffinityProvider,
    createRelationshipProvider,
    createContextAffinityProvider,
    createUserInfoProvider,
    createBotInfoProvider,
    createGroupInfoProvider,
    createRandomProvider
} from './integrations/chatluna/variables'
import {
    createAffinityTool,
    createRelationshipTool,
    createBlacklistTool
} from './integrations/chatluna/tools'
import { createPokeTool, createSetProfileTool, createDeleteMessageTool } from './integrations/onebot/tools'
import {
    registerRankCommand,
    registerInspectCommand,
    registerBlacklistCommand,
    registerBlockCommand,
    registerTempBlockCommand,
    registerGroupListCommand,
    registerClearAllCommand,
    registerAdjustCommand
} from './commands'
import {
    fetchMember,
    resolveUserIdentity,
    findMemberByName,
    fetchGroupMemberIds,
    fetchGroupList,
    resolveGroupId
} from './helpers/member'

const BASE_KEYS = Object.keys(BASE_AFFINITY_DEFAULTS)

function normalizeBaseAffinityConfig(config: Config): void {
    const base = { ...BASE_AFFINITY_DEFAULTS, ...(config.baseAffinityConfig || {}) }
    for (const key of BASE_KEYS) {
        const legacy = (config as unknown as Record<string, unknown>)[key]
        if (legacy !== undefined && legacy !== null) {
            const numeric = Number(legacy)
            if (Number.isFinite(numeric)) (base as Record<string, number>)[key] = numeric
        }
    }
    config.baseAffinityConfig = base
    for (const key of BASE_KEYS) {
        if (Object.prototype.hasOwnProperty.call(config, key))
            delete (config as unknown as Record<string, unknown>)[key]
        Object.defineProperty(config, key, {
            configurable: true,
            enumerable: true,
            get() {
                const target = (config.baseAffinityConfig as unknown as Record<string, number>)?.[key]
                return Number.isFinite(target)
                    ? target
                    : (BASE_AFFINITY_DEFAULTS as unknown as Record<string, number>)[key]
            },
            set(value: number) {
                if (!config.baseAffinityConfig)
                    config.baseAffinityConfig = { ...BASE_AFFINITY_DEFAULTS }
                ;(config.baseAffinityConfig as unknown as Record<string, number>)[key] = value
            }
        })
    }
}

export function apply(ctx: Context, config: Config): void {
    normalizeBaseAffinityConfig(config)
    registerModels(ctx)

    // @ts-expect-error - Config type compatibility with ChatLunaPlugin
    const plugin = new ChatLunaPlugin(ctx, config, 'affinity', false)
    modelSchema(ctx)

    ctx.inject(['console'], (innerCtx) => {
        const consoleService = (
            innerCtx as unknown as { console?: { addEntry?: (entry: unknown) => void } }
        ).console
        consoleService?.addEntry?.({
            dev: path.resolve(__dirname, '../client/index.ts'),
            prod: path.resolve(__dirname, '../dist')
        })
    })

    const log = createLogger(ctx, config)

    log('warn', '⚠️ 升级提示：0.2.1-alpha.10 版本后数据库结构已重构。若出现数据库相关错误，请执行 affinity.clearall 命令清除数据后重试。')
    const cache = createAffinityCache()
    const store = createAffinityStore({ ctx, config, log })
    const history = createMessageHistory({ ctx, config, log })
    const messageStore = createMessageStore({ ctx, log, limit: 100 })
    const levelResolver = createLevelResolver(config)
    const manualRelationship = createManualRelationshipManager({
        ctx,
        config,
        log,
        applyConfigUpdate: () => {
            ctx.scope.update(config, false)
        }
    })
    const permanentBlacklist = createPermanentBlacklistManager({
        config,
        log,
        applyConfigUpdate: () => {
            ctx.scope.update(config, false)
        }
    })

    const shortTermCfg = config.shortTermBlacklist || {}
    const shortTermOptions = {
        enabled: Boolean(shortTermCfg.enabled),
        windowHours: Math.max(1, Number.isFinite(shortTermCfg.windowHours) ? shortTermCfg.windowHours! : 24),
        windowMs: 0,
        decreaseThreshold: Math.max(1, Number.isFinite(shortTermCfg.decreaseThreshold) ? shortTermCfg.decreaseThreshold! : 15),
        durationHours: Math.max(1, Number.isFinite(shortTermCfg.durationHours) ? shortTermCfg.durationHours! : 12),
        durationMs: 0,
        penalty: Math.max(0, Number.isFinite(shortTermCfg.penalty) ? shortTermCfg.penalty! : 5)
    }
    shortTermOptions.windowMs = shortTermOptions.windowHours * 3600 * 1000
    shortTermOptions.durationMs = shortTermOptions.durationHours * 3600 * 1000

    const temporaryBlacklist = createTemporaryBlacklistManager({
        config,
        shortTermOptions,
        log,
        applyConfigUpdate: () => {
            ctx.scope.update(config, false)
        }
    })
    const renders = createRenderService({ ctx, log })

    const scheduleManager = createScheduleManager(ctx, config, {
        getModel: () => (modelRef as { value?: unknown })?.value ?? modelRef ?? null,
        getMessageContent: getMessageContent as (content: unknown) => string,
        resolvePersonaPreset: () => resolvePersonaPreset(),
        renderSchedule: renders.schedule,
        log
    })
    scheduleManager.registerCommand()

    ctx.accept(
        ['relationships'],
        () => {
            manualRelationship
                .syncToDatabase()
                .catch((error) => log('warn', '同步特殊关系配置到数据库失败', error))
        },
        { passive: true }
    )

    const blacklistGuard = createBlacklistGuard({
        config,
        permanent: permanentBlacklist,
        temporary: temporaryBlacklist,
        log
    })
    ctx.middleware(blacklistGuard.middleware as Parameters<typeof ctx.middleware>[0], true)

    let modelRef: { value?: unknown } | unknown
    const getModel = () => (modelRef as { value?: unknown })?.value ?? modelRef ?? null

    const resolvePersonaPreset = (session?: Session): string => {
        const source = config.personaSource || 'none'
        const chatluna = (
            ctx as unknown as {
                chatluna?: {
                    preset?: { getPreset?: (name: string) => { value?: unknown } }
                    personaPrompt?: string
                }
            }
        ).chatluna
        if (source === 'chatluna') {
            let presetName = String(config.personaChatlunaPreset ?? '').trim()
            if (presetName === '无') presetName = ''
            if (presetName) {
                const presetRef = chatluna?.preset?.getPreset?.(presetName)
                const presetValue = presetRef?.value as
                    | { rawText?: string; config?: { prompt?: string } }
                    | string
                    | undefined
                if (typeof presetValue === 'string') return presetValue
                if (typeof (presetValue as { rawText?: string })?.rawText === 'string')
                    return (presetValue as { rawText: string }).rawText
                if ((presetValue as { config?: { prompt?: string } })?.config?.prompt)
                    return (presetValue as { config: { prompt: string } }).config.prompt
            }
            return chatluna?.personaPrompt || ''
        }
        if (source === 'custom') return String(config.personaCustomPreset ?? '').trim()
        return ''
    }

    const analysisSystem = createAnalysisMiddleware(ctx, config, {
        store: {
            clamp: store.clamp,
            ensure: async (session, clampFn) => {
                const result = await store.ensure(session, clampFn)
                return result as unknown as Record<string, unknown>
            },
            save: store.save as unknown as (seed: { platform: string; userId: string; selfId?: string; session?: Session }, value: number, relation: string, extra?: Record<string, unknown>) => Promise<unknown>,
            composeState: (longTerm: number, shortTerm: number) => {
                const affinity = Math.round(longTerm)
                return { affinity, longTermAffinity: Math.round(longTerm), shortTermAffinity: Math.round(shortTerm) }
            },
            isBlacklisted: (platform: string, userId: string) => {
                return permanentBlacklist.isBlacklisted(platform, userId) || !!temporaryBlacklist.isBlocked(platform, userId)
            },
            isTemporarilyBlacklisted: (platform: string, userId: string) => {
                const entry = temporaryBlacklist.isTemporarilyBlacklisted(platform, userId)
                return entry ? { expiresAt: entry.expiresAt || '' } : null
            },
            findManualRelationship: (platform: string, userId: string) => {
                return manualRelationship.find(platform, userId)
            },
            resolveLevelByAffinity: levelResolver.resolveLevelByAffinity,
            recordBlacklist: (platform: string, userId: string, detail?: Record<string, unknown>) => {
                permanentBlacklist.record(platform, userId, { nickname: detail?.nickname as string, note: detail?.note as string })
                return true
            }
        },
        history: { fetch: history.fetch.bind(history) },
        cache,
        getModel: getModel as () => { invoke?: (prompt: string) => Promise<{ content?: unknown }> } | null,
        renderTemplate: renderTemplate as (template: string, variables: Record<string, unknown>) => string,
        getMessageContent: getMessageContent as (content: unknown) => string,
        log,
        resolvePersonaPreset,
        temporaryBlacklist: {
            isBlocked: (platform: string, userId: string) => {
                const entry = temporaryBlacklist.isBlocked(platform, userId)
                return entry ? { platform, odUserId: userId, nickname: entry.nickname || '', expiresAt: entry.expiresAt } : null
            },
            activate: (platform: string, userId: string, nickname: string, now: Date) => {
                const result = temporaryBlacklist.activate(platform, userId, nickname, now)
                return {
                    activated: result.activated,
                    entry: result.entry ? { platform, odUserId: userId, nickname, expiresAt: result.entry.expiresAt } : null
                }
            },
            clear: (platform: string, userId: string) => {
                temporaryBlacklist.clear(platform, userId)
            }
        },
        shortTermOptions
    })
    ctx.middleware(analysisSystem.middleware as Parameters<typeof ctx.middleware>[0])

    ctx.on('before-send', (session) => {
        if (!config.enableAnalysis) return
        try {
            const rawContent = (session as unknown as { content?: unknown }).content
            if (!rawContent) return

            const extractText = (content: unknown): string => {
                if (!content) return ''
                if (typeof content === 'string') return content
                if (Array.isArray(content)) return content.map(extractText).filter(Boolean).join('')
                if (typeof content === 'object') {
                    const el = content as { type?: string; attrs?: { content?: string }; children?: unknown }
                    if (el.type === 'text') return el.attrs?.content || ''
                    if (el.children) return extractText(el.children)
                }
                return ''
            }

            let botReply = extractText(rawContent)
            if (botReply) {
                botReply = botReply.replace(/<[^>]+>/g, '').trim()
                if (botReply) analysisSystem.addBotReply(session as Session, botReply)
            }
        } catch (error) {
            log('warn', 'before-send事件处理异常', error)
        }
    })

    const fetchMemberBound = (session: Session, userId: string) => fetchMember(session, userId)
    const resolveUserIdentityBound = (session: Session, input: string) =>
        resolveUserIdentity(session, input)
    const findMemberByNameBound = (session: Session, name: string) =>
        findMemberByName(session, name, log)
    const fetchGroupMemberIdsBound = (session: Session) => fetchGroupMemberIds(session, log)
    const fetchGroupListBound = (session: Session) => fetchGroupList(session, log)

    const commandDeps = {
        ctx,
        config,
        log,
        store,
        cache,
        renders,
        fetchMember: fetchMemberBound,
        resolveUserIdentity: resolveUserIdentityBound,
        findMemberByName: findMemberByNameBound,
        fetchGroupMemberIds: fetchGroupMemberIdsBound,
        fetchGroupList: fetchGroupListBound,
        resolveGroupId,
        stripAtPrefix
    }

    registerRankCommand(commandDeps)
    registerInspectCommand(commandDeps)
    registerAdjustCommand(commandDeps)
    registerBlacklistCommand({ ...commandDeps, permanentBlacklist, temporaryBlacklist })
    registerBlockCommand({ ...commandDeps, permanentBlacklist })
    registerTempBlockCommand({ ...commandDeps, temporaryBlacklist })
    registerGroupListCommand(commandDeps)
    registerClearAllCommand(commandDeps)

    ctx.on('ready', async () => {
        try {
            await manualRelationship.syncToDatabase()
        } catch (error) {
            log('warn', '同步特殊关系配置到数据库失败', error)
        }

        const chatlunaService = (
            ctx as unknown as {
                chatluna?: {
                    createChatModel?: (model: string) => Promise<unknown>
                    config?: { defaultModel?: string }
                    promptRenderer?: {
                        registerFunctionProvider?: (name: string, provider: unknown) => void
                    }
                }
            }
        ).chatluna
        try {
            modelRef = await chatlunaService?.createChatModel?.(
                config.model || chatlunaService?.config?.defaultModel || ''
            )
        } catch (error) {
            log('warn', '模型初始化失败', error)
        }

        const promptRenderer = chatlunaService?.promptRenderer

        const affinityProvider = createAffinityProvider({ cache, store })
        promptRenderer?.registerFunctionProvider?.(config.affinityVariableName, affinityProvider)

        const relationshipProvider = createRelationshipProvider({ store })
        promptRenderer?.registerFunctionProvider?.(
            config.relationshipVariableName,
            relationshipProvider
        )

        const overviewName = String(
            config.contextAffinityOverview?.variableName || 'contextAffinity'
        ).trim()
        if (overviewName) {
            const contextAffinityProvider = createContextAffinityProvider({
                config,
                store,
                fetchEntries: history.fetchEntries.bind(history)
            })
            promptRenderer?.registerFunctionProvider?.(overviewName, contextAffinityProvider)
        }

        const userInfoProvider = createUserInfoProvider({
            config,
            log,
            fetchMember: fetchMemberBound
        })
        const userInfoName = String(
            config.userInfo?.variableName || config.otherVariables?.userInfo?.variableName || 'userInfo'
        ).trim()
        if (userInfoName) promptRenderer?.registerFunctionProvider?.(userInfoName, userInfoProvider)

        const botInfoProvider = createBotInfoProvider({
            config,
            log,
            fetchMember: fetchMemberBound
        })
        const botInfoName = String(
            config.botInfo?.variableName || config.otherVariables?.botInfo?.variableName || 'botInfo'
        ).trim()
        if (botInfoName) promptRenderer?.registerFunctionProvider?.(botInfoName, botInfoProvider)

        const groupInfoProvider = createGroupInfoProvider({
            config,
            log,
            fetchGroupList: fetchGroupListBound
        })
        const groupInfoName = String(
            config.groupInfo?.variableName ||
                config.otherVariables?.groupInfo?.variableName ||
                'groupInfo'
        ).trim()
        if (groupInfoName) promptRenderer?.registerFunctionProvider?.(groupInfoName, groupInfoProvider)

        const randomProvider = createRandomProvider({ config })
        const randomName = String(
            config.random?.variableName || config.otherVariables?.random?.variableName || 'random'
        ).trim()
        if (randomName) promptRenderer?.registerFunctionProvider?.(randomName, randomProvider)

        const toolDeps = {
            config,
            store,
            cache,
            permanentBlacklist,
            temporaryBlacklist,
            clamp: store.clamp,
            resolveLevelByAffinity: levelResolver.resolveLevelByAffinity,
            resolveLevelByRelation: levelResolver.resolveLevelByRelation,
            resolveUserIdentity: resolveUserIdentityBound
        }

        if (config.registerAffinityTool) {
            const toolName = String(config.affinityToolName || 'adjust_affinity').trim()
            plugin.registerTool(toolName, {
                selector: () => true,
                createTool: () => createAffinityTool(toolDeps)
            })
        }

        if (config.registerRelationshipTool) {
            const toolName = String(config.relationshipToolName || 'adjust_relationship').trim()
            plugin.registerTool(toolName, {
                selector: () => true,
                createTool: () => createRelationshipTool(toolDeps)
            })
        }

        if (config.registerBlacklistTool) {
            const toolName = String(config.blacklistToolName || 'adjust_blacklist').trim()
            plugin.registerTool(toolName, {
                selector: () => true,
                createTool: () => createBlacklistTool(toolDeps)
            })
        }

        if (config.enablePokeTool) {
            const toolName = String(config.pokeToolName || 'poke_user').trim()
            plugin.registerTool(toolName, {
                selector: () => true,
                authorization: (session: Session | undefined) => session?.platform === 'onebot',
                createTool: () => createPokeTool({ ctx, toolName, log })
            })
        }

        if (config.enableSetSelfProfileTool) {
            const toolName = String(config.setSelfProfileToolName || 'set_self_profile').trim()
            plugin.registerTool(toolName, {
                selector: () => true,
                authorization: (session: Session | undefined) => session?.platform === 'onebot',
                createTool: () => createSetProfileTool({ ctx, toolName, log })
            })
        }

        if (config.enableDeleteMessageTool) {
            const toolName = String(config.deleteMessageToolName || 'delete_msg').trim()
            plugin.registerTool(toolName, {
                selector: () => true,
                authorization: (session: Session | undefined) => session?.platform === 'onebot',
                createTool: () => createDeleteMessageTool({ ctx, toolName, messageStore, log })
            })
        }

        scheduleManager.registerVariables()
        scheduleManager.registerTool(plugin)
        scheduleManager.start()
    })
}
