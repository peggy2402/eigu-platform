/**
 * EIGU Desktop Client - Admin Pricing Management Module (Dynamic Pricing Engine)
 * Strictly restricted to Admin users (role === 'admin')
 */

let cachedAdminBadges = [];
let cachedAdminModules = [];

const DEFAULT_EIGU_MODULES = [
  {
    id: 'mod-cut',
    slug: 'cut',
    name: 'Tự động cắt video',
    tagline: 'Phân đoạn video 1-20 phút, silence detection & tối ưu 9:16',
    icon: 'Scissors',
    isActive: true,
    sortOrder: 0,
    tiers: [
      {
        id: 'tier-cut-trial',
        code: 'trial',
        label: 'Trial',
        tagline: 'Gói trải nghiệm miễn phí 7 ngày',
        price: 0,
        originalPrice: 0,
        discount: 0,
        formattedPrice: 'Miễn phí',
        formattedOriginalPrice: null,
        billingPeriod: 'trial',
        trialDays: 7,
        machines: 1,
        threads: 2,
        resolution: '720p',
        badge: 'TRẢI NGHIỆM MIỄN PHÍ',
        badgeId: null,
        isActive: true,
        sortOrder: 0,
        features: ['Cắt video 1-20 phút', 'Silence Detection', 'Tối ưu định dạng 9:16', 'Xuất file 720p HD']
      },
      {
        id: 'tier-cut-pro',
        code: 'pro',
        label: 'Pro',
        tagline: 'Dành cho Creator & Reuper chuyên nghiệp',
        price: 350000,
        originalPrice: 580000,
        discount: 40,
        formattedPrice: '350.000đ',
        formattedOriginalPrice: '580.000đ',
        billingPeriod: 'monthly',
        trialDays: 0,
        machines: 1,
        threads: 8,
        resolution: '1080p/2K/4K',
        badge: 'PHỔ BIẾN NHẤT',
        badgeId: null,
        isActive: true,
        sortOrder: 1,
        features: ['Tối ưu GPU Hardware Accelerate', 'Export 1080p/2K/4K siêu nét', 'Không giới hạn thời lượng video', 'Hỗ trợ kỹ thuật ưu tiên 24/7']
      }
    ]
  },
  {
    id: 'mod-ai-video',
    slug: 'ai-video',
    name: 'Tạo video AI',
    tagline: 'Tự động sinh kịch bản, giọng đọc đa ngôn ngữ & dựng video AI',
    icon: 'Sparkles',
    isActive: true,
    sortOrder: 1,
    tiers: [
      {
        id: 'tier-ai-pro',
        code: 'pro',
        label: 'Pro',
        tagline: 'Gói chuyên sâu cho làm kênh Affiliate & MMO',
        price: 450000,
        originalPrice: 750000,
        discount: 40,
        formattedPrice: '450.000đ',
        formattedOriginalPrice: '750.000đ',
        billingPeriod: 'monthly',
        trialDays: 0,
        machines: 1,
        threads: 8,
        resolution: '1080p/2K/4K',
        badge: 'GIẢM 40%',
        badgeId: null,
        isActive: true,
        sortOrder: 0,
        features: ['Tạo video từ ý tưởng / URL văn bản', 'Lồng tiếng AI 50+ ngôn ngữ tự nhiên', 'Thư viện mẫu video độc quyền', 'Xuất bản trực tiếp lên kênh']
      }
    ]
  },
  {
    id: 'mod-reup',
    slug: 'reup',
    name: 'Tạo video Reup',
    tagline: 'Lách bản quyền MD5 decimation, noise injection & audio pitch shifter',
    icon: 'Upload',
    isActive: true,
    sortOrder: 2,
    tiers: [
      {
        id: 'tier-reup-pro',
        code: 'pro',
        label: 'Pro',
        tagline: 'Công cụ lách bản quyền TikTok, YouTube Shorts & Reels',
        price: 390000,
        originalPrice: 650000,
        discount: 40,
        formattedPrice: '390.000đ',
        formattedOriginalPrice: '650.000đ',
        billingPeriod: 'monthly',
        trialDays: 0,
        machines: 1,
        threads: 8,
        resolution: '1080p',
        badge: 'HOT KHUYÊN DÙNG',
        badgeId: null,
        isActive: true,
        sortOrder: 0,
        features: ['Bypass Content ID TikTok & Meta', 'Audio Frequency & Pitch Shift', 'Khung hình động & Watermark Masking', 'Tối ưu Render GPU đa luồng']
      }
    ]
  },
  {
    id: 'mod-hot-niche',
    slug: 'hot-niche',
    name: 'Tìm ngách hot',
    tagline: 'Quét từ khóa xu hướng, sản phẩm bán chạy & phân tích đối thủ',
    icon: 'TrendingUp',
    isActive: true,
    sortOrder: 3,
    tiers: [
      {
        id: 'tier-niche-pro',
        code: 'pro',
        label: 'Pro',
        tagline: 'Báo cáo xu hướng thời gian thực',
        price: 290000,
        originalPrice: 480000,
        discount: 40,
        formattedPrice: '290.000đ',
        formattedOriginalPrice: '480.000đ',
        billingPeriod: 'monthly',
        trialDays: 0,
        machines: 1,
        threads: 4,
        resolution: '-',
        badge: 'BEST VALUE',
        badgeId: null,
        isActive: true,
        sortOrder: 0,
        features: ['Quét ngách hot TikTok Beta & Shop', 'Phân tích từ khóa tím kiếm tăng vọt', 'Xuất dữ liệu Excel / JSON hàng loạt', 'Cập nhật chỉ số theo giờ']
      }
    ]
  },
  {
    id: 'mod-bulk-download',
    slug: 'bulk-download',
    name: 'Tải video hàng loạt',
    tagline: 'Tải video hàng loạt không watermark từ TikTok, Douyin, YouTube, Facebook',
    icon: 'DownloadCloud',
    isActive: true,
    sortOrder: 4,
    tiers: [
      {
        id: 'tier-dl-pro',
        code: 'pro',
        label: 'Pro',
        tagline: 'Tốc độ tải cao cấp với Proxy xoay',
        price: 250000,
        originalPrice: 400000,
        discount: 37,
        formattedPrice: '250.000đ',
        formattedOriginalPrice: '400.000đ',
        billingPeriod: 'monthly',
        trialDays: 0,
        machines: 1,
        threads: 16,
        resolution: 'Full HD',
        badge: 'CỰC NHANH',
        badgeId: null,
        isActive: true,
        sortOrder: 0,
        features: ['Tải toàn bộ Kênh / Playlist 1-Click', 'Bỏ logo watermark 100%', 'Bypass Rate Limit IP với Proxy', 'Tải nhạc MP3 & Subtitle đi kèm']
      }
    ]
  },
  {
    id: 'mod-workflow',
    slug: 'workflow',
    name: 'Tạo workflow tự động',
    tagline: 'Kết nối tự động hóa chuỗi quy trình tải, xử lý và upload video',
    icon: 'RefreshCw',
    isActive: true,
    sortOrder: 5,
    tiers: [
      {
        id: 'tier-wf-enterprise',
        code: 'enterprise',
        label: 'Enterprise',
        tagline: 'Dành cho Studio & Team MMO quy mô lớn',
        price: 890000,
        originalPrice: 1480000,
        discount: 40,
        formattedPrice: '890.000đ',
        formattedOriginalPrice: '1.480.000đ',
        billingPeriod: 'monthly',
        trialDays: 0,
        machines: 0,
        threads: 0,
        resolution: '4K Ultra HD',
        badge: 'DOANH NGHIỆP',
        badgeId: null,
        isActive: true,
        sortOrder: 0,
        features: ['Không giới hạn số máy & số luồng', 'Kịch bản Workflow tùy chỉnh linh hoạt', 'Tích hợp API Trạm xử lý riêng', 'Quản lý phân quyền Team & Audit Log']
      }
    ]
  }
];

