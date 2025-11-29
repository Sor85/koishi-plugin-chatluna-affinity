import type { Context, Session } from 'koishi'
import type { Config, LogFn } from '../types'

export interface HistoryEntry {
  userId: string
  username: string
  content: string
  timestamp: number
}

interface NormalizedMessage {
  userId?: string
  username?: string
  content?: string
  timestamp?: number | Date
  user?: { name?: string }
  author?: { name?: string }
  sender?: { name?: string }
}

export function createHistoryManager(ctx: Context, config: Config, log: LogFn) {
  const cache = new Map<string, HistoryEntry[]>()
  const limit = Math.max((config.historyMessageCount || 0) * 6, 60)

  const formatHistoryTimestamp = (value: number): string => {
    const date = new Date(value)
    if (Number.isNaN(date?.getTime())) return '未知时间'
    const pad = (num: number) => String(num).padStart(2, '0')
    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1)
    const day = pad(date.getDate())
    const hour = pad(date.getHours())
    const minute = pad(date.getMinutes())
    const second = pad(date.getSeconds())
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  }

  function makeKey(session: Session | null | undefined): string {
    if (!session) return 'unknown'
    if (session.guildId) {
      return `${session.platform || 'unknown'}:${session.selfId || 'self'}:${session.guildId}:${session.channelId || session.guildId}`
    }
    return `${session.platform || 'unknown'}:${session.selfId || 'self'}:direct:${session.channelId || session.userId || 'unknown'}`
  }

  function normalizeEntriesList(entries: NormalizedMessage[], size: number): HistoryEntry[] {
    if (!Array.isArray(entries) || !entries.length) return []
    return entries
      .slice(-size)
      .map((item) => ({
        userId: item.userId || '',
        username: item.username || item.user?.name || item.author?.name || item.sender?.name || item.userId || '未知用户',
        content: typeof item.content === 'string' && item.content.trim() ? item.content.trim() : '[无文本内容]',
        timestamp: new Date(item.timestamp ?? Date.now()).getTime()
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
  }

  function normalizeEntries(entries: NormalizedMessage[], size: number): string[] {
    return normalizeEntriesList(entries, size).map((item) => {
      const name = item.username || item.userId || '未知用户'
      const idText = item.userId ? `（${item.userId}）` : ''
      const timeText = formatHistoryTimestamp(item.timestamp)
      return `[${timeText}] ${name}${idText}: ${item.content}`
    })
  }

  function record(session: Session): void {
    if (!session?.platform) return

    // 只记录真实用户的消息，过滤掉 bot 发送的消息
    if (session.selfId && session.userId === session.selfId) return
    if (!session.userId) return

    const key = makeKey(session)
    const list = cache.get(key) || []
    list.push({
      userId: session.userId,
      username: session.username || (session as unknown as { author?: { name?: string } }).author?.name || (session as unknown as { event?: { user?: { name?: string } } }).event?.user?.name || (session as unknown as { user?: { name?: string } }).user?.name || session.userId,
      content: session.content ?? '',
      timestamp: new Date(session.timestamp ?? Date.now()).getTime()
    })
    if (list.length > limit) list.splice(0, list.length - limit)
    cache.set(key, list)
  }

  async function readEntries(session: Session, count: number): Promise<HistoryEntry[]> {
    const cached = cache.get(makeKey(session))
    if (cached?.length) return cached.slice(-count)

    const db = ctx.database as { tables?: Record<string, unknown>; get?: Function }
    if (!db?.tables?.message || !db.get) return []

    try {
      const rows = await db.get(
        'message',
        { platform: session.platform, channelId: session.channelId },
        { limit: count, sort: { time: 'desc' } }
      )
      return normalizeEntriesList(rows as NormalizedMessage[], count)
    } catch (error) {
      log('warn', '获取历史消息失败', error)
      return []
    }
  }

  async function fetch(session: Session): Promise<string[]> {
    const count = config.historyMessageCount || 0
    if (count <= 0) return []
    const entries = await readEntries(session, count)
    return entries.map((item) => {
      const name = item.username || item.userId || '未知用户'
      const idText = item.userId ? `（${item.userId}）` : ''
      const timeText = formatHistoryTimestamp(item.timestamp)
      return `[${timeText}] ${name}${idText}: ${item.content}`
    })
  }

  async function fetchEntries(session: Session, count: number): Promise<HistoryEntry[]> {
    if (count <= 0) return []
    const entries = await readEntries(session, count)
    return entries.map((item) => ({ ...item }))
  }

  ctx.on('message', record)

  return { fetch, fetchEntries }
}
