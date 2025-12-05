/**
 * 永久黑名单管理
 * 提供永久黑名单的增删查功能，数据持久化到配置文件
 */
import type { Config, BlacklistEntry, BlacklistDetail, LogFn } from '../../types';
export interface PermanentBlacklistOptions {
    config: Config;
    log: LogFn;
    applyConfigUpdate: () => void;
}
export declare function createPermanentBlacklistManager(options: PermanentBlacklistOptions): {
    isBlacklisted: (platform: string, userId: string, _channelId?: string) => boolean;
    record: (platform: string, userId: string, detail?: BlacklistDetail) => BlacklistEntry | null;
    remove: (platform: string, userId: string, _channelId?: string) => boolean;
    list: (platform?: string, _channelId?: string) => BlacklistEntry[];
};
export type PermanentBlacklistManager = ReturnType<typeof createPermanentBlacklistManager>;