async function loadAdminPricingData() {
  const container = document.getElementById('admin-pricing-container');
  if (!container) return;

  // Role check: Admin only (show warning if non-admin)
  if (typeof userProfile !== 'undefined' && userProfile && userProfile.role && userProfile.role !== 'admin') {
    container.innerHTML = `
      <div style="text-align:center; padding:50px 20px; color:#ef4444; background:var(--bg-primary); border:1px solid rgba(239,68,68,0.3); border-radius:12px;">
        <h4 style="margin-bottom:8px; font-size:16px;">Quyền truy cập bị từ chối</h4>
        <p style="font-size:13px; color:var(--text-secondary); margin:0;">Phân hệ Quản lý Bảng giá chỉ dành riêng cho Quản trị viên hệ thống (Role: Admin).</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-muted);">Đang kết nối Database để tải Bảng giá...</div>';

  try {
    const data = await apiFetch('/pricing/admin');
    if (!data || !data.success || !Array.isArray(data.modules) || data.modules.length === 0) {
      // Use full default EIGU modules if DB returns empty
      cachedAdminModules = DEFAULT_EIGU_MODULES;
      cachedAdminBadges = data.badges || [];
      updateDynamicFilterControls(DEFAULT_EIGU_MODULES);
      renderAdminPricingList(DEFAULT_EIGU_MODULES, cachedAdminBadges);
      return;
    }

    cachedAdminModules = data.modules;
    cachedAdminBadges = data.badges || [];
    updateDynamicFilterControls(data.modules);
    renderAdminPricingList(data.modules, data.badges || []);
  } catch (err) {
    console.warn('Không thể kết nối API Pricing Server, chuyển sang chế độ dữ liệu mặc định:', err);
    cachedAdminModules = DEFAULT_EIGU_MODULES;
    cachedAdminBadges = [];
    updateDynamicFilterControls(DEFAULT_EIGU_MODULES);
    renderAdminPricingList(DEFAULT_EIGU_MODULES, []);
  }
}

function updateDynamicFilterControls(modules) {
  const select = document.getElementById('pricing-module-filter-select');
  const pillsContainer = document.getElementById('pricing-module-pills');

  if (select) {
    const currentVal = select.value || 'all';
    let optionsHtml = '<option value="all">Tất cả Mô-đun</option>';
    modules.forEach(m => {
      optionsHtml += `<option value="${escapeHtml(m.slug)}" ${currentVal === m.slug ? 'selected' : ''}>${escapeHtml(m.name)}</option>`;
    });
    select.innerHTML = optionsHtml;
  }

  if (pillsContainer) {
    let pillsHtml = `<button type="button" class="chat-filter-pill ${activePricingFilterSlug === 'all' ? 'active' : ''}" onclick="setPricingModulePill('all', this)">Tất cả Mô-đun</button>`;
    modules.forEach(m => {
      const isActive = activePricingFilterSlug === m.slug;
      pillsHtml += `<button type="button" class="chat-filter-pill ${isActive ? 'active' : ''}" onclick="setPricingModulePill('${escapeHtml(m.slug)}', this)">${escapeHtml(m.name)}</button>`;
    });
    pillsContainer.innerHTML = pillsHtml;
  }
}

function renderAdminPricingList(modules, badges) {
  const container = document.getElementById('admin-pricing-container');
  if (!container) return;

  if (modules.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; background:var(--bg-primary); border:1px dashed var(--border-color); border-radius:12px;">
        <p style="color:var(--text-muted); margin-bottom:12px;">Chưa có mô-đun công cụ nào trong hệ thống.</p>
        <button class="btn-primary" onclick="openPricingModuleModal()" style="padding:8px 16px; font-size:13px; width:auto;">Thêm Mô-đun Đầu Tiên</button>
      </div>
    `;
    return;
  }

  let html = `<div style="display:flex; flex-direction:column; gap:28px;">`;

  modules.forEach(mod => {
    html += `
      <div style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:14px; padding:22px; box-shadow:0 4px 16px rgba(0,0,0,0.15);">
        <!-- Module Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px; padding-bottom:14px; border-bottom:1px solid var(--border-color);">
          <div>
            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
              <h4 style="margin:0; font-size:18px; font-weight:800; color:var(--text-primary);">${escapeHtml(mod.name)}</h4>
              <span style="font-size:11px; font-family:var(--font-mono); background:rgba(245,158,11,0.15); color:var(--accent); border:1px solid rgba(245,158,11,0.3); padding:2px 8px; border-radius:6px; font-weight:700;">slug: ${escapeHtml(mod.slug)}</span>
              <span style="font-size:11px; padding:3px 10px; border-radius:20px; background:${mod.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}; color:${mod.isActive ? '#22c55e' : '#ef4444'}; font-weight:700;">
                ${mod.isActive ? 'ĐANG KÍCH HOẠT' : 'ĐANG ẨN'}
              </span>
            </div>
            <p style="margin:6px 0 0; font-size:13px; color:var(--text-secondary);">${escapeHtml(mod.tagline || 'Chưa có mô tả ngắn')}</p>
          </div>

          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn-outline" style="padding:6px 12px; font-size:12px; border-radius:6px; margin:0;" onclick="openPricingTierModal('${mod.id}')">
              Thêm Gói mới
            </button>
            <button class="btn-outline" style="padding:6px 12px; font-size:12px; border-radius:6px; margin:0;" onclick="openPricingModuleModalById('${mod.id}')">
              Sửa Mô-đun
            </button>
            <button class="btn-outline" style="padding:6px 12px; font-size:12px; border-radius:6px; color:#ef4444; border-color:rgba(239,68,68,0.4); margin:0;" onclick="deletePricingModule('${mod.id}', '${escapeHtml(mod.name)}')">
              Xóa
            </button>
          </div>
        </div>

        <!-- Tiers Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:16px;">
    `;

    if (!mod.tiers || mod.tiers.length === 0) {
      html += `
        <div style="grid-column: 1 / -1; padding:20px; text-align:center; color:var(--text-muted); background:var(--bg-card); border:1px dashed var(--border-color); border-radius:10px; font-size:13px;">
          Mô-đun này chưa có gói dịch vụ nào. Click <strong>"Thêm Gói mới"</strong> để khởi tạo gói giá đầu tiên.
        </div>
      `;
    } else {
      mod.tiers.forEach(tier => {
        const isTrial = tier.code === 'trial';
        html += `
          <div style="background:var(--bg-card); border:1px solid ${tier.isActive ? 'var(--border-color)' : 'rgba(239,68,68,0.3)'}; border-radius:12px; padding:18px; display:flex; flex-direction:column; justify-content:space-between; position:relative; opacity:${tier.isActive ? '1' : '0.65'};">
            ${tier.badge ? `<span style="position:absolute; top:12px; right:12px; font-size:10px; background:linear-gradient(135deg, #f59e0b, #d97706); color:#fff; padding:2px 8px; border-radius:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; box-shadow:0 2px 8px rgba(245,158,11,0.4);">${escapeHtml(tier.badge)}</span>` : ''}

            <div>
              <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                <h5 style="margin:0; font-size:16px; font-weight:800; color:var(--text-primary);">${escapeHtml(tier.label)}</h5>
                <span style="font-size:10px; font-family:var(--font-mono); color:var(--text-muted); background:var(--bg-primary); padding:1px 5px; border-radius:4px;">(${escapeHtml(tier.code)})</span>
              </div>
              <div style="font-size:12px; color:var(--text-muted); margin-bottom:14px; min-height:18px;">${escapeHtml(tier.tagline || '-')}</div>

              <!-- Price Box -->
              <div style="background:var(--bg-primary); padding:12px; border-radius:8px; margin-bottom:14px; border:1px solid var(--border-color);">
                <div style="font-size:10px; color:var(--text-muted); font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">GIÁ BÁN NIÊM YẾT</div>
                <div style="font-size:20px; font-weight:900; color:var(--accent); margin:2px 0;">${tier.price === 0 ? 'Miễn phí' : tier.formattedPrice}</div>
                ${tier.formattedOriginalPrice ? `<div style="font-size:11px; color:var(--text-muted); text-decoration:line-through;">Giá gốc: ${tier.formattedOriginalPrice}</div>` : ''}
                ${tier.discount > 0 ? `<div style="font-size:11px; color:#22c55e; font-weight:700; margin-top:2px;">Giảm giá: ${tier.discount}%</div>` : ''}
              </div>

              <!-- Specs Box -->
              <div style="font-size:12px; color:var(--text-secondary); display:flex; flex-direction:column; gap:5px; margin-bottom:14px; background:var(--bg-primary); padding:10px; border-radius:8px;">
                <div style="display:flex; justify-content:space-between;"><span>Số máy dùng:</span> <strong>${tier.machines === 0 ? 'Không giới hạn' : tier.machines + ' máy'}</strong></div>
                <div style="display:flex; justify-content:space-between;"><span>Số luồng xử lý:</span> <strong>${tier.threads === 0 ? 'Không giới hạn' : tier.threads + ' luồng'}</strong></div>
                <div style="display:flex; justify-content:space-between;"><span>Độ phân giải:</span> <strong>${escapeHtml(tier.resolution)}</strong></div>
              </div>

              <!-- Features List -->
              ${tier.features && tier.features.length > 0 ? `
                <div style="font-size:12px; color:var(--text-secondary); display:flex; flex-direction:column; gap:4px; margin-bottom:16px; padding-left:4px;">
                  ${tier.features.map(f => `<div style="display:flex; align-items:center; gap:6px;"><span style="color:#22c55e; font-weight:800;">-</span> <span>${escapeHtml(f)}</span></div>`).join('')}
                </div>
              ` : ''}
            </div>

            <!-- Actions Footer -->
            <div style="display:flex; gap:8px; margin-top:10px;">
              <button class="btn-outline" style="flex:1; padding:7px; font-size:12px; border-radius:6px; text-align:center; margin:0;" onclick="openPricingTierModalById('${mod.id}', '${tier.id}')">
                Cấu hình Gói
              </button>
              <button class="btn-outline" style="padding:7px 10px; font-size:12px; border-radius:6px; color:#ef4444; border-color:rgba(239,68,68,0.4); margin:0;" onclick="deletePricingTier('${tier.id}', '${escapeHtml(tier.label)}')">
                Xóa
              </button>
            </div>
          </div>
        `;
      });
    }

    html += `</div></div>`;
  });

  html += `</div>`;
  container.innerHTML = html;
}

