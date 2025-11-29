import { z } from 'zod';
import type { Context } from 'koishi';
import type { Config, AffinityStore, AffinityCache } from '../types';
interface OneBotToolDeps {
    ctx: Context;
    toolName: string;
}
export declare function createOneBotPokeTool({ ctx, toolName }: OneBotToolDeps): {
    name: string;
    description: string;
    schema: z.ZodObject<{
        userId: z.ZodString;
        groupId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        groupId?: string | undefined;
    }, {
        userId: string;
        groupId?: string | undefined;
    }>;
    _call(input: {
        userId: string;
        groupId?: string;
    }, _manager?: unknown, runnable?: unknown): Promise<string>;
    returnDirect: boolean;
    verboseParsingErrors: boolean;
    get lc_namespace(): string[];
    responseFormat?: import("@langchain/core/tools").ResponseFormat;
    defaultConfig?: import("@langchain/core/tools").ToolRunnableConfig;
    invoke<TInput extends any, TConfig extends import("@langchain/core/tools").ToolRunnableConfig | undefined>(input: TInput, config?: TConfig | undefined): Promise<any>;
    call<TArg extends any, TConfig extends import("@langchain/core/tools").ToolRunnableConfig | undefined>(arg: TArg, configArg?: TConfig | undefined, tags?: string[]): Promise<any>;
};
export declare function createOneBotSetSelfProfileTool({ ctx, toolName }: OneBotToolDeps): {
    name: string;
    description: string;
    schema: z.ZodObject<{
        nickname: z.ZodString;
        signature: z.ZodOptional<z.ZodString>;
        gender: z.ZodOptional<z.ZodEnum<["unknown", "male", "female"]>>;
    }, "strip", z.ZodTypeAny, {
        nickname: string;
        gender?: "unknown" | "male" | "female" | undefined;
        signature?: string | undefined;
    }, {
        nickname: string;
        gender?: "unknown" | "male" | "female" | undefined;
        signature?: string | undefined;
    }>;
    _call(input: {
        nickname: string;
        signature?: string;
        gender?: "unknown" | "male" | "female";
    }, _manager?: unknown, runnable?: unknown): Promise<string>;
    returnDirect: boolean;
    verboseParsingErrors: boolean;
    get lc_namespace(): string[];
    responseFormat?: import("@langchain/core/tools").ResponseFormat;
    defaultConfig?: import("@langchain/core/tools").ToolRunnableConfig;
    invoke<TInput extends any, TConfig extends import("@langchain/core/tools").ToolRunnableConfig | undefined>(input: TInput, config?: TConfig | undefined): Promise<any>;
    call<TArg extends any, TConfig extends import("@langchain/core/tools").ToolRunnableConfig | undefined>(arg: TArg, configArg?: TConfig | undefined, tags?: string[]): Promise<any>;
};
export declare function createDeleteMessageTool({ ctx, toolName }: OneBotToolDeps): {
    name: string;
    description: string;
    schema: z.ZodObject<{
        messageId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        messageId?: string | undefined;
    }, {
        messageId?: string | undefined;
    }>;
    _call(input: {
        messageId?: string;
    }, _manager?: unknown, runnable?: unknown): Promise<string>;
    returnDirect: boolean;
    verboseParsingErrors: boolean;
    get lc_namespace(): string[];
    responseFormat?: import("@langchain/core/tools").ResponseFormat;
    defaultConfig?: import("@langchain/core/tools").ToolRunnableConfig;
    invoke<TInput extends any, TConfig extends import("@langchain/core/tools").ToolRunnableConfig | undefined>(input: TInput, config?: TConfig | undefined): Promise<any>;
    call<TArg extends any, TConfig extends import("@langchain/core/tools").ToolRunnableConfig | undefined>(arg: TArg, configArg?: TConfig | undefined, tags?: string[]): Promise<any>;
};
export declare function createToolRegistry(config: Config, store: AffinityStore, cache: AffinityCache): {
    affinitySelector: () => boolean;
    relationshipSelector: () => boolean;
    blacklistSelector: () => boolean;
    createAffinityTool: () => {
        name: string;
        description: string;
        schema: z.ZodObject<{
            affinity: z.ZodNumber;
            targetUserId: z.ZodOptional<z.ZodString>;
            platform: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            affinity: number;
            platform?: string | undefined;
            targetUserId?: string | undefined;
        }, {
            affinity: number;
            platform?: string | undefined;
            targetUserId?: string | undefined;
        }>;
        _call(input: {
            affinity: number;
            targetUserId?: string;
            platform?: string;
        }, _manager?: unknown, runnable?: unknown): Promise<string>;
        returnDirect: boolean;
        verboseParsingErrors: boolean;
        get lc_namespace(): string[];
        responseFormat?: import("@langchain/core/tools").ResponseFormat;
        defaultConfig?: import("@langchain/core/tools").ToolRunnableConfig;
        invoke<TInput extends any, TConfig extends import("@langchain/core/tools").ToolRunnableConfig | undefined>(input: TInput, config?: TConfig | undefined): Promise<any>;
        call<TArg extends any, TConfig extends import("@langchain/core/tools").ToolRunnableConfig | undefined>(arg: TArg, configArg?: TConfig | undefined, tags?: string[]): Promise<any>;
    };
    createRelationshipTool: () => {
        name: string;
        description: string;
        schema: z.ZodObject<{
            relation: z.ZodString;
            targetUserId: z.ZodOptional<z.ZodString>;
            platform: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            relation: string;
            platform?: string | undefined;
            targetUserId?: string | undefined;
        }, {
            relation: string;
            platform?: string | undefined;
            targetUserId?: string | undefined;
        }>;
        _call(input: {
            relation: string;
            targetUserId?: string;
            platform?: string;
        }, _manager?: unknown, runnable?: unknown): Promise<string>;
        returnDirect: boolean;
        verboseParsingErrors: boolean;
        get lc_namespace(): string[];
        responseFormat?: import("@langchain/core/tools").ResponseFormat;
        defaultConfig?: import("@langchain/core/tools").ToolRunnableConfig;
        invoke<TInput extends any, TConfig extends import("@langchain/core/tools").ToolRunnableConfig | undefined>(input: TInput, config?: TConfig | undefined): Promise<any>;
        call<TArg extends any, TConfig extends import("@langchain/core/tools").ToolRunnableConfig | undefined>(arg: TArg, configArg?: TConfig | undefined, tags?: string[]): Promise<any>;
    };
    createBlacklistTool: () => {
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
};
export {};
