/**
 * 消息删除工具
 * 提供消息撤回功能
 */
import { z } from 'zod';
import type { Context } from 'koishi';
import type { LogFn } from '../../../types';
import type { MessageStore } from '../../../services/message/store';
export interface DeleteMessageToolDeps {
    ctx: Context;
    toolName: string;
    messageStore?: MessageStore;
    log?: LogFn;
}
export declare function createDeleteMessageTool(deps: DeleteMessageToolDeps): {
    name: string;
    description: string;
    schema: z.ZodObject<{
        messageId: z.ZodOptional<z.ZodString>;
        lastN: z.ZodOptional<z.ZodNumber>;
        userId: z.ZodOptional<z.ZodString>;
        contentMatch: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        userId?: string | undefined;
        messageId?: string | undefined;
        lastN?: number | undefined;
        contentMatch?: string | undefined;
    }, {
        userId?: string | undefined;
        messageId?: string | undefined;
        lastN?: number | undefined;
        contentMatch?: string | undefined;
    }>;
    _call(input: {
        messageId?: string;
        lastN?: number;
        userId?: string;
        contentMatch?: string;
    }, _manager?: unknown, runnable?: unknown): Promise<string>;
    returnDirect: boolean;
    verboseParsingErrors: boolean;
    get lc_namespace(): string[];
    responseFormat?: import("@langchain/core/tools").ResponseFormat;
    defaultConfig?: import("@langchain/core/tools").ToolRunnableConfig;
    invoke<TInput extends any, TConfig extends import("@langchain/core/tools").ToolRunnableConfig | undefined>(input: TInput, config?: TConfig | undefined): Promise<any>;
    call<TArg extends any, TConfig extends import("@langchain/core/tools").ToolRunnableConfig | undefined>(arg: TArg, configArg?: TConfig | undefined, tags?: string[]): Promise<any>;
};
