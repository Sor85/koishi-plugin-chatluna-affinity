/**
 * 详情渲染器
 * 渲染好感度详情卡片图片
 */
import type { Context } from 'koishi';
import type { LogFn } from '../types';
export interface InspectData {
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
export declare function createInspectRenderer(ctx: Context, log?: LogFn): (data: InspectData) => Promise<Buffer | null>;
export type InspectRenderer = ReturnType<typeof createInspectRenderer>;
