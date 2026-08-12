'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, X, Send, RefreshCw, ChevronDown, MessageSquare, Zap, ShieldCheck, HelpCircle, Check, Copy } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

const QUICK_QUESTIONS_VI = [
  '⚡ Hướng dẫn lách bản quyền FFmpeg MD5?',
  '🚀 Tool TikTok Beta cắt video tự động?',
  '💳 Nạp tiền tự động & Bảo hành Via?',
  '🎁 Cách kích hoạt gói Dùng thử (Trial)?',
];

const QUICK_QUESTIONS_EN = [
  '⚡ How to bypass FFmpeg Content ID?',
  '🚀 How does TikTok Beta Auto Clipper work?',
  '💳 Auto deposit & Via warranty terms?',
  '🎁 How to activate Free Trial plan?',
];

const KNOWLEDGE_BASE_RESPONSES: Record<string, { vi: string; en: string }> = {
  ffmpeg: {
    vi: `**Engine Anti-Detect FFmpeg v3.0** của EIGU Platform áp dụng 4 lớp bypass thuật toán Content ID tiên tiến:
1. **Noise Injection**: Thêm nhiễu tần số âm thanh & quang học không nhận biết bằng mắt thường.
2. **Frame Decimation**: Trích xuất & xáo trộn 1-2 khung hình ngẫu nhiên theo mốc thời gian.
3. **3D Audio Spatial Panning**: Thay đổi đồ thị âm thanh 3 chiều chống quét fingerprint audio.
4. **Metadata Stripping**: Xóa toàn bộ EXIF/Encoder metadata mặc định của video.

👉 Bạn có thể tải app Desktop để chạy render GPU tốc độ cao xuất 100 video/phút!`,
    en: `**EIGU Platform's Anti-Detect FFmpeg v3.0 Engine** applies 4 advanced Content ID bypass layers:
1. **Noise Injection**: Adds imperceptible acoustic & optical frequency noise.
2. **Frame Decimation**: Extracts & shuffles 1-2 random frames periodically.
3. **3D Audio Spatial Panning**: Alters 3D audio graph against fingerprint scanners.
4. **Metadata Stripping**: Strips all EXIF/Encoder metadata.

👉 Download Desktop App to leverage GPU-accelerated rendering for 100+ videos/min!`
  },
  tiktok: {
    vi: `**Tool TikTok Beta Auto Clipper** hỗ trợ:
• Tự động phân đoạn video dài 1-20 phút thành các tập video ngắn 9:16.
• Quét từ khóa HOT Niche & bóc tách kịch bản đối thủ viral.
• Tự động chèn Subtitle phụ đề Tiếng Việt / Tiếng Anh lồng tiếng AI.

👉 Truy cập tab **Tính Năng** trên Website hoặc Desktop App để dùng thử ngay!`,
    en: `**TikTok Beta Auto Clipper** features:
• Auto splits 1-20 min videos into 9:16 vertical shorts.
• Scrapes HOT Niche trends & competitor viral hooks.
• Auto generates AI voiceover & subtitles in VI/EN.

👉 Check out the **Features** tab on Web or Desktop App to try now!`
  },
  deposit: {
    vi: `**Hệ Thống Nạp Tiền & Thanh Toán Tự Động**:
• Hỗ trợ chuyển khoản ngân hàng QR Code 24/7 (VietQR / MBBank) nhận tiền trong 5-10 giây.
• Tự động kích hoạt gói dịch vụ & cấp License Key sử dụng ngay lập tức.
• Tất cả tài khoản Via / Proxy đều cam kết bảo hành 1 đổi 1 trong 24 giờ.

👉 Bấm nút **Nạp Tiền** trên Header để xem cú pháp chuyển khoản!`,
    en: `**Auto Deposit & Payment Gateway**:
• Supports 24/7 QR Code bank transfer with instant credit in 5-10 seconds.
• Auto activates subscription plans & generates instant License Keys.
• All Via / Proxy items include 1-to-1 replacement warranty within 24 hours.

👉 Click **Deposit** on the Header to view payment instructions!`
  },
  trial: {
    vi: `**Chính Sách Dùng Thử (Free Trial)**:
• Mỗi tài khoản mới được nhận gói Trial 7 ngày trải nghiệm miễn phí toàn bộ mô-đun.
• Tốc độ cắt video 10 luồng, xuất file HD 1080p chuẩn TikTok.
• Hỗ trợ kỹ thuật 24/7 trực tiếp qua Telegram & AI Assistant.

👉 Đăng ký tài khoản mới trên Website hoặc App Desktop để kích hoạt ngay!`,
    en: `**Free Trial Policy**:
• Every new user gets a 7-day Free Trial with full module access.
• 10-thread video processing speed with HD 1080p output.
• 24/7 technical support via Telegram & AI Assistant.

👉 Register a new account on Web or Desktop App to activate instantly!`
  },
  default: {
    vi: `Cảm ơn bạn đã đặt câu hỏi! Trợ lý AI EIGU đã ghi nhận thông tin.
Hệ thống EIGU Platform cung cấp bộ công cụ tự động hóa MMO toàn diện:
- 🎬 **AI Video Studio & Anti-Detect FFmpeg**
- 📈 **TikTok Beta Hot Niche Finder**
- 🛡️ **Via / Proxy Stealth Network**
- ⚡ **API Gateway Tự Động Hóa**

Bạn có thể chọn các câu hỏi gợi ý hoặc liên hệ Admin qua Telegram Support 24/7 để được hỗ trợ chuyên sâu!`,
    en: `Thank you for your question! EIGU AI Assistant has logged your prompt.
EIGU Platform provides a comprehensive MMO automation suite:
- 🎬 **AI Video Studio & Anti-Detect FFmpeg**
- 📈 **TikTok Beta Hot Niche Finder**
- 🛡️ **Via / Proxy Stealth Network**
- ⚡ **Automation API Gateway**

Feel free to pick any suggested questions or contact our 24/7 Support Team on Telegram!`
  }
};

