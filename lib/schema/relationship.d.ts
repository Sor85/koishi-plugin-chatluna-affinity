/**
 * 关系 Schema
 * 定义关系相关的配置项
 */
import { Schema } from 'koishi';
export declare const RelationshipSchema: Schema<Schemastery.ObjectS<{
    relationshipVariableName: Schema<string, string>;
    relationships: Schema<({
        userId?: string | null | undefined;
        relation?: string | null | undefined;
        note?: string | null | undefined;
    } & import("koishi").Dict)[], Schemastery.ObjectT<{
        userId: Schema<string, string>;
        relation: Schema<string, string>;
        note: Schema<string, string>;
    }>[]>;
    relationshipAffinityLevels: Schema<({
        min?: number | null | undefined;
        max?: number | null | undefined;
        relation?: string | null | undefined;
        note?: string | null | undefined;
    } & import("koishi").Dict)[], Schemastery.ObjectT<{
        min: Schema<number, number>;
        max: Schema<number, number>;
        relation: Schema<string, string>;
        note: Schema<string, string>;
    }>[]>;
    registerRelationshipTool: Schema<boolean, boolean>;
    relationshipToolName: Schema<string, string>;
}>, Schemastery.ObjectT<{
    relationshipVariableName: Schema<string, string>;
    relationships: Schema<({
        userId?: string | null | undefined;
        relation?: string | null | undefined;
        note?: string | null | undefined;
    } & import("koishi").Dict)[], Schemastery.ObjectT<{
        userId: Schema<string, string>;
        relation: Schema<string, string>;
        note: Schema<string, string>;
    }>[]>;
    relationshipAffinityLevels: Schema<({
        min?: number | null | undefined;
        max?: number | null | undefined;
        relation?: string | null | undefined;
        note?: string | null | undefined;
    } & import("koishi").Dict)[], Schemastery.ObjectT<{
        min: Schema<number, number>;
        max: Schema<number, number>;
        relation: Schema<string, string>;
        note: Schema<string, string>;
    }>[]>;
    registerRelationshipTool: Schema<boolean, boolean>;
    relationshipToolName: Schema<string, string>;
}>>;
