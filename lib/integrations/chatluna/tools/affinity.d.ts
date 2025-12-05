/**
 * 好感度调整工具
 * 为 ChatLuna 提供好感度调整能力
 */
import { z } from 'zod';
import type { ToolDependencies } from './types';
export declare function createAffinityTool(deps: ToolDependencies): {
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
