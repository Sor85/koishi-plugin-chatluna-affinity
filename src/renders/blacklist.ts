import type { Context } from 'koishi'
import { COMMON_STYLE, Puppeteer, Page } from './utils'

interface BlacklistItem {
  index: number
  nickname: string
  userId: string
  timeInfo: string // "2023-01-01" or "12h (expires ...)"
  note: string
  avatarUrl?: string
  isTemp?: boolean
  penalty?: number
}

export function createRenderBlacklist(ctx: Context) {
  return async function renderBlacklist(
    title: string,
    items: BlacklistItem[]
  ): Promise<Buffer | null> {
    const puppeteer = (ctx as unknown as { puppeteer?: Puppeteer }).puppeteer
    if (!puppeteer?.page) return null

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <style>
    ${COMMON_STYLE}
    .note {
      font-size: 13px;
      color: #6b7280;
      margin-top: 4px;
      /* 移除灰框样式 */
    }
  </style>
</head>
<body>
  <div class="container" id="list-root">
    <div class="header">
      <h1>${title}</h1>
    </div>
    ${items.map(item => `
    <div class="card">
      <div class="rank-num" style="font-size: 16px; color: #9ca3af; width: 24px;">${item.index}</div>
      ${item.avatarUrl 
        ? `<img class="avatar" src="${item.avatarUrl}" onerror="this.style.display='none'" />`
        : `<div class="avatar-placeholder">${item.nickname.charAt(0)}</div>`
      }
      <div class="info">
        <div class="name-row">
          <span class="name">${item.nickname}</span>
        </div>
        <div class="sub-text">${item.userId}</div>
        ${item.note && item.note !== '——' ? `<div class="note">备注: ${item.note}</div>` : ''}
      </div>
      <div class="value-container">
        <div class="value-secondary">${item.timeInfo}</div>
        ${item.isTemp && item.penalty ? `<div class="badge badge-red" style="margin-top: 4px;">扣除 ${item.penalty} 好感</div>` : ''}
      </div>
    </div>
    `).join('')}
  </div>
</body>
</html>`

    let page: Page | undefined
    try {
      page = await puppeteer.page()
      await page.setViewport({ width: 600, height: 100 + items.length * 120, deviceScaleFactor: 2 })
      await page.setContent(html, { waitUntil: 'networkidle0' })
      const element = await page.$('#list-root')
      if (!element) return null
      const buffer = await element.screenshot({ omitBackground: false })
      return buffer
    } catch (error) {
      const logger = ctx.logger as { warn?: (msg: string, err: unknown) => void } | undefined
      logger?.warn?.('黑名单图片渲染失败', error)
      return null
    } finally {
      try {
        await page?.close()
      } catch { }
    }
  }
}
