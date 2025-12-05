/**
 * 日程查询工具
 * 为 ChatLuna 提供日程查询能力
 */

import { z } from 'zod'
import { StructuredTool } from '@langchain/core/tools'
import type { Schedule, ScheduleConfig } from '../../../types'
import { getCurrentEntry } from '../../../services/schedule/time-utils'

export interface ScheduleToolDeps {
    scheduleConfig: ScheduleConfig
    getSchedule: () => Schedule | null
}

export function createScheduleTool(deps: ScheduleToolDeps) {
    const { scheduleConfig, getSchedule } = deps
    const timezone = scheduleConfig.timezone || 'Asia/Shanghai'

    // @ts-expect-error - Type instantiation depth issue with zod + StructuredTool
    return new (class extends StructuredTool {
        name = 'get_schedule'
        description =
            "Get the bot's current schedule or check what activity is happening at a specific time."
        schema = z.object({
            query: z
                .enum(['full', 'current'])
                .optional()
                .describe("Query type: 'full' for complete schedule, 'current' for current activity")
        })

        async _call(input: { query?: 'full' | 'current' }) {
            const schedule = getSchedule()
            if (!schedule) return 'No schedule available for today.'

            if (input.query === 'current') {
                const entry = getCurrentEntry(schedule, timezone)
                if (!entry) return 'No activity scheduled for the current time.'
                return `Current activity (${entry.start}-${entry.end}): ${entry.summary}`
            }

            return schedule.text || 'No schedule available for today.'
        }
    })()
}
