/**
 * 天气 Schema
 * 定义天气功能相关的配置项
 */

import { Schema } from 'koishi'

export const WeatherSchema = Schema.object({
    weather: Schema.object({
        enabled: Schema.boolean().default(false).description('是否启用天气功能'),
        variableName: Schema.string().default('weather').description('天气变量名称'),
        cityName: Schema.string().default('').description('城市名称（如：长沙）'),
        hourlyRefresh: Schema.boolean().default(false).description('每小时刷新天气数据（关闭则每天刷新一次）'),
        registerTool: Schema.boolean().default(false).description('注册 ChatLuna 工具：获取天气'),
        toolName: Schema.string().default('get_weather').description('ChatLuna 工具名称：获取天气')
    })
        .default({
            enabled: false,
            variableName: 'weather',
            cityName: '',
            hourlyRefresh: false,
            registerTool: false,
            toolName: 'get_weather'
        })
        .description('天气设置')
})