// --- MODULE CRUD MODAL HANDLERS ---

function openPricingModuleModal(mod = null) {
  const modal = document.getElementById('pricing-module-modal');
  if (!modal) return;

  document.getElementById('pricing-module-modal-title').textContent = mod ? 'Chỉnh Sửa Mô-đun Bảng Giá' : 'Tạo Mô-đun Bảng Giá Mới';
  document.getElementById('pm-id').value = mod ? mod.id : '';
  document.getElementById('pm-name').value = mod ? mod.name : '';
  document.getElementById('pm-slug').value = mod ? mod.slug : '';
  document.getElementById('pm-tagline').value = mod ? mod.tagline || '' : '';
  document.getElementById('pm-icon').value = mod ? mod.icon || '' : '';
  document.getElementById('pm-is-active').checked = mod ? mod.isActive : true;
  document.getElementById('pm-sort-order').value = mod ? mod.sortOrder : 0;

  modal.classList.remove('hidden');
}

function openPricingModuleModalById(modId) {
  const mod = cachedAdminModules.find(m => m.id === modId);
  if (mod) openPricingModuleModal(mod);
}

function closePricingModuleModal() {
  const modal = document.getElementById('pricing-module-modal');
  if (modal) modal.classList.add('hidden');
}

async function handleSavePricingModule(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const id = document.getElementById('pm-id').value;
  const name = document.getElementById('pm-name').value.trim();
  const slug = document.getElementById('pm-slug').value.trim();
  const tagline = document.getElementById('pm-tagline').value.trim();
  const icon = document.getElementById('pm-icon').value.trim();
  const isActive = document.getElementById('pm-is-active').checked;
  const sortOrder = parseInt(document.getElementById('pm-sort-order').value, 10) || 0;

  if (!name || !slug) {
    if (typeof showToast === 'function') showToast('Lỗi', 'Vui lòng điền đầy đủ Tên và Slug mô-đun', 'error');
    else alert('Vui lòng điền đầy đủ Tên và Slug mô-đun');
    return false;
  }

  const payload = id ? { name, tagline, icon, isActive, sortOrder } : { name, slug, tagline, icon, isActive, sortOrder };

  const updateLocalRamModule = () => {
    const existingIdx = cachedAdminModules.findIndex(m => m.id === id || m.slug === slug);
    const updatedMod = {
      id: id || `mod-${Date.now()}`,
      name,
      slug,
      tagline,
      icon,
      isActive,
      sortOrder,
      tiers: existingIdx >= 0 && cachedAdminModules[existingIdx].tiers ? cachedAdminModules[existingIdx].tiers : []
    };
    if (existingIdx >= 0) {
      cachedAdminModules[existingIdx] = { ...cachedAdminModules[existingIdx], ...updatedMod };
    } else {
      cachedAdminModules.push(updatedMod);
    }
  };

  const token = localStorage.getItem('accessToken');
  // const baseUrl = typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : 'http://localhost:3001/api';
  const baseUrl = typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : 'https://api.eigu.site/api';

  try {
    const url = id ? `${baseUrl}/pricing/modules/${id}` : `${baseUrl}/pricing/modules`;
    const method = id ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok && data.success) {
      if (typeof showToast === 'function') showToast('Thành công', id ? 'Đã cập nhật Mô-đun!' : 'Đã tạo Mô-đun mới!', 'success');
      updateLocalRamModule();
      updateDynamicFilterControls(cachedAdminModules);
      closePricingModuleModal();
      filterAdminPricingModules();
    } else {
      if (typeof showToast === 'function') showToast('Lỗi', data.message || 'Thao tác thất bại', 'error');
      else alert(`Lỗi: ${data.message || 'Thao tác thất bại'}`);
    }
  } catch (err) {
    console.warn('Lỗi API backend (chế độ offline):', err);
    updateLocalRamModule();
    updateDynamicFilterControls(cachedAdminModules);
    if (typeof showToast === 'function') showToast('Thành công', id ? 'Đã cập nhật Mô-đun (Chế độ xem trước)' : 'Đã tạo Mô-đun mới', 'success');
    closePricingModuleModal();
    filterAdminPricingModules();
  }

  return false;
}

