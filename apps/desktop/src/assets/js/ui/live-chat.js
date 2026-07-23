// Real-time Support Chat Logic (User Bottom-Right Widget + Staff Admin Console)

let isChatOpen = false;
let chatUnreadCount = 0;
let activeStaffChatEmail = null;

let activeUserReplyQuote = null;
let activeStaffReplyQuote = null;

const AVATAR_CUSTOMER = 'https://cdn2.fptshop.com.vn/unsafe/800x0/avatar_anime_nam_cute_14_60037b48e5.jpg';
const AVATAR_STAFF = 'img/logo.png';
const AVATAR_AI = 'img/logo.png';

// Complete Knowledge Base for all 25 TabKeys & Features
const EIGU_SYSTEM_KNOWLEDGE = {
  'ho-so': '📌 **Hồ sơ (Trang cá nhân)**:\n• Quản lý thông tin tài khoản: Email, Tên hiển thị (Username), Mã ID người dùng.\n• Cập nhật ảnh đại diện (Avatar), thay đổi mật khẩu tài khoản và xem lịch sử đăng nhập.',
  'tiep-thi': '📌 **Tiếp thị liên kết (Affiliate)**:\n• Lấy link giới thiệu sản phẩm/ứng dụng EIGU Platform.\n• Theo dõi số lượt nhấp (Clicks), tỉ lệ chuyển đổi và doanh thu hoa hồng tích lũy.',
  'doi-nhom': '📌 **Đội nhóm (Team Workspaces)**:\n• Quản lý danh sách thành viên trong đội nhóm MMO.\n• Phân quyền vai trò (Admin / Member), chia sẻ tài nguyên Proxy và tài khoản mạng xã hội.',
  'tien-ich': '📌 **Tiện ích mở rộng**:\n• Bộ công cụ bổ trợ hệ thống: Check IP Proxy, Convert định dạng video/ảnh, bóc tách văn bản OCR và tạo QR code.',
  'guide': '📌 **Hướng dẫn sử dụng toàn tập**:\n• Kho tài liệu Hướng dẫn từ A-Z về quy trình tự động hóa EIGU Platform.\n• Video tutorial mẫu và giải đáp các sự cố thường gặp.',
  'cong-cu': '📌 **Nhóm Công cụ Video AI**:\n• Bao gồm 5 công cụ cốt lõi: Tự động cắt (cut), Tạo video AI (ai-video), Reup (reup), Tìm ngách hot (hot-niche), Tải hàng loạt (bulk-download).',
  'cut': '📌 **Tự động cắt video (Smart Cut)**:\n• Hỗ trợ dán link YouTube hoặc tải file MP4 từ máy tính.\n• Tự động phân chia cảnh theo khoảng thời gian (10s - 60s), mô phỏng thao tác rê chuột tự nhiên lách Cloudflare Turnstile và tự động xuất các tập tin phân đoạn.',
  'ai-video': '📌 **Tạo video AI (Sora/Veo/Kling/Luma)**:\n• Hỗ trợ 2 chế độ: Copy (bóc tách kịch bản từ video mẫu) & Ý tưởng (viết prompt sinh kịch bản).\n• Kết nối trực tiếp mô hình AI tạo video thế hệ mới.',
  'reup': '📌 **Tạo video Reup (Lách bản quyền)**:\n• Tự động thêm hiệu ứng biến đổi (Filter, Mirror, Speed adjustment, Zoom factor, Background Blur).\n• Thay đổi MD5 hash của tập tin video để lách thuật toán quét trùng lặp.',
  'hot-niche': '📌 **Tìm ngách hot (Hot Niche Finder)**:\n• Phân tích xu hướng bài đăng viral trên TikTok, YouTube Shorts & Facebook Reels.\n• Tìm các ngách nội dung có lượt xem lớn và độ cạnh tranh thấp.',
  'bulk-download': '📌 **Tải video hàng loạt**:\n• Tải hàng loạt video từ kênh TikTok/Douyin/YouTube mà không bị dính hình mờ Watermark.\n• Lưu trữ tự động vào thư mục Downloads/eigu/outputs.',
  'tu-dong-hoa': '📌 **Nhóm Tự động hóa**:\n• Bao gồm 2 tính năng chính: Tạo workflow (workflow) và Ghi thao tác (record).',
  'workflow': '📌 **Tạo Workflow tự động**:\n• Xây dựng luồng công việc kéo thả tự động: Tải video ➡️ Cắt video ➡️ Thêm Filter ➡️ Tự động Đăng bài lên mạng xã hội.',
  'record': '📌 **Ghi thao tác (Action Recorder)**:\n• Ghi lại chuỗi click chuột, gõ phím của người dùng và phát lại tự động mô phỏng như người thật.',
  'tai-khoan': '📌 **Quản lý Tài khoản Mạng xã hội**:\n• Quản lý tập trung 6 nền tảng: TikTok, Facebook, YouTube, X (Twitter), Instagram, Threads.',
  'tk-tiktok': '📌 **Tài khoản TikTok**:\n• Nhập & Quản lý danh sách tài khoản TikTok, gán Proxy riêng biệt (IP/Port), cookie JSON và kiểm tra tình trạng Live/Dead.',
  'tk-facebook': '📌 **Tài khoản Facebook**:\n• Quản lý nick via Facebook, tự động nuôi via và tương tác nguồn cấp dữ liệu.',
  'tk-youtube': '📌 **Tài khoản YouTube**:\n• Quản lý kênh YouTube, tích hợp YouTube Data API v3 để tải/đăng video tự động.',
  'tk-x': '📌 **Tài khoản X (Twitter)**:\n• Quản lý tài khoản X, tự động tweet và retweet bài viết.',
  'tk-instagram': '📌 **Tài khoản Instagram**:\n• Quản lý tài khoản Insta, tự động đăng Reel và Story.',
  'tk-threads': '📌 **Tài khoản Threads**:\n• Quản lý tài khoản Threads, lên lịch bài viết tự động.',
  'settings': '📌 **Cài đặt & Bể chứa API Keys**:\n• Nạp và quản lý nhiều API Key (Gemini API, Fal.ai...) để hệ thống tự động xoay vòng 100% miễn phí.\n• Các key được mã hóa bảo mật cấp cao bằng Windows DPAPI / macOS Keychain.',
  'feedback': '📌 **Góp ý / Báo lỗi (Feedback)**:\n• Gửi báo cáo lỗi kèm hình ảnh đính kèm tới đội ngũ phát triển qua Discord Webhook.\n• Giới hạn 3 lượt gửi/ngày để tránh lạm dụng.'
};

