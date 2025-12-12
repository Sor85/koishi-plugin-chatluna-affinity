/**
 * 前端常量定义
 * 包含导航、工具、变量的配置映射
 */

export interface NavSection {
    title: string
    key: string
}

export interface ToolItem {
    name: string
    enableKey: string
    enabled: boolean
}

export interface VariableItem {
    name: string
    key: string
    enabled: boolean
}

export const NAV_SECTIONS: NavSection[] = [
    { title: '好感度设置', key: 'affinity' },
    { title: '黑名单设置', key: 'blacklist' },
    { title: '关系设置', key: 'relationship' },
    { title: '日程设置', key: 'schedule' },
    { title: '天气设置', key: 'weather' },
    { title: '其他变量', key: 'otherVariables' },
    { title: '其他工具', key: 'otherTools' },
    { title: '其他指令', key: 'otherCommands' },
    { title: '其他设置', key: 'otherSettings' }
]

export const TITLE_TO_KEY: Record<string, string> = {
    '好感度设置': 'affinity',
    '黑名单设置': 'blacklist',
    '关系设置': 'relationship',
    '日程设置': 'schedule',
    '天气设置': 'weather',
    '其他变量': 'otherVariables',
    '其他工具': 'otherTools',
    '其他指令': 'otherCommands',
    '其他设置': 'otherSettings'
}

export const KEY_TO_TITLE: Record<string, string> = {
    affinity: '好感度设置',
    blacklist: '黑名单设置',
    relationship: '关系设置',
    schedule: '日程设置',
    weather: '天气设置',
    otherVariables: '其他变量',
    otherTools: '其他工具',
    otherCommands: '其他指令',
    otherSettings: '其他设置'
}

export const VARIABLE_CONFIG: Record<string, { section: string; searchKey: string | string[] }> = {
    affinity: { section: '好感度设置', searchKey: 'affinityVariableName' },
    contextAffinity: { section: '好感度设置', searchKey: ['contextAffinityOverview', '上下文好感度变量'] },
    relationship: { section: '关系设置', searchKey: 'relationshipVariableName' },
    schedule: { section: '日程设置', searchKey: ['今日日程变量名称', 'variableName'] },
    currentSchedule: { section: '日程设置', searchKey: ['当前日程变量名称', 'currentVariableName'] },
    weather: { section: '天气设置', searchKey: ['天气变量名称', 'variableName'] },
    userInfo: { section: '其他变量', searchKey: 'userInfo' },
    botInfo: { section: '其他变量', searchKey: 'botInfo' },
    groupInfo: { section: '其他变量', searchKey: 'groupInfo' },
    random: { section: '其他变量', searchKey: 'random' }
}

export const PLUGIN_NAME = 'koishi-plugin-chatluna-affinity'
