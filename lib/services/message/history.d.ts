/**
 * 消息历史记录
 * 提供会话级别的消息历史缓存和查询功能
 */
import type { Context, Session } from 'koishi';
import type { Config, LogFn } from '../../types';
export interface HistoryEntry {
    userId: string;
    username: string;
    content: string;
    timestamp: number;
}
export interface MessageHistoryOptions {
    ctx: Context;
    config: Config;
    log: LogFn;
}
export declare function createMessageHistory(options: MessageHistoryOptions): {
    record: (session: Session) => void;
    fetch: (session: Session) => Promise<string[]>;
    fetchEntries: (session: Session, count: number) => Promise<HistoryEntry[]>;
    clear: (session: Session) => void;
};
export type MessageHistory = ReturnType<typeof createMessageHistory>;
