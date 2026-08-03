// Dedicated Checkout Page View Component for Desktop App
window.__CHECKOUT_STATE__ = {
  moduleId: null,
  moduleSlug: '',
  moduleName: '',
  tierId: null,
  tierLabel: '',
  price: 0,
  payableDiffAmount: 0,
  actualPay: 0,
  depositTx: null,
  pollTimer: null,
  countdownSeconds: 150, // 2 phút 30 giây = 150s
  countdownTimer: null,
};

function openCheckoutPageDesktop(data) {
  window.__CHECKOUT_STATE__ = {
    ...data,
    actualPay: data.payableDiffAmount > 0 ? data.payableDiffAmount : data.price,
    depositTx: null,
    pollTimer: null,
    countdownSeconds: 150,
    countdownTimer: null,
  };

  // Close pricing modal if open
  if (typeof closeModulePricingModalDesktop === 'function') {
    closeModulePricingModalDesktop();
  }

  // Switch view to 'checkout'
  if (typeof switchView === 'function') {
    switchView('checkout');
  } else {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const checkoutView = document.getElementById('view-checkout');
    if (checkoutView) checkoutView.classList.add('active');
  }

  // Init and render checkout view
  initCheckoutPageDesktop();
}

async function initCheckoutPageDesktop() {
  const container = document.getElementById('view-checkout');
  if (!container) return;

  const state = window.__CHECKOUT_STATE__;
  const currentBalance = (typeof userProfile !== 'undefined' && userProfile.balance != null) ? Number(userProfile.balance) : 0;
  const upgradeFee = state.payableDiffAmount > 0 ? state.payableDiffAmount : state.price;
  const vietQRAmount = Math.max(0, upgradeFee - currentBalance);

  // Clear previous timers if any
  if (state.pollTimer) {
    clearInterval(state.pollTimer);
    state.pollTimer = null;
  }
  if (state.countdownTimer) {
    clearInterval(state.countdownTimer);
    state.countdownTimer = null;
  }

  state.countdownSeconds = 150; // Reset to 2 phút 30 giây (150s)

  container.innerHTML = `
    <div style="text-align: center; padding: 60px; color: var(--text-muted);">
      <div style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Đang khởi tạo mã thanh toán QR...</div>
      <div style="font-size: 13px; color: var(--text-muted);">Đang tính toán khấu trừ số dư & kết nối cổng SePay Gateway</div>
    </div>
  `;

  try {
    if (vietQRAmount === 0) {
      // Balance is sufficient to cover 100% of the cost!
      state.depositTx = {
        code: 'PAY-BAL-' + Math.floor(Math.random() * 899999 + 100000),
        fullContent: 'Kích hoạt bằng số dư',
        accountNumber: 'N/A',
        accountHolder: 'Thanh toán bằng số dư',
        bankName: 'Số dư tài khoản',
        isFullBalance: true,
        qrCodeUrl: '',
      };
    } else {
      // Call backend API to create PENDING deposit transaction with exact remaining VietQR amount
      const res = await apiFetch('/payment/create-deposit', {
        method: 'POST',
        body: JSON.stringify({ amount: vietQRAmount }),
      });

      if (res && res.data) {
        state.depositTx = res.data;
      } else if (res && res.qrCodeUrl) {
        state.depositTx = res;
      } else {
        throw new Error(res.message || 'Không thể tạo đơn nạp VietQR');
      }
    }

    renderCheckoutPageUIDesktop();

    if (!state.depositTx.isFullBalance) {
      // Start auto polling & 2m30s countdown timer
      startCheckoutAutoPolling();
    }

  } catch (err) {
    console.error('[CheckoutComponent] Error creating deposit:', err);
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #ef4444; max-width: 500px; margin: 40px auto; background: var(--bg-card); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px;">
        <h3 style="margin-top: 0;">Lỗi tạo đơn thanh toán</h3>
        <p style="font-size: 13px; color: var(--text-muted);">${err.message || err}</p>
        <button type="button" class="btn-primary" onclick="openModulePricingModalDesktop('${state.moduleSlug}')" style="margin-top: 16px; padding: 10px 20px;">
          ← Quay lại Bảng giá
        </button>
      </div>
    `;
  }
}

function renderCheckoutPageUIDesktop() {
  const container = document.getElementById('view-checkout');
  if (!container) return;

  const state = window.__CHECKOUT_STATE__;
  const tx = state.depositTx;
  const currentBalance = (typeof userProfile !== 'undefined' && userProfile.balance != null) ? Number(userProfile.balance) : 0;

  // Calculations
  const listPrice = state.price || 0;
  const isUpgrade = state.payableDiffAmount > 0;
  const upgradeFee = isUpgrade ? state.payableDiffAmount : listPrice;
  const oldPackageDeduction = isUpgrade ? (listPrice - upgradeFee) : 0;

  const deductedBalance = Math.min(currentBalance, upgradeFee);
  const vietQRAmount = Math.max(0, upgradeFee - currentBalance);
  const isFullBalance = vietQRAmount === 0;

  const mins = Math.floor(state.countdownSeconds / 60).toString().padStart(2, '0');
  const secs = (state.countdownSeconds % 60).toString().padStart(2, '0');

  container.innerHTML = `
    <div class="no-scrollbar" style="max-width: 1040px; margin: 0 auto; padding: 10px 16px 40px; overflow-y: auto; max-height: calc(100vh - 80px); scrollbar-width: none; -ms-overflow-style: none;">
      <!-- Header Toolbar -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 14px; flex-wrap: wrap;">
        <button type="button" class="btn-outline" onclick="openModulePricingModalDesktop('${state.moduleSlug}')" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; font-size: 13px; font-weight: 700; border-radius: 10px;">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          <span>Quay lại Bảng giá</span>
        </button>

        <div style="text-align: right;">
          <span style="font-size: 11px; background: rgba(99, 102, 241, 0.15); color: #818cf8; padding: 3px 10px; border-radius: 20px; font-weight: 800;">CHECKOUT GATEWAY</span>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Đơn hàng #${tx.code}</div>
        </div>
      </div>

      <!-- Main Responsive Grid: Auto-fit min 320px for perfect desktop & compact window layout -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; align-items: start;">
        
        <!-- COLUMN 1: THÔNG TIN ĐƠN HÀNG (ORDER SUMMARY) -->
        <div style="background: var(--bg-card); border: 1.5px solid var(--border-color); border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
          <div>
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">MÔ-ĐUN DỊCH VỤ</span>
            <h3 style="margin: 4px 0 0 0; font-size: 19px; font-weight: 900; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
              <span>${state.moduleName}</span>
            </h3>
          </div>

          <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 12px; padding: 14px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 12px; color: var(--text-muted);">Gói đăng ký:</span>
              <span style="font-size: 15px; font-weight: 900; color: #818cf8;">Gói ${state.tierLabel}</span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 12px; color: var(--text-muted);">Thời hạn:</span>
              <span style="font-size: 12px; font-weight: 700; color: var(--text-primary);">30 Ngày (Tự động)</span>
            </div>
          </div>

          <!-- Chi tiết bảng giá chi tiết từng dòng -->
          <div style="border-top: 1px dashed var(--border-color); border-bottom: 1px dashed var(--border-color); padding: 14px 0; display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
              <span style="color: var(--text-muted);">Giá gói niêm yết:</span>
              <span style="font-weight: 700; color: var(--text-primary);">${listPrice.toLocaleString('vi-VN')}đ</span>
            </div>

            ${isUpgrade ? `
              <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <span style="color: #38bdf8; font-weight: 600;">Khấu trừ gói cũ:</span>
                <span style="font-weight: 700; color: #38bdf8;">-${(listPrice - upgradeFee).toLocaleString('vi-VN')}đ</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; border-top: 1px dotted rgba(255,255,255,0.1); padding-top: 6px;">
                <span style="color: #a5b4fc; font-weight: 700;">Phí nâng cấp chênh lệch:</span>
                <span style="font-weight: 800; color: #a5b4fc;">= ${upgradeFee.toLocaleString('vi-VN')}đ</span>
              </div>
            ` : ''}

            <div style="display: flex; justify-content: space-between; font-size: 12px;">
              <span style="color: var(--text-muted);">Trừ số dư tài khoản hiện có (${currentBalance.toLocaleString('vi-VN')}đ):</span>
              <span style="font-weight: 700; color: #22c55e;">-${deductedBalance.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          <!-- Tổng tiền cần thanh toán -->
          <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%); border: 1.5px solid rgba(34, 197, 94, 0.3); border-radius: 14px; padding: 16px; text-align: center;">
            <div style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
              ${isFullBalance ? 'SỐ TIỀN CẦN THANH TOÁN (ĐÃ KHẤU TRỪ 100%)' : 'SỐ TIỀN THỰC TẾ CẦN QUÉT QR NẠP THÊM'}
            </div>
            <div style="font-size: 28px; font-weight: 900; color: #22c55e; letter-spacing: -0.5px;">${vietQRAmount.toLocaleString('vi-VN')}đ</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
              ${isFullBalance ? 'Số dư của bạn đủ để kích hoạt gói ngay lập tức' : 'Hệ thống tự động cộng tiền & kích hoạt gói ngay khi quét QR'}
            </div>
          </div>

          <div style="font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 8px;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#22c55e" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Giao dịch an toàn 100% qua SePay Auto Bank Gateway.</span>
          </div>
        </div>

        <!-- COLUMN 2: KHUNG QUÉT MÃ VIETQR SEPAY HOẶC KÍCH HOẠT BẰNG SỐ DƯ -->
        <div style="background: var(--bg-card); border: 1.5px solid var(--border-color); border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
          
          ${isFullBalance ? `
            <div style="text-align: center; padding: 20px 10px;">
              <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(34, 197, 94, 0.15); border: 2px solid #22c55e; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #22c55e;">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h4 style="margin: 0; font-size: 20px; font-weight: 900; color: var(--text-primary);">Số dư khả dụng đủ thanh toán!</h4>
              <p style="margin: 8px 0 20px 0; font-size: 13px; color: var(--text-muted); line-height: 1.5;">
                Tài khoản của bạn đang có <strong>${currentBalance.toLocaleString('vi-VN')}đ</strong>.<br/>
                Số tiền cần trả cho gói ${state.tierLabel}: <strong>${upgradeFee.toLocaleString('vi-VN')}đ</strong>.<br/>
                Bạn không cần nạp thêm VietQR!
              </p>

              <button type="button" class="btn-primary" onclick="verifyCheckoutPaymentDesktop()" style="width: 100%; padding: 14px; font-size: 14px; font-weight: 800; border-radius: 12px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); box-shadow: 0 4px 20px rgba(34, 197, 94, 0.4); border: none;">
                ✓ Kích hoạt gói ${state.tierLabel} ngay (-${upgradeFee.toLocaleString('vi-VN')}đ)
              </button>
            </div>
          ` : `
            <div style="text-align: center;">
              <h4 style="margin: 0; font-size: 17px; font-weight: 800; color: var(--text-primary);">Quét mã QR để nạp thêm ${vietQRAmount.toLocaleString('vi-VN')}đ</h4>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: var(--text-muted);">Mở ứng dụng Ngân hàng (MBBank, Vietcombank, TPBank...) để quét mã bên dưới</p>
            </div>

            <!-- COUNTDOWN TIMER BOX (02:30) -->
            <div id="checkout-countdown-box" style="background: rgba(245, 158, 11, 0.1); border: 1.5px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <div style="font-size: 12px; font-weight: 800; color: var(--text-primary);">Thời hạn giữ mã QR</div>
                  <div style="font-size: 10px; color: var(--text-muted);">Vui lòng thanh toán trong thời gian đếm ngược (2p 30s)</div>
                </div>
              </div>

              <div id="checkout-timer-display" style="font-family: monospace; font-size: 22px; font-weight: 900; color: #f59e0b; letter-spacing: 1.5px; text-shadow: 0 0 10px rgba(245, 158, 11, 0.4);">
                ${mins}:${secs}
              </div>
            </div>

            <!-- QR Code Image & Details Flexible Grid (Responsive auto-fit min 180px) -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; align-items: center; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 14px; padding: 14px;">
              <!-- QR Image -->
              <div style="text-align: center; background: #ffffff; padding: 8px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.4); max-width: 200px; margin: 0 auto;">
                <img src="${tx.qrCodeUrl}" alt="VietQR SePay Code" style="width: 100%; height: auto; display: block; border-radius: 6px;" />
                <div style="font-size: 9px; font-weight: 800; color: #0f172a; margin-top: 4px; letter-spacing: 0.5px;">VIETQR &bull; SEPAY GATEWAY</div>
              </div>

              <!-- Transfer Info Fields -->
              <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px; min-width: 0;">
                <div>
                  <span style="color: var(--text-muted); font-size: 10px; display: block;">NGÂN HÀNG:</span>
                  <strong style="color: var(--text-primary); font-weight: 800; font-size: 13px;">${tx.bankName || 'MBBank'}</strong>
                </div>

                <div>
                  <span style="color: var(--text-muted); font-size: 10px; display: block;">SỐ TÀI KHOẢN:</span>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <strong style="color: #38bdf8; font-weight: 800; font-size: 14px; letter-spacing: 0.5px;">${tx.accountNumber}</strong>
                    <button type="button" title="Sao chép Số tài khoản" onclick="copyCheckoutText('${tx.accountNumber}', 'Số tài khoản')" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; border-radius: 6px; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; flex-shrink: 0;">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                  </div>
                </div>

                <div>
                  <span style="color: var(--text-muted); font-size: 10px; display: block;">CHỦ TÀI KHOẢN:</span>
                  <strong style="color: var(--text-primary); font-weight: 800; word-break: break-word;">${tx.accountHolder || 'EIGU PLATFORM'}</strong>
                </div>

                <div>
                  <span style="color: var(--text-muted); font-size: 10px; display: block;">NỘI DUNG CHUYỂN KHOẢN (BẮT BUỘC CHÍNH XÁC):</span>
                  <div style="display: flex; align-items: center; gap: 8px; background: rgba(245, 158, 11, 0.12); border: 1.5px solid rgba(245, 158, 11, 0.4); padding: 6px 10px; border-radius: 8px; margin-top: 2px;">
                    <strong style="color: #f59e0b; font-weight: 900; font-size: 13px; letter-spacing: 0.5px; word-break: break-all;">${tx.fullContent}</strong>
                    <button type="button" title="Sao chép cú pháp chuyển khoản" onclick="copyCheckoutText('${tx.fullContent}', 'Cú pháp chuyển khoản')" style="background: #f59e0b; border: none; color: #0b0f19; border-radius: 6px; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; flex-shrink: 0; margin-left: auto; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.35);">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Live Status Listening Indicator -->
            <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 10px; padding: 10px 14px; display: flex; align-items: center; gap: 10px;">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 8px #22c55e; flex-shrink: 0;"></div>
              <div style="font-size: 11px; color: var(--text-primary); font-weight: 600;">
                Hệ thống đang tự động lắng nghe giao dịch... Gói cước sẽ tự động kích hoạt ngay khi nhận tiền!
              </div>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; gap: 10px; margin-top: 4px; flex-wrap: wrap;">
              <button type="button" class="btn-primary" onclick="verifyCheckoutPaymentDesktop()" style="flex: 1; padding: 11px; font-size: 13px; font-weight: 800; border-radius: 10px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4); border: none; min-width: 180px;">
                ✓ Tôi đã chuyển khoản thành công
              </button>
              <button type="button" class="btn-outline" onclick="cancelCheckoutDesktop()" style="padding: 11px 16px; font-size: 12px; font-weight: 700; border-radius: 10px;">
                Hủy thanh toán
              </button>
            </div>
          `}

        </div>

      </div>
    </div>
  `;
}

function copyCheckoutText(text, label) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
  if (typeof showToast === 'function') {
    showToast(`Đã sao chép ${label}: ${text}`, 'success');
  }
}

function startCheckoutAutoPolling() {
  const state = window.__CHECKOUT_STATE__;
  if (!state.depositTx || !state.depositTx.code) return;

  // 1. Countdown Timer Tick Loop (2 phút 30 giây = 150s)
  if (state.countdownTimer) clearInterval(state.countdownTimer);

  state.countdownTimer = setInterval(() => {
    state.countdownSeconds--;

    const timerEl = document.getElementById('checkout-timer-display');
    if (timerEl) {
      const mins = Math.floor(Math.max(0, state.countdownSeconds) / 60).toString().padStart(2, '0');
      const secs = (Math.max(0, state.countdownSeconds) % 60).toString().padStart(2, '0');
      timerEl.textContent = `${mins}:${secs}`;

      if (state.countdownSeconds <= 15) {
        timerEl.style.color = '#ef4444';
        timerEl.style.textShadow = '0 0 12px rgba(239, 68, 68, 0.6)';
      } else {
        timerEl.style.color = '#f59e0b';
        timerEl.style.textShadow = '0 0 10px rgba(245, 158, 11, 0.4)';
      }
    }

    if (state.countdownSeconds <= 0) {
      clearInterval(state.countdownTimer);
      state.countdownTimer = null;

      const countdownBox = document.getElementById('checkout-countdown-box');
      if (countdownBox) {
        countdownBox.style.background = 'rgba(239, 68, 68, 0.12)';
        countdownBox.style.border = '1.5px solid rgba(239, 68, 68, 0.4)';
        countdownBox.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ef4444" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <div style="font-size: 12px; color: #ef4444; font-weight: 700;">Hết 2 phút 30 giây thời hạn giữ mã QR!</div>
          </div>
          <button
            type="button"
            onclick="initCheckoutPageDesktop()"
            style="background:#ef4444;color:#fff;border:none;padding:5px 12px;border-radius:8px;font-size:11px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:6px;"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 2v6h-6"/>
              <path d="M3 12a9 9 0 0 1 15.5-6L21 8"/>
              <path d="M3 22v-6h6"/>
              <path d="M21 12a9 9 0 0 1-15.5 6L3 16"/>
            </svg>
            Tạo mã QR mới
          </button>
        `;
      }
    }
  }, 1000);

  // 2. Poll every 4 seconds to check user balance and transaction status
  if (state.pollTimer) clearInterval(state.pollTimer);

  state.pollTimer = setInterval(async () => {
    // Stop polling if user is logged out
    const token = typeof accessToken !== 'undefined' && accessToken ? accessToken : localStorage.getItem('accessToken');
    if (!token) {
      if (state.pollTimer) clearInterval(state.pollTimer);
      if (state.countdownTimer) clearInterval(state.countdownTimer);
      state.pollTimer = null;
      state.countdownTimer = null;
      return;
    }

    try {
      // Reload subscriptions to see if package has been activated
      if (typeof apiFetch === 'function') {
        const res = await apiFetch('/pricing/my-subscriptions');
        if (res && Array.isArray(res.data)) {
          const sub = res.data.find(s => s.moduleSlug === state.moduleSlug && s.tierId === state.tierId);
          if (sub) {
            // Package is already active!
            if (state.pollTimer) clearInterval(state.pollTimer);
            if (state.countdownTimer) clearInterval(state.countdownTimer);
            state.pollTimer = null;
            state.countdownTimer = null;

            if (typeof showToast === 'function') {
              showToast(`Thanh toán thành công! Gói ${state.tierLabel} đã được kích hoạt.`, 'success');
            }
            if (typeof refreshUserProfileDesktop === 'function') {
              await refreshUserProfileDesktop();
            }
            if (typeof loadUserSubscriptionsDesktop === 'function') {
              await loadUserSubscriptionsDesktop();
            }
            if (typeof switchView === 'function') {
              switchView(state.moduleSlug);
            }
            return;
          }
        }
      }

      // Refresh latest profile balance from server
      if (typeof refreshUserProfileDesktop === 'function') {
        await refreshUserProfileDesktop();
      }

      // Check balance
      if (typeof userProfile !== 'undefined' && userProfile.balance != null) {
        const currentBal = Number(userProfile.balance);
        const upgradeFee = state.payableDiffAmount > 0 ? state.payableDiffAmount : (state.price || 0);
        if (currentBal >= upgradeFee) {
          // Balance is sufficient! Automatically subscribe!
          await verifyCheckoutPaymentDesktop();
        }
      }
    } catch (err) {
      const msg = String(err && err.message ? err.message : err);
      if (msg.includes('Phiên làm việc đã hết hạn') || msg.includes('401') || msg.includes('Unauthorized')) {
        if (state.pollTimer) clearInterval(state.pollTimer);
        if (state.countdownTimer) clearInterval(state.countdownTimer);
        state.pollTimer = null;
        state.countdownTimer = null;
        return;
      }
      console.warn('[CheckoutPolling] Error:', err);
    }
  }, 4000);
}

