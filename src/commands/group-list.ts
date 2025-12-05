/**
 * 群列表命令
 * 显示机器人已加入的群聊
 */

import { h } from 'koishi'
import type { Session } from 'koishi'
import type { CommandDependencies } from './types'
import { normalizeGroupList } from '../helpers/member'

export function registerGroupListCommand(deps: CommandDependencies) {
    const { ctx, config, renders, fetchGroupList } = deps

    ctx.command('affinity.groupList [image]', '显示机器人已加入的群聊', { authority: 2 })
        .alias('群聊列表')
        .action(async ({ session }, imageArg) => {
            if (!session) return '无法获取会话信息。'
            if (session.platform !== 'onebot') return '该指令仅支持 OneBot/NapCat 平台。'
            const list = await fetchGroupList(session as Session)
            if (!list || !list.length) return '暂无群聊数据。'

            const shouldRenderImage =
                imageArg === undefined
                    ? !!config.groupListRenderAsImage
                    : !['0', 'false', 'text', 'no', 'n'].includes(String(imageArg).toLowerCase())
            const puppeteer = (ctx as unknown as { puppeteer?: { page?: () => Promise<unknown> } })
                .puppeteer

            const groupInfoCfg = config.groupInfo || config.otherVariables?.groupInfo || {}
            const textResult = normalizeGroupList(list, {
                includeMemberCount: groupInfoCfg.includeMemberCount !== false,
                includeCreateTime: groupInfoCfg.includeCreateTime !== false
            })

            if (shouldRenderImage && puppeteer?.page) {
                const groups = list.map((group) => {
                    const groupId = String(group.group_id ?? group.groupId ?? group.id ?? '')
                    const groupName = String(
                        group.group_name ?? group.groupName ?? group.name ?? groupId
                    )
                    const memberCount = group.member_count ?? group.memberCount
                    let createTime: string | undefined
                    const rawCreateTime = group.create_time ?? group.createTime
                    if (groupInfoCfg.includeCreateTime !== false && rawCreateTime) {
                        const ts = Number(rawCreateTime)
                        if (Number.isFinite(ts)) {
                            const date = new Date(ts < 1e11 ? ts * 1000 : ts)
                            createTime = date.toLocaleDateString('zh-CN')
                        }
                    }
                    return { groupId, groupName, memberCount, createTime }
                })

                const buffer = await renders.groupList('群聊列表', groups)
                if (buffer) return h.image(buffer, 'image/png')
            }

            return textResult
        })
}
