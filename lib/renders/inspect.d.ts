import type { Context } from 'koishi';
interface InspectData {
    userId: string;
    nickname: string;
    platform: string;
    relation: string;
    compositeAffinity: number;
    longTermAffinity: number;
    shortTermAffinity: number;
    coefficient: number;
    streak: number;
    chatCount: number;
    lastInteraction: string;
    avatarUrl?: string;
    impression?: string;
}
export declare function createRenderInspect(ctx: Context): (data: InspectData) => Promise<Buffer | null>;
export {};
