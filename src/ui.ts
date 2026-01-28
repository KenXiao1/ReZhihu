// Web UI 页面生成 - 编辑式设计风格

export function generateIndexPage(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>知乎订阅</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --serif: 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif;
      --sans: 'IBM Plex Sans', -apple-system, sans-serif;

      --ink: #1a1a1a;
      --ink-light: #4a4a4a;
      --ink-muted: #888;
      --paper: #faf9f7;
      --paper-warm: #f5f3ef;
      --rule: #e0ddd8;
      --accent: #c41e3a;
      --accent-muted: rgba(196, 30, 58, 0.08);
    }

    [data-theme="dark"] {
      --ink: #e8e6e3;
      --ink-light: #b0ada8;
      --ink-muted: #706d68;
      --paper: #1c1b1a;
      --paper-warm: #242322;
      --rule: #3a3836;
      --accent: #e85d75;
      --accent-muted: rgba(232, 93, 117, 0.12);
    }

    [data-theme="sepia"] {
      --ink: #433422;
      --ink-light: #5c4a35;
      --ink-muted: #8a7a68;
      --paper: #f4ecd8;
      --paper-warm: #ebe3cf;
      --rule: #d4c9b0;
      --accent: #8b4513;
      --accent-muted: rgba(139, 69, 19, 0.1);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    html { font-size: 17px; }

    body {
      font-family: var(--sans);
      background: var(--paper);
      color: var(--ink);
      line-height: 1.7;
      min-height: 100vh;
      transition: background 0.4s, color 0.4s;
    }

    /* 顶部导航 */
    header {
      border-bottom: 1px solid var(--rule);
      background: var(--paper);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 1.2rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-family: var(--serif);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--ink);
      letter-spacing: -0.02em;
      text-decoration: none;
    }

    .logo span {
      color: var(--accent);
    }

    .header-actions {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }

    .theme-toggle {
      display: flex;
      gap: 0.25rem;
      padding: 0.25rem;
      background: var(--paper-warm);
      border-radius: 2px;
    }

    .theme-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      cursor: pointer;
      color: var(--ink-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .theme-btn svg {
      width: 16px;
      height: 16px;
    }

    .theme-btn:hover { color: var(--ink); }

    .theme-btn.active {
      background: var(--paper);
      color: var(--ink);
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }

    .nav-link {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--ink-light);
      text-decoration: none;
      padding: 0.4rem 0;
      border-bottom: 1.5px solid transparent;
      transition: all 0.2s;
    }

    .nav-link:hover {
      color: var(--ink);
      border-bottom-color: var(--ink);
    }

    /* 主导航标签 */
    .nav-tabs {
      border-bottom: 1px solid var(--rule);
      background: var(--paper-warm);
    }

    .nav-tabs-inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      gap: 0;
    }

    .tab {
      padding: 1rem 1.5rem;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--ink-muted);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: all 0.2s;
      user-select: none;
    }

    .tab:hover { color: var(--ink-light); }

    .tab.active {
      color: var(--ink);
      border-bottom-color: var(--accent);
    }

    /* 主内容区 */
    main {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2.5rem 2rem 4rem;
    }

    .tab-content {
      display: none;
      animation: fadeIn 0.3s ease;
    }

    .tab-content.active { display: block; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* 筛选栏 */
    .filter-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--rule);
      flex-wrap: wrap;
      align-items: center;
    }

    .search-box {
      flex: 1;
      min-width: 240px;
      position: relative;
    }

    .search-box input {
      width: 100%;
      padding: 0.6rem 1rem;
      padding-left: 2.2rem;
      font-family: var(--sans);
      font-size: 0.9rem;
      border: 1px solid var(--rule);
      background: var(--paper);
      color: var(--ink);
      transition: all 0.2s;
    }

    .search-box input:focus {
      outline: none;
      border-color: var(--ink-muted);
    }

    .search-box::before {
      content: '';
      position: absolute;
      left: 0.8rem;
      top: 50%;
      transform: translateY(-50%);
      width: 14px;
      height: 14px;
      border: 1.5px solid var(--ink-muted);
      border-radius: 50%;
    }

    .search-box::after {
      content: '';
      position: absolute;
      left: 1.55rem;
      top: 60%;
      width: 5px;
      height: 1.5px;
      background: var(--ink-muted);
      transform: rotate(45deg);
    }

    .filter-select {
      padding: 0.6rem 2rem 0.6rem 0.8rem;
      font-family: var(--sans);
      font-size: 0.85rem;
      border: 1px solid var(--rule);
      background: var(--paper);
      color: var(--ink);
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.8rem center;
    }

    .filter-select:focus {
      outline: none;
      border-color: var(--ink-muted);
    }

    /* Feed 列表 */
    .feed-list {
      display: flex;
      flex-direction: column;
    }

    .feed-item {
      padding: 1.8rem 0;
      border-bottom: 1px solid var(--rule);
      cursor: pointer;
      transition: background 0.2s;
    }

    .feed-item:first-child { padding-top: 0; }

    .feed-item:hover {
      background: var(--accent-muted);
      margin: 0 -1rem;
      padding-left: 1rem;
      padding-right: 1rem;
    }

    .feed-item-header {
      display: flex;
      align-items: baseline;
      gap: 1rem;
      margin-bottom: 0.6rem;
    }

    .feed-type {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent);
      flex-shrink: 0;
    }

    .feed-title {
      font-family: var(--serif);
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--ink);
      text-decoration: none;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .feed-title:hover { text-decoration: underline; }

    .feed-excerpt {
      font-size: 0.95rem;
      color: var(--ink-light);
      line-height: 1.7;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 0.8rem;
    }

    .feed-meta {
      display: flex;
      gap: 1.5rem;
      font-size: 0.8rem;
      color: var(--ink-muted);
    }

    .feed-meta-item {
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .meta-label {
      font-weight: 500;
    }

    /* 空状态 */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--ink-muted);
    }

    .empty-state h3 {
      font-family: var(--serif);
      font-size: 1.3rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: var(--ink-light);
    }

    /* 加载状态 */
    .loading {
      text-align: center;
      padding: 3rem;
      color: var(--ink-muted);
    }

    .loading-bar {
      width: 120px;
      height: 2px;
      background: var(--rule);
      margin: 0 auto 1rem;
      position: relative;
      overflow: hidden;
    }

    .loading-bar::after {
      content: '';
      position: absolute;
      left: -40%;
      width: 40%;
      height: 100%;
      background: var(--accent);
      animation: loading 1s ease-in-out infinite;
    }

    @keyframes loading {
      0% { left: -40%; }
      100% { left: 100%; }
    }

    /* 模态框 */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: none;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      z-index: 1000;
    }

    .modal-overlay.active { display: flex; }

    .modal {
      background: var(--paper);
      max-width: 720px;
      width: 100%;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px rgba(0,0,0,0.25);
    }

    .modal-header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid var(--rule);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }

    .modal-title {
      font-family: var(--serif);
      font-size: 1.4rem;
      font-weight: 600;
      line-height: 1.4;
    }

    .modal-close {
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--ink-muted);
      border: none;
      background: none;
      padding: 0;
      line-height: 1;
    }

    .modal-close:hover { color: var(--ink); }

    .modal-body {
      padding: 2rem;
      overflow-y: auto;
      font-size: 1rem;
      line-height: 1.85;
    }

    .modal-meta {
      display: flex;
      gap: 1.5rem;
      font-size: 0.85rem;
      color: var(--ink-muted);
      padding-bottom: 1.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--rule);
      flex-wrap: wrap;
    }

    .modal-content img {
      max-width: 100%;
      height: auto;
      margin: 1rem 0;
    }

    .modal-content pre {
      background: var(--paper-warm);
      padding: 1rem;
      overflow-x: auto;
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 0.85rem;
      margin: 1rem 0;
    }

    .modal-content blockquote {
      border-left: 3px solid var(--accent);
      padding-left: 1rem;
      margin: 1rem 0;
      color: var(--ink-light);
      font-style: italic;
    }

    /* 设置面板 */
    .settings-panel {
      background: var(--paper-warm);
      padding: 2rem;
      margin-bottom: 1.5rem;
    }

    .settings-section {
      margin-bottom: 2rem;
    }

    .settings-section:last-child { margin-bottom: 0; }

    .settings-section h3 {
      font-family: var(--serif);
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--rule);
    }

    .settings-hint {
      font-size: 0.85rem;
      color: var(--ink-muted);
      margin-bottom: 1rem;
      line-height: 1.6;
    }

    .form-group { margin-bottom: 1rem; }

    .form-group label {
      display: block;
      font-size: 0.85rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: var(--ink-light);
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 0.7rem 1rem;
      font-family: var(--sans);
      font-size: 0.9rem;
      border: 1px solid var(--rule);
      background: var(--paper);
      color: var(--ink);
    }

    .form-group textarea {
      min-height: 100px;
      resize: vertical;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--ink-muted);
    }

    /* 按钮 */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.2rem;
      font-family: var(--sans);
      font-size: 0.85rem;
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--ink);
      color: var(--paper);
    }

    .btn-primary:hover {
      background: var(--ink-light);
    }

    .btn-secondary {
      background: transparent;
      color: var(--ink);
      border: 1px solid var(--rule);
    }

    .btn-secondary:hover {
      border-color: var(--ink-muted);
    }

    /* 规则列表 */
    .rules-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .rule-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.6rem 1rem;
      background: var(--paper);
      border: 1px solid var(--rule);
    }

    .rule-type {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent);
      margin-right: 0.8rem;
    }

    .rule-value {
      flex: 1;
      font-size: 0.9rem;
    }

    .add-rule-form {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .add-rule-form select,
    .add-rule-form input {
      padding: 0.6rem 0.8rem;
      font-family: var(--sans);
      font-size: 0.85rem;
      border: 1px solid var(--rule);
      background: var(--paper);
      color: var(--ink);
    }

    .add-rule-form input { flex: 1; min-width: 200px; }

    /* 状态面板 */
    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .status-card {
      background: var(--paper-warm);
      padding: 1.5rem;
      text-align: center;
    }

    .status-card .label {
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--ink-muted);
      margin-bottom: 0.5rem;
    }

    .status-card .value {
      font-family: var(--serif);
      font-size: 2rem;
      font-weight: 700;
      color: var(--ink);
    }

    .status-detail {
      background: var(--paper-warm);
      padding: 1.5rem;
    }

    .status-detail h3 {
      font-family: var(--serif);
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .status-detail pre {
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 0.8rem;
      line-height: 1.6;
      color: var(--ink-light);
      white-space: pre-wrap;
      word-break: break-all;
    }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: var(--ink);
      color: var(--paper);
      padding: 0.8rem 1.5rem;
      font-size: 0.9rem;
      opacity: 0;
      transition: all 0.3s;
      z-index: 2000;
    }

    .toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    /* 响应式 */
    @media (max-width: 640px) {
      html { font-size: 15px; }

      .header-inner { padding: 1rem; }

      .nav-tabs-inner { padding: 0 1rem; }

      main { padding: 1.5rem 1rem 3rem; }

      .feed-item:hover {
        margin: 0 -0.5rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
      }

      .modal { margin: 1rem; }

      .modal-header,
      .modal-body { padding: 1.2rem; }
    }

    /* 滚动条 */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--rule); }
    ::-webkit-scrollbar-thumb:hover { background: var(--ink-muted); }
