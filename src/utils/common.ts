export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))
export const clampFloat = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))
export const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

export const stripAtPrefix = (text: string | unknown): string => {
  const value = String(text ?? '').trim()
  if (!value) return ''
  const mentionMatch = value.match(/^<@!?(.+)>$/)
  if (mentionMatch) return mentionMatch[1]
  const decoded = value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
  const atTagMatch = decoded.match(/<at\s+[^>]*(?:id|qq)\s*=\s*["']?([^"'\s>]+)["']?[^>]*>/i)
  if (atTagMatch) return atTagMatch[1]
  return value.replace(/^[@＠]+/, '').trim() || decoded
}

export const sanitizeChannel = (value: unknown): string => String(value ?? '').trim()

export const pad = (n: number): string => String(n).padStart(2, '0')

export const formatTimestamp = (value: unknown): string => {
  if (!value) return ''
  const ts = value instanceof Date ? value.getTime() : typeof value === 'number' ? value : parseInt(String(value), 10)
  if (!Number.isFinite(ts)) return ''
  const date = new Date(ts < 1e11 ? ts * 1000 : ts)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
}

export const formatBeijingTimestamp = (date: Date): string => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
}

export const formatDateOnly = (value: unknown): string => {
  if (!value) return ''
  const ts = typeof value === 'number' ? value : parseInt(String(value), 10)
  if (!Number.isFinite(ts)) return ''
  const date = new Date(ts < 1e11 ? ts * 1000 : ts)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  return `${year}-${month}-${day}`
}

export const formatDateTime = (value: unknown): string => {
  if (!value) return ''
  const ts = typeof value === 'number' ? value : parseInt(String(value), 10)
  if (!Number.isFinite(ts)) return ''
  const date = new Date(ts < 1e11 ? ts * 1000 : ts)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hour = pad(date.getHours())
  const minute = pad(date.getMinutes())
  return `${year}-${month}-${day} ${hour}:${minute}`
}

export const normalizeTimestamp = (value: unknown): number | null => {
  if (!value) return null
  const ts = typeof value === 'number' ? value : parseInt(String(value), 10)
  if (!Number.isFinite(ts)) return null
  return ts < 1e11 ? ts * 1000 : ts
}

export function pickFirst<T>(...values: (T | undefined | null)[]): T | undefined {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') return value
  }
  return undefined
}

export const toDate = (value: unknown): Date | null => {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value as string | number)
  return Number.isNaN(date?.valueOf()) ? null : date
}

export const MAGIC_NUMBERS = {
  ANALYSIS_TIMEOUT: 30000,
  BOT_REPLY_DELAY: 3000,
  SCHEDULE_RETRY_DELAY: 2000,
  SCHEDULE_CHECK_INTERVAL: 60000,
  HISTORY_LIMIT_MULTIPLIER: 6,
  MIN_HISTORY_LIMIT: 60,
  RANK_FETCH_MULTIPLIER: 5,
  RANK_FETCH_OFFSET: 20,
  MAX_RANK_FETCH: 200,
  VIEWPORT_WIDTH: 800,
  VIEWPORT_BASE_HEIGHT: 220,
  VIEWPORT_ROW_HEIGHT: 48
}

export const constants = {
  DEFAULT_MIN: 0,
  DEFAULT_MAX: 100,
  DEFAULT_INITIAL_MIN: 20,
  DEFAULT_INITIAL_MAX: 40
}
