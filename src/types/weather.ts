/**
 * 天气相关类型定义
 * 包含 ALAPI 天气 API 响应结构
 */

export interface WeatherHourData {
    time: string
    temp: number
    wea: string
    wea_code: string
    wind: string
    wind_level: string
}

export interface WeatherAqi {
    air: string
    air_level: string
    air_tips: string
    pm25: string
    pm10: string
    co: string
    no2: string
    so2: string
    o3: string
}

export interface WeatherIndex {
    type: string
    level: string
    name: string
    content: string
}

export interface WeatherData {
    city: string
    city_en: string
    province: string
    province_en: string
    city_id: string
    date: string
    update_time: string
    weather: string
    weather_code: string
    temp: number
    min_temp: number
    max_temp: number
    wind: string
    wind_speed: string
    wind_power: string
    rain: string
    rain_24h: string
    humidity: string
    visibility: string
    pressure: string
    air: string
    air_pm25: string
    sunrise: string
    sunset: string
    aqi: WeatherAqi
    index: WeatherIndex[]
    alarm: unknown[]
    hour: WeatherHourData[]
}

export interface WeatherApiResponse {
    request_id: string
    success: boolean
    message: string
    code: number
    data: WeatherData
    time: number
    usage: number
}

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
    apiToken: string
    searchType: 'city' | 'ip'
    cityName: string
    hourlyRefresh: boolean
    registerTool?: boolean
    toolName?: string
}
