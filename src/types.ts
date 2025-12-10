// 类型定义

export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  KV: KVNamespace;
  BATCH_SIZE: string;
  // Secrets (通过 wrangler secret put 设置)
  ZHIHU_COOKIES?: string;
}

// 知乎用户
export interface ZhihuUser {
  id: string;
  url_token: string;
  name: string;
  headline?: string;
  avatar_url?: string;
  follower_count?: number;
  answer_count?: number;
  articles_count?: number;
}

// 知乎内容类型
export type ContentType = 'article' | 'answer' | 'pin';

// 知乎文章
export interface ZhihuArticle {
  id: string;
  type: 'article';
  title: string;
  excerpt: string;
  content: string;
  url: string;
  author: ZhihuUser;
  voteup_count: number;
  comment_count: number;
  word_count?: number;
  created: number;
  updated: number;
}

// 知乎回答
export interface ZhihuAnswer {
  id: string;
  type: 'answer';
  question: {
    id: string;
    title: string;
  };
  excerpt: string;
  content: string;
  url: string;
  author: ZhihuUser;
  voteup_count: number;
  comment_count: number;
  thanks_count?: number;
  created_time: number;
  updated_time: number;
}

// 知乎想法
export interface ZhihuPin {
  id: string;
  type: 'pin';
  content_html: string;
  excerpt_title: string;
  author: ZhihuUser;
  like_count: number;
  comment_count: number;
  created: number;
  updated: number;
}

// 统一内容接口
export interface Content {
  id: string;
  type: ContentType;
  title: string;
  excerpt: string;
  content: string;
  url: string;
  author_id: string;
  author_name: string;
  word_count: number;
  voteup_count: number;
  comment_count: number;
  created_time: number;
  updated_time: number;
}

// 用户动态
export interface Activity {
  user_id: string;
  content_id: string;
  action_type: 'create' | 'like';
  action_time: number;
}

// Feed 条目
export interface FeedItem {
  id: number;
  content_id: string;
  score: number;
  is_read: boolean;
  is_filtered: boolean;
  filter_reason?: string;
  added_at: number;
  // 关联的内容
  content?: Content;
  // 来源信息
  sources?: {
    user_name: string;
    action_type: 'create' | 'like';
  }[];
}

// 过滤规则
export interface FilterRule {
  id: number;
  type: 'keyword_blacklist' | 'min_word_count' | 'content_type' | 'author_blacklist';
  value: string;
  enabled: boolean;
}

// 抓取状态
export interface FetchState {
  current_batch: number;
  total_batches: number;
  last_full_sync: number;
  users_synced: number;
}

// API 响应
export interface ZhihuPagingResponse<T> {
  data: T[];
  paging: {
    is_end: boolean;
    next: string;
    previous: string;
    totals?: number;
  };
}

// RSS Feed
export interface RSSFeed {
  title: string;
  description: string;
  link: string;
  lastBuildDate: string;
  items: RSSItem[];
}

export interface RSSItem {
  title: string;
  link: string;
  description: string;
  author: string;
  pubDate: string;
  guid: string;
  // 扩展字段
  source?: string;
  voteup_count?: number;
  word_count?: number;
}
