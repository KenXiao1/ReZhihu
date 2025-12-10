// 内容过滤系统

import type { Content, FilterRule } from './types';

export interface FilterResult {
  passed: boolean;
  reason?: string;
}

export class ContentFilter {
  private rules: FilterRule[];

  constructor(rules: FilterRule[]) {
    this.rules = rules.filter(r => r.enabled);
  }

  // 过滤单个内容
  filter(content: Content): FilterResult {
    // 1. 检查关键词黑名单
    const keywordRules = this.rules.filter(r => r.type === 'keyword_blacklist');
    for (const rule of keywordRules) {
      const keywords = rule.value.split(',').map(k => k.trim().toLowerCase());
      const textToCheck = `${content.title} ${content.excerpt}`.toLowerCase();

      for (const keyword of keywords) {
        if (keyword && textToCheck.includes(keyword)) {
          return { passed: false, reason: `包含屏蔽关键词: ${keyword}` };
        }
      }
    }

    // 2. 检查最低字数
    const wordCountRules = this.rules.filter(r => r.type === 'min_word_count');
    for (const rule of wordCountRules) {
      const minCount = parseInt(rule.value, 10);
      if (!isNaN(minCount) && content.word_count < minCount) {
        return { passed: false, reason: `字数不足: ${content.word_count} < ${minCount}` };
      }
    }

    // 3. 检查内容类型
    const contentTypeRules = this.rules.filter(r => r.type === 'content_type');
    if (contentTypeRules.length > 0) {
      const allowedTypes = contentTypeRules.flatMap(r => r.value.split(',').map(t => t.trim()));
      if (!allowedTypes.includes(content.type)) {
        return { passed: false, reason: `内容类型不在允许列表: ${content.type}` };
      }
    }

    // 4. 检查作者黑名单
    const authorRules = this.rules.filter(r => r.type === 'author_blacklist');
    for (const rule of authorRules) {
      const authors = rule.value.split(',').map(a => a.trim().toLowerCase());
      if (authors.includes(content.author_name.toLowerCase())) {
        return { passed: false, reason: `作者在黑名单: ${content.author_name}` };
      }
    }

    return { passed: true };
  }

  // 批量过滤
  filterBatch(contents: Content[]): { passed: Content[]; filtered: { content: Content; reason: string }[] } {
    const passed: Content[] = [];
    const filtered: { content: Content; reason: string }[] = [];

    for (const content of contents) {
      const result = this.filter(content);
      if (result.passed) {
        passed.push(content);
      } else {
        filtered.push({ content, reason: result.reason! });
      }
    }

    return { passed, filtered };
  }
}

// 默认过滤规则
export const DEFAULT_FILTER_RULES: Omit<FilterRule, 'id'>[] = [
  {
    type: 'keyword_blacklist',
    value: '广告,推广,优惠券,点击领取,限时特价,带货,种草,测评,开箱',
    enabled: true,
  },
  {
    type: 'min_word_count',
    value: '100',
    enabled: true,
  },
  {
    type: 'content_type',
    value: 'article,answer', // 默认不包含 pin (想法)
    enabled: false,
  },
];
