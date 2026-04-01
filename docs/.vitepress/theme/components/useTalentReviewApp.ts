import { ref, reactive, computed, watch, onMounted } from 'vue'
import type { TalentRecord, EmployeeInput, AIAnalysis, JobTier } from './types'
import { GRID_MAP } from './types'
import { loadRecords, saveRecords, addRecord, deleteRecord } from './lib/storage'
import { runAIAnalysis } from './lib/aiEngine'
import { SEED_RECORDS } from './data/seedData'
import {
  PRESET_WEIGHTS,
  COMPETENCY_SOURCES,
  buildTableRows,
  parseScaleBands,
  type CompetencySourceRow,
  type OrgLevel,
  type ScaleBandLine
} from './competencyRules'
import {
  DAILY_AXIS_META,
  DAILY_RULE_TEXT,
  DAILY_TIER_SEGMENTS,
  DAILY_TIER_HEADLINE,
  computeDailyWorkPercent,
  computeXAxisTotal,
  BAND_TO_POINT,
  type DailyAxisKey,
  type DailyPointLevel,
  type PerfBand
} from './dailyWorkRules'
import { semanticScanComment } from './lib/semanticEngine'

export function useTalentReviewApp() {
/** 与 public/data/test_cases.json 对齐 */
interface TestCaseJson {
  id: string
  name: string
  level: string
  department: string
  raw_review: string
  manual_tags: string[]
  expected_box: string
  pred_performance?: number
  pred_potential?: number
}

const importedCases = ref<TestCaseJson[]>([])
const importLoading = ref(false)
const importError = ref('')

type Tab = 'dashboard' | 'list' | 'add' | 'detail' | 'cases'
type View = { tab: Tab; id?: string }
type GridInfo = (typeof GRID_MAP)[string]
type FullRow = TalentRecord & { perf: number; pot: number; pos: string; grid: GridInfo }

const DEPTS = ['产品部', '研发部', '技术部', '市场部', '运营部', '人力行政部', '业务部'] as const
const TENURES = ['1年', '2年', '3年', '5年+'] as const

const JOB_TIER_OPTIONS: JobTier[] = ['基层', '中层', '高层']

function jobTierToOrg(jt: JobTier): 'junior' | 'middle' | 'senior' {
  return jt === '基层' ? 'junior' : jt === '中层' ? 'middle' : 'senior'
}

function emptyScoresForTier(jt: JobTier): Record<string, number | null> {
  const org = jobTierToOrg(jt)
  const o: Record<string, number | null> = {}
  for (const r of COMPETENCY_SOURCES[org]) o[r.rowKey] = null
  return o
}

const statPalette: Record<string, string> = {
  blue: '#3b82f6',
  green: '#22c55e',
  red: '#ef4444',
  purple: '#a855f7',
  amber: '#f59e0b'
}

/** 策略中心：最低字数 + 当前层级下的维度权重（与 Tab2 实时联动） */
interface RuleConfigShape {
  minChars: number
  dimensionWeights: Record<string, number>
}

const strategyCenterTab = ref<'rules' | 'lab'>('rules')
const labDisputedFilter = ref(false)
const labReviewDrafts = reactive<Record<string, string>>({})

const ruleOrgLevel = ref<OrgLevel>('junior')

const orgLevelOptions: { value: OrgLevel; label: string }[] = [
  { value: 'junior', label: '基层员工' },
  { value: 'middle', label: '中层管理者' },
  { value: 'senior', label: '高层管理者' }
]

function clonePresetWeights(level: OrgLevel): Record<string, number> {
  return { ...PRESET_WEIGHTS[level] }
}

const ruleConfig = reactive<RuleConfigShape>({
  minChars: 20,
  dimensionWeights: clonePresetWeights('junior')
})

const competencyRowsForLevel = computed(() => buildTableRows(ruleOrgLevel.value))

function setOrgLevel(level: OrgLevel) {
  ruleOrgLevel.value = level
  const next = clonePresetWeights(level)
  for (const k of Object.keys(ruleConfig.dimensionWeights)) delete ruleConfig.dimensionWeights[k]
  for (const [k, v] of Object.entries(next)) {
    ruleConfig.dimensionWeights[k] = v
  }
}

interface LabDailyTiers {
  contribution: DailyPointLevel | null
  quality: DailyPointLevel | null
  timeliness: DailyPointLevel | null
}

interface LabPerfInput {
  averagePerformanceScore: number | null
  dailyTiers: LabDailyTiers
}

const labPerfInputs = reactive<Record<string, LabPerfInput>>({})
const labCaseMeta = reactive<Record<string, { quarter: string; scenario: string }>>({})

const quarterOptions = [
  '二〇二六年第一季度',
  '二〇二六年第二季度',
  '二〇二六年第三季度',
  '二〇二六年第四季度'
]
const feedbackScenarioOptions = ['季度考核', '三百六十度反馈', '项目总结'] as const

function dailyRuleLine(axisKey: DailyAxisKey, tier: DailyPointLevel | null | undefined): string {
  if (!tier) return ''
  return DAILY_RULE_TEXT[axisKey][tier]
}

function ensureLabPerfRow(id: string) {
  if (!labPerfInputs[id]) {
    labPerfInputs[id] = {
      averagePerformanceScore: null,
      dailyTiers: { contribution: null, quality: null, timeliness: null }
    }
  }
}

function ensureLabMetaRow(id: string) {
  if (!labCaseMeta[id]) labCaseMeta[id] = { quarter: '', scenario: '' }
}

function setDailyTier(caseId: string, axis: keyof LabDailyTiers, tier: DailyPointLevel) {
  ensureLabPerfRow(caseId)
  const cur = labPerfInputs[caseId].dailyTiers[axis]
  labPerfInputs[caseId].dailyTiers[axis] = cur === tier ? null : tier
}

function onLabAvgPerfInput(caseId: string, e: Event) {
  ensureLabPerfRow(caseId)
  const raw = (e.target as HTMLInputElement).value.trim()
  if (raw === '') {
    labPerfInputs[caseId].averagePerformanceScore = null
    return
  }
  const n = Math.max(0, Math.min(100, Math.round(parseFloat(raw) || 0)))
  labPerfInputs[caseId].averagePerformanceScore = n
}

function setLabQuarterFromEvent(caseId: string, e: Event) {
  ensureLabMetaRow(caseId)
  labCaseMeta[caseId].quarter = (e.target as HTMLSelectElement).value
}

function setLabScenarioFromEvent(caseId: string, e: Event) {
  ensureLabMetaRow(caseId)
  labCaseMeta[caseId].scenario = (e.target as HTMLSelectElement).value
}

function desensitizeText(raw: string): string {
  let t = raw || ''
  t = t.replace(/\d{4,}/g, '【数值已掩码】')
  t = t.replace(
    /[\u4e00-\u9fa5]{2,4}(省|市|区|县|路|街|道|号|室)/g,
    '【地址已掩码】'
  )
  t = t.replace(
    /(?:张|李|王|刘|陈|杨|赵|黄|周|吴|徐|孙|胡|朱|高|林|何|郭|马|罗|梁|宋|郑|谢|韩|唐|冯|于|董|萧|程|曹|袁|邓|许|傅|沈|曾|彭|吕|苏|卢|蒋|蔡|贾|丁|魏|薛|叶|阎|余|潘|杜|戴|夏|锺|汪|田|任|姜|范|方|石|姚|谭|廖|邹|熊|金|陆|郝|孔|白|崔|康|毛|邱|秦|江|史|顾|侯|邵|孟|龙|万|段|漕|钱|汤|尹|黎|易|常|武|乔|贺|赖|龚|文)[\u4e00-\u9fa5]{1,2}/g,
    '【姓名占位】'
  )
  return t
}

function desensitizeLabText(caseId: string): string {
  const c = importedCases.value.find(x => x.id === caseId)
  const raw = labReviewDrafts[caseId] ?? c?.raw_review ?? ''
  return desensitizeText(raw)
}

function smartPromptForCase(caseId: string): string {
  ensureLabPerfRow(caseId)
  const inp = labPerfInputs[caseId]
  const parts: string[] = []
  parts.push('请结合已选日常工作档位与平均绩效得分，在评语中补充可核验的行为事例，便于证据溯源与策略校准。')
  if (inp.averagePerformanceScore != null) {
    parts.push(`已录入平均绩效得分 ${inp.averagePerformanceScore} 分。`)
  } else {
    parts.push('平均绩效得分尚未填写，业绩侧将更多依赖评语中的结果类表述估计。')
  }
  const labels: Record<keyof LabDailyTiers, string> = {
    contribution: '【工作贡献】',
    quality: '【工作质量】',
    timeliness: '【及时性】'
  }
  ;(['contribution', 'quality', 'timeliness'] as const).forEach(k => {
    const t = inp.dailyTiers[k]
    if (t) parts.push(`${labels[k]}已选 ${t} 分档。`)
  })
  return parts.join('')
}

const orgLevelGuidanceKeywords = computed(() => {
  const rows = COMPETENCY_SOURCES[ruleOrgLevel.value]
  const dims = [...new Set(rows.map(r => r.dimensionLabel))]
  const words = rows.flatMap(r => [...r.positive, ...r.negative])
  const uniq = [...new Set(words)]
  return { dims, words: uniq }
})

interface ScaleBandHighlight {
  competencyName: string
  dimensionKey: string
  bandLabel: string
  lineText: string
}

function computeScaleHighlights(text: string, orgLevel: OrgLevel): ScaleBandHighlight[] {
  const rows = COMPETENCY_SOURCES[orgLevel]
  const out: ScaleBandHighlight[] = []
  for (const row of rows) {
    const bands = parseScaleBands(row.scaleText)
    if (bands.length === 0) continue
    let hit: ScaleBandLine | null = null
    outer: for (const neg of row.negative) {
      if (neg && text.includes(neg)) {
        for (const b of bands) {
          if (b.text.includes(neg)) {
            hit = b
            break outer
          }
        }
        hit = bands.find(b => b.label === '0-1') ?? bands[0]
        break
      }
    }
    if (!hit) {
      for (const pos of row.positive) {
        if (pos && text.includes(pos)) {
          for (const b of bands) {
            if (b.text.includes(pos)) {
              hit = b
              break
            }
          }
          if (!hit) {
            const b45 = bands.find(b => b.label === '4-5')
            hit = b45 ?? bands[Math.min(2, bands.length - 1)]
          }
          break
        }
      }
    }
    if (hit) {
      out.push({
        competencyName: row.competencyName,
        dimensionKey: row.dimensionKey,
        bandLabel: hit.label,
        lineText: hit.text
      })
    }
  }
  return out
}

function matchedNegativesInText(text: string, orgLevel: OrgLevel): string[] {
  const rows = COMPETENCY_SOURCES[orgLevel]
  const out: string[] = []
  for (const r of rows) {
    for (const n of r.negative) {
      if (n && text.includes(n) && !out.includes(n)) out.push(n)
    }
  }
  return out
}

function detectTimelinessConflict(text: string, labInput?: LabPerfInput): boolean {
  if (!labInput?.dailyTiers.timeliness) return false
  const t = labInput.dailyTiers.timeliness
  if (t !== 4) return false
  const cues = ['经常延期', '延期', '拖延', '不能按期', '未按时', '拖期', '延误', '屡次延期']
  return cues.some(c => text.includes(c))
}

function buildConfidence(
  low: boolean,
  len: number,
  conflict: boolean
): { level: string; detail: string } {
  if (conflict) return { level: '低', detail: '及时性档位与评语表述存在冲突，需人工复核' }
  if (low) return { level: '低', detail: '评语字数低于阈值，置信偏低' }
  if (len > 50) return { level: '高', detail: '文本较充分，证据链可支撑推断' }
  return { level: '中', detail: '建议结合实例与关键事件再复核' }
}

function labDailyBreakdown(caseId: string) {
  ensureLabPerfRow(caseId)
  const inp = labPerfInputs[caseId]
  const d = inp.dailyTiers
  const dailyPct = computeDailyWorkPercent({
    contribution: d.contribution,
    quality: d.quality,
    timeliness: d.timeliness
  })
  const a = labAnalysisByCaseId.value[caseId]
  const hasAvg =
    inp.averagePerformanceScore !== null && !Number.isNaN(Number(inp.averagePerformanceScore))
  const effPerf = hasAvg
    ? Math.max(0, Math.min(100, Number(inp.averagePerformanceScore)))
    : (a?.keywordPerfEstimate ?? 0)
  const term1 = effPerf * 0.7
  const term2 = dailyPct !== null ? dailyPct * 0.3 : 0
  const totalComposite =
    dailyPct !== null ? computeXAxisTotal(effPerf, dailyPct) : Math.round(Math.min(100, Math.max(0, effPerf)))
  return {
    dailyPct,
    term1: Math.round(term1 * 10) / 10,
    term2: Math.round(term2 * 10) / 10,
    totalPerf: a?.performanceScore ?? 0,
    effPerf,
    hasAvg,
    totalComposite
  }
}

function labSixReport(caseId: string) {
  const a = labAnalysisByCaseId.value[caseId]
  const text = labReviewDrafts[caseId] ?? importedCases.value.find(x => x.id === caseId)?.raw_review ?? ''
  const grid = labGridKey(caseId)
  const perf = a?.performanceScore ?? 0
  const pot = a?.potentialScore ?? 0
  const perfBand = perf >= 86 ? '高' : perf >= 61 ? '中' : '低'
  const potBand = pot >= 86 ? '高' : pot >= 61 ? '中' : '低'
  const ev = desensitizeText(text)
  const snippet = ev.length > 120 ? ev.slice(0, 120) + '…' : ev || '—'
  const neg = matchedNegativesInText(text, ruleOrgLevel.value)
  return {
    coord: `九宫格坐标 ${grid}（业绩：${perfBand}、潜力：${potBand}）`,
    tags: (a?.matchedKeywords ?? []).slice(0, 8).join('、') || '—',
    evidence: snippet,
    improve: neg.length ? neg.join('、') : '—',
    idp: gridActionSuggestion(grid),
    conf: `${a?.confidenceLevel ?? '—'} · ${a?.confidenceDetail ?? ''}`
  }
}

/** 绩效侧关键词（结果与交付导向） */
const PERFORMANCE_KEYWORDS = ['达成', '指标', '超额', '完成', '质量', '交付', '成果', '领先', '达标', '业绩']

interface TalentAnalysisResult {
  dimensionScores: Record<string, number>
  performanceScore: number
  potentialScore: number
  lowConfidence: boolean
  matchedKeywords: string[]
  keywordPerfEstimate: number
  scaleHighlights: ScaleBandHighlight[]
  confidenceLevel: string
  confidenceDetail: string
  timelinessConflict: boolean
}

function keywordPerformanceEstimate(text: string, matchedKeywords: string[]): number {
  let perfHits = 0
  for (const kw of PERFORMANCE_KEYWORDS) {
    if (text.includes(kw)) {
      perfHits += 1
      if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw)
    }
  }
  return Math.min(100, Math.round(38 + perfHits * 9))
}

