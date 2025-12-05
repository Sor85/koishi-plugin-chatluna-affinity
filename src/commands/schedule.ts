/**
 * 日程命令
 * 查看和刷新今日日程
 */

import { h } from 'koishi'
import type { Session } from 'koishi'
import type { CommandDependencies } from './types'
import type { Schedule, ScheduleConfig, LogFn } from '../types'
import type { RenderService } from '../renders'

export interface ScheduleCommandDeps extends CommandDependencies {
    scheduleConfig: ScheduleConfig
    getSchedule: (session?: Session) => Promise<Schedule | null>
    regenerateSchedule: (session?: Session) => Promise<Schedule | null>
    renderScheduleImage: (schedule: Schedule) => Promise<Buffer | null>
    startRetryInterval: () => void
}

export function registerScheduleCommand(deps: ScheduleCommandDeps) {
    const {
        ctx,
        scheduleConfig,
        getSchedule,
        regenerateSchedule,
        renderScheduleImage,
        startRetryInterval
    } = deps

    if (!scheduleConfig.enabled) return

    ctx.command('affinity.schedule', '查看今日日程', { authority: 2 })
        .alias('今日日程')
        .action(async ({ session }) => {
            const schedule = await getSchedule(session as Session)
            if (!schedule) return '暂无今日日程。'

            if (scheduleConfig.renderAsImage) {
                const buffer = await renderScheduleImage(schedule)
                if (buffer) return h.image(buffer, 'image/png')
                return `${schedule.text || '暂无今日日程。'}\n（日程图片渲染失败，已改为文本模式）`
            }

            return schedule.text || '暂无今日日程。'
        })

    ctx.command('affinity.schedule.refresh', '重新生成今日日程', { authority: 4 })
        .alias('刷新日程')
        .alias('重生日程')
        .action(async ({ session }) => {
            const regenerated = await regenerateSchedule(session as Session | undefined)
            if (regenerated) {
                return '已重新生成今日日程。'
            }
            startRetryInterval()
            return '重新生成失败，将继续每10分钟尝试一次。'
        })
}
