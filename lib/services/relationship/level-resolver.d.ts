/**
 * 关系等级解析器
 * 根据好感度值或关系名称解析对应的关系等级配置
 */
import type { Config, RelationshipLevel } from '../../types';
export declare function createLevelResolver(config: Config): {
    resolveLevelByAffinity: (value: number) => RelationshipLevel | null;
    resolveLevelByRelation: (relationName: string) => RelationshipLevel | null;
};
export type LevelResolver = ReturnType<typeof createLevelResolver>;