// Get or initialize real chat sessions from localStorage (Isolated per user identity / role)
function getChatStorageKey(emailOverride) {
  const isStaffOrAdmin = typeof userProfile !== 'undefined' && userProfile && (userProfile.role === 'admin' || userProfile.role === 'staff');
  if (isStaffOrAdmin) {
    return 'eigu_staff_shared_chat_sessions';
  }
  const email = emailOverride || getUserEmail();
  return `eigu_chat_sessions_${email}`;
}

function getStoredChatSessions(emailOverride) {
  try {
    const key = getChatStorageKey(emailOverride);
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) { }

  const email = emailOverride || getUserEmail();
  const isStaffOrAdmin = typeof userProfile !== 'undefined' && userProfile && (userProfile.role === 'admin' || userProfile.role === 'staff');

  const initial = isStaffOrAdmin ? {
    'sample.client@gmail.com': {
      userEmail: 'sample.client@gmail.com',
      username: 'sample_client',
      needsStaff: true,
      unreadForStaff: true,
      lastActive: new Date().toISOString(),
      messages: [
        { id: 'm1', sender: 'user', text: 'Xin chào, tôi không nạp được API key Gemini vào hệ thống.', time: '15:20', status: 'seen' },
        { id: 'm2', sender: 'ai', text: 'Chào bạn! Bạn vui lòng kiểm tra tab Cài đặt > Bể chứa API Keys. Nếu vẫn lỗi, hãy gõ @Eigu AI hoặc bấm Yêu cầu Staff hỗ trợ nhé.', time: '15:21', status: 'seen' },
        { id: 'm3', sender: 'user', text: 'Tôi đã bấm yêu cầu Staff hỗ trợ, nhờ bạn kiểm tra giúp.', time: '15:22', status: 'seen' }
      ]
    }
  } : {
    [email]: {
      userEmail: email,
      username: (typeof userProfile !== 'undefined' && userProfile && userProfile.username) ? userProfile.username : 'User',
      needsStaff: false,
      unreadForStaff: false,
      lastActive: new Date().toISOString(),
      messages: []
    }
  };

  try {
    const key = getChatStorageKey(emailOverride);
    localStorage.setItem(key, JSON.stringify(initial));
  } catch (e) {}

  return initial;
}

function saveStoredChatSessions(sessions, skipBroadcast = false, emailOverride) {
  try {
    const key = getChatStorageKey(emailOverride);
    localStorage.setItem(key, JSON.stringify(sessions));

    // If staff/admin is replying, also sync the target user's session into that user's specific storage key
    const isStaffOrAdmin = typeof userProfile !== 'undefined' && userProfile && (userProfile.role === 'admin' || userProfile.role === 'staff');
    if (isStaffOrAdmin) {
      Object.keys(sessions).forEach(usrEmail => {
        try {
          const userKey = `eigu_chat_sessions_${usrEmail}`;
          const singleUserSession = { [usrEmail]: sessions[usrEmail] };
          localStorage.setItem(userKey, JSON.stringify(singleUserSession));
        } catch (err) {}
      });
    }

    if (!skipBroadcast) {
      window.dispatchEvent(new CustomEvent('eigu_chat_updated'));
    }
  } catch (e) { }
}

function resetChatState() {
  isChatOpen = false;
  chatUnreadCount = 0;
  activeStaffChatEmail = null;
  activeUserReplyQuote = null;
  activeStaffReplyQuote = null;

  const userMessages = document.getElementById('chat-messages');
  if (userMessages) userMessages.innerHTML = '';

  const staffMessages = document.getElementById('staff-chat-messages');
  if (staffMessages) staffMessages.innerHTML = '';

  const staffList = document.getElementById('staff-chat-list');
  if (staffList) staffList.innerHTML = '';

  const box = document.getElementById('live-chat-box');
  if (box) {
    box.classList.add('hidden');
    box.style.display = 'none';
  }

  const badge = document.getElementById('chat-badge');
  if (badge) {
    badge.classList.add('hidden');
    badge.style.display = 'none';
  }
}

function getUserEmail() {
  return (typeof userProfile !== 'undefined' && userProfile && userProfile.email) ? userProfile.email : 'user@eigu.app';
}

function getChatInputValue(id) {
  const el = document.getElementById(id);
  if (!el) return '';
  if (el.isContentEditable) {
    return el.innerText ? el.innerText.trim() : '';
  }
  return el.value ? el.value.trim() : '';
}

function clearChatInput(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.isContentEditable) {
    el.innerHTML = '';
  } else {
    el.value = '';
  }
}

function scrollToBottom(container) {
  if (!container) return;
  const doScroll = () => {
    container.scrollTop = container.scrollHeight;
  };
  doScroll();
  requestAnimationFrame(doScroll);
  setTimeout(doScroll, 30);
  setTimeout(doScroll, 100);
  setTimeout(doScroll, 250);

  container.querySelectorAll('img').forEach(img => {
    if (!img.complete) {
      img.addEventListener('load', doScroll, { once: true });
    }
  });
}

