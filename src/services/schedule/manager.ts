/**
 * 日程管理器
 * 整合日程生成、缓存、命令和变量注册
 */

import { z } from 'zod'
import { h } from 'koishi'
import { StructuredTool } from '@langchain/core/tools'
import type { Context, Session } from 'koishi'
import type { Config, Schedule, ScheduleEntry, OutfitEntry, ChatLunaPlugin, LogFn, ScheduleConfig, ScheduleManager } from '../../types'
import { createScheduleCache } from './cache'
import { createScheduleGenerator } from './generator'
import { formatDateForDisplay, getCurrentMinutes } from './time-utils'

export interface ScheduleManagerDeps {
    getModel: () => { invoke?: (prompt: string) => Promise<{ content?: unknown }> } | null
    getMessageContent: (content: unknown) => string
    resolvePersonaPreset: (session?: Session) => string
    getWeatherText: () => Promise<string>
    renderSchedule: (data: { title: string; description: string; entries: ScheduleEntry[]; outfits?: OutfitEntry[]; date: string }) => Promise<Buffer | null>
    log: LogFn
}

export function createScheduleManager(
    ctx: Context,
    config: Config,
    deps: ScheduleManagerDeps
): ScheduleManager {
    const { getModel, getMessageContent, resolvePersonaPreset, getWeatherText, renderSchedule, log } = deps
    const scheduleConfig: ScheduleConfig = config.schedule || {}
    const enabled = scheduleConfig.enabled !== false
    const timezone = scheduleConfig.timezone || 'Asia/Shanghai'
    const cacheKey = `schedule_${scheduleConfig.variableName || 'default'}`

    const cache = createScheduleCache(cacheKey)
    const generator = createScheduleGenerator({
        scheduleConfig,
        getModel,
        getMessageContent,
        resolvePersonaPreset: () => resolvePersonaPreset(),
        getWeatherText,
        log
    })

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

    const generateSchedule = async (session?: Session): Promise<Schedule | null> => {
        const schedule = await generator.generate()
        if (schedule) {
            const { dateStr } = formatDateForDisplay(new Date(), timezone)
            cache.set(schedule, dateStr)
        }
        return schedule
    }

    const ensureSchedule = async (session?: Session, retryCount = 0): Promise<Schedule | null> => {
        if (!enabled) return null

        const now = new Date()
        const { dateStr } = formatDateForDisplay(now, timezone)

        if (session) lastSessionRef = session

        const cached = cache.get(dateStr)
        if (cached) {
            stopRetryInterval()
            return cached
        }

        if (pendingGeneration) {
            return pendingGeneration
        }

        const maxRetries = 3
        pendingGeneration = (async () => {
            try {
                const result = await generateSchedule(session || lastSessionRef)
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
                return result
            } catch (error) {
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
        if (session) lastSessionRef = session
        return cache.getSchedule()
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
        const current = schedule.entries.find(
            e => currentMinutes >= e.startMinutes && currentMinutes < e.endMinutes
        )

        return current ? current.summary : (schedule.description || '')
    }

    const renderImage = async (schedule: Schedule): Promise<Buffer | null> => {
        if (!schedule || !schedule.entries.length) return null

        try {
            return await renderSchedule({
                title: schedule.title || scheduleConfig.title || '今日日程',
                description: schedule.description || '',
                entries: schedule.entries,
                outfits: schedule.outfits,
                date: schedule.date
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
        const outfitVariableName = scheduleConfig.outfitVariableName || 'outfit'
        const currentOutfitVariableName = scheduleConfig.currentOutfitVariableName || 'currentOutfit'
        const timezone = scheduleConfig.timezone || 'Asia/Shanghai'

        const chatluna = (ctx as unknown as {
            chatluna?: { promptRenderer?: { registerFunctionProvider?: Function } }
        }).chatluna
        if (!chatluna?.promptRenderer?.registerFunctionProvider) return

        chatluna.promptRenderer.registerFunctionProvider(
            variableName,
            async (_args: unknown, _vars: unknown, configurable?: { session?: Session }) => {
                const payload = await getSchedule(configurable?.session)
                return payload?.text || ''
            }
        )

        chatluna.promptRenderer.registerFunctionProvider(
            currentVariableName,
            async (_args: unknown, _vars: unknown, configurable?: { session?: Session }) => {
                const summary = await getCurrentSummary(configurable?.session)
                return summary || ''
            }
        )

        chatluna.promptRenderer.registerFunctionProvider(
            outfitVariableName,
            async (_args: unknown, _vars: unknown, configurable?: { session?: Session }) => {
                const payload = await getSchedule(configurable?.session)
                if (!payload?.outfits?.length) return ''
                return payload.outfits.map((o) => `${o.start}-${o.end}：${o.description}`).join('\n')
            }
        )

        chatluna.promptRenderer.registerFunctionProvider(
            currentOutfitVariableName,
            async (_args: unknown, _vars: unknown, configurable?: { session?: Session }) => {
                const payload = await getSchedule(configurable?.session)
                if (!payload?.outfits?.length) return ''
                const currentMinutes = getCurrentMinutes(timezone)
                const outfit = payload.outfits.find(
                    (o) => currentMinutes >= o.startMinutes && currentMinutes < o.endMinutes
                )
                return outfit?.description || ''
            }
        )
    }

    const registerTool = (plugin: ChatLunaPlugin): void => {
        if (!enabled || scheduleConfig.registerTool === false) return

        const toolName = scheduleConfig.toolName || 'daily_schedule'

        plugin.registerTool(toolName, {
            selector: () => true,
            createTool: () => {
                // @ts-ignore - Type instantiation depth issue with zod + StructuredTool
                return new (class extends StructuredTool {
                    name = toolName
                    description = "Returns today's full schedule as plain text."
                    schema = z.object({})
                    async _call(
                        _input: Record<string, never>,
                        _manager?: unknown,
                        runnable?: unknown
                    ) {
                        const session = (
                            runnable as { configurable?: { session?: Session } }
                        )?.configurable?.session
                        const payload = await getSchedule(session)
                        if (!payload)
                            return enabled ? '今日暂未生成日程。' : '当前未启用日程功能。'
                        return payload.text
                    }
                })()
            }
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
                log('info', '收到日程刷新请求，开始重新生成日程...')
                const regenerated = await regenerateSchedule(session as Session | undefined)
                if (regenerated) {
                    return '已重新生成今日日程。'
                }
                log('warn', '日程刷新失败，将启动重试机制')
                startRetryInterval()
                return '重新生成失败，将继续每10分钟尝试一次。'
            })
    }

    const startRetryInterval = (): void => {
        if (retryIntervalHandle) return
        retryIntervalHandle = ctx.setInterval(async () => {
            const now = new Date()
            const { dateStr } = formatDateForDisplay(now, timezone)
            if (cache.get(dateStr)) {
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

        if (cache.get(dateStr)) {
            log('debug', '从缓存恢复今日日程', { date: dateStr })
        } else {
            const startDelay = scheduleConfig.startDelay ?? 3000
            log('debug', `日程生成将在 ${startDelay}ms 后启动`)
            ctx.setTimeout(() => {
                ensureSchedule()
                    .then(result => {
                        if (!result) {
                            log('warn', '日程初始化失败，将每10分钟重试一次')
                            startRetryInterval()
                        }
                    })
                    .catch(error => {
                        log('warn', '初始化日程失败', error)
                        startRetryInterval()
                    })
            }, startDelay)
        }

        const dispose = ctx.setInterval(async () => {
            try {
                const result = await ensureSchedule()
                if (!result && !retryIntervalHandle) {
                    const checkNow = new Date()
                    const { dateStr: checkDate } = formatDateForDisplay(checkNow, timezone)
                    if (cache.getCachedDate() !== checkDate) {
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
        cache.invalidate()
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
