/**
 * 上下文好感度变量提供者
 * 为 ChatLuna 提供最近消息用户的好感度概览，直接从数据库读取
 */
import type { Session } from 'koishi';
import type { Config } from '../../../types';
import type { AffinityStore } from '../../../services/affinity/store';
import type { HistoryEntry } from '../../../services/message/history';
interface ProviderConfigurable {
    session?: Session;
}
export interface ContextAffinityProviderDeps {
    config: Config;
    store: AffinityStore;
    fetchEntries?: (session: Session, count: number) => Promise<HistoryEntry[]>;
}
export declare function createContextAffinityProvider(deps: ContextAffinityProviderDeps): (_args: unknown, _variables: unknown, configurable?: ProviderConfigurable) => Promise<string>;
export type ContextAffinityProvider = ReturnType<typeof createContextAffinityProvider>;
export {};
