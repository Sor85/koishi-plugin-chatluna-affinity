/**
 * 渲染模块统一导出
 * 提供所有渲染器的创建函数和类型
 */
import type { Context } from 'koishi';
import type { LogFn } from '../types';
export * from './styles';
export * from './base';
export * from './rank-list';
export * from './inspect';
export * from './blacklist';
export * from './group-list';
export * from './schedule';
export * from './table';
export interface RenderServiceOptions {
    ctx: Context;
    log?: LogFn;
}
export declare function createRenderService(options: RenderServiceOptions): {
    rankList: (title: string, items: import("./rank-list").RankItem[]) => Promise<Buffer | null>;
    inspect: (data: import("./inspect").InspectData) => Promise<Buffer | null>;
    blacklist: (title: string, items: import("./blacklist").BlacklistItem[]) => Promise<Buffer | null>;
    groupList: (title: string, groups: import("./group-list").GroupItem[]) => Promise<Buffer | null>;
    schedule: (data: import("./schedule").ScheduleRenderData) => Promise<Buffer | null>;
    table: (title: string, headers: string[], rows: string[][], options?: import("./table").TableRenderOptions) => Promise<Buffer | null>;
};
export type RenderService = ReturnType<typeof createRenderService>;
