/**
 * 好感度计算器
 * 提供短期/长期好感度、动作窗口、系数等配置解析和计算函数
 */
import type { Config, ActionType, ActionEntry, ResolvedShortTermConfig, ResolvedActionWindowConfig, ResolvedCoefficientConfig, CoefficientResult, SummarizedActions, CombinedState } from '../../types';
export declare function resolveShortTermConfig(config: Config): ResolvedShortTermConfig;
export declare function resolveActionWindowConfig(config: Config): ResolvedActionWindowConfig;
export declare function resolveCoefficientConfig(config: Config): ResolvedCoefficientConfig;
export declare function summarizeActionEntries(rawEntries: ActionEntry[] | undefined, windowMs: number, nowMs: number): SummarizedActions;
export declare function appendActionEntry(entries: ActionEntry[] | undefined, action: ActionType | string, nowMs: number, maxEntries: number): ActionEntry[];
export declare function computeShortTermReset(): number;
export declare function computeDailyStreak(previousStreak: number | undefined, lastInteractionAt: Date | null | undefined, now: Date): number;
export declare function computeCoefficientValue(coefConfig: ResolvedCoefficientConfig, streak: number, lastInteractionAt: Date | null | undefined, now: Date, todayIncreaseCount?: number, todayDecreaseCount?: number): CoefficientResult;
export declare function composeState(longTerm: number, shortTerm: number, clampFn: (value: number) => number): CombinedState;
export declare function formatActionCounts(counts: {
    increase?: number;
    decrease?: number;
    hold?: number;
}): string;
