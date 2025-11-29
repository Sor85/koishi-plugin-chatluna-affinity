import { z } from 'zod'
import { h } from 'koishi'
import { StructuredTool } from '@langchain/core/tools'
import type { Context, Session } from 'koishi'
import type { Config, Schedule, ScheduleEntry, ScheduleManager, ChatLunaPlugin, LogFn } from '../types'
import { pad } from '../utils/common'

interface RenderOptions {
  heading?: string
  subHeading?: string
}

interface ScheduleManagerDeps {
  getModel: () => unknown
  getMessageContent: (content: unknown) => string
  resolvePersonaPreset: (session?: Session) => string
  renderTableImage: (title: string, headers: string[], rows: string[][], options?: RenderOptions) => Promise<Buffer | null>
  log: LogFn
}

interface NormalizedTime {
  minutes: number
  label: string
  raw: string
}

function normalizeTime(value: string | null | undefined): NormalizedTime | null {
  const text = String(value ?? '').trim()
  if (!text) return null
  const match = text.match(/(\d{1,2})(?::(\d{1,2}))?/)
  if (!match) return null
  let hour = Number(match[1])
  let minute = Number(match[2] ?? '0')
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null
  if (hour === 24 && minute > 0) hour = 23
  if (hour >= 24) { hour = 24; minute = 0 }
  hour = Math.max(0, Math.min(24, hour))
  minute = Math.max(0, Math.min(59, minute))
  const minutes = hour * 60 + minute
  return { minutes, label: `${pad(Math.min(23, hour))}:${pad(minute)}`, raw: text }
}

function formatDateForDisplay(date: Date, timezone: string): { dateStr: string; weekday: string } {
  try {
    const formatter = new Intl.DateTimeFormat('zh-CN', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long' })
    const parts = formatter.formatToParts(date)
    const year = parts.find(p => p.type === 'year')?.value || ''
    const month = parts.find(p => p.type === 'month')?.value || ''
    const day = parts.find(p => p.type === 'day')?.value || ''
    const weekday = parts.find(p => p.type === 'weekday')?.value || ''
    return { dateStr: `${year}年${month}月${day}日`, weekday }
  } catch {
    return { dateStr: date.toLocaleDateString('zh-CN'), weekday: '未知' }
  }
}

function getCurrentMinutes(timezone: string): number {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false })
    const parts = formatter.formatToParts(now)
    const hour = Number(parts.find(p => p.type === 'hour')?.value || 0)
    const minute = Number(parts.find(p => p.type === 'minute')?.value || 0)
    return hour * 60 + minute
  } catch {
    const now = new Date()
    return now.getHours() * 60 + now.getMinutes()
  }
}

// 使用全局缓存来避免插件重载时重新生成日程
const globalScheduleCache = new Map<string, { schedule: Schedule; date: string }>()

