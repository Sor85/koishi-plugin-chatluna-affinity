/**
 * 临时拉黑命令
 * 管理临时黑名单
 */

import { h } from 'koishi'
import type { Session } from 'koishi'
import type { CommandDependencies } from './types'
import type { TemporaryBlacklistService } from '../services/blacklist/temporary'

export interface TempBlockCommandDeps extends CommandDependencies {
    temporaryBlacklist: TemporaryBlacklistService
}

export function registerTempBlockCommand(deps: TempBlockCommandDeps) {
    const {
        ctx,
        config,
        store,
        cache,
        temporaryBlacklist,
        resolveUserIdentity,
        resolveGroupId,
        stripAtPrefix
    } = deps

    ctx.command(
        'affinity.tempBlock <userId:string> [durationHours:number] [platform:string]',
        '临时拉黑用户',
        { authority: 4 }
    )
        .option('note', '-n <note:text> 备注信息')
        .option('penalty', '-p <penalty:number> 扣除好感度')
        .alias('临时拉黑')
        .action(async ({ session, options }, userId, durationArg, platformArg) => {
            const platform = platformArg || session?.platform
            if (!platform) return '请指定平台。'
            const groupId = resolveGroupId(session as Session)
            const resolved = await resolveUserIdentity(session as Session, userId)
            const normalizedUserId = resolved?.userId || stripAtPrefix(userId)
            if (!normalizedUserId) return '用户 ID 不能为空。'

            const shortTermCfg = config.shortTermBlacklist || {}
            const durationHours = durationArg || shortTermCfg.durationHours || 12
            const penalty = options?.penalty ?? shortTermCfg.penalty ?? 5

            const existing = temporaryBlacklist.isTemporarilyBlacklisted(platform, normalizedUserId)
            if (existing) {
                return `${platform}/${normalizedUserId} 已在临时黑名单中，到期时间：${existing.expiresAt}`
            }

            const entry = temporaryBlacklist.recordTemporary(
                platform,
                normalizedUserId,
                durationHours,
                penalty,
                { note: options?.note || 'manual', nickname: resolved?.nickname || normalizedUserId, channelId: groupId }
            )
            if (!entry) return `添加临时黑名单失败。`

            const selfId = session?.selfId
            if (penalty > 0 && selfId) {
                try {
                    const record = await store.load(selfId, normalizedUserId)
                    if (record) {
                        const newAffinity = store.clamp(
                            (record.longTermAffinity ?? record.affinity) - penalty
                        )
                        await store.save(
                            { platform, userId: normalizedUserId, selfId, session },
                            newAffinity,
                            record.relation || ''
                        )
                    }
                } catch {
                    /* ignore */
                }
            }
            cache.clear(platform, normalizedUserId)

            const nicknameDisplay = resolved?.nickname || normalizedUserId
            return `已将 ${nicknameDisplay} (${normalizedUserId}) 加入临时黑名单，时长 ${durationHours} 小时，扣除好感度 ${penalty}。`
        })

    ctx.command(
        'affinity.tempUnblock <userId:string> [platform:string]',
        '解除临时拉黑',
        { authority: 4 }
    )
        .alias('解除临时拉黑')
        .action(async ({ session }, userId, platformArg) => {
            const platform = platformArg || session?.platform
            if (!platform) return '请指定平台。'
            const normalizedUserId = stripAtPrefix(userId)
            if (!normalizedUserId) return '用户 ID 不能为空。'
            const removed = temporaryBlacklist.removeTemporary(platform, normalizedUserId)
            cache.clear(platform, normalizedUserId)
            if (removed) return `已解除 ${platform}/${normalizedUserId} 的临时黑名单。`
            return `${platform}/${normalizedUserId} 不在临时黑名单中。`
        })
}

export function registerTempBlacklistCommand(deps: TempBlockCommandDeps) {
    const { ctx, config, renders, temporaryBlacklist, stripAtPrefix } = deps

    ctx.command(
        'affinity.tempBlacklist [limit:number] [platform:string] [image]',
        '查看临时黑名单列表',
        { authority: 2 }
    )
        .alias('临时黑名单')
        .action(async ({ session }, limitArg, platformArg, imageArg) => {
            const parsedLimit = Number(limitArg)
            const limit = Math.max(
                1,
                Math.min(Number.isFinite(parsedLimit) ? parsedLimit : config.blacklistDefaultLimit, 100)
            )
            const shouldRenderImage =
                imageArg === undefined
                    ? !!config.shortTermBlacklist?.renderAsImage
                    : !['0', 'false', 'text', 'no', 'n'].includes(String(imageArg).toLowerCase())
            const puppeteer = (ctx as unknown as { puppeteer?: { page?: () => Promise<unknown> } })
                .puppeteer
            if (shouldRenderImage && !puppeteer?.page)
                return '当前环境未启用 puppeteer，已改为文本模式。'

            const records = temporaryBlacklist.listTemporary(platformArg || session?.platform)
            if (!records.length) return '当前暂无临时拉黑记录。'

            const limited = records.slice(0, limit)
            const textLines = [
                '# 昵称 用户ID 到期时间 时长 惩罚 备注',
                ...limited.map((item, index) => {
                    const note = item.note ? item.note : '——'
                    const expiresAt = item.expiresAt || '——'
                    const nickname = stripAtPrefix(item.nickname || item.userId)
                    const userIdDisplay = stripAtPrefix(item.userId)
                    return `${index + 1}. ${nickname} ${userIdDisplay} ${expiresAt} ${item.durationHours}h ${item.penalty} ${note}`
                })
            ]

            if (shouldRenderImage) {
                const items = limited.map((item, index) => ({
                    index: index + 1,
                    nickname: stripAtPrefix(item.nickname || item.userId),
                    userId: stripAtPrefix(item.userId),
                    timeInfo: `${item.durationHours} (到期: ${item.expiresAt || '——'})`,
                    note: item.note || '——',
                    isTemp: true,
                    penalty: Number(item.penalty),
                    avatarUrl: (() => {
                        const rawId = stripAtPrefix(item.userId)
                        const numericId = rawId.match(/^\d+$/) ? rawId : undefined
                        return numericId
                            ? `https://q1.qlogo.cn/g?b=qq&nk=${numericId}&s=640`
                            : undefined
                    })()
                }))
                const buffer = await renders.blacklist('临时黑名单', items)
                if (buffer) return h.image(buffer, 'image/png')
            }

            return textLines.join('\n')
        })
}
