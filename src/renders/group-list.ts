/**
 * 群列表渲染器
 * 渲染群聊列表图片
 */

import type { Context } from 'koishi'
import type { LogFn } from '../types'
import { renderHtml } from './base'
import { COMMON_STYLE } from './styles'

export interface GroupItem {
    groupId: string
    groupName: string
    memberCount?: number
    createTime?: string
}

const GROUP_LIST_STYLE = `
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
`

function buildGroupListHtml(title: string, groups: GroupItem[]): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <style>${GROUP_LIST_STYLE}</style>
</head>
<body>
  <div class="container" id="list-root">
    <div class="header">
      <h1>${title}</h1>
    </div>
    ${groups
        .map(
            (group) => `
    <div class="card">
      <div class="group-icon">${group.groupName.charAt(0)}</div>
      <div class="info">
        <div class="name">${group.groupName}</div>
        <div class="sub-text">${group.groupId}</div>
      </div>
      <div class="value-container">
        ${
            group.memberCount !== undefined
                ? `
        <div class="value-secondary">${group.memberCount} <span class="label-small">成员</span></div>
        `
                : ''
        }
        ${
            group.createTime
                ? `
        <div class="label-small">${group.createTime}</div>
        `
                : ''
        }
      </div>
    </div>
    `
        )
        .join('')}
  </div>
</body>
</html>`
}

export function createGroupListRenderer(ctx: Context, log?: LogFn) {
    return async function renderGroupList(
        title: string,
        groups: GroupItem[]
    ): Promise<Buffer | null> {
        const html = buildGroupListHtml(title, groups)
        return renderHtml(
            ctx,
            html,
            {
                width: 600,
                height: 100 + groups.length * 90,
                selector: '#list-root'
            },
            log
        )
    }
}

export type GroupListRenderer = ReturnType<typeof createGroupListRenderer>
