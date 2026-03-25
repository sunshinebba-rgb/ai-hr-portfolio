/**
 * 与 docs/rules.md · model_logic.nine_box.x_axis.daily_work_evaluation 对齐
 * 日常工作三项：十分制档位与原文描述
 */

export type DailyAxisKey = 'contribution' | 'quality' | 'timeliness'

export type PerfBand = '0-2' | '3-5' | '6-8' | '9-10'

/** 档位对应十分制分值（用于日常均分） */
export const TIER_NUMERIC_10: Record<PerfBand, number> = {
  '0-2': 1,
  '3-5': 4,
  '6-8': 7,
  '9-10': 9.5
}

/** rules.md 原文：各维度 × 各档位 */
export const DAILY_RULE_TEXT: Record<DailyAxisKey, Record<PerfBand, string>> = {
  contribution: {
    '0-2': '岗位工作贡献未达到预期，需密切关注',
    '3-5': '岗位工作贡献达到预期，按部就班完成任务',
    '6-8': '岗位工作贡献超出预期，能主动承担额外职责',
    '9-10': '岗位工作贡献远超预期，对部门业务产生显著推动'
  },
  quality: {
    '0-2': '工作质量不符合期望，达不到基本岗位要求',
    '3-5': '工作质量勉强符合期望，存在小瑕疵但基本达标',
    '6-8': '工作质量符合期望，能稳定交付高质量产出',
    '9-10': '工作质量卓越，完全胜任岗位要求且具备标杆水准'
  },
  timeliness: {
    '0-2': '工作几乎不能按期完成，经常性拖延，影响团队进度',
    '3-5': '部分工作能按时完成，偶尔存在拖延现象',
    '6-8': '大部分工作能按时完成，项目推进效率较高',
    '9-10': '所有工作都能及时或提前完成，具备极强的节奏感'
  }
}

export const DAILY_AXIS_META: { key: DailyAxisKey; title: string }[] = [
  { key: 'contribution', title: '工作贡献' },
  { key: 'quality', title: '工作质量' },
  { key: 'timeliness', title: '及时性' }
]

export const DAILY_TIER_SEGMENTS: { key: PerfBand; segmentLabel: string }[] = [
  { key: '0-2', segmentLabel: '0-2' },
  { key: '3-5', segmentLabel: '3-5' },
  { key: '6-8', segmentLabel: '6-8' },
  { key: '9-10', segmentLabel: '9-10' }
]
