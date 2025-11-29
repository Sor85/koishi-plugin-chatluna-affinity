import type { Session } from 'koishi';
import type { Config, AffinityStore, AffinityState, LogFn, ResolvedShortTermConfig, ResolvedActionWindowConfig, SummarizedActions, CoefficientResult, TemporaryBlacklistManager } from '../types';
interface ValidationContext {
    store: AffinityStore;
    temporaryBlacklist: TemporaryBlacklistManager;
    shortTermConfig: {
        enabled: boolean;
    };
    log: LogFn;
    debugEnabled: boolean;
}
interface ValidationResult {
    valid: boolean;
    reason?: string;
}
export declare function validateAnalysisContext(session: Session | null | undefined, config: Config, context: ValidationContext): ValidationResult;
interface PrepareAnalysisDataContext {
    store: AffinityStore;
    history: {
        fetch: (session: Session) => Promise<string[]>;
    };
    resolvePersonaPreset: (session: Session) => string;
    log: LogFn;
    debugEnabled: boolean;
}
interface AnalysisData {
    result: AffinityState;
    historyLines: string[];
    personaText: string;
    now: Date;
}
export declare function prepareAnalysisData(session: Session, config: Config, context: PrepareAnalysisDataContext): Promise<AnalysisData>;
interface BuildPromptData {
    result: AffinityState;
    historyLines: string[];
    personaText: string;
    windowChatCount: number;
    actionCountsText: string;
    nextCoefficientState: CoefficientResult;
    shortTermRules: ResolvedShortTermConfig;
    maxIncreaseLimit: number;
    maxDecreaseLimit: number;
    actionWindow: ResolvedActionWindowConfig;
    summarizedActions: SummarizedActions;
    session: Session;
    botReply: string;
}
interface RenderTemplateFn {
    (template: string, variables: Record<string, unknown>): string;
}
export declare function buildPrompt(config: Config, data: BuildPromptData, deps: {
    renderTemplate: RenderTemplateFn;
}): string;
interface ParseModelResponseOptions {
    maxIncreaseLimit: number;
    maxDecreaseLimit: number;
    log: LogFn;
    debugEnabled: boolean;
    nickname: string;
    session: Session;
}
interface ParsedResponse {
    delta: number;
    action: string;
    reason: string;
}
export declare function parseModelResponse(text: unknown, _config: Config, options: ParseModelResponseOptions): ParsedResponse;
interface ApplyAffinityChangesData {
    actionWindow: ResolvedActionWindowConfig;
    shortTermRules: ResolvedShortTermConfig;
    store: AffinityStore;
    summarizedActions: SummarizedActions;
    maxIncreaseLimit: number;
    maxDecreaseLimit: number;
}
interface AffinityChangesResult {
    appliedDelta: number;
    actionType: 'increase' | 'decrease' | 'hold';
    workingShortTerm: number;
    longTermTarget: number;
    longTermShift: number;
    longTermChanged: boolean;
    extraFromHistory: number;
    positiveBonus: number;
    negativeBonus: number;
}
export declare function applyAffinityChanges(delta: number, result: AffinityState, _config: Config, data: ApplyAffinityChangesData): AffinityChangesResult;
interface HandleTemporaryBlacklistData {
    shortTermConfig: {
        enabled: boolean;
        windowMs: number;
        decreaseThreshold: number;
        penalty: number;
    };
    temporaryBlacklist: TemporaryBlacklistManager;
    store: AffinityStore;
    log: LogFn;
    debugEnabled: boolean;
    nickname: string;
    now: Date;
    shortTermTriggerMap: Map<string, number[]>;
    longTermTarget: number;
    longTermShift: number;
    longTermChanged: boolean;
}
interface TemporaryBlacklistResult {
    temporaryBlockTriggered: boolean;
    temporaryBlockExpiresAt: number | null;
    temporaryPenaltyApplied: number;
    longTermTarget: number;
    longTermShift: number;
    longTermChanged: boolean;
}
export declare function handleTemporaryBlacklist(actionType: 'increase' | 'decrease' | 'hold', session: Session, data: HandleTemporaryBlacklistData): TemporaryBlacklistResult;
export {};