</style>
</head>
<body>
  <header>
    <div class="header-inner">
      <a href="/" class="logo">知乎<span>订阅</span></a>
      <div class="header-actions">
        <div class="theme-toggle">
          <button class="theme-btn" data-theme="light" title="明亮">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          </button>
          <button class="theme-btn" data-theme="dark" title="暗色">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
          </button>
        </div>
        <a href="/feed.xml" class="nav-link" target="_blank">RSS</a>
      </div>
    </div>
  </header>

  <nav class="nav-tabs">
    <div class="nav-tabs-inner">
      <div class="tab active" data-tab="feed">订阅</div>
      <div class="tab" data-tab="settings">设置</div>
      <div class="tab" data-tab="status">状态</div>
    </div>
  </nav>

  <main>
    <!-- Feed 内容 -->
    <div id="feed-tab" class="tab-content active">
      <div class="filter-bar">
        <div class="search-box">
          <input type="text" id="search-input" placeholder="搜索标题或作者">
        </div>
        <select id="type-filter" class="filter-select">
          <option value="">全部类型</option>
          <option value="article">文章</option>
          <option value="answer">回答</option>
          <option value="pin">想法</option>
        </select>
        <select id="sort-filter" class="filter-select">
          <option value="score">按推荐</option>
          <option value="time">按时间</option>
          <option value="voteup">按赞数</option>
        </select>
      </div>
      <div id="feed-list" class="feed-list">
        <div class="loading">
          <div class="loading-bar"></div>
          <span>正在加载</span>
        </div>
      </div>
    </div>

    <!-- 设置面板 -->
    <div id="settings-tab" class="tab-content">
      <div class="settings-panel">
        <div class="settings-section">
          <h3>Cookie 配置</h3>
          <p class="settings-hint">从浏览器开发者工具复制知乎的 Cookie，包含 z_c0、d_c0 等字段。</p>
          <div class="form-group">
            <textarea id="cookie-input" placeholder="粘贴 Cookie..."></textarea>
          </div>
          <button class="btn btn-primary" onclick="saveCookie()">保存</button>
        </div>

        <div class="settings-section">
          <h3>同步关注列表</h3>
          <p class="settings-hint">首次使用或关注列表变化后，点击同步更新用户列表。</p>
          <button class="btn btn-primary" onclick="syncFollowees()">同步</button>
        </div>

        <div class="settings-section">
          <h3>过滤规则</h3>
          <div id="rules-list" class="rules-list"></div>
          <div class="add-rule-form">
            <select id="new-rule-type">
              <option value="keyword_blacklist">关键词</option>
              <option value="min_word_count">最低字数</option>
              <option value="author_blacklist">作者</option>
            </select>
            <input type="text" id="new-rule-value" placeholder="规则内容">
            <button class="btn btn-primary" onclick="addRule()">添加</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 状态面板 -->
    <div id="status-tab" class="tab-content">
      <div class="status-grid">
        <div class="status-card">
          <div class="label">关注用户</div>
          <div class="value" id="stat-users">-</div>
        </div>
        <div class="status-card">
          <div class="label">内容总数</div>
          <div class="value" id="stat-contents">-</div>
        </div>
        <div class="status-card">
          <div class="label">Feed 条目</div>
          <div class="value" id="stat-feed">-</div>
        </div>
        <div class="status-card">
          <div class="label">抓取进度</div>
          <div class="value" id="stat-batch">-</div>
        </div>
      </div>
      <div class="status-detail">
        <h3>详细信息</h3>
        <pre id="status-detail">加载中...</pre>
      </div>
    </div>
  </main>

  <!-- 模态框 -->
  <div class="modal-overlay" id="modal-overlay" onclick="closeModal(event)">
    <div class="modal" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h2 class="modal-title" id="modal-title">标题</h2>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="modal-meta" id="modal-meta"></div>
        <div class="modal-content" id="modal-content"></div>
      </div>
    </div>
  </div>

  <!-- Toast -->
  <div class="toast" id="toast"></div>

  <script>
    let feedData = [];
    let filteredData = [];

    document.addEventListener('DOMContentLoaded', () => {
      initTheme();
      initTabs();
      initFilters();
      loadFeed();
      loadStatus();
      loadRules();
    });

    // 主题
    function initTheme() {
      const saved = localStorage.getItem('theme');

      if (saved) {
        // 用户有明确选择
        applyTheme(saved);
        updateThemeButtons(saved);
      } else {
        // 跟随系统
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
      }

      // 按钮点击事件
      document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const theme = btn.dataset.theme;
          localStorage.setItem('theme', theme);
          applyTheme(theme);
          updateThemeButtons(theme);
        });
      });

      // 监听系统主题变化（仅在用户未选择时生效）
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
    }

    function updateThemeButtons(theme) {
      document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
      });
    }

    // 标签页
    function initTabs() {
      document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
          tab.classList.add('active');
          const content = document.getElementById(tab.dataset.tab + '-tab');
          content.classList.add('active');
        });
      });
    }

    // 筛选
    function initFilters() {
      document.getElementById('search-input').addEventListener('input', applyFilters);
      document.getElementById('type-filter').addEventListener('change', applyFilters);
      document.getElementById('sort-filter').addEventListener('change', applyFilters);
    }

    function applyFilters() {
      const search = document.getElementById('search-input').value.toLowerCase();
      const type = document.getElementById('type-filter').value;
      const sort = document.getElementById('sort-filter').value;

      filteredData = feedData.filter(item => {
        if (type && item.type !== type) return false;
        if (search && !item.title.toLowerCase().includes(search) && !item.author_name.toLowerCase().includes(search)) return false;
        return true;
      });

      filteredData.sort((a, b) => {
        if (sort === 'time') return b.created_time - a.created_time;
        if (sort === 'voteup') return b.voteup_count - a.voteup_count;
        return b.score - a.score;
      });

      renderFeed();
    }

    // 加载 Feed
    async function loadFeed() {
      try {
        const res = await fetch('/api/feed');
        const data = await res.json();
        feedData = data.items || [];
        filteredData = [...feedData];
        renderFeed();
      } catch (err) {
        document.getElementById('feed-list').innerHTML = '<div class="empty-state"><h3>加载失败</h3><p>请刷新页面重试</p></div>';
      }
    }

    function renderFeed() {
      const container = document.getElementById('feed-list');
      if (filteredData.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>暂无内容</h3><p>请先同步关注列表</p></div>';
        return;
      }

      container.innerHTML = filteredData.map(item => \`
        <div class="feed-item" onclick="openItem('\${item.id}')">
          <div class="feed-item-header">
            <span class="feed-type">\${getTypeName(item.type)}</span>
            <a class="feed-title" href="\${item.url}" target="_blank" onclick="event.stopPropagation()">\${escapeHtml(item.title)}</a>
          </div>
          <p class="feed-excerpt">\${escapeHtml(item.excerpt)}</p>
          <div class="feed-meta">
            <span class="feed-meta-item"><span class="meta-label">作者</span> \${escapeHtml(item.author_name)}</span>
            <span class="feed-meta-item"><span class="meta-label">赞</span> \${item.voteup_count}</span>
            <span class="feed-meta-item"><span class="meta-label">字数</span> \${item.word_count}</span>
            <span class="feed-meta-item">\${formatTime(item.created_time)}</span>
          </div>
        </div>
      \`).join('');
    }

    function getTypeName(type) {
      return { article: '文章', answer: '回答', pin: '想法' }[type] || type;
    }

    function formatTime(ts) {
      const d = new Date(ts * 1000);
      const diff = Date.now() - d.getTime();
      if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前';
      if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小时前';
      if (diff < 604800000) return Math.floor(diff / 86400000) + ' 天前';
      return d.toLocaleDateString('zh-CN');
    }

    function escapeHtml(str) {
      if (!str) return '';
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // 模态框
    function openItem(id) {
      const item = feedData.find(i => i.id === id);
      if (!item) return;
      document.getElementById('modal-title').textContent = item.title;
      document.getElementById('modal-meta').innerHTML = \`
        <span>作者: \${escapeHtml(item.author_name)}</span>
        <span>赞: \${item.voteup_count}</span>
        <span>字数: \${item.word_count}</span>
        <a href="\${item.url}" target="_blank" style="color:var(--accent);margin-left:auto">原文</a>
      \`;
      document.getElementById('modal-content').innerHTML = item.content || item.excerpt;
      document.getElementById('modal-overlay').classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal(e) {
      if (e && e.target !== e.currentTarget) return;
      document.getElementById('modal-overlay').classList.remove('active');
      document.body.style.overflow = '';
    }

    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    // 状态
    async function loadStatus() {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        document.getElementById('stat-users').textContent = data.user_count || 0;
        document.getElementById('stat-contents').textContent = data.content_count || 0;
        document.getElementById('stat-feed').textContent = data.feed_count || 0;
        document.getElementById('stat-batch').textContent =
          (data.fetch_state?.current_batch || 0) + '/' + (data.fetch_state?.total_batches || 0);
        document.getElementById('status-detail').textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        console.error('Failed to load status:', err);
      }
    }

    // 规则
    async function loadRules() {
      try {
        const res = await fetch('/api/rules');
        const data = await res.json();
        renderRules(data.rules || []);
      } catch (err) {
        console.error('Failed to load rules:', err);
      }
    }

    function renderRules(rules) {
      const container = document.getElementById('rules-list');
      if (rules.length === 0) {
        container.innerHTML = '<div style="color:var(--ink-muted);padding:0.5rem 0">暂无规则</div>';
        return;
      }
      const typeNames = { keyword_blacklist: '关键词', min_word_count: '字数', author_blacklist: '作者', content_type: '类型' };
      container.innerHTML = rules.map(r => \`
        <div class="rule-item">
          <span class="rule-type">\${typeNames[r.type] || r.type}</span>
          <span class="rule-value">\${escapeHtml(r.value)}</span>
        </div>
      \`).join('');
    }

    async function addRule() {
      const type = document.getElementById('new-rule-type').value;
      const value = document.getElementById('new-rule-value').value.trim();
      if (!value) { showToast('请输入规则内容'); return; }
      try {
        const res = await fetch('/api/rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, value })
        });
        if (res.ok) {
          showToast('规则已添加');
          document.getElementById('new-rule-value').value = '';
          loadRules();
        } else { showToast('添加失败'); }
      } catch (err) { showToast('添加失败'); }
    }

    async function saveCookie() {
      const cookies = document.getElementById('cookie-input').value.trim();
      if (!cookies) { showToast('请输入 Cookie'); return; }
      try {
        const res = await fetch('/api/cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cookies })
        });
        if (res.ok) { showToast('Cookie 已保存'); }
        else { showToast('保存失败'); }
      } catch (err) { showToast('保存失败'); }
    }

    async function syncFollowees() {
      showToast('开始同步...');
      try {
        const res = await fetch('/api/sync', { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
          showToast('同步已启动: ' + (data.user || ''));
          setTimeout(loadStatus, 3000);
        } else { showToast('同步失败: ' + (data.error || '')); }
      } catch (err) { showToast('同步失败'); }
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 3000);
    }
  </script>
</body>
</html>`;
}
