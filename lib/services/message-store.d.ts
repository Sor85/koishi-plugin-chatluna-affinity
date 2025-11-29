import type { Context, Session } from 'koishi';
import type { LogFn } from '../types';
export interface StoredMessage {
    messageId: string;
    userId: string;
    username: string;
    content: string;
    timestamp: number;
}
export interface MessageStoreManager {
    record: (session: Session) => void;
    getMessages: (session: Session, count?: number) => StoredMessage[];
    findByLastN: (session: Session, lastN: number, userId?: string) => StoredMessage | null;
    findByContent: (session: Session, keyword: string, userId?: string) => StoredMessage | null;
}
export declare function createMessageStore(ctx: Context, log: LogFn, limit?: number): MessageStoreManager;
