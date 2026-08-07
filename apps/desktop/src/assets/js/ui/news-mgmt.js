/**
 * EIGU Platform - News Management Module (Desktop Electron Admin & Staff Console)
 * Quản lý Bài viết, Danh mục, Tags & Bình luận Tin tức
 */

const NEWS_ICONS = {
  newspaper: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M18 18h-8"/><path d="M18 10h-8"/></svg>`,
  tag: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  search: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  copy: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  send: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  user: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  star: `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  comments: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  chevronLeft: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
};

let newsListState = [];
let filteredNewsState = [];
let newsCategoriesState = [];
let newsTagsState = [];
let newsStatsState = null;
let currentNewsEditingId = null;

let newsCurrentPage = 1;
let newsPageSize = 10;

function getNewsAuthToken() {
  if (typeof accessToken !== 'undefined' && accessToken) return accessToken;
  return localStorage.getItem('accessToken') || localStorage.getItem('eigu_token') || sessionStorage.getItem('eigu_token') || '';
}

async function loadRealNewsData() {
  const container = document.getElementById('view-news-management');
  if (!container) return;

  const token = getNewsAuthToken();
  if (!token) {
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; color: var(--text-secondary);">
        <h3 style="font-size:18px; font-weight:700; margin-bottom:8px;">Bạn chưa đăng nhập</h3>
        <p style="font-size:13.5px;">Vui lòng đăng nhập tài khoản Admin/Staff để xem trang quản lý tin tức.</p>
      </div>`;
    return;
  }

  // Inject responsive style if not present
  if (!document.getElementById('news-mgmt-responsive-style')) {
    const style = document.createElement('style');
    style.id = 'news-mgmt-responsive-style';
    style.innerHTML = `
      .news-table-wrapper {
        display: block;
        width: 100%;
        overflow-x: auto;
      }
      .news-cards-wrapper {
        display: none;
      }
      @media (max-width: 900px) {
        .news-table-wrapper {
          display: none !important;
        }
        .news-cards-wrapper {
          display: grid !important;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Render initial loading skeleton
  if (!container.querySelector('.news-content-container')) {
    container.innerHTML = `
      <div class="news-content-container" style="padding: 24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px; flex-wrap:wrap; gap:16px;">
          <div>
            <h2 style="font-size:22px; font-weight:800; color:var(--text-primary); margin:0 0 6px; display:flex; align-items:center; gap:8px;">
              <span style="color:var(--accent); display:inline-flex; align-items:center;">${NEWS_ICONS.newspaper}</span>
              <span>Quản Lý Tin Tức & Bài Viết</span>
            </h2>
            <p style="font-size:13px; color:var(--text-secondary); margin:0;">Hệ thống CMS tạo, chỉnh sửa, xuất bản và kiểm duyệt bài viết chuyên nghiệp</p>
          </div>
          <div style="display:flex; gap: 10px;">
            <button class="btn-outline" onclick="openCategoryTagModal()" style="padding: 9px 16px; font-size:13px; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
              ${NEWS_ICONS.tag} <span>Danh Mục & Tags</span>
            </button>
            <button class="btn-primary" onclick="openCreateNewsModal()" style="padding: 9px 18px; font-size:13px; font-weight:700; display:inline-flex; align-items:center; gap:6px;">
              ${NEWS_ICONS.plus} <span>Viết Bài Mới</span>
            </button>
          </div>
        </div>
        <div id="news-stats-bar" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin-bottom: 24px;">
          <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding:16px; text-align:center;">
            <div style="font-size:12px; color:var(--text-muted);">Đang tải dữ liệu...</div>
          </div>
        </div>
        <div id="news-content-body">
          <div style="text-align:center; padding: 60px 0; color: var(--text-secondary);">Đang tải danh sách bài viết từ server...</div>
        </div>
      </div>`;
  }

  try {
    const apiBase = (window.EIGU_CONFIG ? window.EIGU_CONFIG.getApiUrl('') : '/api').replace(/\/$/, '');
    const headers = { 'Authorization': `Bearer ${token}` };

    const [newsRes, statsRes, catRes, tagRes] = await Promise.all([
      fetch(`${apiBase}/news`, { headers }).then(r => r.json()),
      fetch(`${apiBase}/news/statistics`, { headers }).then(r => r.json()).catch(() => null),
      fetch(`${apiBase}/news/categories`, { headers }).then(r => r.json()).catch(() => []),
      fetch(`${apiBase}/news/tags`, { headers }).then(r => r.json()).catch(() => []),
    ]);

    if (newsRes && newsRes.items) {
      newsListState = newsRes.items;
    } else if (Array.isArray(newsRes)) {
      newsListState = newsRes;
    } else {
      newsListState = [];
    }

    newsStatsState = statsRes;
    newsCategoriesState = Array.isArray(catRes) ? catRes : [];
    newsTagsState = Array.isArray(tagRes) ? tagRes : [];

    // Auto-seed default categories if database has zero categories
    if (newsCategoriesState.length === 0) {
      autoSeedDefaultCategories(apiBase, token);
    }

    renderNewsStats();
    filterNewsTable();
  } catch (err) {
    console.error('Error loading news data:', err);
    showToast('Lỗi tải dữ liệu tin tức từ server', 'error');
  }
}

async function autoSeedDefaultCategories(apiBase, token) {
  const defaults = [
    'Tin Tức & Cập Nhật',
    'Hướng Dẫn Kỹ Thuật',
    'Chiến Lược MMO',
    'Thông Báo Hệ Thống'
  ];
  for (const name of defaults) {
    try {
      await fetch(`${apiBase}/news/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });
    } catch (e) { }
  }
  try {
    const res = await fetch(`${apiBase}/news/categories`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        newsCategoriesState = data;
        const catSelect = document.getElementById('editor-category');
        if (catSelect) {
          catSelect.innerHTML = newsCategoriesState.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
        }
      }
    }
  } catch (e) { }
}

