// Module Pricing & Upgrade UI Controller for Desktop App
window.__EIGU_SUBSCRIPTIONS__ = {};

// Inject glowing pulse animation styles
(function injectUpgradeBtnStyles() {
  if (document.getElementById('eigu-upgrade-btn-styles')) return;
  const style = document.createElement('style');
  style.id = 'eigu-upgrade-btn-styles';
  style.innerHTML = `
    .btn-upgrade-glow {
      -webkit-app-region: no-drag !important;
      pointer-events: auto !important;
      background: #141724 !important;
      border: 1.5px solid #4f46e5 !important;
      border-radius: 12px !important;
      padding: 8px 18px !important;
      color: #ffffff !important;
      font-size: 13px !important;
      font-weight: 800 !important;
      cursor: pointer !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 8px !important;
      outline: none !important;
      box-shadow: 0 0 12px rgba(99, 102, 241, 0.3) !important;
      transition: all 0.25s ease !important;
      animation: pulse-upgrade-glow 2.5s infinite ease-in-out !important;
    }
    .btn-upgrade-glow *,
    .btn-upgrade-glow span {
      color: #ffffff !important;
      background: transparent !important;
    }
    .btn-upgrade-glow:hover,
    .btn-upgrade-glow:focus,
    .btn-upgrade-glow:active,
    .btn-upgrade-glow:focus-visible {
      transform: translateY(-1px) scale(1.02) !important;
      background: #1e2238 !important;
      color: #ffffff !important;
      border-color: #6366f1 !important;
      outline: none !important;
    }
    @keyframes pulse-upgrade-glow {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
        border-color: rgba(99, 102, 241, 0.8);
      }
      50% {
        box-shadow: 0 0 18px 4px rgba(99, 102, 241, 0.65), inset 0 0 8px rgba(245, 158, 11, 0.15);
        border-color: rgba(245, 158, 11, 0.9);
      }
    }
  `;
  document.head.appendChild(style);
})();

async function loadUserSubscriptionsDesktop() {
  try {
    const res = await apiFetch('/pricing/my-subscriptions');
    if (res && Array.isArray(res.data)) {
      window.__EIGU_SUBSCRIPTIONS__ = {};
      res.data.forEach(sub => {
        if (sub.moduleSlug) {
          window.__EIGU_SUBSCRIPTIONS__[sub.moduleSlug] = sub;
        }
      });
    }
    updateAllModuleTierBadgesDesktop();
  } catch (err) {
    console.warn('[PricingUI] Error loading subscriptions:', err);
  }
}

function getSubscriptionForModule(moduleSlug) {
  return window.__EIGU_SUBSCRIPTIONS__[moduleSlug] || null;
}

function updateAllModuleTierBadgesDesktop() {
  const modules = ['cut', 'ai-video', 'hot-niche', 'workflow', 'record', 'tiep-thi', 'tk-tiktok', 'tk-facebook', 'tk-youtube', 'tk-x', 'tk-instagram', 'tk-threads'];

  modules.forEach(slug => {
    const badgeEl = document.getElementById(`module-tier-badge-${slug}`);
    if (badgeEl) {
      const sub = getSubscriptionForModule(slug);
      if (sub) {
        badgeEl.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; background: rgba(99, 102, 241, 0.15); color: var(--accent); border: 1px solid rgba(99, 102, 241, 0.3); font-size: 11px; font-weight: 800;">Gói ${sub.tierLabel} &bull; Max ${sub.threads} luồng</span>`;
      } else {
        badgeEl.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; background: rgba(245, 158, 11, 0.12); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); font-size: 11px; font-weight: 700;">Gói Dùng Thử / Free</span>`;
      }
    }
  });
}

