/**
 * 黑名单调整工具
 * 为 ChatLuna 提供黑名单管理能力
 */
import { z } from 'zod';
import type { ToolDependencies } from './types';
export declare function createBlacklistTool(deps: ToolDependencies): {
    name: string;
    description: string;
    schema: z.ZodObject<{
        action: z.ZodEnum<["add", "remove", "temp_add", "temp_remove"]>;
        targetUserId: z.ZodString;
        platform: z.ZodOptional<z.ZodString>;
        note: z.ZodOptional<z.ZodString>;
        durationHours: z.ZodOptional<z.ZodNumber>;
        penalty: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        targetUserId: string;
        action: "add" | "remove" | "temp_add" | "temp_remove";
        durationHours?: number | undefined;
        penalty?: number | undefined;
        note?: string | undefined;
        platform?: string | undefined;
    }, {
        targetUserId: string;
        action: "add" | "remove" | "temp_add" | "temp_remove";
        durationHours?: number | undefined;
        penalty?: number | undefined;
        note?: string | undefined;
        platform?: string | undefined;
    }>;
    _call(input: {
        action: "add" | "remove" | "temp_add" | "temp_remove";
        targetUserId: string;
        platform?: string;
        note?: string;
        durationHours?: number;
        penalty?: number;
    }, _manager?: unknown, runnable?: unknown): Promise<string>;
    returnDirect: boolean;
    verboseParsingErrors: boolean;
    get lc_namespace(): string[];
    responseFormat?: import("@langchain/core/tools").ResponseFormat;
    defaultConfig?: import("@langchain/core/tools").ToolRunnableConfig;
    invoke<TInput extends any, TConfig extends import("@langchain/core/tools").ToolRunnableConfig | undefined>(input: TInput, config?: TConfig | undefined): Promise<any>;
    call<TArg extends any, TConfig extends import("@langchain/core/tools").ToolRunnableConfig | undefined>(arg: TArg, configArg?: TConfig | undefined, tags?: string[]): Promise<any>;
};
