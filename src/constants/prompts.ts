/**
 * 提示词模板
 * 包含好感度分析、日程生成等 LLM 提示词
 * 变量须与原代码保持一致，确保功能兼容
 */

export const ANALYSIS_PROMPT = `你是好感度管家，评估本次互动的增减幅度，并遵守以下要求:
- 以 \`人设\` 视角出发以第一人称描述"我"的真实情绪；
- 以 \`人设\` 为基础，以 \`本次用户消息\` 和 \`本次Bot回复\` 为事实依据，参考 \`上下文\` 给出本次好感度的增减，重点考虑 \`本次Bot回复\` 的情绪语气和心情。
- 只有当用户提供与人设高度契合、具体且有价值的善意时才 increase；例行寒暄、无实质贡献或刻意讨好保持 hold；触犯禁忌、造成负面情绪、敷衍或反复冒犯时 decrease；
- 最近 {recentActionWindowHours} 小时内聊天次数 {chatCount}，动作统计: {recentActionCountsText}，若提升/降低刷屏应警惕刷分或持续冒犯；
- 单次提升不超过 {maxIncreasePerMessage} ，单词减少不超过 {maxDecreasePerMessage}；
- 输出前再次验证 action 是否符合上下文与阈值逻辑，并简述我为何 increase/decrease/hold；
- 仅输出 JSON：{"delta": 整数, "action": "increase|decrease|hold", "reason": "简短中文原因"}。

用于参考的背景信息:
人设：{persona}
当前关系: {currentRelationship}
当前好感度: {currentAffinity}（范围 {minAffinity} ~ {maxAffinity}）
上下文:
{historyText}

本次用户消息：
{userMessage}

本次Bot回复：
{botReply}`

export const SCHEDULE_PROMPT = `你是一名擅长写作日常作息的助理，需要基于角色人设生成今日全日计划和穿搭。
今天是 {date}（{weekday}）。
人设：{persona}
今日天气：{weather}
请输出 JSON，结构如下：
{
  "title": "📅 今日日程",
  "description": "一段带有角色情绪的总述",
  "entries": [
    { "start": "00:00", "end": "07:00", "activity": "睡觉", "detail": "符合人设的描写" }
  ],
  "outfits": [
    { "start": "07:00", "end": "12:00", "description": "白色蕾丝内衣、水手服上衣、藏蓝色百褶裙、白色过膝袜、黑色小皮鞋、蝴蝶结发饰" }
  ]
}
要求：
1. entries 至少 10 项，覆盖 00:00-24:00，时间格式 HH:MM，并保持时段衔接自然；
2. 请结合当前日期安排日程：工作日突出学习/工作与效率，休息日强调放松与兴趣；如遇节假日尤其春节，请写出应有的仪式感与特殊活动；
3. 活动名称与描述要符合人设语气；
4. 整体日程安排须符合角色人设的生活方式与优先级；
5. 如果提供了天气信息，请结合当日天气合理安排活动，如雨天减少外出、晴天适合户外活动等；
6. outfits 至少 2 套穿搭，每套使用 start/end 指定时间段（HH:MM 格式），穿搭按从里到外、从上到下顺序描述，包含内衣、上装、下装、袜子、鞋子、饰品等，须符合天气和人设风格；
7. 仅输出 JSON，不要附加解释。`

export const BLACKLIST_REPLY_TEMPLATE = ''

export const DEFAULT_ANALYSIS_PROMPT = ANALYSIS_PROMPT
export const DEFAULT_SCHEDULE_PROMPT = SCHEDULE_PROMPT
