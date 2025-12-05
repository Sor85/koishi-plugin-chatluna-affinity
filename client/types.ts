/**
 * 前端类型定义
 * 包含配置接口和组件 Props 类型
 */

export interface Config {
    enableAffinityAnalysis?: boolean
    affinityVariableName?: string
    contextAffinityOverview?: {
        variableName?: string
    }
    registerAffinityTool?: boolean
    affinityToolName?: string
    registerBlacklistTool?: boolean
    blacklistToolName?: string
    relationshipVariableName?: string
    registerRelationshipTool?: boolean
    relationshipToolName?: string
    schedule?: {
        enabled?: boolean
        variableName?: string
        currentVariableName?: string
        registerTool?: boolean
        toolName?: string
    }
    userInfo?: { enabled?: boolean; variableName?: string }
    botInfo?: { enabled?: boolean; variableName?: string }
    groupInfo?: { enabled?: boolean; variableName?: string }
    otherVariables?: {
        userInfo?: { enabled?: boolean; variableName?: string }
        botInfo?: { enabled?: boolean; variableName?: string }
        groupInfo?: { enabled?: boolean; variableName?: string }
        random?: { enabled?: boolean; variableName?: string }
    }
    enablePokeTool?: boolean
    pokeToolName?: string
    enableSetSelfProfileTool?: boolean
    setSelfProfileToolName?: string
    enableDeleteMessageTool?: boolean
    deleteMessageToolName?: string
    panSouTool?: {
        enablePanSouTool?: boolean
        panSouToolName?: string
    }
}
