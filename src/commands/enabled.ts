/**
 * 启用项查询命令
 * 列出已启用的变量和工具
 */

import type { CommandDependencies } from './types'

function resolveVariableNames(config: CommandDependencies['config']) {
    const items: string[] = []

    const push = (label: string, value: string | undefined) => {
        const name = (value || '').trim()
        if (name) items.push(`${label}：${name}`)
    }

    push('好感度变量', config.affinityVariableName)
    push('关系变量', config.relationshipVariableName)
    push(
        '好感度区间变量',
        config.relationshipAffinityLevelVariableName || 'relationshipAffinityLevel'
    )
    push('上下文好感度变量', config.contextAffinityOverview?.variableName || 'contextAffinity')
    push(
        '用户信息变量',
        config.userInfo?.variableName || config.otherVariables?.userInfo?.variableName || 'userInfo'
    )
    push(
        'Bot 信息变量',
        config.botInfo?.variableName || config.otherVariables?.botInfo?.variableName || 'botInfo'
    )
    push(
        '群信息变量',
        config.groupInfo?.variableName || config.otherVariables?.groupInfo?.variableName || 'groupInfo'
    )
    push(
        '随机变量',
        config.random?.variableName || config.otherVariables?.random?.variableName || 'random'
    )

    if (config.weather?.enabled && config.weather?.apiToken) {
        push('天气变量', config.weather.variableName || 'weather')
    }

    const scheduleConfig = config.schedule || {}
    const scheduleEnabled = scheduleConfig.enabled !== false
    if (scheduleEnabled) {
        push('日程变量', scheduleConfig.variableName || 'schedule')
        push('当前日程变量', scheduleConfig.currentVariableName || 'currentSchedule')
        push('穿搭变量', scheduleConfig.outfitVariableName || 'outfit')
        push('当前穿搭变量', scheduleConfig.currentOutfitVariableName || 'currentOutfit')
    }

    return items
}

function resolveToolNames(config: CommandDependencies['config']) {
    const tools: string[] = []

    if (config.registerAffinityTool) {
        tools.push(`好感度工具：${(config.affinityToolName || 'adjust_affinity').trim()}`)
    }
    if (config.registerRelationshipTool) {
        tools.push(`关系工具：${(config.relationshipToolName || 'adjust_relationship').trim()}`)
    }
    if (config.registerBlacklistTool) {
        tools.push(`黑名单工具：${(config.blacklistToolName || 'adjust_blacklist').trim()}`)
    }
    if (config.enablePokeTool) {
        tools.push(`戳一戳工具：${(config.pokeToolName || 'poke_user').trim()}`)
    }
    if (config.weather?.enabled && config.weather?.apiToken && config.weather?.registerTool) {
        tools.push(`天气工具：${(config.weather.toolName || 'get_weather').trim() || 'get_weather'}`)
    }
    if (config.enableSetSelfProfileTool) {
        tools.push(`修改自身信息工具：${(config.setSelfProfileToolName || 'set_self_profile').trim()}`)
    }
    if (config.enableSetGroupCardTool) {
        tools.push(`群昵称工具：${(config.setGroupCardToolName || 'set_group_card').trim()}`)
    }
    if (config.enableSetMsgEmojiTool) {
        tools.push(`消息表情工具：${(config.setMsgEmojiToolName || 'set_msg_emoji').trim()}`)
    }
    if (config.enableForwardMessageTool) {
        tools.push(`合并转发工具：${(config.forwardMessageToolName || 'send_forward_msg').trim()}`)
    }
    if (config.enableFakeMessageTool) {
        tools.push(`伪造消息工具：${(config.fakeMessageToolName || 'send_fake_msg').trim()}`)
    }
    if (config.enableDeleteMessageTool) {
        tools.push(`撤回消息工具：${(config.deleteMessageToolName || 'delete_msg').trim()}`)
    }

    return tools.filter(Boolean)
}

export function registerEnabledListCommands(deps: CommandDependencies) {
    const { ctx, config } = deps

    ctx.command('affinity.varslist', '列出已启用的变量', { authority: 1 }).action(() => {
        const vars = resolveVariableNames(config)
        if (!vars.length) return '当前未注册变量。'
        return `已启用变量：\n${vars.join('\n')}`
    })

    ctx.command('affinity.toolslist', '列出已启用的工具', { authority: 1 }).action(() => {
        const tools = resolveToolNames(config)
        if (!tools.length) return '当前未注册工具。'
        return `已启用工具：\n${tools.join('\n')}`
    })
}
