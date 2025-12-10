// RSS Feed 生成器

import type { Content, FeedItem, RSSFeed, RSSItem } from './types';

export class RSSGenerator {
  private feedTitle: string;
  private feedDescription: string;
  private feedLink: string;

  constructor(
    title = '我的知乎订阅',
    description = '基于关注用户的创作和点赞内容',
    link = 'https://www.zhihu.com'
  ) {
    this.feedTitle = title;
    this.feedDescription = description;
    this.feedLink = link;
  }

  // 生成 RSS XML
  generateRSS(items: FeedItem[], contents: Map<string, Content>, activities: Map<string, { user_name: string; action_type: string }[]>): string {
    const rssItems = items
      .filter(item => !item.is_filtered && contents.has(item.content_id))
      .map(item => {
        const content = contents.get(item.content_id)!;
        const sources = activities.get(item.content_id) || [];
        return this.createRSSItem(content, sources, item.score);
      });

    const feed: RSSFeed = {
      title: this.feedTitle,
      description: this.feedDescription,
      link: this.feedLink,
      lastBuildDate: new Date().toUTCString(),
      items: rssItems,
    };

    return this.serializeRSS(feed);
  }

  // 生成 JSON Feed
  generateJSONFeed(items: FeedItem[], contents: Map<string, Content>, activities: Map<string, { user_name: string; action_type: string }[]>): string {
    const feedItems = items
      .filter(item => !item.is_filtered && contents.has(item.content_id))
      .map(item => {
        const content = contents.get(item.content_id)!;
        const sources = activities.get(item.content_id) || [];
        return {
          id: content.id,
          url: content.url,
          title: content.title,
          content_html: content.content,
          summary: content.excerpt,
          date_published: new Date(content.created_time * 1000).toISOString(),
          date_modified: new Date(content.updated_time * 1000).toISOString(),
          authors: [{ name: content.author_name }],
          _zhihu: {
            type: content.type,
            voteup_count: content.voteup_count,
            word_count: content.word_count,
            score: item.score,
            sources: sources.map(s => `${s.user_name} ${s.action_type === 'like' ? '赞了' : '发布了'}`),
          },
        };
      });

    return JSON.stringify({
      version: 'https://jsonfeed.org/version/1.1',
      title: this.feedTitle,
      description: this.feedDescription,
      home_page_url: this.feedLink,
      feed_url: `${this.feedLink}/feed.json`,
      items: feedItems,
    }, null, 2);
  }

  // 创建单个 RSS 条目
  private createRSSItem(
    content: Content,
    sources: { user_name: string; action_type: string }[],
    score: number
  ): RSSItem {
    const sourceText = sources.length > 0
      ? sources.map(s => `${s.user_name} ${s.action_type === 'like' ? '赞了' : '发布了'}`).join(', ')
      : content.author_name;

    return {
      title: content.title,
      link: content.url,
      description: this.formatDescription(content, sourceText),
      author: content.author_name,
      pubDate: new Date(content.created_time * 1000).toUTCString(),
      guid: content.url,
      source: sourceText,
      voteup_count: content.voteup_count,
      word_count: content.word_count,
    };
  }

  // 格式化描述
  private formatDescription(content: Content, sourceText: string): string {
    const meta = `
      <p style="color: #999; font-size: 12px;">
        来源: ${sourceText} |
        ${content.type === 'article' ? '文章' : content.type === 'answer' ? '回答' : '想法'} |
        ${content.voteup_count} 赞 |
        ${content.word_count} 字
      </p>
    `;
    return meta + content.excerpt;
  }

  // 序列化为 RSS XML
  private serializeRSS(feed: RSSFeed): string {
    const escapeXml = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const items = feed.items.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${escapeXml(item.link)}</link>
      <description><![CDATA[${item.description}]]></description>
      <author>${escapeXml(item.author)}</author>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="true">${escapeXml(item.guid)}</guid>
      <source>${escapeXml(item.source || '')}</source>
      <zhihu:voteup_count>${item.voteup_count || 0}</zhihu:voteup_count>
      <zhihu:word_count>${item.word_count || 0}</zhihu:word_count>
    </item>`).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:zhihu="https://www.zhihu.com/rss/extensions">
  <channel>
    <title>${escapeXml(feed.title)}</title>
    <link>${escapeXml(feed.link)}</link>
    <description>${escapeXml(feed.description)}</description>
    <lastBuildDate>${feed.lastBuildDate}</lastBuildDate>
    <generator>Zhihu RSS Worker</generator>
${items}
  </channel>
</rss>`;
  }
}
