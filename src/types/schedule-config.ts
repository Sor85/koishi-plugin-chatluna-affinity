/**
 * 日程配置类型定义
 * 独立文件避免循环依赖
 */

export interface ScheduleConfig {
    enabled: boolean
    model?: string
    variableName: string
    currentVariableName: string
    outfitVariableName: string
    currentOutfitVariableName: string
    timezone: string
    registerTool: boolean
    renderAsImage: boolean
    startDelay: number
    toolName: string
    prompt: string
    title?: string
}
