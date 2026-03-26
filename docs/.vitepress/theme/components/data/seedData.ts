/**
 * 种子数据：localStorage 为空时注入 20 条内置样例（结构完整，经 runAIAnalysis 生成结论）
 */
import type { TalentRecord, EmployeeInput, JobTier } from '../types'
import { GRID_MAP } from '../types'
import { runAIAnalysis } from '../lib/aiEngine'
import { COMPETENCY_SOURCES } from '../competencyRules'

function scoreToGrade(s: number): 1 | 2 | 3 {
  if (s >= 80) return 3
  if (s >= 60) return 2
  return 1
}

function getGridPos(perf: number, pot: number): string {
  return `${scoreToGrade(perf)}-${scoreToGrade(pot)}`
}

function riskFromGridKey(pos: string): '高' | '中' | '低' {
  const g = GRID_MAP[pos]
  if (!g) return '中'
  return (g.id === '5' ? '高' : g.id === '4' || g.id === '3' ? '中' : '低') as '高' | '中' | '低'
}

function emptyCompetencyScores(jt: JobTier): Record<string, number | null> {
  const org = jt === '基层' ? 'junior' : jt === '中层' ? 'middle' : 'senior'
  const o: Record<string, number | null> = {}
  for (const r of COMPETENCY_SOURCES[org]) o[r.rowKey] = null
  return o
}

function buildEmployee(
  id: string,
  name: string,
  opts: Partial<EmployeeInput> & { performanceComment: string; jobTier?: JobTier }
): EmployeeInput {
  const jt = opts.jobTier ?? '基层'
  const baseScores = emptyCompetencyScores(jt)
  const merged = { ...baseScores, ...(opts.competencyScores ?? {}) }
  for (const k of Object.keys(merged)) {
    if (merged[k] != null) merged[k] = Math.max(0, Math.min(7, Number(merged[k])))
  }
  return {
    id,
    name,
    department: opts.department ?? '产品部',
    role: opts.role ?? '专业岗',
    level: opts.level ?? jt,
    jobTier: jt,
    tenure: opts.tenure ?? '2年',
    performanceScore: opts.performanceScore ?? 75,
    dailyTiers: opts.dailyTiers ?? { contribution: 3, quality: 3, timeliness: 3 },
    competencyScores: merged,
    performanceComment: opts.performanceComment,
    keyEvents: opts.keyEvents ?? '',
    developmentFeedback: opts.developmentFeedback ?? ''
  }
}

function toTalentRecord(e: EmployeeInput): TalentRecord {
  const ai = runAIAnalysis(e)
  const perf = ai.modelJudgment.performanceScore
  const pot = ai.modelJudgment.potentialScore
  const gridPosition = getGridPos(perf, pot)
  return {
    employee: e,
    aiAnalysis: ai,
    finalResult: {
      performanceScore: perf,
      potentialScore: pot,
      gridPosition,
      talentTags: ai.suggestion.talentTags,
      developmentSuggestions: ai.suggestion.developmentSuggestions ?? [],
      riskLevel: riskFromGridKey(gridPosition),
      evidence: ai.evidenceSnippets
    }
  }
}

