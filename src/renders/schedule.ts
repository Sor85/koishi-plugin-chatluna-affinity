/**
 * 日程渲染器
 * 渲染每日日程图片
 */

import type { Context } from 'koishi'
import type { LogFn, ScheduleEntry } from '../types'
import { renderHtml } from './base'
import { COMMON_STYLE } from './styles'

export interface ScheduleRenderData {
    title: string
    description: string
    entries: ScheduleEntry[]
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
`

function buildScheduleHtml(data: ScheduleRenderData): string {
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
    ${data.entries
        .map(
            (entry) => `
    <div class="card">
      <div class="time-col">
        <div class="time-start">${entry.start}</div>
        <div class="time-end">${entry.end}</div>
      </div>
      <div class="info">
        <div class="summary">${entry.summary}</div>
      </div>
    </div>
    `
        )
        .join('')}
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
                height: 150 + data.entries.length * 100,
                selector: '#schedule-root'
            },
            log
        )
    }
}

export type ScheduleRenderer = ReturnType<typeof createScheduleRenderer>
