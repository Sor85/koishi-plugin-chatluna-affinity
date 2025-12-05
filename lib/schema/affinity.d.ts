/**
 * 好感度 Schema
 * 定义好感度相关的配置项
 */
import { Schema } from 'koishi';
export declare const AffinitySchema: Schema<Schemastery.ObjectS<{
    affinityVariableName: Schema<string, string>;
    contextAffinityOverview: Schema<Schemastery.ObjectS<{
        variableName: Schema<string, string>;
        messageWindow: Schema<number, number>;
    }>, Schemastery.ObjectT<{
        variableName: Schema<string, string>;
        messageWindow: Schema<number, number>;
    }>>;
    baseAffinityConfig: Schema<Schemastery.ObjectS<{
        initialRandomMin: Schema<number, number>;
        initialRandomMax: Schema<number, number>;
        maxIncreasePerMessage: Schema<number, number>;
        maxDecreasePerMessage: Schema<number, number>;
    }>, Schemastery.ObjectT<{
        initialRandomMin: Schema<number, number>;
        initialRandomMax: Schema<number, number>;
        maxIncreasePerMessage: Schema<number, number>;
        maxDecreasePerMessage: Schema<number, number>;
    }>>;
    affinityDynamics: Schema<Schemastery.ObjectS<{
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
    }>, Schemastery.ObjectT<{
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
    }>>;
    model: Schema<any, any>;
    enableAnalysis: Schema<boolean, boolean>;
    historyMessageCount: Schema<number, number>;
    rankRenderAsImage: Schema<boolean, boolean>;
    rankDefaultLimit: Schema<number, number>;
    triggerNicknames: Schema<string[], string[]>;
    analysisPrompt: Schema<string, string>;
    personaSource: Schema<"none" | "chatluna" | "custom", "none" | "chatluna" | "custom">;
    personaChatlunaPreset: Schema<any, any>;
    personaCustomPreset: Schema<string, string>;
    registerAffinityTool: Schema<boolean, boolean>;
    affinityToolName: Schema<string, string>;
}>, Schemastery.ObjectT<{
    affinityVariableName: Schema<string, string>;
    contextAffinityOverview: Schema<Schemastery.ObjectS<{
        variableName: Schema<string, string>;
        messageWindow: Schema<number, number>;
    }>, Schemastery.ObjectT<{
        variableName: Schema<string, string>;
        messageWindow: Schema<number, number>;
    }>>;
    baseAffinityConfig: Schema<Schemastery.ObjectS<{
        initialRandomMin: Schema<number, number>;
        initialRandomMax: Schema<number, number>;
        maxIncreasePerMessage: Schema<number, number>;
        maxDecreasePerMessage: Schema<number, number>;
    }>, Schemastery.ObjectT<{
        initialRandomMin: Schema<number, number>;
        initialRandomMax: Schema<number, number>;
        maxIncreasePerMessage: Schema<number, number>;
        maxDecreasePerMessage: Schema<number, number>;
    }>>;
    affinityDynamics: Schema<Schemastery.ObjectS<{
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
    }>, Schemastery.ObjectT<{
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
    }>>;
    model: Schema<any, any>;
    enableAnalysis: Schema<boolean, boolean>;
    historyMessageCount: Schema<number, number>;
    rankRenderAsImage: Schema<boolean, boolean>;
    rankDefaultLimit: Schema<number, number>;
    triggerNicknames: Schema<string[], string[]>;
    analysisPrompt: Schema<string, string>;
    personaSource: Schema<"none" | "chatluna" | "custom", "none" | "chatluna" | "custom">;
    personaChatlunaPreset: Schema<any, any>;
    personaCustomPreset: Schema<string, string>;
    registerAffinityTool: Schema<boolean, boolean>;
    affinityToolName: Schema<string, string>;
}>>;
