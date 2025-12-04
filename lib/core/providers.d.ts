import type { Session } from 'koishi';
import type { Config, AffinityStore, AffinityCache } from '../types';
import type { HistoryEntry } from '../services/history';
interface ProviderConfigurable {
    session?: {
        platform?: string;
        userId?: string;
        selfId?: string;
    };
}
interface ProviderDeps {
    config: Config;
    cache: AffinityCache;
    store: AffinityStore;
}
interface ContextHistory {
    fetchEntries?: (session: Session, count: number) => Promise<HistoryEntry[]>;
}
export declare function createAffinityProvider({ config, cache, store }: ProviderDeps): (_args: unknown, _variables: unknown, configurable?: ProviderConfigurable) => Promise<number | string>;
export declare function createRelationshipProvider({ store }: Pick<ProviderDeps, 'store'>): (args: unknown[] | undefined, _variables: unknown, configurable?: ProviderConfigurable) => Promise<string>;
export declare function createContextAffinityProvider({ config, store, history }: {
    config: Config;
    store: AffinityStore;
    history?: ContextHistory;
}): (_args: unknown, _variables: unknown, configurable?: ProviderConfigurable & {
    session?: Session;
}) => Promise<string>;
export {};
