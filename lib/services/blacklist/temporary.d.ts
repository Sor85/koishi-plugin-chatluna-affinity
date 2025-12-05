/**
 * 临时黑名单管理
 * 提供临时黑名单的内存缓存和配置持久化功能
 */
import type { Config, TemporaryBlacklistEntry, BlacklistDetail, InMemoryTemporaryEntry, ShortTermOptions, LogFn } from '../../types';
export interface TemporaryBlacklistOptions {
    config: Config;
    shortTermOptions: ShortTermOptions;
    log: LogFn;
    applyConfigUpdate: () => void;
}
export declare function createTemporaryBlacklistManager(options: TemporaryBlacklistOptions): {
    isBlocked: (platform: string, userId: string) => InMemoryTemporaryEntry | null;
    activate: (platform: string, userId: string, nickname: string, now: Date) => {
        activated: boolean;
        entry: InMemoryTemporaryEntry | null;
    };
    clear: (platform: string, userId: string) => void;
    isTemporarilyBlacklisted: (platform: string, userId: string) => TemporaryBlacklistEntry | null;
    recordTemporary: (platform: string, userId: string, durationHours: number, penalty: number, detail?: BlacklistDetail) => TemporaryBlacklistEntry | null;
    removeTemporary: (platform: string, userId: string) => boolean;
    listTemporary: (platform?: string) => TemporaryBlacklistEntry[];
};
export type TemporaryBlacklistService = ReturnType<typeof createTemporaryBlacklistManager>;