async function deletePricingModule(modId, modName) {
  if (!confirm(`Bạn có chắc chắn muốn xóa Mô-đun "${modName}" và tất cả các gói liên quan?`)) return;

  const token = localStorage.getItem('accessToken');
  // const baseUrl = typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : 'http://localhost:3001/api';
  const baseUrl = typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : 'https://api.eigu.site/api';

  try {
    const res = await fetch(`${baseUrl}/pricing/modules/${modId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      if (typeof showToast === 'function') showToast('Đã xóa', `Đã xóa mô-đun "${modName}"`, 'success');
      loadAdminPricingData();
    } else {
      const data = await res.json();
      alert(`Không thể xóa: ${data.message || 'Lỗi server'}`);
    }
  } catch (err) {
    alert(`Lỗi kết nối: ${err.message}`);
  }
}

// --- TIER CRUD MODAL HANDLERS ---

function populateBadgeDropdown(selectedBadgeId = '') {
  const select = document.getElementById('pt-badge-id');
  if (!select) return;

  select.innerHTML = '<option value="">-- Không sử dụng Badge --</option>';
  cachedAdminBadges.forEach(b => {
    select.innerHTML += `<option value="${b.id}" ${b.id === selectedBadgeId ? 'selected' : ''}>${escapeHtml(b.name)} (${escapeHtml(b.code)})</option>`;
  });
}

function openPricingTierModal(moduleId, tierObj = null) {
  const modal = document.getElementById('pricing-tier-modal');
  if (!modal) return;

  populateBadgeDropdown(tierObj ? tierObj.badgeId : '');

  document.getElementById('pricing-tier-modal-title').textContent = tierObj ? `Cấu Hình Gói: ${tierObj.label}` : 'Thêm Gói Dịch Vụ Mới';
  document.getElementById('pt-id').value = tierObj ? tierObj.id : '';
  document.getElementById('pt-module-id').value = moduleId;
  document.getElementById('pt-code').value = tierObj ? tierObj.code : '';
  document.getElementById('pt-label').value = tierObj ? tierObj.label : '';
  document.getElementById('pt-tagline').value = tierObj ? tierObj.tagline || '' : '';
  document.getElementById('pt-price').value = tierObj ? tierObj.price : '';
  document.getElementById('pt-discount').value = tierObj ? tierObj.discount || 0 : 0;
  document.getElementById('pt-original-price').value = tierObj ? tierObj.originalPrice || 0 : 0;
  document.getElementById('pt-machines').value = tierObj ? tierObj.machines : 1;
  document.getElementById('pt-threads').value = tierObj ? tierObj.threads : 4;
  document.getElementById('pt-resolution').value = tierObj ? tierObj.resolution || '1080p' : '1080p';
  document.getElementById('pt-features-text').value = tierObj && tierObj.features ? tierObj.features.join('\n') : '';
  document.getElementById('pt-is-active').checked = tierObj ? tierObj.isActive : true;
  document.getElementById('pt-sort-order').value = tierObj ? tierObj.sortOrder : 0;

  modal.classList.remove('hidden');
}

function openPricingTierModalById(moduleId, tierId) {
  const mod = cachedAdminModules.find(m => m.id === moduleId);
  if (!mod) return;
  const tier = (mod.tiers || []).find(t => t.id === tierId);
  if (tier) openPricingTierModal(moduleId, tier);
}

function closePricingTierModal() {
  const modal = document.getElementById('pricing-tier-modal');
  if (modal) modal.classList.add('hidden');
}

function autoCalculatePricing() {
  const priceInput = document.getElementById('pt-price');
  const discInput = document.getElementById('pt-discount');
  const origInput = document.getElementById('pt-original-price');

  const price = parseInt(priceInput.value, 10) || 0;
  const disc = parseInt(discInput.value, 10) || 0;

  if (disc > 0 && price > 0) {
    const calculatedOrig = Math.round(price / (1 - disc / 100));
    origInput.value = calculatedOrig;
  } else {
    origInput.value = 0;
  }
}

async function handleSavePricingTier(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const id = document.getElementById('pt-id').value;
  const moduleId = document.getElementById('pt-module-id').value;
  const code = document.getElementById('pt-code').value.trim();
  const label = document.getElementById('pt-label').value.trim();
  const tagline = document.getElementById('pt-tagline').value.trim();
  const price = parseInt(document.getElementById('pt-price').value, 10) || 0;
  const discount = parseInt(document.getElementById('pt-discount').value, 10) || 0;
  let originalPrice = parseInt(document.getElementById('pt-original-price').value, 10) || 0;
  if (originalPrice === 0 && discount > 0 && price > 0) {
    originalPrice = Math.round(price / (1 - discount / 100));
  }
  const machines = parseInt(document.getElementById('pt-machines').value, 10) || 1;
  const threads = parseInt(document.getElementById('pt-threads').value, 10) || 4;
  const resolution = document.getElementById('pt-resolution').value.trim();
  const badgeId = document.getElementById('pt-badge-id').value || null;
  const isActive = document.getElementById('pt-is-active').checked;
  const sortOrder = parseInt(document.getElementById('pt-sort-order').value, 10) || 0;

  const rawFeatures = document.getElementById('pt-features-text').value;
  const features = rawFeatures.split('\n').map(s => s.trim()).filter(Boolean);

  if (!code || !label) {
    if (typeof showToast === 'function') showToast('Lỗi', 'Vui lòng điền Mã gói và Tên gói', 'error');
    else alert('Vui lòng điền Mã gói và Tên gói');
    return false;
  }

  const payload = id ? {
    label,
    tagline,
    price,
    discount,
    originalPrice,
    machines,
    threads,
    resolution,
    badgeId,
    isActive,
    sortOrder,
    features
  } : {
    moduleId,
    code,
    label,
    tagline,
    price,
    discount,
    originalPrice,
    machines,
    threads,
    resolution,
    badgeId,
    isActive,
    sortOrder,
    features
  };

  const updateLocalRamTier = () => {
    const mod = cachedAdminModules.find(m => m.id === moduleId);
    if (mod) {
      if (!mod.tiers) mod.tiers = [];
      const existingIdx = mod.tiers.findIndex(t => t.id === id);
      const formattedPrice = price === 0 ? 'Miễn phí' : price.toLocaleString('vi-VN') + 'đ';
      const formattedOriginalPrice = originalPrice > price ? originalPrice.toLocaleString('vi-VN') + 'đ' : null;
      let badgeName = null;
      if (badgeId) {
        const foundBadge = cachedAdminBadges.find(b => b.id === badgeId);
        if (foundBadge) badgeName = foundBadge.name;
      }
      if (!badgeName && discount > 0) badgeName = `GIẢM ${discount}%`;

      const updatedTier = {
        id: id || `tier-${Date.now()}`,
        code,
        label,
        tagline,
        price,
        originalPrice,
        discount,
        formattedPrice,
        formattedOriginalPrice,
        machines,
        threads,
        resolution,
        badge: badgeName,
        badgeId,
        isActive,
        sortOrder,
        features
      };

      if (existingIdx >= 0) {
        mod.tiers[existingIdx] = { ...mod.tiers[existingIdx], ...updatedTier };
      } else {
        mod.tiers.push(updatedTier);
      }
    }
  };

  const token = localStorage.getItem('accessToken');
  // const baseUrl = typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : 'http://localhost:3001/api';
  const baseUrl = typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : 'https://api.eigu.site/api';

  try {
    const url = id ? `${baseUrl}/pricing/tiers/${id}` : `${baseUrl}/pricing/tiers`;
    const method = id ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok && data.success) {
      if (typeof showToast === 'function') showToast('Thành công', id ? 'Đã cập nhật Gói!' : 'Đã tạo Gói dịch vụ mới!', 'success');
      updateLocalRamTier();
      closePricingTierModal();
      filterAdminPricingModules();
    } else {
      if (typeof showToast === 'function') showToast('Lỗi', data.message || 'Thao tác thất bại', 'error');
      else alert(`Lỗi: ${data.message || 'Thao tác thất bại'}`);
    }
  } catch (err) {
    console.warn('Lỗi API backend (chế độ offline):', err);
    updateLocalRamTier();
    if (typeof showToast === 'function') showToast('Thành công', id ? 'Đã cập nhật Gói (Chế độ xem trước)' : 'Đã tạo Gói mới', 'success');
    closePricingTierModal();
    filterAdminPricingModules();
  }

  return false;
}

async function deletePricingTier(tierId, tierLabel) {
  if (!confirm(`Bạn có chắc chắn muốn xóa Gói "${tierLabel}"?`)) return;

  const token = localStorage.getItem('accessToken');
  // const baseUrl = typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : 'http://localhost:3001/api';
  const baseUrl = typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : 'https://api.eigu.site/api';

  try {
    const res = await fetch(`${baseUrl}/pricing/tiers/${tierId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      if (typeof showToast === 'function') showToast('Đã xóa', `Đã xóa gói "${tierLabel}"`, 'success');
      loadAdminPricingData();
    } else {
      const data = await res.json();
      alert(`Không thể xóa: ${data.message || 'Lỗi server'}`);
    }
  } catch (err) {
    alert(`Lỗi kết nối: ${err.message}`);
  }
}

// --- BADGE CRUD MODAL HANDLERS ---

function openPricingBadgeModal() {
  const modal = document.getElementById('pricing-badge-modal');
  if (!modal) return;
  document.getElementById('pb-code').value = '';
  document.getElementById('pb-name').value = '';
  modal.classList.remove('hidden');
}

function closePricingBadgeModal() {
  const modal = document.getElementById('pricing-badge-modal');
  if (modal) modal.classList.add('hidden');
}

async function handleSavePricingBadge(e) {
  e.preventDefault();
  const code = document.getElementById('pb-code').value.trim();
  const name = document.getElementById('pb-name').value.trim();

  if (!code || !name) return alert('Vui lòng điền đầy đủ Mã Badge và Tên hiển thị');

  const token = localStorage.getItem('accessToken');
  // const baseUrl = typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : 'http://localhost:3001/api';
  const baseUrl = typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : 'https://api.eigu.site/api';

  try {
    const res = await fetch(`${baseUrl}/pricing/badges`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code, name })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      if (typeof showToast === 'function') showToast('Thành công', `Đã tạo Badge "${name}"`, 'success');
      closePricingBadgeModal();
      loadAdminPricingData();
    } else {
      alert(`Lỗi: ${data.message || 'Thất bại'}`);
    }
  } catch (err) {
    alert(`Lỗi kết nối: ${err.message}`);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// --- MODULE FILTERING & SEARCH HANDLERS ---

let activePricingFilterSlug = 'all';

function setPricingModulePill(slug, btnEl) {
  activePricingFilterSlug = slug;
  const select = document.getElementById('pricing-module-filter-select');
  if (select) select.value = slug;

  const container = document.getElementById('pricing-module-pills');
  if (container) {
    container.querySelectorAll('.chat-filter-pill').forEach(p => p.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
  }

  filterAdminPricingModules();
}

function filterAdminPricingModules() {
  const q = (document.getElementById('pricing-search-input')?.value || '').toLowerCase().trim();
  const selectSlug = document.getElementById('pricing-module-filter-select')?.value || 'all';
  const filterSlug = activePricingFilterSlug !== 'all' ? activePricingFilterSlug : selectSlug;

  if (!cachedAdminModules || cachedAdminModules.length === 0) return;

  const filtered = cachedAdminModules.filter(mod => {
    // 1. Filter by Module Slug
    if (filterSlug !== 'all' && mod.slug !== filterSlug) {
      return false;
    }

    // 2. Filter by Search Query
    if (q !== '') {
      const matchModName = (mod.name || '').toLowerCase().includes(q);
      const matchModSlug = (mod.slug || '').toLowerCase().includes(q);
      const matchModTagline = (mod.tagline || '').toLowerCase().includes(q);
      const matchTiers = (mod.tiers || []).some(t =>
        (t.label || '').toLowerCase().includes(q) ||
        (t.code || '').toLowerCase().includes(q) ||
        (t.tagline || '').toLowerCase().includes(q) ||
        (t.features || []).some(f => f.toLowerCase().includes(q))
      );

      return matchModName || matchModSlug || matchModTagline || matchTiers;
    }

    return true;
  });

  renderAdminPricingList(filtered, cachedAdminBadges);
}