function scrollToChatMessage(msgId) {
  if (!msgId) return;
  const el = document.getElementById('chat_item_' + msgId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.style.transition = 'background 0.3s';
    const origBg = el.style.background;
    el.style.background = 'rgba(99, 102, 241, 0.2)';
    setTimeout(() => { el.style.background = origBg; }, 1200);
  }
}

function formatMentions(text) {
  if (!text) return '';
  let html = escapeHtml(text);
  html = html.replace(/@Eigu AI/gi, '<span style="font-weight:600; color:#fde047; background:rgba(253,224,71,0.18); border:1px solid rgba(253,224,71,0.3); padding:1px 6px; border-radius:6px; display:inline-block; margin:0 2px;">@Eigu AI</span>');
  html = html.replace(/@Staff/gi, '<span style="font-weight:600; color:#f472b6; background:rgba(244,114,182,0.18); border:1px solid rgba(244,114,182,0.3); padding:1px 6px; border-radius:6px; display:inline-block; margin:0 2px;">@Staff</span>');
  html = html.replace(/@Khách hàng/gi, '<span style="font-weight:600; color:#34d399; background:rgba(52,211,153,0.18); border:1px solid rgba(52,211,153,0.3); padding:1px 6px; border-radius:6px; display:inline-block; margin:0 2px;">@Khách hàng</span>');
  html = html.replace(/@mọi người/gi, '<span style="font-weight:600; color:#fdba74; background:rgba(253,186,116,0.18); border:1px solid rgba(253,186,116,0.3); padding:1px 6px; border-radius:6px; display:inline-block; margin:0 2px;">@mọi người</span>');
  return html;
}

// -----------------------------------------------------------
// USER SIDE: Floating Bottom-Right Live Chat Widget
// -----------------------------------------------------------

function toggleLiveChatWidget(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  const box = document.getElementById('live-chat-box');
  const trigger = document.getElementById('live-chat-trigger');
  const badge = document.getElementById('chat-badge');
  if (!box) return;

  isChatOpen = !isChatOpen;
  if (isChatOpen) {
    box.classList.remove('hidden');
    box.style.display = 'flex';
    chatUnreadCount = 0;
    if (trigger) trigger.classList.remove('has-unread');
    if (badge) {
      badge.classList.add('hidden');
      badge.style.display = 'none';
    }
    const input = document.getElementById('chat-input');
    if (input) input.focus();
    renderUserChatHistory();
  } else {
    box.classList.add('hidden');
    box.style.display = 'none';
  }
}

function notifyUnreadUserChatMessage() {
  if (!isChatOpen) {
    chatUnreadCount++;
    const trigger = document.getElementById('live-chat-trigger');
    const badge = document.getElementById('chat-badge');
    if (trigger) trigger.classList.add('has-unread');
    if (badge) {
      badge.classList.remove('hidden');
      badge.style.display = 'flex';
      badge.innerText = chatUnreadCount > 5 ? '5+' : chatUnreadCount;
    }
  }
}

function renderUserChatHistory() {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const email = getUserEmail();
  const sessions = getStoredChatSessions();
  const session = sessions[email];

  if (!session || !Array.isArray(session.messages) || session.messages.length === 0) {
    container.innerHTML = `
      <div class="msg-wrapper ai">
        <div class="msg-main-row">
          <img src="${AVATAR_AI}" class="msg-avatar" style="width:32px; height:32px; border-radius:50%; object-fit:cover; flex-shrink:0; border: 1px solid var(--border-color);" alt="AI" />
          <div class="msg-content-box">
            <div class="msg-bubble" style="min-width:24px;">Xin chào! Tôi là AI Assistant của EIGU Platform. Gõ <span style="font-weight:600; color:#fde047; background:rgba(253,224,71,0.18); border:1px solid rgba(253,224,71,0.3); padding:1px 6px; border-radius:6px; display:inline-block; margin:0 2px;">@Eigu AI &lt;câu hỏi&gt;</span> để hỏi AI hoặc gõ @ để xem menu tag.</div>
            <div class="msg-meta">Vừa xong</div>
          </div>
        </div>
      </div>
    `;
    scrollToBottom(container);
    return;
  }

  container.innerHTML = '';
  session.messages.forEach((msg, idx) => {
    if (!msg.id) msg.id = 'usr_msg_' + idx + '_' + Date.now();
    const isUser = msg.sender === 'user';
    const avatarUrl = isUser ? AVATAR_CUSTOMER : (msg.sender === 'staff' ? AVATAR_STAFF : AVATAR_AI);

    // 1. Independent Reply Preview Component Outside Bubble
    let replyTagHtml = '';
    if (msg.parentMsg) {
      const pSender = msg.parentMsg.sender === 'user' ? 'Khách hàng' : (msg.parentMsg.sender === 'staff' ? 'Staff' : 'AI Assistant');
      replyTagHtml = `
        <div class="reply-preview-tag" onclick="scrollToChatMessage('${msg.parentMsg.id || ''}')" title="Bấm để cuộn đến tin nhắn gốc">
          ${escapeHtml(msg.parentMsg.text)}
        </div>
      `;
    }

    // 2. Status Indicator (Sent / Seen)
    let statusText = '';
    if (isUser) {
      statusText = msg.status === 'seen' ? ' • <span style="color:var(--accent); font-weight:600;">✓✓ Đã xem</span>' : ' • <span style="color:var(--text-muted);">✓ Đã gửi</span>';
    }

    const isMe = msg.sender === 'user';
    const wrapper = document.createElement('div');
    wrapper.className = `msg-wrapper ${msg.sender} ${isMe ? 'sent-by-me' : 'received-by-me'}`;
    wrapper.id = `chat_item_${msg.id}`;

    const safeText = escapeHtml(msg.text).replace(/'/g, "\\'").replace(/"/g, '&quot;');

    wrapper.innerHTML = `
      ${replyTagHtml}
      <div class="msg-main-row">
        <img src="${avatarUrl}" class="msg-avatar" style="width:32px; height:32px; border-radius:50%; object-fit:cover; flex-shrink:0; border: 1px solid var(--border-color);" alt="${msg.sender}" />
        <div class="msg-content-box">
          <div class="msg-bubble" style="min-width:24px;">${formatMentions(msg.text)}</div>
          <div class="msg-meta">${msg.time || 'Vừa xong'}${statusText}</div>
        </div>
        <div class="msg-hover-action" onclick="startUserReplyQuote('${msg.sender}', '${safeText}', '${msg.id}')" title="Trả lời tin nhắn">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
        </div>
      </div>
    `;

    container.appendChild(wrapper);
  });

  scrollToBottom(container);
}

