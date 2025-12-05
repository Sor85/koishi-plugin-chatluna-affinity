/**
 * 黑名单列表命令
 * 查看自动黑名单和临时黑名单
 */

import { h } from 'koishi'
import type { Session } from 'koishi'
import type { CommandDependencies, BlacklistEnrichedItem } from './types'
import type { PermanentBlacklistManager } from '../services/blacklist/permanent'
import type { TemporaryBlacklistService } from '../services/blacklist/temporary'

export interface BlacklistCommandDeps extends CommandDependencies {
    permanentBlacklist: PermanentBlacklistManager
    temporaryBlacklist: TemporaryBlacklistService
}

async function enrichBlacklistRecords(
    records: { userId: string; nickname?: string; blockedAt?: string; note?: string }[],
    session: Session,
    deps: BlacklistCommandDeps
): Promise<BlacklistEnrichedItem[]> {
    const { resolveUserIdentity, stripAtPrefix } = deps
    return Promise.all(
        records.map(async (entry) => {
            const sanitizedId = stripAtPrefix(entry?.userId)
            let nickname = stripAtPrefix(entry?.nickname || '')
            let userId = sanitizedId
            if (!nickname || nickname === sanitizedId) {
                const resolved = await resolveUserIdentity(session, sanitizedId)
                if (resolved) {
                    userId = resolved.userId || sanitizedId
                    nickname = resolved.nickname || sanitizedId
                }
            }
            return { ...entry, userId, nickname }
        })
    )
}

export function registerBlacklistCommand(deps: BlacklistCommandDeps) {
    const { ctx, config, renders, permanentBlacklist, resolveGroupId, stripAtPrefix } = deps

    ctx.command(
        'affinity.blacklist [limit:number] [platform:string] [image]',
        '查看自动黑名单列表',
        { authority: 2 }
    )
        .alias('自动黑名单')
        .action(async ({ session }, limitArg, platformArg, imageArg) => {
            const parsedLimit = Number(limitArg)
            const limit = Math.max(
                1,
                Math.min(Number.isFinite(parsedLimit) ? parsedLimit : config.blacklistDefaultLimit, 100)
            )
            const shouldRenderImage =
                imageArg === undefined
                    ? !!config.blacklistRenderAsImage
                    : !['0', 'false', 'text', 'no', 'n'].includes(String(imageArg).toLowerCase())
            const puppeteer = (ctx as unknown as { puppeteer?: { page?: () => Promise<unknown> } })
                .puppeteer
            if (shouldRenderImage && !puppeteer?.page)
                return '当前环境未启用 puppeteer，已改为文本模式。'

            const groupId = resolveGroupId(session as Session)
            const records = permanentBlacklist.list(platformArg || session?.platform, groupId)
            if (!records.length)
                return groupId ? '本群暂无自动拉黑记录。' : '当前暂无自动拉黑记录。'

            const limited = records.slice(0, limit)
            const enriched = await enrichBlacklistRecords(limited, session as Session, deps)
            const textLines = [
                '# 昵称 用户ID 拉黑时间 备注',
                ...enriched.map((item, index) => {
                    const note = item.note ? item.note : '——'
                    const time = item.blockedAt || '——'
                    const nickname = stripAtPrefix(item.nickname || item.userId)
                    const userIdDisplay = stripAtPrefix(item.userId)
                    return `${index + 1}. ${nickname} ${userIdDisplay} ${time} ${note}`
                })
            ]

            if (shouldRenderImage) {
                const items = enriched.map((item, index) => ({
                    index: index + 1,
                    nickname: stripAtPrefix(item.nickname || item.userId),
                    userId: stripAtPrefix(item.userId),
                    timeInfo: item.blockedAt || '——',
                    note: item.note || '——',
                    avatarUrl: (() => {
                        const rawId = stripAtPrefix(item.userId)
                        const numericId = rawId.match(/^\d+$/) ? rawId : undefined
                        return numericId
                            ? `https://q1.qlogo.cn/g?b=qq&nk=${numericId}&s=640`
                            : undefined
                    })()
                }))
                const buffer = await renders.blacklist('自动黑名单', items)
                if (buffer) return h.image(buffer, 'image/png')
                return textLines.join('\n')
            }

            return textLines.join('\n')
        })
}
