/**
 * 手动关系配置管理
 * 提供特殊关系的配置管理和数据库同步功能
 */
import type { Context } from 'koishi';
import type { Config, ManualRelationship, LogFn } from '../../types';
export interface ManualConfigOptions {
    ctx: Context;
    config: Config;
    log: LogFn;
    applyConfigUpdate: () => void;
}
export declare function createManualRelationshipManager(options: ManualConfigOptions): {
    find: (platform: string, userId: string) => ManualRelationship | null;
    update: (userId: string, relationName: string) => void;
    remove: (selfId: string, userId: string) => Promise<boolean>;
    syncToDatabase: (selfId?: string) => Promise<void>;
};
export type ManualRelationshipManager = ReturnType<typeof createManualRelationshipManager>;
