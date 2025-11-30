import { z } from 'zod'
import { StructuredTool } from '@langchain/core/tools'
import type { Context, Session } from 'koishi'
import type { Config, AffinityStore, AffinityCache, RelationshipLevel } from '../types'

interface ToolOptions {
  min: number
  max: number
  clamp: (v: number) => number
  resolveLevelByAffinity: (v: number) => RelationshipLevel | null
  resolveLevelByRelation: (name: string) => RelationshipLevel | null
  relationLevels: RelationshipLevel[]
  defaultRelation: string
  defaultInitial: () => number
  save: AffinityStore['save']
  cache: AffinityCache
  updateRelationshipConfig: AffinityStore['updateRelationshipConfig']
  store: AffinityStore
  shortTermConfig?: { durationHours?: number; penalty?: number }
}

interface Runnable {
  configurable?: { session?: Session }
}

function createAffinityTool(options: ToolOptions) {
  // @ts-expect-error - Type instantiation depth issue with zod + StructuredTool
  return new (class extends StructuredTool {
    name = 'adjust_affinity'
    description = 'Adjust affinity for a specific user and sync derived relationship.'
    schema = z.object({
      affinity: z.number().min(options.min).max(options.max).describe(`Target affinity (range ${options.min}-${options.max})`),
      targetUserId: z.string().optional().describe('Target user ID; defaults to current session'),
      platform: z.string().optional().describe('Target platform; defaults to current session')
    })
    async _call(input: { affinity: number; targetUserId?: string; platform?: string }, _manager?: unknown, runnable?: unknown) {
      const session = (runnable as Runnable)?.configurable?.session
      const platform = input.platform || session?.platform
      const userId = input.targetUserId || session?.userId
      if (!platform || !userId) return 'Missing platform or user ID. Unable to adjust affinity.'
      const value = options.clamp(input.affinity)
      const level = options.resolveLevelByAffinity(value)
      await options.save({ platform, userId, selfId: session?.selfId, session }, value, true, level?.relation ?? options.defaultRelation)
      options.cache.set(platform, userId, value)
      if (level?.relation) {
        return `Affinity for ${platform}/${userId} set to ${value}. Relationship updated to ${level.relation}.`
      }
      return `Affinity for ${platform}/${userId} set to ${value}.`
    }
  })()
}

function createRelationshipTool(options: ToolOptions) {
  const levels = Array.isArray(options.relationLevels)
    ? options.relationLevels.map((item) => item && item.relation ? { ...item, relation: String(item.relation).trim() } : null).filter(Boolean) as RelationshipLevel[]
    : []
  const summary = levels.map((item) => `${item.relation}: ${item.min}-${item.max}`).join(' | ')
  // @ts-expect-error - Type instantiation depth issue with zod + StructuredTool
  return new (class extends StructuredTool {
    name = 'adjust_relationship'
    description = 'Set relationship for a user and align affinity to the relationship lower bound.'
    schema = z.object({
      relation: z.string().min(1, 'Relation cannot be empty').describe(summary ? `Target relation (configured: ${summary})` : 'Target relation name'),
      targetUserId: z.string().optional().describe('Target user ID; defaults to current session'),
      platform: z.string().optional().describe('Target platform; defaults to current session')
    })
    async _call(input: { relation: string; targetUserId?: string; platform?: string }, _manager?: unknown, runnable?: unknown) {
      const session = (runnable as Runnable)?.configurable?.session
      const platform = input.platform || session?.platform
      const userId = input.targetUserId || session?.userId
      if (!platform || !userId) return 'Missing platform or user ID. Unable to adjust relationship.'
      const relationName = input.relation.trim()
      let level = options.resolveLevelByRelation(relationName)
      if (!level && Array.isArray(options.relationLevels)) {
        level = options.relationLevels.find((item) => item && item.relation === relationName) || null
      }
      const baseValue = level ? level.min : options.defaultInitial()
      const base = options.clamp(baseValue)
      await options.save({ platform, userId, selfId: session?.selfId, session }, base, true, relationName)
      options.cache.set(platform, userId, base)
      options.updateRelationshipConfig(userId, relationName, base)
      if (level) {
        return `Relationship for ${platform}/${userId} set to ${relationName}. Affinity updated to ${base}.`
      }
      return `Relationship for ${platform}/${userId} set to ${relationName} (custom). Affinity updated to ${base}.`
    }
  })()
}

