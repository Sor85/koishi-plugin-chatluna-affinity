/**
 * 戳一戳工具
 * 提供 OneBot 平台的戳一戳功能
 */
import { z } from 'zod';
import type { Context } from 'koishi';
import type { LogFn } from '../../../types';
export interface PokeToolDeps {
    ctx: Context;
    toolName: string;
    log?: LogFn;
}
export declare function createPokeTool(deps: PokeToolDeps): {
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