async function sendChatMessage() {
  const text = getChatInputValue('chat-input');
  if (!text) return;

  clearChatInput('chat-input');

  const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const email = getUserEmail();
  const username = (typeof userProfile !== 'undefined' && userProfile && userProfile.username) ? userProfile.username : 'User';

  const sessions = getStoredChatSessions();
  if (!sessions[email]) {
    sessions[email] = {
      userEmail: email,
      username: username,
      needsStaff: false,
      unreadForStaff: false,
      lastActive: new Date().toISOString(),
      messages: []
    };
  }

  const session = sessions[email];
  const msgId = 'usr_msg_' + Date.now();
  const newMsg = {
    id: msgId,
    sender: 'user',
    text: text,
    time: timeStr,
    status: 'sent',
    parentMsg: activeUserReplyQuote ? { ...activeUserReplyQuote } : null
  };

  cancelUserReplyQuote();
  hideUserMentionDropdown();

  session.messages.push(newMsg);
  session.lastActive = new Date().toISOString();

  // Check Slash Commands & Mentions
  const isAiMention = /@Eigu AI/i.test(text) || text.startsWith('/ai');
  const isSlashHelp = text.startsWith('/help');
  const isSlashStaff = text.startsWith('/staff') || /@Staff/i.test(text);

  if (isSlashHelp) {
    session.messages.push({
      id: 'ai_msg_' + Date.now(),
      sender: 'ai',
      text: '💡 Danh sách lệnh hỗ trợ:\n• @Eigu AI <câu hỏi>: Hỏi đáp trực tiếp với AI Assistant\n• /staff hoặc @Staff: Gửi yêu cầu Nhân viên hỗ trợ\n• /ai <câu hỏi>: Hỏi AI nhanh',
      time: timeStr,
      status: 'seen'
    });
    saveStoredChatSessions(sessions);
    renderUserChatHistory();
    return;
  }

  if (isSlashStaff) {
    saveStoredChatSessions(sessions);
    requestHumanSupport();
    return;
  }

  // If session requires staff AND user did NOT explicitly mention @Eigu AI -> Forward to Staff
  if (session.needsStaff && !isAiMention) {
    session.unreadForStaff = true;
    saveStoredChatSessions(sessions);
    try {
      const staffSharedKey = 'eigu_staff_shared_chat_sessions';
      let staffSessions = {};
      const raw = localStorage.getItem(staffSharedKey);
      if (raw) staffSessions = JSON.parse(raw);
      staffSessions[email] = session;
      localStorage.setItem(staffSharedKey, JSON.stringify(staffSessions));
    } catch (e) {}
    renderUserChatHistory();
    if (typeof addChatNotificationForStaff === 'function') {
      addChatNotificationForStaff(email, text);
    }
    return;
  }

  // If user mentioned @Eigu AI or in pure AI mode
  saveStoredChatSessions(sessions);
  renderUserChatHistory();

  const promptText = text.replace(/@Eigu AI|\/ai/gi, '').trim() || text;
  const aiTypingId = appendTypingIndicator();

  try {
    const reply = await getAiSupportResponse(promptText);
    removeTypingIndicator(aiTypingId);

    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    session.messages.push({ id: 'ai_msg_' + Date.now(), sender: 'ai', text: reply, time: nowTime, status: 'seen' });
    saveStoredChatSessions(sessions);
    renderUserChatHistory();
    notifyUnreadUserChatMessage();
  } catch (err) {
    removeTypingIndicator(aiTypingId);
    const fallbackText = 'Tôi hiện chưa rõ câu hỏi này. Bạn có thể gõ @Eigu AI <câu hỏi> hoặc bấm Yêu cầu Staff hỗ trợ nhé!';
    session.messages.push({ id: 'ai_msg_' + Date.now(), sender: 'ai', text: fallbackText, time: timeStr, status: 'seen' });
    saveStoredChatSessions(sessions);
    renderUserChatHistory();
    notifyUnreadUserChatMessage();
  }
}

