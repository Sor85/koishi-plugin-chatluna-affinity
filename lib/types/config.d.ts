/**
 * 配置相关类型定义
 * 包含插件配置及各子模块配置类型
 */
import type { BlacklistEntry, TemporaryBlacklistEntry, ShortTermBlacklistConfig } from './blacklist';
import type { ScheduleConfig } from './schedule-config';
export type { ScheduleConfig };
export interface BaseAffinityConfig {
    initialRandomMin: number;
    initialRandomMax: number;
    maxIncreasePerMessage: number;
    maxDecreasePerMessage: number;
}
export interface ContextAffinityOverviewConfig {
    variableName: string;
    messageWindow: number;
}
export interface ShortTermConfig {
    promoteThreshold: number;
    demoteThreshold: number;
    longTermPromoteStep: number;
    longTermDemoteStep: number;
    longTermStep?: number;
    resetBiasRange?: number;
}
export interface ActionWindowConfig {
    windowHours: number;
    increaseBonus: number;
    decreaseBonus: number;
    bonusChatThreshold: number;
    allowBonusOverflow: boolean;
    maxEntries: number;
}
export interface CoefficientConfig {
    base: number;
    maxDrop: number;
    maxBoost: number;
    decayPerDay: number;
    boostPerDay: number;
}
export interface AffinityDynamicsConfig {
    shortTerm?: Partial<ShortTermConfig>;
    actionWindow?: Partial<ActionWindowConfig>;
    coefficient?: Partial<CoefficientConfig>;
}
export interface RelationshipLevel {
    min: number;
    max: number;
    relation: string;
    note?: string;
}
export interface ManualRelationship {
    userId: string;
    relation: string;
    note?: string;
}
export interface UserInfoConfig {
    enabled?: boolean;
    variableName: string;
    items: string[];
}
export interface BotInfoConfig {
    enabled?: boolean;
    variableName: string;
    items: string[];
}
export interface GroupInfoConfig {
    enabled?: boolean;
    variableName: string;
    includeMemberCount: boolean;
    includeCreateTime: boolean;
}
export interface RandomConfig {
    enabled?: boolean;
    variableName: string;
    min?: number;
    max?: number;
}
export interface PanSouToolConfig {
    enablePanSouTool: boolean;
    panSouToolName: string;
    panSouApiUrl: string;
    panSouAuthEnabled: boolean;
    panSouUsername: string;
    panSouPassword: string;
    panSouDefaultCloudTypes: string[];
    panSouMaxResults: number;
}
export interface OtherVariablesConfig {
    userInfo?: UserInfoConfig;
    botInfo?: BotInfoConfig;
    groupInfo?: GroupInfoConfig;
    random?: RandomConfig;
}
export interface Config {
    affinityVariableName: string;
    contextAffinityOverview: ContextAffinityOverviewConfig;
    baseAffinityConfig: BaseAffinityConfig;
    initialRandomMin: number;
    initialRandomMax: number;
    model: string;
    analysisPrompt: string;
    maxIncreasePerMessage: number;
    maxDecreasePerMessage: number;
    affinityDynamics: AffinityDynamicsConfig;
    enableAnalysis: boolean;
    enableAutoBlacklist: boolean;
    blacklistThreshold: number;
    blacklistLogInterception: boolean;
    autoBlacklistReply: string;
    autoBlacklist: BlacklistEntry[];
    temporaryBlacklist: TemporaryBlacklistEntry[];
    shortTermBlacklist: ShortTermBlacklistConfig;
    debugLogging: boolean;
    triggerNicknames: string[];
    historyMessageCount: number;
    personaSource: 'none' | 'chatluna' | 'custom';
    personaChatlunaPreset: string;
    personaCustomPreset: string;
    userInfo: UserInfoConfig;
    botInfo: BotInfoConfig;
    groupInfo: GroupInfoConfig;
    enablePokeTool: boolean;
    pokeToolName: string;
    enableSetSelfProfileTool: boolean;
    setSelfProfileToolName: string;
    enableDeleteMessageTool: boolean;
    deleteMessageToolName: string;
    random: RandomConfig;
    relationshipVariableName: string;
    relationships: ManualRelationship[];
    relationshipAffinityLevels: RelationshipLevel[];
    registerAffinityTool: boolean;
    affinityToolName: string;
    registerBlacklistTool: boolean;
    blacklistToolName: string;
    registerRelationshipTool: boolean;
    relationshipToolName: string;
    rankDefaultLimit: number;
    rankRenderAsImage: boolean;
    blacklistDefaultLimit: number;
    blacklistRenderAsImage: boolean;
    schedule: ScheduleConfig;
    panSouTool: PanSouToolConfig;
    otherVariables?: OtherVariablesConfig;
    groupListRenderAsImage?: boolean;
    inspectRenderAsImage?: boolean;
}
