/**
 * 用户信息变量提供者
 * 为 ChatLuna 提供当前用户的详细信息
 */
import type { Session } from 'koishi';
import type { Config, MemberInfo, LogFn } from '../../../types';
interface ProviderConfigurable {
    session?: Session;
}
export interface UserInfoProviderDeps {
    config: Config;
    log?: LogFn;
    fetchMember: (session: Session, userId: string) => Promise<MemberInfo | null>;
}
export declare function createUserInfoProvider(deps: UserInfoProviderDeps): (_args: unknown, _variables: unknown, configurable?: ProviderConfigurable) => Promise<string>;
export type UserInfoProvider = ReturnType<typeof createUserInfoProvider>;
export {};
