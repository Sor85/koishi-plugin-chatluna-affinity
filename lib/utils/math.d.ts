/**
 * 数学工具函数
 * 包含数值范围限制等函数
 */
export declare function clamp(value: number, min: number, max: number): number;
export declare function clampFloat(value: number, min: number, max: number): number;
export declare function isFiniteNumber(value: unknown): value is number;
export declare function roundTo(value: number, decimals: number): number;
