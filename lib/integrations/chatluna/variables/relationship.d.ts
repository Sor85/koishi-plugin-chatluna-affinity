/**
 * 关系变量提供者
 * 为 ChatLuna 提供当前用户关系变量，直接从数据库读取
 */
import type { AffinityStore } from '../../../services/affinity/store';
interface ProviderConfigurable {
    session?: {
        platform?: string;
        userId?: string;
        selfId?: string;
    };
}
export interface RelationshipProviderDeps {
    store: AffinityStore;
}
export declare function createRelationshipProvider(deps: RelationshipProviderDeps): (args: unknown[] | undefined, _variables: unknown, configurable?: ProviderConfigurable) => Promise<string>;
export type RelationshipProvider = ReturnType<typeof createRelationshipProvider>;
export {};
