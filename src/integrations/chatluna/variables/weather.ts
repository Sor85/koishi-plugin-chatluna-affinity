/**
 * 天气变量提供者
 * 为 ChatLuna 提供当前时段天气变量（使用 hour.wea）
 */

import type { Session } from 'koishi'
import type { WeatherApi } from '../../../services/weather'

interface ProviderConfigurable {
    session?: Session
}

export interface WeatherProviderDeps {
    weatherApi: WeatherApi
}

export function createWeatherProvider(deps: WeatherProviderDeps) {
    const { weatherApi } = deps

    return async (
        _args: unknown,
        _variables: unknown,
        _configurable?: ProviderConfigurable
    ): Promise<string> => {
        return weatherApi.getHourlyWeather()
    }
}

export type WeatherProvider = ReturnType<typeof createWeatherProvider>
