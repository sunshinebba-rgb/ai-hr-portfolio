// AI驱动人才盘点与绩效校准系统 - 类型定义

/** 与 rules.md · junior_level / middle_level / senior_level 一一对应 */
export type JobTier = '基层' | '中层' | '高层'

/** 日常工作一至四分档位 */
export type DailyPointLevel = 1 | 2 | 3 | 4

export interface DailyTiersInput {
  contribution: DailyPointLevel | null
  quality: DailyPointLevel | null
  timeliness: DailyPointLevel | null
}

/** 语义引擎命中（与接口约定字段名一致） */
export interface CompetencySemanticHit {
  rowKey: string
  competencyName: string
  命中项: string
  匹配证据: string
  推荐分数: number
  档位标签: string
}

export interface EmployeeInput {
  id: string;
  name: string;
  department: string;
  role: string;
  /** 专业职级标签（展示用，可选） */
  level: string;
  /** 组织职级层级：驱动能力字典 junior / middle / senior */
  jobTier?: JobTier;
  tenure: string;
  performanceScore?: number;
  /** 日常工作三项档位（与横轴三成权重联动） */
  dailyTiers?: DailyTiersInput;
  /** 能力项打分（键为 competencyRules 中 rowKey，零至七分） */
  competencyScores?: Record<string, number | null>;
  /** 最近一次智能解析命中摘要 */
  semanticHits?: CompetencySemanticHit[];
  performanceComment: string;
  keyEvents: string;
  developmentFeedback: string;
}

export interface AIAnalysis {
  featureExtraction: {
    abilityWords: string[];
    emotionWords: string[];
    improvementPoints: string[];
  };
  classification: Record<string, { strength: string; evidence: string[] }>;
  /** 规则库关键词映射命中 */
  semanticHits?: CompetencySemanticHit[];
  modelJudgment: {
    performanceScore: number;
    potentialScore: number;
    confidence: { performance: '高' | '中' | '低'; potential: '高' | '中' | '低' };
  };
  suggestion: {
    gridPosition: string;  // 九宫格定位
    talentTags: string[];
    riskTip?: string;
    developmentSuggestions?: string[];
  };
  evidenceSnippets: string[];
}

export interface HRCalibration {
  confirmed: string[];
  adjusted: { field: string; from: string; to: string; reason: string }[];
  supplements: string[];
  finalDecision: string;
}

export interface TalentRecord {
  employee: EmployeeInput;
  aiAnalysis: AIAnalysis;
  hrCalibration?: HRCalibration;
  finalResult?: {
    performanceScore: number;
    potentialScore: number;
    gridPosition: string;
    talentTags: string[];
    developmentSuggestions: string[];
    riskLevel: '高' | '中' | '低';
    evidence: string[];
  };
  version?: string;
}

// 九宫格定义 (绩效×潜力 0-100 映射到 1-3 档)
export const GRID_MAP: Record<string, { id: string; label: string; color: string; bg: string; category: string }> = {
  '3-3': { id: '1', label: '超级明星', color: '#52c41a', bg: '#f6ffed', category: '高绩效-高潜力' },
  '2-3': { id: '2+', label: '核心骨干', color: '#1890ff', bg: '#e6f7ff', category: '中绩效-高潜力' },
  '3-2': { id: '2+', label: '核心骨干', color: '#1890ff', bg: '#e6f7ff', category: '高绩效-中潜力' },
  '2-2': { id: '2', label: '中坚力量', color: '#722ed1', bg: '#f9f0ff', category: '中绩效-中潜力' },
  '1-3': { id: '3', label: '业绩待提升', color: '#faad14', bg: '#fff7e6', category: '低绩效-高潜力' },
  '3-1': { id: '4', label: '业绩明星', color: '#faad14', bg: '#fff7e6', category: '高绩效-低潜力' },
  '2-1': { id: '4', label: '素质待提升', color: '#fa8c16', bg: '#fff7e6', category: '中绩效-低潜力' },
  '1-2': { id: '5', label: '待改进', color: '#fa8c16', bg: '#fff7e6', category: '低绩效-中潜力' },
  '1-1': { id: '5', label: '双待提升', color: '#f5222d', bg: '#fff1f0', category: '低绩效-低潜力' },
};
