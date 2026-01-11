/**
 * 天气相关类型定义
 * 定义天气数据结构与配置项
 */

export interface CurrentWeather {
    city: string
    province: string
    date: string
    time: string
    weather: string
    temp: number
    minTemp: number
    maxTemp: number
    wind: string
    windLevel: string
    humidity: string
    airLevel: string
    airTips: string
}

export interface WeatherConfig {
    enabled: boolean
    variableName: string
    cityName: string
    hourlyRefresh: boolean
    registerTool?: boolean
    toolName?: string
}
