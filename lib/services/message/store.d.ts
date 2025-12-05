/**
 * 消息存储
 * 提供带消息 ID 的消息存储，支持按内容或位置查找消息
 */
import type { Context, Session } from 'koishi';
import type { LogFn } from '../../types';
export interface StoredMessage {
    messageId: string;
    userId: string;
    username: string;
    content: string;
    timestamp: number;
}
export interface MessageStoreOptions {
    ctx: Context;
    log: LogFn;
    limit?: number;
}
export declare function createMessageStore(options: MessageStoreOptions): {
    record: (session: Session) => void;
    getMessages: (session: Session, count?: number) => StoredMessage[];
    findByLastN: (session: Session, lastN: number, userId?: string) => StoredMessage | null;
    findByContent: (session: Session, keyword: string, userId?: string) => StoredMessage | null;
    clear: (session: Session) => void;
};
export type MessageStore = ReturnType<typeof createMessageStore>;
