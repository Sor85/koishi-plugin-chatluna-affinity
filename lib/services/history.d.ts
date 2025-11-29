import type { Context, Session } from 'koishi';
import type { Config, LogFn } from '../types';
export interface HistoryEntry {
    userId: string;
    username: string;
    content: string;
    timestamp: number;
}
export declare function createHistoryManager(ctx: Context, config: Config, log: LogFn): {
    fetch: (session: Session) => Promise<string[]>;
    fetchEntries: (session: Session, count: number) => Promise<HistoryEntry[]>;
};
