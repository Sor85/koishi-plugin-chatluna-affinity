/**
 * ALAPI 天气 API 服务
 * 提供天气数据获取和当前时段天气解析
 */

import type { Context } from 'koishi'
import type {
    WeatherApiResponse,
    WeatherData,
    CurrentWeather,
    WeatherConfig,
    WeatherHourData
} from '../../types/weather'
import type { LogFn } from '../../types'

const API_BASE_URL = 'https://v3.alapi.cn/api/tianqi'

export interface WeatherApiDeps {
    ctx: Context
    weatherConfig: WeatherConfig
    log: LogFn
}

export interface WeatherQueryOptions {
    city?: string
}

export interface CachedWeatherData {
    current: CurrentWeather
    dailyWeather: string
    hourlyWeather: string
    dailyTemp: number
    dailyMinTemp: number
    dailyMaxTemp: number
    hourlyTemp: number
}

function findCurrentHourWeather(hours: WeatherHourData[], timezone: string): WeatherHourData | null {
    if (!hours || !hours.length) return null

    const now = new Date()
    const formatter = new Intl.DateTimeFormat('zh-CN', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hour12: false
    })

    const parts = formatter.formatToParts(now)
    const year = parts.find(p => p.type === 'year')?.value
    const month = parts.find(p => p.type === 'month')?.value
    const day = parts.find(p => p.type === 'day')?.value
    const hour = parts.find(p => p.type === 'hour')?.value

    const currentHourStr = `${year}-${month}-${day} ${hour}:00:00`

    const exactMatch = hours.find(h => h.time === currentHourStr)
    if (exactMatch) return exactMatch

    const currentHourNum = parseInt(hour || '0', 10)
    const currentDateStr = `${year}-${month}-${day}`

    for (const h of hours) {
        if (!h.time.startsWith(currentDateStr)) continue
        const hourMatch = h.time.match(/(\d{2}):\d{2}:\d{2}$/)
        if (!hourMatch) continue
        const hourNum = parseInt(hourMatch[1], 10)
        if (hourNum === currentHourNum) return h
    }

    return hours[0]
}

function formatCurrentWeather(data: WeatherData, hourData: WeatherHourData | null, timezone: string): CurrentWeather {
    const now = new Date()
    const timeFormatter = new Intl.DateTimeFormat('zh-CN', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })

    return {
        city: data.city,
        province: data.province,
        date: data.date,
        time: timeFormatter.format(now),
        weather: hourData?.wea || data.weather,
        temp: hourData?.temp ?? data.temp,
        minTemp: data.min_temp,
        maxTemp: data.max_temp,
        wind: hourData?.wind || data.wind,
        windLevel: hourData?.wind_level || data.wind_power,
        humidity: data.humidity,
        airLevel: data.aqi?.air_level || '',
        airTips: data.aqi?.air_tips || ''
    }
}

function formatWeatherText(weather: CurrentWeather): string {
    const lines = [
        `📍 ${weather.province} ${weather.city}`,
        `📅 ${weather.date} ${weather.time}`,
        `🌤️ ${weather.weather}，${weather.temp}°C（${weather.minTemp}~${weather.maxTemp}°C）`,
        `💨 ${weather.wind} ${weather.windLevel}`,
        `💧 湿度 ${weather.humidity}`
    ]

    if (weather.airLevel) {
        lines.push(`🌫️ 空气质量：${weather.airLevel}`)
    }

    return lines.join('\n')
}

export function createWeatherApi(deps: WeatherApiDeps) {
    const { ctx, weatherConfig, log } = deps
    const timezone = 'Asia/Shanghai'

    const cache = new Map<string, CachedWeatherData>()

    const buildRequestParams = (options?: WeatherQueryOptions): Record<string, string> => {
        const params: Record<string, string> = {
            token: weatherConfig.apiToken
        }

        const city = (options?.city || weatherConfig.cityName || '').trim()
        if (city) params.city = city

        return params
    }

    const buildCacheKey = (now: Date, cityKey: string): string => {
        const formatter = new Intl.DateTimeFormat('zh-CN', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: weatherConfig.hourlyRefresh ? '2-digit' : undefined,
            hour12: false
        })
        const timeKey = formatter.format(now).replace(/[\/\s:]/g, '-')
        return `${cityKey || 'default'}-${timeKey}`
    }

    const fetchWeather = async (options?: WeatherQueryOptions): Promise<CachedWeatherData | null> => {
        if (!weatherConfig.enabled || !weatherConfig.apiToken) {
            return null
        }

        const now = new Date()
        const cityKey = (options?.city || weatherConfig.cityName || '').trim()
        if (!cityKey) return null
        const currentKey = buildCacheKey(now, cityKey)

        if (cache.has(currentKey)) return cache.get(currentKey) || null

        try {
            const params = buildRequestParams(options)
            if (!params.city) return null
            const queryString = new URLSearchParams(params).toString()
            const url = `${API_BASE_URL}?${queryString}`

            const response = await ctx.http.get<WeatherApiResponse>(url)

            if (!response.success || response.code !== 200 || !response.data) {
                log('warn', '天气 API 请求失败', { message: response.message, code: response.code, city: params.city })
                return cache.get(currentKey) || null
            }

            const data = response.data
            const hourData = findCurrentHourWeather(data.hour, timezone)
            const current = formatCurrentWeather(data, hourData, timezone)

            const cachedData: CachedWeatherData = {
                current,
                dailyWeather: data.weather,
                hourlyWeather: hourData?.wea || data.weather,
                dailyTemp: data.temp,
                dailyMinTemp: data.min_temp,
                dailyMaxTemp: data.max_temp,
                hourlyTemp: hourData?.temp ?? data.temp
            }
            cache.set(currentKey, cachedData)

            log('debug', '天气数据已更新', { city: current.city, daily: cachedData.dailyWeather, hourly: cachedData.hourlyWeather })

            return cachedData
        } catch (error) {
            log('warn', '获取天气数据失败', error)
            return cache.get(currentKey) || null
        }
    }

    const getCurrentWeather = async (options?: WeatherQueryOptions): Promise<CurrentWeather | null> => {
        const data = await fetchWeather(options)
        return data?.current || null
    }

    const getWeatherText = async (options?: WeatherQueryOptions): Promise<string> => {
        const data = await fetchWeather(options)
        if (!data) return ''
        return formatWeatherText(data.current)
    }

    const getDailyWeather = async (options?: WeatherQueryOptions): Promise<string> => {
        const data = await fetchWeather(options)
        if (!data) return ''
        return `${data.dailyWeather}，${data.dailyTemp}°C（${data.dailyMinTemp}~${data.dailyMaxTemp}°C）`
    }

    const getHourlyWeather = async (options?: WeatherQueryOptions): Promise<string> => {
        const data = await fetchWeather(options)
        if (!data) return ''
        return `${data.hourlyWeather}，${data.hourlyTemp}°C`
    }

    const invalidateCache = (): void => {
        cache.clear()
    }

    return {
        getCurrentWeather,
        getWeatherText,
        getDailyWeather,
        getHourlyWeather,
        invalidateCache,
        fetchWeather
    }
}

export type WeatherApi = ReturnType<typeof createWeatherApi>
