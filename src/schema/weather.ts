/**
 * 天气 Schema
 * 定义天气功能相关的配置项
 */

import { Schema } from 'koishi'

export const WeatherSchema = Schema.object({
    weather: Schema.object({
        enabled: Schema.boolean().default(false).description('是否启用天气功能'),
        variableName: Schema.string().default('weather').description('天气变量名称'),
        apiToken: Schema.string().role('secret').default('').description('ALAPI 天气 API Token（可在 https://alapi.cn/dashboard/data/token 获取）'),
        searchType: Schema.union([
            Schema.const('city').description('按城市名称'),
            Schema.const('ip').description('按当前 IP 定位')
        ])
            .default('city')
            .description('天气搜索方式'),
        cityName: Schema.string().default('').description('城市名称（如：长沙）'),
        hourlyRefresh: Schema.boolean().default(false).description('每小时刷新天气数据（关闭则每天刷新一次）'),
        registerTool: Schema.boolean().default(false).description('注册 ChatLuna 工具：获取天气'),
        toolName: Schema.string().default('get_weather').description('ChatLuna 工具名称：获取天气')
    })
        .default({
            enabled: false,
            variableName: 'weather',
            apiToken: '',
            searchType: 'city',
            cityName: '',
            hourlyRefresh: false,
            registerTool: false,
            toolName: 'get_weather'
        })
        .description('天气设置')
})
