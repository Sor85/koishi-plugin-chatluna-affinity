/**
 * 成员信息辅助函数
 * 提供群成员信息获取、解析和渲染功能
 */
import type { Session } from 'koishi';
import type { MemberInfo, MemberInfoField, RenderMemberInfoOptions, GroupInfo, LogFn } from '../types';
export declare function translateGender(value: unknown): string;
export declare function collectNicknameCandidates(member: MemberInfo | null | undefined, userId: string, fallbackNames?: string[]): string[];
interface RenderFieldOptions {
    userId: string;
    fallbackNames?: string[];
    logUnknown?: boolean;
    log?: LogFn;
}
export declare function renderInfoField(fieldName: MemberInfoField, member: MemberInfo | null | undefined, session: Session | null | undefined, options: RenderFieldOptions): string | null;
export declare function renderMemberInfo(session: Session | null | undefined, member: MemberInfo | null | undefined, userId: string, configItems: string[] | undefined, options?: RenderMemberInfoOptions): string;
type FetchMemberFn = (session: Session, userId: string) => Promise<MemberInfo | null>;
export declare function resolveUserInfo(session: Session, configItems: string[] | undefined, fetchMemberFn: FetchMemberFn, options?: RenderMemberInfoOptions): Promise<string>;
export declare function resolveBotInfo(session: Session, configItems: string[] | undefined, fetchMemberFn: FetchMemberFn, options?: RenderMemberInfoOptions): Promise<string>;
export declare function normalizeGroupList(groups: GroupInfo[], options?: {
    includeMemberCount?: boolean;
    includeCreateTime?: boolean;
}): string;
export declare function fetchMember(session: Session, userId: string): Promise<MemberInfo | null>;
export declare function resolveUserIdentity(session: Session, input: string): Promise<{
    userId: string;
    nickname: string;
} | null>;
export declare function findMemberByName(session: Session, name: string, log?: LogFn): Promise<{
    userId: string;
    nickname: string;
} | null>;
export declare function resolveGroupId(session: Session): string;
export declare function fetchGroupMemberIds(session: Session, log?: LogFn): Promise<Set<string> | null>;
interface GroupListItem {
    group_id?: string;
    groupId?: string;
    id?: string;
    group_name?: string;
    groupName?: string;
    name?: string;
    member_count?: number;
    memberCount?: number;
    create_time?: number | string;
    createTime?: number | string;
}
export declare function fetchGroupList(session: Session, log?: LogFn): Promise<GroupListItem[] | null>;
export {};
