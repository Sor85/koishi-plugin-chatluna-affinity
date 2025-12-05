/**
 * 日程查询工具
 * 为 ChatLuna 提供日程查询能力
 */
import { z } from 'zod';
import type { Schedule, ScheduleConfig } from '../../../types';
export interface ScheduleToolDeps {
    scheduleConfig: ScheduleConfig;
    getSchedule: () => Schedule | null;
}
export declare function createScheduleTool(deps: ScheduleToolDeps): {
    name: string;
    description: string;
    schema: z.ZodObject<{
        query: z.ZodOptional<z.ZodEnum<["full", "current"]>>;
    }, "strip", z.ZodTypeAny, {
        query?: "full" | "current" | undefined;
    }, {
        query?: "full" | "current" | undefined;
    }>;
    _call(input: {
        query?: "full" | "current";
    }): Promise<string>;
    returnDirect: boolean;
    verboseParsingErrors: boolean;
    get lc_namespace(): string[];
    responseFormat?: import("@langchain/core/tools").ResponseFormat;
    defaultConfig?: import("@langchain/core/tools").ToolRunnableConfig;
    invoke<TInput extends any, TConfig extends import("@langchain/core/tools").ToolRunnableConfig | undefined>(input: TInput, config?: TConfig | undefined): Promise<any>;
    call<TArg extends any, TConfig extends import("@langchain/core/tools").ToolRunnableConfig | undefined>(arg: TArg, configArg?: TConfig | undefined, tags?: string[]): Promise<any>;
};
