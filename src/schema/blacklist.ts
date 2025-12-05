/**
 * 黑名单 Schema
 * 定义黑名单相关的配置项
 */

import { Schema } from 'koishi'

export const BlacklistSchema = Schema.object({
    enableAutoBlacklist: Schema.boolean().default(false).description('当好感度低于阈值时自动拉黑用户'),
    blacklistThreshold: Schema.number().default(0).description('好感度低于该值时触发自动拉黑'),
    blacklistLogInterception: Schema.boolean().default(true).description('拦截消息时输出日志'),
    autoBlacklistReply: Schema.string().default('').description('自动拉黑触发时的回复模板，可用变量：{nickname} {@user}。留空则不回复'),
    shortTermBlacklist: Schema.object({
        enabled: Schema.boolean().default(false).description('启用临时拉黑（按 decrease 次数触发临时屏蔽）'),
        windowHours: Schema.number().default(24).min(1).description('统计 decrease 次数的时间窗口（小时）'),
        decreaseThreshold: Schema.number().default(15).min(1).description('窗口内 decrease 次数达到该值时触发临时拉黑'),
        durationHours: Schema.number().default(12).min(1).description('临时拉黑持续的小时数'),
        penalty: Schema.number().default(5).min(0).description('触发临时拉黑时额外扣减的长期好感度'),
        replyTemplate: Schema.string().default('').description('临时拉黑触发时的回复模板，可用变量：{nickname} {@user} {duration} {penalty}。留空则不回复'),
        renderAsImage: Schema.boolean().default(false).description('将临时黑名单渲染为图片')
    })
        .description('临时拉黑设置')
        .collapse(),
    autoBlacklist: Schema.array(
        Schema.object({
            userId: Schema.string().default('').description('用户 ID'),
            nickname: Schema.string().default('').description('昵称'),
            blockedAt: Schema.string().default('').description('拉黑时间'),
            note: Schema.string().default('').description('备注'),
            platform: Schema.string().default('').hidden()
        })
    ).role('table').default([]).description('拉黑记录'),
    temporaryBlacklist: Schema.array(
        Schema.object({
            userId: Schema.string().default('').description('用户 ID'),
            nickname: Schema.string().default('').description('昵称'),
            blockedAt: Schema.string().default('').description('拉黑时间'),
            expiresAt: Schema.string().default('').description('到期时间'),
            durationHours: Schema.string().default('').description('时长'),
            penalty: Schema.string().default('').description('惩罚'),
            note: Schema.string().default('').description('备注'),
            platform: Schema.string().default('').hidden()
        })
    ).role('table').default([]).description('临时拉黑记录'),
    blacklistDefaultLimit: Schema.number().default(10).min(1).max(100).description('黑名单默认展示人数'),
    blacklistRenderAsImage: Schema.boolean().default(false).description('将黑名单渲染为图片'),
    registerBlacklistTool: Schema.boolean().default(false).description('注册 ChatLuna 工具：管理黑名单'),
    blacklistToolName: Schema.string().default('adjust_blacklist').description('ChatLuna 工具名称：管理黑名单')
}).description('黑名单设置')
