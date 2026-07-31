/**
 * EIGU Desktop Client - Admin Pricing Management Module
 */

async function loadAdminPricingData() {
  const container = document.getElementById('admin-pricing-container');
  if (!container) return;

  container.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">Đang kết nối Database để tải Bảng giá...</div>';

  try {
    const token = localStorage.getItem('accessToken');
    const baseUrl = typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : 'http://localhost:3001/api';

    const res = await fetch(`${baseUrl}/pricing/admin`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();
    if (!data.success || !Array.isArray(data.modules)) {
      throw new Error('Dữ liệu trả về không hợp lệ');
    }

    renderAdminPricingList(data.modules, data.badges || []);
  } catch (err) {
    console.error('Lỗi tải Admin Pricing:', err);
    container.innerHTML = `
      <div style="text-align:center; padding:30px; color:var(--danger);">
        <p>Không thể tải dữ liệu bảng giá từ API server.</p>
        <button class="btn-primary" onclick="loadAdminPricingData()" style="padding:6px 16px; margin-top:10px; font-size:12px; width:auto;">Thử lại</button>
      </div>
    `;
  }
}

function renderAdminPricingList(modules, badges) {
  const container = document.getElementById('admin-pricing-container');
  if (!container) return;

  if (modules.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">Chưa có mô-đun bảng giá nào.</div>';
    return;
  }

  let html = `<div style="display:flex; flex-direction:column; gap:24px;">`;

  modules.forEach(mod => {
    html += `
      <div style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:12px; padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid var(--border-color);">
          <div>
            <div style="display:flex; alignItems:center; gap:8px;">
              <h4 style="margin:0; font-size:18px; color:var(--text-primary);">${escapeHtml(mod.name)}</h4>
              <span style="font-size:11px; font-family:monospace; background:rgba(99,102,241,0.15); color:var(--accent); padding:2px 8px; border-radius:4px; font-weight:700;">slug: ${escapeHtml(mod.slug)}</span>
            </div>
            <p style="margin:4px 0 0; font-size:13px; color:var(--text-secondary);">${escapeHtml(mod.tagline)}</p>
          </div>
          <span style="font-size:12px; padding:4px 10px; border-radius:6px; background:${mod.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}; color:${mod.isActive ? '#22c55e' : '#ef4444'}; font-weight:700;">
            ${mod.isActive ? 'ĐANG KÍCH HOẠT' : 'ĐANG ẨN'}
          </span>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:16px;">
    `;

    (mod.tiers || []).forEach(tier => {
      html += `
        <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:10px; padding:16px; display:flex; flex-direction:column; justify-content:space-between; position:relative;">
          ${tier.badge ? `<span style="position:absolute; top:10px; right:10px; font-size:10px; background:var(--accent); color:#fff; padding:2px 8px; border-radius:10px; font-weight:800;">${escapeHtml(tier.badge)}</span>` : ''}

          <div>
            <h5 style="margin:0 0 4px; font-size:16px; color:var(--text-primary);">${escapeHtml(tier.label)} (${escapeHtml(tier.code)})</h5>
            <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">${escapeHtml(tier.tagline)}</div>

            <div style="background:var(--bg-primary); padding:10px; border-radius:6px; margin-bottom:12px;">
              <div style="fontSize:11px; color:var(--text-muted);">GIÁ BÁN HIỆN TẠI</div>
              <div style="font-size:18px; font-weight:800; color:var(--accent);">${tier.price === 0 ? 'Miễn phí' : tier.formattedPrice}</div>
              ${tier.formattedOriginalPrice ? `<div style="font-size:11px; color:var(--text-muted); text-decoration:line-through;">Giá gốc: ${tier.formattedOriginalPrice}</div>` : ''}
              ${tier.discount > 0 ? `<div style="font-size:11px; color:#22c55e; font-weight:700;">Giảm giá: ${tier.discount}%</div>` : ''}
            </div>

            <div style="font-size:12px; color:var(--text-secondary); display:flex; flex-direction:column; gap:4px; margin-bottom:12px;">
              <div>Số máy: <strong>${tier.machines === 0 ? 'Không giới hạn' : tier.machines}</strong></div>
              <div>Số luồng: <strong>${tier.threads === 0 ? 'Không giới hạn' : tier.threads}</strong></div>
              <div>Độ phân giải: <strong>${escapeHtml(tier.resolution)}</strong></div>
            </div>
          </div>

          <button class="btn-outline" style="padding:6px 12px; font-size:12px; border-radius:6px; width:100%; text-align:center; margin:0;" onclick="promptEditTierPrice('${tier.id}', ${tier.price}, ${tier.originalPrice || 0}, ${tier.discount || 0})">
            ⚙️ Đổi Giá Bán & Discount
          </button>
        </div>
      `;
    });

    html += `</div></div>`;
  });

  html += `</div>`;
  container.innerHTML = html;
}

async function promptEditTierPrice(tierId, currentPrice, currentOrig, currentDisc) {
  const newPriceStr = prompt('Nhập giá bán mới (VNĐ integer):', currentPrice);
  if (newPriceStr === null) return;
  const newPrice = parseInt(newPriceStr, 10);
  if (isNaN(newPrice) || newPrice < 0) return alert('Giá bán không hợp lệ');

  const newDiscStr = prompt('Nhập phần trăm giảm giá % (Ví dụ: 40 cho 40%, 0 nếu không giảm):', currentDisc);
  if (newDiscStr === null) return;
  const newDisc = parseInt(newDiscStr, 10) || 0;

  let newOrig = currentOrig;
  if (newDisc > 0 && newPrice > 0) {
    newOrig = Math.round(newPrice / (1 - newDisc / 100));
  }

  try {
    const token = localStorage.getItem('accessToken');
    const baseUrl = typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : 'http://localhost:3001/api';

    const res = await fetch(`${baseUrl}/pricing/tiers/${tierId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        price: newPrice,
        originalPrice: newOrig,
        discount: newDisc
      })
    });

    if (res.ok) {
      if (typeof showToast === 'function') showToast('Thành công', 'Đã cập nhật giá bán thành công!', 'success');
      loadAdminPricingData();
    } else {
      const err = await res.json();
      alert(`Lỗi cập nhật: ${err.message || 'Thất bại'}`);
    }
  } catch (e) {
    alert(`Lỗi kết nối: ${e.message}`);
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
