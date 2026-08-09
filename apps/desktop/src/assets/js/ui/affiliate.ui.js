/**
 * EIGU Desktop Client - Affiliate Marketing UI Module
 */

let currentAffiliateStats = null;
let currentAffiliateTab = 'referrals';

async function loadAffiliateStatsDesktop() {
  const container = document.getElementById('view-tiep-thi');
  if (!container) return;

  // Immediate sync from active userProfile if available
  if (typeof userProfile !== 'undefined' && userProfile && userProfile.referralCode) {
    renderAffiliateStatsDesktop({
      referralCode: userProfile.referralCode,
      referralLink: `https://eigu.site?ref=${userProfile.referralCode}`,
      clickCount: currentAffiliateStats?.clickCount || 0,
      referredCount: currentAffiliateStats?.referredCount || 0,
      totalCommissionEarned: currentAffiliateStats?.totalCommissionEarned || 0,
      affiliateBalance: Number(userProfile.affiliateBalance || currentAffiliateStats?.affiliateBalance || 0),
      affiliateWithdrawn: Number(userProfile.affiliateWithdrawn || currentAffiliateStats?.affiliateWithdrawn || 0),
    });
  }

  try {
    const stats = await apiFetch('/affiliate/stats');
    if (stats) {
      currentAffiliateStats = stats;
      renderAffiliateStatsDesktop(stats);
    }
  } catch (err) {
    console.error('[Affiliate Desktop] Error fetching stats:', err);
  }
}


function renderAffiliateStatsDesktop(stats) {
  const linkEl = document.getElementById('aff-ref-link-input');
  const codeEl = document.getElementById('aff-ref-code-display');
  const clicksEl = document.getElementById('aff-clicks-count');
  const referredEl = document.getElementById('aff-referred-count');
  const earnedEl = document.getElementById('aff-earned-sum');
  const balanceEl = document.getElementById('aff-balance-sum');

  if (linkEl) linkEl.value = stats.referralLink || '';
  if (codeEl) codeEl.innerText = stats.referralCode || 'N/A';
  if (clicksEl) clicksEl.innerText = (stats.clickCount || 0).toLocaleString('vi-VN');
  if (referredEl) referredEl.innerText = (stats.referredCount || 0).toLocaleString('vi-VN');
  if (earnedEl) earnedEl.innerText = (stats.totalCommissionEarned || 0).toLocaleString('vi-VN') + 'đ';
  if (balanceEl) balanceEl.innerText = (stats.affiliateBalance || 0).toLocaleString('vi-VN') + 'đ';
}

function copyAffiliateLinkDesktop() {
  const linkEl = document.getElementById('aff-ref-link-input');
  const link = linkEl ? linkEl.value : '';
  if (!link) return;
  navigator.clipboard.writeText(link);
  if (typeof showToast === 'function') {
    showToast('Đã sao chép link tiếp thị!', 'Dán và chia sẻ cho bạn bè để nhận 15% hoa hồng.', 'success');
  }
}

function copyAffiliateCodeDesktop() {
  const codeEl = document.getElementById('aff-ref-code-display');
  const code = codeEl ? codeEl.innerText : '';
  if (!code || code === 'N/A') return;
  navigator.clipboard.writeText(code);
  if (typeof showToast === 'function') {
    showToast('Đã sao chép mã giới thiệu!', `Mã: ${code}`, 'success');
  }
}

function switchAffiliateTabDesktop(tab) {
  currentAffiliateTab = tab;
  const tabs = ['referrals', 'commissions', 'payouts'];
  tabs.forEach(t => {
    const btn = document.getElementById(`aff-tab-btn-${t}`);
    const content = document.getElementById(`aff-tab-content-${t}`);
    if (btn) {
      if (t === tab) {
        btn.classList.add('active');
        btn.style.background = 'rgba(99, 102, 241, 0.2)';
        btn.style.color = 'var(--accent)';
      } else {
        btn.classList.remove('active');
        btn.style.background = 'transparent';
        btn.style.color = 'var(--text-muted)';
      }
    }
    if (content) {
      content.style.display = (t === tab) ? 'block' : 'none';
    }
  });

  if (tab === 'referrals') loadAffiliateReferralsDesktop();
  if (tab === 'commissions') loadAffiliateCommissionsDesktop();
  if (tab === 'payouts') loadAffiliatePayoutsDesktop();
}

