import type { Context } from 'koishi';
import type { Config, AffinityRecord, AffinityStore, LogFn } from '../types';
export declare const MODEL_NAME = "chatluna_affinity";
declare module 'koishi' {
    interface Tables {
        [MODEL_NAME]: AffinityRecord;
    }
}
export declare function createAffinityStore(ctx: Context, config: Config, log: LogFn): AffinityStore;
