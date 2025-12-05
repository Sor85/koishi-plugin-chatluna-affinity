/**
 * 手动关系配置管理
 * 提供特殊关系的配置管理和数据库同步功能
 */

import type { Context } from 'koishi'
import type { Config, ManualRelationship, AffinityRecord, LogFn } from '../../types'
import { MODEL_NAME } from '../../models'

export interface ManualConfigOptions {
    ctx: Context
    config: Config
    log: LogFn
    applyConfigUpdate: () => void
}

export function createManualRelationshipManager(options: ManualConfigOptions) {
    const { ctx, config, log, applyConfigUpdate } = options

    const find = (platform: string, userId: string): ManualRelationship | null => {
        const list = config.relationships || []
        return list.find((r) => r.userId === userId) || null
    }

    const update = (userId: string, relationName: string): void => {
        if (!config.relationships) config.relationships = []
        const existing = config.relationships.find((r) => r.userId === userId)
        if (existing) {
            existing.relation = relationName
        } else {
            config.relationships.push({ userId, relation: relationName })
        }
        applyConfigUpdate()
    }

    const remove = async (selfId: string, userId: string): Promise<boolean> => {
        if (!config.relationships) return false
        const index = config.relationships.findIndex((r) => r.userId === userId)
        if (index < 0) return false

        config.relationships.splice(index, 1)
        applyConfigUpdate()

        try {
            const records = await ctx.database.get(MODEL_NAME, { selfId, userId })
            const existing = records[0]
            if (existing) {
                await ctx.database.upsert(MODEL_NAME, [
                    { ...existing, relation: null } as AffinityRecord
                ])
            }
        } catch (error) {
            log('warn', '同步删除关系到数据库失败', error)
        }

        return true
    }

    const syncToDatabase = async (selfId?: string): Promise<void> => {
        const relationships = config.relationships || []
        if (relationships.length === 0) return

        const relationshipMap = new Map(relationships.map((r) => [r.userId, r.relation]))
        const targetUserIds = relationships.map((r) => r.userId)

        const query: Record<string, unknown> = { userId: { $in: targetUserIds } }
        if (selfId) query.selfId = selfId

        const records = await ctx.database.get(MODEL_NAME, query as Record<string, string>)

        const toUpdate: AffinityRecord[] = []

        for (const record of records) {
            const configRelation = relationshipMap.get(record.userId)
            if (configRelation !== undefined && record.relation !== configRelation) {
                toUpdate.push({ ...record, relation: configRelation } as AffinityRecord)
            }
        }

        if (toUpdate.length > 0) {
            await ctx.database.upsert(MODEL_NAME, toUpdate)
            log('info', '已同步特殊关系配置到数据库', { count: toUpdate.length })
        }
    }

    return {
        find,
        update,
        remove,
        syncToDatabase
    }
}

export type ManualRelationshipManager = ReturnType<typeof createManualRelationshipManager>
