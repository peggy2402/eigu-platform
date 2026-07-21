// Live Chat Widget Logic (AI + Staff Support)

let isChatOpen = false;
let chatUnreadCount = 0;

function toggleLiveChatWidget(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  const box = document.getElementById('live-chat-box');
  const badge = document.getElementById('chat-badge');
  if (!box) return;

  isChatOpen = !isChatOpen;
  if (isChatOpen) {
    box.classList.remove('hidden');
    box.style.display = 'flex';
    chatUnreadCount = 0;
    if (badge) {
      badge.classList.add('hidden');
      badge.style.display = 'none';
    }
    const input = document.getElementById('chat-input');
    if (input) input.focus();
  } else {
    box.classList.add('hidden');
    box.style.display = 'none';
  }
}

async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  appendChatMessage(text, 'user');

  // AI Auto Reply
  const aiTypingId = appendTypingIndicator();

  try {
    const reply = await getAiSupportResponse(text);
    removeTypingIndicator(aiTypingId);
    appendChatMessage(reply, 'ai');
  } catch (err) {
    removeTypingIndicator(aiTypingId);
    appendChatMessage('Tôi hiện tại chưa thể trả lời câu hỏi này. Bạn có muốn gửi yêu cầu cho Nhân viên (Staff) hỗ trợ trực tiếp không?', 'ai');
  }
}

function appendChatMessage(text, sender, time = 'Vừa xong') {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender}`;
  msgDiv.innerHTML = `
    <div class="msg-bubble">${escapeHtml(text)}</div>
    <div class="msg-time">${time}</div>
  `;

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;

  if (!isChatOpen && sender !== 'user') {
    chatUnreadCount++;
    const badge = document.getElementById('chat-badge');
    if (badge) {
      badge.classList.remove('hidden');
      badge.innerText = chatUnreadCount > 5 ? '5+' : chatUnreadCount;
    }
  }
}

function appendTypingIndicator() {
  const container = document.getElementById('chat-messages');
  if (!container) return null;

  const id = 'typing_' + Date.now();
  const div = document.createElement('div');
  div.id = id;
  div.className = 'chat-msg ai';
  div.innerHTML = `<div class="msg-bubble" style="font-style:italic; opacity:0.7;">AI đang suy nghĩ...</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.remove();
}

  const aiAnswer = await getAiSupportResponseText(userQuestion);
  return aiAnswer;
}

async function getAiSupportResponseText(userQuestion) {
  // Try sending to Gemini / Backend AI API with System Knowledge Context
  if (window.ipcRenderer) {
    try {
      const systemPrompt = `Bạn là Trợ lý AI Chăm sóc Khách hàng chuyên nghiệp của ứng dụng EIGU Platform. 
Dưới đây là tri thức về ứng dụng EIGU Platform:
- Tính năng: Tự động cắt video, Tạo video AI (Veo, Kling, Luma), Tìm ngách hot, Tải hàng loạt, Tạo workflow tự động.
- Quản lý API Key: Có thể nhập nhiều key (Gemini API, Fal.ai) trong tab Cài đặt > Bể chứa API Keys để hệ thống tự động xoay vòng miễn phí 100%. Các key được mã hóa bằng Keychain/DPAPI.
- Hỗ trợ: Nếu không tự tin trả lời hoặc khách hàng gặp sự cố phức tạp, gợi ý khách hàng bấm nút "Yêu cầu Staff hỗ trợ".

Hãy trả lời ngắn gọn, thân thiện cho câu hỏi của khách hàng: ${userQuestion}`;

      const response = await window.ipcRenderer.invoke('ai-video-generate-prompts', {
        text: systemPrompt,
        mode: 'idea'
      });
      if (Array.isArray(response) && response.length > 0) {
        return response.join(' ');
      }
    } catch (e) {}
  }

  // Knowledge base fallback responses
  const q = userQuestion.toLowerCase();
  if (q.includes('cắt') || q.includes('cut')) {
    return 'Để cắt video tự động, bạn vào tab "Công cụ > Tự động cắt", dán link YouTube hoặc chọn file video từ máy, sau đó chọn độ dài phân cảnh và nhấn "Bắt đầu xử lý".';
  }
  if (q.includes('ai') || q.includes('tạo video')) {
    return 'Tính năng "Tạo video AI" hỗ trợ 2 chế độ: Copy (bóc kịch bản video gốc) và Ý tưởng (viết prompt). Bạn vào tab "Công cụ > Tạo video AI" để dùng nhé!';
  }
  if (q.includes('key') || q.includes('api') || q.includes('cài đặt')) {
    return 'Bạn có thể quản lý và nạp nhiều API Key (Gemini, Fal.ai) trong tab "Cài đặt > Bể chứa API Keys". Các key sẽ được mã hóa bảo mật 100%.';
  }
  if (q.includes('giá') || q.includes('tiền') || q.includes('nạp')) {
    return 'EIGU Platform hỗ trợ cả các mô hình AI miễn phí qua Google AI Studio API và mô hình local. Bạn không bắt buộc phải nạp phí để dùng thử!';
  }

  return 'Cảm ơn câu hỏi của bạn! EIGU Platform là hệ thống tự động hóa nội dung đa nền tảng. Nếu bạn cần hỗ trợ thêm, bạn có thể bấm nút bên dưới để chuyển cho Nhân viên (Staff) tư vấn nhé!';
}

function requestHumanSupport() {
  appendChatMessage('Đã gửi yêu cầu hỗ trợ tới đội ngũ Staff / Admin! Một nhân viên sẽ phản hồi cuộc trò chuyện này trong ít phút.', 'ai');
  showToast('Chat Support', 'Đã chuyển cuộc trò chuyện sang cho Nhân viên hỗ trợ!', 'info');

  const staffChatList = document.getElementById('staff-chat-list');
  if (staffChatList) {
    const item = document.createElement('div');
    item.className = 'chat-session-item active';
    item.style.cssText = 'padding: 10px; background: var(--bg-card); border-radius: 6px; border: 1px solid var(--border-color); cursor: pointer; margin-bottom:6px;';
    const email = (typeof userProfile !== 'undefined' && userProfile) ? userProfile.email : 'client@gmail.com';
    item.innerHTML = `
      <div style="font-weight: 600; font-size: 13px;">User: ${email}</div>
      <div style="font-size: 12px; color: #ef4444; margin-top: 2px;">⚠️ Cần Staff hỗ trợ</div>
    `;
    staffChatList.prepend(item);
  }
}

function sendStaffChatMessage(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  const input = document.getElementById('staff-chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  input.value = '';

  const messagesBox = document.getElementById('staff-chat-messages');
  if (messagesBox) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg staff';
    msgDiv.style.cssText = 'max-width: 80%; align-self: flex-end; background: var(--accent); color: white; padding: 10px; border-radius: 8px; font-size: 13px; margin-bottom: 8px;';
    msgDiv.innerHTML = `<strong>Staff:</strong> ${escapeHtml(text)}`;
    messagesBox.appendChild(msgDiv);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  appendChatMessage(text, 'staff');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}
