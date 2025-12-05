/**
 * 机器人信息变量提供者
 * 为 ChatLuna 提供机器人自身的详细信息
 */
import type { Session } from 'koishi';
import type { Config, MemberInfo, LogFn } from '../../../types';
interface ProviderConfigurable {
    session?: Session;
}
export interface BotInfoProviderDeps {
    config: Config;
    log?: LogFn;
    fetchMember: (session: Session, userId: string) => Promise<MemberInfo | null>;
}
export declare function createBotInfoProvider(deps: BotInfoProviderDeps): (_args: unknown, _variables: unknown, configurable?: ProviderConfigurable) => Promise<string>;
export type BotInfoProvider = ReturnType<typeof createBotInfoProvider>;
export {};
