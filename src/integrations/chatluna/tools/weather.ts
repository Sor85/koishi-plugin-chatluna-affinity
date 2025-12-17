/**
 * 天气查询工具
 * 提供 ChatLuna 工具用于获取当前天气信息
 */

import { z } from 'zod'
import { StructuredTool } from '@langchain/core/tools'
import type { WeatherApi } from '../../../services/weather'

export interface WeatherToolDeps {
    weatherApi: WeatherApi
}

export function createWeatherTool(deps: WeatherToolDeps) {
    const { weatherApi } = deps

    // @ts-expect-error - Type instantiation depth issue with zod + StructuredTool
    return new (class extends StructuredTool {
        name = 'get_weather'
        description = '获取当前天气信息，可选择返回详细文本或当前时段天气；需指定城市'
        schema = z
            .object({
                mode: z
                    .enum(['text', 'hourly'])
                    .optional()
                    .describe("text: 天气描述；hourly: 当前时段天气"),
                city: z.string().trim().min(1).describe('必填，指定查询的城市名称（如：上海、长沙）')
            })

        async _call(input: { mode?: 'text' | 'hourly'; city: string }) {
            const mode = input?.mode || 'text'
            const city = input.city.trim()
            const opts = { city }

            if (mode === 'hourly') return weatherApi.getHourlyWeather(opts)
            return weatherApi.getWeatherText(opts)
        }
    })()
}
