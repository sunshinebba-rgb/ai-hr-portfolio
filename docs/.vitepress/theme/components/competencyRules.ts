/** 与 docs/rules.md 能力字典一致，供判定规则表与信号扫描共用 */

export type OrgLevel = 'junior' | 'middle' | 'senior'

export interface CompetencySourceRow {
  rowKey: string
  dimensionKey: string
  dimensionLabel: string
  competencyName: string
  definition: string
  positive: string[]
  negative: string[]
  scaleText: string
}

const SCALE_XIAOLÜ =
  '0-1：以自我为中心，认为制度和规范是自己应该做的事情，其余都是额外工作\n' +
  '2-3：会站在别人的立场，自我谦让，能在一定时间范围内满足公司内外部客户的需求\n' +
  '4-5：从客户角度出发，始终保持一种积极、主动、热情、专业的态度，有提高客户满意度的意识和行为\n' +
  '6-7：有强烈的服务意识，有了以公司为家，热爱集体，无私奉献的风格和精神'

function logicLine(pos: string[], neg: string[]): string {
  return `正向指标：${pos.join('、')}；负向指标：${neg.join('、')}`
}

export const PRESET_WEIGHTS: Record<OrgLevel, Record<string, number>> = {
  junior: {
    业绩交付: 35,
    学习潜力: 25,
    责任担当: 20,
    协作影响: 20
  },
  middle: {
    解决问题: 30,
    沟通影响: 25,
    培养人才: 20,
    先公后私: 15,
    创新能力: 10
  },
  senior: {
    决策力: 35,
    商业洞察: 25,
    变革创新: 20,
    事业雄心: 10,
    领导激励: 10
  }
}