function renderNewsStats() {
  const statsBar = document.getElementById('news-stats-bar');
  if (!statsBar) return;

  const total = newsStatsState?.total ?? newsListState.length;
  const published = newsStatsState?.published ?? newsListState.filter(n => n.status === 'published').length;
  const draft = newsStatsState?.draft ?? newsListState.filter(n => n.status === 'draft').length;
  const archived = newsStatsState?.archived ?? newsListState.filter(n => n.status === 'archived').length;
  const totalViews = newsStatsState?.totalViews ?? newsListState.reduce((acc, n) => acc + (n.viewCount || 0), 0);
  const totalComments = newsStatsState?.totalComments ?? newsListState.reduce((acc, n) => acc + (n.commentCount || 0), 0);

  statsBar.innerHTML = `
    <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding:16px;">
      <div style="font-size:11.5px; color:var(--text-muted); font-weight:700; margin-bottom:4px; text-transform:uppercase;">TỔNG BÀI VIẾT</div>
      <div style="font-size:22px; font-weight:800; color:var(--text-primary);">${total}</div>
    </div>
    <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding:16px;">
      <div style="font-size:11.5px; color:#4ade80; font-weight:700; margin-bottom:4px; text-transform:uppercase;">ĐÃ XUẤT BẢN</div>
      <div style="font-size:22px; font-weight:800; color:#4ade80;">${published}</div>
    </div>
    <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding:16px;">
      <div style="font-size:11.5px; color:#facc15; font-weight:700; margin-bottom:4px; text-transform:uppercase;">BÀI NHÁP (DRAFT)</div>
      <div style="font-size:22px; font-weight:800; color:#facc15;">${draft}</div>
    </div>
    <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding:16px;">
      <div style="font-size:11.5px; color:#f87171; font-weight:700; margin-bottom:4px; text-transform:uppercase;">LƯU TRỮ (ARCHIVED)</div>
      <div style="font-size:22px; font-weight:800; color:#f87171;">${archived}</div>
    </div>
    <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding:16px;">
      <div style="font-size:11.5px; color:var(--accent); font-weight:700; margin-bottom:4px; text-transform:uppercase;">TỔNG LƯỢT XEM</div>
      <div style="font-size:22px; font-weight:800; color:var(--accent);">${totalViews.toLocaleString('vi-VN')}</div>
    </div>
    <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding:16px;">
      <div style="font-size:11.5px; color:#a855f7; font-weight:700; margin-bottom:4px; text-transform:uppercase;">BÌNH LUẬN</div>
      <div style="font-size:22px; font-weight:800; color:#a855f7;">${totalComments.toLocaleString('vi-VN')}</div>
    </div>
  `;
}

function renderNewsMainTable() {
  const body = document.getElementById('news-content-body');
  if (!body) return;

  const currentRole = userProfile?.role?.toLowerCase() || 'user';
  const isAdmin = currentRole === 'admin';

  // Control bar & Containers
  body.innerHTML = `
    <!-- Filter bar -->
    <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:14px; padding:16px; margin-bottom:20px; display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
      <div style="flex:1; min-width:220px; position:relative;">
        <input type="text" id="news-search-input" placeholder="Tìm theo tiêu đề, mô tả, slug..." onkeyup="filterNewsTable()"
          style="width:100%; padding:9px 12px 9px 36px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:13px;" />
        <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-muted); display:inline-flex; align-items:center;">
          ${NEWS_ICONS.search}
        </span>
      </div>
      <select id="news-cat-filter" onchange="filterNewsTable()" style="padding:9px 12px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:13px;">
        <option value="">Tất cả Danh Mục</option>
        ${newsCategoriesState.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}
      </select>
      <select id="news-status-filter" onchange="filterNewsTable()" style="padding:9px 12px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:13px;">
        <option value="">Tất cả Trạng Thái</option>
        <option value="published">Đã Xuất Bản</option>
        <option value="draft">Bài Nháp (Draft)</option>
        <option value="archived">Lưu Trữ (Archived)</option>
      </select>
      <select id="news-featured-filter" onchange="filterNewsTable()" style="padding:9px 12px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:13px;">
        <option value="">Nổi Bật / Tất cả</option>
        <option value="featured">Bài Nổi Bật</option>
      </select>
      <select id="news-sort-filter" onchange="filterNewsTable()" style="padding:9px 12px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:13px;">
        <option value="newest">Mới Nhất</option>
        <option value="oldest">Cũ Nhất</option>
        <option value="views">Nhiều Lượt Xem</option>
        <option value="comments">Nhiều Bình Luận</option>
      </select>
    </div>

    <!-- Table View Container (Desktop) -->
    <div class="news-table-wrapper" style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:14px; overflow:hidden;">
      <table style="width:100%; min-width:920px; border-collapse:collapse; text-align:left; font-size:13px;">
        <thead>
          <tr style="background:var(--bg-primary); border-bottom:1px solid var(--border-color); color:var(--text-muted); font-size:12px; text-transform:uppercase;">
            <th style="padding:14px 16px; width:80px;">Thumbnail</th>
            <th style="padding:14px 16px;">Tiêu đề & Slug</th>
            <th style="padding:14px 16px; width:160px;">Danh mục</th>
            <th style="padding:14px 16px; width:120px;">Tác giả</th>
            <th style="padding:14px 16px; width:110px; text-align:center;">Trạng thái</th>
            <th style="padding:14px 16px; width:100px; text-align:center;">Chỉ số</th>
            <th style="padding:14px 16px; width:110px;">Ngày tạo</th>
            <th style="padding:14px 16px; width:150px; text-align:right;">Thao tác</th>
          </tr>
        </thead>
        <tbody id="news-table-rows">
        </tbody>
      </table>
    </div>

    <!-- Card View Container (Responsive Window < 900px) -->
    <div id="news-cards-wrapper" class="news-cards-wrapper">
    </div>

    <!-- Pagination Controls Bar -->
    <div id="news-pagination-bar">
    </div>
  `;

  renderNewsCurrentPageData();
}

