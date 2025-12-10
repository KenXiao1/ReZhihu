-- 用户表：存储关注的用户
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,           -- 知乎用户 ID
    url_token TEXT,                -- 用户 URL token (如 excited-vczh)
    name TEXT,                     -- 用户昵称
    headline TEXT,                 -- 用户简介
    avatar_url TEXT,               -- 头像 URL
    priority INTEGER DEFAULT 0,    -- 优先级 (用于排序)
    last_fetched_at INTEGER,       -- 上次抓取时间戳
    created_at INTEGER DEFAULT (unixepoch())
);

-- 内容表：存储文章、回答、想法
CREATE TABLE IF NOT EXISTS contents (
    id TEXT PRIMARY KEY,           -- 内容 ID
    type TEXT NOT NULL,            -- 类型: article, answer, pin
    title TEXT,                    -- 标题
    excerpt TEXT,                  -- 摘要
    content TEXT,                  -- 完整内容 HTML
    url TEXT NOT NULL,             -- 知乎链接
    author_id TEXT,                -- 作者 ID
    author_name TEXT,              -- 作者昵称
    word_count INTEGER DEFAULT 0,  -- 字数
    voteup_count INTEGER DEFAULT 0,-- 点赞数
    comment_count INTEGER DEFAULT 0,-- 评论数
    created_time INTEGER,          -- 创建时间戳
    updated_time INTEGER,          -- 更新时间戳
    fetched_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- 用户动态表：记录用户的创作和点赞
CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,         -- 用户 ID
    content_id TEXT NOT NULL,      -- 内容 ID
    action_type TEXT NOT NULL,     -- 动作类型: create, like
    action_time INTEGER,           -- 动作时间戳
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (content_id) REFERENCES contents(id),
    UNIQUE(user_id, content_id, action_type)
);

-- Feed 条目表：最终的 RSS 条目
CREATE TABLE IF NOT EXISTS feed_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_id TEXT NOT NULL UNIQUE,
    score REAL DEFAULT 0,          -- 推荐分数
    is_read INTEGER DEFAULT 0,     -- 是否已读
    is_filtered INTEGER DEFAULT 0, -- 是否被过滤
    filter_reason TEXT,            -- 过滤原因
    added_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (content_id) REFERENCES contents(id)
);

-- 抓取状态表：记录分批抓取进度
CREATE TABLE IF NOT EXISTS fetch_state (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at INTEGER DEFAULT (unixepoch())
);

-- 过滤规则表
CREATE TABLE IF NOT EXISTS filter_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,            -- keyword_blacklist, min_word_count, content_type
    value TEXT NOT NULL,
    enabled INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch())
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_contents_type ON contents(type);
CREATE INDEX IF NOT EXISTS idx_contents_created ON contents(created_time DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_action ON activities(action_type);
CREATE INDEX IF NOT EXISTS idx_feed_items_score ON feed_items(score DESC);
CREATE INDEX IF NOT EXISTS idx_users_last_fetched ON users(last_fetched_at);
