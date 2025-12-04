import { Schema } from 'koishi'
import type { BaseAffinityConfig } from './types'

export const name = 'chatluna-affinity'

export const inject = {
  required: ['chatluna', 'database'],
  optional: ['puppeteer', 'console']
}


export const defaultMemberInfoItems: MemberInfoItem[] = [
  'nickname',
  'userId',
  'role',
  'level',
  'title',
  'gender',
  'age',
  'area',
  'joinTime',
  'lastSentTime'
]

type MemberInfoItem = 'nickname' | 'userId' | 'role' | 'level' | 'title' | 'gender' | 'age' | 'area' | 'joinTime' | 'lastSentTime'

export const baseAffinityDefaults: BaseAffinityConfig = {
  initialRandomMin: 20,
  initialRandomMax: 40,
  min: 0,
  max: 100,
  maxIncreasePerMessage: 5,
  maxDecreasePerMessage: 5
}

const AffinityDynamicsSchema = Schema.object({
  shortTerm: Schema.object({
    promoteThreshold: Schema.number().default(15).description('短期好感高于该值时提升长期好感'),
    demoteThreshold: Schema.number().default(-15).description('短期好感低于该值时降低长期好感'),
    longTermPromoteStep: Schema.number().default(3).min(1).description('每次增加长期好感的幅度'),
    longTermDemoteStep: Schema.number().default(3).min(1).description('每次减少长期好感的幅度')
  })
    .default({
      promoteThreshold: 15,
      demoteThreshold: -15,
      longTermPromoteStep: 3,
      longTermDemoteStep: 3
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
    .default({ windowHours: 24, increaseBonus: 2, decreaseBonus: 2, bonusChatThreshold: 10, allowBonusOverflow: false, maxEntries: 80 })
    .description('近期互动加成设置')
    .collapse(),
  coefficient: Schema.object({
    base: Schema.number().default(1).description('综合好感基础系数'),
    maxDrop: Schema.number().default(0.3).min(0).description('长时间未互动或 decrease 大于 increase 时最多降低的系数幅度'),
    maxBoost: Schema.number().default(0.3).min(0).description('连续互动且 increase 大于 decrease 时最多提升的系数幅度'),
    decayPerDay: Schema.number().default(0.05).min(0).description('每日未互动或 decrease 大于 increase 时衰减量'),
    boostPerDay: Schema.number().default(0.05).min(0).description('每日连续互动且 increase 大于 decrease 时提升量')
  })
    .default({ base: 1, maxDrop: 0.3, maxBoost: 0.3, decayPerDay: 0.05, boostPerDay: 0.05 })
    .description('综合好感系数设置')
    .collapse()
}).description('好感度动态设置')

const AffinitySchema = Schema.object({
  affinityVariableName: Schema.string().default('affinity').description('好感度变量名称'),
  contextAffinityOverview: Schema.object({
    variableName: Schema.string().default('contextAffinity').description('变量名称'),
    messageWindow: Schema.number().default(20).min(1).max(200).description('读取最近的群聊消息数量')
  })
    .default({ variableName: 'contextAffinity', messageWindow: 20 })
    .description('上下文好感度变量')
    .collapse(),
  baseAffinityConfig: Schema.object({
    initialRandomMin: Schema.number().default(baseAffinityDefaults.initialRandomMin).description('初始长期好感度随机范围下限'),
    initialRandomMax: Schema.number().default(baseAffinityDefaults.initialRandomMax).description('初始长期好感度随机范围上限'),
    min: Schema.number().default(baseAffinityDefaults.min).description('综合好感度最小值'),
    max: Schema.number().default(baseAffinityDefaults.max).description('综合好感度最大值'),
    maxIncreasePerMessage: Schema.number().default(baseAffinityDefaults.maxIncreasePerMessage).description('单次增加的短期好感最大幅度'),
    maxDecreasePerMessage: Schema.number().default(baseAffinityDefaults.maxDecreasePerMessage).description('单次减少的短期好感最大幅度')
  })
    .default({ ...baseAffinityDefaults })
    .description('好感度基础数值')
    .collapse(),
  affinityDynamics: AffinityDynamicsSchema.default({
    shortTerm: { promoteThreshold: 15, demoteThreshold: -15, longTermPromoteStep: 3, longTermDemoteStep: 3 },
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
    .default(
      '你是好感度管家，评估本次互动的增减幅度，并遵守以下要求:\n- 以 `人设` 视角出发以第一人称描述"我"的真实情绪；\n- 以 `人设` 为基础，以 `本次用户消息` 和 `本次Bot回复` 为事实依据，参考 `上下文` 给出本次好感度的增减，重点考虑 `本次Bot回复` 的情绪语气和心情。\n- 只有当用户提供与人设高度契合、具体且有价值的善意时才 increase；例行寒暄、无实质贡献或刻意讨好保持 hold；触犯禁忌、造成负面情绪、敷衍或反复冒犯时 decrease；\n- 最近 {{recentActionWindowHours}} 小时内聊天次数 {{chatCount}}，动作统计: {{recentActionCountsText}}，若提升/降低刷屏应警惕刷分或持续冒犯；\n- 单次提升不超过 {{maxIncreasePerMessage}} ，单词减少不超过 {{maxDecreasePerMessage}}；\n- 输出前再次验证 action 是否符合上下文与阈值逻辑，并简述我为何 increase/decrease/hold；\n- 仅输出 JSON：{"delta": 整数, "action": "increase|decrease|hold", "reason": "简短中文原因"}。\n\n用于参考的背景信息:\n人设：{{persona}}\n当前综合好感: {{currentAffinity}}（范围 {{minAffinity}} ~ {{maxAffinity}}）\n上下文:\n{{historyText}}\n\n本次用户消息：\n{{userMessage}}\n\n本次Bot回复：\n{{botReply}}'
    )
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

const BlacklistSchema = Schema.object({
  enableAutoBlacklist: Schema.boolean().default(false).description('当综合好感度低于阈值时自动拉黑用户'),
  blacklistThreshold: Schema.number().default(0).description('综合好感度低于该值时触发自动拉黑'),
  blacklistLogInterception: Schema.boolean().default(true).description('拦截消息时输出日志'),
  autoBlacklistReply: Schema.string().default('').description('自动拉黑触发时的回复模板，可用变量：{{nickname}} {{@user}}。留空则不回复'),
  shortTermBlacklist: Schema.object({
    enabled: Schema.boolean().default(false).description('启用临时拉黑（按 decrease 次数触发临时屏蔽）'),
    windowHours: Schema.number().default(24).min(1).description('统计 decrease 次数的时间窗口（小时）'),
    decreaseThreshold: Schema.number().default(15).min(1).description('窗口内 decrease 次数达到该值时触发临时拉黑'),
    durationHours: Schema.number().default(12).min(1).description('临时拉黑持续的小时数'),
    penalty: Schema.number().default(5).min(0).description('触发临时拉黑时额外扣减的长期好感度'),
    replyTemplate: Schema.string().default('').description('临时拉黑触发时的回复模板，可用变量：{{nickname}} {{@user}} {{duration}} {{penalty}}。留空则不回复'),
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
  ).role('table').default([]).description('自动拉黑记录'),
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

const RelationshipSchema = Schema.object({
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
      min: Schema.number().default(0).description('综合好感度下限'),
      max: Schema.number().default(100).description('综合好感度上限'),
      relation: Schema.string().description('关系'),
      note: Schema.string().default('').description('备注')
    })
  ).role('table').default([
    { min: 0, max: 29, relation: '陌生人', note: '保持距离' },
    { min: 30, max: 59, relation: '友好', note: '一般关系' },
    { min: 60, max: 89, relation: '亲近', note: '值得信赖' },
    { min: 90, max: 100, relation: '挚友', note: '非常重要' }
  ]).description('综合好感度区间关系'),
  registerRelationshipTool: Schema.boolean().default(false).description('注册 ChatLuna 工具：调整关系'),
  relationshipToolName: Schema.string().default('adjust_relationship').description('ChatLuna 工具名称：调整关系')
}).description('关系设置')

const OtherVariablesSchema = Schema.object({
  userInfo: Schema.object({
    variableName: Schema.string().default('userInfo').description('变量名称'),
    items: Schema.array(
      Schema.union([
        Schema.const('userId').description('用户 ID'),
        Schema.const('nickname').description('显示名称'),
        Schema.const('role').description('群内身份'),
        Schema.const('level').description('群等级'),
        Schema.const('title').description('群头衔'),
        Schema.const('gender').description('性别'),
        Schema.const('age').description('年龄'),
        Schema.const('area').description('地区'),
        Schema.const('joinTime').description('入群时间'),
        Schema.const('lastSentTime').description('最后发言时间')
      ])
    )
      .role('checkbox')
      .default([...defaultMemberInfoItems])
      .description('显示的详细信息项')
  })
    .description('用户信息变量')
    .collapse(),
  botInfo: Schema.object({
    variableName: Schema.string().default('botInfo').description('变量名称'),
    items: Schema.array(
      Schema.union([
        Schema.const('userId').description('机器人 ID'),
        Schema.const('nickname').description('显示名称'),
        Schema.const('role').description('群内身份'),
        Schema.const('level').description('群等级'),
        Schema.const('title').description('群头衔'),
        Schema.const('gender').description('性别'),
        Schema.const('age').description('年龄'),
        Schema.const('area').description('地区'),
        Schema.const('joinTime').description('入群时间'),
        Schema.const('lastSentTime').description('最后发言时间')
      ])
    )
      .role('checkbox')
      .default([...defaultMemberInfoItems])
      .description('显示的机器人详细信息项')
  })
    .description('机器人信息变量')
    .collapse(),
  groupInfo: Schema.object({
    variableName: Schema.string().default('groupInfo').description('变量名称'),
    includeMemberCount: Schema.boolean().default(true).description('是否包含成员数量'),
    includeCreateTime: Schema.boolean().default(true).description('是否包含创建时间')
  })
    .description('群信息变量')
    .collapse(),
  random: Schema.object({
    variableName: Schema.string().default('random').description('变量名称'),
    min: Schema.number().default(0).description('默认随机数下限'),
    max: Schema.number().default(100).description('默认随机数上限')
  })
    .description('随机数变量')
    .collapse()
})
  .default({
    userInfo: { variableName: 'userInfo', items: [...defaultMemberInfoItems] },
    botInfo: { variableName: 'botInfo', items: [...defaultMemberInfoItems] },
    groupInfo: { variableName: 'groupInfo', includeMemberCount: true, includeCreateTime: true },
    random: { variableName: 'random', min: 0, max: 100 }
  })
  .description('其他变量')

const ScheduleSchema = Schema.object({
  schedule: Schema.object({
    enabled: Schema.boolean().default(true).description('是否启用日程功能'),
    variableName: Schema.string().default('schedule').description('今日日程变量名称'),
    currentVariableName: Schema.string().default('currentSchedule').description('当前日程变量名称'),
    timezone: Schema.string().default('Asia/Shanghai').description('用于日程生成的时区'),
    prompt: Schema.string()
      .role('textarea')
      .default(
        '你是一名擅长写作日常作息的助理，需要基于角色人设生成今日全日计划。\n今天是 {{date}}（{{weekday}}）。\n人设：{{persona}}\n请输出 JSON，结构如下：\n{\n  "title": "📅 今日日程",\n  "description": "一段带有角色情绪的总述",\n  "entries": [\n    { "start": "00:00", "end": "07:00", "activity": "睡觉", "detail": "符合人设的描写" }\n  ]\n}\n要求：\n1. entries 至少 10 项，覆盖 00:00-24:00，时间格式 HH:MM，并保持时段衔接自然；\n2. 请结合当前日期安排日程：工作日突出学习/工作与效率，休息日强调放松与兴趣；如遇节假日尤其春节，请写出应有的仪式感与特殊活动；\n3. 活动名称与描述要符合人设语气；\n4. 整体日程安排须符合角色人设的生活方式与优先级；\n5. 仅输出 JSON，不要附加解释。'
      )
      .description('日程生成提示词模板（可使用 {{date}}、{{weekday}}、{{persona}} 等占位符）'),
    renderAsImage: Schema.boolean().default(false).description('将今日日程渲染为图片'),
    startDelay: Schema.number().default(3000).description('启动延迟（毫秒），等待 ChatLuna 加载完成'),
    registerTool: Schema.boolean().default(true).description('注册 ChatLuna 工具：获取今日日程'),
    toolName: Schema.string().default('daily_schedule').description('ChatLuna 工具名称：获取今日日程')
  })
    .default({
      enabled: true,
      variableName: 'schedule',
      currentVariableName: 'currentSchedule',
      timezone: 'Asia/Shanghai',
      prompt: '你是一名擅长写作日常作息的助理，需要基于角色人设生成今日全日计划。\n今天是 {{date}}（{{weekday}}）。\n人设：{{persona}}\n请输出 JSON，结构如下：\n{\n  "title": "📅 今日日程",\n  "description": "一段带有角色情绪的总述",\n  "entries": [\n    { "start": "00:00", "end": "07:00", "activity": "睡觉", "detail": "符合人设的描写" }\n  ]\n}\n要求：\n1. entries 至少 10 项，覆盖 00:00-24:00，时间格式 HH:MM，并保持时段衔接自然；\n2. 请结合当前日期安排日程：工作日突出学习/工作与效率，休息日强调放松与兴趣；如遇节假日尤其春节，请写出应有的仪式感与特殊活动；\n3. 活动名称与描述要符合人设语气；\n4. 整体日程安排须符合角色人设的生活方式与优先级；\n5. 仅输出 JSON，不要附加解释。',
      renderAsImage: false,
      startDelay: 3000,
      registerTool: true,
      toolName: 'daily_schedule'
    })
    .description('日程设置')
})

const OtherSettingsSchema = Schema.object({
  debugLogging: Schema.boolean().default(false).description('输出调试日志')
}).description('其他设置')

const OneBotToolsSchema = Schema.object({
  enablePokeTool: Schema.boolean().default(false).description('注册 ChatLuna 工具：戳一戳'),
  pokeToolName: Schema.string().default('poke_user').description('ChatLuna 工具名称：戳一戳'),
  enableSetSelfProfileTool: Schema.boolean().default(false).description('注册 ChatLuna 工具：修改自身账户信息'),
  setSelfProfileToolName: Schema.string().default('set_self_profile').description('ChatLuna 工具名称：修改自身账户信息（支持昵称/签名/性别）'),
  enableDeleteMessageTool: Schema.boolean().default(false).description('注册 ChatLuna 工具：撤回消息'),
  deleteMessageToolName: Schema.string().default('delete_msg').description('ChatLuna 工具名称：撤回消息'),
  panSouTool: Schema.object({
    enablePanSouTool: Schema.boolean().default(false).description('注册 ChatLuna 工具：网盘搜索'),
    panSouToolName: Schema.string().default('pansou_search').description('ChatLuna 工具名称：网盘搜索'),
    panSouApiUrl: Schema.string().default('http://localhost:8888').description('PanSou API 地址'),
    panSouAuthEnabled: Schema.boolean().default(false).description('是否启用 PanSou 认证'),
    panSouUsername: Schema.string().default('').description('PanSou 认证用户名'),
    panSouPassword: Schema.string().role('secret').default('').description('PanSou 认证密码'),
    panSouDefaultCloudTypes: Schema.array(
      Schema.union([
        Schema.const('baidu').description('百度网盘'),
        Schema.const('aliyun').description('阿里云盘'),
        Schema.const('quark').description('夸克网盘'),
        Schema.const('tianyi').description('天翼云盘'),
        Schema.const('uc').description('UC网盘'),
        Schema.const('mobile').description('移动云盘'),
        Schema.const('115').description('115网盘'),
        Schema.const('pikpak').description('PikPak'),
        Schema.const('xunlei').description('迅雷网盘'),
        Schema.const('123').description('123网盘'),
        Schema.const('magnet').description('磁力链接'),
        Schema.const('ed2k').description('电驴链接')
      ])
    ).role('checkbox').default([]).description('默认返回的网盘类型（为空则返回所有类型）'),
    panSouMaxResults: Schema.number().default(5).min(1).max(20).description('每种网盘类型最大返回结果数')
  }).description('网盘搜索工具').collapse()
}).description('其他工具')

const OtherCommandsSchema = Schema.object({
  groupListRenderAsImage: Schema.boolean().default(false).description('将群聊列表渲染为图片（affinity.groupList）'),
  inspectRenderAsImage: Schema.boolean().default(false).description('将好感度详情渲染为图片（affinity.inspect）')
}).description('其他指令')

export const Config = Schema.intersect([
  AffinitySchema,
  BlacklistSchema,
  RelationshipSchema,
  ScheduleSchema,
  OtherVariablesSchema,
  OneBotToolsSchema,
  OtherCommandsSchema,
  OtherSettingsSchema
])
