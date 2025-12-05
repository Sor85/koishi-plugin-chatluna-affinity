/**
 * 黑名单列表命令
 * 查看自动黑名单和临时黑名单
 */
import type { CommandDependencies } from './types';
import type { PermanentBlacklistManager } from '../services/blacklist/permanent';
import type { TemporaryBlacklistService } from '../services/blacklist/temporary';
export interface BlacklistCommandDeps extends CommandDependencies {
    permanentBlacklist: PermanentBlacklistManager;
    temporaryBlacklist: TemporaryBlacklistService;
}
export declare function registerBlacklistCommand(deps: BlacklistCommandDeps): void;
