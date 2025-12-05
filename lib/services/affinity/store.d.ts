/**
 * 好感度数据存储
 * 提供好感度记录的 CRUD 操作和状态管理
 */
import type { Context, Session } from 'koishi';
import type { Config, AffinityRecord, AffinityState, CombinedState, InitialRange, SessionSeed, SaveExtra, ClampFn, LogFn } from '../../types';
export interface AffinityStoreOptions {
    ctx: Context;
    config: Config;
    log: LogFn;
}
export declare function createAffinityStore(options: AffinityStoreOptions): {
    clamp: (value: number) => number;
    save: (seed: SessionSeed, value: number, relation?: string, extra?: Partial<SaveExtra>) => Promise<AffinityRecord | null>;
    load: (selfId: string, userId: string) => Promise<AffinityRecord | null>;
    ensure: (session: Session, clampFn: ClampFn, fallbackInitial?: number) => Promise<AffinityState>;
    defaultInitial: () => number;
    randomInitial: () => number;
    initialRange: () => InitialRange;
    composeState: (longTerm: number, shortTerm: number) => CombinedState;
    createInitialState: (base: number) => CombinedState;
    extractState: (record: AffinityRecord | null) => AffinityState;
};
export type AffinityStore = ReturnType<typeof createAffinityStore>;