const SEED_EMPLOYEES: EmployeeInput[] = [
  buildEmployee('seed-001', '张明', {
    department: '产品部',
    role: '产品经理',
    level: 'P5',
    performanceScore: 85,
    dailyTiers: { contribution: 4, quality: 3, timeliness: 3 },
    competencyScores: {
      'junior-zhixing': 6,
      'junior-xuexi': 5,
      'junior-zeren': 4,
      'junior-fuwu': 4,
      'junior-tuandui': 5
    },
    performanceComment:
      '该员工执行力强，能独立推进复杂项目，按时交付质量良好。但在面对不确定性时容易焦虑，跨部门沟通时主动性不足。'
  }),
  buildEmployee('seed-002', '李思远', {
    department: '技术部',
    role: '后端工程师',
    level: 'P4',
    jobTier: '基层',
    performanceScore: 82,
    dailyTiers: { contribution: 4, quality: 4, timeliness: 3 },
    competencyScores: {
      'junior-zhixing': 6,
      'junior-xuexi': 7,
      'junior-zeren': 6,
      'junior-fuwu': 5,
      'junior-tuandui': 5
    },
    performanceComment:
      '学习能力极强，两个月掌握新技术栈并应用到实际项目。主动承担额外工作，提出多个流程优化建议。需要更多时间验证系统性思考能力。',
    developmentFeedback: '乐于分享，帮助团队解决问题'
  }),
  buildEmployee('seed-003', '王建国', {
    department: '运营部',
    role: '运营专员',
    level: 'P6',
    performanceScore: 62,
    dailyTiers: { contribution: 2, quality: 2, timeliness: 2 },
    competencyScores: {
      'junior-zhixing': 3,
      'junior-xuexi': 2,
      'junior-zeren': 3,
      'junior-fuwu': 2,
      'junior-tuandui': 2
    },
    performanceComment:
      '工作按部就班，缺乏创新意识。近半年工作热情下降，对新技术学习意愿低。团队协作时态度被动。',
    developmentFeedback: '前两年表现良好，近一年呈下滑趋势'
  }),
  buildEmployee('seed-004', '陈薇', {
    department: '研发部',
    role: '测试工程师',
    performanceScore: 78,
    dailyTiers: { contribution: 3, quality: 4, timeliness: 4 },
    competencyScores: {
      'junior-zhixing': 5,
      'junior-xuexi': 6,
      'junior-zeren': 6,
      'junior-fuwu': 5,
      'junior-tuandui': 4
    },
    performanceComment:
      '按时交付质量稳定，主动学习自动化工具并推广到小组。跨团队沟通偶有被动，担责意识总体良好，不推诿关键缺陷定位。'
  }),
  buildEmployee('seed-005', '刘航', {
    department: '市场部',
    role: '增长专员',
    performanceScore: 88,
    dailyTiers: { contribution: 4, quality: 3, timeliness: 4 },
    competencyScores: {
      'junior-zhixing': 6,
      'junior-xuexi': 5,
      'junior-zeren': 5,
      'junior-fuwu': 6,
      'junior-tuandui': 6
    },
    performanceComment:
      '指标超额完成，客户反馈积极。能主动承担campaign复盘，协作顺畅；需警惕多线程下质量波动。'
  }),
  buildEmployee('seed-006', '赵琳', {
    department: '人力行政部',
    role: 'HRBP',
    jobTier: '中层',
    level: 'M2',
    performanceScore: 72,
    dailyTiers: { contribution: 3, quality: 3, timeliness: 3 },
    competencyScores: {
      'mid-jiejue': 5,
      'mid-goutong': 6,
      'mid-peiyang': 5,
      'mid-xiangong': 5,
      'mid-chuangxin': 4
    },
    performanceComment:
      '推动绩效校准流程顺畅，跨部门沟通影响面大。培养新人有试点但尚未体系化，创新试点中规中矩，需加强先公后私的示范案例。'
  }),
  buildEmployee('seed-007', '孙磊', {
    department: '业务部',
    role: '大客户经理',
    jobTier: '中层',
    level: 'M1',
    performanceScore: 90,
    dailyTiers: { contribution: 4, quality: 4, timeliness: 3 },
    competencyScores: {
      'mid-jiejue': 6,
      'mid-goutong': 7,
      'mid-peiyang': 5,
      'mid-xiangong': 6,
      'mid-chuangxin': 5
    },
    performanceComment:
      '解决复杂客户问题果断，沟通影响强。能迭代新方案试点，反对墨守成规；团队培养节奏略紧。'
  }),
  buildEmployee('seed-008', '周倩', {
    department: '产品部',
    role: '产品运营',
    performanceScore: 70,
    dailyTiers: { contribution: 3, quality: 2, timeliness: 3 },
    competencyScores: {
      'junior-zhixing': 4,
      'junior-xuexi': 4,
      'junior-zeren': 5,
      'junior-fuwu': 5,
      'junior-tuandui': 4
    },
    performanceComment:
      '基本达标，偶有延期但能及时同步。学习速度中等，责任心尚可；主动性在高峰期不足。'
  }),
  buildEmployee('seed-009', '吴峰', {
    department: '技术部',
    role: '架构师',
    jobTier: '高层',
    level: 'D1',
    performanceScore: 92,
    dailyTiers: { contribution: 4, quality: 4, timeliness: 4 },
    competencyScores: {
      'sen-juece': 6,
      'sen-shangye': 6,
      'sen-biange': 5,
      'sen-xiongxin': 5,
      'sen-lingdao': 6
    },
    performanceComment:
      '战略方向清晰，决策风险评估到位。推动变革有节奏；事业雄心与领导激励并重，商业洞察敏锐。'
  }),
  buildEmployee('seed-010', '郑洋', {
    department: '研发部',
    role: '前端工程师',
    performanceScore: 76,
    dailyTiers: { contribution: 3, quality: 3, timeliness: 2 },
    competencyScores: {
      'junior-zhixing': 5,
      'junior-xuexi': 5,
      'junior-zeren': 4,
      'junior-fuwu': 4,
      'junior-tuandui': 4
    },
    performanceComment:
      '交付节奏偶尔拖延，质量整体合格。学习意愿尚可，协作上需减少被动等待接口。'
  }),
  buildEmployee('seed-011', '高远', {
    department: '业务部',
    role: '区域经理',
    jobTier: '中层',
    level: 'M1',
    performanceScore: 68,
    dailyTiers: { contribution: 3, quality: 3, timeliness: 3 },
    competencyScores: {
      'mid-jiejue': 4,
      'mid-goutong': 5,
      'mid-peiyang': 3,
      'mid-xiangong': 5,
      'mid-chuangxin': 3
    },
    performanceComment:
      '问题解决中规中矩，沟通尚可。培养人才系统性不足，创新意识偏弱，先公后私有大局观。'
  }),
  buildEmployee('seed-012', '马婧', {
    department: '产品部',
    role: '用户研究',
    performanceScore: 81,
    dailyTiers: { contribution: 3, quality: 4, timeliness: 3 },
    competencyScores: {
      'junior-zhixing': 5,
      'junior-xuexi': 6,
      'junior-zeren': 5,
      'junior-fuwu': 6,
      'junior-tuandui': 6
    },
    performanceComment:
      '客户视角强，调研洞察推动改版。跨团队协作积极，主动分享方法论；执行落地偶有小瑕疵。'
  }),
  buildEmployee('seed-013', '丁凯', {
    department: '运营部',
    role: '数据运营',
    performanceScore: 74,
    dailyTiers: { contribution: 2, quality: 3, timeliness: 3 },
    competencyScores: {
      'junior-zhixing': 4,
      'junior-xuexi': 5,
      'junior-zeren': 4,
      'junior-fuwu': 4,
      'junior-tuandui': 4
    },
    performanceComment:
      '数据报表准时，贡献略低于预期。学习新模型较快，责任心一般，协作偶有推诿沟通。'
  }),
  buildEmployee('seed-014', '韩梅', {
    department: '市场部',
    role: '品牌经理',
    jobTier: '中层',
    level: 'M2',
    performanceScore: 79,
    dailyTiers: { contribution: 3, quality: 3, timeliness: 4 },
    competencyScores: {
      'mid-jiejue': 5,
      'mid-goutong': 6,
      'mid-peiyang': 4,
      'mid-xiangong': 6,
      'mid-chuangxin': 5
    },
    performanceComment:
      '沟通影响突出，先公后私示范好。问题解决稳健，创新迭代试点积极；人才培养工具化不足。'
  }),
  buildEmployee('seed-015', '冯涛', {
    department: '技术部',
    role: 'SRE',
    performanceScore: 86,
    dailyTiers: { contribution: 4, quality: 4, timeliness: 4 },
    competencyScores: {
      'junior-zhixing': 6,
      'junior-xuexi': 5,
      'junior-zeren': 6,
      'junior-fuwu': 5,
      'junior-tuandui': 5
    },
    performanceComment:
      '故障响应迅速，质量标杆。主动承担值班优化，按时交付；团队分享可再加强。'
  }),
  buildEmployee('seed-016', '何静', {
    department: '人力行政部',
    role: '薪酬专员',
    performanceScore: 71,
    dailyTiers: { contribution: 3, quality: 3, timeliness: 2 },
    competencyScores: {
      'junior-zhixing': 4,
      'junior-xuexi': 4,
      'junior-zeren': 5,
      'junior-fuwu': 5,
      'junior-tuandui': 4
    },
    performanceComment:
      '制度执行细致，偶有拖延。学习新政策积极，协作友好；客户内部服务意识有待提升。'
  }),
  buildEmployee('seed-017', '曹阳', {
    department: '研发部',
    role: '技术负责人',
    jobTier: '高层',
    level: 'D2',
    performanceScore: 84,
    dailyTiers: { contribution: 4, quality: 3, timeliness: 3 },
    competencyScores: {
      'sen-juece': 5,
      'sen-shangye': 6,
      'sen-biange': 5,
      'sen-xiongxin': 6,
      'sen-lingdao': 5
    },
    performanceComment:
      '技术战略与商业洞察结合较好，变革推进谨慎。决策偶有犹豫不决，领导激励团队士气稳定。'
  }),
  buildEmployee('seed-018', '谢宇', {
    department: '产品部',
    role: '增长产品',
    performanceScore: 93,
    dailyTiers: { contribution: 4, quality: 4, timeliness: 4 },
    competencyScores: {
      'junior-zhixing': 6,
      'junior-xuexi': 6,
      'junior-zeren': 6,
      'junior-fuwu': 6,
      'junior-tuandui': 7
    },
    performanceComment:
      '业绩领先，客户导向极强。主动迭代试点新功能，协作高效；需关注持续高压下的节奏。'
  }),
  buildEmployee('seed-019', '邓楠', {
    department: '运营部',
    role: '供应链专员',
    performanceScore: 65,
    dailyTiers: { contribution: 2, quality: 2, timeliness: 3 },
    competencyScores: {
      'junior-zhixing': 3,
      'junior-xuexi': 3,
      'junior-zeren': 4,
      'junior-fuwu': 3,
      'junior-tuandui': 3
    },
    performanceComment:
      '按部就班完成基础任务，安于现状倾向明显。学习缓慢，团队互助不足，需改进主动担责。'
  }),
  buildEmployee('seed-020', '彭越', {
    department: '业务部',
    role: '售前顾问',
    jobTier: '中层',
    level: 'M1',
    performanceScore: 77,
    dailyTiers: { contribution: 3, quality: 3, timeliness: 3 },
    competencyScores: {
      'mid-jiejue': 5,
      'mid-goutong': 6,
      'mid-peiyang': 4,
      'mid-xiangong': 5,
      'mid-chuangxin': 4
    },
    performanceComment:
      '方案沟通影响强，问题解决有章法。培养新人有意愿缺方法，创新能力一般，先公后私表现稳健。'
  })
]

export const SEED_RECORDS: TalentRecord[] = SEED_EMPLOYEES.map(toTalentRecord)
