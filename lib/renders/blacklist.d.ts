import type { Context } from 'koishi';
interface BlacklistItem {
    index: number;
    nickname: string;
    userId: string;
    timeInfo: string;
    note: string;
    avatarUrl?: string;
    isTemp?: boolean;
    penalty?: number;
}
export declare function createRenderBlacklist(ctx: Context): (title: string, items: BlacklistItem[]) => Promise<Buffer | null>;
export {};