function renderNewsCurrentPageData() {
  const isAdmin = userProfile?.role?.toLowerCase() === 'admin';
  const totalItems = filteredNewsState.length;
  const totalPages = Math.ceil(totalItems / newsPageSize) || 1;

  if (newsCurrentPage > totalPages) {
    newsCurrentPage = totalPages;
  }
  if (newsCurrentPage < 1) {
    newsCurrentPage = 1;
  }

  const startIndex = (newsCurrentPage - 1) * newsPageSize;
  const endIndex = Math.min(startIndex + newsPageSize, totalItems);
  const paginatedItems = filteredNewsState.slice(startIndex, endIndex);

  // 1. Render Table Rows
  const rowsContainer = document.getElementById('news-table-rows');
  if (rowsContainer) {
    rowsContainer.innerHTML = renderNewsRows(paginatedItems, isAdmin);
  }

  // 2. Render Cards for Responsive Mode
  const cardsContainer = document.getElementById('news-cards-wrapper');
  if (cardsContainer) {
    cardsContainer.innerHTML = renderNewsCards(paginatedItems, isAdmin);
  }

  // 3. Render Pagination Bar
  const pagBar = document.getElementById('news-pagination-bar');
  if (pagBar) {
    pagBar.innerHTML = renderNewsPaginationBar(totalItems, totalPages, startIndex, endIndex);
  }
}