async function verifyCheckoutPaymentDesktop() {
  const state = window.__CHECKOUT_STATE__;
  if (!state.moduleId || !state.tierId) return;

  if (typeof showToast === 'function') {
    // showToast('Đang kiểm tra và kích hoạt gói cước...', 'info');
  }

  try {
    const res = await apiFetch('/pricing/subscribe', {
      method: 'POST',
      body: JSON.stringify({ moduleId: state.moduleId, tierId: state.tierId }),
    });

    if (res && res.success) {
      if (state.pollTimer) {
        clearInterval(state.pollTimer);
        state.pollTimer = null;
      }
      if (state.countdownTimer) {
        clearInterval(state.countdownTimer);
        state.countdownTimer = null;
      }

      if (typeof showToast === 'function') {
        showToast(res.message || 'Thanh toán & Kích hoạt gói thành công!', 'success');
      }

      // Update user profile balance
      if (typeof refreshUserProfileDesktop === 'function') {
        await refreshUserProfileDesktop();
      } else if (res.newBalance !== undefined && typeof userProfile !== 'undefined') {
        userProfile.balance = res.newBalance;
        if (typeof updateProfile === 'function') updateProfile();
      }

      // Reload subscriptions
      if (typeof loadUserSubscriptionsDesktop === 'function') {
        await loadUserSubscriptionsDesktop();
      }

      // Return to module view
      if (typeof switchView === 'function') {
        switchView(state.moduleSlug);
      }
    }
  } catch (err) {
    console.error('[VerifyCheckout] Error:', err);
    const errMsg = err.message || String(err);
    if (errMsg.includes('Số dư không đủ')) {
      if (typeof showToast === 'function') {
        showToast('Hệ thống chưa nhận được đủ tiền nạp. Vui lòng quét mã QR để hoàn tất!', 'warning');
      }
    } else {
      if (typeof showToast === 'function') {
        showToast(errMsg, 'error');
      }
    }
  }
}

