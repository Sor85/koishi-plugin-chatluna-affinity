/**
 * 群列表渲染器
 * 渲染群聊列表图片
 */
import type { Context } from 'koishi';
import type { LogFn } from '../types';
export interface GroupItem {
    groupId: string;
    groupName: string;
    memberCount?: number;
    createTime?: string;
}
export declare function createGroupListRenderer(ctx: Context, log?: LogFn): (title: string, groups: GroupItem[]) => Promise<Buffer | null>;
export type GroupListRenderer = ReturnType<typeof createGroupListRenderer>;