function renderNewsRows(items, isAdmin) {
  if (!items || items.length === 0) {
    return `
      <tr>
        <td colspan="8" style="padding:40px; text-align:center; color:var(--text-secondary);">
          Chưa có bài viết nào phù hợp với bộ lọc
        </td>
      </tr>`;
  }

  const defaultPlaceholder = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&auto=format&fit=crop&q=60';

  return items.map(item => {
    const thumbUrl = item.thumbnail || defaultPlaceholder;
    const catName = item.category?.name || 'Chưa phân loại';
    const statusMap = {
      published: { label: 'Đã xuất bản', bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' },
      draft:     { label: 'Bài nháp', bg: 'rgba(234, 179, 8, 0.15)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.3)' },
      archived:  { label: 'Lưu trữ', bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' },
    };
    const st = statusMap[item.status] || statusMap.draft;
    const createdDate = new Date(item.createdAt).toLocaleDateString('vi-VN');

    return `
      <tr style="border-bottom:1px solid var(--border-color); transition:background 0.2s;">
        <td style="padding:12px 16px;">
          <div style="width:64px; height:44px; border-radius:8px; overflow:hidden; background:var(--bg-primary); border:1px solid var(--border-color);">
            <img src="${thumbUrl}" onerror="this.onerror=null; this.src='${defaultPlaceholder}';" alt="${escapeHtml(item.title)}" style="width:100%; height:100%; object-fit:cover;" />
          </div>
        </td>
        <td style="padding:12px 16px;">
          <div style="font-weight:700; color:var(--text-primary); margin-bottom:4px; display:flex; align-items:center; gap:6px;">
            ${item.isFeatured ? `<span style="color:#facc15; display:inline-flex; align-items:center;" title="Bài viết Nổi Bật">${NEWS_ICONS.star}</span>` : ''}
            <span>${escapeHtml(item.title)}</span>
          </div>
          <div style="font-size:11px; color:var(--text-muted); font-family:monospace;">/news/${escapeHtml(item.slug)}</div>
        </td>
        <td style="padding:12px 16px; width:160px;">
          <span style="display:inline-block; max-width:140px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:12px; background:var(--bg-primary); border:1px solid var(--border-color); color:var(--accent); padding:4px 10px; border-radius:6px; font-weight:600; vertical-align:middle;" title="${escapeHtml(catName)}">
            ${escapeHtml(catName)}
          </span>
        </td>
        <td style="padding:12px 16px; color:var(--text-secondary); font-size:12px;">
          <span style="display:inline-flex; align-items:center; gap:4px;">
            ${NEWS_ICONS.user}
            <span>${escapeHtml(item.authorName || 'Staff')}</span>
          </span>
        </td>
        <td style="padding:12px 16px; text-align:center;">
          <span style="font-size:11px; font-weight:700; background:${st.bg}; color:${st.color}; border:${st.border}; padding:4px 10px; border-radius:12px; display:inline-block;">
            ${st.label}
          </span>
        </td>
        <td style="padding:12px 16px; text-align:center; font-size:11px; color:var(--text-secondary);">
          <div style="display:flex; align-items:center; justify-content:center; gap:4px;">${NEWS_ICONS.eye} ${item.viewCount || 0}</div>
          <div style="display:flex; align-items:center; justify-content:center; gap:4px; margin-top:2px;">${NEWS_ICONS.comments} ${item.commentCount || 0}</div>
        </td>
        <td style="padding:12px 16px; font-size:12px; color:var(--text-muted);">
          ${createdDate}
        </td>
        <td style="padding:12px 16px; text-align:right;">
          <div style="display:flex; justify-content:flex-end; gap:6px; flex-wrap:nowrap;">
            <button onclick="previewNewsArticle('${item.id}')" title="Xem trước" style="padding:6px 8px; background:var(--bg-primary); border:1px solid var(--border-color); color:var(--text-primary); border-radius:6px; cursor:pointer; font-size:12px; display:inline-flex; align-items:center;">${NEWS_ICONS.eye}</button>
            <button onclick="editNewsArticle('${item.id}')" title="Chỉnh sửa" style="padding:6px 8px; background:rgba(99,102,241,0.15); border:1px solid rgba(99,102,241,0.3); color:var(--accent); border-radius:6px; cursor:pointer; font-size:12px; display:inline-flex; align-items:center;">${NEWS_ICONS.edit}</button>
            <button onclick="duplicateNewsArticle('${item.id}')" title="Nhân bản" style="padding:6px 8px; background:var(--bg-primary); border:1px solid var(--border-color); color:var(--text-primary); border-radius:6px; cursor:pointer; font-size:12px; display:inline-flex; align-items:center;">${NEWS_ICONS.copy}</button>
            ${item.status === 'draft' ? `<button onclick="togglePublishNews('${item.id}', true)" title="Xuất bản ngay" style="padding:6px 8px; background:rgba(34,197,94,0.15); border:1px solid rgba(34,197,94,0.3); color:#4ade80; border-radius:6px; cursor:pointer; font-size:12px; display:inline-flex; align-items:center;">${NEWS_ICONS.send}</button>` : ''}
            ${isAdmin ? `<button onclick="deleteNewsArticle('${item.id}')" title="Xóa bài viết (Soft Delete)" style="padding:6px 8px; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); color:#f87171; border-radius:6px; cursor:pointer; font-size:12px; display:inline-flex; align-items:center;">${NEWS_ICONS.trash}</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderNewsCards(items, isAdmin) {
  if (!items || items.length === 0) {
    return `
      <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-secondary); background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px;">
        Chưa có bài viết nào phù hợp với bộ lọc
      </div>`;
  }

  const defaultPlaceholder = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&auto=format&fit=crop&q=60';

  return items.map(item => {
    const thumbUrl = item.thumbnail || defaultPlaceholder;
    const catName = item.category?.name || 'Chưa phân loại';
    const statusMap = {
      published: { label: 'Đã xuất bản', bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' },
      draft:     { label: 'Bài nháp', bg: 'rgba(234, 179, 8, 0.15)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.3)' },
      archived:  { label: 'Lưu trữ', bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' },
    };
    const st = statusMap[item.status] || statusMap.draft;
    const createdDate = new Date(item.createdAt).toLocaleDateString('vi-VN');

    return `
      <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:14px; padding:16px; display:flex; flex-direction:column; justify-content:space-between; gap:12px; position:relative;">
        <div style="display:flex; gap:12px;">
          <div style="width:72px; height:52px; border-radius:8px; overflow:hidden; background:var(--bg-primary); border:1px solid var(--border-color); flex-shrink:0;">
            <img src="${thumbUrl}" onerror="this.onerror=null; this.src='${defaultPlaceholder}';" alt="${escapeHtml(item.title)}" style="width:100%; height:100%; object-fit:cover;" />
          </div>
          <div style="flex:1; min-width:0;">
            <div style="font-weight:700; color:var(--text-primary); font-size:13.5px; line-height:1.3; margin-bottom:4px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
              ${item.isFeatured ? `<span style="color:#facc15; margin-right:4px; display:inline-flex; align-items:center;">${NEWS_ICONS.star}</span>` : ''}
              <span>${escapeHtml(item.title)}</span>
            </div>
            <div style="font-size:11px; color:var(--text-muted); font-family:monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">/news/${escapeHtml(item.slug)}</div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
          <span style="display:inline-block; max-width:160px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:11.5px; background:var(--bg-primary); border:1px solid var(--border-color); color:var(--accent); padding:3px 8px; border-radius:6px; font-weight:600;" title="${escapeHtml(catName)}">
            ${escapeHtml(catName)}
          </span>
          <span style="font-size:11px; font-weight:700; background:${st.bg}; color:${st.color}; border:${st.border}; padding:3px 8px; border-radius:10px;">
            ${st.label}
          </span>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px; color:var(--text-muted); border-top:1px solid var(--border-color); padding-top:8px;">
          <div style="display:flex; align-items:center; gap:4px;">
            <span style="display:inline-flex; align-items:center;">${NEWS_ICONS.user}</span>
            <span>${escapeHtml(item.authorName || 'Staff')}</span>
            <span style="margin:0 4px;">•</span>
            <span>${createdDate}</span>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="display:inline-flex; align-items:center; gap:3px;">${NEWS_ICONS.eye} ${item.viewCount || 0}</span>
            <span style="display:inline-flex; align-items:center; gap:3px;">${NEWS_ICONS.comments} ${item.commentCount || 0}</span>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:6px; border-top:1px solid var(--border-color); padding-top:8px; flex-wrap:wrap;">
          <button onclick="previewNewsArticle('${item.id}')" title="Xem trước" style="padding:5px 9px; background:var(--bg-primary); border:1px solid var(--border-color); color:var(--text-primary); border-radius:6px; cursor:pointer; font-size:12px; display:inline-flex; align-items:center; gap:4px;">${NEWS_ICONS.eye} <span>Xem</span></button>
          <button onclick="editNewsArticle('${item.id}')" title="Chỉnh sửa" style="padding:5px 9px; background:rgba(99,102,241,0.15); border:1px solid rgba(99,102,241,0.3); color:var(--accent); border-radius:6px; cursor:pointer; font-size:12px; display:inline-flex; align-items:center; gap:4px;">${NEWS_ICONS.edit} <span>Sửa</span></button>
          <button onclick="duplicateNewsArticle('${item.id}')" title="Nhân bản" style="padding:5px 9px; background:var(--bg-primary); border:1px solid var(--border-color); color:var(--text-primary); border-radius:6px; cursor:pointer; font-size:12px; display:inline-flex; align-items:center; gap:4px;">${NEWS_ICONS.copy} <span>Sao</span></button>
          ${item.status === 'draft' ? `<button onclick="togglePublishNews('${item.id}', true)" title="Xuất bản ngay" style="padding:5px 9px; background:rgba(34,197,94,0.15); border:1px solid rgba(34,197,94,0.3); color:#4ade80; border-radius:6px; cursor:pointer; font-size:12px; display:inline-flex; align-items:center; gap:4px;">${NEWS_ICONS.send} <span>Duyệt</span></button>` : ''}
          ${isAdmin ? `<button onclick="deleteNewsArticle('${item.id}')" title="Xóa bài viết" style="padding:5px 9px; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); color:#f87171; border-radius:6px; cursor:pointer; font-size:12px; display:inline-flex; align-items:center; gap:4px;">${NEWS_ICONS.trash} <span>Xóa</span></button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function renderNewsPaginationBar(totalItems, totalPages, startIndex, endIndex) {
  const currentEnd = Math.min(endIndex, totalItems);
  const currentStart = totalItems > 0 ? startIndex + 1 : 0;

  return `
    <div class="news-pagination-bar" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-top:16px; padding:12px 16px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px;">
      <div style="display:flex; align-items:center; gap:10px; font-size:13px; color:var(--text-secondary);">
        <span>Hiển thị</span>
        <select onchange="changeNewsPageSize(this.value)" style="padding:5px 10px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:6px; color:var(--text-primary); font-size:12.5px; font-weight:600; cursor:pointer;">
          <option value="5" ${newsPageSize === 5 ? 'selected' : ''}>5</option>
          <option value="10" ${newsPageSize === 10 ? 'selected' : ''}>10</option>
          <option value="20" ${newsPageSize === 20 ? 'selected' : ''}>20</option>
          <option value="50" ${newsPageSize === 50 ? 'selected' : ''}>50</option>
          <option value="100" ${newsPageSize === 100 ? 'selected' : ''}>100</option>
        </select>
        <span>dòng / trang</span>
        <span style="color:var(--text-muted); font-size:12px; margin-left:6px;">(${currentStart} - ${currentEnd} trong tổng ${totalItems} bài)</span>
      </div>

      <div style="display:flex; align-items:center; gap:6px;">
        <button onclick="goToNewsPage(${newsCurrentPage - 1})" ${newsCurrentPage <= 1 ? 'disabled' : ''} style="padding:6px 10px; background:var(--bg-primary); border:1px solid var(--border-color); color:var(--text-primary); border-radius:6px; cursor:pointer; opacity:${newsCurrentPage <= 1 ? 0.4 : 1}; display:inline-flex; align-items:center; justify-content:center;" title="Trang trước">
          ${NEWS_ICONS.chevronLeft}
        </button>

        ${renderPageButtons(newsCurrentPage, totalPages)}

        <button onclick="goToNewsPage(${newsCurrentPage + 1})" ${newsCurrentPage >= totalPages ? 'disabled' : ''} style="padding:6px 10px; background:var(--bg-primary); border:1px solid var(--border-color); color:var(--text-primary); border-radius:6px; cursor:pointer; opacity:${newsCurrentPage >= totalPages ? 0.4 : 1}; display:inline-flex; align-items:center; justify-content:center;" title="Trang sau">
          ${NEWS_ICONS.chevronRight}
        </button>
      </div>
    </div>
  `;
}

function renderPageButtons(current, total) {
  if (total <= 1) {
    return `<button style="padding:6px 12px; background:var(--accent); border:1px solid var(--accent); color:#fff; border-radius:6px; font-weight:700; font-size:12.5px;">1</button>`;
  }

  let pages = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
  }

  return pages.map(p => {
    if (p === '...') {
      return `<span style="padding:6px 8px; color:var(--text-muted); font-size:12px;">...</span>`;
    }
    const isCurrent = p === current;
    return `
      <button onclick="goToNewsPage(${p})" style="padding:6px 12px; background:${isCurrent ? 'var(--accent)' : 'var(--bg-primary)'}; border:1px solid ${isCurrent ? 'var(--accent)' : 'var(--border-color)'}; color:${isCurrent ? '#fff' : 'var(--text-primary)'}; border-radius:6px; cursor:pointer; font-weight:${isCurrent ? '700' : '500'}; font-size:12.5px;">
        ${p}
      </button>
    `;
  }).join('');
}

function changeNewsPageSize(newSize) {
  newsPageSize = parseInt(newSize, 10) || 10;
  newsCurrentPage = 1;
  renderNewsCurrentPageData();
}

function goToNewsPage(page) {
  newsCurrentPage = page;
  renderNewsCurrentPageData();
}

function filterNewsTable() {
  const q = (document.getElementById('news-search-input')?.value || '').toLowerCase();
  const cat = document.getElementById('news-cat-filter')?.value || '';
  const status = document.getElementById('news-status-filter')?.value || '';
  const featured = document.getElementById('news-featured-filter')?.value || '';
  const sort = document.getElementById('news-sort-filter')?.value || 'newest';

  filteredNewsState = newsListState.filter(item => {
    if (q) {
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchSlug = (item.slug || '').toLowerCase().includes(q);
      const matchSum = (item.summary || '').toLowerCase().includes(q);
      if (!matchTitle && !matchSlug && !matchSum) return false;
    }
    if (cat && item.categoryId !== cat) return false;
    if (status && item.status !== status) return false;
    if (featured === 'featured' && !item.isFeatured) return false;
    return true;
  });

  if (sort === 'oldest') filteredNewsState.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  if (sort === 'newest') filteredNewsState.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (sort === 'views') filteredNewsState.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  if (sort === 'comments') filteredNewsState.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));

  newsCurrentPage = 1;
  renderNewsMainTable();
}

// Helper: Escape HTML string to avoid XSS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ================= CREATE / EDIT MODAL =================

function openCreateNewsModal() {
  currentNewsEditingId = null;
  renderNewsEditorModal({
    title: '',
    slug: '',
    categoryId: newsCategoriesState[0]?.id || '',
    tags: [],
    thumbnail: '',
    gallery: [],
    summary: '',
    content: '<p>Nhập nội dung bài viết tại đây...</p>',
    status: 'draft',
    isFeatured: false,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  });
}

function editNewsArticle(id) {
  const item = newsListState.find(n => n.id === id);
  if (!item) return;
  currentNewsEditingId = id;
  renderNewsEditorModal(item);
}

function renderNewsEditorModal(item) {
  let modal = document.getElementById('news-editor-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'news-editor-modal';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position:fixed; inset:0; z-index:999999; background:rgba(0,0,0,0.8); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; padding:16px;';
    document.body.appendChild(modal);
  }

  const isEdit = !!currentNewsEditingId;
  const tagNames = item.tags ? (Array.isArray(item.tags) ? item.tags.map(t => typeof t === 'object' ? t.name : t).join(', ') : '') : '';

  modal.innerHTML = `
    <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:18px; width:100%; max-width:860px; max-height:90vh; overflow-y:auto; padding:24px; box-shadow:0 20px 60px rgba(0,0,0,0.9); position:relative;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid var(--border-color); padding-bottom:14px;">
        <h3 style="font-size:18px; font-weight:800; color:var(--text-primary); margin:0; display:flex; align-items:center; gap:8px;">
          <span style="color:var(--accent); display:inline-flex; align-items:center;">${isEdit ? NEWS_ICONS.edit : NEWS_ICONS.plus}</span>
          <span>${isEdit ? 'Chỉnh Sửa Bài Viết' : 'Soạn Thảo Bài Viết Mới'}</span>
        </h3>
        <button onclick="closeNewsEditorModal()" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:20px;">✕</button>
      </div>

      <form id="news-editor-form" onsubmit="saveNewsArticleForm(event)" style="display:flex; flex-direction:column; gap:16px;">
        <!-- Tiêu đề & Slug -->
        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:12px;">
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--text-secondary); margin-bottom:6px;">Tiêu Đề Bài Viết *</label>
            <input type="text" id="editor-title" value="${escapeHtml(item.title || '')}" required placeholder="Nhập tiêu đề hấp dẫn..."
              style="width:100%; padding:10px 12px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:14px; font-weight:600;" />
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <label style="font-size:12px; font-weight:700; color:var(--text-secondary); margin:0;">Danh Mục</label>
              <button type="button" onclick="openCategoryTagModal()" style="background:none; border:none; color:var(--accent); font-size:11px; font-weight:700; cursor:pointer; padding:0;">+ Tạo Danh Mục</button>
            </div>
            <select id="editor-category" style="width:100%; padding:10px 12px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:13px;">
              ${newsCategoriesState.length > 0
                ? newsCategoriesState.map(c => `<option value="${c.id}" ${c.id === item.categoryId ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')
                : '<option value="">-- Bấm "+ Tạo Danh Mục" để thêm --</option>'}
            </select>
          </div>
        </div>

        <!-- Thumbnail URL + Live Preview -->
        <div style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:12px; padding:14px;">
          <label style="display:block; font-size:12px; font-weight:700; color:var(--text-secondary); margin-bottom:6px;">Ảnh Đại Diện Thumbnail (URL Link)</label>
          <div style="display:flex; gap:12px; align-items:center;">
            <input type="url" id="editor-thumbnail" value="${escapeHtml(item.thumbnail || '')}" placeholder="https://example.com/image.jpg" oninput="updateThumbnailLivePreview(this.value)"
              style="flex:1; padding:9px 12px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:13px;" />
            <div id="editor-thumb-preview-box" style="width:80px; height:50px; border-radius:8px; overflow:hidden; background:var(--bg-card); border:1px solid var(--border-color); flex-shrink:0; display:flex; align-items:center; justify-content:center;">
              <img id="editor-thumb-img" src="${item.thumbnail || ''}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" onload="this.style.display='block'; this.nextElementSibling.style.display='none';" style="width:100%; height:100%; object-fit:cover; display:${item.thumbnail ? 'block' : 'none'};" />
              <span style="font-size:10px; color:var(--text-muted); text-align:center; display:${item.thumbnail ? 'none' : 'block'};">No Image</span>
            </div>
          </div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Nhập trực tiếp liên kết ảnh từ Unsplash, Imgur, hoặc server ngoài</div>
        </div>

        <!-- Summary -->
        <div>
          <label style="display:block; font-size:12px; font-weight:700; color:var(--text-secondary); margin-bottom:6px;">Tóm Tắt Ngắn (Summary)</label>
          <textarea id="editor-summary" rows="2" placeholder="Mô tả ngắn hiển thị trên card bài viết..."
            style="width:100%; padding:10px 12px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:13px; resize:vertical;">${escapeHtml(item.summary || '')}</textarea>
        </div>

        <!-- Content Editor -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <label style="font-size:12px; font-weight:700; color:var(--text-secondary);">Nội Dung Chi Tiết Bài Viết (Rich HTML Content)</label>
            <div style="display:flex; gap:6px;">
              <button type="button" onclick="insertEditorContent('<p><strong>Nội dung nhấn mạnh</strong></p>')" style="padding:2px 8px; font-size:11px; background:var(--bg-primary); border:1px solid var(--border-color); color:var(--text-primary); border-radius:4px; cursor:pointer;">+ Đoạn Văn</button>
              <button type="button" onclick="insertEditorContent('<h3>Tiêu đề phụ H3</h3>')" style="padding:2px 8px; font-size:11px; background:var(--bg-primary); border:1px solid var(--border-color); color:var(--text-primary); border-radius:4px; cursor:pointer;">+ H3</button>
              <button type="button" onclick="insertEditorImageUrl()" style="padding:2px 8px; font-size:11px; background:var(--bg-primary); border:1px solid var(--border-color); color:var(--accent); border-radius:4px; cursor:pointer;">+ Chèn Link Ảnh</button>
            </div>
          </div>
          <textarea id="editor-content" rows="10" required placeholder="Nhập nội dung HTML hoặc văn bản bài viết..."
            style="width:100%; padding:12px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:13px; font-family:monospace; resize:vertical;">${escapeHtml(item.content || '')}</textarea>
        </div>

        <!-- Tags & Config -->
        <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:12px; align-items:center;">
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--text-secondary); margin-bottom:6px;">Thẻ Tags (phân cách bằng dấu phẩy)</label>
            <input type="text" id="editor-tags" value="${escapeHtml(tagNames)}" placeholder="TikTok, Bypass, Tutorial..."
              style="width:100%; padding:9px 12px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:13px;" />
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--text-secondary); margin-bottom:6px;">Trạng Thái</label>
            <select id="editor-status" style="width:100%; padding:9px 12px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:13px;">
              <option value="draft" ${item.status === 'draft' ? 'selected' : ''}>Bài Nháp (Draft)</option>
              <option value="published" ${item.status === 'published' ? 'selected' : ''}>Xuất Bản (Published)</option>
              <option value="archived" ${item.status === 'archived' ? 'selected' : ''}>Lưu Trữ (Archived)</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--text-secondary); margin-bottom:6px;">Bài Nổi Bật?</label>
            <label style="display:flex; align-items:center; gap:8px; padding:8px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:8px; cursor:pointer; font-size:13px; color:var(--text-primary);">
              <input type="checkbox" id="editor-featured" ${item.isFeatured ? 'checked' : ''} />
              <span>Featured</span>
            </label>
          </div>
        </div>

        <!-- SEO Metadata -->
        <details style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:10px; padding:12px;">
          <summary style="font-size:12px; font-weight:700; color:var(--accent); cursor:pointer;">Cấu Hình SEO & Meta Tags (Tối Ưu Bài Viết)</summary>
          <div style="display:flex; flex-direction:column; gap:10px; margin-top:10px;">
            <div>
              <label style="display:block; font-size:11px; color:var(--text-muted); margin-bottom:4px;">SEO Title</label>
              <input type="text" id="editor-seo-title" value="${escapeHtml(item.seoTitle || '')}" placeholder="Tiêu đề chuẩn SEO (để trống sẽ dùng Tiêu đề bài viết)"
                style="width:100%; padding:8px 10px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:6px; color:var(--text-primary); font-size:12px;" />
            </div>
            <div>
              <label style="display:block; font-size:11px; color:var(--text-muted); margin-bottom:4px;">SEO Description</label>
              <input type="text" id="editor-seo-desc" value="${escapeHtml(item.seoDescription || '')}" placeholder="Mô tả thẻ Meta Description..."
                style="width:100%; padding:8px 10px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:6px; color:var(--text-primary); font-size:12px;" />
            </div>
            <div>
              <label style="display:block; font-size:11px; color:var(--text-muted); margin-bottom:4px;">SEO Keywords</label>
              <input type="text" id="editor-seo-keywords" value="${escapeHtml(item.seoKeywords || '')}" placeholder="tieu de, eigu, bypass md5, mmo..."
                style="width:100%; padding:8px 10px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:6px; color:var(--text-primary); font-size:12px;" />
            </div>
          </div>
        </details>

        <!-- Submit Controls -->
        <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:8px; border-top:1px solid var(--border-color); padding-top:16px;">
          <button type="button" onclick="closeNewsEditorModal()" class="btn-outline" style="padding:10px 20px; font-size:13px;">Hủy Bỏ</button>
          <button type="submit" class="btn-primary" style="padding:10px 24px; font-size:13px; font-weight:700;">Lưu Bài Viết</button>
        </div>
      </form>
    </div>
  `;
}

function updateThumbnailLivePreview(url) {
  const img = document.getElementById('editor-thumb-img');
  const previewBox = document.getElementById('editor-thumb-preview-box');
  if (!img || !previewBox) return;
  if (url && url.trim()) {
    img.src = url;
    img.style.display = 'block';
    img.nextElementSibling.style.display = 'none';
  } else {
    img.style.display = 'none';
    img.nextElementSibling.style.display = 'block';
  }
}

function insertEditorContent(htmlSnippet) {
  const contentArea = document.getElementById('editor-content');
  if (contentArea) {
    contentArea.value += `\n${htmlSnippet}`;
  }
}

function insertEditorImageUrl() {
  const url = prompt('Dán liên kết URL của hình ảnh (http:// hoặc https://):');
  if (url && url.trim()) {
    insertEditorContent(`<figure><img src="${url.trim()}" alt="Ảnh minh họa" style="max-width:100%; border-radius:12px;" /><figcaption style="text-align:center; font-size:12px; color:gray;">Ảnh minh họa</figcaption></figure>`);
  }
}

function closeNewsEditorModal() {
  const modal = document.getElementById('news-editor-modal');
  if (modal) modal.remove();
}

async function saveNewsArticleForm(e) {
  e.preventDefault();
  const token = getNewsAuthToken();
  if (!token) return;

  const title = document.getElementById('editor-title').value;
  const categoryId = document.getElementById('editor-category').value;
  const thumbnail = document.getElementById('editor-thumbnail').value;
  const summary = document.getElementById('editor-summary').value;
  const content = document.getElementById('editor-content').value;
  const tagsStr = document.getElementById('editor-tags').value;
  const status = document.getElementById('editor-status').value;
  const isFeatured = document.getElementById('editor-featured').checked;
  const seoTitle = document.getElementById('editor-seo-title').value;
  const seoDescription = document.getElementById('editor-seo-desc').value;
  const seoKeywords = document.getElementById('editor-seo-keywords').value;

  const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

  const payload = {
    title,
    categoryId: categoryId ? categoryId : undefined,
    thumbnail: thumbnail || undefined,
    summary,
    content,
    tags,
    status,
    isFeatured,
    seoTitle: seoTitle || undefined,
    seoDescription: seoDescription || undefined,
    seoKeywords: seoKeywords || undefined,
  };

  try {
    const apiBase = (window.EIGU_CONFIG ? window.EIGU_CONFIG.getApiUrl('') : '/api').replace(/\/$/, '');
    const isEdit = !!currentNewsEditingId;
    const url = isEdit ? `${apiBase}/news/${currentNewsEditingId}` : `${apiBase}/news`;
    const method = isEdit ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Lưu bài viết thất bại');
    }

    showToast(isEdit ? 'Đã cập nhật bài viết thành công!' : 'Đã tạo bài viết mới thành công!', 'success');
    closeNewsEditorModal();
    loadRealNewsData();
  } catch (err) {
    showToast(err.message || 'Lỗi lưu bài viết', 'error');
  }
}

// ================= ACTION HANDLERS =================

async function togglePublishNews(id, publish) {
  const token = getNewsAuthToken();
  if (!token) return;

  try {
    const apiBase = (window.EIGU_CONFIG ? window.EIGU_CONFIG.getApiUrl('') : '/api').replace(/\/$/, '');
    const res = await fetch(`${apiBase}/news/${id}/publish`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Xuất bản bài viết thất bại');
    showToast('Đã xuất bản bài viết thành công!', 'success');
    loadRealNewsData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function duplicateNewsArticle(id) {
  const token = getNewsAuthToken();
  if (!token) return;

  try {
    const apiBase = (window.EIGU_CONFIG ? window.EIGU_CONFIG.getApiUrl('') : '/api').replace(/\/$/, '');
    const res = await fetch(`${apiBase}/news/${id}/duplicate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Nhân bản bài viết thất bại');
    showToast('Đã tạo bản sao thành công!', 'success');
    loadRealNewsData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteNewsArticle(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa bài viết này (Soft Delete)?')) return;

  const token = getNewsAuthToken();
  if (!token) return;

  try {
    const apiBase = (window.EIGU_CONFIG ? window.EIGU_CONFIG.getApiUrl('') : '/api').replace(/\/$/, '');
    const res = await fetch(`${apiBase}/news/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Xóa bài viết thất bại');
    }

    showToast('Đã xóa bài viết thành công', 'success');
    loadRealNewsData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ================= PREVIEW MODAL =================

function previewNewsArticle(id) {
  const item = newsListState.find(n => n.id === id);
  if (!item) return;

  let modal = document.getElementById('news-preview-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'news-preview-modal';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position:fixed; inset:0; z-index:999999; background:rgba(0,0,0,0.85); backdrop-filter:blur(12px); display:flex; align-items:center; justify-content:center; padding:16px;';
    document.body.appendChild(modal);
  }

  const catName = item.category?.name || 'Chưa phân loại';
  const createdDate = new Date(item.createdAt).toLocaleDateString('vi-VN');

  modal.innerHTML = `
    <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:18px; width:100%; max-width:800px; max-height:85vh; overflow-y:auto; padding:32px; position:relative; box-shadow:0 20px 60px rgba(0,0,0,0.9);">
      <button onclick="document.getElementById('news-preview-modal').remove()" style="position:absolute; right:20px; top:20px; background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:22px;">✕</button>

      <div style="margin-bottom:12px;">
        <span style="font-size:12px; background:var(--accent-glow); color:var(--accent); border:1px solid var(--accent); padding:4px 10px; border-radius:12px; font-weight:700;">
          ${escapeHtml(catName)}
        </span>
      </div>

      <h1 style="font-size:24px; font-weight:900; color:var(--text-primary); margin:0 0 12px; line-height:1.4;">
        ${escapeHtml(item.title)}
      </h1>

      <div style="display:flex; gap:16px; font-size:12px; color:var(--text-muted); margin-bottom:20px; border-bottom:1px solid var(--border-color); padding-bottom:12px; flex-wrap:wrap;">
        <span style="display:inline-flex; align-items:center; gap:4px;">${NEWS_ICONS.user} ${escapeHtml(item.authorName || 'Staff')}</span>
        <span>•</span>
        <span>${createdDate}</span>
        <span>•</span>
        <span style="display:inline-flex; align-items:center; gap:4px;">${NEWS_ICONS.clock} ${item.readingTime || 1} phút đọc</span>
        <span>•</span>
        <span style="display:inline-flex; align-items:center; gap:4px;">${NEWS_ICONS.eye} ${item.viewCount || 0} lượt xem</span>
      </div>

      ${item.thumbnail ? `
        <div style="border-radius:12px; overflow:hidden; margin-bottom:20px; border:1px solid var(--border-color);">
          <img src="${item.thumbnail}" alt="${escapeHtml(item.title)}" style="width:100%; max-height:360px; object-fit:cover;" />
        </div>
      ` : ''}

      ${item.summary ? `
        <div style="font-size:14px; font-weight:600; color:var(--text-secondary); font-style:italic; background:var(--bg-primary); border-left:4px solid var(--accent); padding:12px 16px; border-radius:0 8px 8px 0; margin-bottom:20px;">
          ${escapeHtml(item.summary)}
        </div>
      ` : ''}

      <div style="font-size:14px; line-height:1.7; color:var(--text-primary);" class="news-article-rendered">
        ${item.content}
      </div>
    </div>
  `;
}

// ================= CATEGORY & TAG MANAGEMENT MODAL =================

function openCategoryTagModal() {
  let modal = document.getElementById('category-tag-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'category-tag-modal';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position:fixed; inset:0; z-index:999999; background:rgba(0,0,0,0.8); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; padding:16px;';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:18px; width:100%; max-width:640px; max-height:85vh; overflow-y:auto; padding:24px; position:relative; box-shadow:0 20px 60px rgba(0,0,0,0.9);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--border-color); padding-bottom:12px;">
        <h3 style="font-size:18px; font-weight:800; color:var(--text-primary); margin:0; display:flex; align-items:center; gap:8px;">
          <span style="color:var(--accent); display:inline-flex; align-items:center;">${NEWS_ICONS.tag}</span>
          <span>Quản Lý Danh Mục & Thẻ Tag</span>
        </h3>
        <button onclick="document.getElementById('category-tag-modal').remove()" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:20px;">✕</button>
      </div>

      <!-- Form Tạo Danh Mục -->
      <div style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:12px; padding:16px; margin-bottom:20px;">
        <h4 style="font-size:14px; font-weight:700; color:var(--text-primary); margin:0 0 10px;">Thêm Danh Mục Mới</h4>
        <form onsubmit="submitCreateCategory(event)" style="display:flex; gap:10px;">
          <input type="text" id="new-cat-name" placeholder="Tên danh mục mới..." required style="flex:1; padding:8px 12px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:6px; color:var(--text-primary); font-size:13px;" />
          <button type="submit" class="btn-primary" style="padding:8px 16px; font-size:13px; font-weight:700;">Tạo Mới</button>
        </form>
      </div>

      <!-- Danh Sách Danh Mục -->
      <div style="margin-bottom:24px;">
        <h4 style="font-size:13px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin:0 0 10px;">Danh Sách Danh Mục</h4>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${newsCategoriesState.map(c => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:8px; padding:10px 14px;">
              <div>
                <span style="font-weight:700; color:var(--text-primary); font-size:13px;">${escapeHtml(c.name)}</span>
                <span style="font-size:11px; color:var(--text-muted); margin-left:8px;">(/news?cat=${escapeHtml(c.slug)})</span>
              </div>
              <span style="font-size:11px; background:var(--bg-card); padding:2px 8px; border-radius:10px; color:var(--accent); font-weight:600;">${c._count?.news || 0} bài</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

async function submitCreateCategory(e) {
  e.preventDefault();
  const token = getNewsAuthToken();
  if (!token) return;

  const name = document.getElementById('new-cat-name').value;
  try {
    const apiBase = (window.EIGU_CONFIG ? window.EIGU_CONFIG.getApiUrl('') : '/api').replace(/\/$/, '');
    const res = await fetch(`${apiBase}/news/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) throw new Error('Tạo danh mục thất bại');
    showToast('Đã tạo danh mục mới thành công!', 'success');
    document.getElementById('category-tag-modal')?.remove();
    loadRealNewsData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
