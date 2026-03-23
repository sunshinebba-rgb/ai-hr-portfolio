/**
 * 种子数据 - 基于提示词中的3个实战案例
 */
import type { TalentRecord } from '../types';

export const SEED_RECORDS: TalentRecord[] = [
  // 案例1：执行型人才
  {
    employee: {
      id: 'emp-exec-001',
      name: '张明',
      department: '产品部',
      role: '产品经理',
      level: 'P5',
      tenure: '2年',
      performanceScore: 85,
      performanceComment: '该员工执行力强，能独立推进复杂项目，按时交付质量良好。但在面对不确定性时容易焦虑，跨部门沟通时主动性不足。',
      keyEvents: 'Q3独立完成XX项目，获得客户好评',
      developmentFeedback: '',
    },
    aiAnalysis: {
      featureExtraction: {
        abilityWords: ['执行力', '独立推进', '按时交付', '质量良好'],
        emotionWords: ['容易焦虑'],
        improvementPoints: ['跨部门沟通时主动性不足'],
      },
      classification: {
        '执行力': { strength: '强', evidence: ['能独立推进复杂项目', '按时交付质量良好'] },
        '沟通协作': { strength: '弱', evidence: ['跨部门沟通时主动性不足'] },
        '抗压能力': { strength: '中', evidence: ['面对不确定性时容易焦虑'] },
      },
      modelJudgment: {
        performanceScore: 78,
        potentialScore: 70,
        confidence: { performance: '高', potential: '中' },
      },
      suggestion: {
        gridPosition: '2-2',
        talentTags: ['执行型人才', '项目骨干', '需提升沟通'],
        riskTip: '抗压能力待观察，可能影响复杂项目承担',
      },
      evidenceSnippets: ['能独立推进复杂项目', '按时交付质量良好', '跨部门沟通时主动性不足'],
    },
    hrCalibration: {
      confirmed: ['绩效评分合理，与量化指标匹配', '执行力判断准确，有项目证据'],
      adjusted: [
        { field: '潜力评分', from: '65', to: '70', reason: '考虑学习意愿，有成长空间' },
        { field: '标签', from: '', to: '项目骨干', reason: '项目成果证明能力' },
      ],
      supplements: ['需要了解是否参与过沟通培训', '建议安排导师指导不确定性管理'],
      finalDecision: '项目成果证明执行能力，沟通问题可通过培训改善，有成长意愿，值得投入',
    },
    finalResult: {
      performanceScore: 78,
      potentialScore: 70,
      gridPosition: '2-2',
      talentTags: ['执行型人才', '项目骨干', '需提升沟通'],
      developmentSuggestions: [
        '参与跨部门沟通工作坊',
        '安排不确定性管理培训',
        '给予适度挑战性项目锻炼',
      ],
      riskLevel: '低',
      evidence: ['独立推进复杂项目', '跨部门沟通主动性不足'],
    },
  },
  // 案例2：高潜人才
  {
    employee: {
      id: 'emp-highpot-002',
      name: '李思远',
      department: '技术部',
      role: '后端工程师',
      level: 'P4',
      tenure: '1年',
      performanceScore: 82,
      performanceComment: '学习能力极强，两个月掌握新技术栈并应用到实际项目。主动承担额外工作，提出多个流程优化建议。需要更多时间验证系统性思考能力。',
      keyEvents: '',
      developmentFeedback: '乐于分享，帮助团队解决问题',
    },
    aiAnalysis: {
      featureExtraction: {
        abilityWords: ['学习能力', '掌握', '主动', '优化', '乐于分享', '解决问题'],
        emotionWords: [],
        improvementPoints: ['需要更多时间验证系统性思考能力'],
      },
      classification: {
        '学习能力': { strength: '强', evidence: ['两个月掌握新技术栈', '应用到实际项目'] },
        '主动性': { strength: '强', evidence: ['主动承担额外工作', '提出流程优化建议'] },
        '沟通协作': { strength: '强', evidence: ['乐于分享', '帮助团队解决问题'] },
      },
      modelJudgment: {
        performanceScore: 88,
        potentialScore: 92,
        confidence: { performance: '高', potential: '高' },
      },
      suggestion: {
        gridPosition: '3-3',
        talentTags: ['高潜人才', '超级明星', '技术骨干'],
      },
      evidenceSnippets: ['两个月掌握新技术栈', '主动承担额外工作', '提出流程优化建议', '乐于分享'],
    },
    finalResult: {
      performanceScore: 88,
      potentialScore: 92,
      gridPosition: '3-3',
      talentTags: ['高潜人才', '超级明星', '技术骨干'],
      developmentSuggestions: ['纳入高潜人才库', '安排导师指导', '参与复杂项目设计'],
      riskLevel: '低',
      evidence: ['两个月掌握新技术栈', '主动承担额外工作', '乐于分享帮助团队'],
    },
  },
  // 案例3：风险员工
  {
    employee: {
      id: 'emp-risk-003',
      name: '王建国',
      department: '运营部',
      role: '运营专员',
      level: 'P6',
      tenure: '5年+',
      performanceScore: 62,
      performanceComment: '工作按部就班，缺乏创新意识。近半年工作热情下降，对新技术学习意愿低。团队协作时态度被动。',
      keyEvents: '',
      developmentFeedback: '前两年表现良好，近一年呈下滑趋势',
    },
    aiAnalysis: {
      featureExtraction: {
        abilityWords: [],
        emotionWords: ['热情下降', '意愿低', '被动'],
        improvementPoints: ['缺乏创新意识', '学习意愿低', '态度被动'],
      },
      classification: {
        '学习能力': { strength: '弱', evidence: ['对新技术学习意愿低'] },
        '主动性': { strength: '弱', evidence: ['态度被动', '按部就班'] },
      },
      modelJudgment: {
        performanceScore: 58,
        potentialScore: 45,
        confidence: { performance: '高', potential: '高' },
      },
      suggestion: {
        gridPosition: '1-1',
        talentTags: ['风险预警', '双待提升'],
        riskTip: '检测到工作热情下降、学习意愿低等风险信号，建议重点关注',
      },
      evidenceSnippets: ['工作热情下降', '学习意愿低', '态度被动', '近一年呈下滑趋势'],
    },
    finalResult: {
      performanceScore: 58,
      potentialScore: 45,
      gridPosition: '1-1',
      talentTags: ['风险预警', '双待提升'],
      developmentSuggestions: [
        '立即安排一对一沟通',
        '了解工作动力变化原因',
        '评估岗位适配度',
        '制定改进计划或调整方案',
      ],
      riskLevel: '高',
      evidence: ['工作热情下降', '学习意愿低', '近一年持续下滑'],
    },
  },
];