function createBlacklistTool(options: ToolOptions) {
  // @ts-expect-error - Type instantiation depth issue with zod + StructuredTool
  return new (class extends StructuredTool {
    name = 'adjust_blacklist'
    description = 'Add or remove a user from the affinity blacklist. Supports both permanent and temporary blacklist.'
    schema = z.object({
      action: z.enum(['add', 'remove', 'temp_add', 'temp_remove']).describe('Action: add/remove for permanent blacklist, temp_add/temp_remove for temporary blacklist'),
      targetUserId: z.string().describe('Target user ID'),
      platform: z.string().optional().describe('Target platform; defaults to current session'),
      note: z.string().optional().describe('Optional note when adding to blacklist'),
      durationHours: z.number().optional().describe('Duration in hours for temporary blacklist (default: 12)'),
      penalty: z.number().optional().describe('Affinity penalty for temporary blacklist (default: from config)')
    })
    async _call(input: { action: 'add' | 'remove' | 'temp_add' | 'temp_remove'; targetUserId: string; platform?: string; note?: string; durationHours?: number; penalty?: number }, _manager?: unknown, runnable?: unknown) {
      const session = (runnable as Runnable)?.configurable?.session
      const platform = input.platform || session?.platform
      const userId = input.targetUserId
      const channelId = (session as unknown as { guildId?: string })?.guildId || session?.channelId || (session as unknown as { roomId?: string })?.roomId || ''
      if (!platform || !userId) return 'Missing platform or user ID. Unable to adjust blacklist.'

      // 临时拉黑
      if (input.action === 'temp_add') {
        let nickname = ''
        try {
          const existing = await options.store.load(platform, userId)
          nickname = existing?.nickname || ''
        } catch { /* ignore */ }
        const durationHours = input.durationHours ?? options.shortTermConfig?.durationHours ?? 12
        const penalty = input.penalty ?? options.shortTermConfig?.penalty ?? 5
        const entry = options.store.recordTemporaryBlacklist(platform, userId, durationHours, penalty, { note: input.note ?? 'tool', nickname, channelId })
        if (!entry) return `User ${platform}/${userId} is already in temporary blacklist.`
        // 扣除好感度
        if (penalty > 0) {
          try {
            const record = await options.store.load(platform, userId)
            if (record) {
              const newAffinity = options.clamp((record.longTermAffinity ?? record.affinity) - penalty)
              await options.save({ platform, userId, selfId: session?.selfId, session }, newAffinity, true, record.relation || '')
            }
          } catch { /* ignore */ }
        }
        options.cache.clear(platform, userId)
        return `User ${platform}/${userId} added to temporary blacklist for ${durationHours} hours with ${penalty} penalty.`
      }

      if (input.action === 'temp_remove') {
        const removed = options.store.removeTemporaryBlacklist(platform, userId)
        options.cache.clear(platform, userId)
        return removed
          ? `User ${platform}/${userId} removed from temporary blacklist.`
          : `User ${platform}/${userId} not found in temporary blacklist.`
      }

      // 永久拉黑
      if (input.action === 'add') {
        let nickname = ''
        try {
          const existing = await options.store.load(platform, userId)
          nickname = existing?.nickname || ''
        } catch { /* ignore */ }
        options.store.recordBlacklist(platform, userId, { note: input.note ?? 'tool', nickname, channelId })
        options.cache.clear(platform, userId)
        return `User ${platform}/${userId} added to blacklist.`
      }
      const removed = options.store.removeBlacklist(platform, userId, channelId)
      options.cache.clear(platform, userId)
      return removed
        ? `User ${platform}/${userId} removed from blacklist.`
        : `User ${platform}/${userId} not found in blacklist.`
    }
  })()
}

function getSession(runnable: unknown): Session | null {
  return (runnable as Runnable)?.configurable?.session || null
}

function ensureOneBotSession(session: Session | null): { error?: string; session?: Session; internal?: Record<string, unknown> } {
  if (!session) return { error: '缺少会话上下文，无法执行 OneBot 工具。' }
  if (session.platform !== 'onebot') return { error: '该工具仅支持 OneBot 平台。' }
  if (!session.bot) return { error: '当前会话缺少 bot 实例，无法执行工具。' }
  const internal = (session.bot as unknown as { internal?: Record<string, unknown> }).internal
  if (!internal) return { error: 'Bot 适配器未暴露 OneBot internal 接口。' }
  return { session, internal }
}