function requestHumanSupport() {
  const email = getUserEmail();
  const username = (typeof userProfile !== 'undefined' && userProfile && userProfile.username) ? userProfile.username : 'User';
  const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const sessions = getStoredChatSessions();
  if (!sessions[email]) {
    sessions[email] = { userEmail: email, username, needsStaff: true, unreadForStaff: true, lastActive: new Date().toISOString(), messages: [] };
  } else {
    sessions[email].needsStaff = true;
    sessions[email].unreadForStaff = true;
    sessions[email].lastActive = new Date().toISOString();
  }

  const noticeText = 'Đã gửi yêu cầu hỗ trợ tới đội ngũ Staff / Admin! Một nhân viên sẽ phản hồi cuộc trò chuyện này trong ít phút.';
  sessions[email].messages.push({ id: 'ai_msg_' + Date.now(), sender: 'ai', text: noticeText, time: timeStr, status: 'seen' });
  saveStoredChatSessions(sessions);

  try {
    const staffSharedKey = 'eigu_staff_shared_chat_sessions';
    let staffSessions = {};
    const raw = localStorage.getItem(staffSharedKey);
    if (raw) staffSessions = JSON.parse(raw);
    staffSessions[email] = sessions[email];
    localStorage.setItem(staffSharedKey, JSON.stringify(staffSessions));
  } catch (e) {}

  renderUserChatHistory();
  showToast('Chat Support', 'Đã chuyển cuộc trò chuyện sang cho Nhân viên hỗ trợ!', 'info');

  const isStaffOrAdmin = typeof userProfile !== 'undefined' && userProfile && (userProfile.role === 'admin' || userProfile.role === 'staff');
  if (isStaffOrAdmin && typeof loadStaffChatConsole === 'function') {
    loadStaffChatConsole();
  }
}

// User Mention & Quote Helpers
function handleUserMentionInput(e) {
  const el = e.target;
  const text = el.isContentEditable ? (el.innerText || '') : (el.value || '');
  const dropdown = document.getElementById('user-mention-dropdown');
  if (!dropdown) return;
  const lastWord = text.split(/\s+/).pop();
  if (lastWord && lastWord.startsWith('@')) {
    dropdown.classList.remove('hidden');
    dropdown.style.display = 'flex';
  } else {
    dropdown.classList.add('hidden');
    dropdown.style.display = 'none';
  }
}

function hideUserMentionDropdown() {
  const dropdown = document.getElementById('user-mention-dropdown');
  if (dropdown) {
    dropdown.classList.add('hidden');
    dropdown.style.display = 'none';
  }
}

function createMentionChipHtml(tagText) {
  const tagClean = tagText.trim();
  let chipClass = 'eigu-ai';
  if (tagClean.includes('Staff')) chipClass = 'staff';
  if (tagClean.includes('Khách hàng')) chipClass = 'customer';
  if (tagClean.includes('mọi người')) chipClass = 'everyone';
  return `<span contenteditable="false" class="mention-chip ${chipClass}">${escapeHtml(tagClean)}</span>&nbsp;`;
}

function insertUserMention(tagText) {
  const input = document.getElementById('chat-input');
  if (!input) return;

  if (input.isContentEditable) {
    input.focus();
    const chipHtml = createMentionChipHtml(tagText);
    const html = input.innerHTML;
    if (html.endsWith('@')) {
      input.innerHTML = html.replace(/@$/, '') + chipHtml;
    } else {
      input.innerHTML += chipHtml;
    }
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(input);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    input.value += tagText;
  }
  hideUserMentionDropdown();
}

function startUserReplyQuote(sender, text, id) {
  activeUserReplyQuote = { id, sender, text };
  const preview = document.getElementById('user-chat-reply-preview');
  const nameEl = document.getElementById('user-reply-target-name');
  const textEl = document.getElementById('user-reply-target-text');
  if (preview && nameEl && textEl) {
    nameEl.innerText = `Trả lời ${sender === 'user' ? ' ' : (sender === 'staff' ? 'Staff' : 'AI')}:`;
    textEl.innerText = text.length > 40 ? text.slice(0, 40) + '...' : text;
    preview.style.display = 'flex';
  }
  const input = document.getElementById('chat-input');
  if (input) input.focus();
}

function cancelUserReplyQuote() {
  activeUserReplyQuote = null;
  const preview = document.getElementById('user-chat-reply-preview');
  if (preview) preview.style.display = 'none';
}

// User Emoji Picker Helpers (DO NOT CLOSE ON SELECTION)
function toggleUserEmojiPicker(e) {
  if (e) e.stopPropagation();
  const picker = document.getElementById('user-emoji-picker');
  if (!picker) return;
  picker.style.display = picker.style.display === 'grid' ? 'none' : 'grid';
}

function insertUserEmoji(emoji) {
  const input = document.getElementById('chat-input');
  if (input) {
    if (input.isContentEditable) {
      input.focus();
      input.innerHTML += emoji;
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(input);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      input.value += emoji;
      input.focus();
    }
  }
}

function appendTypingIndicator() {
  const container = document.getElementById('chat-messages');
  if (!container) return null;

  const id = 'typing_' + Date.now();
  const div = document.createElement('div');
  div.id = id;
  div.className = 'msg-wrapper ai';
  div.innerHTML = `
    <div class="msg-main-row">
      <img src="${AVATAR_AI}" class="msg-avatar" style="width:32px; height:32px; border-radius:50%; object-fit:cover; flex-shrink:0; border: 1px solid var(--border-color);" alt="AI" />
      <div class="msg-content-box">
        <div class="typing-indicator-bubble">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    </div>
  `;
  container.appendChild(div);
  scrollToBottom(container);
  return id;
}

function removeTypingIndicator(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.remove();
}

