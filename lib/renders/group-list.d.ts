import type { Context } from 'koishi';
interface GroupItem {
    groupId: string;
    groupName: string;
    memberCount?: number;
    createTime?: string;
}
export declare function createRenderGroupList(ctx: Context): (title: string, groups: GroupItem[]) => Promise<Buffer | null>;
export {};