async function callOneBotAPI(internal: Record<string, unknown>, action: string, params: Record<string, unknown>, fallbacks: string[] = []): Promise<unknown> {
  if (typeof internal._request === 'function') {
    return (internal._request as Function)(action, params)
  }
  for (const key of fallbacks) {
    if (typeof internal[key] === 'function') {
      return (internal[key] as Function)(params)
    }
  }
  throw new Error(`当前 OneBot 适配器不支持 ${action} 接口。`)
}

interface OneBotToolDeps {
  ctx: Context
  toolName: string
}

export function createOneBotPokeTool({ ctx, toolName }: OneBotToolDeps) {
  const logger = ctx?.logger?.('chatluna-affinity') as { info?: Function; warn?: Function } | undefined
  // @ts-expect-error - Type instantiation depth issue with zod + StructuredTool
  return new (class extends StructuredTool {
    name = toolName || 'poke_user'
    description = 'Poke (nudge) a specified user in a group or private conversation.'
    schema = z.object({
      userId: z.string().min(1, 'userId is required').describe('The user ID to poke.'),
      groupId: z.string().optional().describe('Optional: specify a different group ID if the poke should happen in another group.')
    })
    async _call(input: { userId: string; groupId?: string }, _manager?: unknown, runnable?: unknown) {
      try {
        const session = getSession(runnable)
        const { error, internal } = ensureOneBotSession(session)
        if (error) return error
        const params: Record<string, unknown> = { user_id: input.userId }
        const groupId = input.groupId?.trim() || (session as unknown as { guildId?: string })?.guildId || session?.channelId || (session as unknown as { roomId?: string })?.roomId
        if (groupId) params.group_id = groupId
        if (typeof internal!._request === 'function') {
          await (internal!._request as Function)('send_poke', params)
        } else if (typeof internal!.sendPoke === 'function') {
          await (internal!.sendPoke as Function)(params.group_id, params.user_id)
        } else if (typeof internal!.pokeUser === 'function') {
          await (internal!.pokeUser as Function)(params)
        } else {
          throw new Error('当前适配器未实现 send_poke API。')
        }
        const location = params.group_id ? `群 ${params.group_id}` : '私聊'
        const message = `已在 ${location} 戳了一下 ${params.user_id}。`
        logger?.info?.(message)
        return message
      } catch (error) {
        logger?.warn?.('戳一戳工具执行失败', error)
        return `戳一戳失败：${(error as Error).message}`
      }
    }
  })()
}

export function createOneBotSetSelfProfileTool({ ctx, toolName }: OneBotToolDeps) {
  const logger = ctx?.logger?.('chatluna-affinity') as { info?: Function; warn?: Function } | undefined
  const genders: Record<string, string> = { unknown: '0', male: '1', female: '2' }
  // @ts-expect-error - Type instantiation depth issue with zod + StructuredTool
  return new (class extends StructuredTool {
    name = toolName || 'set_self_profile'
    description = "Update the bot's own QQ profile (nickname, signature, gender)."
    schema = z.object({
      nickname: z.string().min(1, 'nickname is required').describe('The new nickname for the bot.'),
      signature: z.string().optional().describe('Optional: the new personal signature.'),
      gender: z.enum(['unknown', 'male', 'female']).optional().describe('Optional: the new gender.')
    })
    async _call(input: { nickname: string; signature?: string; gender?: 'unknown' | 'male' | 'female' }, _manager?: unknown, runnable?: unknown) {
      try {
        const session = getSession(runnable)
        const { error, internal } = ensureOneBotSession(session)
        if (error) return error
        const payload: Record<string, unknown> = { nickname: input.nickname }
        if (input.signature) payload.personal_note = input.signature
        if (input.gender) payload.sex = genders[input.gender]
        await callOneBotAPI(internal!, 'set_qq_profile', payload, ['setQQProfile'])
        const message = '机器人资料已更新。'
        logger?.info?.(message)
        return message
      } catch (error) {
        logger?.warn?.('修改机器人账户信息失败', error)
        return `修改机器人账户信息失败：${(error as Error).message}`
      }
    }
  })()
}

