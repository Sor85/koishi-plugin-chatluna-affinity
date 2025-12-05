/**
 * 好感度缓存
 * 提供简单的单条目缓存，用于快速读取最近访问的好感度值
 */

import type { AffinityCache } from '../../types'

export function createAffinityCache(): AffinityCache {
    let entry: { platform: string; userId: string; value: number } | null = null

    const match = (platform: string, userId: string): boolean =>
        entry !== null && entry.platform === platform && entry.userId === userId

    return {
        get(platform: string, userId: string): number | null {
            return match(platform, userId) ? entry!.value : null
        },
        set(platform: string, userId: string, value: number): void {
            entry = { platform, userId, value }
        },
        clear(platform: string, userId: string): void {
            if (match(platform, userId)) entry = null
        },
        clearAll(): void {
            entry = null
        }
    }
}
