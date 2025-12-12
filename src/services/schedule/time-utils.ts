/**
 * 日程时间工具
 * 提供时间解析、当前时段查找、日程格式化等功能
 */

import type { Schedule, ScheduleEntry, NormalizedTime } from '../../types'

function pad(n: number): string {
    return String(n).padStart(2, '0')
}

export function normalizeTime(value: string | null | undefined): NormalizedTime | null {
    const text = String(value ?? '').trim()
    if (!text) return null

    const match = text.match(/(\d{1,2})(?::(\d{1,2}))?/)
    if (!match) return null

    let hour = Number(match[1])
    let minute = Number(match[2] ?? '0')

    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null

    if (hour === 24 && minute > 0) hour = 23
    if (hour >= 24) {
        hour = 24
        minute = 0
    }

    hour = Math.max(0, Math.min(24, hour))
    minute = Math.max(0, Math.min(59, minute))

    const minutes = hour * 60 + minute
    return {
        minutes,
        label: `${pad(Math.min(23, hour))}:${pad(minute)}`,
        raw: text
    }
}

export function formatDateForDisplay(
    date: Date,
    timezone: string
): { dateStr: string; weekday: string } {
    try {
        const formatter = new Intl.DateTimeFormat('zh-CN', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            weekday: 'long'
        })
        const parts = formatter.formatToParts(date)
        const year = parts.find((p) => p.type === 'year')?.value || ''
        const month = parts.find((p) => p.type === 'month')?.value || ''
        const day = parts.find((p) => p.type === 'day')?.value || ''
        const weekday = parts.find((p) => p.type === 'weekday')?.value || ''
        return { dateStr: `${year}年${month}月${day}日`, weekday }
    } catch {
        return { dateStr: date.toLocaleDateString('zh-CN'), weekday: '未知' }
    }
}

export function getCurrentMinutes(timezone: string): number {
    try {
        const now = new Date()
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        })
        const parts = formatter.formatToParts(now)
        const hour = Number(parts.find((p) => p.type === 'hour')?.value || 0)
        const minute = Number(parts.find((p) => p.type === 'minute')?.value || 0)
        return hour * 60 + minute
    } catch {
        const now = new Date()
        return now.getHours() * 60 + now.getMinutes()
    }
}

export function getCurrentEntry(schedule: Schedule, timezone: string): ScheduleEntry | null {
    if (!schedule?.entries?.length) return null
    const currentMinutes = getCurrentMinutes(timezone)
    return (
        schedule.entries.find(
            (e) => currentMinutes >= e.startMinutes && currentMinutes < e.endMinutes
        ) || null
    )
}

export function formatScheduleText(schedule: Schedule): string {
    const lines: string[] = []
    lines.push(schedule.title || '📅 今日日程')
    if (schedule.description) lines.push('', schedule.description)

    if (schedule.outfits?.length) {
        lines.push('', '👗 今日穿搭')
        for (const outfit of schedule.outfits) {
            lines.push(`  ${outfit.start}-${outfit.end}：${outfit.description}`)
        }
    }

    lines.push('', '📋 日程安排')
    for (const entry of schedule.entries) {
        const text = `  ⏰ ${entry.start}-${entry.end}  ${entry.summary}`
        lines.push(text)
    }

    return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

export function buildSummary(title: string, detail: string): string {
    const head = title || '日程'
    const body = detail ? detail.trim() : ''
    if (!body) return head
    const joiner = body.startsWith('。') ? '' : '。'
    return `${head}${joiner}${body}`
}

export function derivePersonaTag(persona: string): string {
    const text = String(persona || '').trim()
    if (!text) return '我'

    const lines = text
        .replace(/\r/g, '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

    if (!lines.length) return '我'
    const first = lines[0]
    if (first.length <= 12) return first
    return first.slice(0, 12)
}
