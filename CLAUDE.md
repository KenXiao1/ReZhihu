# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Cloudflare Workers-based personalized Zhihu RSS feed generator. It fetches content from followed users' creations and likes, applies filtering/scoring, and outputs RSS/JSON feeds with a built-in Web UI.

## Development Commands

```bash
# Install dependencies
npm install

# Start local dev server (uses wrangler)
npm run dev

# Deploy to Cloudflare Workers
npm run deploy

# Initialize local D1 database
npm run db:init

# Initialize remote D1 database
npm run db:init:remote
```

## Architecture

**Runtime**: Cloudflare Workers with D1 (SQLite), KV storage, and R2 buckets.

**Entry Point**: `src/index.ts` - Handles HTTP routes and cron-triggered batch fetching.

**Core Data Flow**:
1. `ZhihuClient` fetches user activities (articles, answers, pins, likes) from Zhihu API
2. `FetchScheduler` orchestrates batch fetching (50 users per 5-min cron due to 30s Worker limit)
3. `ContentFilter` applies rules (keyword blacklist, min word count, content type, author blacklist)
4. `ScoreCalculator` computes recommendation scores (base score × source bonus × time decay)
5. `Database` persists to D1; `RSSGenerator` outputs feeds

**Key Modules**:
- `zhihu-client.ts`: Zhihu API wrapper with auth via browser cookies
- `scheduler.ts`: Batch scheduling with progress tracking across cron invocations
- `filter.ts`: Rule-based content filtering system
- `score.ts`: Recommendation algorithm (7-day half-life decay, multi-source bonus)
- `database.ts`: D1 operations with batch upserts
- `ui.ts`: Self-contained HTML UI for browsing without RSS reader

**Database Schema** (`schema.sql`): users, contents, activities, feed_items, filter_rules, fetch_state

## Key Constraints

- Workers have 30-second execution limit; content fetching uses batched cron jobs
- Zhihu API requires valid browser cookies (`z_c0`, `d_c0`, `_xsrf`)
- Cookies stored in KV for runtime updates without redeployment
- D1 batch operations limited to 50 statements per batch

## Configuration

- `wrangler.toml`: Bindings for DB, KV, R2, and cron schedule (`*/5 * * * *`)
- Cookie can be set via Web UI settings page or `wrangler secret put ZHIHU_COOKIES`