// Dynamic AI Response with Full Knowledge Base for All 25 Tabs
async function getAiSupportResponse(userQuestion) {
  const q = userQuestion.toLowerCase();

  // Try live AI Model Call via Electron IPC if available
  if (window.ipcRenderer) {
    try {
      const fullKnowledgeStr = Object.values(EIGU_SYSTEM_KNOWLEDGE).join('\n\n');
      const systemPrompt = `Bạn là Trợ lý AI Chăm sóc Khách hàng chuyên nghiệp của ứng dụng EIGU Platform. 
Dưới đây là TOÀN BỘ TRI THỨC HỆ THỐNG VỀ 25 TAB VÀ TÍNH NĂNG CỦA EIGU PLATFORM:

${fullKnowledgeStr}

Nhiệm vụ: Trả lời ngắn gọn, chuẩn xác, lịch sự và giải đáp đầy đủ cho câu hỏi của khách hàng: ${userQuestion}`;

      const response = await window.ipcRenderer.invoke('ai-video-generate-prompts', {
        text: systemPrompt,
        mode: 'idea'
      });
      if (Array.isArray(response) && response.length > 0 && response[0]) {
        return response.join(' ');
      }
    } catch (e) { }
  }

  // Smart Knowledge Matching Engine across 25 tabs
  if (q.includes('cắt') || q.includes('cut')) return EIGU_SYSTEM_KNOWLEDGE['cut'];
  if (q.includes('tạo video') || q.includes('sora') || q.includes('veo') || q.includes('kling')) return EIGU_SYSTEM_KNOWLEDGE['ai-video'];
  if (q.includes('reup') || q.includes('bản quyền') || q.includes('lách')) return EIGU_SYSTEM_KNOWLEDGE['reup'];
  if (q.includes('ngách') || q.includes('hot') || q.includes('viral')) return EIGU_SYSTEM_KNOWLEDGE['hot-niche'];
  if (q.includes('tải') || q.includes('download') || q.includes('hàng loạt')) return EIGU_SYSTEM_KNOWLEDGE['bulk-download'];
  if (q.includes('workflow') || q.includes('luồng')) return EIGU_SYSTEM_KNOWLEDGE['workflow'];
  if (q.includes('record') || q.includes('ghi thao tác')) return EIGU_SYSTEM_KNOWLEDGE['record'];
  if (q.includes('tiktok')) return EIGU_SYSTEM_KNOWLEDGE['tk-tiktok'];
  if (q.includes('facebook') || q.includes('via')) return EIGU_SYSTEM_KNOWLEDGE['tk-facebook'];
  if (q.includes('youtube')) return EIGU_SYSTEM_KNOWLEDGE['tk-youtube'];
  if (q.includes('twitter') || q.includes('x')) return EIGU_SYSTEM_KNOWLEDGE['tk-x'];
  if (q.includes('instagram') || q.includes('insta')) return EIGU_SYSTEM_KNOWLEDGE['tk-instagram'];
  if (q.includes('threads')) return EIGU_SYSTEM_KNOWLEDGE['tk-threads'];
  if (q.includes('key') || q.includes('api') || q.includes('cài đặt') || q.includes('bể chứa')) return EIGU_SYSTEM_KNOWLEDGE['settings'];
  if (q.includes('báo lỗi') || q.includes('góp ý') || q.includes('feedback')) return EIGU_SYSTEM_KNOWLEDGE['feedback'];
  if (q.includes('hồ sơ') || q.includes('đổi mật khẩu') || q.includes('profile')) return EIGU_SYSTEM_KNOWLEDGE['ho-so'];
  if (q.includes('tiếp thị') || q.includes('hoa hồng') || q.includes('affiliate')) return EIGU_SYSTEM_KNOWLEDGE['tiep-thi'];
  if (q.includes('đội nhóm') || q.includes('team')) return EIGU_SYSTEM_KNOWLEDGE['doi-nhom'];
  if (q.includes('tiện ích')) return EIGU_SYSTEM_KNOWLEDGE['tien-ich'];
  if (q.includes('hướng dẫn') || q.includes('guide')) return EIGU_SYSTEM_KNOWLEDGE['guide'];

  return `🤖 AI Assistant EIGU Platform:\n\nCảm ơn câu hỏi của bạn! Tôi có thể giải đáp đầy đủ về 25 tính năng hệ thống (Tự động cắt, Tạo video AI, Reup, Tải hàng loạt, Workflow, Quản lý tài khoản TikTok/FB/YT, API Keys...).\n\nBạn hãy gõ **@Eigu AI <câu hỏi>** hoặc bấm **Yêu cầu Staff hỗ trợ** để được giải đáp trực tiếp nhé!`;
}

// -----------------------------------------------------------
// STAFF / ADMIN CONSOLE SIDE: Real Data Management View
// -----------------------------------------------------------