/** 业绩综合分（百分制）= 绩效得分×0.7 + 日常得分×0.3；日常得分 = ((Σ三项−3)/9)×100 */
function compositePerformanceScore(
  keywordPerf: number,
  labInput: LabPerfInput | undefined
): number {
  if (!labInput) return keywordPerf
  const d = labInput.dailyTiers
  const dailyPct = computeDailyWorkPercent({
    contribution: d.contribution,
    quality: d.quality,
    timeliness: d.timeliness
  })
  const anyDaily = dailyPct !== null
  const avg = labInput.averagePerformanceScore
  const hasAvg = avg !== null && avg !== undefined && !Number.isNaN(Number(avg))

  if (!hasAvg && !anyDaily) return keywordPerf
  const perfPart = hasAvg ? Math.max(0, Math.min(100, Number(avg))) : keywordPerf
  if (dailyPct === null) return Math.round(perfPart)
  return computeXAxisTotal(perfPart, dailyPct)
}

function analyzeTalentLogic(
  rawReview: string,
  cfg: RuleConfigShape,
  orgLevel: OrgLevel,
  labInput?: LabPerfInput
): TalentAnalysisResult {
  const text = rawReview || ''
  const len = text.replace(/\s/g, '').length
  const lowConfidence = len < cfg.minChars

  const matchedKeywords: string[] = []
  const rows = COMPETENCY_SOURCES[orgLevel]
  const { scores: semScores } = semanticScanComment(text, orgLevel)
  const byDim: Record<string, number[]> = {}

  for (const r of rows) {
    const s7 = Math.max(0, Math.min(7, semScores[r.rowKey] ?? 3))
    const s100 = (s7 / 7) * 100
    if (!byDim[r.dimensionKey]) byDim[r.dimensionKey] = []
    byDim[r.dimensionKey].push(s100)
    for (const w of r.positive) {
      if (w && text.includes(w) && !matchedKeywords.includes(w)) matchedKeywords.push(w)
    }
    for (const w of r.negative) {
      if (w && text.includes(w) && !matchedKeywords.includes(w)) matchedKeywords.push(w)
    }
  }

  const dimensionScores: Record<string, number> = {}
  for (const [dk, arr] of Object.entries(byDim)) {
    dimensionScores[dk] = Math.round(arr.reduce((s, x) => s + x, 0) / arr.length)
  }

  const keywordPerf = keywordPerformanceEstimate(text, matchedKeywords)
  const performanceScore = compositePerformanceScore(keywordPerf, labInput)
  const scaleHighlights = computeScaleHighlights(text, orgLevel)
  const timelinessConflict = detectTimelinessConflict(text, labInput)
  const conf = buildConfidence(lowConfidence, text.replace(/\s/g, '').length, timelinessConflict)

  const w = cfg.dimensionWeights
  const wSum = Object.values(w).reduce((s, x) => s + x, 0) || 100
  let potAcc = 0
  for (const [dk, dimScore] of Object.entries(dimensionScores)) {
    const wt = w[dk] ?? 0
    potAcc += dimScore * (wt / wSum)
  }
  const potentialScore = Math.round(potAcc)

  return {
    dimensionScores,
    performanceScore,
    potentialScore,
    lowConfidence,
    matchedKeywords,
    keywordPerfEstimate: keywordPerf,
    scaleHighlights,
    confidenceLevel: conf.level,
    confidenceDetail: conf.detail,
    timelinessConflict
  }
}