async function openModulePricingModalDesktop(moduleSlug = 'cut') {
  const overlay = document.getElementById('desktop-module-pricing-modal');
  const container = document.getElementById('desktop-pricing-modal-content');
  if (!overlay || !container) return;

  overlay.classList.remove('hidden');
  container.innerHTML = `
    <div style="text-align: center; padding: 50px; color: var(--text-muted);">
      Đang tải bảng giá mô-đun...
    </div>
  `;

  try {
    // Ensure active user subscriptions are loaded before rendering modal
    await loadUserSubscriptionsDesktop();

    const res = await apiFetch(`/pricing?m=${moduleSlug}`);
    const modulesData = res && res.data ? res.data : [];
    const moduleInfo = modulesData.find(m => m.slug === moduleSlug) || modulesData[0];

    if (!moduleInfo || !moduleInfo.tiers || moduleInfo.tiers.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-muted);">Chưa cấu hình bảng giá cho mô-đun này.</div>`;
      return;
    }

    const currentSub = getSubscriptionForModule(moduleSlug);
    const activeTierId = currentSub?.tierId || null;
    const tierCount = moduleInfo.tiers.length;
    const currentBalance = (typeof userProfile !== 'undefined' && userProfile.balance != null) ? Number(userProfile.balance) : 0;

    // Strict 4-column side-by-side grid layout on 1 single row
    let gridTemplate = 'repeat(4, minmax(150px, 1fr))';
    if (tierCount === 3) {
      gridTemplate = 'repeat(3, minmax(160px, 1fr))';
    } else if (tierCount === 2) {
      gridTemplate = 'repeat(2, minmax(180px, 1fr))';
    }

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; margin-bottom: 4px;">
            <span style="background: rgba(99, 102, 241, 0.2); color: #818cf8; padding: 2px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; letter-spacing: 0.5px; display: inline-block;">GÓI CƯỚC UNLIMITED RENDER</span>
            <span style="background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); padding: 2px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              Số dư: ${currentBalance.toLocaleString('vi-VN')}đ
            </span>
          </div>
          <h3 style="margin: 2px 0; font-size: 19px; font-weight: 900; color: var(--text-primary);">
            ${moduleInfo.name}
          </h3>
          <p style="color: var(--text-muted); font-size: 11px; margin: 2px 0 0 0;">${moduleInfo.tagline}</p>
        </div>

        <!-- Tiers Grid - Forced Single Row -->
        <div style="display: grid; grid-template-columns: ${gridTemplate}; gap: 10px; align-items: stretch; overflow-x: auto; padding-top: 6px; padding-bottom: 4px;">
          ${moduleInfo.tiers.map((tier, idx) => {
      const isCurrent = tier.id === activeTierId;
      const isFocused = tier.code === 'pro' || tier.badge === 'PHỔ BIẾN NHẤT' || (tierCount >= 3 && idx === 1);

      let badgeText = tier.badge;
      if (!badgeText && tier.discount > 0) {
        badgeText = `GIẢM -${tier.discount}%`;
      } else if (!badgeText && tier.code === 'enterprise') {
        badgeText = 'DOANH NGHIỆP';
      }

      let badgeColor = '#f59e0b';
      if (tier.code === 'enterprise' || badgeText?.includes('DOANH NGHIỆP')) {
        badgeColor = '#22c55e';
      } else if (badgeText?.includes('GIẢM')) {
        badgeColor = '#ef4444';
      }

      const currentTierPrice = currentSub ? Number(currentSub.price || 0) : 0;
      const isHigher = currentSub && tier.price > currentTierPrice;
      const isLower = currentSub && tier.price < currentTierPrice;
      const upgradeFee = isHigher ? (tier.price - currentTierPrice) : tier.price;

      const deductedBal = Math.min(currentBalance, upgradeFee);
      const netVietQR = Math.max(0, upgradeFee - currentBalance);

      let infoSubText = '';
      if (isCurrent) {
        infoSubText = `<span style="font-size: 10px; color: var(--accent); font-weight: 800; display: block; margin-top: 2px;">✓ Gói cước đang dùng</span>`;
      } else if (isLower) {
        infoSubText = `<span style="font-size: 10px; color: var(--text-muted); display: block; margin-top: 2px;">Gói cước cấp thấp hơn</span>`;
      } else if (isHigher) {
        if (netVietQR === 0) {
          infoSubText = `<span style="font-size: 10px; color: #4ade80; font-weight: 700; display: block; margin-top: 2px;">Chênh lệch ${upgradeFee.toLocaleString('vi-VN')}đ &bull; Đủ số dư</span>`;
        } else {
          infoSubText = `<span style="font-size: 10px; color: #38bdf8; font-weight: 700; display: block; margin-top: 2px;">Cần thêm: <strong style="color:#22c55e;">${netVietQR.toLocaleString('vi-VN')}đ</strong></span>`;
        }
      } else {
        if (netVietQR === 0) {
          infoSubText = `<span style="font-size: 10px; color: #4ade80; font-weight: 700; display: block; margin-top: 2px;">✓ Đủ số dư tài khoản</span>`;
        } else if (currentBalance > 0) {
          infoSubText = `<span style="font-size: 10px; color: #38bdf8; font-weight: 700; display: block; margin-top: 2px;">Trừ số dư ${deductedBal.toLocaleString('vi-VN')}đ &bull;: <strong style="color:#22c55e;">${netVietQR.toLocaleString('vi-VN')}đ</strong></span>`;
        } else {
          infoSubText = `<span style="font-size: 10px; color: var(--text-muted); display: block; margin-top: 2px;">/ ${tier.billingPeriod === 'yearly' ? 'năm' : (tier.billingPeriod === 'trial' ? '7 ngày' : 'tháng')}</span>`;
        }
      }

      let buttonHtml = '';
      if (isCurrent) {
        buttonHtml = `
                <button type="button" disabled style="width: 100% !important; padding: 7px 4px; border-radius: 8px; background: rgba(99, 102, 241, 0.2); color: var(--accent); border: 1px solid var(--accent); font-size: 10px; font-weight: 800; white-space: nowrap; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Gói đang dùng</span>
                </button>
              `;
      } else if (isLower) {
        buttonHtml = `
                <button type="button" disabled style="width: 100% !important; padding: 7px 4px; border-radius: 8px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); color: var(--text-muted); font-size: 10px; font-weight: 600; white-space: nowrap;">
                  Gói thấp hơn
                </button>
              `;
      } else if (isHigher) {
        const btnLabel = netVietQR === 0 ? `Nâng cấp (${upgradeFee.toLocaleString('vi-VN')}đ)` : `Nâng cấp (Nạp ${netVietQR.toLocaleString('vi-VN')}đ)`;
        buttonHtml = `
                <button type="button" class="btn-primary" onclick="handlePurchaseTierDesktop('${moduleInfo.id}', '${tier.id}', '${moduleInfo.name}', '${tier.label}', ${tier.price}, ${upgradeFee}, '${moduleInfo.slug}')" style="width: 100% !important; padding: 7px 4px; border-radius: 8px; font-size: 10px; font-weight: 800; margin: 0; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4); border: none; white-space: nowrap;">
                  ${btnLabel} →
                </button>
              `;
      } else {
        const btnLabel = netVietQR === 0 ? `Chọn gói ${tier.label}` : `Chọn gói (Nạp ${netVietQR.toLocaleString('vi-VN')}đ)`;
        buttonHtml = `
                <button type="button" class="btn-primary" onclick="handlePurchaseTierDesktop('${moduleInfo.id}', '${tier.id}', '${moduleInfo.name}', '${tier.label}', ${tier.price}, 0, '${moduleInfo.slug}')" style="width: 100% !important; padding: 7px 4px; border-radius: 8px; font-size: 10px; font-weight: 800; margin: 0; background: ${isFocused ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(255, 255, 255, 0.05)'}; border: ${isFocused ? 'none' : '1px solid rgba(255, 255, 255, 0.2)'}; color: #ffffff; cursor: pointer; transition: all 0.2s; white-space: nowrap;">
                  ${btnLabel}
                </button>
              `;
      }

      return `
              <div style="background: ${isFocused ? '#0f121d' : 'var(--bg-primary)'}; border: 2px solid ${isCurrent ? 'var(--accent)' : (isFocused ? '#f59e0b' : 'var(--border-color)')}; border-radius: 14px; padding: 12px 8px; display: flex; flex-direction: column; justify-content: space-between; position: relative; transition: all 0.25s ease; box-shadow: ${isFocused ? '0 0 16px rgba(245, 158, 11, 0.2)' : 'none'}; z-index: ${isFocused ? '2' : '1'};">
                ${badgeText ? `
                  <span style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: ${badgeColor}; color: ${badgeColor === '#f59e0b' ? '#0b0f19' : '#ffffff'}; padding: 2px 8px; border-radius: 20px; font-size: 9px; font-weight: 900; letter-spacing: 0.5px; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
                    ${badgeText}
                  </span>
                ` : ''}

                <div>
                  <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 2px;">${tier.label}</div>
                  <div style="font-size: 10px; color: var(--text-muted); min-height: 22px; margin-bottom: 4px; line-height: 1.2;">${tier.tagline || ''}</div>

                  <div style="margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
                    <div style="display: flex; align-items: baseline; gap: 4px; flex-wrap: wrap;">
                      <span style="font-size: 18px; font-weight: 900; color: ${isFocused ? '#ffffff' : (tier.code === 'basic' ? '#3b82f6' : '#22c55e')};">${tier.formattedPrice}</span>
                      ${tier.formattedOriginalPrice ? `<span style="font-size: 10px; color: var(--text-muted); text-decoration: line-through;">${tier.formattedOriginalPrice}</span>` : ''}
                    </div>
                    ${infoSubText}
                  </div>

                  <div style="font-size: 10px; display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px;">
                    <div style="color: var(--text-secondary); font-weight: 600; display: flex; align-items: center; gap: 4px;">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                      <span>Luồng: <strong style="color: var(--text-primary); font-weight: 800;">${tier.threads === 0 ? '20 luồng' : tier.threads + ' luồng'}</strong></span>
                    </div>
                    <div style="color: var(--text-secondary); font-weight: 600; display: flex; align-items: center; gap: 4px;">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                      <span>Số máy: <strong style="color: var(--text-primary); font-weight: 800;">${tier.machines} máy</strong></span>
                    </div>
                    <div style="color: var(--text-secondary); font-weight: 600; display: flex; align-items: center; gap: 4px;">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#a855f7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
                      <span>Độ phân giải: <strong style="color: var(--text-primary); font-weight: 800;">${tier.resolution}</strong></span>
                    </div>

                    ${(tier.features || []).map(feat => `
                      <div style="display: flex; align-items: flex-start; gap: 4px; color: var(--text-muted); font-size: 10px; line-height: 1.2;">
                        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 1px;"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>${feat}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <div style="margin-top: auto;">
                  ${buttonHtml}
                </div>
              </div>
            `;
    }).join('')}
        </div>
      </div>
    `;

  } catch (err) {
    console.error('[PricingUI] Error loading module pricing:', err);
    container.innerHTML = `<div style="text-align: center; padding: 30px; color: #ef4444;">Lỗi tải bảng giá: ${err.message || err}</div>`;
  }
}

function closeModulePricingModalDesktop() {
  const overlay = document.getElementById('desktop-module-pricing-modal');
  if (overlay) overlay.classList.add('hidden');
}

async function handlePurchaseTierDesktop(moduleId, tierId, moduleName, tierLabel, price, payableDiffAmount = 0, moduleSlug = 'cut') {
  const actualPay = payableDiffAmount > 0 ? payableDiffAmount : price;
  const priceStr = actualPay.toLocaleString('vi-VN') + 'đ';
  const currentBalance = (typeof userProfile !== 'undefined' && userProfile.balance != null) ? Number(userProfile.balance) : 0;

  // 1. Nếu số dư tài khoản KHÔNG ĐỦ -> Chuyển sang Trang Thanh Toán riêng biệt (/checkout)
  if (currentBalance < actualPay) {
    if (typeof openCheckoutPageDesktop === 'function') {
      openCheckoutPageDesktop({
        moduleId,
        moduleSlug,
        moduleName,
        tierId,
        tierLabel,
        price,
        payableDiffAmount,
      });
    } else {
      closeModulePricingModalDesktop();
      if (typeof switchView === 'function') switchView('checkout');
    }
    return;
  }

  // 2. Nếu số dư ĐỦ -> Hỏi xác nhận và trừ số dư tài khoản
  const confirmMsg = payableDiffAmount > 0
    ? `XÁC NHẬN NÂNG CẤP GÓI DỊCH VỤ:\n\nMô-đun: ${moduleName}\nNâng lên gói: ${tierLabel}\nGiá gói gốc: ${price.toLocaleString('vi-VN')}đ\nSố tiền chênh lệch cần trả thêm: ${priceStr}\n\nSố tiền chênh lệch sẽ được tự động trừ vào số dư tài khoản của bạn (${currentBalance.toLocaleString('vi-VN')}đ). Bạn có muốn tiếp tục?`
    : `XÁC NHẬN ĐĂNG KÝ GÓI DỊCH VỤ:\n\nMô-đun: ${moduleName}\nGói đăng ký: ${tierLabel}\nChi phí thanh toán: ${priceStr}\n\nSố tiền sẽ được tự động trừ vào số dư tài khoản của bạn (${currentBalance.toLocaleString('vi-VN')}đ). Bạn có muốn tiếp tục?`;

  if (!confirm(confirmMsg)) return;

  try {
    const res = await apiFetch('/pricing/subscribe', {
      method: 'POST',
      body: JSON.stringify({ moduleId, tierId }),
    });

    if (res && res.success) {
      if (typeof showToast === 'function') {
        showToast(res.message || 'Nâng cấp gói thành công!', 'success');
      }

      // Update user profile balance
      if (typeof refreshUserProfileDesktop === 'function') {
        await refreshUserProfileDesktop();
      } else if (res.newBalance !== undefined && typeof userProfile !== 'undefined') {
        userProfile.balance = res.newBalance;
        if (typeof updateProfile === 'function') updateProfile();
      }

      // Reload subscriptions & close modal
      await loadUserSubscriptionsDesktop();
      closeModulePricingModalDesktop();
    }
  } catch (err) {
    console.error('[PurchaseTier] Error:', err);
    const errMsg = err.message || String(err);

    // Fallback nếu API trả về lỗi Số dư không đủ -> Chuyển sang Trang Thanh toán /checkout
    if (errMsg.includes('Số dư không đủ')) {
      if (typeof showToast === 'function') {
        showToast('Số dư tài khoản không đủ. Đang chuyển sang Trang Thanh toán...', 'warning');
      }
      if (typeof openCheckoutPageDesktop === 'function') {
        openCheckoutPageDesktop({
          moduleId,
          moduleSlug,
          moduleName,
          tierId,
          tierLabel,
          price,
          payableDiffAmount,
        });
      }
    } else {
      if (typeof showToast === 'function') {
        showToast(errMsg, 'error');
      }
    }
  }
}
