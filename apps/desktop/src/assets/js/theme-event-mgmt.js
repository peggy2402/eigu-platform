/**
 * Phân hệ Quản lý Giao diện Bốn Mùa & Popup Sự Kiện (Desktop Admin Console)
 */

let cachedThemeEventConfig = null;

async function loadAdminThemeEventData() {
  const container = document.getElementById('admin-theme-event-container');
  if (!container) return;

  // Enforce Admin Access Control
  if (typeof userProfile !== 'undefined' && userProfile && userProfile.role && userProfile.role !== 'admin') {
    container.innerHTML = `
      <div style="text-align:center; padding:50px 20px; color:#ef4444; background:var(--bg-primary); border:1px solid rgba(239,68,68,0.3); border-radius:12px;">
        <h4 style="margin-bottom:8px; font-size:16px;">Quyền truy cập bị từ chối</h4>
        <p style="font-size:13px; color:var(--text-secondary); margin:0;">Phân hệ Quản lý Giao diện & Sự kiện chỉ dành riêng cho Quản trị viên hệ thống (Role: Admin).</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-muted);">Đang tải cấu hình Giao diện & Sự kiện...</div>';

  try {
    // const baseUrl = typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : 'http://localhost:3001/api';
    const baseUrl = typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : 'https://api.eigu.site/api';
    const res = await fetch(`${baseUrl}/theme-event`);
    const data = await res.json();

    if (res.ok && data.success && data.data) {
      cachedThemeEventConfig = data.data;
      renderThemeEventForm(data.data);
    } else {
      throw new Error(data.message || 'Không thể tải cấu hình');
    }
  } catch (err) {
    console.warn('Lỗi kết nối API ThemeEvent, sử dụng dữ liệu mặc định:', err);
    const fallbackConfig = {
      season: 'autumn',
      seasonTitle: 'Giao diện Mùa Thu (Amber Autumn)',
      primaryColor: '#f59e0b',
      badgeText: 'Phiên bản Mùa Thu 3.0',
      isEventActive: true,
      eventTitle: 'Sự Kiện Mùa Thu - Tri Ân Khách Hàng EIGU Platform',
      eventSubtitle: 'Nhận ngay ưu đãi đặc biệt cho tất cả 6 mô-đun công cụ tự động hóa chuyên sâu.',
      eventBannerUrl: 'https://static.9proxy-cdn.net/media/assets/web-images/images/home/airplanes.webp',
      eventButtonText: 'Xem Bảng Giá Khuyến Mãi',
      eventButtonLink: '#pricing',
      eventNotice: 'Áp dụng cho tất cả tài khoản đăng ký mới & nâng cấp gói năm!',
    };
    cachedThemeEventConfig = fallbackConfig;
    renderThemeEventForm(fallbackConfig);
  }
}

function renderThemeEventForm(cfg) {
  const container = document.getElementById('admin-theme-event-container');
  if (!container) return;

  container.innerHTML = `
    <form id="admin-theme-event-form" onsubmit="handleSaveThemeEvent(event); return false;" style="display:flex; flex-direction:column; gap:24px;">
      
      <!-- Khối 1: Cấu hình Giao diện Bốn Mùa -->
      <div style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:14px; padding:22px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid var(--border-color);">
          <div>
            <h4 style="margin:0; font-size:16px; font-weight:800; color:var(--text-primary);">Giao Diện Bốn Mùa (Seasonal Themes)</h4>
            <p style="margin:4px 0 0; font-size:13px; color:var(--text-secondary);">Chọn chủ đề mùa để thay đổi màu sắc chủ đạo, logo và hình nền phía User Website.</p>
          </div>
          <span style="font-size:12px; padding:4px 10px; border-radius:20px; background:rgba(245,158,11,0.15); color:var(--accent); font-weight:700;">
            Đang áp dụng: ${escapeHtml(cfg.seasonTitle || cfg.season)}
          </span>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:18px;">
          <div class="season-card ${cfg.season === 'autumn' ? 'selected' : ''}" onclick="selectSeasonOption('autumn', '#f59e0b', 'Giao diện Mùa Thu (Amber Autumn)')" style="border:2px solid ${cfg.season === 'autumn' ? 'var(--accent)' : 'var(--border-color)'}; background:var(--bg-card); padding:14px; border-radius:10px; cursor:pointer; text-align:center;">
            <div style="display:flex; justify-content:center; margin-bottom:6px;">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
            </div>
            <strong style="display:block; font-size:14px; color:var(--text-primary);">Mùa Thu</strong>
            <span style="font-size:11px; color:var(--text-muted);">Tông Vàng Amber & Lá Thu</span>
          </div>

          <div class="season-card ${cfg.season === 'spring' ? 'selected' : ''}" onclick="selectSeasonOption('spring', '#ec4899', 'Giao diện Mùa Xuân (Cherry Blossom)')" style="border:2px solid ${cfg.season === 'spring' ? 'var(--accent)' : 'var(--border-color)'}; background:var(--bg-card); padding:14px; border-radius:10px; cursor:pointer; text-align:center;">
            <div style="display:flex; justify-content:center; margin-bottom:6px;">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2a4 4 0 0 0 0 8 4 4 0 0 0 0-8z"/><path d="M12 14a4 4 0 0 0 0 8 4 4 0 0 0 0-8z"/><path d="M2 12a4 4 0 0 0 8 0 4 4 0 0 0-8 0z"/><path d="M14 12a4 4 0 0 0 8 0 4 4 0 0 0-8 0z"/></svg>
            </div>
            <strong style="display:block; font-size:14px; color:var(--text-primary);">Mùa Xuân</strong>
            <span style="font-size:11px; color:var(--text-muted);">Tông Hồng Phấn Tươi Mới</span>
          </div>

          <div class="season-card ${cfg.season === 'summer' ? 'selected' : ''}" onclick="selectSeasonOption('summer', '#06b6d4', 'Giao diện Mùa Hạ (Cyan Summer)')" style="border:2px solid ${cfg.season === 'summer' ? 'var(--accent)' : 'var(--border-color)'}; background:var(--bg-card); padding:14px; border-radius:10px; cursor:pointer; text-align:center;">
            <div style="display:flex; justify-content:center; margin-bottom:6px;">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            </div>
            <strong style="display:block; font-size:14px; color:var(--text-primary);">Mùa Hạ</strong>
            <span style="font-size:11px; color:var(--text-muted);">Tông Xanh Ngọc Mát Mẻ</span>
          </div>

          <div class="season-card ${cfg.season === 'winter' ? 'selected' : ''}" onclick="selectSeasonOption('winter', '#3b82f6', 'Giao diện Mùa Đông (Frost Winter)')" style="border:2px solid ${cfg.season === 'winter' ? 'var(--accent)' : 'var(--border-color)'}; background:var(--bg-card); padding:14px; border-radius:10px; cursor:pointer; text-align:center;">
            <div style="display:flex; justify-content:center; margin-bottom:6px;">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="20" y1="7" x2="4" y2="17"/><line x1="4" y1="7" x2="20" y2="17"/><polyline points="10 4 12 2 14 4"/><polyline points="10 20 12 22 14 20"/></svg>
            </div>
            <strong style="display:block; font-size:14px; color:var(--text-primary);">Mùa Đông</strong>
            <span style="font-size:11px; color:var(--text-muted);">Tông Xanh Băng Tuyết</span>
          </div>
        </div>

        <input type="hidden" id="te-season" value="${escapeHtml(cfg.season || 'autumn')}" />

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; margin-bottom:14px;">
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:4px;">TÊN CHỦ ĐỀ MÙA</label>
            <input type="text" id="te-season-title" value="${escapeHtml(cfg.seasonTitle || '')}" placeholder="Giao diện Mùa Thu..." style="width:100%; padding:10px 12px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:13px; outline:none;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:4px;">MÀU CHỦ ĐẠO (Hex Color)</label>
            <input type="color" id="te-primary-color" value="${cfg.primaryColor || '#f59e0b'}" style="width:100%; height:40px; padding:2px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; cursor:pointer;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:4px;">NHÃN BADGE HEADER</label>
            <input type="text" id="te-badge-text" value="${escapeHtml(cfg.badgeText || '')}" placeholder="Phiên bản Mùa Thu 3.0" style="width:100%; padding:10px 12px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:13px; outline:none;" />
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 2fr; gap:14px; padding-top:12px; border-top:1px dashed var(--border-color);">
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:4px;">KIỂU PHÔNG NỀN (BACKGROUND)</label>
            <select id="te-bg-style" style="width:100%; padding:10px 12px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:13px; outline:none;">
              <option value="particles" ${cfg.bgStyle === 'particles' ? 'selected' : ''}>Hạt Động Bốn Mùa (Seasonal Particles)</option>
              <option value="tech-grid" ${cfg.bgStyle === 'tech-grid' ? 'selected' : ''}>Dạng Grid Công Nghệ (Tech Grid Matrix)</option>
              <option value="aurora-glow" ${cfg.bgStyle === 'aurora-glow' ? 'selected' : ''}>Quầng Sáng Aurora (Ambient Aurora Glow)</option>
              <option value="custom-image" ${cfg.bgStyle === 'custom-image' ? 'selected' : ''}>Ảnh Tùy Chỉnh (Custom Background Image)</option>
            </select>
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:4px;">LINK ẢNH NỀN CUSTOM (Nếu chọn Ảnh Tùy Chỉnh)</label>
            <input type="text" id="te-bg-image-url" value="${escapeHtml(cfg.bgImageUrl || '')}" placeholder="https://domain.com/background.jpg" style="width:100%; padding:10px 12px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:13px; outline:none;" />
          </div>
        </div>
      </div>

      <!-- Khối 2: Cấu hình Popup Sự Kiện (Event Dialog) -->
      <div style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:14px; padding:22px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid var(--border-color);">
          <div>
            <h4 style="margin:0; font-size:16px; font-weight:800; color:var(--text-primary);">Popup Sự Kiện (Event Banner Dialog)</h4>
            <p style="margin:4px 0 0; font-size:13px; color:var(--text-secondary);">Hiển thị cửa sổ Popup thông báo khi người dùng truy cập trang chủ Website.</p>
          </div>
          <label style="display:inline-flex; align-items:center; gap:8px; font-size:13px; font-weight:700; color:var(--text-primary); cursor:pointer;">
            <input type="checkbox" id="te-is-event-active" ${cfg.isEventActive ? 'checked' : ''} style="accent-color:var(--accent); width:18px; height:18px;" onchange="toggleEventNoticePreview(this.checked)" />
            Bật Popup Sự kiện trên Website
          </label>
        </div>

        <div id="event-fields-container" style="display:flex; flex-direction:column; gap:14px; opacity:${cfg.isEventActive ? '1' : '0.5'}; transition:opacity 0.3s;">
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:4px;">TIÊU ĐỀ SỰ KIỆN *</label>
            <input type="text" id="te-event-title" value="${escapeHtml(cfg.eventTitle || '')}" placeholder="Sự Kiện Mùa Thu..." style="width:100%; padding:10px 12px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:13px; outline:none;" />
          </div>

          <div>
            <label style="font-size:12px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:4px;">MÔ TẢ NGẮN SỰ KIỆN</label>
            <input type="text" id="te-event-subtitle" value="${escapeHtml(cfg.eventSubtitle || '')}" placeholder="Nhận ngay ưu đãi..." style="width:100%; padding:10px 12px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:13px; outline:none;" />
          </div>

          <div>
            <label style="font-size:12px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:4px;">LINK ẢNH BANNER SỰ KIỆN (WebP/PNG/JPG)</label>
            <input type="text" id="te-event-banner-url" value="${escapeHtml(cfg.eventBannerUrl || '')}" placeholder="https://static.9proxy-cdn.net/..." style="width:100%; padding:10px 12px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:13px; outline:none;" oninput="updateBannerPreview(this.value)" />
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
            <div>
              <label style="font-size:12px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:4px;">CHỮ TRÊN NÚT BẤM (CTA)</label>
              <input type="text" id="te-event-button-text" value="${escapeHtml(cfg.eventButtonText || 'Xem Bảng Giá')}" style="width:100%; padding:10px 12px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:13px; outline:none;" />
            </div>
            <div>
              <label style="font-size:12px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:4px;">LINK ĐÍCH CHUYỂN HƯỚNG</label>
              <input type="text" id="te-event-button-link" value="${escapeHtml(cfg.eventButtonLink || '#pricing')}" style="width:100%; padding:10px 12px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:13px; outline:none;" />
            </div>
          </div>

          <div>
            <label style="font-size:12px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:4px;">GHI CHÚ CHÂN POPUP</label>
            <input type="text" id="te-event-notice" value="${escapeHtml(cfg.eventNotice || '')}" placeholder="Áp dụng cho tất cả tài khoản..." style="width:100%; padding:10px 12px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:13px; outline:none;" />
          </div>
        </div>

        <!-- Banner Preview -->
        <div style="margin-top:16px; padding:14px; background:var(--bg-card); border:1px dashed var(--border-color); border-radius:10px; text-align:center;">
          <div style="font-size:11px; color:var(--text-muted); margin-bottom:8px; font-weight:700;">KHUNG XEM TRƯỚC BANNER POPUP (PREVIEW)</div>
          <img id="event-banner-preview-img" src="${escapeHtml(cfg.eventBannerUrl || 'https://static.9proxy-cdn.net/media/assets/web-images/images/home/airplanes.webp')}" alt="Banner Preview" style="max-height:160px; max-width:100%; object-fit:contain; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3);" onError="this.src='https://static.9proxy-cdn.net/media/assets/web-images/images/home/airplanes.webp'" />
        </div>
      </div>

      <!-- Action Footer -->
      <div style="display:flex; justify-content:flex-end; gap:12px;">
        <button type="button" class="btn-outline" style="padding:10px 20px; font-size:13px; border-radius:8px; margin:0;" onclick="loadAdminThemeEventData()">Hủy Thay Đổi</button>
        <button type="submit" class="btn-primary" style="padding:10px 24px; width:auto; font-size:13px; border-radius:8px;">Lưu Cấu Hình Giao Diện & Sự Kiện</button>
      </div>
    </form>
  `;
}

function selectSeasonOption(seasonKey, colorHex, seasonTitle) {
  document.getElementById('te-season').value = seasonKey;
  document.getElementById('te-primary-color').value = colorHex;
  document.getElementById('te-season-title').value = seasonTitle;

  const namesMap = {
    spring: ['Mùa Xuân', 'Phiên bản Mùa Xuân 3.0', 'Sự Kiện Mùa Xuân - Tri Ân Khách Hàng EIGU Platform'],
    summer: ['Mùa Hạ', 'Phiên bản Mùa Hạ 3.0', 'Sự Kiện Mùa Hạ - Rực Rỡ Sáng Tạo EIGU Platform'],
    autumn: ['Mùa Thu', 'Phiên bản Mùa Thu 3.0', 'Sự Kiện Mùa Thu - Tri Ân Khách Hàng EIGU Platform'],
    winter: ['Mùa Đông', 'Phiên bản Mùa Đông 3.0', 'Sự Kiện Mùa Đông - Bứt Phá Doanh Số EIGU Platform'],
  };

  const [sName, sBadge, sEventTitle] = namesMap[seasonKey] || namesMap.autumn;

  const badgeEl = document.getElementById('te-badge-text');
  const eventTitleEl = document.getElementById('te-event-title');
  if (badgeEl) badgeEl.value = sBadge;
  if (eventTitleEl) eventTitleEl.value = sEventTitle;

  document.querySelectorAll('.season-card').forEach(el => {
    el.style.borderColor = 'var(--border-color)';
    el.classList.remove('selected');
  });

  const target = event ? event.currentTarget : null;
  if (target) {
    target.style.borderColor = 'var(--accent)';
    target.classList.add('selected');
  }
}

function toggleEventNoticePreview(checked) {
  const container = document.getElementById('event-fields-container');
  if (container) {
    container.style.opacity = checked ? '1' : '0.5';
  }
}

function updateBannerPreview(url) {
  const img = document.getElementById('event-banner-preview-img');
  if (img && url) {
    img.src = url;
  }
}

async function handleSaveThemeEvent(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const season = document.getElementById('te-season').value;
  const seasonTitle = document.getElementById('te-season-title').value.trim();
  const primaryColor = document.getElementById('te-primary-color').value;
  const badgeText = document.getElementById('te-badge-text').value.trim();
  const isEventActive = document.getElementById('te-is-event-active').checked;
  const eventTitle = document.getElementById('te-event-title').value.trim();
  const eventSubtitle = document.getElementById('te-event-subtitle').value.trim();
  const eventBannerUrl = document.getElementById('te-event-banner-url').value.trim();
  const eventButtonText = document.getElementById('te-event-button-text').value.trim();
  const eventButtonLink = document.getElementById('te-event-button-link').value.trim();
  const eventNotice = document.getElementById('te-event-notice').value.trim();
  const bgStyle = document.getElementById('te-bg-style').value;
  const bgImageUrl = document.getElementById('te-bg-image-url').value.trim();

  const payload = {
    season,
    seasonTitle,
    primaryColor,
    badgeText,
    isEventActive,
    eventTitle,
    eventSubtitle,
    eventBannerUrl,
    eventButtonText,
    eventButtonLink,
    eventNotice,
    bgStyle,
    bgImageUrl,
  };

  // const baseUrl = typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : 'http://localhost:3001/api';
  const baseUrl = typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : 'https://api.eigu.site/api';

  try {
    const res = await fetch(`${baseUrl}/theme-event`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      cachedThemeEventConfig = data.data;
      if (typeof showToast === 'function') {
        showToast('Thành công', 'Đã cập nhật Giao diện Bốn Mùa & Popup Sự Kiện!', 'success');
      } else {
        alert('Đã cập nhật Giao diện & Sự kiện thành công!');
      }
      renderThemeEventForm(data.data);
    } else {
      if (typeof showToast === 'function') showToast('Lỗi', data.message || 'Cập nhật thất bại', 'error');
      else alert(`Lỗi: ${data.message || 'Cập nhật thất bại'}`);
    }
  } catch (err) {
    console.warn('Lỗi kết nối API ThemeEvent:', err);
    cachedThemeEventConfig = payload;
    if (typeof showToast === 'function') {
      showToast('Thành công', 'Đã lưu cấu hình (Chế độ xem trước)', 'success');
    }
    renderThemeEventForm(payload);
  }

  return false;
}
