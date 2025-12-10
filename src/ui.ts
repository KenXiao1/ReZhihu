// Web UI 页面生成

export function generateIndexPage(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的知乎订阅</title>
  <style>
    :root {
      --primary: #0066ff;
      --primary-dark: #0052cc;
      --bg: #f5f6f7;
      --card-bg: #ffffff;
      --text: #1a1a1a;
      --text-secondary: #666;
      --border: #e5e5e5;
      --success: #52c41a;
      --warning: #faad14;
      --error: #ff4d4f;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #141414;
        --card-bg: #1f1f1f;
        --text: #ffffff;
        --text-secondary: #999;
        --border: #333;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }

    /* 导航栏 */
    .navbar {
      background: var(--card-bg);
      border-bottom: 1px solid var(--border);
      padding: 12px 20px;
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .navbar h1 {
      font-size: 20px;
      color: var(--primary);
    }

    .navbar-actions {
      display: flex;
      gap: 10px;
    }

    /* 标签页 */
    .tabs {
      display: flex;
      background: var(--card-bg);
      border-bottom: 1px solid var(--border);
      overflow-x: auto;
    }

    .tab {
      padding: 12px 24px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      white-space: nowrap;
      color: var(--text-secondary);
      transition: all 0.2s;
    }

    .tab:hover {
      color: var(--text);
      background: var(--bg);
    }

    .tab.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
    }

    /* 主内容区 */
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
    }

    /* 按钮 */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-dark);
    }

    .btn-secondary {
      background: var(--bg);
      color: var(--text);
      border: 1px solid var(--border);
    }

    .btn-secondary:hover {
      background: var(--border);
    }

    /* 状态卡片 */
    .status-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .status-item {
      background: var(--card-bg);
      padding: 15px;
      border-radius: 8px;
      border: 1px solid var(--border);
    }

    .status-item .label {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .status-item .value {
      font-size: 24px;
      font-weight: 600;
      color: var(--primary);
    }

    /* Feed 列表 */
    .feed-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .feed-item {
      background: var(--card-bg);
      border-radius: 10px;
      border: 1px solid var(--border);
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .feed-item:hover {
      border-color: var(--primary);
      box-shadow: 0 2px 12px rgba(0, 102, 255, 0.1);
    }

    .feed-item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }

    .feed-item-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      text-decoration: none;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .feed-item-title:hover {
      color: var(--primary);
    }

    .feed-item-type {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 4px;
      background: var(--bg);
      color: var(--text-secondary);
      flex-shrink: 0;
      margin-left: 10px;
    }

    .feed-item-type.article { background: #e6f7ff; color: #1890ff; }
    .feed-item-type.answer { background: #f6ffed; color: #52c41a; }
    .feed-item-type.pin { background: #fff7e6; color: #fa8c16; }

    .feed-item-excerpt {
      font-size: 14px;
      color: var(--text-secondary);
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 12px;
    }

    .feed-item-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .feed-item-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .feed-item-source {
      background: #f0f0ff;
      color: #666;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
    }

    /* 内容详情模态框 */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: none;
      justify-content: center;
      align-items: flex-start;
      padding: 40px 20px;
      overflow-y: auto;
      z-index: 1000;
    }

    .modal-overlay.active {
      display: flex;
    }

    .modal {
      background: var(--card-bg);
      border-radius: 12px;
      max-width: 800px;
      width: 100%;
      max-height: calc(100vh - 80px);
      overflow-y: auto;
    }

    .modal-header {
      padding: 20px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      position: sticky;
      top: 0;
      background: var(--card-bg);
    }

    .modal-title {
      font-size: 20px;
      font-weight: 600;
    }

    .modal-close {
      font-size: 24px;
      cursor: pointer;
      color: var(--text-secondary);
      border: none;
      background: none;
      padding: 0 10px;
    }

    .modal-close:hover {
      color: var(--text);
    }

    .modal-body {
      padding: 20px;
    }

    .modal-content {
      line-height: 1.8;
      font-size: 16px;
    }

    .modal-content img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 10px 0;
    }

    .modal-content pre {
      background: var(--bg);
      padding: 15px;
      border-radius: 8px;
      overflow-x: auto;
    }

    .modal-content blockquote {
      border-left: 4px solid var(--primary);
      padding-left: 15px;
      margin: 15px 0;
      color: var(--text-secondary);
    }

    /* 设置面板 */
    .settings-panel {
      background: var(--card-bg);
      border-radius: 10px;
      border: 1px solid var(--border);
      padding: 20px;
      margin-bottom: 20px;
    }

    .settings-section {
      margin-bottom: 25px;
    }

    .settings-section h3 {
      font-size: 16px;
      margin-bottom: 15px;
      color: var(--text);
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      font-size: 14px;
      margin-bottom: 5px;
      color: var(--text-secondary);
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--bg);
      color: var(--text);
      font-size: 14px;
    }

    .form-group textarea {
      min-height: 100px;
      resize: vertical;
    }

    /* 过滤规则列表 */
    .rules-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .rule-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      background: var(--bg);
      border-radius: 6px;
    }

    .rule-item .rule-type {
      font-size: 12px;
      padding: 2px 8px;
      background: var(--primary);
      color: white;
      border-radius: 4px;
      margin-right: 10px;
    }

    .rule-item .rule-value {
      flex: 1;
      font-size: 14px;
    }

    .rule-item .delete-rule {
      color: var(--error);
      cursor: pointer;
      padding: 5px;
    }

    /* 加载状态 */
    .loading {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
    }

    .spinner {
      width: 30px;
      height: 30px;
      border: 3px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* 空状态 */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-secondary);
    }

    .empty-state .icon {
      font-size: 48px;
      margin-bottom: 15px;
    }

    /* 筛选栏 */
    .filter-bar {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .filter-bar select {
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--card-bg);
      color: var(--text);
      font-size: 14px;
    }

    .filter-bar input[type="search"] {
      flex: 1;
      min-width: 200px;
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--card-bg);
      color: var(--text);
      font-size: 14px;
    }

    /* Toast 通知 */
    .toast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 2000;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .toast.show {
      opacity: 1;
    }

    /* 响应式 */
    @media (max-width: 600px) {
      .navbar {
        flex-direction: column;
        gap: 10px;
      }

      .status-bar {
        grid-template-columns: repeat(2, 1fr);
      }

      .feed-item-meta {
        gap: 10px;
      }

      .modal {
        border-radius: 0;
        max-height: 100vh;
      }

      .modal-overlay {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <nav class="navbar">
    <h1>📰 我的知乎订阅</h1>
    <div class="navbar-actions">
      <button class="btn btn-secondary" onclick="refreshFeed()">🔄 刷新</button>
      <a href="/feed.xml" class="btn btn-secondary" target="_blank">📡 RSS</a>
    </div>
  </nav>

  <div class="tabs">
    <div class="tab active" data-tab="feed">订阅内容</div>
    <div class="tab" data-tab="settings">设置</div>
    <div class="tab" data-tab="status">状态</div>
  </div>

  <div class="container">
    <!-- Feed 列表 -->
    <div id="feed-tab" class="tab-content">
      <div class="filter-bar">
        <input type="search" id="search-input" placeholder="搜索标题或作者...">
        <select id="type-filter">
          <option value="">全部类型</option>
          <option value="article">文章</option>
          <option value="answer">回答</option>
          <option value="pin">想法</option>
        </select>
        <select id="sort-filter">
          <option value="score">按推荐度</option>
          <option value="time">按时间</option>
          <option value="voteup">按点赞</option>
        </select>
      </div>
      <div id="feed-list" class="feed-list">
        <div class="loading">
          <div class="spinner"></div>
          加载中...
        </div>
      </div>
    </div>

    <!-- 设置面板 -->
    <div id="settings-tab" class="tab-content" style="display: none;">
      <div class="settings-panel">
        <div class="settings-section">
          <h3>🔐 Cookie 设置</h3>
          <div class="form-group">
            <label>知乎 Cookie (从浏览器复制)</label>
            <textarea id="cookie-input" placeholder="粘贴你的知乎 Cookie..."></textarea>
          </div>
          <button class="btn btn-primary" onclick="saveCookie()">保存 Cookie</button>
        </div>

        <div class="settings-section">
          <h3>🔄 同步关注列表</h3>
          <p style="margin-bottom: 10px; color: var(--text-secondary); font-size: 14px;">
            首次使用或关注列表有变化时，点击同步按钮更新关注列表。
          </p>
          <button class="btn btn-primary" onclick="syncFollowees()">同步关注列表</button>
        </div>

        <div class="settings-section">
          <h3>🚫 过滤规则</h3>
          <div id="rules-list" class="rules-list"></div>
          <div style="margin-top: 15px; display: flex; gap: 10px;">
            <select id="new-rule-type">
              <option value="keyword_blacklist">关键词黑名单</option>
              <option value="min_word_count">最低字数</option>
              <option value="author_blacklist">作者黑名单</option>
            </select>
            <input type="text" id="new-rule-value" placeholder="规则值" style="flex: 1; padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px;">
            <button class="btn btn-primary" onclick="addRule()">添加</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 状态面板 -->
    <div id="status-tab" class="tab-content" style="display: none;">
      <div class="status-bar">
        <div class="status-item">
          <div class="label">关注用户</div>
          <div class="value" id="stat-users">-</div>
        </div>
        <div class="status-item">
          <div class="label">内容总数</div>
          <div class="value" id="stat-contents">-</div>
        </div>
        <div class="status-item">
          <div class="label">Feed 条目</div>
          <div class="value" id="stat-feed">-</div>
        </div>
        <div class="status-item">
          <div class="label">抓取进度</div>
          <div class="value" id="stat-batch">-</div>
        </div>
      </div>
      <div class="settings-panel">
        <h3>📊 系统信息</h3>
        <pre id="status-detail" style="margin-top: 15px; padding: 15px; background: var(--bg); border-radius: 8px; overflow-x: auto;">加载中...</pre>
      </div>
    </div>
  </div>

  <!-- 内容详情模态框 -->
  <div class="modal-overlay" id="modal-overlay" onclick="closeModal(event)">
    <div class="modal" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h2 class="modal-title" id="modal-title">标题</h2>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="feed-item-meta" id="modal-meta" style="margin-bottom: 20px;"></div>
        <div class="modal-content" id="modal-content"></div>
      </div>
    </div>
  </div>

  <!-- Toast -->
  <div class="toast" id="toast"></div>

  <script>
    // 状态
    let feedData = [];
    let filteredData = [];
    let currentTab = 'feed';

    // 初始化
    document.addEventListener('DOMContentLoaded', () => {
      loadFeed();
      loadStatus();
      loadRules();
      initTabs();
      initFilters();
    });

    // 标签页切换
    function initTabs() {
      document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          currentTab = tab.dataset.tab;
          document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
          document.getElementById(currentTab + '-tab').style.display = 'block';
        });
      });
    }

    // 筛选器
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

      // 排序
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
        document.getElementById('feed-list').innerHTML = '<div class="empty-state"><div class="icon">😕</div>加载失败，请刷新重试</div>';
      }
    }

    function renderFeed() {
      const container = document.getElementById('feed-list');

      if (filteredData.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="icon">📭</div>暂无内容<br>请先同步关注列表</div>';
        return;
      }

      container.innerHTML = filteredData.map(item => \`
        <div class="feed-item" onclick="openItem('\${item.id}')">
          <div class="feed-item-header">
            <a class="feed-item-title" href="\${item.url}" target="_blank" onclick="event.stopPropagation()">\${escapeHtml(item.title)}</a>
            <span class="feed-item-type \${item.type}">\${getTypeName(item.type)}</span>
          </div>
          <p class="feed-item-excerpt">\${escapeHtml(item.excerpt)}</p>
          <div class="feed-item-meta">
            <span>👤 \${escapeHtml(item.author_name)}</span>
            <span>👍 \${item.voteup_count}</span>
            <span>💬 \${item.comment_count}</span>
            <span>📝 \${item.word_count} 字</span>
            <span>⏰ \${formatTime(item.created_time)}</span>
            \${item.sources ? item.sources.map(s => \`<span class="feed-item-source">\${escapeHtml(s)}</span>\`).join('') : ''}
          </div>
        </div>
      \`).join('');
    }

    function getTypeName(type) {
      const names = { article: '文章', answer: '回答', pin: '想法' };
      return names[type] || type;
    }

    function formatTime(timestamp) {
      const date = new Date(timestamp * 1000);
      const now = new Date();
      const diff = now - date;

      if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前';
      if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小时前';
      if (diff < 604800000) return Math.floor(diff / 86400000) + ' 天前';
      return date.toLocaleDateString('zh-CN');
    }

    function escapeHtml(str) {
      if (!str) return '';
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // 打开内容详情
    function openItem(id) {
      const item = feedData.find(i => i.id === id);
      if (!item) return;

      document.getElementById('modal-title').textContent = item.title;
      document.getElementById('modal-meta').innerHTML = \`
        <span>👤 \${escapeHtml(item.author_name)}</span>
        <span>👍 \${item.voteup_count}</span>
        <span>💬 \${item.comment_count}</span>
        <span>📝 \${item.word_count} 字</span>
        <a href="\${item.url}" target="_blank" style="color: var(--primary);">在知乎查看 ↗</a>
      \`;
      document.getElementById('modal-content').innerHTML = item.content || item.excerpt;
      document.getElementById('modal-overlay').classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal(event) {
      if (event && event.target !== event.currentTarget) return;
      document.getElementById('modal-overlay').classList.remove('active');
      document.body.style.overflow = '';
    }

    // 刷新 Feed
    async function refreshFeed() {
      showToast('正在刷新...');
      await loadFeed();
      showToast('刷新完成');
    }

    // 加载状态
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

    // 加载规则
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
        container.innerHTML = '<div style="color: var(--text-secondary); padding: 10px;">暂无过滤规则</div>';
        return;
      }

      const typeNames = {
        keyword_blacklist: '关键词',
        min_word_count: '最低字数',
        author_blacklist: '作者',
        content_type: '类型'
      };

      container.innerHTML = rules.map(rule => \`
        <div class="rule-item">
          <span class="rule-type">\${typeNames[rule.type] || rule.type}</span>
          <span class="rule-value">\${escapeHtml(rule.value)}</span>
        </div>
      \`).join('');
    }

    // 添加规则
    async function addRule() {
      const type = document.getElementById('new-rule-type').value;
      const value = document.getElementById('new-rule-value').value.trim();

      if (!value) {
        showToast('请输入规则值');
        return;
      }

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
        } else {
          showToast('添加失败');
        }
      } catch (err) {
        showToast('添加失败: ' + err.message);
      }
    }

    // 保存 Cookie
    async function saveCookie() {
      const cookies = document.getElementById('cookie-input').value.trim();
      if (!cookies) {
        showToast('请输入 Cookie');
        return;
      }

      try {
        const res = await fetch('/api/cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cookies })
        });

        if (res.ok) {
          showToast('Cookie 已保存');
        } else {
          showToast('保存失败');
        }
      } catch (err) {
        showToast('保存失败: ' + err.message);
      }
    }

    // 同步关注列表
    async function syncFollowees() {
      showToast('开始同步...');
      try {
        const res = await fetch('/api/sync', { method: 'POST' });
        const data = await res.json();

        if (res.ok) {
          showToast('同步已启动: ' + (data.user || ''));
          setTimeout(loadStatus, 3000);
        } else {
          showToast('同步失败: ' + (data.error || ''));
        }
      } catch (err) {
        showToast('同步失败: ' + err.message);
      }
    }

    // Toast 通知
    function showToast(message) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  </script>
</body>
</html>`;
}