interface DeleteMessageToolDeps extends OneBotToolDeps {
  messageStore?: {
    findByLastN: (session: Session, lastN: number, userId?: string) => { messageId: string; userId: string; username: string; content: string } | null
    findByContent: (session: Session, keyword: string, userId?: string) => { messageId: string; userId: string; username: string; content: string } | null
  }
}

export function createDeleteMessageTool({ ctx, toolName, messageStore }: DeleteMessageToolDeps) {
  const logger = ctx?.logger?.('chatluna-affinity') as { info?: Function; warn?: Function } | undefined
  // @ts-expect-error - Type instantiation depth issue with zod + StructuredTool
  return new (class extends StructuredTool {
    name = toolName || 'delete_msg'
    description = `Deletes (recalls) a message. You can specify the message by:
1. messageId: directly provide the message ID
2. lastN: delete the Nth most recent message (1 = most recent). Can combine with userId to target a specific user.
3. contentMatch: delete the most recent message containing this keyword. Can combine with userId.
4. If none provided, will try to use the quoted message.
As a group admin, you can delete messages from any user.`
    schema = z.object({
      messageId: z.string().optional().describe('Specific message ID to delete.'),
      lastN: z.number().int().min(1).optional().describe('Delete the Nth most recent message (1 = latest). Example: 1 to delete the latest message, 2 for second latest.'),
      userId: z.string().optional().describe('Target user ID. Use with lastN or contentMatch to delete a specific user\'s message.'),
      contentMatch: z.string().optional().describe('Delete the most recent message containing this keyword/phrase.')
    })
    async _call(input: { messageId?: string; lastN?: number; userId?: string; contentMatch?: string }, _manager?: unknown, runnable?: unknown) {
      try {
        const session = getSession(runnable)
        if (!session) return 'No session context available.'

        let resolvedMessageId = ''
        let matchInfo = ''

        // 优先级: messageId > lastN > contentMatch > quoted message
        if (typeof input.messageId === 'string' && input.messageId.trim()) {
          resolvedMessageId = input.messageId.trim()
          matchInfo = `by ID ${resolvedMessageId}`
        } else if (input.lastN && input.lastN > 0 && messageStore) {
          const found = messageStore.findByLastN(session, input.lastN, input.userId)
          if (found) {
            resolvedMessageId = found.messageId
            const userInfo = input.userId ? ` from user ${found.username}(${found.userId})` : ''
            matchInfo = `#${input.lastN} recent message${userInfo}: "${found.content.slice(0, 30)}${found.content.length > 30 ? '...' : ''}"`
          } else {
            const userHint = input.userId ? ` from user ${input.userId}` : ''
            return `No message found at position ${input.lastN}${userHint}.`
          }
        } else if (input.contentMatch && messageStore) {
          const found = messageStore.findByContent(session, input.contentMatch, input.userId)
          if (found) {
            resolvedMessageId = found.messageId
            const userInfo = input.userId ? ` from user ${found.username}(${found.userId})` : ''
            matchInfo = `matching "${input.contentMatch}"${userInfo}: "${found.content.slice(0, 30)}${found.content.length > 30 ? '...' : ''}"`
          } else {
            const userHint = input.userId ? ` from user ${input.userId}` : ''
            return `No message found containing "${input.contentMatch}"${userHint}.`
          }
        } else {
          // 回退到 quoted message
          resolvedMessageId =
            (session as unknown as { quote?: { id?: string } })?.quote?.id ||
            (session as unknown as { event?: { quote?: { messageId?: string }; message?: { id?: string } } })?.event?.quote?.messageId ||
            (session as unknown as { event?: { message?: { id?: string } } })?.event?.message?.id ||
            ''
          if (resolvedMessageId) {
            matchInfo = 'quoted message'
          }
        }

        if (!resolvedMessageId) {
          return 'No message found to delete. Please provide messageId, use lastN/contentMatch to search, or quote a message.'
        }

        const messageIdRaw = resolvedMessageId.trim()
        const numericId = /^\d+$/.test(messageIdRaw) ? Number(messageIdRaw) : messageIdRaw

        if (session.platform === 'onebot') {
          const { error, internal } = ensureOneBotSession(session)
          if (error) return error
          await callOneBotAPI(internal!, 'delete_msg', { message_id: numericId }, ['deleteMsg'])
          const success = `Message deleted (${matchInfo}).`
          logger?.info?.(success)
          return success
        }

        const bot = session.bot as unknown as { deleteMessage?: Function }
        if (typeof bot?.deleteMessage === 'function') {
          const channelId = session.channelId || (session as unknown as { guildId?: string })?.guildId || (session as unknown as { roomId?: string })?.roomId || (session as unknown as { channel?: { id?: string } })?.channel?.id || ''
          if (!channelId) return 'Cannot determine channel to delete message.'
          await bot.deleteMessage(channelId, messageIdRaw)
          const success = `Message deleted (${matchInfo}).`
          logger?.info?.(success)
          return success
        }

        return 'Delete message is not supported on this platform.'
      } catch (error) {
        logger?.warn?.('delete_msg failed', error)
        return `delete_msg failed: ${(error as Error).message}`
      }
    }
  })()
}

