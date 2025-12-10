// 推荐分数计算

import type { Content } from './types';

export interface ScoreFactors {
  // 时间衰减
  timeDecayDays: number; // 多少天后分数减半
  // 权重
  voteupWeight: number;
  commentWeight: number;
  wordCountWeight: number;
  // 来源加成
  createBonus: number;  // 原创内容加成
  likeBonus: number;    // 点赞内容加成
  // 多人推荐加成
  multiSourceBonus: number; // 每多一个人推荐的加成
}

const DEFAULT_FACTORS: ScoreFactors = {
  timeDecayDays: 7,
  voteupWeight: 1,
  commentWeight: 0.5,
  wordCountWeight: 0.01,
  createBonus: 1.5,
  likeBonus: 1.0,
  multiSourceBonus: 0.2,
};

export class ScoreCalculator {
  private factors: ScoreFactors;

  constructor(factors: Partial<ScoreFactors> = {}) {
    this.factors = { ...DEFAULT_FACTORS, ...factors };
  }

  // 计算内容分数
  calculate(
    content: Content,
    sources: { action_type: 'create' | 'like' }[],
    now = Date.now()
  ): number {
    // 1. 基础分 (互动数据)
    const baseScore =
      content.voteup_count * this.factors.voteupWeight +
      content.comment_count * this.factors.commentWeight +
      Math.min(content.word_count, 5000) * this.factors.wordCountWeight;

    // 2. 来源加成
    let sourceMultiplier = 0;
    for (const source of sources) {
      if (source.action_type === 'create') {
        sourceMultiplier += this.factors.createBonus;
      } else {
        sourceMultiplier += this.factors.likeBonus;
      }
    }
    // 多人推荐加成
    if (sources.length > 1) {
      sourceMultiplier += (sources.length - 1) * this.factors.multiSourceBonus;
    }
    sourceMultiplier = Math.max(sourceMultiplier, 1);

    // 3. 时间衰减
    const ageMs = now - content.created_time * 1000;
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    const timeMultiplier = Math.pow(0.5, ageDays / this.factors.timeDecayDays);

    // 4. 最终分数
    const score = baseScore * sourceMultiplier * timeMultiplier;

    return Math.round(score * 100) / 100;
  }

  // 批量计算
  calculateBatch(
    contents: Content[],
    sourcesMap: Map<string, { action_type: 'create' | 'like' }[]>,
    now = Date.now()
  ): Map<string, number> {
    const scores = new Map<string, number>();

    for (const content of contents) {
      const sources = sourcesMap.get(content.id) || [];
      scores.set(content.id, this.calculate(content, sources, now));
    }

    return scores;
  }
}