function cancelCheckoutDesktop() {
  const state = window.__CHECKOUT_STATE__;
  if (state.pollTimer) {
    clearInterval(state.pollTimer);
    state.pollTimer = null;
  }
  if (state.countdownTimer) {
    clearInterval(state.countdownTimer);
    state.countdownTimer = null;
  }

  const container = document.getElementById('view-checkout');
  if (!container) return;

  container.innerHTML = `
    <div style="max-width: 520px; margin: 80px auto; padding: 40px; background: var(--bg-card); border: 1.5px solid var(--border-color); border-radius: 24px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
      <div style="width: 72px; height: 72px; border-radius: 50%; background: rgba(239, 68, 68, 0.12); border: 1.5px solid rgba(239, 68, 68, 0.4); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: #ef4444;">
        <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>

      <h3 style="font-size: 22px; font-weight: 900; margin: 0 0 8px 0; color: var(--text-primary);">
        Đã hủy thanh toán!
      </h3>

      <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.7; margin: 0 0 28px 0;">
        Phiên thanh toán Gói ${state.tierLabel || ''} đã bị hủy. Không có khoản tiền nào bị trừ khỏi tài khoản của bạn.
      </p>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <button
          type="button"
          class="btn-primary"
          onclick="initCheckoutPageDesktop()"
          style="padding: 13px 24px; border-radius: 12px; font-size: 14px; font-weight: 800; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15.5-6L21 8"/>
            <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15.5 6L3 16"/>
          </svg>
          Thử thanh toán lại
        </button>

        <button
          type="button"
          class="btn-outline"
          onclick="openModulePricingModalDesktop('${state.moduleSlug}')"
          style="padding: 12px 24px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer;"
        >
          Quay lại Bảng giá
        </button>
      </div>
    </div>
  `;
}
