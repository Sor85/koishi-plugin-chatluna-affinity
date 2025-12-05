/**
 * Session 辅助函数
 * 提供从 Koishi Session 对象中安全提取常用信息的工具
 */
import type { Session } from 'koishi';
interface SessionLike {
    channelId?: string;
    guildId?: string;
    platform?: string;
    userId?: string;
    selfId?: string;
    event?: {
        channel?: {
            id?: string;
        };
        guild?: {
            id?: string;
        };
        platform?: string;
        user?: {
            id?: string;
        };
        selfId?: string;
    };
    bot?: {
        platform?: string;
        selfId?: string;
    };
}
export declare function getChannelId(session: Session | SessionLike | null | undefined): string;
export declare function getGuildId(session: Session | SessionLike | null | undefined): string;
export declare function getPlatform(session: Session | SessionLike | null | undefined): string;
export declare function getUserId(session: Session | SessionLike | null | undefined): string;
export declare function getSelfId(session: Session | SessionLike | null | undefined): string;
export declare function makeUserKey(platform: string, userId: string): string;
export {};
