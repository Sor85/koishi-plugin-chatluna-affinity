/**
 * 黑名单拦截中间件
 * 提供消息拦截守卫，阻止黑名单用户的消息
 */
import type { Session } from 'koishi';
import type { Config, LogFn } from '../../types';
import type { PermanentBlacklistManager } from './permanent';
import type { TemporaryBlacklistService } from './temporary';
export interface BlacklistGuardOptions {
    config: Config;
    permanent: PermanentBlacklistManager;
    temporary: TemporaryBlacklistService;
    log: LogFn;
}
export declare function createBlacklistGuard(options: BlacklistGuardOptions): {
    shouldBlock: (session: Session) => boolean;
    middleware: (session: Session, next: () => Promise<void>) => Promise<void>;
};
export type BlacklistGuard = ReturnType<typeof createBlacklistGuard>;