const labAnalysisByCaseId = computed(() => {
  const map: Record<string, TalentAnalysisResult> = {}
  for (const c of importedCases.value) {
    const text = labReviewDrafts[c.id] ?? c.raw_review
    ensureLabPerfRow(c.id)
    map[c.id] = analyzeTalentLogic(text, ruleConfig, ruleOrgLevel.value, labPerfInputs[c.id])
  }
  return map
})

const labVisibleCases = computed(() => {
  const list = importedCases.value
  if (!labDisputedFilter.value) return list
  return list.filter(c => isHighDisputeCase(c.id))
})

const disputedCaseCount = computed(
  () => importedCases.value.filter(c => isHighDisputeCase(c.id)).length
)

/** 九宫格 → 行动建议（右栏） */
const GRID_ACTION_COPY: Record<string, string> = {
  '3-3':
    '建议纳入继任计划与关键岗位梯队，配置高潜加速培养、股权激励或项目负责制。',
  '1-1':
    '建议启动绩效改进计划或转岗、退出访谈，明确改进窗口、证据链与人力业务伙伴陪跑。',
  '3-1':
    '建议作为专家型、资源池储备，强化技术或业务深度，减少纯管理负荷，匹配导师制。',
  '2-3':
    '建议授权挑战性项目与跨部门轮岗，纳入骨干池并定期复盘成长速度。',
  '3-2':
    '建议结果激励与潜力投资并举，关注倦怠风险，配置弹性目标与休假。',
  '2-2':
    '建议作为中坚力量稳定输出，配套标准化培养与适度轮岗，巩固团队基本盘。',
  '1-3':
    '建议设定清晰改进里程碑与辅导资源，观察期后复核是否调岗或降级使用。',
  '2-1':
    '建议强化基本功培训与过程管理，设定可量化的小步目标与周频反馈。',
  '1-2':
    '建议关注动机与岗位匹配度，结合全周期反馈与校准会讨论是否转岗或降级。'
}

