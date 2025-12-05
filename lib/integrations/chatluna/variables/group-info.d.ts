/**
 * 群信息变量提供者
 * 为 ChatLuna 提供当前群聊的信息
 */
import type { Session } from 'koishi';
import type { Config, LogFn } from '../../../types';
interface ProviderConfigurable {
    session?: Session;
}
export interface GroupInfoProviderDeps {
    config: Config;
    log?: LogFn;
    fetchGroupList: (session: Session) => Promise<unknown[] | null>;
}
export declare function createGroupInfoProvider(deps: GroupInfoProviderDeps): (_args: unknown, _variables: unknown, configurable?: ProviderConfigurable) => Promise<string>;
export type GroupInfoProvider = ReturnType<typeof createGroupInfoProvider>;
export {};
