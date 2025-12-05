/**
 * 字符串工具函数
 * 包含前缀处理、清理等函数
 */
export declare function stripAtPrefix(text: string | unknown): string;
export declare function sanitizeChannel(value: unknown): string;
export declare function pickFirst<T>(...values: (T | undefined | null)[]): T | undefined;
export declare function truncate(text: string, maxLength: number, suffix?: string): string;
export declare function escapeHtml(text: string): string;
