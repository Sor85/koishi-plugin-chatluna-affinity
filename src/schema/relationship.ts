/**
 * 关系 Schema
 * 定义关系相关的配置项
 */

import { Schema } from 'koishi'

export const RelationshipSchema = Schema.object({
    relationshipVariableName: Schema.string().default('relationship').description('关系变量名称'),
    relationships: Schema.array(
        Schema.object({
            userId: Schema.string().default('').description('用户 ID'),
            relation: Schema.string().default('').description('关系'),
            note: Schema.string().default('').description('备注')
        })
    ).role('table').default([]).description('特殊关系配置（建议仅在第一次使用或清空好感数据库时配置，后续增改可能导致bug）'),
    relationshipAffinityLevels: Schema.array(
        Schema.object({
            min: Schema.number().default(0).description('好感度下限'),
            max: Schema.number().default(100).description('好感度上限'),
            relation: Schema.string().description('关系'),
            note: Schema.string().default('').description('备注')
        })
    ).role('table').default([
        { min: 0, max: 29, relation: '陌生人', note: '保持距离' },
        { min: 30, max: 59, relation: '友好', note: '一般关系' },
        { min: 60, max: 89, relation: '亲近', note: '值得信赖' },
        { min: 90, max: 100, relation: '挚友', note: '非常重要' }
    ]).description('好感度区间关系'),
    registerRelationshipTool: Schema.boolean().default(false).description('注册 ChatLuna 工具：调整关系'),
    relationshipToolName: Schema.string().default('adjust_relationship').description('ChatLuna 工具名称：调整关系')
}).description('关系设置')
