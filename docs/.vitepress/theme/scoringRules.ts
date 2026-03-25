// scoringRules.ts - 人才盘点核心逻辑配置文件

export const SCORING_RULES = {
    // 1. 职级权重配置
    weights: {
      junior: { performance: 0.35, potential: 0.25, drive: 0.20, collaboration: 0.20 },
      middle: { problem_solving: 0.30, influence: 0.25, coaching: 0.20, resilience: 0.15, thinking: 0.10 },
      senior: { strategy: 0.35, insight: 0.25, innovation: 0.20, ambition: 0.10, leadership: 0.10 }
    },
  
    // 2. 九宫格判定区间
    boxMapping: {
      high: { min: 86, max: 100 },
      mid: { min: 61, max: 85 },
      low: { min: 0, max: 60 }
    },
  
    // 3. 数据清洗阈值
    cleaning: {
      minCharCount: 20,
      confidenceThreshold: 0.5
    }
  }