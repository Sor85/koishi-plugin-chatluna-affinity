/**
 * OneBot API 工具函数
 * 提供 OneBot 平台 API 调用的辅助函数
 */
import type { Session } from 'koishi';
export interface OneBotInternal {
    _request?: (action: string, params: Record<string, unknown>) => Promise<unknown>;
    [key: string]: unknown;
}
export declare function ensureOneBotSession(session: Session | null): {
    error?: string;
    session?: Session;
    internal?: OneBotInternal;
};
export declare function callOneBotAPI(internal: OneBotInternal, action: string, params: Record<string, unknown>, fallbacks?: string[]): Promise<unknown>;