function gridActionSuggestion(gridKey: string): string {
  return GRID_ACTION_COPY[gridKey] ?? '建议结合部门目标与校准会结论，制定个性化发展、风险与激励组合预案。'
}

function dimensionContributions(caseId: string) {
  const a = labAnalysisByCaseId.value[caseId]
  if (!a) return []
  const wSum = Object.values(ruleConfig.dimensionWeights).reduce((s, w) => s + w, 0) || 1
  return Object.keys(a.dimensionScores).map(dimensionKey => {
    const w = ruleConfig.dimensionWeights[dimensionKey] ?? 0
    const ds = a.dimensionScores[dimensionKey] ?? 0
    const toPot = wSum > 0 ? (ds * w) / wSum : 0
    return {
      dimensionKey,
      dimension: dimensionKey,
      dimScore: ds,
      weight: w,
      toPotential: Math.round(toPot * 10) / 10
    }
  })
}

function hasTimelinessConflictCase(caseId: string): boolean {
  const text = labReviewDrafts[caseId] ?? importedCases.value.find(c => c.id === caseId)?.raw_review ?? ''
  ensureLabPerfRow(caseId)
  return detectTimelinessConflict(text, labPerfInputs[caseId])
}

function isHighDisputeCase(caseId: string): boolean {
  if (hasTimelinessConflictCase(caseId)) return true
  const gp = gapPerf(caseId)
  const gt = gapPot(caseId)
  const hitP = gp !== null && Math.abs(gp) > 15
  const hitT = gt !== null && Math.abs(gt) > 15
  return hitP || hitT
}

function goToCalibrationMeeting() {
  labDisputedFilter.value = true
  strategyCenterTab.value = 'lab'
  setView('cases')
}

function setLabDraftFromEvent(caseId: string, e: Event) {
  labReviewDrafts[caseId] = (e.target as HTMLInputElement).value
}

function hrNumberInputPerf(caseId: string, e: Event) {
  setHrPerfNumber(caseId, (e.target as HTMLInputElement).value)
}

function hrNumberInputPot(caseId: string, e: Event) {
  setHrPotNumber(caseId, (e.target as HTMLInputElement).value)
}

/** 橄榄型：中段九宫格占比接近正态中部；用于管理看板提示 */
const oliveDistributionInsight = computed(() => {
  const n = fullData.value.length
  if (n === 0) {
    return {
      label: '暂无大盘样本',
      ratioText: '—',
      ok: true,
      hint: '导入或录入人才后，将自动评估分布形态。'
    }
  }
  const midBand = new Set(['2-2', '2-3', '3-2', '1-2', '2-1', '3-1', '1-3'])
  const mid = fullData.value.filter(d => midBand.has(d.pos)).length
  const ratio = mid / n
  const ok = ratio >= 0.42 && ratio <= 0.78
  return {
    label: ok ? '趋近橄榄型（中段饱满）' : '分布偏斜',
    ratioText: `${Math.round(ratio * 100)}%`,
    ok,
    hint: ok
      ? '中段格子占比合理，利于组织韧性与梯队厚度；可继续观察两端极端格比例。'
      : '中段占比偏离经验区间，建议结合校准会与外部市场对标，检查评分松紧与采样偏差。'
  }
})

const aiLandingRoadmap = [
  {
    phase: '1. 素材与语义',
    risk: '评语质量参差、脱敏不彻底',
    action: '统一采集模板、最低字数门槛与敏感信息清洗'
  },
  {
    phase: '2. 模型与规则',
    risk: '权重与业务语境脱节',
    action: '季度回溯争议案例，滚动更新关键词与权重配置'
  },
  {
    phase: '3. 人机协同',
    risk: '人力与模型推断分歧积累信任成本',
    action: '固定校准会机制，分差超阈自动上会'
  },
  {
    phase: '4. 运营闭环',
    risk: '结果未回灌业务系统',
    action: '九宫格结果对接继任、激励与培训工单'
  }
] as const

/** HR 校准覆盖：caseId → 人工分（未设置则沿用 AI） */
const hrOverride = reactive<Record<string, { hrPerf?: number; hrPot?: number }>>({})

function ensureHrOverrideRow(id: string) {
  if (!hrOverride[id]) hrOverride[id] = {}
}

function setHrPerfFromEvent(caseId: string, e: Event) {
  const t = e.target as HTMLInputElement
  ensureHrOverrideRow(caseId)
  hrOverride[caseId].hrPerf = +t.value
}

function setHrPotFromEvent(caseId: string, e: Event) {
  const t = e.target as HTMLInputElement
  ensureHrOverrideRow(caseId)
  hrOverride[caseId].hrPot = +t.value
}

function setHrPerfNumber(caseId: string, raw: string) {
  const n = Math.max(0, Math.min(100, Math.round(parseFloat(raw) || 0)))
  ensureHrOverrideRow(caseId)
  hrOverride[caseId].hrPerf = n
}

