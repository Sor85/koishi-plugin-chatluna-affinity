import type { Session } from 'koishi';
export interface AffinityRecord {
    id: string;
    platform: string;
    selfId: string | null;
    userId: string;
    nickname: string | null;
    affinity: number;
    affinityInited: boolean;
    relation: string | null;
    shortTermAffinity: number | null;
    longTermAffinity: number | null;
    shortTermUpdatedAt: Date | null;
    longTermUpdatedAt: Date | null;
    updatedAt: Date | null;
    relationUpdatedAt: Date | null;
    chatCount: number | null;
    actionStats: string | null;
    lastInteractionAt: Date | null;
    coefficientState: string | null;
    affinityOverride?: number;
}
export interface ActionEntry {
    action: ActionType;
    timestamp: number;
}
export interface ActionStats {
    total: number;
    counts: ActionCounts;
    entries: ActionEntry[];
}
export interface ActionCounts {
    increase: number;
    decrease: number;
    hold: number;
}
export type ActionType = 'increase' | 'decrease' | 'hold';
export interface CoefficientState {
    streak: number;
    coefficient: number;
    decayPenalty: number;
    streakBoost: number;
    inactivityDays: number;
    lastInteractionAt: Date | null;
}
export interface CombinedState {
    affinity: number;
    longTermAffinity: number;
    shortTermAffinity: number;
}
export interface InitialRange {
    low: number;
    high: number;
    min: number;
    max: number;
}
export interface BaseAffinityConfig {
    initialRandomMin: number;
    initialRandomMax: number;
    min: number;
    max: number;
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
    initialAffinity: number | null;
    userId: string;
    relation: string;
    note?: string;
}
export interface BlacklistEntry {
    platform: string;
    userId: string;
    blockedAt: string;
    nickname?: string;
    note: string;
    channelId?: string;
}
export interface TemporaryBlacklistEntry {
    platform: string;
    userId: string;
    blockedAt: string;
    expiresAt: string;
    nickname?: string;
    note: string;
    channelId?: string;
    durationHours: number | string;
    penalty: number | string;
}
export interface ShortTermBlacklistConfig {
    enabled: boolean;
    windowHours?: number;
    decreaseThreshold?: number;
    durationHours?: number;
    penalty?: number;
}
export interface ScheduleConfig {
    enabled: boolean;
    variableName: string;
    currentVariableName: string;
    timezone: string;
    registerTool: boolean;
    renderAsImage: boolean;
    startDelay: number;
    toolName: string;
    prompt: string;
    title?: string;
}
export interface UserInfoConfig {
    variableName: string;
    items: string[];
}
export interface BotInfoConfig {
    variableName: string;
    items: string[];
}
export interface GroupInfoConfig {
    variableName: string;
    includeMemberCount: boolean;
    includeCreateTime: boolean;
}
export interface RandomConfig {
    variableName: string;
    min?: number;
    max?: number;
}
export interface Config {
    affinityVariableName: string;
    contextAffinityOverview: ContextAffinityOverviewConfig;
    baseAffinityConfig: BaseAffinityConfig;
    initialRandomMin: number;
    initialRandomMax: number;
    min: number;
    max: number;
    model: string;
    analysisPrompt: string;
    maxIncreasePerMessage: number;
    maxDecreasePerMessage: number;
    affinityDynamics: AffinityDynamicsConfig;
    enableAnalysis: boolean;
    enableAutoBlacklist: boolean;
    blacklistThreshold: number;
    blacklistLogInterception: boolean;
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
    otherVariables?: {
        userInfo?: UserInfoConfig;
        botInfo?: BotInfoConfig;
        groupInfo?: GroupInfoConfig;
        random?: RandomConfig;
    };
}
export interface AffinityState {
    affinity: number;
    longTermAffinity: number;
    shortTermAffinity: number;
    updatedAt: Date;
    shortTermUpdatedAt: Date;
    longTermUpdatedAt: Date;
    chatCount: number;
    actionStats: ActionStats;
    lastInteractionAt: Date | null;
    coefficientState: CoefficientState;
    isNew?: boolean;
}
export interface SessionSeed {
    platform?: string;
    userId?: string;
    selfId?: string;
    nickname?: string;
    authorNickname?: string;
    session?: Session;
}
export interface AffinityStore {
    clamp: (value: number) => number;
    save: (seed: SessionSeed, value: number, inited?: boolean, relation?: string, extra?: Partial<SaveExtra>) => Promise<AffinityRecord | null>;
    load: (platform: string, userId: string) => Promise<AffinityRecord | null>;
    ensure: (session: Session, clampFn: ClampFn, fallbackInitial?: number) => Promise<AffinityState>;
    resolveLevelByAffinity: (value: number) => RelationshipLevel | null;
    resolveLevelByRelation: (relationName: string) => RelationshipLevel | null;
    findManualRelationship: (platform: string, userId: string) => ManualRelationship | null;
    updateRelationshipConfig: (userId: string, relationName: string, affinityValue?: number) => void;
    recordBlacklist: (platform: string, userId: string, detail?: BlacklistDetail) => BlacklistEntry | null;
    removeBlacklist: (platform: string, userId: string, channelId?: string) => boolean;
    listBlacklist: (platform?: string, channelId?: string) => BlacklistEntry[];
    isBlacklisted: (platform: string, userId: string, channelId?: string) => boolean;
    recordTemporaryBlacklist: (platform: string, userId: string, durationHours: number, penalty: number, detail?: BlacklistDetail) => TemporaryBlacklistEntry | null;
    removeTemporaryBlacklist: (platform: string, userId: string) => boolean;
    listTemporaryBlacklist: (platform?: string) => TemporaryBlacklistEntry[];
    isTemporarilyBlacklisted: (platform: string, userId: string) => TemporaryBlacklistEntry | null;
    defaultInitial: () => number;
    randomInitial: () => number;
    initialRange: () => InitialRange;
    composeState: (longTerm: number, shortTerm: number) => CombinedState;
    createInitialState: (base: number) => CombinedState;
    extractState: (record: AffinityRecord | null) => AffinityState;
}
export interface SaveExtra {
    longTermAffinity?: number;
    shortTermAffinity?: number;
    shortTermUpdatedAt?: Date;
    longTermUpdatedAt?: Date;
    chatCount?: number;
    actionStats?: ActionStats;
    coefficientState?: CoefficientState;
    lastInteractionAt?: Date;
    affinityOverride?: number;
}
export interface BlacklistDetail {
    note?: string;
    nickname?: string;
    channelId?: string;
    guildId?: string;
    groupId?: string;
}
export type ClampFn = (value: number, low: number, high: number) => number;
export interface AffinityCache {
    get: (platform: string, userId: string) => number | null;
    set: (platform: string, userId: string, value: number) => void;
    clear: (platform: string, userId: string) => void;
    clearAll?: () => void;
}
export interface ScheduleEntry {
    start: string;
    end: string;
    startMinutes: number;
    endMinutes: number;
    summary: string;
}
export interface Schedule {
    source: string;
    date: string;
    title: string;
    description: string;
    entries: ScheduleEntry[];
    text: string;
}
export interface ScheduleManager {
    enabled: boolean;
    registerVariables: () => void;
    registerTool: (plugin: ChatLunaPlugin) => void;
    registerCommand: () => void;
    start: () => void;
    regenerateSchedule?: (session?: Session) => Promise<Schedule | null>;
    getSchedule: (session?: Session) => Promise<Schedule | null>;
    getScheduleText: (session?: Session) => Promise<string>;
    getCurrentSummary: (session?: Session) => Promise<string>;
    renderImage?: (payload: Schedule) => Promise<Buffer | null>;
}
export interface InMemoryTemporaryEntry {
    expiresAt: number;
    nickname: string;
}
export interface TemporaryBlacklistManager {
    isBlocked: (platform: string, userId: string) => InMemoryTemporaryEntry | null;
    activate: (platform: string, userId: string, nickname: string, now: Date) => {
        activated: boolean;
        entry: InMemoryTemporaryEntry | null;
    };
    clear: (platform: string, userId: string) => void;
}
export interface ShortTermOptions {
    enabled: boolean;
    windowHours: number;
    windowMs: number;
    decreaseThreshold: number;
    durationHours: number;
    durationMs: number;
    penalty: number;
}
export interface RoleTranslation {
    role: string;
    matched: boolean;
    raw: unknown;
}
export interface RoleMapping {
    direct: Record<string, string>;
    keywords: Record<string, string[]>;
    numeric: Record<string, string>;
}
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogFn = (level: LogLevel, message: string, detail?: unknown) => void;
export interface ChatLunaPlugin {
    registerTool: (name: string, options: ToolRegistration) => void;
}
export interface ToolRegistration {
    selector: () => boolean;
    createTool: () => unknown;
    authorization?: (session: Session) => boolean;
}
export interface ResolvedShortTermConfig {
    promoteThreshold: number;
    demoteThreshold: number;
    longTermPromoteStep: number;
    longTermDemoteStep: number;
}
export interface ResolvedActionWindowConfig {
    windowHours: number;
    windowMs: number;
    increaseBonus: number;
    decreaseBonus: number;
    bonusChatThreshold: number;
    allowBonusOverflow: boolean;
    maxEntries: number;
}
export interface ResolvedCoefficientConfig {
    base: number;
    maxDrop: number;
    maxBoost: number;
    decayPerDay: number;
    boostPerDay: number;
    min: number;
    max: number;
}
export interface CoefficientResult {
    coefficient: number;
    decayPenalty: number;
    streakBoost: number;
    inactivityDays: number;
}
export interface SummarizedActions {
    entries: ActionEntry[];
    counts: ActionCounts;
    total: number;
}
export type MemberInfoField = 'nickname' | 'userId' | 'role' | 'level' | 'title' | 'gender' | 'age' | 'area' | 'joinTime' | 'lastSentTime';
export interface MemberInfo {
    card?: string;
    remark?: string;
    displayName?: string;
    nick?: string;
    nickname?: string;
    name?: string;
    user?: {
        nickname?: string;
        name?: string;
    };
    level?: string | number;
    levelName?: string;
    level_name?: string;
    level_info?: {
        current_level?: string | number;
        level?: string | number;
    };
    title?: string;
    specialTitle?: string;
    special_title?: string;
    sex?: string;
    gender?: string;
    age?: number;
    area?: string;
    region?: string;
    location?: string;
    join_time?: number | string;
    joined_at?: number | string;
    joinTime?: number | string;
    joinedAt?: number | string;
    joinTimestamp?: number | string;
    last_sent_time?: number | string;
    lastSentTime?: number | string;
    lastSpeakTimestamp?: number | string;
    role?: string;
    roleName?: string;
    permission?: string;
    permissions?: string | string[];
    identity?: string;
    type?: string;
    status?: string;
    roles?: string[];
    userId?: string;
    id?: string;
    qq?: string;
    uid?: string;
    user_id?: string;
}
export interface RenderMemberInfoOptions {
    fallbackNames?: string[];
    defaultItems?: MemberInfoField[];
    logUnknown?: boolean;
    log?: LogFn;
}
export interface GroupInfo {
    group_id?: string | number;
    groupId?: string | number;
    id?: string | number;
    group_name?: string;
    groupName?: string;
    name?: string;
    member_count?: number;
    memberCount?: number;
    max_member_count?: number;
    create_time?: number | string;
    createTime?: number | string;
}
export interface NormalizedTime {
    minutes: number;
    label: string;
    raw: string;
}
export interface AnalysisMiddlewareResult {
    middleware: (session: Session, next: () => Promise<void>) => Promise<void>;
    addBotReply: (session: Session, botReply: string) => void;
    cancelScheduledAnalysis: (session: Session) => void;
}
export interface PendingAnalysis {
    session: Session;
    timestamp: number;
    botReplies: string[];
    timer: ReturnType<typeof setTimeout> | null;
}
