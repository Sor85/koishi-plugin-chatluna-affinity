/**
 * 个人资料设置工具
 * 提供 OneBot 平台的机器人资料修改功能
 */
import { z } from 'zod';
import type { Context } from 'koishi';
import type { LogFn } from '../../../types';
export interface ProfileToolDeps {
    ctx: Context;
    toolName: string;
    log?: LogFn;
}
export declare function createSetProfileTool(deps: ProfileToolDeps): {
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
