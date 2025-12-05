/**
 * 日程生成器
 * 提供基于 LLM 的日程生成功能
 */

import type { Schedule, ScheduleEntry, ScheduleConfig, LogFn } from '../../types'
import {
    normalizeTime,
    formatDateForDisplay,
    formatScheduleText,
    buildSummary,
    derivePersonaTag
} from './time-utils'

function pad(n: number): string {
    return String(n).padStart(2, '0')
}

export interface ScheduleGeneratorOptions {
    scheduleConfig: ScheduleConfig
    getModel: () => { invoke?: (prompt: string) => Promise<{ content?: unknown }> } | null
    getMessageContent: (content: unknown) => string
    resolvePersonaPreset: () => string
    log: LogFn
}

export function createScheduleGenerator(options: ScheduleGeneratorOptions) {
    const { scheduleConfig, getModel, getMessageContent, resolvePersonaPreset, log } = options
    const timezone = scheduleConfig.timezone || 'Asia/Shanghai'

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

    const normalizeEntries = (
        items: unknown[],
        dateText: string,
        personaTag: string
    ): ScheduleEntry[] | null => {
        if (!Array.isArray(items) || !items.length) return null
        const normalized: ScheduleEntry[] = []

        for (const item of items) {
            const record = item as Record<string, unknown>
            const start = normalizeTime(
                pickField(record, ['start', 'from', 'begin', 'time', 'startTime'])
            )
            const end = normalizeTime(pickField(record, ['end', 'to', 'finish', 'stop', 'endTime']))

            if (
                !start ||
                (!end &&
                    normalized.length &&
                    normalized[normalized.length - 1].endMinutes === start.minutes)
            )
                continue

            const activity =
                pickField(record, ['activity', 'title', 'name', 'label', 'task']) || '日程'
            const detail = pickField(record, ['detail', 'description', 'note', 'summary', 'mood'])
            const endMinutes = end ? end.minutes : Math.min(1440, start.minutes + 90)
            const safeEnd =
                endMinutes <= start.minutes
                    ? Math.min(1440, start.minutes + 60)
                    : Math.min(1440, endMinutes)

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

    const applyPromptTemplate = (
        template: string,
        variables: Record<string, unknown>
    ): string => {
        return template.replace(/\{(\w+)\}/g, (_, key) => {
            const value = variables[key as string]
            return value === undefined || value === null ? '' : String(value)
        })
    }

    const parseResponse = (text: string, personaTag: string): Schedule | null => {
        const match = text.match(/\{[\s\S]*\}/)
        if (!match) return null

        try {
            const data = JSON.parse(match[0]) as {
                title?: string
                description?: string
                entries?: unknown[]
            }
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
            schedule.text = formatScheduleText(schedule)
            return schedule
        } catch (error) {
            log('warn', '解析日程响应失败', error)
            return null
        }
    }

    const generate = async (): Promise<Schedule | null> => {
        const model = getModel()
        if (!model?.invoke) {
            log('warn', '模型尚未就绪，无法生成日程')
            return null
        }

        const now = new Date()
        const { dateStr, weekday } = formatDateForDisplay(now, timezone)
        const personaText = resolvePersonaPreset() || '（暂无额外设定，可按温和友善的年轻人）'
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
            const schedule = parseResponse(typeof text === 'string' ? text : String(text ?? ''), personaTag)

            if (schedule) {
                log('info', '日程已生成', { date: dateStr, entriesCount: schedule.entries.length })
            }

            return schedule
        } catch (error) {
            log('warn', '生成日程失败', error)
            return null
        }
    }

    return {
        generate,
        parseResponse
    }
}

export type ScheduleGenerator = ReturnType<typeof createScheduleGenerator>
