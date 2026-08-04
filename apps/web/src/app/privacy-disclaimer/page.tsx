'use client';

import { useState, useEffect } from 'react';
import Footer from '../../components/layout/Footer';
import Header from '../../components/layout/Header';
import { ShieldAlert, CheckCircle2, Lock, FileText, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyDisclaimerPage() {
  const router = useRouter();
  const [hasAgreed, setHasAgreed] = useState(false);
  const [acceptedLog, setAcceptedLog] = useState<string | null>(null);

  useEffect(() => {
    router.replace('/faq');
  }, [router]);

  const handleConfirm = () => {
    if (!hasAgreed) return;
    const now = new Date().toLocaleString('vi-VN');
    const logStr = `Đã xác nhận lúc ${now}`;
    setAcceptedLog(logStr);
    if (typeof window !== 'undefined') {
      localStorage.setItem('eigu_disclaimer_accepted', JSON.stringify({ timestamp: new Date().toISOString(), accepted: true }));
    }
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #0a0a0f)', color: 'var(--text-primary, #ffffff)', display: 'flex', flexDirection: 'column' }}>
      <Header onNavigate={handleNavigate} onOpenSettings={() => {}} onOpenFeedback={() => {}} />

      <main style={{ flex: 1, maxWidth: 960, width: '100%', margin: '0 auto', padding: '120px 24px 60px' }}>
        <button
          onClick={() => router.back()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 8,
            background: 'var(--bg-card, rgba(255,255,255,0.05))',
            border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            color: 'var(--text-secondary, #cbd5e1)',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 24,
            transition: 'all 0.2s ease',
          }}
        >
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div
          style={{
            background: 'var(--bg-card, #14141d)',
            border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '32px 36px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.08))',
              borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: 'rgba(99, 102, 241, 0.25)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
              }}
            >
              <ShieldAlert size={28} />
            </div>
            <div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '3px 10px',
                  borderRadius: 6,
                  background: 'rgba(99, 102, 241, 0.25)',
                  color: '#a5b4fc',
                }}
              >
                Văn Bản Pháp Lý & Điều Khoản Sử Dụng AI
              </span>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: 'var(--text-primary, #ffffff)',
                  marginTop: 6,
                  margin: 0,
                }}
              >
                TUYÊN BỐ MIỄN TRÙ TRÁCH NHIỆM & BẢO MẬT EIGU PLATFORM
              </h1>
            </div>
          </div>

          {/* Legal Document Content */}
          <div style={{ padding: '32px 36px', fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary, #cbd5e1)' }}>
            
            {/* Section 1 */}
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#818cf8', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={20} /> 1. VAI TRÒ CỦA EIGU PLATFORM
              </h2>
              <p style={{ margin: 0, textAlign: 'justify' }}>
                <strong>EIGU Platform</strong> (Nền tảng Tự động hóa AI Video SaaS dành cho cộng đồng MMO TikTok, YouTube Shorts & Reels) được định vị là đơn vị cung cấp giải pháp giao diện phần mềm, bộ công cụ tự động hóa và cơ sở hạ tầng kỹ thuật trung gian. EIGU Platform không trực tiếp kiểm soát, can thiệp hoặc sở hữu các mô hình/thuật toán AI lõi bên thứ ba (bao gồm nhưng không giới hạn ở OpenAI, Fal.ai, ElevenLabs, OmniVoice, Kling AI). Tất cả kết quả đầu ra (video, âm thanh, hình ảnh, văn bản) phụ thuộc hoàn toàn vào câu lệnh (prompt), tham số đầu vào và ý chí chủ quan độc lập của người dùng.
              </p>
            </section>

            {/* Section 2 */}
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#818cf8', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldAlert size={20} /> 2. TRÁCH NHIỆM MINH BẠCH VÀ NGHĨA VỤ NGƯỜI DÙNG
              </h2>
              <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
                Căn cứ <strong>Luật Trí tuệ nhân tạo 2025</strong> (Luật số 134/2025/QH15, có hiệu lực từ ngày 01/03/2026), đặc biệt là <strong>Điều 11</strong> về nghĩa vụ gắn nhãn nhận biết nội dung do trí tuệ nhân tạo tạo ra:
              </p>
              <ul style={{ paddingLeft: 24, margin: 0 }}>
                <li style={{ marginBottom: 8 }}>
                  Người dùng có nghĩa vụ pháp lý bắt buộc phải dán nhãn nhận diện/cảnh báo rõ ràng đối với toàn bộ sản phẩm video, hình ảnh hoặc giọng nói do AI tạo ra hoặc mô phỏng người thật, giọng nói thật, sự kiện thực tế trước khi xuất bản công khai trên các nền tảng truyền thông xã hội.
                </li>
                <li>
                  EIGU Platform từ chối và miễn trừ hoàn toàn mọi trách nhiệm liên đới nếu người dùng không tuân thủ nghĩa vụ dán nhãn nhận biết nội dung AI theo đúng quy định của pháp luật hiện hành.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ef4444', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={20} /> 3. CÁC HÀNH VI BỊ NGHIÊM CẤM
              </h2>
              <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
                Căn cứ <strong>Điều 7 Luật AI 2025</strong>, người dùng tuyệt đối không được sử dụng EIGU Platform để thực hiện các hành vi sau:
              </p>
              <ul style={{ paddingLeft: 24, margin: 0 }}>
                <li style={{ marginBottom: 8 }}>Tạo, lưu trữ hoặc phát tán nội dung vi phạm pháp luật, xâm phạm quyền và lợi ích hợp pháp của cá nhân, cơ quan, tổ chức.</li>
                <li style={{ marginBottom: 8 }}>Tạo nội dung giả mạo (Deepfake), lừa đảo, thao túng nhận thức cộng đồng hoặc bôi nhọ danh dự, nhân phẩm của người khác.</li>
                <li style={{ marginBottom: 8 }}>Tạo nội dung gây nguy hại đến an ninh quốc gia, trật tự an toàn xã hội, chủ quyền và toàn vẹn lãnh thổ.</li>
                <li style={{ marginBottom: 8 }}>Lợi dụng các nhóm đối tượng dễ bị tổn thương (trẻ em, người cao tuổi, người khuyết tật) để trục lợi bất hợp pháp hoặc phát tán văn hóa phẩm độc hại.</li>
                <li>Xâm phạm bản quyền tác giả, thương hiệu, hoặc cố tình phát tán thông tin sai sự thật trên các kênh nội dung MMO.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#818cf8', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Lock size={20} /> 4. QUYỀN RIÊNG TƯ VÀ DỮ LIỆU NGƯỜI DÙNG
              </h2>
              <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
                Căn cứ <strong>Điều 4 Luật AI 2025</strong> về bảo vệ dữ liệu cá nhân và quyền riêng tư:
              </p>
              <ul style={{ paddingLeft: 24, margin: 0 }}>
                <li style={{ marginBottom: 8 }}>
                  <strong>Dữ liệu KHÔNG lưu trữ:</strong> EIGU Platform không lưu trữ, kiểm duyệt hay sở hữu các tệp video/âm thanh thành phẩm của người dùng trên máy chủ (các tệp render được xử lý trực tiếp cục bộ trên máy trạm client).
                </li>
                <li style={{ marginBottom: 8 }}>
                  <strong>Dữ liệu CÓ lưu trữ:</strong> Hệ thống chỉ lưu trữ thông tin tài khoản (Username, Email, mật khẩu mã hóa), địa chỉ IP, thời gian đăng nhập, lịch sử giao dịch và nhật ký xác nhận chấp thuận điều khoản (Consent Log) nhằm đảm bảo an ninh hệ thống và nghĩa vụ đối soát pháp lý.
                </li>
                <li style={{ marginBottom: 8 }}>EIGU Platform cam kết tuyệt đối không bán hoặc chia sẻ thông tin người dùng cho bên thứ ba ngoại trừ trường hợp có yêu cầu bằng văn bản từ cơ quan nhà nước có thẩm quyền theo quy định của pháp luật Việt Nam.</li>
                <li>Mọi yêu cầu xóa tài khoản/dữ liệu cá nhân xin gửi về địa chỉ email: <code>support@eigu.vn</code> hoặc <code>privacy@eigu.vn</code>.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#818cf8', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={20} /> 5. MIỄN TRỪ TRÁCH NHIỆM TỔNG QUÁT & CHẤP THUẬN
              </h2>
              <p style={{ margin: 0, textAlign: 'justify' }}>
                EIGU Platform là giải pháp công cụ trung lập. Người dùng tự chịu hoàn toàn trách nhiệm pháp lý, tài chính và hình sự đối với toàn bộ nội dung do mình khởi tạo, chỉnh sửa hoặc xuất bản. EIGU Platform không chịu bất kỳ trách nhiệm bồi thường thiệt hại trực tiếp hay gián tiếp nào phát sinh từ các hành vi vi phạm của người dùng.
              </p>
            </section>
          </div>

          {/* Interactive Acceptance Footer */}
          <div
            style={{
              padding: '24px 36px',
              background: 'var(--bg-secondary, #0f0f17)',
              borderTop: '1px solid var(--border-color, rgba(255,255,255,0.1))',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-primary, #ffffff)',
                lineHeight: 1.5,
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
                Tôi đã đọc, hiểu và cam kết tuân thủ đầy đủ các quy định pháp lý và tuyên bố miễn trừ trách nhiệm nêu trên trước khi sử dụng <strong>EIGU Platform</strong>.
              </span>
            </label>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              {acceptedLog ? (
                <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} /> {acceptedLog}
                </span>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--text-secondary, #94a3b8)', fontStyle: 'italic' }}>
                  🔒 Nhật ký chấp thuận sẽ được lưu vết hợp lệ.
                </span>
              )}

              <button
                onClick={handleConfirm}
                disabled={!hasAgreed}
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
                <CheckCircle2 size={18} />
                TIẾP TỤC SỬ DỤNG
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
