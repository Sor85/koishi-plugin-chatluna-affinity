/**
 * 好感度数据表定义
 * 定义 chatluna_affinity 表结构及类型声明
 */
import type { Context } from 'koishi';
import type { AffinityRecord } from '../types';
export declare const MODEL_NAME = "chatluna_affinity";
declare module 'koishi' {
    interface Tables {
        [MODEL_NAME]: AffinityRecord;
    }
}
export declare function extendAffinityModel(ctx: Context): void;
