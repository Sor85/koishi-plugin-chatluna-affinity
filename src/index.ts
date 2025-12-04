import { h, Context, Session } from 'koishi'
import * as path from 'path'
import { ChatLunaPlugin } from 'koishi-plugin-chatluna/services/chat'
import { getMessageContent } from 'koishi-plugin-chatluna/utils/string'
import { modelSchema } from 'koishi-plugin-chatluna/utils/schema'

import { Config, inject, name, baseAffinityDefaults, defaultMemberInfoItems } from './schema'
import { createLogger } from './utils/logger'
import { renderTemplate } from './utils/template'
import { createAffinityStore, MODEL_NAME } from './core/store'
import { createHistoryManager } from './services/history'
import { createMessageStore } from './services/message-store'
import { createAffinityCache } from './core/cache'
import { createAffinityProvider, createRelationshipProvider, createContextAffinityProvider } from './core/providers'
import { createToolRegistry, createOneBotPokeTool, createOneBotSetSelfProfileTool, createDeleteMessageTool, createPanSouSearchTool } from './tools/tools'
import { createAnalysisMiddleware } from './middlewares/analysis'
import { createScheduleManager } from './services/schedule'
import { stripAtPrefix, formatTimestamp } from './utils/common'
import { resolveRoleLabel } from './utils/role-mapper'
import { renderMemberInfo, resolveUserInfo as resolveUserInfoHelper, resolveBotInfo as resolveBotInfoHelper, normalizeGroupList } from './renders/member-info'
import { createRenderTableImage } from './renders/table'
import { createRenderRankList } from './renders/rank-list'
import { createRenderInspect } from './renders/inspect'
import { createRenderGroupList } from './renders/group-list'
import { createRenderBlacklist } from './renders/blacklist'
import { createRenderSchedule } from './renders/schedule'
import type { Config as ConfigType, MemberInfo, InMemoryTemporaryEntry, LogFn } from './types'

export { Config, inject, name }

const BASE_KEYS = Object.keys(baseAffinityDefaults)

function normalizeBaseAffinityConfig(config: ConfigType): void {
  const base = { ...baseAffinityDefaults, ...(config.baseAffinityConfig || {}) }
  for (const key of BASE_KEYS) {
    const legacy = (config as unknown as Record<string, unknown>)[key]
    if (legacy !== undefined && legacy !== null) {
      const numeric = Number(legacy)
      if (Number.isFinite(numeric)) (base as Record<string, number>)[key] = numeric
    }
  }
  config.baseAffinityConfig = base
  for (const key of BASE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(config, key)) delete (config as unknown as Record<string, unknown>)[key]
    Object.defineProperty(config, key, {
      configurable: true,
      enumerable: true,
      get() { const target = (config.baseAffinityConfig as unknown as Record<string, number>)?.[key]; return Number.isFinite(target) ? target : (baseAffinityDefaults as unknown as Record<string, number>)[key] },
      set(value: number) { if (!config.baseAffinityConfig) config.baseAffinityConfig = { ...baseAffinityDefaults }; (config.baseAffinityConfig as unknown as Record<string, number>)[key] = value }
    })
  }
}

