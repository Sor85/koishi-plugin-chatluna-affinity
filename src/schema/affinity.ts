/**
 * 好感度 Schema
 * 定义好感度相关的配置项
 */

import { Schema } from 'koishi'
import { BASE_AFFINITY_DEFAULTS, DEFAULT_ANALYSIS_PROMPT } from '../constants'

const AffinityDynamicsSchema = Schema.object({
    shortTerm: Schema.object({
        promoteThreshold: Schema.number().default(15).description('短期好感高于该值时提升长期好感'),
        demoteThreshold: Schema.number().default(-10).description('短期好感低于该值时降低长期好感'),
        longTermPromoteStep: Schema.number().default(3).min(1).description('每次增加长期好感的幅度'),
        longTermDemoteStep: Schema.number().default(5).min(1).description('每次减少长期好感的幅度')
    })
        .default({
            promoteThreshold: 15,
            demoteThreshold: -10,
            longTermPromoteStep: 3,
            longTermDemoteStep: 5
        })
        .description('短期/长期好感设置')
        .collapse(),
    actionWindow: Schema.object({
        windowHours: Schema.number().default(24).min(1).description('统计的时间窗口（小时）'),
        increaseBonus: Schema.number().default(2).description('在正向占优时每次增幅额外增加数值'),
        decreaseBonus: Schema.number().default(2).description('在负向占优时每次减幅额外增加数值'),
        bonusChatThreshold: Schema.number().default(10).min(0).description('聊天次数大于该值时才启用额外增减'),
        allowBonusOverflow: Schema.boolean().default(false).description('允许额外增减突破单次上限'),
        maxEntries: Schema.number().default(80).min(10).description('窗口内最多保留的记录数')
    })
        .default({
            windowHours: 24,
            increaseBonus: 2,
            decreaseBonus: 2,
            bonusChatThreshold: 10,
            allowBonusOverflow: false,
            maxEntries: 80
        })
        .description('近期互动加成设置')
        .collapse(),
    coefficient: Schema.object({
        base: Schema.number().default(1).description('好感度基础系数'),
        maxDrop: Schema.number().default(0.3).min(0).description('长时间未互动或 decrease 大于 increase 时最多降低的系数幅度'),
        maxBoost: Schema.number().default(0.3).min(0).description('连续互动且 increase 大于 decrease 时最多提升的系数幅度'),
        decayPerDay: Schema.number().default(0.05).min(0).description('每日未互动或 decrease 大于 increase 时衰减量'),
        boostPerDay: Schema.number().default(0.05).min(0).description('每日连续互动且 increase 大于 decrease 时提升量')
    })
        .default({
            base: 1,
            maxDrop: 0.3,
            maxBoost: 0.3,
            decayPerDay: 0.05,
            boostPerDay: 0.05
        })
        .description('好感度系数设置')
        .collapse()
}).description('好感度动态设置')

export const AffinitySchema = Schema.object({
    affinityVariableName: Schema.string().default('affinity').description('好感度变量名称'),
    contextAffinityOverview: Schema.object({
        variableName: Schema.string().default('contextAffinity').description('变量名称'),
        messageWindow: Schema.number().default(20).min(1).max(200).description('读取最近的群聊消息数量')
    })
        .default({ variableName: 'contextAffinity', messageWindow: 20 })
        .description('上下文好感度变量')
        .collapse(),
    baseAffinityConfig: Schema.object({
        initialRandomMin: Schema.number().default(BASE_AFFINITY_DEFAULTS.initialRandomMin).description('初始长期好感度随机范围下限'),
        initialRandomMax: Schema.number().default(BASE_AFFINITY_DEFAULTS.initialRandomMax).description('初始长期好感度随机范围上限'),
        maxIncreasePerMessage: Schema.number().default(BASE_AFFINITY_DEFAULTS.maxIncreasePerMessage).description('单次增加的短期好感最大幅度'),
        maxDecreasePerMessage: Schema.number().default(BASE_AFFINITY_DEFAULTS.maxDecreasePerMessage).description('单次减少的短期好感最大幅度')
    })
        .default({ ...BASE_AFFINITY_DEFAULTS })
        .description('好感度基础数值')
        .collapse(),
    affinityDynamics: AffinityDynamicsSchema.default({
        shortTerm: { promoteThreshold: 15, demoteThreshold: -10, longTermPromoteStep: 3, longTermDemoteStep: 5 },
        actionWindow: { windowHours: 24, increaseBonus: 2, decreaseBonus: 2, bonusChatThreshold: 10, allowBonusOverflow: false, maxEntries: 80 },
        coefficient: { base: 1, maxDrop: 0.3, maxBoost: 0.3, decayPerDay: 0.05, boostPerDay: 0.05 }
    }).collapse(),
    model: Schema.dynamic('model').description('用于好感度分析的模型'),
    enableAnalysis: Schema.boolean().default(true).description('是否启用好感度分析'),
    historyMessageCount: Schema.number().default(10).min(0).description('用于分析的最近消息条数'),
    rankRenderAsImage: Schema.boolean().default(false).description('将好感度排行渲染为图片'),
    rankDefaultLimit: Schema.number().default(10).min(1).max(50).description('好感度排行默认展示人数'),
    triggerNicknames: Schema.array(Schema.string().description('昵称'))
        .role('table')
        .default([])
        .description('触发分析的 bot 昵称列表'),
    analysisPrompt: Schema.string()
        .role('textarea')
        .default(DEFAULT_ANALYSIS_PROMPT)
        .description('好感度分析主提示词'),
    personaSource: Schema.union([
        Schema.const('none').description('不注入预设'),
        Schema.const('chatluna').description('使用 ChatLuna 主插件预设'),
        Schema.const('custom').description('使用自定义预设')
    ]).default('none').description('人设注入来源'),
    personaChatlunaPreset: Schema.dynamic('preset')
        .default('无')
        // @ts-expect-error - Koishi Schema hidden accepts callback at runtime
        .hidden((_: unknown, cfg: { personaSource?: string } | undefined) => (cfg?.personaSource || 'none') !== 'chatluna')
        .description('当选择主插件预设时，指定要注入的 ChatLuna 预设'),
    personaCustomPreset: Schema.string()
        .role('textarea')
        .default('')
        // @ts-expect-error - Koishi Schema hidden accepts callback at runtime
        .hidden((_: unknown, cfg: { personaSource?: string } | undefined) => (cfg?.personaSource || 'none') !== 'custom')
        .description('当选择自定义预设时注入的文本内容'),
    registerAffinityTool: Schema.boolean().default(false).description('注册 ChatLuna 工具：调整好感度'),
    affinityToolName: Schema.string().default('adjust_affinity').description('ChatLuna 工具名称：调整好感度')
}).description('好感度设置')