function setHrPotNumber(caseId: string, raw: string) {
  const n = Math.max(0, Math.min(100, Math.round(parseFloat(raw) || 0)))
  ensureHrOverrideRow(caseId)
  hrOverride[caseId].hrPot = n
}

function displayLabPerf(caseId: string): number {
  const ai = labAnalysisByCaseId.value[caseId]?.performanceScore ?? 0
  const hr = hrOverride[caseId]?.hrPerf
  return hr !== undefined && hr !== null ? hr : ai
}

function displayLabPot(caseId: string): number {
  const ai = labAnalysisByCaseId.value[caseId]?.potentialScore ?? 0
  const hr = hrOverride[caseId]?.hrPot
  return hr !== undefined && hr !== null ? hr : ai
}

function labGridKey(caseId: string): string {
  return getGridPos(displayLabPerf(caseId), displayLabPot(caseId))
}

function gapPerf(caseId: string): number | null {
  const ai = labAnalysisByCaseId.value[caseId]?.performanceScore
  if (ai === undefined) return null
  if (!hrOverride[caseId] || hrOverride[caseId].hrPerf === undefined) return null
  const hr = hrOverride[caseId].hrPerf as number
  return Math.round((hr - ai) * 10) / 10
}

function gapPot(caseId: string): number | null {
  const ai = labAnalysisByCaseId.value[caseId]?.potentialScore
  if (ai === undefined) return null
  if (!hrOverride[caseId] || hrOverride[caseId].hrPot === undefined) return null
  const hr = hrOverride[caseId].hrPot as number
  return Math.round((hr - ai) * 10) / 10
}

watch(
  () => importedCases.value.map(c => c.id),
  ids => {
    for (const id of Object.keys(hrOverride)) {
      if (!ids.includes(id)) delete hrOverride[id]
    }
    for (const id of Object.keys(labPerfInputs)) {
      if (!ids.includes(id)) delete labPerfInputs[id]
    }
    for (const id of Object.keys(labCaseMeta)) {
      if (!ids.includes(id)) delete labCaseMeta[id]
    }
  }
)

watch(
  labPerfInputs,
  () => {
    if (importedCases.value.length === 0) return
    records.value = records.value.map(r => {
      if (!r.employee.id.startsWith('testcase-')) return r
      const shortId = r.employee.id.replace(/^testcase-/, '')
      const c = importedCases.value.find(x => x.id === shortId)
      if (!c) return r
      return testCaseJsonToRecord(c)
    })
    saveRecords(records.value)
  },
  { deep: true }
)

function expectedBoxBadgeClass(box: string): string {
  const map: Record<string, string> = {
    '3-3': 'bg-emerald-100 text-emerald-800 ring-emerald-200/80',
    '2-3': 'bg-sky-100 text-sky-800 ring-sky-200/80',
    '3-2': 'bg-sky-100 text-sky-800 ring-sky-200/80',
    '2-2': 'bg-violet-100 text-violet-800 ring-violet-200/80',
    '1-3': 'bg-amber-100 text-amber-800 ring-amber-200/80',
    '3-1': 'bg-amber-100 text-amber-800 ring-amber-200/80',
    '2-1': 'bg-orange-100 text-orange-800 ring-orange-200/80',
    '1-2': 'bg-orange-100 text-orange-800 ring-orange-200/80',
    '1-1': 'bg-rose-100 text-rose-800 ring-rose-200/80'
  }
  return map[box] ?? 'bg-slate-100 text-slate-700 ring-slate-200/80'
}

function scoreToGrade(s: number): 1 | 2 | 3 {
  if (s >= 80) return 3
  if (s >= 60) return 2
  return 1
}

function getGridPos(perf: number, pot: number): string {
  return `${scoreToGrade(perf)}-${scoreToGrade(pot)}`
}

function riskFromGrid(g: GridInfo): '高' | '中' | '低' {
  return (g.id === '5' ? '高' : g.id === '4' || g.id === '3' ? '中' : '低') as '高' | '中' | '低'
}

function riskBadgeCls(level?: '高' | '中' | '低') {
  if (!level) return 'text-slate-300'
  return level === '高'
    ? 'bg-red-100 text-red-700'
    : level === '中'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-green-100 text-green-700'
}

/** 将测试集单条转为 TalentRecord；分数由 analyzeTalentLogic 与当前 ruleConfig、层级与实验室矩阵输入驱动 */
function testCaseJsonToRecord(c: TestCaseJson): TalentRecord {
  ensureLabPerfRow(c.id)
  const inferred = analyzeTalentLogic(
    c.raw_review,
    ruleConfig,
    ruleOrgLevel.value,
    labPerfInputs[c.id]
  )
  const perf = inferred.performanceScore
  const pot = inferred.potentialScore
  const gridPosition = getGridPos(perf, pot)
  const grid = GRID_MAP[gridPosition] || GRID_MAP['2-2']
  const riskLevel = riskFromGrid(grid)
  const jt: JobTier =
    c.level === 'senior' ? '高层' : c.level === 'middle' ? '中层' : c.level === 'junior' ? '基层' : '基层'
  const org = jobTierToOrg(jt)
  const { scores: semScores, hits: semHits } = semanticScanComment(c.raw_review, org)
  const competencyScores: Record<string, number | null> = {}
  for (const r of COMPETENCY_SOURCES[org]) {
    competencyScores[r.rowKey] = Math.max(0, Math.min(7, Math.round(semScores[r.rowKey] ?? 3)))
  }

  const employee: EmployeeInput = {
    id: `testcase-${c.id}`,
    name: c.name,
    department: c.department,
    role: '实验室样本',
    level: jt,
    jobTier: jt,
    tenure: '2年',
    performanceScore: perf,
    dailyTiers: { contribution: 3, quality: 3, timeliness: 3 },
    competencyScores,
    performanceComment: c.raw_review,
    keyEvents: '',
    developmentFeedback: ''
  }

  const tags = c.manual_tags.length ? c.manual_tags : ['模拟导入']
  const snippet = c.raw_review.length > 160 ? c.raw_review.slice(0, 160) + '…' : c.raw_review

  const confLevel = inferred.lowConfidence ? '低' : '中'
  const aiAnalysis: AIAnalysis = {
    featureExtraction: {
      abilityWords: tags.slice(0, 8),
      emotionWords: [],
      improvementPoints: []
    },
    classification: {},
    semanticHits: semHits,
    modelJudgment: {
      performanceScore: perf,
      potentialScore: pot,
      confidence: { performance: confLevel, potential: confLevel }
    },
    suggestion: {
      gridPosition,
      talentTags: tags,
      developmentSuggestions: []
    },
    evidenceSnippets: [snippet]
  }

  return {
    employee,
    aiAnalysis,
    finalResult: {
      performanceScore: perf,
      potentialScore: pot,
      gridPosition,
      talentTags: tags,
      developmentSuggestions: [],
      riskLevel,
      evidence: [snippet]
    },
    version: 'test_cases.json'
  }
}