export default function AIChatWidget() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize default welcome message
  useEffect(() => {
    const welcomeMsg: ChatMessage = {
      id: 'welcome-msg',
      sender: 'ai',
      text: language === 'en'
        ? '👋 Hello! I am the **EIGU AI Assistant 24/7**. How can I help you optimize your video automation workflow today?'
        : '👋 Xin chào! Tôi là **Trợ lý AI Support 24/7** của EIGU Platform. Bạn cần hỗ trợ gì về kỹ thuật lách bản quyền video hay tự động hóa kênh hôm nay?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcomeMsg]);
  }, [language]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Simulate AI dynamic response stream
    setTimeout(() => {
      let aiText = '';
      const qLower = query.toLowerCase();

      if (qLower.includes('ffmpeg') || qLower.includes('lách') || qLower.includes('bypass') || qLower.includes('bản quyền') || qLower.includes('md5')) {
        aiText = KNOWLEDGE_BASE_RESPONSES.ffmpeg[language === 'en' ? 'en' : 'vi'];
      } else if (qLower.includes('tiktok') || qLower.includes('beta') || qLower.includes('cắt') || qLower.includes('clip') || qLower.includes('niche')) {
        aiText = KNOWLEDGE_BASE_RESPONSES.tiktok[language === 'en' ? 'en' : 'vi'];
      } else if (qLower.includes('nạp') || qLower.includes('tiền') || qLower.includes('deposit') || qLower.includes('via') || qLower.includes('bảo hành') || qLower.includes('proxy')) {
        aiText = KNOWLEDGE_BASE_RESPONSES.deposit[language === 'en' ? 'en' : 'vi'];
      } else if (qLower.includes('trial') || qLower.includes('dùng thử') || qLower.includes('miễn phí') || qLower.includes('free') || qLower.includes('giá') || qLower.includes('price')) {
        aiText = KNOWLEDGE_BASE_RESPONSES.trial[language === 'en' ? 'en' : 'vi'];
      } else if (qLower.includes('tin tức') || qLower.includes('news') || qLower.includes('bài viết') || qLower.includes('article') || qLower.includes('hướng dẫn')) {
        aiText = language === 'en'
          ? `📰 **EIGU Official News & Guides**: You can explore all product updates, anti-detect FFmpeg tutorials, and TikTok Beta growth strategies directly in the **News** tab (\`/news\`).`
          : `📰 **Tin Tức & Hướng Dẫn Kỹ Thuật EIGU**: Bạn có thể xem toàn bộ các bài viết cập nhật tính năng mới, hướng dẫn lách bản quyền FFmpeg và chiến lược xây kênh TikTok Beta trực tiếp tại mục **Tin tức** (\`/news\`).`;
      } else if (qLower.includes('staff') || qLower.includes('nhân viên') || qLower.includes('support') || qLower.includes('hỗ trợ') || qLower.includes('admin') || qLower.includes('người')) {
        aiText = language === 'en'
          ? `💬 **24/7 Human Support**: If you need direct assistance from our Staff team, please join our Official Telegram Channel or request live staff support from the Desktop App!`
          : `💬 **Hỗ Trợ Trực Tiếp Từ Staff**: Nếu bạn cần kết nối trực tiếp với Nhân viên Kỹ thuật, vui lòng liên hệ qua Kênh Telegram Official hoặc gửi Yêu cầu Hỗ trợ từ Desktop App!`;
      } else {
        // Dynamic response for custom user queries
        aiText = language === 'en'
          ? `🤖 **EIGU AI Assistant**: Thank you for asking about **"${query}"**!\n\nI have processed your request. EIGU Platform provides automated tools for Video AI, Anti-detect FFmpeg, and MMO Scaling. Feel free to ask more details about FFmpeg MD5 bypass, TikTok Beta Auto Clipper, or Payment Methods!`
          : `🤖 **Trợ Lý AI Support**: Cảm ơn bạn đã gửi câu hỏi về **"${query}"**!\n\nHệ thống EIGU AI đã tiếp nhận và phân tích yêu cầu của bạn. EIGU Platform cung cấp trọn bộ công cụ tự động hóa video AI, anti-detect FFmpeg v3.0 và hệ thống nạp tiền tự động 24/7. Bạn có thể hỏi thêm chi tiết về lách bản quyền, tool TikTok Beta hoặc chính sách bảo hành Via/Proxy!`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-reset-${Date.now()}`,
        sender: 'ai',
        text: language === 'en' ? 'Conversation refreshed. Ask me anything!' : 'Đã làm mới cuộc trò chuyện. Hãy đặt câu hỏi cho tôi!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickQuestions = language === 'en' ? QUICK_QUESTIONS_EN : QUICK_QUESTIONS_VI;

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Chat Support"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 99999,
          width: 58,
          height: 58,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 10px 32px rgba(99, 102, 241, 0.45)',
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s',
        }}
        className="ai-chat-trigger-btn"
      >
        {isOpen ? (
          <X size={26} />
        ) : (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={26} />
            {/* Green Online Badge */}
            <span
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#22c55e',
                border: '2px solid var(--bg-card)',
                boxShadow: '0 0 8px #22c55e',
              }}
            />
          </div>
        )}
      </button>

      {/* Floating Tooltip Hint (Visible when closed) */}
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: 34,
            right: 92,
            zIndex: 99998,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: 12.5,
            fontWeight: 700,
            color: 'var(--text-primary)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
          }}
          className="ai-chat-tooltip-hint"
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          <span>{language === 'en' ? 'AI Support 24/7' : 'Hỗ trợ AI 24/7'}</span>
        </div>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 92,
            right: 24,
            zIndex: 99999,
            width: 390,
            maxWidth: 'calc(100vw - 32px)',
            height: 550,
            maxHeight: 'calc(100vh - 120px)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 24,
            boxShadow: '0 24px 70px rgba(0, 0, 0, 0.65)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
            animation: 'aiChatIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              background: 'var(--bg-primary)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                }}
              >
                <Sparkles size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
                  {language === 'en' ? 'EIGU AI Assistant' : 'Trợ Lý AI Support 24/7'}
                </h3>
                <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                  {language === 'en' ? 'Online 24/7 • Instant Help' : 'Trực tuyến 24/7 • Trả lời tức thì'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={handleClearHistory}
                title={language === 'en' ? 'Refresh conversation' : 'Làm mới cuộc trò chuyện'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <RefreshCw size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Chat"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div
            className="no-scrollbar"
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              background: 'var(--bg-card)',
            }}
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    maxWidth: '86%',
                    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  {msg.sender === 'ai' && (
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'var(--accent-glow)',
                        border: '1px solid var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent)',
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      <Bot size={15} />
                    </div>
                  )}

                  <div
                    style={{
                      background: msg.sender === 'user' ? 'linear-gradient(135deg, var(--accent), #7c3aed)' : 'var(--bg-primary)',
                      color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                      border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                      borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      padding: '11px 14px',
                      fontSize: 13.5,
                      lineHeight: 1.5,
                      boxShadow: msg.sender === 'user' ? '0 4px 14px rgba(99, 102, 241, 0.25)' : 'none',
                      whiteSpace: 'pre-wrap',
                      position: 'relative',
                    }}
                  >
                    {msg.text}
                    {msg.sender === 'ai' && (
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        style={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          opacity: 0.6,
                          padding: 2,
                        }}
                        title="Sao chép"
                      >
                        {copiedId === msg.id ? <Check size={13} color="#22c55e" /> : <Copy size={13} />}
                      </button>
                    )}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 10.5,
                    color: 'var(--text-muted)',
                    marginTop: 4,
                    paddingLeft: msg.sender === 'ai' ? 36 : 0,
                    paddingRight: msg.sender === 'user' ? 4 : 0,
                  }}
                >
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Typing Animation */}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--accent-glow)',
                    border: '1px solid var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                  }}
                >
                  <Bot size={15} />
                </div>
                <div
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px 16px 16px 4px',
                    padding: '10px 16px',
                    display: 'flex',
                    gap: 4,
                    alignItems: 'center',
                  }}
                >
                  <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'dotPulse 1.2s infinite 0s' }} />
                  <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'dotPulse 1.2s infinite 0.2s' }} />
                  <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'dotPulse 1.2s infinite 0.4s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer with Quick Questions Dropdown Popover */}
          <div
            style={{
              padding: '12px 14px',
              background: 'var(--bg-primary)',
              borderTop: '1px solid var(--border-color)',
              position: 'relative',
            }}
          >
            {/* Popover Menu for Quick Questions */}
            {showQuickMenu && (
              <div
                className="no-scrollbar"
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 10px)',
                  left: 14,
                  right: 14,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 18,
                  padding: '12px',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  zIndex: 20,
                  backdropFilter: 'blur(20px)',
                  maxHeight: 260,
                  overflowY: 'auto',
                  animation: 'aiChatIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 6, borderBottom: '1px solid var(--border-color)', marginBottom: 2 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Zap size={13} style={{ color: 'var(--accent)' }} />
                    {language === 'en' ? 'Suggested Questions' : 'Câu Hỏi Gợi Ý Nhanh'}
                  </span>
                  <button
                    onClick={() => setShowQuickMenu(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
                  >
                    <X size={14} />
                  </button>
                </div>
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleSendMessage(q);
                      setShowQuickMenu(false);
                    }}
                    style={{
                      padding: '9px 12px',
                      borderRadius: 12,
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: 12.5,
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      lineHeight: 1.4,
                    }}
                    className="quick-question-item-btn"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{ display: 'flex', gap: 8, alignItems: 'center' }}
            >
              {/* Compact Quick Questions Button */}
              <button
                type="button"
                onClick={() => setShowQuickMenu(!showQuickMenu)}
                title={language === 'en' ? 'Suggested Questions' : 'Câu hỏi gợi ý'}
                style={{
                  height: 38,
                  padding: '0 10px',
                  borderRadius: 20,
                  background: showQuickMenu ? 'var(--accent-glow)' : 'var(--bg-card)',
                  border: showQuickMenu ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                  color: showQuickMenu ? 'var(--accent)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                  transition: 'all 0.2s',
                }}
              >
                <Zap size={14} />
                <span>{language === 'en' ? 'Questions' : 'Gợi ý'}</span>
                <ChevronDown size={12} style={{ transform: showQuickMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={language === 'en' ? 'Ask AI Assistant...' : 'Hỏi Trợ lý AI EIGU Platform...'}
                style={{
                  flex: 1,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 20,
                  padding: '9px 14px',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: inputText.trim() ? 'var(--accent)' : 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: inputText.trim() ? '#ffffff' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes aiChatIn {
          from { transform: translateY(20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .ai-chat-trigger-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 12px 36px rgba(99, 102, 241, 0.6) !important;
        }
        .quick-question-item-btn:hover {
          border-color: var(--accent) !important;
          color: var(--accent) !important;
          background: var(--accent-glow) !important;
        }
        /* Hide ugly scrollbars globally for chat widget elements */
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>
    </>
  );
}
