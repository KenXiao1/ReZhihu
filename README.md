# Zhihu RSS Worker

基于 Cloudflare Workers 的个性化知乎 RSS 订阅源，根据你关注用户的创作和点赞内容生成推荐。

**这是一个完全独立的项目，可以单独部署运行，不依赖任何其他文件。**

## 功能特点

- 🔄 自动抓取关注用户的文章、回答、想法
- 👍 追踪关注用户的点赞内容
- 🚫 智能过滤（关键词黑名单、最低字数、内容类型、作者黑名单）
- 📊 推荐分数算法（考虑互动数据、时间衰减、多人推荐）
- 📰 生成标准 RSS/JSON Feed
- 🌐 **内置 Web UI**，无需 RSS 阅读器即可浏览
- 🔐 支持在线配置 Cookie，无需命令行

## 项目结构

```
zhihu-rss-worker/
├── src/
│   ├── index.ts          # Worker 主入口 (HTTP + Cron)
│   ├── types.ts          # TypeScript 类型定义
│   ├── zhihu-client.ts   # 知乎 API 客户端
│   ├── database.ts       # D1 数据库操作
│   ├── filter.ts         # 内容过滤系统
│   ├── score.ts          # 推荐分数计算
│   ├── scheduler.ts      # 抓取任务调度
│   ├── rss-generator.ts  # RSS/JSON Feed 生成
│   └── ui.ts             # Web UI 页面
├── schema.sql            # D1 数据库表结构
├── wrangler.toml         # Cloudflare 配置
├── package.json
├── tsconfig.json
└── README.md
```

## 快速开始

### 1. 克隆并安装依赖

```bash
git clone <your-repo>
cd zhihu-rss-worker
npm install
```

### 2. 登录 Cloudflare

```bash
npx wrangler login
```

### 3. 创建 Cloudflare 资源

```bash
# 创建 D1 数据库
npx wrangler d1 create zhihu-rss-db

# 创建 KV 命名空间
npx wrangler kv:namespace create KV
```

### 4. 更新配置

编辑 `wrangler.toml`，填入上一步获取的 ID：

```toml
[[d1_databases]]
binding = "DB"
database_name = "zhihu-rss-db"
database_id = "你的数据库ID"

[[kv_namespaces]]
binding = "KV"
id = "你的KV命名空间ID"
```

### 5. 初始化数据库

```bash
npx wrangler d1 execute zhihu-rss-db --remote --file=./schema.sql
```

### 6. 部署

```bash
npm run deploy
```

### 7. 配置 Cookie

部署后，访问你的 Worker URL（如 `https://zhihu-rss-worker.your-name.workers.dev`）。

1. 点击「设置」标签
2. 从浏览器复制知乎的 Cookie（包含 `z_c0`, `d_c0` 等）
3. 粘贴并保存
4. 点击「同步关注列表」

## 使用方式

### Web UI 浏览

直接访问部署的 URL，即可在浏览器中：
- 浏览所有推荐内容
- 按类型/时间/推荐度筛选
- 搜索标题和作者
- 点击查看完整内容
- 管理过滤规则

### RSS 订阅

- RSS: `https://your-worker.workers.dev/feed.xml`
- JSON Feed: `https://your-worker.workers.dev/feed.json`

## API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/` | GET | Web UI 界面 |
| `/feed.xml` | GET | RSS 订阅源 |
| `/feed.json` | GET | JSON Feed |
| `/api/feed` | GET | Feed 数据 (JSON) |
| `/api/status` | GET | 系统状态 |
| `/api/sync` | POST | 同步关注列表 |
| `/api/cookie` | POST | 更新 Cookie |
| `/api/rules` | GET | 获取过滤规则 |
| `/api/rules` | POST | 添加过滤规则 |
| `/api/content/:id` | GET | 获取内容详情 |

## 过滤规则

支持以下类型的过滤规则：

| 类型 | 说明 | 示例 |
|------|------|------|
| `keyword_blacklist` | 关键词黑名单（逗号分隔） | `广告,推广,优惠券` |
| `min_word_count` | 最低字数 | `100` |
| `content_type` | 允许的内容类型 | `article,answer` |
| `author_blacklist` | 作者黑名单 | `某营销号,某大V` |

## 推荐算法

分数计算公式：

```
分数 = 基础分 × 来源加成 × 时间衰减

基础分 = 点赞数 × 1.0 + 评论数 × 0.5 + 字数 × 0.01
来源加成 = 创作内容 1.5 倍 / 点赞内容 1.0 倍 / 多人推荐额外加成
时间衰减 = 7 天减半
```

## 抓取策略

- Cloudflare Workers 有 30 秒执行时间限制
- 采用分批抓取：每 5 分钟处理 50 个用户
- 1406 个用户约需 29 批，完整轮询约 2.5 小时
- 自动记录进度，支持断点续传

## 本地开发

```bash
# 初始化本地数据库
npm run db:init

# 启动开发服务器
npm run dev
```

## 获取知乎 Cookie

1. 在浏览器中登录 [知乎](https://www.zhihu.com)
2. 打开开发者工具 (F12)
3. 切换到 Network 标签
4. 刷新页面，点击任意请求
5. 在 Headers 中找到 `Cookie` 字段，复制全部内容

关键的 Cookie 字段：
- `z_c0` - 登录凭证
- `d_c0` - 设备标识
- `_xsrf` - CSRF token

## 注意事项

- Cookie 可能过期，需要定期更新
- 请遵守知乎的使用条款
- 建议合理控制请求频率
- 本项目仅供个人学习使用

## 致谢

本项目灵感来源于 [zhihu_obsidian](https://github.com/dongguaguaguagua/zhihu_obsidian) 项目，感谢原作者的创意和贡献。

## 许可证

MIT
