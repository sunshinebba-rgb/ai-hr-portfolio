/**
 * 横轴日常工作：一至四分档位 + 规则库语义（对应原 待改进/合格/良好/卓越）
 */

export type DailyAxisKey = 'contribution' | 'quality' | 'timeliness'

/** 一至四分：待改进、合格、良好、卓越 */
export type DailyPointLevel = 1 | 2 | 3 | 4

export const DAILY_POINT_LABELS: Record<DailyPointLevel, string> = {
  1: '待改进',
  2: '合格',
  3: '良好',
  4: '卓越'
}

export const DAILY_POINT_LEVELS: DailyPointLevel[] = [1, 2, 3, 4]

/** 日常得分（百分制）= ((Σ三项 - 3) / 9) * 100 */
export function computeDailyWorkPercent(d: {
  contribution: DailyPointLevel | null
  quality: DailyPointLevel | null
  timeliness: DailyPointLevel | null
}): number | null {
  if (d.contribution == null || d.quality == null || d.timeliness == null) return null
  const sum = d.contribution + d.quality + d.timeliness
  return ((sum - 3) / 9) * 100
}

/** 横轴总分（百分制）= 绩效×0.7 + 日常得分×0.3 */
export function computeXAxisTotal(perf: number, dailyPct: number): number {
  return Math.round(Math.min(100, Math.max(0, perf * 0.7 + dailyPct * 0.3)))
}

export const DAILY_RULE_TEXT: Record<DailyAxisKey, Record<DailyPointLevel, string>> = {
  contribution: {
    1: '岗位工作贡献未达到预期，需密切关注',
    2: '岗位工作贡献达到预期，按部就班完成任务',
    3: '岗位工作贡献超出预期，能主动承担额外职责',
    4: '岗位工作贡献远超预期，对部门业务产生显著推动'
  },
  quality: {
    1: '工作质量不符合期望，达不到基本岗位要求',
    2: '工作质量勉强符合期望，存在小瑕疵但基本达标',
    3: '工作质量符合期望，能稳定交付高质量产出',
    4: '工作质量卓越，完全胜任岗位要求且具备标杆水准'
  },
  timeliness: {
    1: '工作几乎不能按期完成，经常性拖延，影响团队进度',
    2: '部分工作能按时完成，偶尔存在拖延现象',
    3: '大部分工作能按时完成，项目推进效率较高',
    4: '所有工作都能及时或提前完成，具备极强的节奏感'
  }
}

export const DAILY_AXIS_META: { key: DailyAxisKey; title: string }[] = [
  { key: 'contribution', title: '工作贡献' },
  { key: 'quality', title: '工作质量' },
  { key: 'timeliness', title: '完成及时性' }
]

/** 表单 / 实验室：一至四分按钮 */
export const DAILY_TIER_SEGMENTS: { key: DailyPointLevel; segmentLabel: string }[] = DAILY_POINT_LEVELS.map(n => ({
  key: n,
  segmentLabel: `${n} · ${DAILY_POINT_LABELS[n]}`
}))

/** 每个维度下的短标题 */
export const DAILY_TIER_HEADLINE: Record<DailyAxisKey, Record<DailyPointLevel, string>> = {
  contribution: {
    1: '待改进 · 工作贡献',
    2: '合格 · 工作贡献',
    3: '良好 · 工作贡献',
    4: '卓越 · 工作贡献'
  },
  quality: {
    1: '待改进 · 工作质量',
    2: '合格 · 工作质量',
    3: '良好 · 工作质量',
    4: '卓越 · 工作质量'
  },
  timeliness: {
    1: '待改进 · 及时性',
    2: '合格 · 及时性',
    3: '良好 · 及时性',
    4: '卓越 · 及时性'
  }
}

/** @deprecated 实验室旧逻辑兼容：映射到一至四分的中位语义 */
export type PerfBand = '0-2' | '3-5' | '6-8' | '9-10'

export const BAND_TO_POINT: Record<PerfBand, DailyPointLevel> = {
  '0-2': 1,
  '3-5': 2,
  '6-8': 3,
  '9-10': 4
}

export const POINT_TO_BAND: Record<DailyPointLevel, PerfBand> = {
  1: '0-2',
  2: '3-5',
  3: '6-8',
  4: '9-10'
}