interface PanSouToolDeps {
  ctx: Context
  toolName: string
  apiUrl: string
  authEnabled: boolean
  username: string
  password: string
  defaultCloudTypes: string[]
  maxResults: number
}

interface PanSouMergedLink {
  url: string
  password?: string
  note?: string
  datetime?: string
  source?: string
}

interface PanSouResponseData {
  total?: number
  merged_by_type?: Record<string, PanSouMergedLink[]>
  results?: unknown[]
}

interface PanSouResponse {
  data?: PanSouResponseData
  total?: number
  merged_by_type?: Record<string, PanSouMergedLink[]>
  results?: unknown[]
  error?: string
  code?: number
  message?: string
}

export function createPanSouSearchTool({ ctx, toolName, apiUrl, authEnabled, username, password, defaultCloudTypes, maxResults }: PanSouToolDeps) {
  const logger = ctx?.logger?.('chatluna-affinity') as { info?: Function; warn?: Function; debug?: Function } | undefined
  let cachedToken: string | null = null
  let tokenExpiry: number = 0

  async function getToken(): Promise<string | null> {
    if (!authEnabled) return null
    if (cachedToken && Date.now() < tokenExpiry) return cachedToken

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await response.json() as { token?: string; expires_at?: number; error?: string }
      if (data.token) {
        cachedToken = data.token
        tokenExpiry = (data.expires_at || Date.now() / 1000 + 3600) * 1000 - 60000
        return cachedToken
      }
      logger?.warn?.('PanSou 认证失败', data.error)
      return null
    } catch (error) {
      logger?.warn?.('PanSou 认证请求失败', error)
      return null
    }
  }

  const cloudTypeNames: Record<string, string> = {
    baidu: '百度网盘',
    aliyun: '阿里云盘',
    quark: '夸克网盘',
    tianyi: '天翼云盘',
    uc: 'UC网盘',
    mobile: '移动云盘',
    '115': '115网盘',
    pikpak: 'PikPak',
    xunlei: '迅雷网盘',
    '123': '123网盘',
    magnet: '磁力链接',
    ed2k: '电驴链接',
    others: '其他'
  }

  // @ts-expect-error - Type instantiation depth issue with zod + StructuredTool
  return new (class extends StructuredTool {
    name = toolName || 'pansou_search'
    description = `Search for cloud storage resources (网盘资源). Supports Baidu, Aliyun, Quark, Tianyi, UC, 115, PikPak, Xunlei, 123 cloud drives and magnet/ed2k links. Use this tool when users ask for movies, TV shows, music, software, e-books or other downloadable resources.`
    schema = z.object({
      keyword: z.string().min(1, 'Search keyword is required').describe('The search keyword for finding resources (e.g., movie name, TV show name, software name)'),
      cloudTypes: z.array(z.string()).optional().describe('Optional: specific cloud types to search (baidu, aliyun, quark, tianyi, uc, mobile, 115, pikpak, xunlei, 123, magnet, ed2k). Leave empty for all types.')
    })

    async _call(input: { keyword: string; cloudTypes?: string[] }): Promise<string> {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (authEnabled) {
          const token = await getToken()
          if (token) headers['Authorization'] = `Bearer ${token}`
        }

        const cloudTypes = input.cloudTypes?.length ? input.cloudTypes : (defaultCloudTypes.length ? defaultCloudTypes : undefined)
        const requestBody: Record<string, unknown> = {
          kw: input.keyword,
          res: 'merge'
        }
        if (cloudTypes) requestBody.cloud_types = cloudTypes

        logger?.info?.(`PanSou 搜索请求: keyword=${input.keyword}, apiUrl=${apiUrl}, cloudTypes=${JSON.stringify(cloudTypes)}`)
        logger?.info?.(`PanSou 请求体: ${JSON.stringify(requestBody)}`)

        const response = await fetch(`${apiUrl}/api/search`, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody)
        })

        const responseText = await response.text()
        logger?.info?.(`PanSou 原始响应 (status=${response.status}): ${responseText.slice(0, 2000)}`)

        let data: PanSouResponse
        try {
          data = JSON.parse(responseText) as PanSouResponse
        } catch (e) {
          logger?.warn?.('PanSou 响应解析失败', e)
          return `搜索失败: 响应解析错误`
        }

        // 兼容两种响应格式: { data: { merged_by_type } } 或 { merged_by_type }
        const responseData = data.data || data
        logger?.info?.(`PanSou 响应字段: total=${responseData.total}, merged_by_type keys=${Object.keys(responseData.merged_by_type || {}).join(',')}, results count=${responseData.results?.length || 0}`)

        if (data.error || (data.code && data.code !== 200 && data.code !== 0)) {
          return `搜索失败: ${data.error || data.message || '未知错误'}`
        }

        const mergedByType = responseData.merged_by_type
        if (!mergedByType || Object.keys(mergedByType).length === 0) {
          logger?.warn?.(`PanSou 未找到结果, 完整响应: ${JSON.stringify(data).slice(0, 1000)}`)
          return `未找到"${input.keyword}"的相关资源。`
        }

        const results: string[] = [`🔍 "${input.keyword}" 的搜索结果：\n`]
        let totalCount = 0

        for (const [cloudType, links] of Object.entries(mergedByType)) {
          if (!links || links.length === 0) continue
          const typeName = cloudTypeNames[cloudType] || cloudType
          const limitedLinks = links.slice(0, maxResults)
          
          results.push(`\n📁 ${typeName} (${links.length} 个结果):`)
          for (const link of limitedLinks) {
            totalCount++
            const title = link.note || '未知资源'
            const pwd = link.password ? ` | 密码: ${link.password}` : ''
            results.push(`  • ${title}`)
            results.push(`    链接: ${link.url}${pwd}`)
          }
          if (links.length > maxResults) {
            results.push(`  ... 还有 ${links.length - maxResults} 个结果`)
          }
        }

        if (totalCount === 0) {
          return `未找到"${input.keyword}"的相关资源。`
        }

        results.push(`\n共找到 ${responseData.total || totalCount} 个资源`)
        logger?.info?.(`PanSou 搜索完成: ${input.keyword}, 共 ${totalCount} 个结果`)
        return results.join('\n')
      } catch (error) {
        logger?.warn?.('PanSou 搜索失败', error)
        return `网盘搜索失败: ${(error as Error).message}`
      }
    }
  })()
}

export function createToolRegistry(config: Config, store: AffinityStore, cache: AffinityCache) {
  const shortTermCfg = config.shortTermBlacklist || {}
  const options: ToolOptions = {
    clamp: store.clamp,
    resolveLevelByAffinity: store.resolveLevelByAffinity,
    resolveLevelByRelation: store.resolveLevelByRelation,
    relationLevels: config.relationshipAffinityLevels || [],
    defaultRelation: '',
    defaultInitial: store.defaultInitial,
    save: store.save,
    cache,
    updateRelationshipConfig: store.updateRelationshipConfig,
    store,
    min: config.min ?? 0,
    max: config.max ?? 100,
    shortTermConfig: {
      durationHours: shortTermCfg.durationHours ?? 12,
      penalty: shortTermCfg.penalty ?? 5
    }
  }

  return {
    affinitySelector: () => true,
    relationshipSelector: () => true,
    blacklistSelector: () => true,
    createAffinityTool: () => createAffinityTool(options),
    createRelationshipTool: () => createRelationshipTool(options),
    createBlacklistTool: () => createBlacklistTool(options)
  }
}
