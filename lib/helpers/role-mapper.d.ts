/**
 * 角色映射工具
 * 将各种平台的角色标识转换为统一的中文角色名称
 */
import type { Session } from 'koishi';
import type { RoleTranslation, LogFn } from '../types';
export declare function translateRole(value: unknown): RoleTranslation;
interface WithRole {
    role?: unknown;
    roleName?: unknown;
    permission?: unknown;
    permissions?: unknown;
    title?: unknown;
    identity?: unknown;
    type?: unknown;
    level?: unknown;
    status?: unknown;
    roles?: unknown;
    member?: unknown;
    author?: unknown;
    event?: {
        member?: unknown;
        sender?: unknown;
        operator?: unknown;
        self?: unknown;
        bot?: unknown;
    };
    payload?: {
        sender?: unknown;
    };
    user?: unknown;
    self?: unknown;
    bot?: {
        user?: unknown;
    };
}
export declare function collectRoleCandidates(session: WithRole | null | undefined, member: unknown): unknown[];
interface ResolveRoleLabelOptions {
    logUnknown?: boolean;
    logger?: LogFn;
}
export declare function resolveRoleLabel(session: Session | null | undefined, member: unknown, options?: ResolveRoleLabelOptions): string;
export declare function getRoleDisplay(role: string): string;
export {};
