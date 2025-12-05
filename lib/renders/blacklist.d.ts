/**
 * 黑名单渲染器
 * 渲染黑名单列表图片
 */
import type { Context } from 'koishi';
import type { LogFn } from '../types';
export interface BlacklistItem {
    index: number;
    nickname: string;
    userId: string;
    timeInfo: string;
    note: string;
    avatarUrl?: string;
    isTemp?: boolean;
    penalty?: number;
}
export declare function createBlacklistRenderer(ctx: Context, log?: LogFn): (title: string, items: BlacklistItem[]) => Promise<Buffer | null>;
export type BlacklistRenderer = ReturnType<typeof createBlacklistRenderer>;
