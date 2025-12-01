import type { Context } from 'koishi';
interface RankItem {
    rank: number;
    name: string;
    relation: string;
    affinity: number;
    avatarUrl?: string;
}
export declare function createRenderRankList(ctx: Context): (title: string, items: RankItem[]) => Promise<Buffer | null>;
export {};
