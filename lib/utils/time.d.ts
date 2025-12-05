/**
 * 时间工具函数
 * 包含时间格式化、时间戳处理等函数
 */
export declare function normalizeTimestamp(value: unknown): number | null;
export declare function formatTimestamp(value: unknown): string;
export declare function formatBeijingTimestamp(date: Date): string;
export declare function formatDateOnly(value: unknown): string;
export declare function formatDateTime(value: unknown): string;
export declare function toDate(value: unknown): Date | null;
export declare function dayNumber(date: Date): number;
export declare function getDateString(date: Date, timezone?: string): string;
export declare function getTimeString(date: Date, timezone?: string): string;
