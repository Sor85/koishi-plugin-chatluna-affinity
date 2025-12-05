/**
 * 好感度变量提供者
 * 为 ChatLuna 提供当前用户好感度变量，直接从数据库读取
 */
import type { AffinityCache } from '../../../types';
import type { AffinityStore } from '../../../services/affinity/store';
interface ProviderConfigurable {
    session?: {
        platform?: string;
        userId?: string;
        selfId?: string;
    };
}
export interface AffinityProviderDeps {
    cache: AffinityCache;
    store: AffinityStore;
}
export declare function createAffinityProvider(deps: AffinityProviderDeps): (_args: unknown, _variables: unknown, configurable?: ProviderConfigurable) => Promise<number | string>;
export type AffinityProvider = ReturnType<typeof createAffinityProvider>;
export {};