async function loadAffiliateReferralsDesktop(page = 1) {
  const tbody = document.getElementById('aff-referrals-tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--text-muted);">Đang tải danh sách thành viên...</td></tr>`;

  try {
    const data = await apiFetch(`/affiliate/referrals?page=${page}&limit=10`);
    const items = data.items || [];

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--text-muted);">Chưa có thành viên nào đăng ký qua link của bạn.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(item => `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 10px 12px; font-weight: 700; color: var(--text-primary);">${item.maskedEmail}</td>
        <td style="padding: 10px 12px; color: var(--text-muted);">${new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
        <td style="padding: 10px 12px;">
          <span style="padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; background: ${item.isVerified ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)'}; color: ${item.isVerified ? '#22c55e' : '#eab308'};">
            ${item.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
          </span>
        </td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 800; color: #eab308;">
          ${(item.totalCommissionGenerated || 0).toLocaleString('vi-VN')}đ
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('[Affiliate Desktop] Error loading referrals:', err);
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--text-muted);">Không thể tải danh sách. Vui lòng đăng nhập lại.</td></tr>`;
  }
}

async function loadAffiliateCommissionsDesktop(page = 1) {
  const tbody = document.getElementById('aff-commissions-tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">Đang tải lịch sử hoa hồng...</td></tr>`;

  try {
    const data = await apiFetch(`/affiliate/commissions?page=${page}&limit=10`);
    const items = data.items || [];

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);">Chưa có hoa hồng phát sinh.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(comm => `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 10px 12px; font-weight: 800; color: var(--accent);">#${comm.code}</td>
        <td style="padding: 10px 12px; font-weight: 600;">${comm.referredUserEmail}</td>
        <td style="padding: 10px 12px;"><span style="padding: 2px 6px; border-radius: 6px; background: rgba(99, 102, 241, 0.15); color: #818cf8; font-size: 11px; font-weight: 700;">${comm.sourceType === 'DEPOSIT' ? 'Nạp tiền' : 'Mua gói'}</span></td>
        <td style="padding: 10px 12px; color: var(--text-muted);">${(comm.orderAmount || 0).toLocaleString('vi-VN')}đ</td>
        <td style="padding: 10px 12px; font-weight: 700; color: #3b82f6;">${comm.rate}%</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 900; color: #22c55e;">+${(comm.commissionAmount || 0).toLocaleString('vi-VN')}đ</td>
        <td style="padding: 10px 12px; color: var(--text-muted); font-size: 11px;">${new Date(comm.createdAt).toLocaleString('vi-VN')}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('[Affiliate Desktop] Error loading commissions:', err);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">Không thể tải lịch sử hoa hồng.</td></tr>`;
  }
}

async function loadAffiliatePayoutsDesktop(page = 1) {
  const tbody = document.getElementById('aff-payouts-tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted);">Đang tải lịch sử rút tiền...</td></tr>`;

  try {
    const data = await apiFetch(`/affiliate/payouts?page=${page}&limit=10`);
    const items = data.items || [];

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);">Chưa có yêu cầu rút tiền nào.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(p => `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 10px 12px; font-weight: 800; color: var(--accent);">#${p.code}</td>
        <td style="padding: 10px 12px; font-weight: 900; color: #22c55e;">${(p.amount || 0).toLocaleString('vi-VN')}đ</td>
        <td style="padding: 10px 12px;">${p.bankName} - ${p.accountNumber} (${p.accountHolder})</td>
        <td style="padding: 10px 12px;">
          <span style="padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; background: ${p.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.15)' : p.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)'}; color: ${p.status === 'APPROVED' ? '#22c55e' : p.status === 'REJECTED' ? '#ef4444' : '#eab308'};">
            ${p.status === 'APPROVED' ? 'Đã duyệt' : p.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
          </span>
        </td>
        <td style="padding: 10px 12px; color: var(--text-muted); font-size: 12px;">${p.adminNote || '-'}</td>
        <td style="padding: 10px 12px; color: var(--text-muted); font-size: 11px;">${new Date(p.createdAt).toLocaleString('vi-VN')}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('[Affiliate Desktop] Error loading payouts:', err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted);">Không thể tải lịch sử rút tiền.</td></tr>`;
  }
}

function openAffiliatePayoutModalDesktop() {
  const modal = document.getElementById('affiliate-payout-modal-desktop');
  if (modal) modal.style.display = 'flex';
}

function closeAffiliatePayoutModalDesktop() {
  const modal = document.getElementById('affiliate-payout-modal-desktop');
  if (modal) modal.style.display = 'none';
}

async function submitAffiliatePayoutDesktop(event) {
  if (event) event.preventDefault();

  const amountInput = document.getElementById('aff-payout-amount-input');
  const bankSelect = document.getElementById('aff-payout-bank-select');
  const accNoInput = document.getElementById('aff-payout-accno-input');
  const accHolderInput = document.getElementById('aff-payout-holder-input');

  const amount = Number(amountInput?.value || 0);
  const bankName = bankSelect?.value || 'MBBank';
  const accountNumber = (accNoInput?.value || '').trim();
  const accountHolder = (accHolderInput?.value || '').trim().toUpperCase();

  if (!amount || amount < 200000) {
    if (typeof showToast === 'function') showToast('Số tiền rút tối thiểu là 200.000 VNĐ', 'warning');
    return;
  }
  if (!accountNumber || !accountHolder) {
    if (typeof showToast === 'function') showToast('Vui lòng điền đầy đủ số tài khoản và tên chủ tài khoản', 'warning');
    return;
  }

  try {
    await apiFetch('/affiliate/payout-request', {
      method: 'POST',
      body: { amount, bankName, accountNumber, accountHolder }
    });

    if (typeof showToast === 'function') {
      showToast('Gửi yêu cầu rút tiền thành công!', 'Admin sẽ xác minh và chuyển khoản cho bạn sớm nhất.', 'success');
    }
    closeAffiliatePayoutModalDesktop();
    loadAffiliateStatsDesktop();
    if (currentAffiliateTab === 'payouts') loadAffiliatePayoutsDesktop();
  } catch (err) {
    if (typeof showToast === 'function') {
      showToast('Gửi yêu cầu thất bại', err.message || 'Vui lòng thử lại', 'error');
    }
  }
}

async function refreshAffiliateAllDesktop() {
  if (typeof showToast === 'function') {
    showToast('Đang làm mới...', 'Đang cập nhật số liệu tiếp thị liên kết mới nhất', 'info');
  }

  try {
    if (typeof refreshUserProfileDesktop === 'function') {
      await refreshUserProfileDesktop();
    }
    await loadAffiliateStatsDesktop();
    if (currentAffiliateTab === 'referrals') await loadAffiliateReferralsDesktop();
    if (currentAffiliateTab === 'commissions') await loadAffiliateCommissionsDesktop();
    if (currentAffiliateTab === 'payouts') await loadAffiliatePayoutsDesktop();

    if (typeof showToast === 'function') {
      showToast('Đã làm mới dữ liệu!', 'Tất cả số liệu tiếp thị liên kết đã được cập nhật mới nhất.', 'success');
    }
  } catch (err) {
    if (typeof showToast === 'function') {
      showToast('Làm mới thất bại', 'Vui lòng kiểm tra lại kết nối mạng', 'error');
    }
  }
}

// Global Exports for Desktop UI
window.loadAffiliateStatsDesktop = loadAffiliateStatsDesktop;
window.refreshAffiliateAllDesktop = refreshAffiliateAllDesktop;
window.copyAffiliateLinkDesktop = copyAffiliateLinkDesktop;
window.copyAffiliateCodeDesktop = copyAffiliateCodeDesktop;
window.switchAffiliateTabDesktop = switchAffiliateTabDesktop;
window.openAffiliatePayoutModalDesktop = openAffiliatePayoutModalDesktop;
window.closeAffiliatePayoutModalDesktop = closeAffiliatePayoutModalDesktop;
window.submitAffiliatePayoutDesktop = submitAffiliatePayoutDesktop;

