import type { Context } from 'koishi'

interface RenderOptions {
  heading?: string
  subHeading?: string
}

interface Puppeteer {
  page: () => Promise<Page>
}

interface Page {
  setViewport: (options: { width: number; height: number }) => Promise<void>
  setContent: (html: string, options: { waitUntil: string }) => Promise<void>
  $: (selector: string) => Promise<Element | null>
  close: () => Promise<void>
}

interface Element {
  screenshot: (options: { omitBackground: boolean }) => Promise<Buffer>
}

export function createRenderTableImage(ctx: Context) {
  return async function renderTableImage(
    title: string,
    headers: string[],
    rows: string[][],
    options: RenderOptions = {}
  ): Promise<Buffer | null> {
    const puppeteer = (ctx as unknown as { puppeteer?: Puppeteer }).puppeteer
    if (!puppeteer?.page) return null

    const normalizedRows = Array.isArray(rows) ? rows : []
    const heading = options.heading ?? title
    const subHeading = options.subHeading ?? ''
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;600&family=Noto+Color+Emoji&display=swap');
    body {
      margin: 0;
      font-family: "Segoe UI", "Helvetica Neue", "Noto Sans SC", "Noto Color Emoji", "Segoe UI Emoji", "Apple Color Emoji", PingFangSC, "Microsoft Yahei", sans-serif;
      background: #ffffff;
      color: #111111;
    }
    .container {
      padding: 20px 24px;
      max-width: 760px;
    }
    h1 {
      font-size: 18px;
      margin: 0 0 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .sub-heading {
      margin: -8px 0 16px;
      color: #555555;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      min-width: 360px;
      font-size: 14px;
      table-layout: fixed;
    }
    th, td {
      padding: 10px 14px;
      border-bottom: 1px solid #e5e5e5;
      text-align: left;
      vertical-align: top;
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.45;
    }
    .time-col {
      width: 150px;
      white-space: nowrap;
      padding-right: 18px;
      text-align: left;
      font-weight: 600;
    }
    td.time-col {
      font-weight: 500;
    }
    .content-col {
      width: calc(100% - 150px);
    }
    th {
      background: #f5f7fa;
      font-weight: 600;
      white-space: nowrap;
    }
    tr:nth-child(odd) td {
      background: #fbfcfe;
    }
  </style>
</head>
<body>
  <div class="container" id="table-root">
    <h1>${heading}</h1>
    ${subHeading ? `<p class="sub-heading">${subHeading}</p>` : ''}
    <table>
      <thead>
        <tr>${headers.map((header, index) => `<th class="${index === 0 ? 'time-col' : 'content-col'}">${header}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${normalizedRows
          .map((line) => `<tr>${line.map((cell, index) => `<td class="${index === 0 ? 'time-col' : 'content-col'}">${cell}</td>`).join('')}</tr>`)
          .join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`

    let page: Page | undefined
    try {
      page = await puppeteer.page()
      await page.setViewport({ width: 800, height: 220 + normalizedRows.length * 48 })
      await page.setContent(html, { waitUntil: 'networkidle0' })
      const element = await page.$('#table-root')
      if (!element) return null
      const buffer = await element.screenshot({ omitBackground: false })
      return buffer
    } catch (error) {
      const logger = ctx.logger as { warn?: (msg: string, err: unknown) => void } | undefined
      logger?.warn?.('表格图片渲染失败', error)
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