export function apply(ctx: Context, config: ConfigType): void {
  normalizeBaseAffinityConfig(config)
  // @ts-expect-error - Config type compatibility with ChatLunaPlugin
  const plugin = new ChatLunaPlugin(ctx, config, 'affinity', false)
  modelSchema(ctx)

  ctx.inject(['console'], (innerCtx) => {
    const consoleService = (innerCtx as unknown as { console?: { addEntry?: Function } }).console
    consoleService?.addEntry?.({ dev: path.resolve(__dirname, '../client/index.ts'), prod: path.resolve(__dirname, '../dist') })
  })

  const log = createLogger(ctx, config)
  const cache = createAffinityCache()
  const store = createAffinityStore(ctx, config, log)
  const history = createHistoryManager(ctx, config, log)

  // 监听配置变化，当特殊关系配置列表变化时同步到数据库
  ctx.accept(['relationships'], () => {
    store.syncRelationshipsToDatabase().catch((error) => log('warn', '同步特殊关系配置到数据库失败', error))
  }, { passive: true })
  const messageStore = createMessageStore(ctx, log, 100)
  const renderTableImage = createRenderTableImage(ctx)
  const renderRankList = createRenderRankList(ctx)
  const renderInspect = createRenderInspect(ctx)
  const renderGroupList = createRenderGroupList(ctx)
  const renderBlacklist = createRenderBlacklist(ctx)
  const renderSchedule = createRenderSchedule(ctx)

  const shortTermOptions = (() => {
    const cfg = config.shortTermBlacklist || {}
    const enabled = Boolean(cfg.enabled)
    const windowHours = Math.max(1, Number.isFinite(cfg.windowHours) ? cfg.windowHours! : 24)
    const decreaseThreshold = Math.max(1, Number.isFinite(cfg.decreaseThreshold) ? cfg.decreaseThreshold! : 15)
    const durationHours = Math.max(1, Number.isFinite(cfg.durationHours) ? cfg.durationHours! : 12)
    const penalty = Math.max(0, Number.isFinite(cfg.penalty) ? cfg.penalty! : 5)
    return { enabled, windowHours, windowMs: windowHours * 3600 * 1000, decreaseThreshold, durationHours, durationMs: durationHours * 3600 * 1000, penalty }
  })()

  const temporaryBlacklist = new Map<string, InMemoryTemporaryEntry>()
  const makeTempKey = (platform: string, userId: string) => `${platform || 'unknown'}:${userId || 'anonymous'}`

  const temporaryBlacklistManager = {
    isBlocked(platform: string, userId: string) {
      if (!shortTermOptions.enabled) return null
      const key = makeTempKey(platform, userId)
      const entry = temporaryBlacklist.get(key)
      if (!entry) return null
      if (entry.expiresAt <= Date.now()) { temporaryBlacklist.delete(key); return null }
      return entry
    },
    activate(platform: string, userId: string, nickname: string, now: Date) {
      if (!shortTermOptions.enabled) return { activated: false, entry: null }
      const key = makeTempKey(platform, userId)
      const nowMs = now instanceof Date ? now.getTime() : Number(now) || Date.now()
      const current = temporaryBlacklist.get(key)
      if (current && current.expiresAt > nowMs) return { activated: false, entry: current }
      const expiresAt = nowMs + shortTermOptions.durationMs
      const entry = { expiresAt, nickname: nickname || '' }
      temporaryBlacklist.set(key, entry)
      log('info', '已触发短期拉黑', { platform, userId, nickname, expiresAt: formatTimestamp(expiresAt), durationHours: shortTermOptions.durationHours, penalty: shortTermOptions.penalty })
      return { activated: true, entry }
    },
    clear(platform: string, userId: string) { temporaryBlacklist.delete(makeTempKey(platform, userId)) }
  }

  let modelRef: { value?: unknown } | unknown
  const getModel = () => (modelRef as { value?: unknown })?.value ?? modelRef ?? null

  const resolvePersonaPreset = (session?: Session): string => {
    const source = config.personaSource || 'none'
    const chatluna = (ctx as unknown as { chatluna?: { preset?: { getPreset?: (name: string) => { value?: unknown } }; personaPrompt?: string } }).chatluna
    if (source === 'chatluna') {
      let presetName = String(config.personaChatlunaPreset ?? '').trim()
      if (presetName === '无') presetName = ''
      if (presetName) {
        const presetRef = chatluna?.preset?.getPreset?.(presetName)
        const presetValue = presetRef?.value as { rawText?: string; config?: { prompt?: string } } | string | undefined
        if (typeof presetValue === 'string') return presetValue
        if (typeof (presetValue as { rawText?: string })?.rawText === 'string') return (presetValue as { rawText: string }).rawText
        if ((presetValue as { config?: { prompt?: string } })?.config?.prompt) return (presetValue as { config: { prompt: string } }).config.prompt
      }
      return chatluna?.personaPrompt || ''
    }
    if (source === 'custom') return String(config.personaCustomPreset ?? '').trim()
    return ''
  }

  const affinityProvider = createAffinityProvider({ config, cache, store })
  const relationshipProvider = createRelationshipProvider({ store })
  const contextAffinityProvider = createContextAffinityProvider({ config, store, history })
  const scheduleManager = createScheduleManager(ctx, config, {
    getModel: getModel as () => { invoke?: (prompt: string) => Promise<{ content?: unknown }> } | null,
    getMessageContent: getMessageContent as (content: unknown) => string,
    resolvePersonaPreset,
    renderSchedule,
    log
  })
  scheduleManager.registerCommand()

  const DEFAULT_MEMBER_INFO_ITEMS = Array.isArray(defaultMemberInfoItems) && defaultMemberInfoItems.length ? defaultMemberInfoItems : ['nickname', 'userId', 'role', 'level', 'title', 'gender', 'age', 'area', 'joinTime', 'lastSentTime']

  const resolveRoleLabelWithLogging = (session: Session, member: unknown) => resolveRoleLabel(session, member, { logUnknown: config.debugLogging, logger: log })

  const fetchMember = async (session: Session, targetId: string): Promise<MemberInfo | null> => {
    const bot = session?.bot as { internal?: { getGroupMemberInfo?: Function; getGuildMember?: Function; getGroupMember?: Function }; request?: Function; getGuildMember?: Function; getGroupMember?: Function } | undefined
    const guildId = (session as unknown as { guildId?: string })?.guildId || session?.channelId || (session as unknown as { roomId?: string })?.roomId
    if (!bot || !guildId || !targetId) return null
    const attempts = [
      () => (session as unknown as { onebot?: { getGroupMemberInfo?: Function } })?.onebot?.getGroupMemberInfo?.(guildId, targetId, true),
      () => bot.internal?.getGroupMemberInfo?.(guildId, targetId, true),
      () => bot.request?.('get_group_member_info', { group_id: guildId, user_id: targetId, no_cache: true }),
      () => bot.internal?.getGuildMember?.(guildId, targetId),
      () => bot.internal?.getGroupMember?.(guildId, targetId),
      () => bot.getGuildMember?.(guildId, targetId),
      () => bot.getGroupMember?.(guildId, targetId)
    ]
    let merged: MemberInfo | null = null
    for (const attempt of attempts) {
      if (!attempt) continue
      try {
        const member = await attempt()
        if (!member) continue
        merged = merged ? Object.assign({}, merged, member) : (member as MemberInfo)
        if ((merged as MemberInfo).join_time || (merged as MemberInfo).joined_at || (merged as MemberInfo).level) break
      } catch { /* ignore */ }
    }
    return merged
  }

  const resolveGroupId = (session: Session) => (session as unknown as { guildId?: string })?.guildId || session?.channelId || (session as unknown as { roomId?: string })?.roomId || ''

  const extractMemberId = (member: MemberInfo) => (member?.userId ?? member?.id ?? (member as unknown as { qq?: string })?.qq ?? (member as unknown as { uid?: string })?.uid ?? (member as unknown as { user_id?: string })?.user_id ?? '') as string

  const collectMemberNames = (member: MemberInfo): string[] => {
    const names: string[] = []
    const raw = member as unknown as Record<string, unknown>
    const candidates = ['card', 'nickname', 'nick', 'name', 'username', 'displayName', 'display_name', 'user_name']
    for (const key of candidates) {
      const value = raw[key]
      if (typeof value === 'string' && value.trim()) names.push(value.trim())
    }
    if (member?.user) {
      const userRaw = member.user as unknown as Record<string, unknown>
      for (const key of candidates) {
        const value = userRaw[key]
        if (typeof value === 'string' && value.trim()) names.push(value.trim())
      }
    }
    return names
  }

  const findMemberByName = async (session: Session, keyword: string): Promise<MemberInfo | null> => {
    const bot = session?.bot as { getGuildMemberList?: Function; getGroupMemberList?: Function; internal?: { getGuildMemberList?: Function; getGroupMemberList?: Function } } | undefined
    const guildId = resolveGroupId(session)
    if (!bot || !guildId) return null
    const attempts = [
      () => bot.getGuildMemberList?.(guildId),
      () => bot.getGroupMemberList?.(guildId),
      () => bot.internal?.getGuildMemberList?.(guildId),
      () => bot.internal?.getGroupMemberList?.(guildId)
    ]
    const target = stripAtPrefix(keyword)
    if (!target) return null
    for (const attempt of attempts) {
      if (!attempt) continue
      try {
        const list = await attempt()
        if (!Array.isArray(list)) continue
        for (const member of list) {
          const names = collectMemberNames(member as MemberInfo)
          if (names.includes(target)) return member as MemberInfo
          const memberId = stripAtPrefix(extractMemberId(member as MemberInfo))
          if (memberId && memberId === target) return member as MemberInfo
        }
      } catch (error) {
        log('debug', '遍历成员列表失败', { error, guildId, keyword })
      }
    }
    return null
  }

  const resolveUserIdentity = async (session: Session, input: string): Promise<{ userId: string; nickname: string }> => {
    const fallback = stripAtPrefix(input)
    if (!session) return { userId: fallback, nickname: fallback }
    const bot = session.bot
    const guildId = resolveGroupId(session)
    if (!bot || !guildId) return { userId: fallback, nickname: fallback }

    // 尝试直接根据 ID 获取
    if (fallback) {
      const directMember = await fetchMember(session, fallback)
      if (directMember) {
        const userId = stripAtPrefix(extractMemberId(directMember))
        const nickname = stripAtPrefix(collectMemberNames(directMember)[0] || fallback)
        if (userId) return { userId, nickname }
      }
    }

    // 尝试昵称匹配
    const byName = await findMemberByName(session, fallback)
    if (byName) {
      const userId = stripAtPrefix(extractMemberId(byName))
      const nickname = stripAtPrefix(collectMemberNames(byName)[0] || fallback)
      if (userId) return { userId, nickname }
    }

    return { userId: fallback, nickname: fallback }
  }

  const enrichBlacklistRecords = async (records: { userId: string; nickname?: string; blockedAt?: string; note?: string }[], session: Session) => {
    return Promise.all(
      records.map(async (entry) => {
        const sanitizedId = stripAtPrefix(entry?.userId)
        let nickname = stripAtPrefix(entry?.nickname || '')
        let userId = sanitizedId
        if (!nickname || nickname === sanitizedId) {
          const resolved = await resolveUserIdentity(session, sanitizedId)
          userId = resolved.userId || sanitizedId
          nickname = resolved.nickname || sanitizedId
        }
        return { ...entry, userId, nickname }
      })
    )
  }

  const fetchGroupMemberIds = async (session: Session): Promise<Set<string> | null> => {
    const bot = session?.bot as { getGuildMemberList?: Function; getGroupMemberList?: Function; internal?: { getGuildMemberList?: Function; getGroupMemberList?: Function } } | undefined
    const guildId = resolveGroupId(session)
    if (!bot || !guildId) return null
    const attempts = [
      () => bot.getGuildMemberList?.(guildId),
      () => bot.getGroupMemberList?.(guildId),
      () => bot.internal?.getGuildMemberList?.(guildId),
      () => bot.internal?.getGroupMemberList?.(guildId)
    ]
    let attempted = false
    for (const attempt of attempts) {
      if (!attempt) continue
      attempted = true
      try {
        const list = await attempt()
        if (!Array.isArray(list) || !list.length) continue
        const ids = new Set<string>()
        for (const member of list) {
          const id = stripAtPrefix(extractMemberId(member as MemberInfo))
          if (id) ids.add(id)
        }
        if (ids.size) return ids
      } catch (error) {
        log('debug', '获取群成员列表失败', { error, guildId })
      }
    }
    return attempted ? new Set<string>() : null
  }

  const resolveUserInfo = async (session: Session, configItems: string[]) => resolveUserInfoHelper(session, configItems, fetchMember, { defaultItems: DEFAULT_MEMBER_INFO_ITEMS as ('nickname' | 'userId' | 'role' | 'level' | 'title' | 'gender' | 'age' | 'area' | 'joinTime' | 'lastSentTime')[], logUnknown: config.debugLogging, log })
  const resolveBotInfo = async (session: Session, configItems: string[]) => resolveBotInfoHelper(session, configItems, fetchMember, { defaultItems: DEFAULT_MEMBER_INFO_ITEMS as ('nickname' | 'userId' | 'role' | 'level' | 'title' | 'gender' | 'age' | 'area' | 'joinTime' | 'lastSentTime')[], logUnknown: config.debugLogging, log })

  const fetchGroupList = async (session: Session): Promise<{ group_id?: string; groupId?: string; id?: string; group_name?: string; groupName?: string; name?: string; member_count?: number; memberCount?: number }[] | null> => {
    const bot = session?.bot as { internal?: { getGroupList?: Function; _request?: Function } } | undefined
    if (!bot || session?.platform !== 'onebot') return null
    const internal = bot.internal
    if (!internal) return null
    try {
      if (typeof internal.getGroupList === 'function') {
        const result = await internal.getGroupList()
        return Array.isArray(result) ? result : null
      }
      if (typeof internal._request === 'function') {
        const result = await internal._request('get_group_list', {})
        return Array.isArray(result) ? result : null
      }
    } catch (error) {
      log('debug', '获取群列表失败', error)
    }
    return null
  }

  const createGroupInfoProvider = (groupInfoCfg: { includeMemberCount?: boolean; includeCreateTime?: boolean }) => async (_: unknown, __: unknown, configurable?: { session?: Session }) => {
    const session = configurable?.session
    if (!session) return '暂无群信息。'
    if (!session.guildId) return ''
    if (session.platform !== 'onebot') return '当前平台暂不支持查询群列表。'
    try {
      const list = await fetchGroupList(session)
      if (!list || !list.length) return '未能获取当前群信息。'
      const targetId = String(session.guildId)
      const current = list.find((group) => {
        const id = group.group_id ?? group.groupId ?? group.id
        return id && String(id) === targetId
      })
      if (!current) return ''
      return normalizeGroupList([current], {
        includeMemberCount: groupInfoCfg.includeMemberCount !== false,
        includeCreateTime: groupInfoCfg.includeCreateTime !== false
      })
    } catch (error) {
      log('debug', '群列表变量解析失败', error)
      return '获取群列表失败。'
    }
  }

  const logInterception = config.blacklistLogInterception !== false
  const globalGuard = async (session: Session, next: () => Promise<void | string | undefined>) => {
    const platform = session?.platform
    const userId = session?.userId
    const groupId = resolveGroupId(session)
    if (!platform || !userId) return next()
    // 检查短期自动拉黑（内存）
    if (shortTermOptions.enabled) {
      const entry = temporaryBlacklistManager.isBlocked(platform, userId)
      if (entry) { cache.clear(platform, userId); if (logInterception) log('info', '消息已因短期拉黑被拦截', { platform, userId, expiresAt: formatTimestamp(entry.expiresAt) }); return }
    }
    // 检查手动临时拉黑（配置持久化）
    const tempEntry = store.isTemporarilyBlacklisted(platform, userId)
    if (tempEntry) { cache.clear(platform, userId); if (logInterception) log('info', '消息已因临时拉黑被拦截', { platform, userId, expiresAt: tempEntry.expiresAt }); return }
    // 检查永久自动拉黑
    if (!config.enableAutoBlacklist) return next()
    if (!store.isBlacklisted(platform, userId, groupId)) return next()
    cache.clear(platform, userId)
    if (logInterception) log('info', '消息已因自动拉黑被拦截', { platform, userId })
    return
  }

  ctx.middleware(globalGuard as Parameters<typeof ctx.middleware>[0], true)

  ctx.on('ready', async () => {
    // 同步特殊关系配置列表到数据库，确保配置优先于数据库
    try { await store.syncRelationshipsToDatabase() } catch (error) { log('warn', '同步特殊关系配置到数据库失败', error) }

    const chatlunaService = (ctx as unknown as { chatluna?: { createChatModel?: Function; config?: { defaultModel?: string }; promptRenderer?: { registerFunctionProvider?: Function } } }).chatluna
    try { modelRef = await chatlunaService?.createChatModel?.(config.model || chatlunaService?.config?.defaultModel) } catch (error) { log('warn', '模型初始化失败', error) }

    const promptRenderer = chatlunaService?.promptRenderer
    promptRenderer?.registerFunctionProvider?.(config.affinityVariableName, affinityProvider)
    promptRenderer?.registerFunctionProvider?.(config.relationshipVariableName, relationshipProvider)

    const overviewConfig = config.contextAffinityOverview
    const overviewName = String(overviewConfig?.variableName || 'contextAffinity').trim()
    if (overviewName) {
      promptRenderer?.registerFunctionProvider?.(overviewName, contextAffinityProvider)
    }

    const userInfoConfig = config.userInfo || config.otherVariables?.userInfo || { variableName: 'userInfo', items: DEFAULT_MEMBER_INFO_ITEMS }
    const userInfoVariableName = String(userInfoConfig.variableName || 'userInfo').trim()
    if (userInfoVariableName) promptRenderer?.registerFunctionProvider?.(userInfoVariableName, async (_: unknown, __: unknown, configurable?: { session?: Session }) => {
      if (!configurable?.session?.userId) return '未知用户'
      try { return await resolveUserInfo(configurable.session, userInfoConfig.items || DEFAULT_MEMBER_INFO_ITEMS) } catch { return `${configurable.session.username || configurable.session.userId || '未知用户'}` }
    })

    const botInfoConfig = config.botInfo || config.otherVariables?.botInfo || { variableName: 'botInfo', items: DEFAULT_MEMBER_INFO_ITEMS }
    const botInfoVariableName = String(botInfoConfig.variableName || 'botInfo').trim()
    if (botInfoVariableName) promptRenderer?.registerFunctionProvider?.(botInfoVariableName, async (_: unknown, __: unknown, configurable?: { session?: Session }) => {
      if (!configurable?.session) return '未知机器人'
      try { return await resolveBotInfo(configurable.session, botInfoConfig.items || DEFAULT_MEMBER_INFO_ITEMS) } catch { return `${configurable.session.selfId || '未知机器人'}` }
    })

    const groupInfoConfig = config.groupInfo || config.otherVariables?.groupInfo || { variableName: 'groupInfo', includeMemberCount: true, includeCreateTime: true }
    const groupInfoVariableName = String(groupInfoConfig.variableName || 'groupInfo').trim()
    if (groupInfoVariableName) {
      promptRenderer?.registerFunctionProvider?.(groupInfoVariableName, createGroupInfoProvider(groupInfoConfig))
    }

    // 注册随机数变量
    const randomConfig = config.random || config.otherVariables?.random || { variableName: 'random', min: 0, max: 100 }
    const randomVariableName = String(randomConfig.variableName || 'random').trim()
    if (randomVariableName) {
      const randomMin = randomConfig.min ?? 0
      const randomMax = randomConfig.max ?? 100
      promptRenderer?.registerFunctionProvider?.(randomVariableName, () => {
        return Math.floor(Math.random() * (randomMax - randomMin + 1)) + randomMin
      })
    }

    if (config.enablePokeTool) {
      const toolName = String(config.pokeToolName || 'poke_user').trim() || 'poke_user'
      plugin.registerTool(toolName, { selector: () => true, authorization: (session: Session | undefined) => session?.platform === 'onebot', createTool: () => createOneBotPokeTool({ ctx, toolName }) })
    }

    if (config.enableSetSelfProfileTool) {
      const toolName = String(config.setSelfProfileToolName || 'set_self_profile').trim() || 'set_self_profile'
      plugin.registerTool(toolName, { selector: () => true, authorization: (session: Session | undefined) => session?.platform === 'onebot', createTool: () => createOneBotSetSelfProfileTool({ ctx, toolName }) })
    }

    if (config.enableDeleteMessageTool) {
      const toolName = String(config.deleteMessageToolName || 'delete_msg').trim() || 'delete_msg'
      plugin.registerTool(toolName, { selector: () => true, authorization: (session: Session | undefined) => session?.platform === 'onebot', createTool: () => createDeleteMessageTool({ ctx, toolName, messageStore }) })
    }

    const registry = createToolRegistry(config, store, cache)
    if (config.registerAffinityTool) {
      const toolName = String(config.affinityToolName || 'adjust_affinity').trim() || 'adjust_affinity'
      plugin.registerTool(toolName, { selector: registry.affinitySelector, createTool: registry.createAffinityTool })
    }
    if (config.registerRelationshipTool) {
      const toolName = String(config.relationshipToolName || 'adjust_relationship').trim() || 'adjust_relationship'
      plugin.registerTool(toolName, { selector: registry.relationshipSelector, createTool: registry.createRelationshipTool })
    }
    if (config.registerBlacklistTool) {
      const toolName = String(config.blacklistToolName || 'adjust_blacklist').trim() || 'adjust_blacklist'
      plugin.registerTool(toolName, { selector: registry.blacklistSelector, createTool: registry.createBlacklistTool })
    }

    const panSouCfg = config.panSouTool || {}
    if (panSouCfg.enablePanSouTool) {
      const toolName = String(panSouCfg.panSouToolName || 'pansou_search').trim() || 'pansou_search'
      plugin.registerTool(toolName, {
        selector: () => true,
        createTool: () => createPanSouSearchTool({
          ctx,
          toolName,
          apiUrl: panSouCfg.panSouApiUrl || 'http://localhost:8888',
          authEnabled: panSouCfg.panSouAuthEnabled || false,
          username: panSouCfg.panSouUsername || '',
          password: panSouCfg.panSouPassword || '',
          defaultCloudTypes: panSouCfg.panSouDefaultCloudTypes || [],
          maxResults: panSouCfg.panSouMaxResults || 5
        })
      })
    }

    scheduleManager.registerVariables()
    scheduleManager.registerTool(plugin)
    scheduleManager.start()
  })

  const analysisSystem = createAnalysisMiddleware(ctx, config, { store, history, cache, renderTemplate, getMessageContent: getMessageContent as (content: unknown) => string, getModel: getModel as () => { invoke?: (prompt: string) => Promise<{ content?: unknown }> } | null, log, resolvePersonaPreset, temporaryBlacklist: temporaryBlacklistManager, shortTermOptions })
  // @ts-expect-error - Middleware type compatibility
  ctx.middleware(analysisSystem.middleware)

  ctx.on('before-send', (session) => {
    if (!config.enableAnalysis) return
    try {
      const rawContent = (session as unknown as { content?: unknown }).content
      if (!rawContent) return

      // 递归提取所有文本内容
      const extractText = (content: unknown): string => {
        if (!content) return ''
        if (typeof content === 'string') return content
        if (Array.isArray(content)) return content.map(extractText).filter(Boolean).join('')
        if (typeof content === 'object') {
          const el = content as { type?: string; attrs?: { content?: string }; children?: unknown }
          // 处理文本元素
          if (el.type === 'text') return el.attrs?.content || ''
          // 递归处理子元素
          if (el.children) return extractText(el.children)
        }
        return ''
      }

      let botReply = extractText(rawContent)
      if (botReply) {
        botReply = botReply.replace(/<[^>]+>/g, '').trim()
        if (botReply) analysisSystem.addBotReply(session as Session, botReply)
      }
    } catch (error) { log('warn', 'before-send事件处理异常', error) }
  })

  ctx.command('affinity.rank [limit:number] [platform:string] [image]', '查看当前好感度排行', { authority: 1 })
    .alias('好感度排行')
    .action(async ({ session }, limitArg, platformArg, imageArg) => {
      const parsedLimit = Number(limitArg)
      const limit = Math.max(1, Math.min(Number.isFinite(parsedLimit) ? parsedLimit : config.rankDefaultLimit, 50))
      const groupId = resolveGroupId(session as Session)
      const shouldRenderImage = imageArg === undefined ? !!config.rankRenderAsImage : !['0', 'false', 'text', 'no', 'n'].includes(String(imageArg).toLowerCase())
      const puppeteer = (ctx as unknown as { puppeteer?: { page?: Function } }).puppeteer
      if (shouldRenderImage && (!puppeteer?.page)) return '当前环境未启用 puppeteer，已改为文本模式。'

      const conditions: Record<string, unknown> = {}
      const platform = platformArg || session?.platform
      if (platform) conditions.platform = platform
      if (session?.selfId) conditions.selfId = session.selfId

      type AffinityRow = { userId: string; nickname: string | null; relation: string | null; affinity: number }
      let scopedRows: AffinityRow[] = []

      if (groupId) {
        // 群聊模式：先获取群成员列表，再分批查询直到满足条件
        const memberIds = await fetchGroupMemberIds(session as Session)
        if (!memberIds || memberIds.size === 0) {
          return '无法获取本群成员列表，暂时无法展示排行。'
        }

        // 分批查询，每次最多500条，直到找到足够的群成员或遍历完所有记录
        const batchSize = 500
        let offset = 0
        let hasMore = true

        while (scopedRows.length < limit && hasMore) {
          const batch = await ctx.database.select(MODEL_NAME).where(conditions).orderBy('affinity', 'desc').limit(batchSize).offset(offset).execute()
          if (!batch.length) {
            hasMore = false
            break
          }

          for (const row of batch) {
            if (memberIds.has(stripAtPrefix(row.userId))) {
              scopedRows.push(row as AffinityRow)
              if (scopedRows.length >= limit) break
            }
          }

          offset += batchSize
          if (batch.length < batchSize) hasMore = false
        }

        if (!scopedRows.length) return '本群暂无好感度记录。'
      } else {
        // 非群聊模式：直接查询
        const rows = await ctx.database.select(MODEL_NAME).where(conditions).orderBy('affinity', 'desc').limit(limit).execute()
        if (!rows.length) return '当前暂无好感度记录。'
        scopedRows = rows as AffinityRow[]
      }

      // 解析群昵称
      const lines = await Promise.all(scopedRows.map(async (row) => {
        let name = row.nickname || row.userId
        // 尝试获取当前群昵称
        if (groupId) {
          const resolved = await resolveUserIdentity(session as Session, row.userId)
          if (resolved.nickname && resolved.nickname !== row.userId) {
            name = resolved.nickname
          }
        }
        return { name, relation: row.relation || '——', affinity: row.affinity, userId: row.userId }
      }))
      const textLines = ['群昵称 关系 好感度', ...lines.map((item, index) => `${index + 1}. ${item.name} ${item.relation} ${item.affinity}`)]

      if (shouldRenderImage) {
        const rankItems = lines.map((item, index) => {
          const rawId = stripAtPrefix(item.userId)
          // Simple heuristic: if it looks like a number, assume it's a QQ or similar ID that works with qlogo
          // Or if it has a platform prefix, try to extract the numeric part if it is QQ.
          // Since the user asked for QQ avatar, we will try to extract the number.
          // Many adapters use `platform:id`.
          const idParts = rawId.split(':')
          const id = idParts.length > 1 ? idParts[1] : idParts[0]
          const numericId = id.match(/^\d+$/) ? id : undefined
          
          const avatarUrl = numericId ? `https://q1.qlogo.cn/g?b=qq&nk=${numericId}&s=640` : undefined
          
          return {
            rank: index + 1,
            name: item.name,
            relation: item.relation,
            affinity: item.affinity,
            avatarUrl
          }
        })
        
        const buffer = await renderRankList('好感度排行', rankItems)
        if (buffer) return h.image(buffer, 'image/png')
        ctx.logger?.('chatluna-affinity')?.warn?.('排行榜图片渲染失败或服务缺失，已改为文本输出')
        return textLines.join('\n')
      }
      return textLines.join('\n')
    })

  ctx.command('affinity.inspect [targetUserId:string] [platform:string] [image]', '查看指定用户的好感度详情', { authority: 1 })
    .alias('好感度详情')
    .action(async ({ session }, targetUserArg, platformArg, imageArg) => {
      const platform = platformArg || session?.platform || ''
      const userId = targetUserArg || session?.userId || ''
      const selfId = session?.selfId || ''
      if (!selfId || !userId) return '请提供 selfId 和用户 ID。'
      
      const record = await store.load(selfId, userId)
      if (!record) return '未找到好感度记录。'
      
      const state = store.extractState(record)
      const coefficient = state.coefficientState?.coefficient ?? config.affinityDynamics?.coefficient?.base ?? 1.0
      const currentCompositeAffinity = Math.round(coefficient * state.longTermAffinity)
      
      const shouldRenderImage = imageArg === undefined ? !!config.inspectRenderAsImage : !['0', 'false', 'text', 'no', 'n'].includes(String(imageArg).toLowerCase())
      const puppeteer = (ctx as unknown as { puppeteer?: { page?: Function } }).puppeteer
      
      // 获取群昵称（群名片），优先使用 card，其次 nickname
      let displayNickname = record.nickname || userId
      if (session) {
        const memberInfo = await fetchMember(session as Session, userId)
        if (memberInfo) {
          const raw = memberInfo as unknown as Record<string, unknown>
          const card = raw.card || (raw.user as Record<string, unknown>)?.card
          const nick = raw.nickname || raw.nick || (raw.user as Record<string, unknown>)?.nickname || (raw.user as Record<string, unknown>)?.nick
          const resolved = String(card || nick || '').trim()
          if (resolved) displayNickname = resolved
        }
      }
      
      const lines = [
        `用户：${displayNickname} ${stripAtPrefix(userId)}`,
        `关系：${record.relation || '——'}`,
        `综合好感度：${currentCompositeAffinity}`,
        `长期好感度：${state.longTermAffinity}`,
        `短期好感度：${state.shortTermAffinity}`,
        `综合系数：${coefficient.toFixed(2)}（连续互动 ${state.coefficientState?.streak ?? 0} 天）`,
        `交互统计：总计 ${state.chatCount} 次`,
        `最后互动：${formatTimestamp(state.lastInteractionAt)}`
      ]
      
      if (shouldRenderImage && puppeteer?.page) {
        const rawId = stripAtPrefix(userId)
        const idParts = rawId.split(':')
        const id = idParts.length > 1 ? idParts[1] : idParts[0]
        const numericId = id.match(/^\d+$/) ? id : undefined
        const avatarUrl = numericId ? `https://q1.qlogo.cn/g?b=qq&nk=${numericId}&s=640` : undefined
        const displayPlatform = platform === 'onebot' ? '' : platform

        const buffer = await renderInspect({
          userId: stripAtPrefix(userId),
          nickname: displayNickname,
          platform: displayPlatform,
          relation: record.relation || '——',
          compositeAffinity: currentCompositeAffinity,
          longTermAffinity: state.longTermAffinity,
          shortTermAffinity: state.shortTermAffinity,
          coefficient,
          streak: state.coefficientState?.streak ?? 0,
          chatCount: state.chatCount,
          lastInteraction: formatTimestamp(state.lastInteractionAt),
          avatarUrl
        })
        if (buffer) return h.image(buffer, 'image/png')
        ctx.logger?.('chatluna-affinity')?.warn?.('好感度详情图片渲染失败，已改为文本输出')
      }
      
      return lines.join('\n')
    })

  ctx.command('affinity.blacklist [limit:number] [platform:string] [image]', '查看自动黑名单列表', { authority: 2 })
    .alias('自动黑名单')
    .action(async ({ session }, limitArg, platformArg, imageArg) => {
      const parsedLimit = Number(limitArg)
      const limit = Math.max(1, Math.min(Number.isFinite(parsedLimit) ? parsedLimit : config.blacklistDefaultLimit, 100))
      const shouldRenderImage = imageArg === undefined ? !!config.blacklistRenderAsImage : !['0', 'false', 'text', 'no', 'n'].includes(String(imageArg).toLowerCase())
      const puppeteer = (ctx as unknown as { puppeteer?: { page?: Function } }).puppeteer
      if (shouldRenderImage && (!puppeteer?.page)) return '当前环境未启用 puppeteer，已改为文本模式。'

      const groupId = resolveGroupId(session as Session)
      const records = store.listBlacklist(platformArg || session?.platform, groupId)
      if (!records.length) return groupId ? '本群暂无自动拉黑记录。' : '当前暂无自动拉黑记录。'

      const limited = records.slice(0, limit)
      const enriched = await enrichBlacklistRecords(limited, session as Session)
      const textLines = ['# 昵称 用户ID 拉黑时间 备注', ...enriched.map((item, index) => {
        const note = item.note ? item.note : '——'
        const time = item.blockedAt || '——'
        const nickname = stripAtPrefix(item.nickname || item.userId)
        const userIdDisplay = stripAtPrefix(item.userId)
        return `${index + 1}. ${nickname} ${userIdDisplay} ${time} ${note}`
      })]

      if (shouldRenderImage) {
        const items = enriched.map((item, index) => ({
          index: index + 1,
          nickname: stripAtPrefix(item.nickname || item.userId),
          userId: stripAtPrefix(item.userId),
          timeInfo: item.blockedAt || '——',
          note: item.note || '——',
          avatarUrl: (() => {
             const rawId = stripAtPrefix(item.userId)
             const numericId = rawId.match(/^\d+$/) ? rawId : undefined
             return numericId ? `https://q1.qlogo.cn/g?b=qq&nk=${numericId}&s=640` : undefined
          })()
        }))
        const buffer = await renderBlacklist('自动黑名单', items)
        if (buffer) return h.image(buffer, 'image/png')
        ctx.logger?.('chatluna-affinity')?.warn?.('黑名单图片渲染失败或服务缺失，已改为文本输出')
        return textLines.join('\n')
      }

      return textLines.join('\n')
    })

  ctx.command('affinity.block <userId:string> [platform:string]', '手动将用户加入自动黑名单', { authority: 4 })
    .option('note', '-n <note:text> 备注信息')
    .alias('拉黑人')
    .action(async ({ session, options }, userId, platformArg) => {
      const platform = platformArg || session?.platform
      if (!platform) return '请指定平台。'
      const groupId = resolveGroupId(session as Session)
      const resolved = await resolveUserIdentity(session as Session, userId)
      const normalizedUserId = resolved.userId
      if (!normalizedUserId) return '用户 ID 不能为空。'
      if (store.isBlacklisted(platform, normalizedUserId, groupId)) {
        return `${platform}/${normalizedUserId} 已在自动黑名单中。`
      }
      const note = options?.note || 'manual'
      store.recordBlacklist(platform, normalizedUserId, { note, nickname: resolved.nickname, channelId: groupId })
      cache.clear(platform, normalizedUserId)
      const nicknameDisplay = resolved.nickname || normalizedUserId
      return `已将 ${nicknameDisplay} (${normalizedUserId}) 加入自动黑名单。`
    })

  ctx.command('affinity.unblock <userId:string> [platform:string]', '解除自动黑名单', { authority: 4 })
    .alias('解除拉黑')
    .action(async ({ session }, userId, platformArg) => {
      const platform = platformArg || session?.platform
      if (!platform) return '请指定平台。'
      const normalizedUserId = stripAtPrefix(userId)
      if (!normalizedUserId) return '用户 ID 不能为空。'
      const groupId = resolveGroupId(session as Session)
      const removed = store.removeBlacklist(platform, normalizedUserId, groupId)
      cache.clear(platform, normalizedUserId)
      if (removed) return `已解除 ${platform}/${normalizedUserId} 的自动黑名单。`
      return `${platform}/${normalizedUserId} 不在自动黑名单中。`
    })

  ctx.command('affinity.tempBlock <userId:string> [durationHours:number] [platform:string]', '临时拉黑用户', { authority: 4 })
    .option('note', '-n <note:text> 备注信息')
    .option('penalty', '-p <penalty:number> 扣除好感度')
    .alias('临时拉黑')
    .action(async ({ session, options }, userId, durationArg, platformArg) => {
      const platform = platformArg || session?.platform
      if (!platform) return '请指定平台。'
      const groupId = resolveGroupId(session as Session)
      const resolved = await resolveUserIdentity(session as Session, userId)
      const normalizedUserId = resolved.userId
      if (!normalizedUserId) return '用户 ID 不能为空。'

      const shortTermCfg = config.shortTermBlacklist || {}
      const durationHours = durationArg || shortTermCfg.durationHours || 12
      const penalty = options?.penalty ?? shortTermCfg.penalty ?? 5

      const existing = store.isTemporarilyBlacklisted(platform, normalizedUserId)
      if (existing) {
        return `${platform}/${normalizedUserId} 已在临时黑名单中，到期时间：${existing.expiresAt}`
      }

      const entry = store.recordTemporaryBlacklist(platform, normalizedUserId, durationHours, penalty, { note: options?.note || 'manual', nickname: resolved.nickname, channelId: groupId })
      if (!entry) return `添加临时黑名单失败。`

      // 扣除好感度
      const selfId = session?.selfId
      if (penalty > 0 && selfId) {
        try {
          const record = await store.load(selfId, normalizedUserId)
          if (record) {
            const newAffinity = store.clamp((record.longTermAffinity ?? record.affinity) - penalty)
            await store.save({ platform, userId: normalizedUserId, selfId, session }, newAffinity, record.relation || '')
          }
        } catch { /* ignore */ }
      }
      cache.clear(platform, normalizedUserId)

      const nicknameDisplay = resolved.nickname || normalizedUserId
      return `已将 ${nicknameDisplay} (${normalizedUserId}) 加入临时黑名单，时长 ${durationHours} 小时，扣除好感度 ${penalty}。`
    })

  ctx.command('affinity.tempUnblock <userId:string> [platform:string]', '解除临时拉黑', { authority: 4 })
    .alias('解除临时拉黑')
    .action(async ({ session }, userId, platformArg) => {
      const platform = platformArg || session?.platform
      if (!platform) return '请指定平台。'
      const normalizedUserId = stripAtPrefix(userId)
      if (!normalizedUserId) return '用户 ID 不能为空。'
      const removed = store.removeTemporaryBlacklist(platform, normalizedUserId)
      cache.clear(platform, normalizedUserId)
      if (removed) return `已解除 ${platform}/${normalizedUserId} 的临时黑名单。`
      return `${platform}/${normalizedUserId} 不在临时黑名单中。`
    })

  ctx.command('affinity.tempBlacklist [limit:number] [platform:string] [image]', '查看临时黑名单列表', { authority: 2 })
    .alias('临时黑名单')
    .action(async ({ session }, limitArg, platformArg, imageArg) => {
      const parsedLimit = Number(limitArg)
      const limit = Math.max(1, Math.min(Number.isFinite(parsedLimit) ? parsedLimit : config.blacklistDefaultLimit, 100))
      const shouldRenderImage = imageArg === undefined ? !!config.shortTermBlacklist?.renderAsImage : !['0', 'false', 'text', 'no', 'n'].includes(String(imageArg).toLowerCase())
      const puppeteer = (ctx as unknown as { puppeteer?: { page?: Function } }).puppeteer
      if (shouldRenderImage && (!puppeteer?.page)) return '当前环境未启用 puppeteer，已改为文本模式。'

      const records = store.listTemporaryBlacklist(platformArg || session?.platform)
      if (!records.length) return '当前暂无临时拉黑记录。'

      const limited = records.slice(0, limit)
      const textLines = ['# 昵称 用户ID 到期时间 时长 惩罚 备注', ...limited.map((item, index) => {
        const note = item.note ? item.note : '——'
        const expiresAt = item.expiresAt || '——'
        const nickname = stripAtPrefix(item.nickname || item.userId)
        const userIdDisplay = stripAtPrefix(item.userId)
        return `${index + 1}. ${nickname} ${userIdDisplay} ${expiresAt} ${item.durationHours}h ${item.penalty} ${note}`
      })]

      if (shouldRenderImage) {
        const items = limited.map((item, index) => ({
          index: index + 1,
          nickname: stripAtPrefix(item.nickname || item.userId),
          userId: stripAtPrefix(item.userId),
          timeInfo: `${item.durationHours} (到期: ${item.expiresAt || '——'})`,
          note: item.note || '——',
          isTemp: true,
          penalty: Number(item.penalty),
          avatarUrl: (() => {
             const rawId = stripAtPrefix(item.userId)
             const numericId = rawId.match(/^\d+$/) ? rawId : undefined
             return numericId ? `https://q1.qlogo.cn/g?b=qq&nk=${numericId}&s=640` : undefined
          })()
        }))
        const buffer = await renderBlacklist('临时黑名单', items)
        if (buffer) return h.image(buffer, 'image/png')
        ctx.logger?.('chatluna-affinity')?.warn?.('临时黑名单图片渲染失败，已改为文本输出')
      }

      return textLines.join('\n')
    })

  ctx.command('affinity.groupList [image]', '显示机器人已加入的群聊', { authority: 2 })
    .alias('群聊列表')
    .action(async ({ session }, imageArg) => {
      if (!session) return '无法获取会话信息。'
      if (session.platform !== 'onebot') return '该指令仅支持 OneBot/NapCat 平台。'
      const list = await fetchGroupList(session)
      if (!list || !list.length) return '暂无群聊数据。'
      
      const shouldRenderImage = imageArg === undefined ? !!config.groupListRenderAsImage : !['0', 'false', 'text', 'no', 'n'].includes(String(imageArg).toLowerCase())
      const puppeteer = (ctx as unknown as { puppeteer?: { page?: Function } }).puppeteer
      
      const groupInfoCfg = config.groupInfo || config.otherVariables?.groupInfo || {}
      const textResult = normalizeGroupList(list, {
        includeMemberCount: groupInfoCfg.includeMemberCount !== false,
        includeCreateTime: groupInfoCfg.includeCreateTime !== false
      })
      
      if (shouldRenderImage && puppeteer?.page) {
        const groups = list.map((group) => {
          const groupId = String(group.group_id ?? group.groupId ?? group.id ?? '')
          const groupName = String(group.group_name ?? group.groupName ?? group.name ?? groupId)
          const memberCount = group.member_count ?? group.memberCount
          let createTime: string | undefined
          const rawCreateTime = (group as { create_time?: number | string; createTime?: number | string }).create_time
            ?? (group as { create_time?: number | string; createTime?: number | string }).createTime
          if (groupInfoCfg.includeCreateTime !== false && rawCreateTime) {
            const ts = Number(rawCreateTime)
            if (Number.isFinite(ts)) {
              const date = new Date(ts < 1e11 ? ts * 1000 : ts)
              createTime = date.toLocaleDateString('zh-CN')
            }
          }
          return { groupId, groupName, memberCount, createTime }
        })
        
        const buffer = await renderGroupList('群聊列表', groups)
        if (buffer) return h.image(buffer, 'image/png')
        ctx.logger?.('chatluna-affinity')?.warn?.('群聊列表图片渲染失败，已改为文本输出')
      }
      
      return textResult
    })

  // 清空数据库指令（需要二次确认）
  const pendingClearConfirmations = new Map<string, { expiresAt: number }>()
  ctx.command('affinity.clearAll', '清空所有好感度数据（危险操作）', { authority: 4 })
    .alias('清空好感度')
    .option('confirm', '-y 确认清空')
    .action(async ({ session, options }) => {
      if (!session) return '无法获取会话信息。'
      const sessionKey = `${session.platform}:${session.userId}`
      const now = Date.now()

      // 检查是否有待确认的清空请求
      const pending = pendingClearConfirmations.get(sessionKey)
      if (pending && pending.expiresAt > now && options?.confirm) {
        // 二次确认通过，执行清空
        pendingClearConfirmations.delete(sessionKey)
        try {
          await ctx.database.remove(MODEL_NAME, {})
          cache.clearAll?.() // 清空缓存
          log('info', '好感度数据库已清空', { operator: session.userId, platform: session.platform })
          return '✅ 已成功清空所有好感度数据。'
        } catch (error) {
          log('error', '清空好感度数据库失败', error)
          return '❌ 清空数据库时发生错误，请查看日志。'
        }
      }

      // 首次请求，记录待确认状态
      pendingClearConfirmations.set(sessionKey, { expiresAt: now + 60 * 1000 }) // 60秒有效期
      return '⚠️ 警告：此操作将永久删除所有好感度数据，且无法恢复！\n请在 60 秒内使用 `affinity.clearAll -y` 或 `清空好感度 -y` 确认执行。'
    })
}