export function createScheduleManager(ctx: Context, config: Config, deps: ScheduleManagerDeps): ScheduleManager {
  const { getModel, getMessageContent, resolvePersonaPreset, renderTableImage, log } = deps
  const scheduleConfig = config.schedule || {}
  const enabled = scheduleConfig.enabled !== false
  const timezone = scheduleConfig.timezone || 'Asia/Shanghai'
  const cacheKey = `schedule_${config.schedule?.variableName || 'default'}`

  // 尝试从全局缓存恢复
  const cached = globalScheduleCache.get(cacheKey)
  let cachedSchedule: Schedule | null = cached?.schedule || null
  let cachedDate: string | null = cached?.date || null
  let pendingGeneration: Promise<Schedule | null> | null = null
  let lastSessionRef: Session | undefined
  let intervalHandle: (() => void) | null = null
  let retryIntervalHandle: (() => void) | null = null

  const stopRetryInterval = (): void => {
    if (retryIntervalHandle) {
      retryIntervalHandle()
      retryIntervalHandle = null
    }
  }

  const invalidateScheduleCache = (): void => {
    cachedSchedule = null
    cachedDate = null
    globalScheduleCache.delete(cacheKey)
  }

  const pickField = (source: Record<string, unknown>, fields: string[]): string => {
    for (const key of fields) {
      if (!source || !(key in source)) continue
      const value = source[key]
      if (value === undefined || value === null) continue
      const text = String(value).trim()
      if (text) return text
    }
    return ''
  }

  const buildSummary = (title: string, detail: string): string => {
    const head = title || '日程'
    const body = detail ? detail.trim() : ''
    if (!body) return head
    const joiner = body.startsWith('。') ? '' : '。'
    return `${head}${joiner}${body}`
  }

  const derivePersonaTag = (persona: string): string => {
    const text = String(persona || '').trim()
    if (!text) return '我'
    const lines = text.replace(/\r/g, '').split('\n').map((line) => line.trim()).filter(Boolean)
    if (!lines.length) return '我'
    const first = lines[0]
    if (first.length <= 12) return first
    return first.slice(0, 12)
  }

  const normalizeEntries = (items: unknown[], dateText: string, personaTag: string): ScheduleEntry[] | null => {
    if (!Array.isArray(items) || !items.length) return null
    const normalized: ScheduleEntry[] = []
    for (const item of items) {
      const record = item as Record<string, unknown>
      const start = normalizeTime(pickField(record, ['start', 'from', 'begin', 'time', 'startTime']))
      const end = normalizeTime(pickField(record, ['end', 'to', 'finish', 'stop', 'endTime']))
      if (!start || (!end && normalized.length && normalized[normalized.length - 1].endMinutes === start.minutes)) continue
      const activity = pickField(record, ['activity', 'title', 'name', 'label', 'task']) || '日程'
      const detail = pickField(record, ['detail', 'description', 'note', 'summary', 'mood'])
      const endMinutes = end ? end.minutes : Math.min(1440, start.minutes + 90)
      const safeEnd = endMinutes <= start.minutes ? Math.min(1440, start.minutes + 60) : Math.min(1440, endMinutes)
      normalized.push({
        start: start.label,
        end: pad(Math.floor(safeEnd / 60)) + ':' + pad(safeEnd % 60),
        startMinutes: start.minutes,
        endMinutes: safeEnd,
        summary: buildSummary(activity, detail || `${personaTag}保持着角色状态`)
      })
    }
    if (!normalized.length) return null
    normalized.sort((a, b) => a.startMinutes - b.startMinutes)
    return normalized
  }

  const formatLines = (schedule: Schedule): string => {
    const lines: string[] = []
    lines.push(schedule.title || '📅 今日日程')
    if (schedule.description) lines.push('', schedule.description)
    for (const entry of schedule.entries) {
      const text = `  ⏰ ${entry.start}-${entry.end}  ${entry.summary}`
      lines.push('', text)
    }
    return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
  }

  const applyPromptTemplate = (template: string, variables: Record<string, unknown>): string => {
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
      const value = variables[key as string]
      return value === undefined || value === null ? '' : String(value)
    })
  }

  const parseScheduleResponse = (text: string, personaTag: string): Schedule | null => {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null

    try {
      const data = JSON.parse(match[0]) as { title?: string; description?: string; entries?: unknown[] }
      const now = new Date()
      const { dateStr } = formatDateForDisplay(now, timezone)
      const entries = normalizeEntries(data.entries || [], dateStr, personaTag)
      if (!entries) return null

      const schedule: Schedule = {
        source: 'model',
        date: dateStr,
        title: (data.title && String(data.title).trim()) || '📅 今日日程',
        description: typeof data.description === 'string' ? data.description.trim() : '',
        entries,
        text: ''
      }
      schedule.text = formatLines(schedule)
      return schedule
    } catch (error) {
      log('warn', '解析日程响应失败', error)
      return null
    }
  }

  const generateSchedule = async (session?: Session): Promise<Schedule | null> => {
    const model = getModel() as { invoke?: (prompt: string) => Promise<{ content?: unknown }> } | null
    if (!model?.invoke) {
      log('warn', '模型尚未就绪，无法生成日程')
      return null
    }

    const now = new Date()
    const { dateStr, weekday } = formatDateForDisplay(now, timezone)
    const personaText = resolvePersonaPreset(session) || '（暂无额外设定，可按温和友善的年轻人）'
    const personaTag = derivePersonaTag(personaText)

    const prompt = applyPromptTemplate(scheduleConfig.prompt || '', {
      date: dateStr,
      weekday,
      persona: personaText,
      personaPreset: personaText
    })

    try {
      const response = await model.invoke(prompt)
      const text = getMessageContent(response?.content ?? response)
      const schedule = parseScheduleResponse(typeof text === 'string' ? text : String(text ?? ''), personaTag)

      if (schedule) {
        cachedSchedule = schedule
        cachedDate = dateStr
        // 保存到全局缓存，避免插件重载时重新生成
        globalScheduleCache.set(cacheKey, { schedule, date: dateStr })
        log('info', '日程已生成', { date: dateStr, entriesCount: schedule.entries.length })
      }

      return schedule
    } catch (error) {
      log('warn', '生成日程失败', error)
      return null
    }
  }

  const ensureSchedule = async (session?: Session, retryCount = 0): Promise<Schedule | null> => {
    if (!enabled) return null

    const now = new Date()
    const { dateStr } = formatDateForDisplay(now, timezone)

    // 保存 session 引用以便定时器使用
    if (session) lastSessionRef = session

    // 如果缓存有效，直接返回
    if (cachedSchedule && cachedDate === dateStr) {
      stopRetryInterval()
      return cachedSchedule
    }

    // 如果正在生成中，等待完成
    if (pendingGeneration) {
      return pendingGeneration
    }

    const maxRetries = 3
    // 开始生成，并设置锁
    pendingGeneration = (async () => {
      try {
        const result = await generateSchedule(session || lastSessionRef)
        // generateSchedule 返回 null 也视为失败，需要重试
        if (result) {
          stopRetryInterval()
        }
        if (!result && retryCount < maxRetries - 1) {
          log('warn', `日程生成失败，${retryCount + 1}/${maxRetries} 次重试中...`)
          pendingGeneration = null
          await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)))
          return ensureSchedule(session, retryCount + 1)
        }
        if (!result && retryCount >= maxRetries - 1) {
          log('warn', `日程生成失败，已达到最大重试次数 ${maxRetries}`)
        }
        if (result) stopRetryInterval()
        return result
      } catch (error) {
        // 异常也重试
        if (retryCount < maxRetries - 1) {
          log('warn', `日程生成异常，${retryCount + 1}/${maxRetries} 次重试`, error)
          pendingGeneration = null
          await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)))
          return ensureSchedule(session, retryCount + 1)
        }
        log('warn', `日程生成异常，已达到最大重试次数 ${maxRetries}`, error)
        return null
      } finally {
        pendingGeneration = null
      }
    })()

    return pendingGeneration
  }

  const getSchedule = async (session?: Session): Promise<Schedule | null> => {
    if (!enabled) return null

    // 保存 session 引用
    if (session) lastSessionRef = session

    // 仅返回缓存的日程，不触发重新生成
    // 日程生成仅在插件启动和过0点时触发
    return cachedSchedule
  }

  const getScheduleText = async (session?: Session): Promise<string> => {
    const schedule = await getSchedule(session)
    return schedule?.text || ''
  }

  const getCurrentSummary = async (session?: Session): Promise<string> => {
    if (!enabled) return ''
    const schedule = await getSchedule(session)
    if (!schedule || !schedule.entries.length) return ''

    const currentMinutes = getCurrentMinutes(timezone)
    const current = schedule.entries.find(e => currentMinutes >= e.startMinutes && currentMinutes < e.endMinutes)

    if (current) return current.summary
    return schedule.description || ''
  }

  const renderImage = async (schedule: Schedule): Promise<Buffer | null> => {
    if (!schedule || !schedule.entries.length) return null

    const headers = ['时间', '安排']
    const rows = schedule.entries.map(e => [`${e.start}-${e.end}`, e.summary])

    try {
      return await renderTableImage(scheduleConfig.title || '今日日程', headers, rows, {
        heading: schedule.title || '今日日程',
        subHeading: schedule.description || ''
      })
    } catch (error) {
      log('warn', '日程图片渲染失败', error)
      return null
    }
  }

  const registerVariables = (): void => {
    if (!enabled) return

    const variableName = scheduleConfig.variableName || 'schedule'
    const currentVariableName = scheduleConfig.currentVariableName || 'currentSchedule'

    const chatluna = (ctx as unknown as { chatluna?: { promptRenderer?: { registerFunctionProvider?: Function } } }).chatluna
    if (!chatluna?.promptRenderer?.registerFunctionProvider) return

    chatluna.promptRenderer.registerFunctionProvider(variableName, async (_args: unknown, _vars: unknown, configurable?: { session?: Session }) => {
      const payload = await getSchedule(configurable?.session)
      return payload?.text || ''
    })

    chatluna.promptRenderer.registerFunctionProvider(currentVariableName, async (_args: unknown, _vars: unknown, configurable?: { session?: Session }) => {
      const summary = await getCurrentSummary(configurable?.session)
      return summary || ''
    })
  }

  const registerTool = (plugin: ChatLunaPlugin): void => {
    if (!enabled || scheduleConfig.registerTool === false) return

    const toolName = scheduleConfig.toolName || 'daily_schedule'

    plugin.registerTool(toolName, {
      selector: () => true,
      // @ts-expect-error - Type instantiation depth issue with zod + StructuredTool
      createTool: () => new (class extends StructuredTool {
        name = toolName
        description = "Returns today's full schedule as plain text."
        schema = z.object({})
        async _call(_input: Record<string, never>, _manager?: unknown, runnable?: unknown) {
          const session = (runnable as { configurable?: { session?: Session } })?.configurable?.session
          const payload = await getSchedule(session)
          if (!payload) return enabled ? '今日暂未生成日程。' : '当前未启用日程功能。'
          return payload.text
        }
      })()
    })
  }

  const registerCommand = (): void => {
    if (!enabled) return

    ctx.command('affinity.schedule', '查看今日日程', { authority: 2 })
      .alias('今日日程')
      .action(async ({ session }) => {
        const schedule = await getSchedule(session as Session)
        if (!schedule) return '暂无今日日程。'

        if (scheduleConfig.renderAsImage) {
          const buffer = await renderImage(schedule)
          if (buffer) return h.image(buffer, 'image/png')
          return `${schedule.text || '暂无今日日程。'}\n（日程图片渲染失败，已改为文本模式）`
        }

        return schedule.text || '暂无今日日程。'
      })

    ctx.command('affinity.schedule.refresh', '重新生成今日日程', { authority: 4 })
      .alias('刷新日程')
      .alias('重生日程')
      .action(async ({ session }) => {
        const regenerated = await regenerateSchedule(session as Session | undefined)
        if (regenerated) {
          return '已重新生成今日日程。'
        }
        startRetryInterval()
        return '重新生成失败，将继续每10分钟尝试一次。'
      })
  }

  const startRetryInterval = (): void => {
    if (retryIntervalHandle) return
    // 每10分钟重试一次
    retryIntervalHandle = ctx.setInterval(async () => {
      const now = new Date()
      const { dateStr } = formatDateForDisplay(now, timezone)
      // 如果今天已经有缓存，停止重试
      if (cachedSchedule && cachedDate === dateStr) {
        stopRetryInterval()
        return
      }
      log('info', '日程生成重试中...')
      const result = await ensureSchedule()
      if (result) {
        log('info', '日程重试生成成功')
        stopRetryInterval()
      }
    }, 10 * 60 * 1000)
  }

  const start = (): void => {
    if (!enabled) return
    if (intervalHandle) return

    const now = new Date()
    const { dateStr } = formatDateForDisplay(now, timezone)

    // 检查全局缓存是否已有今天的日程（避免插件重载时重新生成）
    if (cachedSchedule && cachedDate === dateStr) {
      log('debug', '从缓存恢复今日日程', { date: dateStr })
    } else {
      // 启动时延迟生成日程，等待其他依赖插件加载完成
      const startDelay = scheduleConfig.startDelay ?? 10000
      log('debug', `日程生成将在 ${startDelay}ms 后启动`)
      ctx.setTimeout(() => {
        ensureSchedule().then((result) => {
          if (!result) {
            // 3次重试都失败后，启动10分钟重试定时器
            log('warn', '日程初始化失败，将每10分钟重试一次')
            startRetryInterval()
          }
        }).catch((error) => {
          log('warn', '初始化日程失败', error)
          startRetryInterval()
        })
      }, startDelay)
    }

    // 每分钟检查是否过了0点，如果过了则重新生成
    const dispose = ctx.setInterval(async () => {
      try {
        const result = await ensureSchedule()
        // 如果过0点生成失败，启动重试
        if (!result && !retryIntervalHandle) {
          const checkNow = new Date()
          const { dateStr: checkDate } = formatDateForDisplay(checkNow, timezone)
          if (cachedDate !== checkDate) {
            startRetryInterval()
          }
        }
      } catch (error) {
        log('warn', '定时刷新日程失败', error)
      }
    }, 60 * 1000)

    intervalHandle = dispose
  }

  const regenerateSchedule = async (session?: Session): Promise<Schedule | null> => {
    invalidateScheduleCache()
    stopRetryInterval()
    return ensureSchedule(session)
  }

  return {
    enabled,
    registerVariables,
    registerTool,
    registerCommand,
    start,
    regenerateSchedule,
    getSchedule,
    getScheduleText,
    getCurrentSummary,
    renderImage
  }
}
