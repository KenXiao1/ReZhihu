// 抓取任务调度器

import type { Env, Content, ZhihuUser } from './types';
import { ZhihuClient } from './zhihu-client';
import { Database } from './database';
import { ContentFilter } from './filter';
import { ScoreCalculator } from './score';

export class FetchScheduler {
  private client: ZhihuClient;
  private db: Database;
  private batchSize: number;

  constructor(cookies: string, db: D1Database, batchSize = 50) {
    this.client = new ZhihuClient(cookies);
    this.db = new Database(db);
    this.batchSize = batchSize;
  }

  // 初始化：同步关注列表
  async syncFollowees(myUrlToken: string): Promise<{ synced: number; total: number }> {
    console.log(`[Sync] Starting followees sync for ${myUrlToken}`);

    const allUsers: ZhihuUser[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await this.client.getFollowees(myUrlToken, offset, 20);
      allUsers.push(...response.data);
      hasMore = !response.paging.is_end;
      offset += 20;

      // 防止请求过快
      await this.sleep(500);

      // 安全限制：最多同步 2000 个用户
      if (allUsers.length >= 2000) {
        console.log('[Sync] Reached max user limit (2000)');
        break;
      }
    }

    // 批量写入数据库
    await this.db.upsertUsers(allUsers);

    console.log(`[Sync] Synced ${allUsers.length} followees`);
    return { synced: allUsers.length, total: allUsers.length };
  }

  // 执行一批用户的内容抓取
  async fetchBatch(): Promise<{ processed: number; contents: number; batch: number; total: number }> {
    const state = await this.db.getFetchState();
    const userCount = await this.db.getUserCount();

    if (userCount === 0) {
      console.log('[Fetch] No users to fetch');
      return { processed: 0, contents: 0, batch: 0, total: 0 };
    }

    const totalBatches = Math.ceil(userCount / this.batchSize);
    const currentBatch = state.current_batch % totalBatches;
    const offset = currentBatch * this.batchSize;

    console.log(`[Fetch] Processing batch ${currentBatch + 1}/${totalBatches}`);

    const users = await this.db.getUsersToFetch(this.batchSize, offset);
    let totalContents = 0;

    for (const user of users) {
      try {
        const count = await this.fetchUserContent(user.id, user.url_token);
        totalContents += count;
        await this.db.updateUserFetchedTime(user.id);

        // 每个用户之间稍作延迟
        await this.sleep(300);
      } catch (error) {
        console.error(`[Fetch] Error fetching user ${user.name}:`, error);
      }
    }

    // 更新状态
    const nextBatch = (currentBatch + 1) % totalBatches;
    const isFullCycleComplete = nextBatch === 0;

    await this.db.updateFetchState({
      current_batch: nextBatch,
      total_batches: totalBatches,
      users_synced: state.users_synced + users.length,
      ...(isFullCycleComplete ? { last_full_sync: Math.floor(Date.now() / 1000) } : {}),
    });

    console.log(`[Fetch] Batch complete: ${users.length} users, ${totalContents} contents`);

    return {
      processed: users.length,
      contents: totalContents,
      batch: currentBatch + 1,
      total: totalBatches,
    };
  }

  // 抓取单个用户的内容
  private async fetchUserContent(userId: string, urlToken: string): Promise<number> {
    const contents: Content[] = [];

    try {
      // 获取用户动态 (包含创作和点赞)
      const activities = await this.client.getUserActivities(urlToken, undefined, 20);

      for (const activity of activities.data) {
        contents.push(activity.content);

        // 记录动态
        await this.db.upsertActivity(
          userId,
          activity.content.id,
          activity.action_type,
          activity.action_time
        );
      }

      // 批量保存内容
      if (contents.length > 0) {
        await this.db.upsertContents(contents);

        // 计算分数并添加到 feed
        await this.processNewContents(contents);
      }
    } catch (error) {
      console.error(`[Fetch] Error in fetchUserContent for ${urlToken}:`, error);
    }

    return contents.length;
  }

  // 处理新内容：过滤、计分、加入 feed
  private async processNewContents(contents: Content[]): Promise<void> {
    // 获取过滤规则
    const rules = await this.db.getFilterRules();
    const filter = new ContentFilter(rules);
    const scorer = new ScoreCalculator();

    // 获取来源信息
    const contentIds = contents.map(c => c.id);
    const sourcesMap = await this.db.getContentSources(contentIds);

    for (const content of contents) {
      // 过滤
      const filterResult = filter.filter(content);

      // 计算分数
      const sources = sourcesMap.get(content.id) || [];
      const score = scorer.calculate(
        content,
        sources.map(s => ({ action_type: s.action_type as 'create' | 'like' }))
      );

      // 添加到 feed
      await this.db.addFeedItem(
        content.id,
        score,
        !filterResult.passed,
        filterResult.reason
      );
    }
  }

  // 辅助：延迟
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
