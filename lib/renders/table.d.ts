/**
 * 表格渲染器
 * 渲染通用表格图片
 */
import type { Context } from 'koishi';
import type { LogFn } from '../types';
export interface TableRenderOptions {
    heading?: string;
    subHeading?: string;
}
export declare function createTableRenderer(ctx: Context, log?: LogFn): (title: string, headers: string[], rows: string[][], options?: TableRenderOptions) => Promise<Buffer | null>;
export type TableRenderer = ReturnType<typeof createTableRenderer>;
