// AI驱动人才盘点与绩效校准系统 - 类型定义

export interface EmployeeInput {
  id: string;
  name: string;
  department: string;
  role: string;
  level: string;           // P4/P5/M2 等
  tenure: string;          // 1年/3年/5年+
  performanceScore?: number; // 0-100 量化评分
  performanceComment: string;  // 绩效评语
  keyEvents: string;       // 关键事件
  developmentFeedback: string; // 发展反馈
}

export interface AIAnalysis {
  featureExtraction: {
    abilityWords: string[];
    emotionWords: string[];
    improvementPoints: string[];
  };
  classification: Record<string, { strength: string; evidence: string[] }>;
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
