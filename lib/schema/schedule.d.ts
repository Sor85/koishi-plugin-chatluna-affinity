/**
 * 日程 Schema
 * 定义日程功能相关的配置项
 */
import { Schema } from 'koishi';
export declare const ScheduleSchema: Schema<Schemastery.ObjectS<{
    schedule: Schema<Schemastery.ObjectS<{
        enabled: Schema<boolean, boolean>;
        variableName: Schema<string, string>;
        currentVariableName: Schema<string, string>;
        timezone: Schema<string, string>;
        prompt: Schema<string, string>;
        renderAsImage: Schema<boolean, boolean>;
        startDelay: Schema<number, number>;
        registerTool: Schema<boolean, boolean>;
        toolName: Schema<string, string>;
    }>, Schemastery.ObjectT<{
        enabled: Schema<boolean, boolean>;
        variableName: Schema<string, string>;
        currentVariableName: Schema<string, string>;
        timezone: Schema<string, string>;
        prompt: Schema<string, string>;
        renderAsImage: Schema<boolean, boolean>;
        startDelay: Schema<number, number>;
        registerTool: Schema<boolean, boolean>;
        toolName: Schema<string, string>;
    }>>;
}>, Schemastery.ObjectT<{
    schedule: Schema<Schemastery.ObjectS<{
        enabled: Schema<boolean, boolean>;
        variableName: Schema<string, string>;
        currentVariableName: Schema<string, string>;
        timezone: Schema<string, string>;
        prompt: Schema<string, string>;
        renderAsImage: Schema<boolean, boolean>;
        startDelay: Schema<number, number>;
        registerTool: Schema<boolean, boolean>;
        toolName: Schema<string, string>;
    }>, Schemastery.ObjectT<{
        enabled: Schema<boolean, boolean>;
        variableName: Schema<string, string>;
        currentVariableName: Schema<string, string>;
        timezone: Schema<string, string>;
        prompt: Schema<string, string>;
        renderAsImage: Schema<boolean, boolean>;
        startDelay: Schema<number, number>;
        registerTool: Schema<boolean, boolean>;
        toolName: Schema<string, string>;
    }>>;
}>>;
