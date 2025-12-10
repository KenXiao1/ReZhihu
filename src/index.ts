// Cloudflare Worker 主入口

import type { Env, Content } from './types';
import { Database } from './database';
import { FetchScheduler } from './scheduler';
import { RSSGenerator } from './rss-generator';
import { ZhihuClient } from './zhihu-client';
import { DEFAULT_FILTER_RULES } from './filter';
import { generateIndexPage } from './ui';

export default {
  // HTTP 请求处理
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 路由
      if (path === '/' || path === '/index.html') {
        return new Response(generateIndexPage(), {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      if (path === '/feed.xml' || path === '/rss') {
        return this.handleRSSFeed(env, corsHeaders);
      }

      if (path === '/feed.json') {
        return this.handleJSONFeed(env, corsHeaders);
      }

      if (path === '/api/feed') {
        return this.handleFeedAPI(env, corsHeaders);
      }

      if (path === '/api/status') {
        return this.handleStatus(env, corsHeaders);
      }

      if (path === '/api/sync' && request.method === 'POST') {
        return this.handleSync(request, env, corsHeaders, ctx);
      }

      if (path === '/api/cookie' && request.method === 'POST') {
        return this.handleUpdateCookie(request, env, corsHeaders);
      }

      if (path === '/api/rules' && request.method === 'GET') {
        return this.handleGetRules(env, corsHeaders);
      }

      if (path === '/api/rules' && request.method === 'POST') {
        return this.handleAddRule(request, env, corsHeaders);
      }

      if (path.startsWith('/api/content/')) {
        const contentId = path.replace('/api/content/', '');
        return this.handleGetContent(contentId, env, corsHeaders);
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('Error handling request:', error);
      return new Response(JSON.stringify({ error: String(error) }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },

  // Cron 定时任务
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('[Cron] Scheduled task triggered');

    // 优先从 KV 获取 cookie (支持动态更新)
    const cookies = await env.KV.get('zhihu_cookies') || env.ZHIHU_COOKIES;

    if (!cookies) {
      console.error('[Cron] No cookies configured');
      return;
    }

    const batchSize = parseInt(env.BATCH_SIZE || '50', 10);
    const scheduler = new FetchScheduler(cookies, env.DB, batchSize);

    try {
      const result = await scheduler.fetchBatch();
      console.log(`[Cron] Completed: batch ${result.batch}/${result.total}, ${result.processed} users, ${result.contents} contents`);

      // 更新 RSS feed 缓存
      await this.updateFeedCache(env);
    } catch (error) {
      console.error('[Cron] Error:', error);
    }
  },

  // ===== 路由处理 =====

  // Feed API (供 UI 使用)
  async handleFeedAPI(env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    const db = new Database(env.DB);

    // 获取 feed 条目
    const feedItems = await db.getFeedItems(200);
    const contentIds = feedItems.map(f => f.content_id);

    if (contentIds.length === 0) {
      return new Response(JSON.stringify({ items: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 获取内容详情
    const contents = await db.getContents(contentIds);

    // 获取来源信息
    const sources = await db.getContentSources(contentIds);

    // 组装数据
    const items = feedItems
      .filter(f => contents.has(f.content_id))
      .map(f => {
        const content = contents.get(f.content_id)!;
        const itemSources = sources.get(f.content_id) || [];
        return {
          id: content.id,
          type: content.type,
          title: content.title,
          excerpt: content.excerpt,
          content: content.content,
          url: content.url,
          author_name: content.author_name,
          word_count: content.word_count,
          voteup_count: content.voteup_count,
          comment_count: content.comment_count,
          created_time: content.created_time,
          score: f.score,
          sources: itemSources.map(s => `${s.user_name} ${s.action_type === 'like' ? '赞了' : '发布了'}`),
        };
      });

    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },

  // 获取单个内容详情
  async handleGetContent(contentId: string, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    const db = new Database(env.DB);
    const content = await db.getContent(contentId);

    if (!content) {
      return new Response(JSON.stringify({ error: 'Content not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },

  // RSS Feed
  async handleRSSFeed(env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    // 尝试从缓存获取
    const cached = await env.KV.get('feed:xml');
    if (cached) {
      return new Response(cached, {
        headers: { ...corsHeaders, 'Content-Type': 'application/rss+xml; charset=utf-8' },
      });
    }

    // 生成新的 feed
    const feed = await this.generateFeed(env, 'xml');
    return new Response(feed, {
      headers: { ...corsHeaders, 'Content-Type': 'application/rss+xml; charset=utf-8' },
    });
  },

  // JSON Feed
  async handleJSONFeed(env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    const cached = await env.KV.get('feed:json');
    if (cached) {
      return new Response(cached, {
        headers: { ...corsHeaders, 'Content-Type': 'application/feed+json; charset=utf-8' },
      });
    }

    const feed = await this.generateFeed(env, 'json');
    return new Response(feed, {
      headers: { ...corsHeaders, 'Content-Type': 'application/feed+json; charset=utf-8' },
    });
  },

  // 系统状态
  async handleStatus(env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    const db = new Database(env.DB);

    const [userCount, fetchState] = await Promise.all([
      db.getUserCount(),
      db.getFetchState(),
    ]);

    const contentCountResult = await env.DB.prepare('SELECT COUNT(*) as count FROM contents').first();
    const feedCountResult = await env.DB.prepare('SELECT COUNT(*) as count FROM feed_items WHERE is_filtered = 0').first();

    // 检查 cookie 配置
    const kvCookies = await env.KV.get('zhihu_cookies');
    const hasCookies = !!(kvCookies || env.ZHIHU_COOKIES);

    return new Response(JSON.stringify({
      user_count: userCount,
      content_count: (contentCountResult as any)?.count || 0,
      feed_count: (feedCountResult as any)?.count || 0,
      fetch_state: fetchState,
      has_cookies: hasCookies,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },

  // 触发同步
  async handleSync(request: Request, env: Env, corsHeaders: Record<string, string>, ctx: ExecutionContext): Promise<Response> {
    // 优先从 KV 获取 cookie
    const cookies = await env.KV.get('zhihu_cookies') || env.ZHIHU_COOKIES;

    if (!cookies) {
      return new Response(JSON.stringify({ error: '请先在设置中配置 Cookie' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 获取当前用户信息
    const client = new ZhihuClient(cookies);
    let me;
    try {
      me = await client.getMe();
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Cookie 无效或已过期，请重新配置' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const batchSize = parseInt(env.BATCH_SIZE || '50', 10);
    const scheduler = new FetchScheduler(cookies, env.DB, batchSize);

    // 在后台执行同步
    ctx.waitUntil(
      scheduler.syncFollowees(me.url_token).then(async (result) => {
        console.log(`[Sync] Completed: ${result.synced} users`);
        // 初始化默认过滤规则
        const db = new Database(env.DB);
        const existingRules = await db.getFilterRules();
        if (existingRules.length === 0) {
          for (const rule of DEFAULT_FILTER_RULES) {
            await db.addFilterRule(rule.type, rule.value);
          }
        }
      })
    );

    return new Response(JSON.stringify({
      message: '同步已启动',
      user: me.name,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },

  // 更新 Cookie
  async handleUpdateCookie(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    const body = await request.json() as { cookies: string };

    if (!body.cookies) {
      return new Response(JSON.stringify({ error: '请提供 Cookie' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 验证 cookie 是否有效
    try {
      const client = new ZhihuClient(body.cookies);
      const me = await client.getMe();

      // 存储到 KV
      await env.KV.put('zhihu_cookies', body.cookies);

      return new Response(JSON.stringify({
        message: 'Cookie 已保存',
        user: me.name,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Cookie 无效，请检查后重试' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },

  // 获取过滤规则
  async handleGetRules(env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    const db = new Database(env.DB);
    const rules = await db.getFilterRules();

    return new Response(JSON.stringify({ rules }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },

  // 添加过滤规则
  async handleAddRule(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    const body = await request.json() as { type: string; value: string };

    if (!body.type || !body.value) {
      return new Response(JSON.stringify({ error: '请提供规则类型和值' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const db = new Database(env.DB);
    await db.addFilterRule(body.type, body.value);

    return new Response(JSON.stringify({ message: '规则已添加' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },

  // ===== 辅助方法 =====

  // 生成 Feed
  async generateFeed(env: Env, format: 'xml' | 'json'): Promise<string> {
    const db = new Database(env.DB);

    // 获取 feed 条目
    const feedItems = await db.getFeedItems(100);
    const contentIds = feedItems.map(f => f.content_id);

    if (contentIds.length === 0) {
      if (format === 'json') {
        return JSON.stringify({ version: 'https://jsonfeed.org/version/1.1', title: '我的知乎订阅', items: [] });
      }
      return '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>我的知乎订阅</title><description>暂无内容</description></channel></rss>';
    }

    // 获取内容详情
    const contents = await db.getContents(contentIds);

    // 获取来源信息
    const sources = await db.getContentSources(contentIds);

    // 生成 feed
    const generator = new RSSGenerator();
    const items = feedItems.map(f => ({
      ...f,
      is_read: f.is_filtered === 1,
      is_filtered: f.is_filtered === 1,
    }));

    if (format === 'json') {
      return generator.generateJSONFeed(items as any, contents, sources);
    }
    return generator.generateRSS(items as any, contents, sources);
  },

  // 更新 Feed 缓存
  async updateFeedCache(env: Env): Promise<void> {
    try {
      const [xmlFeed, jsonFeed] = await Promise.all([
        this.generateFeed(env, 'xml'),
        this.generateFeed(env, 'json'),
      ]);

      await Promise.all([
        env.KV.put('feed:xml', xmlFeed, { expirationTtl: 300 }),
        env.KV.put('feed:json', jsonFeed, { expirationTtl: 300 }),
      ]);
    } catch (error) {
      console.error('[Cache] Failed to update feed cache:', error);
    }
  },
};
