import type { Context } from 'koishi'

interface RankItem {
  rank: number
  name: string
  relation: string
  affinity: number
  avatarUrl?: string
}

interface Puppeteer {
  page: () => Promise<Page>
}

interface Page {
  setViewport: (options: { width: number; height: number; deviceScaleFactor?: number }) => Promise<void>
  setContent: (html: string, options: { waitUntil: string }) => Promise<void>
  $: (selector: string) => Promise<Element | null>
  close: () => Promise<void>
}

interface Element {
  screenshot: (options: { omitBackground: boolean }) => Promise<Buffer>
}

export function createRenderRankList(ctx: Context) {
  return async function renderRankList(
    title: string,
    items: RankItem[]
  ): Promise<Buffer | null> {
    const puppeteer = (ctx as unknown as { puppeteer?: Puppeteer }).puppeteer
    if (!puppeteer?.page) return null

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap');
    
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: "Noto Sans SC", "Segoe UI", "Microsoft YaHei", sans-serif;
      background: #f0f2f5;
      color: #1f2937;
    }

    .container {
      padding: 32px;
      width: 600px;
      background: #f0f2f5;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .header {
      margin-bottom: 8px;
      padding: 0 8px;
    }

    h1 {
      font-size: 24px;
      margin: 0;
      font-weight: 700;
      color: #111827;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .card {
      background: #ffffff;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .rank-num {
      font-size: 20px;
      font-weight: 700;
      color: #9ca3af;
      width: 32px;
      text-align: center;
      font-feature-settings: "tnum";
    }

    .rank-top-1 { color: #fbbf24; font-size: 24px; }
    .rank-top-2 { color: #9ca3af; font-size: 22px; }
    .rank-top-3 { color: #b45309; font-size: 22px; }

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #e5e7eb;
    }

    .info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .name-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .name {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }

    .relation-badge {
      font-size: 12px;
      padding: 2px 8px;
      background: #e0e7ff;
      color: #4f46e5;
      border-radius: 999px;
      font-weight: 500;
    }

    .affinity-container {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: center;
    }

    .affinity-value {
      font-size: 18px;
      font-weight: 700;
      color: #ec4899;
      font-feature-settings: "tnum";
    }

    .affinity-label {
      font-size: 12px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container" id="list-root">
    <div class="header">
      <h1>${title}</h1>
    </div>
    ${items
      .map(
        (item, index) => `
    <div class="card">
      <div class="rank-num rank-top-${item.rank}">${item.rank}</div>
      ${
        item.avatarUrl
          ? `<img class="avatar" src="${item.avatarUrl}" onerror="this.style.display='none'" />`
          : '<div class="avatar" style="background: #e5e7eb"></div>'
      }
      <div class="info">
        <div class="name-row">
          <span class="name">${item.name}</span>
          ${item.relation && item.relation !== '——' ? `<span class="relation-badge">${item.relation}</span>` : ''}
        </div>
      </div>
      <div class="affinity-container">
        <div class="affinity-value">${item.affinity}</div>
        <div class="affinity-label">好感度</div>
      </div>
    </div>
    `
      )
      .join('')}
  </div>
</body>
</html>`

    let page: Page | undefined
    try {
      page = await puppeteer.page()
      // Height calculation: padding top/bottom (32*2) + header (40) + gap (16 * (n-1)) + card height (80 * n)
      // Rough estimate, safer to set viewport height dynamically or large enough, then screenshot the element
      await page.setViewport({ width: 600, height: 100 + items.length * 120, deviceScaleFactor: 2 })
      await page.setContent(html, { waitUntil: 'networkidle0' })
      const element = await page.$('#list-root')
      if (!element) return null
      const buffer = await element.screenshot({ omitBackground: false })
      return buffer
    } catch (error) {
      const logger = ctx.logger as { warn?: (msg: string, err: unknown) => void } | undefined
      logger?.warn?.('排行榜图片渲染失败', error)
      return null
    } finally {
      try {
        await page?.close()
      } catch {
        // ignore
      }
    }
  }
}
