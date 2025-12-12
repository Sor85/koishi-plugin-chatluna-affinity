/**
 * 日程渲染器
 * 渲染每日日程图片
 */

import type { Context } from 'koishi'
import type { LogFn, ScheduleEntry, OutfitEntry } from '../types'
import { renderHtml } from './base'
import { COMMON_STYLE } from './styles'

export interface ScheduleRenderData {
    title: string
    description: string
    entries: ScheduleEntry[]
    outfits?: OutfitEntry[]
    date: string
}

const SCHEDULE_STYLE = `
    ${COMMON_STYLE}
    .time-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding-right: 16px;
      border-right: 2px solid #f3f4f6;
      margin-right: 16px;
      min-width: 100px;
    }
    .time-start {
      font-size: 18px;
      font-weight: 700;
      color: #4f46e5;
    }
    .time-end {
      font-size: 14px;
      color: #9ca3af;
    }
    .summary {
      font-size: 16px;
      color: #374151;
      line-height: 1.5;
    }
    .description {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 16px;
      padding: 0 8px;
    }
    .outfit-card {
      background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
      border: 2px dashed #ec4899;
      border-radius: 12px;
      padding: 12px 16px;
      margin: 8px 0 16px 0;
    }
    .outfit-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .outfit-icon {
      font-size: 20px;
    }
    .outfit-time {
      font-size: 14px;
      font-weight: 600;
      color: #db2777;
    }
    .outfit-label {
      font-size: 13px;
      color: #be185d;
      background: #fbcfe8;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .outfit-desc {
      font-size: 14px;
      color: #831843;
      line-height: 1.6;
    }
`

interface TimelineItem {
    type: 'entry' | 'outfit'
    startMinutes: number
    entry?: ScheduleEntry
    outfit?: OutfitEntry
}

function buildTimeline(entries: ScheduleEntry[], outfits?: OutfitEntry[]): TimelineItem[] {
    const items: TimelineItem[] = []

    for (const entry of entries) {
        items.push({ type: 'entry', startMinutes: entry.startMinutes, entry })
    }

    if (outfits?.length) {
        for (const outfit of outfits) {
            items.push({ type: 'outfit', startMinutes: outfit.startMinutes, outfit })
        }
    }

    items.sort((a, b) => {
        if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes
        return a.type === 'outfit' ? -1 : 1
    })

    return items
}

function renderTimelineItem(item: TimelineItem): string {
    if (item.type === 'outfit' && item.outfit) {
        return `
    <div class="outfit-card">
      <div class="outfit-header">
        <span class="outfit-icon">👗</span>
        <span class="outfit-time">${item.outfit.start}</span>
        <span class="outfit-label">换装</span>
      </div>
      <div class="outfit-desc">${item.outfit.description}</div>
    </div>`
    }

    if (item.type === 'entry' && item.entry) {
        return `
    <div class="card">
      <div class="time-col">
        <div class="time-start">${item.entry.start}</div>
        <div class="time-end">${item.entry.end}</div>
      </div>
      <div class="info">
        <div class="summary">${item.entry.summary}</div>
      </div>
    </div>`
    }

    return ''
}

function buildScheduleHtml(data: ScheduleRenderData): string {
    const timeline = buildTimeline(data.entries, data.outfits)

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <style>${SCHEDULE_STYLE}</style>
</head>
<body>
  <div class="container" id="schedule-root">
    <div class="header">
      <h1>${data.title}</h1>
      <h2>${data.date}</h2>
    </div>
    ${data.description ? `<div class="description">${data.description}</div>` : ''}
    ${timeline.map(renderTimelineItem).join('')}
  </div>
</body>
</html>`
}

export function createScheduleRenderer(ctx: Context, log?: LogFn) {
    return async function renderSchedule(data: ScheduleRenderData): Promise<Buffer | null> {
        const html = buildScheduleHtml(data)
        return renderHtml(
            ctx,
            html,
            {
                width: 600,
                height: 150 + data.entries.length * 100 + (data.outfits?.length || 0) * 90,
                selector: '#schedule-root'
            },
            log
        )
    }
}

export type ScheduleRenderer = ReturnType<typeof createScheduleRenderer>
