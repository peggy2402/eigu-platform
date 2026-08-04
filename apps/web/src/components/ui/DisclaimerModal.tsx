'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, CheckCircle2, Lock, FileText, AlertTriangle } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen?: boolean;
  onAccept?: () => void;
  isGatingMode?: boolean; // True when shown right after registration
}

export default function DisclaimerModal({
  isOpen = true,
  onAccept,
  isGatingMode = true,
}: DisclaimerModalProps) {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleConfirm = () => {
    if (!hasAgreed) return;
    setIsSubmitting(true);
    
    // Simulate / execute consent logging (timestamp, user_id, ip)
    const consentLog = {
      timestamp: new Date().toISOString(),
      accepted: true,
      clientUserAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('eigu_disclaimer_accepted', JSON.stringify(consentLog));
    }

    setTimeout(() => {
      setIsSubmitting(false);
      if (onAccept) onAccept();
    }, 400);
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(10, 10, 15, 0.88)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 860,
          maxHeight: '90vh',
          background: 'var(--bg-card, #14141d)',
          border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
          borderRadius: 16,
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.05))',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
            }}
          >
            <ShieldAlert size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: 'rgba(99, 102, 241, 0.25)',
                  color: '#a5b4fc',
                }}
              >
                Bước xác thực bắt buộc (One-Time Gating Acceptance)
              </span>
            </div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: 'var(--text-primary, #ffffff)',
                marginTop: 4,
                margin: 0,
              }}
            >
              TUYÊN BỐ MIỄN TRÙ TRÁCH NHIỆM & ĐIỀU KHỎAN SỬ DỤNG AI
            </h2>
          </div>
        </div>

        {/* Banner Announcement */}
        <div
          style={{
            padding: '12px 28px',
            background: 'rgba(234, 179, 8, 0.1)',
            borderBottom: '1px solid rgba(234, 179, 8, 0.2)',
            color: '#fde047',
            fontSize: 13,
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>
            <strong>Chào mừng bạn đến với EIGU Platform!</strong> Trước khi bắt đầu sử dụng dịch vụ lần đầu tiên, vui lòng đọc kỹ và xác nhận các điều khoản pháp lý dưới đây. Đây là quy trình xác nhận an toàn bắt buộc gắn liền với tài khoản của bạn.
          </span>
        </div>

        {/* Scrollable Content Body */}
        <div
          style={{
            padding: '24px 28px',
            overflowY: 'auto',
            flex: 1,
            color: 'var(--text-secondary, #cbd5e1)',
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          {/* Section 1 */}
          <div style={{ marginBottom: 24 }}>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#818cf8',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <FileText size={18} /> 1. VAI TRÒ CỦA EIGU PLATFORM
            </h3>
            <p style={{ margin: 0, textAlign: 'justify' }}>
              <strong>EIGU Platform</strong> (Nền tảng Tự động hóa AI Video SaaS dành cho cộng đồng MMO TikTok, YouTube Shorts & Reels) đóng vai trò là đơn vị cung cấp giao diện quản trị, phần mềm tự động hóa và công cụ trung gian kết nối. EIGU Platform không trực tiếp kiểm soát, can thiệp hoặc sở hữu các mô hình/thuật toán AI lõi bên thứ ba (bao gồm nhưng không giới hạn ở OpenAI, Fal.ai, ElevenLabs, OmniVoice, Kling AI). Tất cả kết quả đầu ra (video, âm thanh, văn bản) phụ thuộc hoàn toàn vào câu lệnh (prompt), dữ liệu đầu vào và ý chí chủ quan độc lập của người dùng.
            </p>
          </div>

          {/* Section 2 */}
          <div style={{ marginBottom: 24 }}>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#818cf8',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <ShieldAlert size={18} /> 2. TRÁCH NHIỆM MINH BẠCH VÀ NGHĨA VỤ NGƯỜI DÙNG
            </h3>
            <p style={{ margin: '0 0 8px 0', textAlign: 'justify' }}>
              Căn cứ <strong>Luật Trí tuệ nhân tạo 2025</strong> (Luật số 134/2025/QH15, có hiệu lực từ ngày 01/03/2026), đặc biệt là <strong>Điều 11</strong> về nghĩa vụ gắn nhãn nhận biết nội dung do AI tạo ra:
            </p>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 6 }}>
                Người dùng có nghĩa vụ pháp lý bắt buộc phải dán nhãn nhận diện/cảnh báo rõ ràng đối với toàn bộ sản phẩm video, hình ảnh hoặc giọng nói do AI tạo ra/mô phỏng người thật hoặc sự kiện thực tế trước khi xuất bản lên các nền tảng mạng xã hội.
              </li>
              <li>
                EIGU Platform tuyên bố miễn trừ hoàn toàn mọi trách nhiệm liên đới nếu người dùng cố tình không tuân thủ nghĩa vụ dán nhãn nhận biết nội dung AI theo đúng quy định của pháp luật Việt Nam.
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div style={{ marginBottom: 24 }}>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#ef4444',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertTriangle size={18} /> 3. CÁC HÀNH VI BỊ NGHIÊM CẤM
            </h3>
            <p style={{ margin: '0 0 8px 0', textAlign: 'justify' }}>
              Căn cứ <strong>Điều 7 Luật AI 2025</strong>, người dùng tuyệt đối không được sử dụng EIGU Platform để thực hiện các hành vi sau:
            </p>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 6 }}>Tạo, phát tán nội dung vi phạm pháp luật, xâm phạm quyền và lợi ích hợp pháp của cá nhân, cơ quan, tổ chức.</li>
              <li style={{ marginBottom: 6 }}>Tạo nội dung giả mạo (Deepfake), lừa đảo, thao túng nhận thức hoặc bôi nhọ danh dự, nhân phẩm người khác.</li>
              <li style={{ marginBottom: 6 }}>Gây nguy hại đến an ninh quốc gia, trật tự an toàn xã hội, chủ quyền và lợi ích quốc gia.</li>
              <li style={{ marginBottom: 6 }}>Lợi dụng nhóm đối tượng dễ bị tổn thương (trẻ em, người cao tuổi, người khuyết tật) để trục lợi hoặc truyền bá văn hóa phẩm độc hại.</li>
              <li>Xâm phạm bản quyền tác giả, nhãn hiệu thương mại, hoặc sử dụng công cụ để phát tán thông tin sai sự thật trên các nền tảng MMO (TikTok, YouTube, Facebook).</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div style={{ marginBottom: 24 }}>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#818cf8',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Lock size={18} /> 4. QUYỀN RIÊNG TƯ VÀ DỮ LIỆU NGƯỜI DÙNG
            </h3>
            <p style={{ margin: '0 0 8px 0', textAlign: 'justify' }}>
              Căn cứ <strong>Điều 4 Luật AI 2025</strong> về bảo vệ dữ liệu cá nhân và quyền riêng tư:
            </p>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 6 }}>
                <strong>Dữ liệu KHÔNG lưu trữ:</strong> EIGU Platform không lưu trữ, sở hữu hay kiểm duyệt nội dung video/âm thanh đầu ra của người dùng trên máy chủ trung tâm (các tệp render được xử lý cục bộ trên thiết bị của người dùng hoặc xóa ngay sau khi kết thúc phiên).
              </li>
              <li style={{ marginBottom: 6 }}>
                <strong>Dữ liệu CÓ lưu trữ:</strong> Hệ thống lưu trữ thông tin đăng ký (Username, Email, Mật khẩu mã hóa), nhật ký đăng nhập (IP, thiết bị), lịch sử giao dịch và nhật ký chấp thuận điều khoản (Consent Log) nhằm phục vụ công tác vận hành, bảo mật và đối soát pháp lý.
              </li>
              <li style={{ marginBottom: 6 }}>EIGU Platform cam kết bảo mật thông tin, không bán hay chia sẻ dữ liệu cho bên thứ ba ngoại trừ trường hợp có yêu cầu chính thức từ cơ quan nhà nước có thẩm quyền theo quy định của pháp luật Việt Nam.</li>
              <li>Người dùng có quyền gửi yêu cầu xóa dữ liệu/tài khoản qua kênh liên hệ chính thức: <code>support@eigu.vn</code> hoặc <code>privacy@eigu.vn</code>.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#818cf8',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle2 size={18} /> 5. MIỄN TRỪ TRÁCH NHIỆM TỔNG QUÁT & CHẤP THUẬN
            </h3>
            <p style={{ margin: 0, textAlign: 'justify' }}>
              EIGU Platform cung cấp công cụ trên tinh thần trung lập về công nghệ. Người dùng tự chịu hoàn toàn trách nhiệm trước pháp luật hình sự, dân sự và hành chính nếu nội dung do người dùng khởi tạo gây ra tổn hại, tranh chấp bản quyền hoặc vi phạm quy định pháp luật. EIGU Platform không chịu bất kỳ trách nhiệm bồi thường thiệt hại trực tiếp hay gián tiếp nào phát sinh từ việc người dùng khai thác ứng dụng.
            </p>
          </div>
        </div>

        {/* Modal Footer / Acceptance Action */}
        <div
          style={{
            padding: '20px 28px',
            borderTop: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            background: 'var(--bg-secondary, #0f0f17)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Checkbox Gating */}
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              cursor: 'pointer',
              fontSize: 13.5,
              fontWeight: 600,
              color: 'var(--text-primary, #ffffff)',
              lineHeight: 1.5,
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              style={{
                width: 18,
                height: 18,
                marginTop: 2,
                accentColor: 'var(--accent, #6366f1)',
                cursor: 'pointer',
              }}
            />
            <span>
              Tôi đã đọc, hiểu và cam kết tuân thủ đầy đủ các quy định pháp lý và tuyên bố miễn trừ trách nhiệm nêu trên trước khi bắt đầu sử dụng <strong>EIGU Platform</strong>.
            </span>
          </label>

          {/* Action Button & Disclaimer Legal Note */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary, #94a3b8)', fontStyle: 'italic' }}>
              🔒 Nhật ký đồng ý (Consent Log) sẽ được ghi vết và gắn liền với tài khoản của bạn.
            </span>

            <button
              onClick={handleConfirm}
              disabled={!hasAgreed || isSubmitting}
              style={{
                padding: '12px 32px',
                borderRadius: 10,
                background: hasAgreed ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.1)',
                color: hasAgreed ? '#ffffff' : 'rgba(255,255,255,0.4)',
                border: 'none',
                fontWeight: 700,
                fontSize: 14,
                cursor: hasAgreed ? 'pointer' : 'not-allowed',
                transition: 'all 0.25s ease',
                boxShadow: hasAgreed ? '0 4px 20px rgba(99, 102, 241, 0.4)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {isSubmitting ? (
                'Đang ghi nhận...'
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  TIẾP TỤC SỬ DỤNG
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
