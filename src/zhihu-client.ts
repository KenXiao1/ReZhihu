// 知乎 API 客户端

import type { Env, ZhihuUser, ZhihuPagingResponse, Content, ContentType } from './types';

const ZHIHU_API_BASE = 'https://www.zhihu.com/api/v4';
const ZHIHU_ZHUANLAN_API = 'https://zhuanlan.zhihu.com/api';

// 默认请求头
function getHeaders(cookies: string, referer = 'https://www.zhihu.com/'): Record<string, string> {
  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Referer': referer,
    'x-api-version': '3.0.91',
    'x-requested-with': 'fetch',
    'Cookie': cookies,
  };
}

export class ZhihuClient {
  private cookies: string;

  constructor(cookies: string) {
    this.cookies = cookies;
  }

  // 通用请求方法
  private async request<T>(url: string, referer?: string): Promise<T> {
    const response = await fetch(url, {
      headers: getHeaders(this.cookies, referer),
    });

    if (!response.ok) {
      throw new Error(`Zhihu API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // 获取当前登录用户信息
  async getMe(): Promise<ZhihuUser> {
    const data = await this.request<any>(`${ZHIHU_API_BASE}/me`);
    return {
      id: data.id,
      url_token: data.url_token,
      name: data.name,
      headline: data.headline,
      avatar_url: data.avatar_url,
    };
  }

  // 获取用户关注的人列表
  async getFollowees(
    userUrlToken: string,
    offset = 0,
    limit = 20
  ): Promise<ZhihuPagingResponse<ZhihuUser>> {
    const url = `${ZHIHU_API_BASE}/members/${userUrlToken}/followees?offset=${offset}&limit=${limit}`;
    const data = await this.request<any>(url, `https://www.zhihu.com/people/${userUrlToken}/following`);

    return {
      data: data.data.map((item: any) => ({
        id: item.id,
        url_token: item.url_token,
        name: item.name,
        headline: item.headline,
        avatar_url: item.avatar_url,
        follower_count: item.follower_count,
        answer_count: item.answer_count,
        articles_count: item.articles_count,
      })),
      paging: data.paging,
    };
  }

  // 获取用户的文章列表
  async getUserArticles(
    userUrlToken: string,
    offset = 0,
    limit = 20
  ): Promise<ZhihuPagingResponse<Content>> {
    const url = `${ZHIHU_API_BASE}/members/${userUrlToken}/articles?offset=${offset}&limit=${limit}&sort_by=created`;
    const data = await this.request<any>(url, `https://www.zhihu.com/people/${userUrlToken}/posts`);

    return {
      data: data.data.map((item: any) => this.normalizeArticle(item)),
      paging: data.paging,
    };
  }

  // 获取用户的回答列表
  async getUserAnswers(
    userUrlToken: string,
    offset = 0,
    limit = 20
  ): Promise<ZhihuPagingResponse<Content>> {
    const url = `${ZHIHU_API_BASE}/members/${userUrlToken}/answers?offset=${offset}&limit=${limit}&sort_by=created`;
    const data = await this.request<any>(url, `https://www.zhihu.com/people/${userUrlToken}/answers`);

    return {
      data: data.data.map((item: any) => this.normalizeAnswer(item)),
      paging: data.paging,
    };
  }

  // 获取用户的想法列表
  async getUserPins(
    userUrlToken: string,
    offset = 0,
    limit = 20
  ): Promise<ZhihuPagingResponse<Content>> {
    const url = `${ZHIHU_API_BASE}/members/${userUrlToken}/pins?offset=${offset}&limit=${limit}`;
    const data = await this.request<any>(url, `https://www.zhihu.com/people/${userUrlToken}/pins`);

    return {
      data: data.data.map((item: any) => this.normalizePin(item)),
      paging: data.paging,
    };
  }

  // 获取用户点赞的内容 (动态)
  async getUserActivities(
    userUrlToken: string,
    afterId?: string,
    limit = 20
  ): Promise<{ data: { content: Content; action_type: 'create' | 'like'; action_time: number }[]; paging: any }> {
    let url = `${ZHIHU_API_BASE}/members/${userUrlToken}/activities?limit=${limit}`;
    if (afterId) {
      url += `&after_id=${afterId}`;
    }

    const data = await this.request<any>(url, `https://www.zhihu.com/people/${userUrlToken}/activities`);

    const activities: { content: Content; action_type: 'create' | 'like'; action_time: number }[] = [];

    for (const item of data.data) {
      const actionType = this.parseActionType(item.action_text);
      if (!actionType) continue;

      const target = item.target;
      if (!target || !target.type) continue;

      let content: Content | null = null;

      if (target.type === 'article') {
        content = this.normalizeArticle(target);
      } else if (target.type === 'answer') {
        content = this.normalizeAnswer(target);
      } else if (target.type === 'pin') {
        content = this.normalizePin(target);
      }

      if (content) {
        activities.push({
          content,
          action_type: actionType,
          action_time: item.created_time || item.action_time || Date.now() / 1000,
        });
      }
    }

    return {
      data: activities,
      paging: data.paging,
    };
  }

  // 解析动作类型
  private parseActionType(actionText: string): 'create' | 'like' | null {
    if (!actionText) return null;
    if (actionText.includes('赞同') || actionText.includes('喜欢')) {
      return 'like';
    }
    if (actionText.includes('发布') || actionText.includes('回答') || actionText.includes('写了')) {
      return 'create';
    }
    return null;
  }

  // 标准化文章数据
  private normalizeArticle(item: any): Content {
    return {
      id: String(item.id),
      type: 'article',
      title: item.title || '',
      excerpt: item.excerpt || '',
      content: item.content || '',
      url: `https://zhuanlan.zhihu.com/p/${item.id}`,
      author_id: item.author?.id || '',
      author_name: item.author?.name || '',
      word_count: this.countWords(item.content || item.excerpt || ''),
      voteup_count: item.voteup_count || 0,
      comment_count: item.comment_count || 0,
      created_time: item.created || item.created_time || 0,
      updated_time: item.updated || item.updated_time || 0,
    };
  }

  // 标准化回答数据
  private normalizeAnswer(item: any): Content {
    return {
      id: String(item.id),
      type: 'answer',
      title: item.question?.title || '',
      excerpt: item.excerpt || '',
      content: item.content || '',
      url: `https://www.zhihu.com/question/${item.question?.id}/answer/${item.id}`,
      author_id: item.author?.id || '',
      author_name: item.author?.name || '',
      word_count: this.countWords(item.content || item.excerpt || ''),
      voteup_count: item.voteup_count || 0,
      comment_count: item.comment_count || 0,
      created_time: item.created_time || 0,
      updated_time: item.updated_time || 0,
    };
  }

  // 标准化想法数据
  private normalizePin(item: any): Content {
    const contentText = item.content?.[0]?.content || item.content_html || '';
    return {
      id: String(item.id),
      type: 'pin',
      title: this.truncate(this.stripHtml(contentText), 50),
      excerpt: item.excerpt_title || this.truncate(this.stripHtml(contentText), 200),
      content: item.content_html || contentText,
      url: `https://www.zhihu.com/pin/${item.id}`,
      author_id: item.author?.id || '',
      author_name: item.author?.name || '',
      word_count: this.countWords(contentText),
      voteup_count: item.like_count || 0,
      comment_count: item.comment_count || 0,
      created_time: item.created || 0,
      updated_time: item.updated || item.created || 0,
    };
  }

  // 计算字数 (去除 HTML 标签后)
  private countWords(html: string): number {
    const text = this.stripHtml(html);
    // 中文按字符计算，英文按单词计算
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }

  // 去除 HTML 标签
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  }

  // 截断字符串
  private truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '...';
  }
}