const records = ref<TalentRecord[]>([])

async function loadTestCases() {
  importLoading.value = true
  importError.value = ''
  try {
    const url = `${import.meta.env.BASE_URL || '/'}data/test_cases.json`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: unknown = await res.json()
    const list = Array.isArray(data) ? (data as TestCaseJson[]) : []
    importedCases.value = list
    for (const c of list) {
      if (labReviewDrafts[c.id] === undefined) labReviewDrafts[c.id] = c.raw_review
      ensureLabPerfRow(c.id)
      ensureLabMetaRow(c.id)
    }

    const existingIds = new Set(records.value.map(r => r.employee.id))
    const appended = list.map(testCaseJsonToRecord).filter(r => !existingIds.has(r.employee.id))
    if (appended.length > 0) {
      records.value = [...records.value, ...appended]
      saveRecords(records.value)
    }
  } catch (e) {
    importError.value = e instanceof Error ? e.message : '加载失败'
    importedCases.value = []
  } finally {
    importLoading.value = false
  }
}

/** ruleConfig 深度变化时，重算已导入测试集对应的人才档案，使仪表盘与实验室同源联动 */
watch(
  ruleConfig,
  () => {
    if (importedCases.value.length === 0) return
    records.value = records.value.map(r => {
      if (!r.employee.id.startsWith('testcase-')) return r
      const shortId = r.employee.id.replace(/^testcase-/, '')
      const c = importedCases.value.find(x => x.id === shortId)
      if (!c) return r
      return testCaseJsonToRecord(c)
    })
    saveRecords(records.value)
  },
  { deep: true }
)

const view = ref<View>({ tab: 'dashboard' })
const searchQuery = ref('')
const hrNotes = ref('')
const perfAdj = ref('')
const potAdj = ref('')

const emp = ref<EmployeeInput>({
  id: 'emp-' + Date.now(),
  name: '',
  department: '产品部',
  role: '',
  level: '基层',
  jobTier: '基层',
  tenure: '2年',
  performanceScore: 75,
  dailyTiers: { contribution: null, quality: null, timeliness: null },
  competencyScores: emptyScoresForTier('基层'),
  performanceComment: '',
  keyEvents: '',
  developmentFeedback: ''
})

const addFormCompetencyRows = computed(() => {
  const jt = emp.value.jobTier ?? '基层'
  return COMPETENCY_SOURCES[jobTierToOrg(jt)]
})

const addFormXAxisTotal = computed(() => {
  const e = emp.value
  const p = e.performanceScore
  if (p === undefined || p === null) return null
  const d = e.dailyTiers
  if (!d || d.contribution == null || d.quality == null || d.timeliness == null) return null
  const pct = computeDailyWorkPercent({
    contribution: d.contribution,
    quality: d.quality,
    timeliness: d.timeliness
  })
  if (pct === null) return null
  return computeXAxisTotal(p, pct)
})

const COMPETENCY_BANDS: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7]

function setFormDailyTier(axis: DailyAxisKey, tier: DailyPointLevel) {
  if (!emp.value.dailyTiers) {
    emp.value.dailyTiers = { contribution: null, quality: null, timeliness: null }
  }
  const cur = emp.value.dailyTiers[axis]
  emp.value.dailyTiers[axis] = cur === tier ? null : tier
}

function setFormCompetencyBand(rowKey: string, band: number) {
  if (!emp.value.competencyScores) emp.value.competencyScores = {}
  const cur = emp.value.competencyScores[rowKey]
  const v = Math.max(0, Math.min(7, band))
  emp.value.competencyScores[rowKey] = cur === v ? null : v
}

function setFormCompetencyScore(rowKey: string, e: Event) {
  const raw = (e.target as HTMLInputElement).value.trim()
  if (!emp.value.competencyScores) emp.value.competencyScores = {}
  if (raw === '') {
    emp.value.competencyScores[rowKey] = null
    return
  }
  const n = Math.max(0, Math.min(7, Math.round(parseFloat(raw) || 0)))
  emp.value.competencyScores[rowKey] = n
}

function formatScaleTooltip(row: CompetencySourceRow): string {
  return row.scaleText
}

function fillCompetencyFromComment() {
  const text = emp.value.performanceComment || ''
  const jt = emp.value.jobTier ?? '基层'
  const org = jobTierToOrg(jt)
  if (!emp.value.competencyScores) emp.value.competencyScores = {}
  const { hits, scores } = semanticScanComment(text, org)
  emp.value.semanticHits = hits
  for (const r of COMPETENCY_SOURCES[org]) {
    const s = scores[r.rowKey]
    if (s !== undefined) emp.value.competencyScores[r.rowKey] = Math.max(0, Math.min(7, Math.round(s)))
  }
}

const addFormSemanticHitCount = computed(() => emp.value.semanticHits?.length ?? 0)

function openLabCaseRecord(caseId: string) {
  const id = `testcase-${caseId}`
  if (!records.value.some(r => r.employee.id === id)) {
    alert('请先点击「导入标准样例集」，将实验室样本同步至人才池后再查看结构化档案。')
    return
  }
  setView('detail', id)
}

function migrateDailyTierValue(v: unknown): DailyPointLevel | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'number' && v >= 1 && v <= 4) return v as DailyPointLevel
  if (typeof v === 'string' && v in BAND_TO_POINT) return BAND_TO_POINT[v as PerfBand]
  return null
}

