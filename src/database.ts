// 数据库操作

import type { Env, Content, FilterRule, FetchState, ZhihuUser } from './types';

export class Database {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  // ===== 用户操作 =====

  // 批量插入/更新用户
  async upsertUsers(users: ZhihuUser[]): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO users (id, url_token, name, headline, avatar_url)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        url_token = excluded.url_token,
        name = excluded.name,
        headline = excluded.headline,
        avatar_url = excluded.avatar_url
    `);

    const batch = users.map(u =>
      stmt.bind(u.id, u.url_token, u.name, u.headline || '', u.avatar_url || '')
    );

    await this.db.batch(batch);
  }

  // 获取需要抓取的用户 (按上次抓取时间排序)
  async getUsersToFetch(limit: number, offset: number): Promise<{ id: string; url_token: string; name: string }[]> {
    const result = await this.db.prepare(`
      SELECT id, url_token, name FROM users
      ORDER BY last_fetched_at ASC NULLS FIRST, id
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();

    return result.results as any[];
  }

  // 更新用户抓取时间
  async updateUserFetchedTime(userId: string): Promise<void> {
    await this.db.prepare(`
      UPDATE users SET last_fetched_at = unixepoch() WHERE id = ?
    `).bind(userId).run();
  }

  // 获取用户总数
  async getUserCount(): Promise<number> {
    const result = await this.db.prepare('SELECT COUNT(*) as count FROM users').first();
    return (result as any)?.count || 0;
  }

  // ===== 内容操作 =====

  // 插入/更新内容
  async upsertContent(content: Content): Promise<void> {
    await this.db.prepare(`
      INSERT INTO contents (id, type, title, excerpt, content, url, author_id, author_name, word_count, voteup_count, comment_count, created_time, updated_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        excerpt = excluded.excerpt,
        content = excluded.content,
        voteup_count = excluded.voteup_count,
        comment_count = excluded.comment_count,
        updated_time = excluded.updated_time,
        fetched_at = unixepoch()
    `).bind(
      content.id,
      content.type,
      content.title,
      content.excerpt,
      content.content,
      content.url,
      content.author_id,
      content.author_name,
      content.word_count,
      content.voteup_count,
      content.comment_count,
      content.created_time,
      content.updated_time
    ).run();
  }

  // 批量插入内容
  async upsertContents(contents: Content[]): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO contents (id, type, title, excerpt, content, url, author_id, author_name, word_count, voteup_count, comment_count, created_time, updated_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        excerpt = excluded.excerpt,
        voteup_count = excluded.voteup_count,
        comment_count = excluded.comment_count,
        updated_time = excluded.updated_time,
        fetched_at = unixepoch()
    `);

    const batch = contents.map(c =>
      stmt.bind(c.id, c.type, c.title, c.excerpt, c.content, c.url, c.author_id, c.author_name, c.word_count, c.voteup_count, c.comment_count, c.created_time, c.updated_time)
    );

    // D1 批量操作有限制，分批执行
    const BATCH_SIZE = 50;
    for (let i = 0; i < batch.length; i += BATCH_SIZE) {
      await this.db.batch(batch.slice(i, i + BATCH_SIZE));
    }
  }

  // 获取内容
  async getContent(contentId: string): Promise<Content | null> {
    const result = await this.db.prepare('SELECT * FROM contents WHERE id = ?').bind(contentId).first();
    return result as Content | null;
  }

  // 获取多个内容
  async getContents(contentIds: string[]): Promise<Map<string, Content>> {
    if (contentIds.length === 0) return new Map();

    const placeholders = contentIds.map(() => '?').join(',');
    const result = await this.db.prepare(`SELECT * FROM contents WHERE id IN (${placeholders})`).bind(...contentIds).all();

    const map = new Map<string, Content>();
    for (const row of result.results) {
      map.set((row as any).id, row as unknown as Content);
    }
    return map;
  }

  // ===== 动态操作 =====

  // 插入动态
  async upsertActivity(userId: string, contentId: string, actionType: 'create' | 'like', actionTime: number): Promise<void> {
    await this.db.prepare(`
      INSERT INTO activities (user_id, content_id, action_type, action_time)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, content_id, action_type) DO UPDATE SET
        action_time = excluded.action_time
    `).bind(userId, contentId, actionType, actionTime).run();
  }

  // 获取内容的来源信息
  async getContentSources(contentIds: string[]): Promise<Map<string, { user_name: string; action_type: string }[]>> {
    if (contentIds.length === 0) return new Map();

    const placeholders = contentIds.map(() => '?').join(',');
    const result = await this.db.prepare(`
      SELECT a.content_id, u.name as user_name, a.action_type
      FROM activities a
      JOIN users u ON a.user_id = u.id
      WHERE a.content_id IN (${placeholders})
    `).bind(...contentIds).all();

    const map = new Map<string, { user_name: string; action_type: string }[]>();
    for (const row of result.results as any[]) {
      if (!map.has(row.content_id)) {
        map.set(row.content_id, []);
      }
      map.get(row.content_id)!.push({ user_name: row.user_name, action_type: row.action_type });
    }
    return map;
  }

  // ===== Feed 条目操作 =====

  // 添加 Feed 条目
  async addFeedItem(contentId: string, score: number, isFiltered: boolean, filterReason?: string): Promise<void> {
    await this.db.prepare(`
      INSERT INTO feed_items (content_id, score, is_filtered, filter_reason)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(content_id) DO UPDATE SET
        score = excluded.score,
        is_filtered = excluded.is_filtered,
        filter_reason = excluded.filter_reason
    `).bind(contentId, score, isFiltered ? 1 : 0, filterReason || null).run();
  }

  // 获取 Feed 条目 (按分数排序)
  async getFeedItems(limit = 100, includeFiltered = false): Promise<{ content_id: string; score: number; is_filtered: boolean; filter_reason: string | null; added_at: number }[]> {
    const whereClause = includeFiltered ? '' : 'WHERE is_filtered = 0';
    const result = await this.db.prepare(`
      SELECT content_id, score, is_filtered, filter_reason, added_at
      FROM feed_items
      ${whereClause}
      ORDER BY score DESC, added_at DESC
      LIMIT ?
    `).bind(limit).all();

    return result.results as any[];
  }

  // ===== 过滤规则操作 =====

  // 获取所有过滤规则
  async getFilterRules(): Promise<FilterRule[]> {
    const result = await this.db.prepare('SELECT * FROM filter_rules WHERE enabled = 1').all();
    return result.results as unknown as FilterRule[];
  }

  // 添加过滤规则
  async addFilterRule(type: string, value: string): Promise<void> {
    await this.db.prepare('INSERT INTO filter_rules (type, value) VALUES (?, ?)').bind(type, value).run();
  }

  // ===== 抓取状态操作 =====

  // 获取抓取状态
  async getFetchState(): Promise<FetchState> {
    const result = await this.db.prepare("SELECT value FROM fetch_state WHERE key = 'state'").first();
    if (result?.value) {
      return JSON.parse(result.value as string);
    }
    return {
      current_batch: 0,
      total_batches: 0,
      last_full_sync: 0,
      users_synced: 0,
    };
  }

  // 更新抓取状态
  async updateFetchState(state: Partial<FetchState>): Promise<void> {
    const current = await this.getFetchState();
    const newState = { ...current, ...state };
    await this.db.prepare(`
      INSERT INTO fetch_state (key, value, updated_at)
      VALUES ('state', ?, unixepoch())
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `).bind(JSON.stringify(newState)).run();
  }
}