function loadStaffChatConsole() {
  const listContainer = document.getElementById('staff-chat-list');
  if (!listContainer) return;

  const isStaffOrAdmin = typeof userProfile !== 'undefined' && userProfile && (userProfile.role === 'admin' || userProfile.role === 'staff');
  if (!isStaffOrAdmin) {
    listContainer.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:13px;">Bạn không có quyền truy cập Staff Chat Console.</div>';
    const msgBox = document.getElementById('staff-chat-messages');
    if (msgBox) msgBox.innerHTML = '';
    return;
  }

  const sessions = getStoredChatSessions();
  const sessionKeys = Object.keys(sessions);

  if (sessionKeys.length === 0) {
    listContainer.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:13px;">Chưa có cuộc trò chuyện nào.</div>';
    return;
  }

  listContainer.innerHTML = '';

  sessionKeys.sort((a, b) => new Date(sessions[b].lastActive || 0) - new Date(sessions[a].lastActive || 0));

  sessionKeys.forEach(email => {
    const s = sessions[email];
    const item = document.createElement('div');
    const isActive = activeStaffChatEmail === email;

    item.className = `chat-session-item ${isActive ? 'active' : ''}`;
    item.style.cssText = `padding: 12px; border-radius: 10px; cursor: pointer; transition: all 0.2s; ${isActive ? 'background: var(--bg-card); border: 2px solid var(--accent); box-shadow: 0 4px 16px rgba(99, 102, 241, 0.25);' : 'background: var(--bg-primary); border: 1px solid var(--border-color);'}`;

    const lastMsg = s.messages && s.messages.length > 0 ? s.messages[s.messages.length - 1].text : 'Chưa có tin nhắn';
    const shortMsg = lastMsg.length > 35 ? lastMsg.slice(0, 35) + '...' : lastMsg;

    let statusTag = `<span style="color: #22c55e; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><span style="width:6px; height:6px; border-radius:50%; background:#22c55e; display:inline-block;"></span> Đang hỗ trợ</span>`;
    if (s.needsStaff) {
      statusTag = `<span style="color: #ef4444; font-weight: 700; font-size: 11px; display: inline-flex; align-items: center; gap: 4px;"><span style="width:6px; height:6px; border-radius:50%; background:#ef4444; display:inline-block;"></span> CẦN STAFF HỖ TRỢ</span>`;
    }

    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <div style="display:flex; align-items:center; gap:6px; min-width:0; flex:1;">
          <img src="${AVATAR_CUSTOMER}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; flex-shrink:0; border: 1px solid var(--border-color);" alt="Client" />
          <div style="font-weight: 700; font-size: 13px; color: var(--text-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(s.userEmail)}">${escapeHtml(s.userEmail)}</div>
        </div>
        ${s.unreadForStaff ? '<span style="width:8px; height:8px; border-radius:50%; background:#ef4444; flex-shrink:0;"></span>' : ''}
      </div>
      <div style="font-size: 11px; margin-bottom:4px;">${statusTag}</div>
      <div style="font-size: 11px; color: var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(shortMsg)}</div>
    `;

    item.onclick = () => selectStaffChatSession(email);
    listContainer.appendChild(item);
  });

  if (!activeStaffChatEmail && sessionKeys.length > 0) {
    selectStaffChatSession(sessionKeys[0]);
  }
}

function selectStaffChatSession(email) {
  activeStaffChatEmail = email;
  const sessions = getStoredChatSessions();
  const s = sessions[email];

  if (!s) return;

  s.unreadForStaff = false;
  if (Array.isArray(s.messages)) {
    s.messages.forEach(m => {
      if (m.sender === 'user') m.status = 'seen';
    });
  }

  saveStoredChatSessions(sessions, false);

  // Update Header
  const nameEl = document.getElementById('staff-chat-target-name');
  const emailEl = document.getElementById('staff-chat-target-email');
  if (nameEl) nameEl.innerText = `Đang chat với: ${s.username || 'Khách hàng'}`;
  if (emailEl) emailEl.innerText = `Tài khoản Email: ${s.userEmail}`;

  // Render Messages
  const messagesBox = document.getElementById('staff-chat-messages');
  if (!messagesBox) return;

  messagesBox.innerHTML = '';
  if (!s.messages || s.messages.length === 0) {
    messagesBox.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted); font-size:13px;">Chưa có lịch sử tin nhắn nào.</div>';
    return;
  }

  s.messages.forEach((msg, idx) => {
    if (!msg.id) msg.id = 'stf_msg_' + idx + '_' + Date.now();
    const isStaff = msg.sender === 'staff';
    const isUser = msg.sender === 'user';
    const avatarUrl = isUser ? AVATAR_CUSTOMER : (isStaff ? AVATAR_STAFF : AVATAR_AI);

    // 1. Independent Reply Preview Component Outside Bubble
    let replyTagHtml = '';
    if (msg.parentMsg) {
      const pSender = msg.parentMsg.sender === 'user' ? 'Khách hàng' : (msg.parentMsg.sender === 'staff' ? 'Staff' : 'AI Assistant');
      replyTagHtml = `
        <div class="reply-preview-tag" onclick="scrollToChatMessage('${msg.parentMsg.id || ''}')" title="Bấm để cuộn đến tin nhắn gốc">
          ${escapeHtml(msg.parentMsg.text)}
        </div>
      `;
    }

    const isMe = msg.sender === 'staff';
    const wrapper = document.createElement('div');
    wrapper.className = `msg-wrapper ${msg.sender} ${isMe ? 'sent-by-me' : 'received-by-me'}`;
    wrapper.id = `chat_item_${msg.id}`;

    const safeText = escapeHtml(msg.text).replace(/'/g, "\\'").replace(/"/g, '&quot;');

    wrapper.innerHTML = `
      ${replyTagHtml}
      <div class="msg-main-row">
        <img src="${avatarUrl}" class="msg-avatar" style="width:32px; height:32px; border-radius:50%; object-fit:cover; flex-shrink:0; border: 1px solid var(--border-color);" alt="${msg.sender}" />
        <div class="msg-content-box">
          <div class="msg-bubble" style="min-width:24px;">${formatMentions(msg.text)}</div>
          <div class="msg-meta">${msg.time || ''}</div>
        </div>
        <div class="msg-hover-action" onclick="startStaffReplyQuote('${msg.sender}', '${safeText}', '${msg.id}')" title="Trả lời tin nhắn">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
        </div>
      </div>
    `;

    messagesBox.appendChild(wrapper);
  });

  scrollToBottom(messagesBox);
}

function sendStaffChatMessage(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  const text = getChatInputValue('staff-chat-input');
  if (!text) return;

  if (!activeStaffChatEmail) {
    showToast('Cảnh báo', 'Vui lòng chọn một cuộc trò chuyện ở danh sách bên trái trước.', 'warning');
    return;
  }

  clearChatInput('staff-chat-input');

  const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const sessions = getStoredChatSessions();
  const session = sessions[activeStaffChatEmail];

  if (!session) return;

  const msgId = 'stf_msg_' + Date.now();
  const newMsg = {
    id: msgId,
    sender: 'staff',
    text: text,
    time: timeStr,
    status: 'seen',
    parentMsg: activeStaffReplyQuote ? { ...activeStaffReplyQuote } : null
  };

  cancelStaffReplyQuote();
  hideStaffMentionDropdown();

  session.messages.push(newMsg);
  session.lastActive = new Date().toISOString();
  saveStoredChatSessions(sessions);

  // Render to Staff Chat Box
  selectStaffChatSession(activeStaffChatEmail);

  // Trigger User Side Bell Notification & Unread Badge Wiggle
  if (typeof addChatNotificationForUser === 'function') {
    addChatNotificationForUser(activeStaffChatEmail, text);
  }

  notifyUnreadUserChatMessage();

  if (getUserEmail() === activeStaffChatEmail) {
    renderUserChatHistory();
  }

  // showToast('Thành công', `Đã gửi tin nhắn tới ${activeStaffChatEmail}`, 'success');
}

function resolveCurrentStaffChat() {
  if (!activeStaffChatEmail) return;

  const sessions = getStoredChatSessions();
  const session = sessions[activeStaffChatEmail];
  if (!session) return;

  const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  session.needsStaff = false;
  session.messages.push({ id: 'ai_msg_' + Date.now(), sender: 'ai', text: 'Nhân viên đã đánh dấu hoàn tất hỗ trợ phiên trò chuyện này.', time: timeStr, status: 'seen' });
  saveStoredChatSessions(sessions);

  selectStaffChatSession(activeStaffChatEmail);

  if (getUserEmail() === activeStaffChatEmail) {
    renderUserChatHistory();
  }

  showToast('Thành công', `Đã hoàn tất hỗ trợ cho ${activeStaffChatEmail}!`, 'success');
}

// Staff Mention & Quote Helpers
function handleStaffMentionInput(e) {
  const el = e.target;
  const text = el.isContentEditable ? (el.innerText || '') : (el.value || '');
  const dropdown = document.getElementById('staff-mention-dropdown');
  if (!dropdown) return;
  const lastWord = text.split(/\s+/).pop();
  if (lastWord && lastWord.startsWith('@')) {
    dropdown.classList.remove('hidden');
    dropdown.style.display = 'flex';
  } else {
    dropdown.classList.add('hidden');
    dropdown.style.display = 'none';
  }
}

function hideStaffMentionDropdown() {
  const dropdown = document.getElementById('staff-mention-dropdown');
  if (dropdown) {
    dropdown.classList.add('hidden');
    dropdown.style.display = 'none';
  }
}

function insertStaffMention(tagText) {
  const input = document.getElementById('staff-chat-input');
  if (!input) return;

  if (input.isContentEditable) {
    input.focus();
    const chipHtml = createMentionChipHtml(tagText);
    const html = input.innerHTML;
    if (html.endsWith('@')) {
      input.innerHTML = html.replace(/@$/, '') + chipHtml;
    } else {
      input.innerHTML += chipHtml;
    }
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(input);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    input.value += tagText;
  }
  hideStaffMentionDropdown();
}

function startStaffReplyQuote(sender, text, id) {
  activeStaffReplyQuote = { id, sender, text };
  const preview = document.getElementById('staff-chat-reply-preview');
  const nameEl = document.getElementById('staff-reply-target-name');
  const textEl = document.getElementById('staff-reply-target-text');
  if (preview && nameEl && textEl) {
    nameEl.innerText = `Trả lời ${sender === 'user' ? ' ' : ' '}:`;
    textEl.innerText = text.length > 40 ? text.slice(0, 40) + '...' : text;
    preview.style.display = 'flex';
  }
  const input = document.getElementById('staff-chat-input');
  if (input) input.focus();
}

function cancelStaffReplyQuote() {
  activeStaffReplyQuote = null;
  const preview = document.getElementById('staff-chat-reply-preview');
  if (preview) preview.style.display = 'none';
}

// Staff Emoji Picker Helpers (DO NOT CLOSE ON SELECTION)
function toggleStaffEmojiPicker(e) {
  if (e) e.stopPropagation();
  const picker = document.getElementById('staff-emoji-picker');
  if (!picker) return;
  picker.style.display = picker.style.display === 'grid' ? 'none' : 'grid';
}

function insertStaffEmoji(emoji) {
  const input = document.getElementById('staff-chat-input');
  if (input) {
    if (input.isContentEditable) {
      input.focus();
      input.innerHTML += emoji;
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(input);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      input.value += emoji;
      input.focus();
    }
  }
}

// Global click to close popover emoji pickers & mention dropdowns
document.addEventListener('click', (e) => {
  const userPicker = document.getElementById('user-emoji-picker');
  const staffPicker = document.getElementById('staff-emoji-picker');
  if (userPicker && !userPicker.contains(e.target)) userPicker.style.display = 'none';
  if (staffPicker && !staffPicker.contains(e.target)) staffPicker.style.display = 'none';

  const userMention = document.getElementById('user-mention-dropdown');
  const staffMention = document.getElementById('staff-mention-dropdown');
  if (userMention && !userMention.contains(e.target)) userMention.style.display = 'none';
  if (staffMention && !staffMention.contains(e.target)) staffMention.style.display = 'none';
});

// Global auto sync listener for live updates across views/windows
window.addEventListener('eigu_chat_updated', () => {
  if (isChatOpen) {
    renderUserChatHistory();
  }
  const staffConsoleVisible = document.getElementById('view-chat-support')?.classList.contains('active') || document.getElementById('view-chat-support')?.style.display !== 'none';
  if (staffConsoleVisible && typeof loadStaffChatConsole === 'function') {
    loadStaffChatConsole();
  }
});

function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}