function migrateEmployee(e: EmployeeInput): EmployeeInput {
  const next = { ...e }
  if (e.dailyTiers) {
    next.dailyTiers = {
      contribution: migrateDailyTierValue(e.dailyTiers.contribution),
      quality: migrateDailyTierValue(e.dailyTiers.quality),
      timeliness: migrateDailyTierValue(e.dailyTiers.timeliness)
    }
  }
  if (e.competencyScores) {
    const o = { ...e.competencyScores }
    for (const k of Object.keys(o)) {
      const v = o[k]
      if (v != null && v > 7) o[k] = Math.max(0, Math.min(7, Math.round((Number(v) / 100) * 7)))
    }
    next.competencyScores = o
  }
  return next
}

function migrateTalentRecord(r: TalentRecord): TalentRecord {
  return { ...r, employee: migrateEmployee(r.employee) }
}

function needsMigrationEmp(e: EmployeeInput): boolean {
  const d = e.dailyTiers
  if (d) {
    for (const k of ['contribution', 'quality', 'timeliness'] as const) {
      const v = d[k] as unknown
      if (typeof v === 'string' && v in BAND_TO_POINT) return true
    }
  }
  if (e.competencyScores) {
    for (const v of Object.values(e.competencyScores)) {
      if (v != null && Number(v) > 7) return true
    }
  }
  return false
}

watch(
  () => emp.value.jobTier,
  jt => {
    if (!jt) return
    emp.value.level = jt
    emp.value.competencyScores = emptyScoresForTier(jt)
  }
)

onMounted(() => {
  const loaded = loadRecords()
  if (loaded.length === 0) {
    saveRecords(SEED_RECORDS)
    records.value = SEED_RECORDS
  } else {
    const migrated = loaded.map(migrateTalentRecord)
    records.value = migrated
    if (loaded.some(r => needsMigrationEmp(r.employee))) saveRecords(migrated)
  }
})

const fullData = computed<FullRow[]>(() =>
  records.value.map(r => {
    const perf = r.finalResult?.performanceScore ?? r.aiAnalysis.modelJudgment.performanceScore
    const pot = r.finalResult?.potentialScore ?? r.aiAnalysis.modelJudgment.potentialScore
    const pos = r.finalResult?.gridPosition ?? r.aiAnalysis.suggestion.gridPosition
    const grid = GRID_MAP[pos] || GRID_MAP['1-1']
    return { ...r, perf, pot, pos, grid }
  })
)

const highPotential = computed(() =>
  fullData.value.filter(d => d.pos === '3-3' || d.pos === '2-3' || d.pos === '3-2')
)

const atRisk = computed(() =>
  fullData.value.filter(d => d.finalResult?.riskLevel === '高' || d.pos === '1-1')
)

const highPotentialPct = computed(() => {
  const n = fullData.value.length
  if (!n) return '0.0'
  return ((highPotential.value.length / n) * 100).toFixed(1)
})

const deptSummary = computed(() => {
  const depts = [...new Set(records.value.map(r => r.employee.department))]
  return depts.map(name => {
    const members = fullData.value.filter(d => d.employee.department === name)
    const avgP = members.length ? Math.round(members.reduce((a, b) => a + b.perf, 0) / members.length) : 0
    const avgPot = members.length
      ? (members.reduce((a, b) => a + b.pot, 0) / members.length).toFixed(1)
      : '0'
    return { name, members, count: members.length, avgP, avgPot }
  })
})

const selectedRecord = computed<FullRow | null>(() => {
  if (view.value.tab !== 'detail' || !view.value.id) return null
  return fullData.value.find(r => r.employee.id === view.value.id) ?? null
})

const detailGrid = computed(() => {
  const r = selectedRecord.value
  if (!r) return GRID_MAP['2-2']
  return r.grid || GRID_MAP[r.finalResult?.gridPosition ?? '2-2'] || GRID_MAP['2-2']
})

const filteredList = computed(() =>
  fullData.value.filter(
    d => d.employee.name.includes(searchQuery.value) || d.employee.department.includes(searchQuery.value)
  )
)

const gridEntries = computed(() => Object.entries(GRID_MAP) as [string, GridInfo][])

const gridCells = computed(() =>
  gridEntries.value.map(([k, v]) => {
    const list = fullData.value.filter(d => d.pos === k)
    return {
      k,
      v,
      show: list.slice(0, 5),
      more: Math.max(0, list.length - 5),
      count: list.length
    }
  })
)

watch(
  selectedRecord,
  r => {
    if (r) {
      perfAdj.value = String(r.finalResult?.performanceScore ?? r.aiAnalysis.modelJudgment.performanceScore)
      potAdj.value = String(r.finalResult?.potentialScore ?? r.aiAnalysis.modelJudgment.potentialScore)
      hrNotes.value = ''
    }
  },
  { immediate: true }
)

watch(
  () => view.value.tab,
  t => {
    if (t === 'add') {
      emp.value = {
        id: 'emp-' + Date.now(),
        name: '',
        department: '产品部',
        role: '',
        level: '基层',
        jobTier: '基层',
        tenure: '2年',
        performanceScore: 75,
        dailyTiers: { contribution: null, quality: null, timeliness: null },
        competencyScores: emptyScoresForTier('基层'),
        semanticHits: undefined,
        performanceComment: '',
        keyEvents: '',
        developmentFeedback: ''
      }
    }
  }
)

function setView(tab: Tab, id = '') {
  view.value = id ? { tab, id } : { tab }
}

function handleSaveRecord(record: TalentRecord) {
  records.value = addRecord(record)
  setView('list')
}

function handleDeleteRecord(id: string) {
  if (typeof window !== 'undefined' && window.confirm('确定删除该人才档案？')) {
    records.value = deleteRecord(id)
    setView('list')
  }
}

function handleRunAI(employee: EmployeeInput) {
  const analysis = runAIAnalysis(employee)
  const pos = getGridPos(analysis.modelJudgment.performanceScore, analysis.modelJudgment.potentialScore)
  const grid = GRID_MAP[pos] || GRID_MAP['1-1']
  const riskLevel = riskFromGrid(grid)
  const record: TalentRecord = {
    employee,
    aiAnalysis: analysis,
    finalResult: {
      performanceScore: analysis.modelJudgment.performanceScore,
      potentialScore: analysis.modelJudgment.potentialScore,
      gridPosition: pos,
      talentTags: analysis.suggestion.talentTags,
      developmentSuggestions: analysis.suggestion.developmentSuggestions ?? [],
      riskLevel,
      evidence: analysis.evidenceSnippets
    }
  }
  records.value = addRecord(record)
  setView('detail', employee.id)
}

