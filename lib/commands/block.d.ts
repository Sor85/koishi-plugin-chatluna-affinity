/**
 * 拉黑与解除拉黑命令
 * 手动管理永久黑名单
 */
import type { CommandDependencies } from './types';
import type { PermanentBlacklistManager } from '../services/blacklist/permanent';
export interface BlockCommandDeps extends CommandDependencies {
    permanentBlacklist: PermanentBlacklistManager;
}
export declare function registerBlockCommand(deps: BlockCommandDeps): void;
