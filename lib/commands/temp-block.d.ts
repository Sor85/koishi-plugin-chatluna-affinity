/**
 * 临时拉黑命令
 * 管理临时黑名单
 */
import type { CommandDependencies } from './types';
import type { TemporaryBlacklistService } from '../services/blacklist/temporary';
export interface TempBlockCommandDeps extends CommandDependencies {
    temporaryBlacklist: TemporaryBlacklistService;
}
export declare function registerTempBlockCommand(deps: TempBlockCommandDeps): void;
export declare function registerTempBlacklistCommand(deps: TempBlockCommandDeps): void;
