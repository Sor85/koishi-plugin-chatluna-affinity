/**
 * 排行榜渲染器
 * 渲染好感度排行榜图片
 */
import type { Context } from 'koishi';
import type { LogFn } from '../types';
export interface RankItem {
    rank: number;
    name: string;
    relation: string;
    affinity: number;
    avatarUrl?: string;
}
export declare function createRankListRenderer(ctx: Context, log?: LogFn): (title: string, items: RankItem[]) => Promise<Buffer | null>;
export type RankListRenderer = ReturnType<typeof createRankListRenderer>;
