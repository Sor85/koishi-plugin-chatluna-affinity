import type { Context } from 'koishi'
import { COMMON_STYLE, Puppeteer, Page } from './utils'

interface ScheduleEntry {
  start: string
  end: string
  summary: string
}

interface ScheduleData {
  title: string
  description: string
  entries: ScheduleEntry[]
  date: string
}

export function createRenderSchedule(ctx: Context) {
  return async function renderSchedule(data: ScheduleData): Promise<Buffer | null> {
    const puppeteer = (ctx as unknown as { puppeteer?: Puppeteer }).puppeteer
    if (!puppeteer?.page) return null

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <style>
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
  </style>
</head>
<body>
  <div class="container" id="schedule-root">
    <div class="header">
      <h1>${data.title}</h1>
      <h2>${data.date}</h2>
    </div>
    ${data.description ? `<div class="description">${data.description}</div>` : ''}
    ${data.entries.map(entry => `
    <div class="card">
      <div class="time-col">
        <div class="time-start">${entry.start}</div>
        <div class="time-end">${entry.end}</div>
      </div>
      <div class="info">
        <div class="summary">${entry.summary}</div>
      </div>
    </div>
    `).join('')}
  </div>
</body>
</html>`

    let page: Page | undefined
    try {
      page = await puppeteer.page()
      await page.setViewport({ width: 600, height: 150 + data.entries.length * 100, deviceScaleFactor: 2 })
      await page.setContent(html, { waitUntil: 'networkidle0' })
      const element = await page.$('#schedule-root')
      if (!element) return null
      const buffer = await element.screenshot({ omitBackground: false })
      return buffer
    } catch (error) {
      const logger = ctx.logger as { warn?: (msg: string, err: unknown) => void } | undefined
      logger?.warn?.('日程图片渲染失败', error)
      return null
    } finally {
      try {
        await page?.close()
      } catch { }
    }
  }
}
