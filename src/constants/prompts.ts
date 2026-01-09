/**
 * 提示词模板
 * 包含日程生成等 LLM 提示词
 */

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

export const DEFAULT_SCHEDULE_PROMPT = SCHEDULE_PROMPT
