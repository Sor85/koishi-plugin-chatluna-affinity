import { Schema } from 'koishi';
import type { BaseAffinityConfig } from './types';
export declare const name = "chatluna-affinity";
export declare const inject: {
    required: string[];
    optional: string[];
};
export declare const defaultMemberInfoItems: MemberInfoItem[];
type MemberInfoItem = 'nickname' | 'userId' | 'role' | 'level' | 'title' | 'gender' | 'age' | 'area' | 'joinTime' | 'lastSentTime';
export declare const baseAffinityDefaults: BaseAffinityConfig;
export declare const Config: Schema<{
    affinityVariableName?: string | null | undefined;
    contextAffinityOverview?: ({
        variableName?: string | null | undefined;
        messageWindow?: number | null | undefined;
    } & import("koishi").Dict) | null | undefined;
    baseAffinityConfig?: ({
        initialRandomMin?: number | null | undefined;
        initialRandomMax?: number | null | undefined;
        min?: number | null | undefined;
        max?: number | null | undefined;
        maxIncreasePerMessage?: number | null | undefined;
        maxDecreasePerMessage?: number | null | undefined;
    } & import("koishi").Dict) | null | undefined;
    affinityDynamics?: ({
        shortTerm?: ({
            promoteThreshold?: number | null | undefined;
            demoteThreshold?: number | null | undefined;
            longTermPromoteStep?: number | null | undefined;
            longTermDemoteStep?: number | null | undefined;
        } & import("koishi").Dict) | null | undefined;
        actionWindow?: ({
            windowHours?: number | null | undefined;
            increaseBonus?: number | null | undefined;
            decreaseBonus?: number | null | undefined;
            bonusChatThreshold?: number | null | undefined;
            allowBonusOverflow?: boolean | null | undefined;
            maxEntries?: number | null | undefined;
        } & import("koishi").Dict) | null | undefined;
        coefficient?: ({
            base?: number | null | undefined;
            maxDrop?: number | null | undefined;
            maxBoost?: number | null | undefined;
            decayPerDay?: number | null | undefined;
            boostPerDay?: number | null | undefined;
        } & import("koishi").Dict) | null | undefined;
    } & import("koishi").Dict) | null | undefined;
    model?: any;
    enableAnalysis?: boolean | null | undefined;
    historyMessageCount?: number | null | undefined;
    rankRenderAsImage?: boolean | null | undefined;
    rankDefaultLimit?: number | null | undefined;
    triggerNicknames?: string[] | null | undefined;
    analysisPrompt?: string | null | undefined;
    personaSource?: "none" | "chatluna" | "custom" | null | undefined;
    personaChatlunaPreset?: any;
    personaCustomPreset?: string | null | undefined;
    registerAffinityTool?: boolean | null | undefined;
    affinityToolName?: string | null | undefined;
} & import("koishi").Dict & {
    enableAutoBlacklist?: boolean | null | undefined;
    blacklistThreshold?: number | null | undefined;
    blacklistLogInterception?: boolean | null | undefined;
    shortTermBlacklist?: ({
        enabled?: boolean | null | undefined;
        windowHours?: number | null | undefined;
        decreaseThreshold?: number | null | undefined;
        durationHours?: number | null | undefined;
        penalty?: number | null | undefined;
    } & import("koishi").Dict) | null | undefined;
    autoBlacklist?: ({
        userId?: string | null | undefined;
        nickname?: string | null | undefined;
        blockedAt?: string | null | undefined;
        note?: string | null | undefined;
        platform?: string | null | undefined;
    } & import("koishi").Dict)[] | null | undefined;
    temporaryBlacklist?: ({
        userId?: string | null | undefined;
        nickname?: string | null | undefined;
        blockedAt?: string | null | undefined;
        expiresAt?: string | null | undefined;
        durationHours?: string | null | undefined;
        penalty?: string | null | undefined;
        note?: string | null | undefined;
        platform?: string | null | undefined;
    } & import("koishi").Dict)[] | null | undefined;
    blacklistDefaultLimit?: number | null | undefined;
    blacklistRenderAsImage?: boolean | null | undefined;
    registerBlacklistTool?: boolean | null | undefined;
    blacklistToolName?: string | null | undefined;
} & {
    relationshipVariableName?: string | null | undefined;
    relationships?: ({
        initialAffinity?: number | null | undefined;
        userId?: string | null | undefined;
        relation?: string | null | undefined;
        note?: string | null | undefined;
    } & import("koishi").Dict)[] | null | undefined;
    relationshipAffinityLevels?: ({
        min?: number | null | undefined;
        max?: number | null | undefined;
        relation?: string | null | undefined;
        note?: string | null | undefined;
    } & import("koishi").Dict)[] | null | undefined;
    registerRelationshipTool?: boolean | null | undefined;
    relationshipToolName?: string | null | undefined;
} & {
    userInfo?: ({
        variableName?: string | null | undefined;
        items?: ("nickname" | "userId" | "role" | "level" | "title" | "gender" | "age" | "area" | "joinTime" | "lastSentTime")[] | null | undefined;
    } & import("koishi").Dict) | null | undefined;
    botInfo?: ({
        variableName?: string | null | undefined;
        items?: ("nickname" | "userId" | "role" | "level" | "title" | "gender" | "age" | "area" | "joinTime" | "lastSentTime")[] | null | undefined;
    } & import("koishi").Dict) | null | undefined;
    groupInfo?: ({
        variableName?: string | null | undefined;
        includeMemberCount?: boolean | null | undefined;
        includeCreateTime?: boolean | null | undefined;
    } & import("koishi").Dict) | null | undefined;
    random?: ({
        variableName?: string | null | undefined;
        min?: number | null | undefined;
        max?: number | null | undefined;
    } & import("koishi").Dict) | null | undefined;
} & {
    schedule?: ({
        enabled?: boolean | null | undefined;
        variableName?: string | null | undefined;
        currentVariableName?: string | null | undefined;
        timezone?: string | null | undefined;
        prompt?: string | null | undefined;
        renderAsImage?: boolean | null | undefined;
        startDelay?: number | null | undefined;
        registerTool?: boolean | null | undefined;
        toolName?: string | null | undefined;
    } & import("koishi").Dict) | null | undefined;
} & {
    debugLogging?: boolean | null | undefined;
} & {
    enablePokeTool?: boolean | null | undefined;
    pokeToolName?: string | null | undefined;
    enableSetSelfProfileTool?: boolean | null | undefined;
    setSelfProfileToolName?: string | null | undefined;
    enableDeleteMessageTool?: boolean | null | undefined;
    deleteMessageToolName?: string | null | undefined;
}, {
    affinityVariableName: string;
    contextAffinityOverview: Schemastery.ObjectT<{
        variableName: Schema<string, string>;
        messageWindow: Schema<number, number>;
    }>;
    baseAffinityConfig: Schemastery.ObjectT<{
        initialRandomMin: Schema<number, number>;
        initialRandomMax: Schema<number, number>;
        min: Schema<number, number>;
        max: Schema<number, number>;
        maxIncreasePerMessage: Schema<number, number>;
        maxDecreasePerMessage: Schema<number, number>;
    }>;
    affinityDynamics: Schemastery.ObjectT<{
        shortTerm: Schema<Schemastery.ObjectS<{
            promoteThreshold: Schema<number, number>;
            demoteThreshold: Schema<number, number>;
            longTermPromoteStep: Schema<number, number>;
            longTermDemoteStep: Schema<number, number>;
        }>, Schemastery.ObjectT<{
            promoteThreshold: Schema<number, number>;
            demoteThreshold: Schema<number, number>;
            longTermPromoteStep: Schema<number, number>;
            longTermDemoteStep: Schema<number, number>;
        }>>;
        actionWindow: Schema<Schemastery.ObjectS<{
            windowHours: Schema<number, number>;
            increaseBonus: Schema<number, number>;
            decreaseBonus: Schema<number, number>;
            bonusChatThreshold: Schema<number, number>;
            allowBonusOverflow: Schema<boolean, boolean>;
            maxEntries: Schema<number, number>;
        }>, Schemastery.ObjectT<{
            windowHours: Schema<number, number>;
            increaseBonus: Schema<number, number>;
            decreaseBonus: Schema<number, number>;
            bonusChatThreshold: Schema<number, number>;
            allowBonusOverflow: Schema<boolean, boolean>;
            maxEntries: Schema<number, number>;
        }>>;
        coefficient: Schema<Schemastery.ObjectS<{
            base: Schema<number, number>;
            maxDrop: Schema<number, number>;
            maxBoost: Schema<number, number>;
            decayPerDay: Schema<number, number>;
            boostPerDay: Schema<number, number>;
        }>, Schemastery.ObjectT<{
            base: Schema<number, number>;
            maxDrop: Schema<number, number>;
            maxBoost: Schema<number, number>;
            decayPerDay: Schema<number, number>;
            boostPerDay: Schema<number, number>;
        }>>;
    }>;
    model: any;
    enableAnalysis: boolean;
    historyMessageCount: number;
    rankRenderAsImage: boolean;
    rankDefaultLimit: number;
    triggerNicknames: string[];
    analysisPrompt: string;
    personaSource: "none" | "chatluna" | "custom";
    personaChatlunaPreset: any;
    personaCustomPreset: string;
    registerAffinityTool: boolean;
    affinityToolName: string;
} & import("koishi").Dict & {
    enableAutoBlacklist: boolean;
    blacklistThreshold: number;
    blacklistLogInterception: boolean;
    shortTermBlacklist: Schemastery.ObjectT<{
        enabled: Schema<boolean, boolean>;
        windowHours: Schema<number, number>;
        decreaseThreshold: Schema<number, number>;
        durationHours: Schema<number, number>;
        penalty: Schema<number, number>;
    }>;
    autoBlacklist: Schemastery.ObjectT<{
        userId: Schema<string, string>;
        nickname: Schema<string, string>;
        blockedAt: Schema<string, string>;
        note: Schema<string, string>;
        platform: Schema<string, string>;
    }>[];
    temporaryBlacklist: Schemastery.ObjectT<{
        userId: Schema<string, string>;
        nickname: Schema<string, string>;
        blockedAt: Schema<string, string>;
        expiresAt: Schema<string, string>;
        durationHours: Schema<string, string>;
        penalty: Schema<string, string>;
        note: Schema<string, string>;
        platform: Schema<string, string>;
    }>[];
    blacklistDefaultLimit: number;
    blacklistRenderAsImage: boolean;
    registerBlacklistTool: boolean;
    blacklistToolName: string;
} & {
    relationshipVariableName: string;
    relationships: Schemastery.ObjectT<{
        initialAffinity: Schema<number, number>;
        userId: Schema<string, string>;
        relation: Schema<string, string>;
        note: Schema<string, string>;
    }>[];
    relationshipAffinityLevels: Schemastery.ObjectT<{
        min: Schema<number, number>;
        max: Schema<number, number>;
        relation: Schema<string, string>;
        note: Schema<string, string>;
    }>[];
    registerRelationshipTool: boolean;
    relationshipToolName: string;
} & {
    userInfo: Schemastery.ObjectT<{
        variableName: Schema<string, string>;
        items: Schema<("nickname" | "userId" | "role" | "level" | "title" | "gender" | "age" | "area" | "joinTime" | "lastSentTime")[], ("nickname" | "userId" | "role" | "level" | "title" | "gender" | "age" | "area" | "joinTime" | "lastSentTime")[]>;
    }>;
    botInfo: Schemastery.ObjectT<{
        variableName: Schema<string, string>;
        items: Schema<("nickname" | "userId" | "role" | "level" | "title" | "gender" | "age" | "area" | "joinTime" | "lastSentTime")[], ("nickname" | "userId" | "role" | "level" | "title" | "gender" | "age" | "area" | "joinTime" | "lastSentTime")[]>;
    }>;
    groupInfo: Schemastery.ObjectT<{
        variableName: Schema<string, string>;
        includeMemberCount: Schema<boolean, boolean>;
        includeCreateTime: Schema<boolean, boolean>;
    }>;
    random: Schemastery.ObjectT<{
        variableName: Schema<string, string>;
        min: Schema<number, number>;
        max: Schema<number, number>;
    }>;
} & {
    schedule: Schemastery.ObjectT<{
        enabled: Schema<boolean, boolean>;
        variableName: Schema<string, string>;
        currentVariableName: Schema<string, string>;
        timezone: Schema<string, string>;
        prompt: Schema<string, string>;
        renderAsImage: Schema<boolean, boolean>;
        startDelay: Schema<number, number>;
        registerTool: Schema<boolean, boolean>;
        toolName: Schema<string, string>;
    }>;
} & {
    debugLogging: boolean;
} & {
    enablePokeTool: boolean;
    pokeToolName: string;
    enableSetSelfProfileTool: boolean;
    setSelfProfileToolName: string;
    enableDeleteMessageTool: boolean;
    deleteMessageToolName: string;
}>;
export {};
