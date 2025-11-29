import type { AffinityCache } from '../types'

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
