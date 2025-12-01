import type { Context } from 'koishi'
import { COMMON_STYLE, Puppeteer, Page } from './utils'

interface GroupItem {
  groupId: string
  groupName: string
  memberCount?: number
  createTime?: string
}

export function createRenderGroupList(ctx: Context) {
  return async function renderGroupList(
    title: string,
    groups: GroupItem[]
  ): Promise<Buffer | null> {
    const puppeteer = (ctx as unknown as { puppeteer?: Puppeteer }).puppeteer
    if (!puppeteer?.page) return null

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <style>
    ${COMMON_STYLE}
    .group-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 20px;
      font-weight: 700;
      flex-shrink: 0;
    }
  </style>
</head>
<body>
  <div class="container" id="list-root">
    <div class="header">
      <h1>${title}</h1>
    </div>
    ${groups.map(group => `
    <div class="card">
      <div class="group-icon">${group.groupName.charAt(0)}</div>
      <div class="info">
        <div class="name">${group.groupName}</div>
        <div class="sub-text">${group.groupId}</div>
      </div>
      <div class="value-container">
        ${group.memberCount !== undefined ? `
        <div class="value-secondary">${group.memberCount} <span class="label-small">成员</span></div>
        ` : ''}
        ${group.createTime ? `
        <div class="label-small">${group.createTime}</div>
        ` : ''}
      </div>
    </div>
    `).join('')}
  </div>
</body>
</html>`

    let page: Page | undefined
    try {
      page = await puppeteer.page()
      await page.setViewport({ width: 600, height: 100 + groups.length * 90, deviceScaleFactor: 2 })
      await page.setContent(html, { waitUntil: 'networkidle0' })
      const element = await page.$('#list-root')
      if (!element) return null
      const buffer = await element.screenshot({ omitBackground: false })
      return buffer
    } catch (error) {
      const logger = ctx.logger as { warn?: (msg: string, err: unknown) => void } | undefined
      logger?.warn?.('群聊列表图片渲染失败', error)
      return null
    } finally {
      try {
        await page?.close()
      } catch { }
    }
  }
}