function handleSaveCalibration() {
  const record = selectedRecord.value
  if (!record) return

  const perf = Math.max(0, Math.min(100, +perfAdj.value)) || 0
  const pot = Math.max(0, Math.min(100, +potAdj.value)) || 0
  const pos = getGridPos(perf, pot)
  const g = GRID_MAP[pos] || GRID_MAP['1-1']
  const riskLevel = riskFromGrid(g)
  const oldPerf = record.finalResult?.performanceScore ?? record.aiAnalysis.modelJudgment.performanceScore
  const oldPot = record.finalResult?.potentialScore ?? record.aiAnalysis.modelJudgment.potentialScore
  const adjusted = [...(record.hrCalibration?.adjusted ?? [])]
  if (perf !== oldPerf)
    adjusted.push({ field: '绩效', from: String(oldPerf), to: String(perf), reason: hrNotes.value || 'HR校准' })
  if (pot !== oldPot)
    adjusted.push({ field: '潜力', from: String(oldPot), to: String(pot), reason: hrNotes.value || 'HR校准' })

  const updated: TalentRecord = {
    employee: record.employee,
    aiAnalysis: record.aiAnalysis,
    hrCalibration: {
      confirmed: record.hrCalibration?.confirmed ?? [],
      adjusted,
      supplements: record.hrCalibration?.supplements ?? [],
      finalDecision: hrNotes.value || record.hrCalibration?.finalDecision || ''
    },
    finalResult: {
      performanceScore: perf,
      potentialScore: pot,
      gridPosition: pos,
      talentTags: record.finalResult?.talentTags ?? record.aiAnalysis.suggestion.talentTags,
      developmentSuggestions:
        record.finalResult?.developmentSuggestions ?? record.aiAnalysis.suggestion.developmentSuggestions ?? [],
      riskLevel,
      evidence: record.finalResult?.evidence ?? record.aiAnalysis.evidenceSnippets
    },
    version: record.version
  }
  handleSaveRecord(updated)
}

function submitNewEmployee() {
  if (!emp.value.name?.trim()) {
    alert('请填写姓名')
    return
  }
  const comment = (emp.value.performanceComment || '').replace(/\s/g, '')
  if (comment.length < 20) {
    alert('证据链不足，建议完善以提高模型置信度')
    return
  }
  const jt = emp.value.jobTier ?? '基层'
  const rows = COMPETENCY_SOURCES[jobTierToOrg(jt)]
  const scores = emp.value.competencyScores ?? {}
  const missingDim = rows.some(r => scores[r.rowKey] === undefined || scores[r.rowKey] === null)
  if (missingDim) {
    alert('证据链不足，建议完善以提高模型置信度')
    return
  }
  const d = emp.value.dailyTiers
  if (!d || d.contribution == null || d.quality == null || d.timeliness == null) {
    alert('证据链不足，建议完善以提高模型置信度')
    return
  }
  if (emp.value.performanceScore === undefined || emp.value.performanceScore === null) {
    alert('证据链不足，建议完善以提高模型置信度')
    return
  }
  handleRunAI({ ...emp.value, id: 'emp-' + Date.now() })
}

  return {
    COMPETENCY_BANDS,
    COMPETENCY_SOURCES,
    DAILY_AXIS_META,
    DAILY_RULE_TEXT,
    DAILY_TIER_HEADLINE,
    DAILY_TIER_SEGMENTS,
    DEPTS,
    GRID_ACTION_COPY,
    GRID_MAP,
    JOB_TIER_OPTIONS,
    PERFORMANCE_KEYWORDS,
    TENURES,
    addFormCompetencyRows,
    addFormSemanticHitCount,
    addFormXAxisTotal,
    aiLandingRoadmap,
    analyzeTalentLogic,
    atRisk,
    buildConfidence,
    clonePresetWeights,
    competencyRowsForLevel,
    compositePerformanceScore,
    computeDailyWorkPercent,
    computeScaleHighlights,
    computeXAxisTotal,
    dailyRuleLine,
    deptSummary,
    desensitizeLabText,
    desensitizeText,
    detailGrid,
    detectTimelinessConflict,
    dimensionContributions,
    disputedCaseCount,
    displayLabPerf,
    displayLabPot,
    emp,
    emptyScoresForTier,
    ensureHrOverrideRow,
    ensureLabMetaRow,
    ensureLabPerfRow,
    expectedBoxBadgeClass,
    feedbackScenarioOptions,
    fillCompetencyFromComment,
    filteredList,
    formatScaleTooltip,
    fullData,
    gapPerf,
    gapPot,
    getGridPos,
    goToCalibrationMeeting,
    gridActionSuggestion,
    gridCells,
    gridEntries,
    handleDeleteRecord,
    handleRunAI,
    handleSaveCalibration,
    handleSaveRecord,
    hasTimelinessConflictCase,
    highPotential,
    highPotentialPct,
    hrNotes,
    hrNumberInputPerf,
    hrNumberInputPot,
    hrOverride,
    importError,
    importLoading,
    importedCases,
    isHighDisputeCase,
    jobTierToOrg,
    keywordPerformanceEstimate,
    labAnalysisByCaseId,
    labCaseMeta,
    labDailyBreakdown,
    labDisputedFilter,
    labGridKey,
    labPerfInputs,
    labReviewDrafts,
    labSixReport,
    labVisibleCases,
    loadTestCases,
    matchedNegativesInText,
    migrateDailyTierValue,
    migrateEmployee,
    migrateTalentRecord,
    needsMigrationEmp,
    oliveDistributionInsight,
    onLabAvgPerfInput,
    openLabCaseRecord,
    orgLevelGuidanceKeywords,
    orgLevelOptions,
    perfAdj,
    potAdj,
    quarterOptions,
    records,
    riskBadgeCls,
    riskFromGrid,
    ruleConfig,
    ruleOrgLevel,
    scoreToGrade,
    searchQuery,
    selectedRecord,
    setDailyTier,
    setFormCompetencyBand,
    setFormCompetencyScore,
    setFormDailyTier,
    setHrPerfFromEvent,
    setHrPotFromEvent,
    setHrPerfNumber,
    setHrPotNumber,
    setLabDraftFromEvent,
    setLabQuarterFromEvent,
    setLabScenarioFromEvent,
    setOrgLevel,
    setView,
    smartPromptForCase,
    statPalette,
    strategyCenterTab,
    submitNewEmployee,
    testCaseJsonToRecord,
    view
  }
}
