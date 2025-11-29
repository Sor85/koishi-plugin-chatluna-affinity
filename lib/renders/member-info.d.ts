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
export {};
