/**
 * 调整好感度命令
 * 手动调整指定用户的好感度
 */

import type { Session } from 'koishi'
import type { CommandDependencies } from './types'

export function registerAdjustCommand(deps: CommandDependencies) {
    const { ctx, config, store, log, resolveUserIdentity, stripAtPrefix } = deps

    ctx.command(
        'affinity.adjust <target:string> <delta:number>',
        '调整指定用户的好感度',
        { authority: 4 }
    )
        .alias('调整好感')
        .alias('调整好感度')
        .option('set', '-s 直接设置好感度值而非增减')
        .usage('示例：affinity.adjust @用户 10（增加10点）\n示例：affinity.adjust @用户 -5（减少5点）\n示例：affinity.adjust @用户 50 -s（设置为50）')
        .action(async ({ session, options }, target, delta) => {
            if (!session) return '无法获取会话信息'
            if (!target) return '请指定目标用户'
            if (delta === undefined || !Number.isFinite(delta)) return '请指定有效的好感度变化值'

            const selfId = session.selfId
            if (!selfId) return '无法获取 Bot ID'

            const identity = await resolveUserIdentity(session as Session, target)
            const userId = identity?.userId || stripAtPrefix(target)
            const nickname = identity?.nickname || userId

            const existing = await store.load(selfId, userId)
            const currentAffinity = existing?.longTermAffinity ?? existing?.affinity ?? store.defaultInitial()

            let newAffinity: number
            if (options?.set) {
                newAffinity = delta
            } else {
                newAffinity = currentAffinity + delta
            }

            const clampedAffinity = store.clamp(newAffinity)

            await store.save(
                { selfId, userId, nickname },
                clampedAffinity,
                existing?.relation || '',
                { longTermAffinity: clampedAffinity, shortTermAffinity: existing?.shortTermAffinity ?? 0 }
            )

            const action = options?.set ? '设置' : (delta >= 0 ? '增加' : '减少')
            const changeText = options?.set ? `${clampedAffinity}` : `${Math.abs(delta)}`

            log('info', '手动调整好感度', {
                userId,
                nickname,
                action,
                change: delta,
                before: currentAffinity,
                after: clampedAffinity
            })

            return `已${action} ${nickname}(${stripAtPrefix(userId)}) 的好感度 ${changeText}\n` +
                   `调整前：${currentAffinity} → 调整后：${clampedAffinity}`
        })
}
