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
    const res = await apiFetch('/theme-event');

    if (res && res.success && res.data) {
      cachedThemeEventConfig = res.data;
      renderThemeEventForm(res.data);
    } else if (res && res.data) {
      cachedThemeEventConfig = res.data;
      renderThemeEventForm(res.data);
    } else {
      throw new Error(res?.message || 'Không thể tải cấu hình');
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
    <div style="max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
      
      <!-- Card 1: Theme Season Selector -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.15);">
        <h4 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Chủ Đề Giao Diện Bốn Mùa (Season Theme)
        </h4>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 20px;">
          <label style="display: flex; flex-direction: column; gap: 6px; padding: 14px; background: var(--bg-primary); border: 2px solid ${cfg.season === 'autumn' ? '#f59e0b' : 'var(--border-color)'}; border-radius: 12px; cursor: pointer;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-weight: 800; font-size: 14px; color: #f59e0b;">🍁 Mùa Thu (Autumn)</span>
              <input type="radio" name="themeSeason" value="autumn" ${cfg.season === 'autumn' ? 'checked' : ''} onchange="updateThemePreviewColor(this.value)">
            </div>
            <span style="font-size: 11px; color: var(--text-muted);">Tone Amber - Vàng Cam Hổ Phách</span>
          </label>

          <label style="display: flex; flex-direction: column; gap: 6px; padding: 14px; background: var(--bg-primary); border: 2px solid ${cfg.season === 'winter' ? '#38bdf8' : 'var(--border-color)'}; border-radius: 12px; cursor: pointer;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-weight: 800; font-size: 14px; color: #38bdf8;">❄️ Mùa Đông (Winter)</span>
              <input type="radio" name="themeSeason" value="winter" ${cfg.season === 'winter' ? 'checked' : ''} onchange="updateThemePreviewColor(this.value)">
            </div>
            <span style="font-size: 11px; color: var(--text-muted);">Tone Cyan - Xanh Băng Tuyết</span>
          </label>

          <label style="display: flex; flex-direction: column; gap: 6px; padding: 14px; background: var(--bg-primary); border: 2px solid ${cfg.season === 'spring' ? '#ec4899' : 'var(--border-color)'}; border-radius: 12px; cursor: pointer;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-weight: 800; font-size: 14px; color: #ec4899;">🌸 Mùa Xuân (Spring)</span>
              <input type="radio" name="themeSeason" value="spring" ${cfg.season === 'spring' ? 'checked' : ''} onchange="updateThemePreviewColor(this.value)">
            </div>
            <span style="font-size: 11px; color: var(--text-muted);">Tone Pink - Hồng Hoa Đào</span>
          </label>

          <label style="display: flex; flex-direction: column; gap: 6px; padding: 14px; background: var(--bg-primary); border: 2px solid ${cfg.season === 'summer' ? '#22c55e' : 'var(--border-color)'}; border-radius: 12px; cursor: pointer;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-weight: 800; font-size: 14px; color: #22c55e;">☀️ Mùa Hè (Summer)</span>
              <input type="radio" name="themeSeason" value="summer" ${cfg.season === 'summer' ? 'checked' : ''} onchange="updateThemePreviewColor(this.value)">
            </div>
            <span style="font-size: 11px; color: var(--text-muted);">Tone Emerald - Xanh Năng Lượng</span>
          </label>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
          <div>
            <label style="font-size: 12px; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 6px;">Tiêu đề hiển thị chủ đề</label>
            <input type="text" id="theme-season-title" value="${cfg.seasonTitle || ''}" class="form-input" style="width: 100%; padding: 10px; border-radius: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary);">
          </div>
          <div>
            <label style="font-size: 12px; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 6px;">Nhãn Badge Phiên Bản (Hero Badge)</label>
            <input type="text" id="theme-badge-text" value="${cfg.badgeText || ''}" class="form-input" style="width: 100%; padding: 10px; border-radius: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary);">
          </div>
          <div>
            <label style="font-size: 12px; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 6px;">Mã màu nhấn (Primary Hex)</label>
            <div style="display: flex; gap: 8px;">
              <input type="color" id="theme-color-picker" value="${cfg.primaryColor || '#f59e0b'}" onchange="document.getElementById('theme-primary-color').value = this.value" style="width: 42px; height: 38px; border: none; border-radius: 6px; cursor: pointer; background: none;">
              <input type="text" id="theme-primary-color" value="${cfg.primaryColor || '#f59e0b'}" class="form-input" style="flex: 1; padding: 10px; border-radius: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary);">
            </div>
          </div>
        </div>
      </div>

      <!-- Card 2: Popup Event Announcement Manager -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.15);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
          <h4 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            Cấu Hình Popup Sự Kiện (Event Announcement Modal)
          </h4>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; font-weight: 700; color: var(--text-primary);">
            <input type="checkbox" id="theme-event-active" ${cfg.isEventActive ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--accent);">
            <span>Bật hiển thị Popup khi user vào ứng dụng</span>
          </label>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="font-size: 12px; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 6px;">Tiêu đề chính sự kiện</label>
            <input type="text" id="theme-event-title" value="${cfg.eventTitle || ''}" class="form-input" style="width: 100%; padding: 10px; border-radius: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary);">
          </div>

          <div>
            <label style="font-size: 12px; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 6px;">Nội dung phụ mô tả sự kiện</label>
            <textarea id="theme-event-subtitle" rows="2" class="form-input" style="width: 100%; padding: 10px; border-radius: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); resize: vertical;">${cfg.eventSubtitle || ''}</textarea>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label style="font-size: 12px; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 6px;">Ảnh Banner sự kiện (Image URL)</label>
              <input type="text" id="theme-event-banner-url" value="${cfg.eventBannerUrl || ''}" class="form-input" style="width: 100%; padding: 10px; border-radius: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary);">
            </div>
            <div>
              <label style="font-size: 12px; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 6px;">Nút kêu gọi hành động (Button Label)</label>
              <input type="text" id="theme-event-button-text" value="${cfg.eventButtonText || ''}" class="form-input" style="width: 100%; padding: 10px; border-radius: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary);">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label style="font-size: 12px; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 6px;">Liên kết điều hướng (Action Link)</label>
              <input type="text" id="theme-event-button-link" value="${cfg.eventButtonLink || '#pricing'}" class="form-input" style="width: 100%; padding: 10px; border-radius: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary);">
            </div>
            <div>
              <label style="font-size: 12px; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 6px;">Ghi chú Footer Popup</label>
              <input type="text" id="theme-event-notice" value="${cfg.eventNotice || ''}" class="form-input" style="width: 100%; padding: 10px; border-radius: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary);">
            </div>
          </div>
        </div>
      </div>

      <!-- Action Button Row -->
      <div style="display: flex; justify: flex-end; gap: 14px;">
        <button type="button" onclick="saveAdminThemeEventConfig()" style="padding: 12px 28px; border-radius: 10px; background: var(--accent); color: #ffffff; border: none; font-size: 14px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 16px var(--accent-glow);">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Lưu Cấu Hình Giao Diện & Sự Kiện
        </button>
      </div>

    </div>
  `;
}

function updateThemePreviewColor(seasonKey) {
  const configMap = {
    autumn: {
      color: '#f59e0b',
      title: 'Giao diện Mùa Thu (Amber Autumn)',
      badge: 'Phiên bản Mùa Thu 3.0',
      eventTitle: 'Sự Kiện Mùa Thu - Tri Ân Khách Hàng EIGU Platform',
    },
    winter: {
      color: '#38bdf8',
      title: 'Giao diện Mùa Đông (Ice Cyan)',
      badge: 'Phiên bản Mùa Đông 3.0',
      eventTitle: 'Sự Kiện Mùa Đông - Chào Đón Giáng Sinh & Năm Mới EIGU Platform',
    },
    spring: {
      color: '#ec4899',
      title: 'Giao diện Mùa Xuân (Sakura Pink)',
      badge: 'Phiên bản Mùa Xuân 3.0',
      eventTitle: 'Sự Kiện Mùa Xuân - Chào Tết Giáp Thìn EIGU Platform',
    },
    summer: {
      color: '#22c55e',
      title: 'Giao diện Mùa Hè (Emerald Summer)',
      badge: 'Phiên bản Mùa Hè 3.0',
      eventTitle: 'Sự Kiện Mùa Hè - Bứt Phá Doanh Số MMO EIGU Platform',
    },
  };

  const selected = configMap[seasonKey] || configMap.autumn;

  const hexInput = document.getElementById('theme-primary-color');
  const pickerInput = document.getElementById('theme-color-picker');
  const titleInput = document.getElementById('theme-season-title');
  const badgeInput = document.getElementById('theme-badge-text');
  const eventTitleInput = document.getElementById('theme-event-title');

  if (hexInput) hexInput.value = selected.color;
  if (pickerInput) pickerInput.value = selected.color;
  if (titleInput) titleInput.value = selected.title;
  if (badgeInput) badgeInput.value = selected.badge;
  if (eventTitleInput) eventTitleInput.value = selected.eventTitle;
}

async function saveAdminThemeEventConfig() {
  const seasonEl = document.querySelector('input[name="themeSeason"]:checked');
  const seasonTitle = document.getElementById('theme-season-title')?.value || '';
  const badgeText = document.getElementById('theme-badge-text')?.value || '';
  const primaryColor = document.getElementById('theme-primary-color')?.value || '#f59e0b';

  const isEventActive = document.getElementById('theme-event-active')?.checked || false;
  const eventTitle = document.getElementById('theme-event-title')?.value || '';
  const eventSubtitle = document.getElementById('theme-event-subtitle')?.value || '';
  const eventBannerUrl = document.getElementById('theme-event-banner-url')?.value || '';
  const eventButtonText = document.getElementById('theme-event-button-text')?.value || '';
  const eventButtonLink = document.getElementById('theme-event-button-link')?.value || '';
  const eventNotice = document.getElementById('theme-event-notice')?.value || '';

  const payload = {
    season: seasonEl ? seasonEl.value : 'autumn',
    seasonTitle,
    badgeText,
    primaryColor,
    isEventActive,
    eventTitle,
    eventSubtitle,
    eventBannerUrl,
    eventButtonText,
    eventButtonLink,
    eventNotice,
  };

  try {
    const res = await apiFetch('/theme-event', {
      method: 'PATCH',
      body: payload,
    });

    if (res && (res.success || res.data)) {
      cachedThemeEventConfig = res.data || payload;
      if (typeof showToast === 'function') {
        showToast('Thành công', 'Đã cập nhật Giao diện Bốn Mùa & Popup Sự Kiện!', 'success');
      } else {
        alert('Đã cập nhật Giao diện & Sự kiện thành công!');
      }
      renderThemeEventForm(res.data || payload);
    } else {
      if (typeof showToast === 'function') showToast('Lỗi', res?.message || 'Cập nhật thất bại', 'error');
      else alert(`Lỗi: ${res?.message || 'Cập nhật thất bại'}`);
    }
  } catch (err) {
    console.error('Lỗi khi lưu ThemeEvent:', err);
    if (typeof showToast === 'function') showToast('Lỗi', err.message || 'Không thể lưu cấu hình', 'error');
    else alert('Lỗi: ' + (err.message || 'Không thể lưu cấu hình'));
  }
}

// Global Exports
window.loadAdminThemeEventData = loadAdminThemeEventData;
window.saveAdminThemeEventConfig = saveAdminThemeEventConfig;
window.updateThemePreviewColor = updateThemePreviewColor;
