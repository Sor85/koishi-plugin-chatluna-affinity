/**
 * 好感度数据表定义
 * 定义 chatluna_affinity 表结构及类型声明
 */

import type { Context } from 'koishi'
import type { AffinityRecord } from '../types'

export const MODEL_NAME = 'chatluna_affinity'

declare module 'koishi' {
    interface Tables {
        [MODEL_NAME]: AffinityRecord
    }
}

export function extendAffinityModel(ctx: Context): void {
    ctx.model.extend(
        MODEL_NAME,
        {
            selfId: { type: 'string', length: 64 },
            userId: { type: 'string', length: 64 },
            nickname: { type: 'string', length: 255, nullable: true },
            affinity: { type: 'integer', initial: 0 },
            relation: { type: 'string', length: 64, nullable: true },
            specialRelation: { type: 'string', length: 64, nullable: true },
            shortTermAffinity: { type: 'integer', nullable: true },
            longTermAffinity: { type: 'integer', nullable: true },
            chatCount: { type: 'integer', nullable: true },
            actionStats: { type: 'text', nullable: true },
            lastInteractionAt: { type: 'timestamp', nullable: true },
            coefficientState: { type: 'text', nullable: true }
        },
        { primary: ['selfId', 'userId'] }
    )
}
