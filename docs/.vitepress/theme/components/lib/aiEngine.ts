/**
 * AI 驱动分析引擎（模拟实现）
 * 从非结构化评语中提取特征、分类、评分、生成建议
 */
import type { EmployeeInput, AIAnalysis } from '../types';

// 能力词库 - 正向
const ABILITY_POSITIVE: Record<string, number> = {
  '执行力': 85, '独立推进': 90, '按时交付': 85, '质量良好': 80,
  '学习能力': 90, '掌握': 85, '主动': 88, '承担': 85, '优化': 88,
  '乐于分享': 82, '帮助团队': 85, '解决问题': 88,
  '创新': 90, '流程优化': 88, '技术扎实': 85,
};

// 能力词库 - 负向/改进点
const ABILITY_NEGATIVE: Record<string, number> = {
  '焦虑': -15, '主动性不足': -20, '被动': -25, '热情下降': -25,
  '缺乏': -20, '意愿低': -25, '按部就班': -10, '态度被动': -20,
};

function extractKeywords(text: string, wordMap: Record<string, number>): { words: string[]; total: number } {
  const words: string[] = [];
  let total = 0;
  for (const [kw, score] of Object.entries(wordMap)) {
    if (text.includes(kw)) {
      words.push(kw);
      total += score;
    }
  }
  return { words, total };
}

function scoreToGrade(score: number): 1 | 2 | 3 {
  if (score >= 80) return 3;
  if (score >= 60) return 2;
  return 1;
}

export function runAIAnalysis(emp: EmployeeInput): AIAnalysis {
  const fullText = [emp.performanceComment, emp.keyEvents, emp.developmentFeedback].join(' ');
  const lines = emp.performanceComment.split(/[。；.!?]/).filter(Boolean);

  // 1. 特征提取
  const pos = extractKeywords(fullText, ABILITY_POSITIVE);
  const neg = extractKeywords(fullText, ABILITY_NEGATIVE);
  const abilityWords = [...new Set([...pos.words, ...Object.keys(ABILITY_NEGATIVE).filter(k => fullText.includes(k))])];
  const emotionWords = Object.keys(ABILITY_NEGATIVE).filter(k => fullText.includes(k));
  const improvementPoints = lines.filter(l => /不足|需|待|改进|缺乏|低|被动/.test(l));

  // 2. 分类标注
  const classification: Record<string, { strength: string; evidence: string[] }> = {};
  if (fullText.includes('执行力') || fullText.includes('独立推进')) {
    const ev = lines.filter(l => l.includes('执行') || l.includes('推进') || l.includes('交付'));
    classification['执行力'] = { strength: ev.some(l => l.includes('强')) ? '强' : '中', evidence: ev.slice(0, 2) };
  }
  if (fullText.includes('沟通') || fullText.includes('协作')) {
    const ev = lines.filter(l => l.includes('沟通') || l.includes('协作'));
    classification['沟通协作'] = { strength: ev.some(l => l.includes('不足') || l.includes('被动')) ? '弱' : '中', evidence: ev.slice(0, 2) };
  }
  if (fullText.includes('学习') || fullText.includes('掌握')) {
    const ev = lines.filter(l => l.includes('学习') || l.includes('掌握'));
    classification['学习能力'] = { strength: ev.some(l => /极|很|突出/.test(l)) ? '强' : '中', evidence: ev.slice(0, 2) };
  }
  if (fullText.includes('主动') || fullText.includes('承担')) {
    const ev = lines.filter(l => l.includes('主动') || l.includes('承担'));
    classification['主动性'] = { strength: ev.length > 0 ? '强' : '中', evidence: ev.slice(0, 2) };
  }
  if (emotionWords.length > 0) {
    classification['抗压能力'] = { strength: '中', evidence: lines.filter(l => emotionWords.some(e => l.includes(e))).slice(0, 2) };
  }

  // 3. 模型判断
  let perfBase = emp.performanceScore ?? 70;
  const posScore = pos.total;
  const negScore = neg.total;
  perfBase = Math.max(0, Math.min(100, perfBase + (posScore / 10) - (negScore / 5)));
  const potentialBase = 65 + (pos.total * 3) - (neg.total * 5);
  const potentialScore = Math.max(0, Math.min(100, potentialBase));

  // 风险信号强则降分
  const riskSignals = ['热情下降', '意愿低', '被动', '下滑', '缺乏'];
  const hasRisk = riskSignals.some(r => fullText.includes(r));
  const adjPerf = hasRisk ? perfBase * 0.85 : perfBase;
  const adjPot = hasRisk ? potentialScore * 0.8 : potentialScore;

  const perfGrade = scoreToGrade(adjPerf);
  const potGrade = scoreToGrade(adjPot);
  const gridPosition = `${perfGrade}-${potGrade}`;

  // 置信度
  const evidenceCount = abilityWords.length + improvementPoints.length;
  const conf = (c: number) => (c >= 5 ? '高' as const : c >= 3 ? '中' as const : '低' as const);

  // 4. 人才标签
  const talentTags: string[] = [];
  if (gridPosition === '3-3') talentTags.push('高潜人才', '超级明星');
  else if (gridPosition === '2-3' || gridPosition === '3-2') talentTags.push('核心骨干');
  else if (pos.words.includes('学习能力') || pos.words.includes('主动')) talentTags.push('高潜人才');
  else if (gridPosition === '2-2') talentTags.push('中坚力量', '执行型人才');
  else if (gridPosition.includes('1')) talentTags.push('需提升');
  if (neg.words.length > 0) talentTags.push('需关注');
  if (hasRisk) talentTags.push('风险预警');

  // 5. 风险提示
  let riskTip: string | undefined;
  const developmentSuggestions: string[] = [];
  if (hasRisk) {
    riskTip = '检测到工作热情下降、学习意愿低等风险信号，建议重点关注';
    developmentSuggestions.push('立即安排一对一沟通', '了解工作动力变化原因', '评估岗位适配度');
  } else if (improvementPoints.length >= 2) {
    riskTip = '存在多个改进点，建议制定发展计划';
  }
  if (fullText.includes('沟通') && (fullText.includes('不足') || fullText.includes('被动'))) {
    developmentSuggestions.push('参与跨部门沟通工作坊');
  }
  if (emotionWords.includes('焦虑') || fullText.includes('不确定性')) {
    developmentSuggestions.push('安排不确定性管理培训');
  }
  if (gridPosition === '3-3' || (pos.words.includes('学习能力') && pos.words.includes('主动'))) {
    developmentSuggestions.push('纳入高潜人才库', '安排导师指导');
  }

  // 证据片段
  const evidenceSnippets = [
    ...lines.filter(l => pos.words.some(w => l.includes(w))).slice(0, 3),
    ...improvementPoints.slice(0, 2),
  ].filter(Boolean);

  return {
    featureExtraction: { abilityWords, emotionWords, improvementPoints },
    classification,
    modelJudgment: {
      performanceScore: Math.round(adjPerf),
      potentialScore: Math.round(adjPot),
      confidence: { performance: conf(evidenceCount), potential: conf(evidenceCount - 1) },
    },
    suggestion: {
      gridPosition,
      talentTags: [...new Set(talentTags)],
      riskTip,
      developmentSuggestions,
    },
    evidenceSnippets,
  };
}
