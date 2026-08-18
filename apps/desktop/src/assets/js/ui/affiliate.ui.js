/**
 * EIGU Desktop Client - Affiliate Marketing & Admin Payouts UI Module
 */

let currentAffiliateStats = null;
let currentAffiliateTab = 'referrals';
let currentAdminPayoutFilter = 'PENDING';
let currentAdminPayoutPage = 1;
let bankPickerTargetDesktop = 'settings';

// Default static VietQR banks list
let vietqrBanksList = [
  { id: 17, name: 'Ngân hàng TMCP Công thương Việt Nam', code: 'ICB', bin: '970415', shortName: 'VietinBank', logo: 'https://cdn.vietqr.io/img/ICB.png' },
  { id: 43, name: 'Ngân hàng TMCP Ngoại Thương Việt Nam', code: 'VCB', bin: '970436', shortName: 'Vietcombank', logo: 'https://cdn.vietqr.io/img/VCB.png' },
  { id: 4, name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', code: 'BIDV', bin: '970418', shortName: 'BIDV', logo: 'https://cdn.vietqr.io/img/BIDV.png' },
  { id: 42, name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam', code: 'VBA', bin: '970405', shortName: 'Agribank', logo: 'https://cdn.vietqr.io/img/VBA.png' },
  { id: 26, name: 'Ngân hàng TMCP Quân đội', code: 'MB', bin: '970422', shortName: 'MBBank', logo: 'https://cdn.vietqr.io/img/MB.png' },
  { id: 38, name: 'Ngân hàng TMCP Kỹ thương Việt Nam', code: 'TCB', bin: '970407', shortName: 'Techcombank', logo: 'https://cdn.vietqr.io/img/TCB.png' },
  { id: 2, name: 'Ngân hàng TMCP Á Châu', code: 'ACB', bin: '970416', shortName: 'ACB', logo: 'https://cdn.vietqr.io/img/ACB.png' },
  { id: 44, name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', code: 'VPB', bin: '970432', shortName: 'VPBank', logo: 'https://cdn.vietqr.io/img/VPB.png' },
  { id: 39, name: 'Ngân hàng TMCP Tiên Phong', code: 'TPB', bin: '970423', shortName: 'TPBank', logo: 'https://cdn.vietqr.io/img/TPB.png' },
  { id: 35, name: 'Ngân hàng TMCP Sài Gòn Thương Tín', code: 'STB', bin: '970403', shortName: 'Sacombank', logo: 'https://cdn.vietqr.io/img/STB.png' },
  { id: 14, name: 'Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh', code: 'HDB', bin: '970437', shortName: 'HDBank', logo: 'https://cdn.vietqr.io/img/HDB.png' },
  { id: 41, name: 'Ngân hàng TMCP Quốc tế Việt Nam', code: 'VIB', bin: '970441', shortName: 'VIB', logo: 'https://cdn.vietqr.io/img/VIB.png' },
  { id: 33, name: 'Ngân hàng TMCP Sài Gòn - Hà Nội', code: 'SHB', bin: '970443', shortName: 'SHB', logo: 'https://cdn.vietqr.io/img/SHB.png' },
  { id: 34, name: 'Ngân hàng TMCP Sài Gòn', code: 'SCB', bin: '970429', shortName: 'SCB', logo: 'https://cdn.vietqr.io/img/SCB.png' },
  { id: 24, name: 'Ngân hàng TMCP Hàng Hải', code: 'MSB', bin: '970426', shortName: 'MSB', logo: 'https://cdn.vietqr.io/img/MSB.png' },
  { id: 30, name: 'Ngân hàng TMCP Đông Nam Á', code: 'SEAB', bin: '970440', shortName: 'SeABank', logo: 'https://cdn.vietqr.io/img/SEAB.png' },
  { id: 27, name: 'Ngân hàng TMCP Nam Á', code: 'NAB', bin: '970428', shortName: 'NamABank', logo: 'https://cdn.vietqr.io/img/NAB.png' },
  { id: 28, name: 'Ngân hàng TMCP Quốc Dân', code: 'NCB', bin: '970419', shortName: 'NCB', logo: 'https://cdn.vietqr.io/img/NCB.png' },
  { id: 29, name: 'Ngân hàng TMCP Đại Chúng Việt Nam', code: 'PVCB', bin: '970412', shortName: 'PVcomBank', logo: 'https://cdn.vietqr.io/img/PVCB.png' },
  { id: 22, name: 'Ngân hàng TMCP Bưu Điện Liên Việt', code: 'LPB', bin: '970449', shortName: 'LPBank', logo: 'https://cdn.vietqr.io/img/LPB.png' },
  { id: 3, name: 'Ngân hàng TMCP An Bình', code: 'ABB', bin: '970425', shortName: 'ABBANK', logo: 'https://cdn.vietqr.io/img/ABB.png' },
  { id: 5, name: 'Ngân hàng TMCP Bắc Á', code: 'BAB', bin: '970409', shortName: 'BacABank', logo: 'https://cdn.vietqr.io/img/BAB.png' },
  { id: 45, name: 'Ngân hàng Thương mại TNHH MTV Xây dựng Việt Nam', code: 'CBB', bin: '970444', shortName: 'CB', logo: 'https://cdn.vietqr.io/img/CBB.png' },
  { id: 46, name: 'Ngân hàng Thương mại TNHH MTV Đại Dương', code: 'Oceanbank', bin: '970414', shortName: 'Oceanbank', logo: 'https://cdn.vietqr.io/img/Oceanbank.png' },
  { id: 47, name: 'Ngân hàng Thương mại TNHH MTV Dầu Khí Toàn Cầu', code: 'GPB', bin: '970408', shortName: 'GPBank', logo: 'https://cdn.vietqr.io/img/GPB.png' },
  { id: 32, name: 'Ngân hàng TMCP Sài Gòn Công Thương', code: 'SGB', bin: '970400', shortName: 'SaigonBank', logo: 'https://cdn.vietqr.io/img/SGB.png' },
  { id: 6, name: 'Ngân hàng TMCP Bản Việt', code: 'BVB', bin: '970454', shortName: 'BVBank', logo: 'https://cdn.vietqr.io/img/BVB.png' },
  { id: 40, name: 'Ngân hàng TMCP Việt Á', code: 'VAB', bin: '970427', shortName: 'VietABank', logo: 'https://cdn.vietqr.io/img/VAB.png' },
  { id: 48, name: 'Ngân hàng TMCP Việt Nam Thương Tín', code: 'VIETBANK', bin: '970433', shortName: 'VietBank', logo: 'https://cdn.vietqr.io/img/VIETBANK.png' },
  { id: 49, name: 'Ngân hàng TMCP Bảo Việt', code: 'BVB', bin: '970438', shortName: 'BaoVietBank', logo: 'https://cdn.vietqr.io/img/BaoVietBank.png' },
  { id: 50, name: 'Ngân hàng TMCP Kiên Long', code: 'KLB', bin: '970452', shortName: 'Kienlongbank', logo: 'https://cdn.vietqr.io/img/KLB.png' },
  { id: 51, name: 'Ngân hàng TNHH MTV Shinhan Việt Nam', code: 'SHBVN', bin: '970442', shortName: 'ShinhanBank', logo: 'https://cdn.vietqr.io/img/SHBVN.png' },
  { id: 52, name: 'Ngân hàng TNHH MTV Woori Việt Nam', code: 'WRB', bin: '970457', shortName: 'Woori', logo: 'https://cdn.vietqr.io/img/WRB.png' },
  { id: 53, name: 'Ngân hàng TNHH Indovina', code: 'IVB', bin: '970434', shortName: 'IndovinaBank', logo: 'https://cdn.vietqr.io/img/IVB.png' },
  { id: 54, name: 'Ngân hàng TNHH MTV Standard Chartered Việt Nam', code: 'SCVN', bin: '970410', shortName: 'StandardChartered', logo: 'https://cdn.vietqr.io/img/SCVN.png' },
  { id: 55, name: 'Ngân hàng TNHH MTV HSBC Việt Nam', code: 'HSBC', bin: '458761', shortName: 'HSBC', logo: 'https://cdn.vietqr.io/img/HSBC.png' },
  { id: 56, name: 'Ngân hàng TNHH MTV Public Bank Việt Nam', code: 'PBVN', bin: '970439', shortName: 'PublicBank', logo: 'https://cdn.vietqr.io/img/PBVN.png' },
  { id: 57, name: 'Ngân hàng TNHH MTV CIMB Việt Nam', code: 'CIMB', bin: '422589', shortName: 'CIMB', logo: 'https://cdn.vietqr.io/img/CIMB.png' },
  { id: 58, name: 'Ngân hàng TNHH MTV UOB Việt Nam', code: 'UOB', bin: '970458', shortName: 'UOB', logo: 'https://cdn.vietqr.io/img/UOB.png' },
  { id: 59, name: 'Ngân hàng TNHH MTV Hong Leong Việt Nam', code: 'HLBVN', bin: '970442', shortName: 'HongLeong', logo: 'https://cdn.vietqr.io/img/HLBVN.png' },
  { id: 60, name: 'Ngân hàng Hợp tác xã Việt Nam', code: 'COOPBANK', bin: '970446', shortName: 'Co-opBank', logo: 'https://cdn.vietqr.io/img/COOPBANK.png' },
  { id: 61, name: 'Ví điện tử MoMo', code: 'MOMO', bin: '970422', shortName: 'MoMo', logo: 'https://cdn.vietqr.io/img/MOMO.png' },
  { id: 62, name: 'Viettel Money', code: 'VTMONEY', bin: '970422', shortName: 'ViettelMoney', logo: 'https://cdn.vietqr.io/img/VIETTELMONEY.png' },
  { id: 63, name: 'VNPT Money', code: 'VNPTMONEY', bin: '970422', shortName: 'VNPTMoney', logo: 'https://cdn.vietqr.io/img/VNPTMONEY.png' },
  { id: 64, name: 'ZaloPay', code: 'ZALOPAY', bin: '970422', shortName: 'ZaloPay', logo: 'https://cdn.vietqr.io/img/ZALOPAY.png' },
  { id: 65, name: 'ShopeePay', code: 'SHOPEEPAY', bin: '970422', shortName: 'ShopeePay', logo: 'https://cdn.vietqr.io/img/SHOPEEPAY.png' },
];

async function initVietQRBanksDesktop() {
  try {
    const res = await fetch('https://api.vietqr.io/v2/banks');
    const data = await res.json();
    if (data && data.code === '00' && Array.isArray(data.data) && data.data.length > 0) {
      vietqrBanksList = data.data;
    }
  } catch (e) {
    // Keep fallback list
  }
}
initVietQRBanksDesktop();

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
      commissionRate: currentAffiliateStats?.commissionRate || 15,
      bankName: userProfile.bankName || currentAffiliateStats?.bankName,
      bankAccountNumber: userProfile.bankAccountNumber || currentAffiliateStats?.bankAccountNumber,
      bankAccountHolder: userProfile.bankAccountHolder || currentAffiliateStats?.bankAccountHolder,
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
  const rateBadge = document.getElementById('aff-banner-rate-badge');
  const rateText = document.getElementById('aff-banner-rate-text');

  if (linkEl) linkEl.value = stats.referralLink || '';
  if (codeEl) codeEl.innerText = stats.referralCode || 'N/A';
  if (clicksEl) clicksEl.innerText = (stats.clickCount || 0).toLocaleString('vi-VN');
  if (referredEl) referredEl.innerText = (stats.referredCount || 0).toLocaleString('vi-VN');
  if (earnedEl) earnedEl.innerText = (stats.totalCommissionEarned || 0).toLocaleString('vi-VN') + 'đ';
  if (balanceEl) balanceEl.innerText = (stats.affiliateBalance || 0).toLocaleString('vi-VN') + 'đ';

  if (stats.commissionRate !== undefined) {
    if (rateBadge) rateBadge.innerText = `(${stats.commissionRate}%)`;
    if (rateText) rateText.innerText = `${stats.commissionRate}%`;
  }

  // Pre-fill user bank settings
  if (stats.bankName) {
    updateBankDisplayDesktop('settings', stats.bankName);
    updateBankDisplayDesktop('withdraw', stats.bankName);
  }
  if (stats.bankAccountNumber) {
    const accNo = document.getElementById('user-bank-accno-input');
    if (accNo) accNo.value = stats.bankAccountNumber;
    const payoutAccNo = document.getElementById('aff-payout-accno-input');
    if (payoutAccNo) payoutAccNo.value = stats.bankAccountNumber;
  }
  if (stats.bankAccountHolder) {
    const holder = document.getElementById('user-bank-holder-input');
    if (holder) holder.value = stats.bankAccountHolder;
    const payoutHolder = document.getElementById('aff-payout-holder-input');
    if (payoutHolder) payoutHolder.value = stats.bankAccountHolder;
  }

  // Update min payout threshold
  if (stats.minPayoutThreshold) {
    const amountInput = document.getElementById('aff-payout-amount-input');
    if (amountInput) {
      amountInput.min = String(stats.minPayoutThreshold);
      if (Number(amountInput.value) < stats.minPayoutThreshold) {
        amountInput.value = String(stats.minPayoutThreshold);
      }
    }
    const hint = document.getElementById('aff-min-payout-hint');
    if (hint) hint.innerText = `* Tối thiểu ${stats.minPayoutThreshold.toLocaleString('vi-VN')} VNĐ`;
  }
}

function findBankByNameDesktop(name) {
  if (!name) return null;
  const n = name.trim().toLowerCase();
  return vietqrBanksList.find(b => 
    b.shortName.toLowerCase() === n ||
    b.name.toLowerCase() === n ||
    b.code.toLowerCase() === n ||
    n.includes(b.shortName.toLowerCase()) ||
    n.includes(b.code.toLowerCase())
  );
}

function updateBankDisplayDesktop(target, bankName) {
  const bank = findBankByNameDesktop(bankName) || { shortName: bankName, logo: '', code: '' };
  
  if (target === 'settings') {
    const input = document.getElementById('user-bank-name-input');
    if (input) input.value = bank.shortName;
    const display = document.getElementById('user-bank-selected-display');
    if (display) {
      display.innerHTML = `
        ${bank.logo ? `<img src="${bank.logo}" alt="${bank.shortName}" style="height: 20px; max-width: 50px; object-fit: contain;" />` : `<span data-icon="building" style="color: var(--accent);"></span>`}
        <span id="user-bank-selected-name" style="font-weight: 700;">${bank.shortName}</span>
        ${bank.code ? `<span style="font-size: 10px; padding: 1px 5px; border-radius: 4px; background: rgba(99, 102, 241, 0.15); color: var(--accent);">${bank.code}</span>` : ''}
      `;
    }
  } else {
    const input = document.getElementById('aff-payout-bank-select');
    if (input) input.value = bank.shortName;
    const display = document.getElementById('aff-payout-bank-display');
    if (display) {
      display.innerHTML = `
        ${bank.logo ? `<img src="${bank.logo}" alt="${bank.shortName}" style="height: 20px; max-width: 50px; object-fit: contain;" />` : `<span data-icon="building" style="color: var(--accent);"></span>`}
        <span id="aff-payout-bank-name" style="font-weight: 700;">${bank.shortName}</span>
        ${bank.code ? `<span style="font-size: 10px; padding: 1px 5px; border-radius: 4px; background: rgba(99, 102, 241, 0.15); color: var(--accent);">${bank.code}</span>` : ''}
      `;
    }
  }
}

function openBankPickerModalDesktop(target = 'settings') {
  bankPickerTargetDesktop = target;
  const modal = document.getElementById('desktop-bank-picker-modal');
  const searchInput = document.getElementById('desktop-bank-search-input');
  if (searchInput) searchInput.value = '';
  renderBankListDesktop(vietqrBanksList);
  if (modal) modal.style.display = 'flex';
  if (searchInput) setTimeout(() => searchInput.focus(), 100);
}

function closeBankPickerModalDesktop() {
  const modal = document.getElementById('desktop-bank-picker-modal');
  if (modal) modal.style.display = 'none';
}

function filterBanksDesktop() {
  const searchInput = document.getElementById('desktop-bank-search-input');
  const q = (searchInput?.value || '').trim().toLowerCase();
  if (!q) {
    renderBankListDesktop(vietqrBanksList);
    return;
  }
  const filtered = vietqrBanksList.filter(b => 
    b.shortName.toLowerCase().includes(q) ||
    b.name.toLowerCase().includes(q) ||
    b.code.toLowerCase().includes(q) ||
    (b.bin && b.bin.includes(q))
  );
  renderBankListDesktop(filtered, q);
}

function renderBankListDesktop(banks, query = '') {
  const container = document.getElementById('desktop-bank-list-container');
  if (!container) return;

  if (!banks || banks.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 12px;">Không tìm thấy ngân hàng nào phù hợp với "${query}".</div>`;
    return;
  }

  const currentVal = (bankPickerTargetDesktop === 'settings' 
    ? document.getElementById('user-bank-name-input')?.value 
    : document.getElementById('aff-payout-bank-select')?.value) || '';

  container.innerHTML = banks.map(b => {
    const isSelected = currentVal === b.shortName || currentVal === b.code;
    return `
      <div 
        onclick="selectBankDesktop('${b.shortName}')" 
        style="display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 12px; border-radius: 8px; border: 1px solid ${isSelected ? 'var(--accent)' : 'var(--border-color)'}; background: ${isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-primary)'}; cursor: pointer; transition: all 0.15s ease;"
        onmouseover="this.style.borderColor='var(--accent)'"
        onmouseout="this.style.borderColor='${isSelected ? 'var(--accent)' : 'var(--border-color)'}'"
      >
        <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
          <div style="width: 50px; height: 30px; background: #fff; border-radius: 6px; padding: 2px 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <img src="${b.logo}" alt="${b.shortName}" style="max-height: 100%; max-width: 100%; object-fit: contain;" onerror="this.style.display='none'" />
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-weight: 800; font-size: 12px; color: var(--text-primary);">${b.shortName}</span>
              <span style="font-size: 10px; font-weight: 700; padding: 1px 4px; border-radius: 4px; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-muted);">${b.code}</span>
            </div>
            <div style="font-size: 11px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 1px;">${b.name}</div>
          </div>
        </div>
        ${isSelected ? `<span style="color: var(--accent); display: flex; align-items: center;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>` : ''}
      </div>
    `;
  }).join('');
}

function selectBankDesktop(shortName) {
  updateBankDisplayDesktop(bankPickerTargetDesktop, shortName);
  closeBankPickerModalDesktop();
}

function copyAffiliateLinkDesktop() {
  const linkEl = document.getElementById('aff-ref-link-input');
  const link = linkEl ? linkEl.value : '';
  if (!link) return;
  navigator.clipboard.writeText(link);
  if (typeof showToast === 'function') {
    showToast('Đã sao chép link tiếp thị!', 'Dán và chia sẻ cho bạn bè để nhận hoa hồng.', 'success');
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
  const tabs = ['referrals', 'commissions', 'payouts', 'bank'];
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

async function saveUserBankSettingsDesktop(event) {
  if (event) event.preventDefault();

  const bankSelect = document.getElementById('user-bank-name-input');
  const accNoInput = document.getElementById('user-bank-accno-input');
  const holderInput = document.getElementById('user-bank-holder-input');

  const bankName = (bankSelect?.value || '').trim();
  const bankAccountNumber = (accNoInput?.value || '').trim();
  const bankAccountHolder = (holderInput?.value || '').trim().toUpperCase();

  if (!bankName || !bankAccountNumber || !bankAccountHolder) {
    if (typeof showToast === 'function') {
      showToast('Thiếu thông tin', 'Vui lòng nhập đầy đủ ngân hàng, số tài khoản và tên chủ thẻ', 'warning');
    }
    return;
  }

  try {
    await apiFetch('/affiliate/bank-settings', {
      method: 'PATCH',
      body: { bankName, bankAccountNumber, bankAccountHolder }
    });

    if (currentAffiliateStats) {
      currentAffiliateStats.bankName = bankName;
      currentAffiliateStats.bankAccountNumber = bankAccountNumber;
      currentAffiliateStats.bankAccountHolder = bankAccountHolder;
    }

    // Sync to modal as well
    const payoutBank = document.getElementById('aff-payout-bank-select');
    if (payoutBank) payoutBank.value = bankName;
    const payoutAcc = document.getElementById('aff-payout-accno-input');
    if (payoutAcc) payoutAcc.value = bankAccountNumber;
    const payoutHolder = document.getElementById('aff-payout-holder-input');
    if (payoutHolder) payoutHolder.value = bankAccountHolder;

    if (typeof showToast === 'function') {
      showToast('Đã lưu cài đặt ngân hàng!', 'Tài khoản này sẽ tự động điền khi bạn gửi yêu cầu rút tiền.', 'success');
    }
  } catch (err) {
    if (typeof showToast === 'function') {
      showToast('Lưu thất bại', err.message || 'Vui lòng kiểm tra lại', 'error');
    }
  }
}

async function loadAffiliateReferralsDesktop(page = 1) {
  const tbody = document.getElementById('aff-referrals-tbody');
  const cards = document.getElementById('aff-referrals-cards');
  if (!tbody && !cards) return;

  if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--text-muted);">Đang tải danh sách thành viên...</td></tr>`;
  if (cards) cards.innerHTML = `<div style="grid-column: 1/-1; text-align:center;padding:24px;color:var(--text-muted);">Đang tải danh sách...</div>`;

  try {
    const data = await apiFetch(`/affiliate/referrals?page=${page}&limit=10`);
    const items = data.items || [];

    if (items.length === 0) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--text-muted);">Chưa có thành viên nào đăng ký qua link của bạn.</td></tr>`;
      if (cards) cards.innerHTML = `<div style="grid-column: 1/-1; text-align:center;padding:32px;color:var(--text-muted);">Chưa có thành viên nào đăng ký qua link của bạn.</div>`;
      return;
    }

    if (tbody) {
      tbody.innerHTML = items.map(item => `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 10px 12px; font-weight: 700; color: var(--text-primary);">${item.maskedEmail}</td>
          <td style="padding: 10px 12px; color: var(--text-muted);">${new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
          <td style="padding: 10px 12px; text-align: center;">
            <span style="padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; background: ${item.isVerified ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)'}; color: ${item.isVerified ? '#22c55e' : '#eab308'};">
              ${item.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
            </span>
          </td>
          <td style="padding: 10px 12px; text-align: right; font-weight: 800; color: #eab308;">
            ${(item.totalCommissionGenerated || 0).toLocaleString('vi-VN')}đ
          </td>
        </tr>
      `).join('');
    }

    if (cards) {
      cards.innerHTML = items.map(item => `
        <div class="payout-item-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span style="font-weight: 700; color: var(--text-primary); font-size: 13px;">${item.maskedEmail}</span>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${new Date(item.createdAt).toLocaleDateString('vi-VN')}</div>
            </div>
            <span style="padding: 2px 8px; border-radius: 8px; font-size: 10px; font-weight: 700; background: ${item.isVerified ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)'}; color: ${item.isVerified ? '#22c55e' : '#eab308'};">
              ${item.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 8px;">
            <span style="font-size: 11px; color: var(--text-muted);">Hoa hồng tạo ra:</span>
            <span style="font-weight: 800; color: #eab308; font-size: 13px;">${(item.totalCommissionGenerated || 0).toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('[Affiliate Desktop] Error loading referrals:', err);
    if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--text-muted);">Không thể tải danh sách.</td></tr>`;
  }
}

async function loadAffiliateCommissionsDesktop(page = 1) {
  const tbody = document.getElementById('aff-commissions-tbody');
  const cards = document.getElementById('aff-commissions-cards');
  if (!tbody && !cards) return;

  if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">Đang tải lịch sử hoa hồng...</td></tr>`;
  if (cards) cards.innerHTML = `<div style="grid-column: 1/-1; text-align:center;padding:24px;color:var(--text-muted);">Đang tải lịch sử...</div>`;

  try {
    const data = await apiFetch(`/affiliate/commissions?page=${page}&limit=10`);
    const items = data.items || [];

    if (items.length === 0) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);">Chưa có hoa hồng phát sinh.</td></tr>`;
      if (cards) cards.innerHTML = `<div style="grid-column: 1/-1; text-align:center;padding:32px;color:var(--text-muted);">Chưa có hoa hồng phát sinh.</div>`;
      return;
    }

    if (tbody) {
      tbody.innerHTML = items.map(comm => `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 10px 12px; font-weight: 800; color: var(--accent);">#${comm.code}</td>
          <td style="padding: 10px 12px; font-weight: 600;">${comm.referredUserEmail}</td>
          <td style="padding: 10px 12px;"><span style="padding: 2px 6px; border-radius: 6px; background: rgba(99, 102, 241, 0.15); color: #818cf8; font-size: 11px; font-weight: 700;">${comm.sourceType === 'DEPOSIT' ? 'Nạp tiền' : 'Mua gói'}</span></td>
          <td style="padding: 10px 12px; color: var(--text-muted); text-align: right;">${(comm.orderAmount || 0).toLocaleString('vi-VN')}đ</td>
          <td style="padding: 10px 12px; font-weight: 700; color: #3b82f6; text-align: center;">${comm.rate}%</td>
          <td style="padding: 10px 12px; text-align: right; font-weight: 900; color: #22c55e;">+${(comm.commissionAmount || 0).toLocaleString('vi-VN')}đ</td>
          <td style="padding: 10px 12px; color: var(--text-muted); font-size: 11px;">${new Date(comm.createdAt).toLocaleString('vi-VN')}</td>
        </tr>
      `).join('');
    }

    if (cards) {
      cards.innerHTML = items.map(comm => `
        <div class="payout-item-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span style="font-weight: 800; color: var(--accent); font-size: 12px;">#${comm.code}</span>
              <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">${comm.referredUserEmail}</div>
            </div>
            <span style="padding: 2px 6px; border-radius: 6px; background: rgba(99, 102, 241, 0.15); color: #818cf8; font-size: 10px; font-weight: 700;">
              ${comm.sourceType === 'DEPOSIT' ? 'Nạp tiền' : 'Mua gói'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 8px;">
            <div style="font-size: 11px; color: var(--text-muted);">${(comm.orderAmount || 0).toLocaleString('vi-VN')}đ (${comm.rate}%)</div>
            <div style="font-weight: 900; color: #22c55e; font-size: 14px;">+${(comm.commissionAmount || 0).toLocaleString('vi-VN')}đ</div>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('[Affiliate Desktop] Error loading commissions:', err);
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">Không thể tải lịch sử hoa hồng.</td></tr>`;
  }
}

async function loadAffiliatePayoutsDesktop(page = 1) {
  const tbody = document.getElementById('aff-payouts-tbody');
  const cards = document.getElementById('aff-payouts-cards');
  if (!tbody && !cards) return;

  if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">Đang tải lịch sử rút tiền...</td></tr>`;
  if (cards) cards.innerHTML = `<div style="grid-column: 1/-1; text-align:center;padding:24px;color:var(--text-muted);">Đang tải lịch sử...</div>`;

  try {
    const data = await apiFetch(`/affiliate/payouts?page=${page}&limit=10`);
    const items = data.items || [];

    if (items.length === 0) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);">Chưa có yêu cầu rút tiền nào.</td></tr>`;
      if (cards) cards.innerHTML = `<div style="grid-column: 1/-1; text-align:center;padding:32px;color:var(--text-muted);">Chưa có yêu cầu rút tiền nào.</div>`;
      return;
    }

    if (tbody) {
      tbody.innerHTML = items.map(p => {
        const statusBadge = p.status === 'APPROVED'
          ? `<span style="padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; background: rgba(34, 197, 94, 0.15); color: #22c55e;">Đã duyệt</span>`
          : p.status === 'REJECTED'
          ? `<span style="padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; background: rgba(239, 68, 68, 0.15); color: #ef4444;">Từ chối</span>`
          : `<span style="padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; background: rgba(234, 179, 8, 0.15); color: #eab308;">Chờ duyệt</span>`;

        return `
          <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 10px 12px; font-weight: 800; color: var(--accent);">#${p.code}</td>
            <td style="padding: 10px 12px; font-weight: 900; color: #22c55e; text-align: right;">${(p.amount || 0).toLocaleString('vi-VN')}đ</td>
            <td style="padding: 10px 12px;">${p.bankName} - ${p.accountNumber}</td>
            <td style="padding: 10px 12px; font-weight: 600; text-transform: uppercase;">${p.accountHolder}</td>
            <td style="padding: 10px 12px;">${statusBadge}</td>
            <td style="padding: 10px 12px; color: var(--text-muted); font-size: 11px;">${p.adminNote || '-'}</td>
            <td style="padding: 10px 12px; color: var(--text-muted); font-size: 11px;">${new Date(p.createdAt).toLocaleString('vi-VN')}</td>
          </tr>
        `;
      }).join('');
    }

    if (cards) {
      cards.innerHTML = items.map(p => {
        const statusBadge = p.status === 'APPROVED'
          ? `<span style="padding: 2px 8px; border-radius: 8px; font-size: 10px; font-weight: 700; background: rgba(34, 197, 94, 0.15); color: #22c55e;">Đã duyệt</span>`
          : p.status === 'REJECTED'
          ? `<span style="padding: 2px 8px; border-radius: 8px; font-size: 10px; font-weight: 700; background: rgba(239, 68, 68, 0.15); color: #ef4444;">Từ chối</span>`
          : `<span style="padding: 2px 8px; border-radius: 8px; font-size: 10px; font-weight: 700; background: rgba(234, 179, 8, 0.15); color: #eab308;">Chờ duyệt</span>`;

        return `
          <div class="payout-item-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span style="font-weight: 800; color: var(--accent); font-size: 12px;">#${p.code}</span>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${new Date(p.createdAt).toLocaleDateString('vi-VN')}</div>
              </div>
              <div>${statusBadge}</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 8px;">
              <div style="font-size: 11px; color: var(--text-secondary);">${p.bankName} - ${p.accountNumber}</div>
              <div style="font-weight: 900; color: #22c55e; font-size: 14px;">${(p.amount || 0).toLocaleString('vi-VN')}đ</div>
            </div>
          </div>
        `;
      }).join('');
    }
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
  const saveDefaultCheckbox = document.getElementById('aff-payout-save-default');

  const amount = Number(amountInput?.value || 0);
  const bankName = bankSelect?.value || 'MBBank';
  const accountNumber = (accNoInput?.value || '').trim();
  const accountHolder = (accHolderInput?.value || '').trim().toUpperCase();
  const saveAsDefault = saveDefaultCheckbox ? saveDefaultCheckbox.checked : true;

  const minPayout = currentAffiliateStats?.minPayoutThreshold || 200000;
  if (!amount || amount < minPayout) {
    if (typeof showToast === 'function') showToast(`Số tiền rút tối thiểu là ${minPayout.toLocaleString('vi-VN')} VNĐ`, 'warning');
    return;
  }
  if (!accountNumber || !accountHolder) {
    if (typeof showToast === 'function') showToast('Vui lòng điền đầy đủ số tài khoản và tên chủ tài khoản', 'warning');
    return;
  }

  try {
    await apiFetch('/affiliate/payout-request', {
      method: 'POST',
      body: { amount, bankName, accountNumber, accountHolder, saveAsDefault }
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

// =================================================================
// ADMIN PAYOUTS MANAGEMENT DESKTOP LOGIC (ADMIN-ONLY)
// =================================================================

let adminPayoutSearchTimeout = null;
let currentAdminPayoutSearch = '';

function searchAdminPayoutsDesktop() {
  const input = document.getElementById('admin-payout-search-input');
  const val = (input?.value || '').trim();
  currentAdminPayoutSearch = val;

  if (adminPayoutSearchTimeout) clearTimeout(adminPayoutSearchTimeout);
  adminPayoutSearchTimeout = setTimeout(() => {
    loadAdminPayoutsDesktop(1);
  }, 300);
}

async function loadAdminPayoutsDesktop(page = 1) {
  currentAdminPayoutPage = page;
  const tbody = document.getElementById('admin-payouts-tbody');
  const cardsContainer = document.getElementById('admin-payouts-cards');
  if (!tbody && !cardsContainer) return;

  if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:28px;color:var(--text-muted);">Đang tải danh sách đơn rút tiền...</td></tr>`;
  if (cardsContainer) cardsContainer.innerHTML = `<div style="grid-column: 1/-1; text-align:center;padding:28px;color:var(--text-muted);">Đang tải danh sách đơn rút tiền...</div>`;

  try {
    // 1. Load Stats
    const statsUrl = `/affiliate/admin/stats`;
    const stats = await apiFetch(statsUrl);
    if (stats) {
      const clickEl = document.getElementById('admin-aff-stat-clicks');
      const refEl = document.getElementById('admin-aff-stat-refs');
      const paidEl = document.getElementById('admin-aff-stat-paid');
      const pendingCountEl = document.getElementById('admin-aff-stat-pending-count');
      const pendingAmountEl = document.getElementById('admin-aff-stat-pending-amount');

      if (clickEl) clickEl.innerText = (stats.totalReferralClicks || 0).toLocaleString('vi-VN');
      if (refEl) refEl.innerText = (stats.totalReferredUsers || 0).toLocaleString('vi-VN');
      if (paidEl) paidEl.innerText = (stats.totalCommissionsPaid || 0).toLocaleString('vi-VN') + 'đ';
      if (pendingCountEl) pendingCountEl.innerText = String(stats.pendingPayoutsCount || 0);
      if (pendingAmountEl) pendingAmountEl.innerText = (stats.totalPendingPayoutsAmount || 0).toLocaleString('vi-VN') + 'đ';
    }

    // 2. Load Payouts list
    let payoutsUrl = `/affiliate/admin/payouts?page=${page}&limit=20`;
    if (currentAdminPayoutFilter && currentAdminPayoutFilter !== 'all') {
      payoutsUrl += `&status=${currentAdminPayoutFilter}`;
    }
    if (currentAdminPayoutSearch) {
      payoutsUrl += `&search=${encodeURIComponent(currentAdminPayoutSearch)}`;
    }

    const data = await apiFetch(payoutsUrl);
    const items = data.items || [];

    if (items.length === 0) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:36px;color:var(--text-muted);">Không có đơn rút tiền nào phù hợp với từ khóa tra cứu.</td></tr>`;
      if (cardsContainer) cardsContainer.innerHTML = `<div style="grid-column: 1/-1; text-align:center;padding:36px;color:var(--text-muted);">Không có đơn rút tiền nào phù hợp với từ khóa tra cứu.</div>`;
      return;
    }

    // Render Desktop Table Rows
    if (tbody) {
      tbody.innerHTML = items.map(p => {
        const statusBadge = p.status === 'APPROVED'
          ? `<span style="padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; background: rgba(34, 197, 94, 0.15); color: #22c55e;">Đã duyệt</span>`
          : p.status === 'REJECTED'
          ? `<span style="padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; background: rgba(239, 68, 68, 0.15); color: #ef4444;">Từ chối</span>`
          : `<span style="padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; background: rgba(234, 179, 8, 0.15); color: #eab308;">Chờ duyệt</span>`;

        const actionButtons = `
          <div style="display: flex; gap: 4px; justify-content: center; align-items: center;">
            <button type="button" onclick="openAdminPayoutAuditModalDesktop('${p.id}')" title="Tra cứu dòng tiền" style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.35); color: var(--accent); border-radius: 6px; padding: 4px 7px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              Tra cứu
            </button>
            ${p.status === 'PENDING' ? `
              <button type="button" onclick="openAdminPayoutActionModal('${p.id}', '${p.code}', ${p.amount}, '${p.userEmail || ''}', 'APPROVED', '${p.bankName}', '${p.accountNumber}', '${p.accountHolder}', ${p.fee || 0}, ${p.netAmount || (p.amount - (p.fee || 0))})" style="background: rgba(34, 197, 94, 0.2); border: 1px solid rgba(34, 197, 94, 0.4); color: #22c55e; border-radius: 6px; padding: 4px 7px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 3px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Duyệt
              </button>
              <button type="button" onclick="openAdminPayoutActionModal('${p.id}', '${p.code}', ${p.amount}, '${p.userEmail || ''}', 'REJECTED', '${p.bankName}', '${p.accountNumber}', '${p.accountHolder}', ${p.fee || 0}, ${p.netAmount || (p.amount - (p.fee || 0))})" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #ef4444; border-radius: 6px; padding: 4px 7px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 3px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                Từ chối
              </button>
            ` : ''}
          </div>
        `;

        const fee = p.fee || 0;
        const netAmount = p.netAmount || ((p.amount || 0) - fee);

        return `
          <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 10px 12px; font-weight: 800; color: var(--accent);">#${p.code}</td>
            <td style="padding: 10px 12px;">
              <div style="font-weight: 700; color: var(--text-primary);">${p.userEmail || 'N/A'}</div>
              <div style="font-size: 10px; color: var(--text-muted);">${p.username ? '@' + p.username : ''}</div>
            </td>
            <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: var(--text-secondary);">
              ${(p.amount || 0).toLocaleString('vi-VN')}đ
            </td>
            <td style="padding: 10px 12px; text-align: right; font-size: 11px; color: ${fee > 0 ? '#ef4444' : 'var(--text-muted)'};">
              ${fee > 0 ? `-${fee.toLocaleString('vi-VN')}đ` : '0đ (Miễn phí)'}
            </td>
            <td style="padding: 10px 12px; text-align: right; font-weight: 900; color: #22c55e;">
              ${netAmount.toLocaleString('vi-VN')}đ
            </td>
            <td style="padding: 10px 12px; font-weight: 600;">
              <div>${p.bankName}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${p.accountNumber}</div>
            </td>
            <td style="padding: 10px 12px; font-weight: 700; text-transform: uppercase;">${p.accountHolder}</td>
            <td style="padding: 10px 12px;">${statusBadge}</td>
            <td style="padding: 10px 12px; color: var(--text-muted); font-size: 11px;">${new Date(p.createdAt).toLocaleString('vi-VN')}</td>
            <td style="padding: 10px 12px; text-align: center;">${actionButtons}</td>
          </tr>
        `;
      }).join('');
    }

    // Render Responsive Card Grid (For Small Windows)
    if (cardsContainer) {
      cardsContainer.innerHTML = items.map(p => {
        const statusBadge = p.status === 'APPROVED'
          ? `<span style="padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; background: rgba(34, 197, 94, 0.15); color: #22c55e;">Đã duyệt</span>`
          : p.status === 'REJECTED'
          ? `<span style="padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; background: rgba(239, 68, 68, 0.15); color: #ef4444;">Từ chối</span>`
          : `<span style="padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; background: rgba(234, 179, 8, 0.15); color: #eab308;">Chờ duyệt</span>`;

        const fee = p.fee || 0;
        const netAmount = p.netAmount || ((p.amount || 0) - fee);

        const actionButtons = `
          <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px;">
            <button type="button" onclick="openAdminPayoutAuditModalDesktop('${p.id}')" style="width: 100%; box-sizing: border-box; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.35); color: var(--accent); border-radius: 8px; padding: 8px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              Tra cứu dòng tiền (Audit Trail)
            </button>
            ${p.status === 'PENDING' ? `
              <div style="display: flex; gap: 6px; width: 100%;">
                <button type="button" onclick="openAdminPayoutActionModal('${p.id}', '${p.code}', ${p.amount}, '${p.userEmail || ''}', 'APPROVED', '${p.bankName}', '${p.accountNumber}', '${p.accountHolder}', ${fee}, ${netAmount})" style="flex: 1; background: #22c55e; color: #fff; border: none; border-radius: 8px; padding: 8px; font-size: 11px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Duyệt
                </button>
                <button type="button" onclick="openAdminPayoutActionModal('${p.id}', '${p.code}', ${p.amount}, '${p.userEmail || ''}', 'REJECTED', '${p.bankName}', '${p.accountNumber}', '${p.accountHolder}', ${fee}, ${netAmount})" style="flex: 1; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); color: #ef4444; border-radius: 8px; padding: 8px; font-size: 11px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  Từ chối
                </button>
              </div>
            ` : ''}
          </div>
        `;

        return `
          <div class="payout-admin-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span style="font-weight: 800; color: var(--accent); font-size: 13px;">#${p.code}</span>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${new Date(p.createdAt).toLocaleString('vi-VN')}</div>
              </div>
              <div>${statusBadge}</div>
            </div>

            <div style="margin: 8px 0; padding: 8px 10px; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 11px; color: var(--text-muted);">Số tiền rút:</span>
                <span style="font-weight: 700; color: var(--text-primary); font-size: 13px;">${(p.amount || 0).toLocaleString('vi-VN')}đ</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 11px; color: var(--text-muted);">Phí xử lý:</span>
                <span style="font-size: 11px; color: ${fee > 0 ? '#ef4444' : 'var(--text-muted)'};">${fee > 0 ? `-${fee.toLocaleString('vi-VN')}đ` : 'Miễn phí'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--border-color); paddingTop: 4px;">
                <span style="font-size: 11px; font-weight: 700; color: var(--text-primary);">Thực nhận:</span>
                <span style="font-weight: 900; color: #22c55e; font-size: 15px;">${netAmount.toLocaleString('vi-VN')}đ</span>
              </div>
              <div style="font-size: 11px; color: var(--text-primary); font-weight: 700; margin-top: 4px;">
                ${p.userEmail || 'N/A'} ${p.username ? '<span style="color:var(--text-muted);font-weight:normal;">(@' + p.username + ')</span>' : ''}
              </div>
              <div style="font-size: 11px; color: var(--text-secondary);">
                <strong>${p.bankName}</strong>: ${p.accountNumber}
              </div>
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-primary);">
                CTK: ${p.accountHolder}
              </div>
            </div>

            ${p.adminNote ? `<div style="font-size: 11px; color: var(--text-muted); font-style: italic;">Ghi chú: ${p.adminNote}</div>` : ''}

            ${actionButtons}
          </div>
        `;
      }).join('');
    }
  } catch (err) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:36px;color:#ef4444;">Lỗi tải dữ liệu: ${err.message || 'Lỗi hệ thống'}</td></tr>`;
    if (cardsContainer) cardsContainer.innerHTML = `<div style="grid-column: 1/-1; text-align:center;padding:36px;color:#ef4444;">Lỗi tải dữ liệu: ${err.message || 'Lỗi hệ thống'}</div>`;
  }
}

async function openAdminPayoutAuditModalDesktop(payoutId) {
  const modal = document.getElementById('admin-payout-audit-modal-desktop');
  const container = document.getElementById('admin-payout-audit-content');
  if (!modal || !container) return;

  container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);font-size:12px;">Đang tra cứu dữ liệu giao dịch F1 và xác minh nguồn tiền...</div>`;
  modal.style.display = 'flex';

  try {
    const data = await apiFetch(`/affiliate/admin/payouts/${payoutId}/audit`);
    if (!data) throw new Error('Không có dữ liệu');

    const formatVnd = (n) => (n || 0).toLocaleString('vi-VN') + 'đ';
    const fee = data.payout.fee || 0;
    const netAmount = data.payout.netAmount || (data.payout.amount - fee);

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <!-- Metrics -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
          <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 10px; padding: 10px 12px;">
            <div style="font-size: 10px; color: var(--text-muted);">Người yêu cầu rút:</div>
            <div style="font-weight: 800; color: var(--text-primary); font-size: 12px; margin-top: 2px;">${data.user.email}</div>
            <div style="font-size: 10px; color: var(--accent); margin-top: 2px;">Mã ref: <strong>${data.user.referralCode}</strong></div>
          </div>

          <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 10px; padding: 10px 12px;">
            <div style="font-size: 10px; color: var(--text-muted);">Số tiền yêu cầu rút:</div>
            <div style="font-weight: 900; color: #22c55e; font-size: 16px; margin-top: 2px;">${formatVnd(data.payout.amount)}</div>
            <div style="font-size: 10px; color: var(--text-secondary); margin-top: 2px;">
              Phí: ${fee > 0 ? formatVnd(fee) : 'Miễn phí'} | Thực nhận: <strong>${formatVnd(netAmount)}</strong>
            </div>
          </div>

          <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 10px; padding: 10px 12px;">
            <div style="font-size: 10px; color: var(--text-muted);">Tổng tiền F1 nạp thực tế:</div>
            <div style="font-weight: 900; color: #3b82f6; font-size: 16px; margin-top: 2px;">${formatVnd(data.summary.totalOrderAmountByDownlines)}</div>
            <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Từ ${data.summary.totalDownlineOrdersCount} hóa đơn của F1</div>
          </div>
        </div>

        <!-- Security Badge -->
        <div style="background: ${data.summary.isLegitBalance ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)'}; border: 1px solid ${data.summary.isLegitBalance ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}; border-radius: 10px; padding: 12px; font-size: 11px; line-height: 1.5;">
          <div style="font-weight: 800; color: ${data.summary.isLegitBalance ? '#22c55e' : '#ef4444'}; margin-bottom: 2px; display: flex; align-items: center; gap: 5px;">
            ${data.summary.isLegitBalance ? `
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
              XÁC MINH DÒNG TIỀN: HỢP LỆ (TIỀN THẬT 100%)
            ` : `
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              CẢNH BÁO: CÓ DẤU HIỆU BẤT THƯỜNG
            `}
          </div>
          <div style="color: var(--text-secondary); margin-top: 4px;">
            Tổng hoa hồng tích lũy là <strong>${formatVnd(data.user.totalCommissionEarned)}</strong>, sinh ra từ doanh thu nạp thực tế <strong>${formatVnd(data.summary.totalOrderAmountByDownlines)}</strong> của F1. Số tiền rút <strong>${formatVnd(data.payout.amount)}</strong> nằm hoàn toàn trong hạn mức chi trả.
          </div>
        </div>

        <!-- Invoices List -->
        <div>
          <div style="font-size: 12px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">
            Chi Tiết Hóa Đơn Nạp/Mua Gói Của F1 Tạo Ra Hoa Hồng:
          </div>
          ${data.commissions.length === 0 ? `
            <div style="text-align: center; padding: 16px; background: var(--bg-primary); border-radius: 8px; color: var(--text-muted); font-size: 11px;">Chưa có lịch sử hoa hồng.</div>
          ` : `
            <div style="overflow-x: auto; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 10px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
                    <th style="padding: 7px 9px;">Mã HH</th>
                    <th style="padding: 7px 9px;">F1 Mua/Nạp</th>
                    <th style="padding: 7px 9px;">Nguồn</th>
                    <th style="padding: 7px 9px; text-align: right;">F1 Đã Trả</th>
                    <th style="padding: 7px 9px; text-align: center;">%</th>
                    <th style="padding: 7px 9px; text-align: right;">Hoa Hồng</th>
                    <th style="padding: 7px 9px;">Thời Gian</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.commissions.map(c => `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <td style="padding: 7px 9px; font-weight: 800; color: var(--accent);">#${c.code}</td>
                      <td style="padding: 7px 9px; font-weight: 700; color: var(--text-primary);">${c.buyerEmail}</td>
                      <td style="padding: 7px 9px;">
                        <span style="padding: 2px 5px; border-radius: 4px; background: ${c.sourceType === 'DEPOSIT' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(168, 85, 247, 0.15)'}; color: ${c.sourceType === 'DEPOSIT' ? '#818cf8' : '#c084fc'}; font-size: 9px; font-weight: 700;">
                          ${c.sourceType === 'DEPOSIT' ? 'Nạp tiền' : 'Mua gói'}
                        </span>
                      </td>
                      <td style="padding: 7px 9px; text-align: right; font-weight: 700; color: var(--text-secondary);">${formatVnd(c.orderAmount)}</td>
                      <td style="padding: 7px 9px; text-align: center; font-weight: 700; color: #3b82f6;">${c.rate}%</td>
                      <td style="padding: 7px 9px; text-align: right; font-weight: 900; color: #22c55e;">+${formatVnd(c.commissionAmount)}</td>
                      <td style="padding: 7px 9px; color: var(--text-muted); font-size: 10px;">${new Date(c.createdAt).toLocaleString('vi-VN')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>

        <!-- Actions -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 12px; margin-top: 2px;">
          <button type="button" onclick="closeAdminPayoutAuditModalDesktop()" style="padding: 7px 14px; border-radius: 8px; border: 1px solid var(--border-color); background: transparent; color: var(--text-primary); font-size: 11px; font-weight: 700; cursor: pointer;">
            Đóng
          </button>
          ${data.payout.status === 'PENDING' ? `
            <div style="display: flex; gap: 6px;">
              <button type="button" onclick="closeAdminPayoutAuditModalDesktop(); openAdminPayoutActionModal('${data.payout.id}', '${data.payout.code}', ${data.payout.amount}, '${data.user.email}', 'REJECTED', '${data.payout.bankName}', '${data.payout.accountNumber}', '${data.payout.accountHolder}', ${fee}, ${netAmount})" style="padding: 7px 12px; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.15); color: #ef4444; font-size: 11px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                Từ Chối Đơn
              </button>
              <button type="button" onclick="closeAdminPayoutAuditModalDesktop(); openAdminPayoutActionModal('${data.payout.id}', '${data.payout.code}', ${data.payout.amount}, '${data.user.email}', 'APPROVED', '${data.payout.bankName}', '${data.payout.accountNumber}', '${data.payout.accountHolder}', ${fee}, ${netAmount})" style="padding: 7px 14px; border-radius: 8px; border: none; background: #22c55e; color: #fff; font-size: 11px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Duyệt Chi Ngay
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="text-align:center;padding:30px;color:#ef4444;font-size:12px;">Không thể tra cứu thông tin dòng tiền: ${err.message || 'Lỗi hệ thống'}</div>`;
  }
}

function closeAdminPayoutAuditModalDesktop() {
  const modal = document.getElementById('admin-payout-audit-modal-desktop');
  if (modal) modal.style.display = 'none';
}

function filterAdminPayoutsDesktop(status) {
  currentAdminPayoutFilter = status;
  const filters = ['pending', 'approved', 'rejected', 'all'];
  filters.forEach(f => {
    const btn = document.getElementById(`admin-payout-filter-${f}`);
    if (btn) {
      if (f.toLowerCase() === status.toLowerCase()) {
        btn.classList.add('active');
        btn.style.background = 'rgba(234, 179, 8, 0.2)';
        btn.style.color = '#eab308';
      } else {
        btn.classList.remove('active');
        btn.style.background = 'transparent';
        btn.style.color = 'var(--text-muted)';
      }
    }
  });
  loadAdminPayoutsDesktop(1);
}

async function loadAdminAffiliateConfigDesktop() {
  try {
    const config = await apiFetch('/affiliate/admin/config');
    if (config) {
      const rateInput = document.getElementById('admin-aff-rate-input');
      const minPayoutInput = document.getElementById('admin-aff-minpayout-input');
      const feePercentInput = document.getElementById('admin-aff-fee-percent-input');
      const feeFixedInput = document.getElementById('admin-aff-fee-fixed-input');

      if (rateInput && config.commissionRate !== undefined) {
        rateInput.value = String(config.commissionRate);
      }
      if (minPayoutInput && config.minPayoutThreshold !== undefined) {
        minPayoutInput.value = String(config.minPayoutThreshold);
      }
      if (feePercentInput && config.payoutFeePercent !== undefined) {
        feePercentInput.value = String(config.payoutFeePercent);
      }
      if (feeFixedInput && config.payoutFeeFixed !== undefined) {
        feeFixedInput.value = String(config.payoutFeeFixed);
      }
    }
  } catch (err) {
    console.warn('[Admin Affiliate Config] Error loading config:', err);
  }
}

async function saveAdminAffiliateConfigDesktop(event) {
  if (event) event.preventDefault();

  const rateInput = document.getElementById('admin-aff-rate-input');
  const minPayoutInput = document.getElementById('admin-aff-minpayout-input');
  const feePercentInput = document.getElementById('admin-aff-fee-percent-input');
  const feeFixedInput = document.getElementById('admin-aff-fee-fixed-input');

  const commissionRate = Number(rateInput?.value || 15);
  const minPayoutThreshold = Number(minPayoutInput?.value || 200000);
  const payoutFeePercent = Number(feePercentInput?.value || 0);
  const payoutFeeFixed = Number(feeFixedInput?.value || 0);

  if (commissionRate < 1 || commissionRate > 90) {
    if (typeof showToast === 'function') showToast('Tỷ lệ hoa hồng phải từ 1% đến 90%', 'warning');
    return;
  }
  if (minPayoutThreshold < 50000) {
    if (typeof showToast === 'function') showToast('Hạn mức rút tối thiểu không được dưới 50.000 VNĐ', 'warning');
    return;
  }
  if (payoutFeePercent < 0 || payoutFeePercent > 50) {
    if (typeof showToast === 'function') showToast('% Phí rút phải từ 0% đến 50%', 'warning');
    return;
  }
  if (payoutFeeFixed < 0) {
    if (typeof showToast === 'function') showToast('Phí cố định không được âm', 'warning');
    return;
  }

  try {
    await apiFetch('/affiliate/admin/config', {
      method: 'PATCH',
      body: { commissionRate, minPayoutThreshold, payoutFeePercent, payoutFeeFixed }
    });

    if (typeof showToast === 'function') {
      showToast('Cập nhật thành công!', `Hoa hồng: ${commissionRate}% | Rút tối thiểu: ${minPayoutThreshold.toLocaleString('vi-VN')}đ | Phí: ${payoutFeePercent}% + ${payoutFeeFixed.toLocaleString('vi-VN')}đ`, 'success');
    }
  } catch (err) {
    if (typeof showToast === 'function') {
      showToast('Lỗi cập nhật cấu hình', err.message || 'Yêu cầu quyền Admin', 'error');
    }
  }
}


function openAdminPayoutActionModal(payoutId, code, amount, userEmail, actionType, bankName, accountNumber, accountHolder, fee = 0, netAmount = null) {
  const modal = document.getElementById('admin-payout-action-modal-desktop');
  const titleEl = document.getElementById('admin-payout-action-title');
  const infoEl = document.getElementById('admin-payout-action-info');
  const idInput = document.getElementById('admin-payout-action-id');
  const typeInput = document.getElementById('admin-payout-action-type');
  const noteInput = document.getElementById('admin-payout-action-note');
  const confirmBtn = document.getElementById('admin-payout-action-confirm-btn');

  const actualNet = netAmount !== null ? netAmount : (amount - fee);

  if (idInput) idInput.value = payoutId;
  if (typeInput) typeInput.value = actionType;
  if (noteInput) {
    noteInput.value = actionType === 'APPROVED' ? 'Đã chuyển khoản thành công qua Internet Banking' : 'Thông tin tài khoản không hợp lệ, đã hoàn tiền';
  }

  if (actionType === 'APPROVED') {
    if (titleEl) titleEl.innerText = `Phê Duyệt Đơn Rút Tiền #${code}`;
    if (confirmBtn) {
      confirmBtn.innerText = 'Xác Nhận Đã Chuyển Khoản';
      confirmBtn.style.background = '#22c55e';
    }
  } else {
    if (titleEl) titleEl.innerText = `Từ Chối Đơn Rút Tiền #${code}`;
    if (confirmBtn) {
      confirmBtn.innerText = 'Xác Nhận Từ Chối & Hoàn Tiền';
      confirmBtn.style.background = '#ef4444';
    }
  }

  if (infoEl) {
    infoEl.innerHTML = `
      <div><strong>Mã đơn:</strong> #${code}</div>
      <div><strong>Người rút:</strong> ${userEmail}</div>
      <div><strong>Số tiền rút:</strong> <span style="color: var(--text-secondary); font-weight: 700;">${amount.toLocaleString('vi-VN')} VNĐ</span></div>
      <div><strong>Phí rút tiền:</strong> <span style="color: #ef4444; font-weight: 700;">${fee > 0 ? fee.toLocaleString('vi-VN') + ' VNĐ' : '0đ (Miễn phí)'}</span></div>
      <div><strong>Thực nhận chuyển khoản:</strong> <span style="color: #22c55e; font-weight: 900; font-size: 14px;">${actualNet.toLocaleString('vi-VN')} VNĐ</span></div>
      <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed var(--border-color);">
        <strong>Ngân hàng:</strong> ${bankName || 'N/A'} - <strong>STK:</strong> ${accountNumber || 'N/A'}
      </div>
      <div><strong>Chủ tài khoản:</strong> <span style="text-transform: uppercase; font-weight: 700;">${accountHolder || 'N/A'}</span></div>
    `;
  }

  if (modal) modal.style.display = 'flex';
}

function closeAdminPayoutActionModal() {
  const modal = document.getElementById('admin-payout-action-modal-desktop');
  if (modal) modal.style.display = 'none';
}

async function submitAdminPayoutActionDesktop(event) {
  if (event) event.preventDefault();

  const idInput = document.getElementById('admin-payout-action-id');
  const typeInput = document.getElementById('admin-payout-action-type');
  const noteInput = document.getElementById('admin-payout-action-note');

  const payoutId = idInput?.value;
  const status = typeInput?.value;
  const adminNote = (noteInput?.value || '').trim();

  if (!payoutId || !status) return;

  try {
    await apiFetch(`/affiliate/admin/payouts/${payoutId}`, {
      method: 'PATCH',
      body: { status, adminNote }
    });

    if (typeof showToast === 'function') {
      showToast(status === 'APPROVED' ? 'Đã duyệt đơn rút tiền thành công!' : 'Đã từ chối đơn rút tiền!', adminNote, 'success');
    }

    closeAdminPayoutActionModal();
    loadAdminPayoutsDesktop(currentAdminPayoutPage);
  } catch (err) {
    if (typeof showToast === 'function') {
      showToast('Xử lý thất bại', err.message || 'Vui lòng thử lại', 'error');
    }
  }
}

// Global Exports for Desktop UI
window.loadAffiliateStatsDesktop = loadAffiliateStatsDesktop;
window.refreshAffiliateAllDesktop = refreshAffiliateAllDesktop;
window.copyAffiliateLinkDesktop = copyAffiliateLinkDesktop;
window.copyAffiliateCodeDesktop = copyAffiliateCodeDesktop;
window.switchAffiliateTabDesktop = switchAffiliateTabDesktop;
window.saveUserBankSettingsDesktop = saveUserBankSettingsDesktop;
window.openAffiliatePayoutModalDesktop = openAffiliatePayoutModalDesktop;
window.closeAffiliatePayoutModalDesktop = closeAffiliatePayoutModalDesktop;
window.submitAffiliatePayoutDesktop = submitAffiliatePayoutDesktop;

window.loadAdminPayoutsDesktop = loadAdminPayoutsDesktop;
window.filterAdminPayoutsDesktop = filterAdminPayoutsDesktop;
window.loadAdminAffiliateConfigDesktop = loadAdminAffiliateConfigDesktop;
window.saveAdminAffiliateConfigDesktop = saveAdminAffiliateConfigDesktop;
window.openAdminPayoutActionModal = openAdminPayoutActionModal;
window.closeAdminPayoutActionModal = closeAdminPayoutActionModal;
window.submitAdminPayoutActionDesktop = submitAdminPayoutActionDesktop;
window.openAdminPayoutAuditModalDesktop = openAdminPayoutAuditModalDesktop;
window.closeAdminPayoutAuditModalDesktop = closeAdminPayoutAuditModalDesktop;
window.searchAdminPayoutsDesktop = searchAdminPayoutsDesktop;

window.openBankPickerModalDesktop = openBankPickerModalDesktop;
window.closeBankPickerModalDesktop = closeBankPickerModalDesktop;
window.filterBanksDesktop = filterBanksDesktop;
window.selectBankDesktop = selectBankDesktop;



