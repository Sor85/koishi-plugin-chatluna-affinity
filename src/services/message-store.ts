import type { Context, Session } from 'koishi'
import type { LogFn } from '../types'

export interface StoredMessage {
  messageId: string
  userId: string
  username: string
  content: string
  timestamp: number
}

export interface MessageStoreManager {
  record: (session: Session) => void
  getMessages: (session: Session, count?: number) => StoredMessage[]
  findByLastN: (session: Session, lastN: number, userId?: string) => StoredMessage | null
  findByContent: (session: Session, keyword: string, userId?: string) => StoredMessage | null
}

export function createMessageStore(ctx: Context, log: LogFn, limit = 100): MessageStoreManager {
  // 按会话分组存储消息：key = platform:selfId:guildId:channelId
  const cache = new Map<string, StoredMessage[]>()

  function makeKey(session: Session | null | undefined): string {
    if (!session) return 'unknown'
    const platform = session.platform || 'unknown'
    const selfId = session.selfId || 'self'
    const guildId = (session as unknown as { guildId?: string })?.guildId || ''
    const channelId = session.channelId || (session as unknown as { roomId?: string })?.roomId || ''
    if (guildId) {
      return `${platform}:${selfId}:${guildId}:${channelId || guildId}`
    }
    return `${platform}:${selfId}:direct:${channelId || session.userId || 'unknown'}`
  }

  function extractMessageId(session: Session): string {
    // 尝试从多个可能的位置获取消息 ID
    const candidates = [
      session.messageId,
      (session as unknown as { id?: string })?.id,
      (session as unknown as { event?: { message?: { id?: string } } })?.event?.message?.id,
      (session as unknown as { message?: { id?: string } })?.message?.id
    ]
    for (const id of candidates) {
      if (typeof id === 'string' && id.trim()) return id.trim()
      if (typeof id === 'number') return String(id)
    }
    return ''
  }

  function extractUsername(session: Session): string {
    const candidates = [
      session.username,
      (session as unknown as { author?: { name?: string; nickname?: string } })?.author?.name,
      (session as unknown as { author?: { name?: string; nickname?: string } })?.author?.nickname,
      (session as unknown as { event?: { user?: { name?: string } } })?.event?.user?.name,
      (session as unknown as { user?: { name?: string } })?.user?.name,
      session.userId
    ]
    for (const name of candidates) {
      if (typeof name === 'string' && name.trim()) return name.trim()
    }
    return '未知用户'
  }

  function record(session: Session): void {
    if (!session?.platform) return

    const messageId = extractMessageId(session)
    if (!messageId) {
      // 没有消息 ID 则不记录
      return
    }

    const userId = session.userId || ''
    if (!userId) return

    const key = makeKey(session)
    const list = cache.get(key) || []

    const entry: StoredMessage = {
      messageId,
      userId,
      username: extractUsername(session),
      content: typeof session.content === 'string' ? session.content.slice(0, 200) : '', // 只存储前200字符
      timestamp: new Date(session.timestamp ?? Date.now()).getTime()
    }

    list.push(entry)

    // 超过限制则移除旧消息
    if (list.length > limit) {
      list.splice(0, list.length - limit)
    }

    cache.set(key, list)
    log('debug', '已记录消息', { messageId, userId, key })
  }

  function getMessages(session: Session, count = 50): StoredMessage[] {
    const key = makeKey(session)
    const list = cache.get(key) || []
    return list.slice(-count)
  }

  function findByLastN(session: Session, lastN: number, userId?: string): StoredMessage | null {
    const key = makeKey(session)
    const list = cache.get(key) || []
    if (!list.length) return null

    // 从最新到最旧遍历
    let count = 0
    for (let i = list.length - 1; i >= 0; i--) {
      const msg = list[i]
      // 如果指定了 userId，则只匹配该用户的消息
      if (userId && msg.userId !== userId) continue
      count++
      if (count === lastN) {
        return msg
      }
    }
    return null
  }

  function findByContent(session: Session, keyword: string, userId?: string): StoredMessage | null {
    const key = makeKey(session)
    const list = cache.get(key) || []
    if (!list.length || !keyword) return null

    const lowerKeyword = keyword.toLowerCase()

    // 从最新到最旧遍历，找到第一个匹配的
    for (let i = list.length - 1; i >= 0; i--) {
      const msg = list[i]
      // 如果指定了 userId，则只匹配该用户的消息
      if (userId && msg.userId !== userId) continue
      if (msg.content.toLowerCase().includes(lowerKeyword)) {
        return msg
      }
    }
    return null
  }

  // 监听消息事件
  ctx.on('message', record)

  return { record, getMessages, findByLastN, findByContent }
}
