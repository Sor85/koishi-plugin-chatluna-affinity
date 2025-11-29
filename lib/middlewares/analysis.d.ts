import type { Context, Session } from 'koishi';
import type { Config, AffinityStore, AffinityCache, LogFn, TemporaryBlacklistManager, ShortTermOptions, AnalysisMiddlewareResult } from '../types';
interface MiddlewareDeps {
    store: AffinityStore;
    history: {
        fetch: (session: Session) => Promise<string[]>;
    };
    cache: AffinityCache;
    getModel: () => {
        invoke?: (prompt: string) => Promise<{
            content?: unknown;
        }>;
    } | null;
    renderTemplate: (template: string, variables: Record<string, unknown>) => string;
    getMessageContent: (content: unknown) => string;
    log: LogFn;
    resolvePersonaPreset: (session: Session) => string;
    temporaryBlacklist: TemporaryBlacklistManager;
    shortTermOptions: ShortTermOptions;
}
export declare function createAnalysisMiddleware(ctx: Context, config: Config, deps: MiddlewareDeps): AnalysisMiddlewareResult;
export {};