export const COMPETENCY_SOURCES: Record<OrgLevel, CompetencySourceRow[]> = {
  junior: [
    {
      rowKey: 'junior-zhixing',
      dimensionKey: '业绩交付',
      dimensionLabel: '业绩交付',
      competencyName: '高效执行',
      definition: '不折不扣保质保量地完成任务，贯彻目标，用最少的投入，取得最优结果',
      positive: ['按时交付', '质量达标', '资源节约'],
      negative: ['经常延期', '质量不稳定', '资源浪费'],
      scaleText:
        '0-1：以自我为中心，认为制度和规范是自己应该做的事情，其余都是额外工作\n' +
        '2-3：会站在别人的立场，自我谦让，能在一定时间范围内满足公司内外部客户的需求\n' +
        '4-5：从客户角度出发，始终保持一种积极、主动、热情、专业的态度，有提高客户满意度的意识和行为\n' +
        '6-7：有强烈的服务意识，有了以公司为家，热爱集体，无私奉献的风格和精神'
    },
    {
      rowKey: 'junior-xuexi',
      dimensionKey: '学习潜力',
      dimensionLabel: '学习潜力',
      competencyName: '学习成长',
      definition: '不断主动学习新知识，提升自身能力，提高工作质量与工作效率',
      positive: ['主动学习', '快速掌握', '应用实践'],
      negative: ['安于现状', '学习缓慢', '学用脱节'],
      scaleText:
        '0-1：对学习的热情不够，满足于目前掌握的知识技能，不主动学习，不愿接受新事物，新观点\n' +
        '2-3：根据工作需求，学习必要的知识与技能，并能运用到工作中\n' +
        '4-5：主动分析自身与工作要求的差距，积极向他人请教，快速学习新事物，明显提高工作效率和质量\n' +
        '6-7：在工作中持续学习，总结并运用于工作，并主动营造相互分享、学习的氛围，带动他人共同成长'
    },
    {
      rowKey: 'junior-zeren',
      dimensionKey: '责任担当',
      dimensionLabel: '责任担当',
      competencyName: '责任担当',
      definition:
        '个人对自己、他人、集体、国家所负责任的认识、情感和信念，以及与之相应的遵守规范、承担责任和履行义务的自觉态度而产生的情绪体验',
      positive: ['主动承担', '勇于负责', '解决问题'],
      negative: ['推卸责任', '消极应对', '回避问题'],
      scaleText:
        '0-1：工作的完成情况以上班时间为界，对未完成的工作拖拉，找借口\n' +
        '2-3：对待工作认真负责，尽量在规定时间内保质保量的完成\n' +
        '4-5：合理安排并规划自己的工作，对于未完成的任务勇于承担责任，并主动解决，落实\n' +
        '6-7：以公司为家，事业心较重，对于自己、部门的工作，甚至公司未来的发展方向等问题主动思考，并以此为己任，感到自己身负责任重大'
    },
    {
      rowKey: 'junior-fuwu',
      dimensionKey: '协作影响',
      dimensionLabel: '协作影响',
      competencyName: '服务意识',
      definition: '发自内心，自觉主动做好服务工作的观念和愿望，对内外部客户提供服务的意识和态度',
      positive: ['主动服务', '客户满意', '积极响应'],
      negative: ['被动应付', '客户投诉', '反应迟缓'],
      scaleText:
        '（规则库注明与「高效执行」零至七分标准一致，原文引用如下）\n' + SCALE_XIAOLÜ
    },
    {
      rowKey: 'junior-tuandui',
      dimensionKey: '协作影响',
      dimensionLabel: '协作影响',
      competencyName: '团队合作',
      definition: '为达到既定目标所显现出来的自愿合作和协同努力的精神',
      positive: ['主动协作', '支持同事', '团队贡献'],
      negative: ['单打独斗', '拒绝协作', '影响团队'],
      scaleText:
        '0-1：独断专行，只注重个人本职工作，不能与他人很好合作\n' +
        '2-3：团队合作精神不够强，在完成本职工作的同时，偶尔协助他人，有时会对工作产生影响\n' +
        '4-5：能够与他人合作共事，相互支持，和其他人一起解决问题，获取同事信任和支持，保证对团队任务的完成\n' +
        '6-7：善于与他人合作共事，相互支持，充分发挥各自的优势，并能积极推动在全公司范围内的协作观念，保持良好的团队工作氛围'
    }
  ],
  middle: [
    {
      rowKey: 'mid-jiejue',
      dimensionKey: '解决问题',
      dimensionLabel: '解决问题',
      competencyName: '解决问题',
      definition: '运用专业知识和经验，发现问题，制定计划并提出解决方案的能力',
      positive: ['系统分析', '高效解决', '创新方案'],
      negative: ['问题拖延', '表面解决', '缺乏深度'],
      scaleText:
        '0-1：处理问题混乱无章，无从下手，不能冷静思考和面对\n' +
        '2-3：有良好的心态应对问题，随机应变，能井井有条的梳理好工作\n' +
        '4-5：能结合当前人财物等资源的情况制定经济高效的方案，具有统筹协调资源解决问题的能力\n' +
        '6-7：根据问题发生，制定改进工作方法、工作流程或者相关的规章制度等，能够利用问题进行反思和升华'
    },
    {
      rowKey: 'mid-goutong',
      dimensionKey: '沟通影响',
      dimensionLabel: '沟通影响',
      competencyName: '沟通影响',
      definition: '采取语言来影响他人的思想和行为，在团队里树立个人权威',
      positive: ['有效沟通', '影响他人', '达成共识'],
      negative: ['沟通障碍', '缺乏影响', '难以共识'],
      scaleText:
        '0-1：只关注个人，未表现出试图影响和说服别人的意图，或者有意图但未采取行动\n' +
        '2-3：有一定的沟通技巧，能取得他人的支持和认同\n' +
        '4-5：善于用别人乐于接受的方式，懂得有效的沟通是双向交流，会换位思考，达成共识\n' +
        '6-7：有极强的沟通协调能力，并能通过沟通，推动他人或带领团队达成目标'
    },
    {
      rowKey: 'mid-peiyang',
      dimensionKey: '培养人才',
      dimensionLabel: '培养人才',
      competencyName: '培养人才',
      definition: '为下属提供有建设性的反馈意见，激励其改进工作方法以使其迅速实现职业发展',
      positive: ['指导下属', '发展规划', '激发潜力'],
      negative: ['忽视培养', '任务导向', '限制成长'],
      scaleText:
        '0-1：对于下属的工作不做建设性的指示，不提供让其成长的工作机会\n' +
        '2-3：给与下属较多的工作机会，但分配的任务更多的是事务性的处理，没有结合其未来发展方向进行有效的引导\n' +
        '4-5：能够结合员工未来发展意向，有针对性的进行工作分配，并执行过程中给与及时的指导\n' +
        '6-7：将培养下属作为自己的一项重要任务，经常与下属当面探讨其发展方向，以及目标达成的手段'
    },
    {
      rowKey: 'mid-xiangong',
      dimensionKey: '先公后私',
      dimensionLabel: '先公后私',
      competencyName: '先公后私',
      definition: '把公司和团队的利益放在前，把个人利益放在后面',
      positive: ['顾全大局', '团队优先', '牺牲奉献'],
      negative: ['个人主义', '自私自利', '损害集体'],
      scaleText:
        '0-1：在工作过程中更多考虑自己个人的利益，不愿为集体付出\n' +
        '2-3：当公司利益和个人利益发生冲突的时候，会以大局为重，服从公司安排\n' +
        '4-5：将公司整体利益置于个人利益之上，面临冲突能从公司组织层面主动牺牲自我利益，并提出方案\n' +
        '6-7：全心全意热爱自己的工作，永远把公司利益放第一位，公司的成功高于个人的财富和名誉'
    },
    {
      rowKey: 'mid-chuangxin',
      dimensionKey: '创新能力',
      dimensionLabel: '创新能力',
      competencyName: '创新能力',
      definition:
        '采用原来没有的方式方法解决问题，或创造新的机会和方法，提高工作效率和产品、服务的性能',
      positive: ['创新思维', '改进方法', '创造价值'],
      negative: ['墨守成规', '抗拒变化', '缺乏创新'],
      scaleText:
        '0-1：思想保守，满足现状，缺乏创新主动性，不想做任何改变\n' +
        '2-3：具备一定的学习和分析能力，对本职工作的纵深开发和横向联系的优化\n' +
        '4-5：善于思考，乐于提出对公司有利的新的观点和独特的想法，提供公司业务增长的创意\n' +
        '6-7：敏锐洞察商机，善于制定创新改进计划，使用全新方法整合资源，为公司创造全新的市场机会'
    }
  ],
  senior: [
    {
      rowKey: 'sen-juece',
      dimensionKey: '决策力',
      dimensionLabel: '决策力',
      competencyName: '决策力',
      definition: '具有战略眼光和客观思维能力，掌握各种方法及时做出决定，并勇于承担责任',
      positive: ['果断决策', '风险评估', '战略眼光'],
      negative: ['犹豫不决', '风险忽视', '短视决策'],
      scaleText:
        '0-1：不能在既定的要求下做出决策\n' +
        '2-3：能评估困难程度，利用一定的方法在一定的时限内做出决策\n' +
        '4-5：能在较短时间内借助各方资源做出决策，能评估各类解决方案对组织的风险和收益并确定备选方案\n' +
        '6-7：在对机会和潜在风险做出战略评估的基础上做出决策，能回顾过去的经验并衡量各种备选方案的正负影响，明确组织发展方向，做出对组织利益最大风险最低的决策，始终将决策与组织的长远发展结合'
    },
    {
      rowKey: 'sen-shangye',
      dimensionKey: '商业洞察',
      dimensionLabel: '商业洞察',
      competencyName: '商业洞察',
      definition:
        '在商业领域透过现象看本质，洞察内在的连接关系，以此找到方向和解决问题的方法，实现商业预期',
      positive: ['市场洞察', '趋势把握', '战略预见'],
      negative: ['市场迟钝', '趋势误判', '战略短视'],
      scaleText:
        '0-1：较少关注行业发展状况，应对变化改进不及时\n' +
        '2-3：快速洞察行业和市场的变化，根据公司实际情况提出针对性、建设性建议\n' +
        '4-5：主动了解并收集反馈标杆企业竞争和发展策略，提出应对策略，并迅速采取行动，抓住机遇\n' +
        '6-7：时刻关注公司战略，对行业和市场发展有独到的见解，帮助公司制定长期的发展规划，保持公司的领先优势'
    },
    {
      rowKey: 'sen-biange',
      dimensionKey: '变革创新',
      dimensionLabel: '变革创新',
      competencyName: '变革创新',
      definition: '从公司需求出发，对新观念、新方法持开放心态，支持并推动公司变革',
      positive: ['推动变革', '创新思维', '适应变化'],
      negative: ['抗拒变革', '保守思维', '难以适应'],
      scaleText:
        '0-1：光用固有的思维解决问题，不愿意改变或接受新事物，对新的观念与方法抵触\n' +
        '2-3：接受新概念，新方法，做出调整适应变化，配合公司变革\n' +
        '4-5：主动更新迭代知识、思维方式、工作方法；熟悉公司变革的需求与风险，制定并实施有效的计划\n' +
        '6-7：以公司持续发展着眼，打破公司过往不适宜的流程和方法；并正面引导和带动同事主动做出改变，推动公司变革'
    },
    {
      rowKey: 'sen-xiongxin',
      dimensionKey: '事业雄心',
      dimensionLabel: '事业雄心',
      competencyName: '事业雄心',
      definition: '努力成就一番事业的奋斗精神和热爱工作、希望取得良好成绩的积极心理状态',
      positive: ['远大抱负', '持续奋斗', '追求卓越'],
      negative: ['小富即安', '缺乏动力', '安于现状'],
      scaleText:
        '0-1：做事保守求稳，把工作做好的愿望不强烈，很少为自己设立目标\n' +
        '2-3：主动给自己设定目标，主动与上级沟通，表现出把工作做好的愿望\n' +
        '4-5：为自己设定并努力实现挑战性的目标，表现出把工作做好的强烈愿望，会做阶段性总结和复盘\n' +
        '6-7：个人发展目标非常明确，有极强的工作积极性，接受更高挑战，站在更高层次考虑事业方向'
    },
    {
      rowKey: 'sen-lingdao',
      dimensionKey: '领导激励',
      dimensionLabel: '领导激励',
      competencyName: '领导激励',
      definition:
        '激发、鼓励和调动人的热情和动机，使人尽可能充分发挥和维持潜在的工作动机，更好地达成目标',
      positive: ['激励团队', '鼓舞士气', '凝聚人心'],
      negative: ['士气低落', '缺乏激励', '团队涣散'],
      scaleText:
        '0-1：埋头做事，领导意识不强，无法带领团结队伍，不能调节团队工作积极性\n' +
        '2-3：在日常工作中能通过个人语言和行为，有效调动团队的积极性和主动性\n' +
        '4-5：懂得运用一些特定的奖惩形式，科学激励员工，更大程度调动员工的积极性和创造性，实现个人与组织预期目标的统一\n' +
        '6-7：深入调查研究，不断了解员工需要层次和需要结构的变化趋势，有针对性的计划并采取激励措施，推动目标的实现'
    }
  ]
}

/** 解析零至七分档行为描述行（0-1 / 2-3 / 4-5 / 6-7） */
export interface ScaleBandLine {
  label: string
  text: string
}

export function parseScaleBands(scaleText: string): ScaleBandLine[] {
  const lines = scaleText.split('\n').map(l => l.trim()).filter(Boolean)
  const r: ScaleBandLine[] = []
  for (const line of lines) {
    const m = line.match(/^(0-1|2-3|4-5|6-7)[：:]\s*(.+)$/)
    if (m) r.push({ label: m[1], text: m[2] })
  }
  return r
}

/** 表格行：附展示用合成字段 */
export function buildTableRows(level: OrgLevel) {
  const rows = COMPETENCY_SOURCES[level]
  const counts: Record<string, number> = {}
  for (const r of rows) counts[r.dimensionKey] = (counts[r.dimensionKey] ?? 0) + 1
  return rows.map((r, idx) => {
    const first = rows.findIndex(x => x.dimensionKey === r.dimensionKey) === idx
    return {
      ...r,
      logicLine: logicLine(r.positive, r.negative),
      _showDimCell: first,
      _dimRowspan: counts[r.dimensionKey] ?? 1,
      _showWeightCell: first
    }
  })
}
