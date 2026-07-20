'use client';

const sections = [
  {
    title: '1. Dashboard',
    content: (
      <p>
        Trang tổng quan hiển thị số liệu video đã xử lý, đã upload TikTok, đang chờ
        và số tài khoản TikTok đang quản lý. Theo dõi hoạt động gần đây ở phía dưới.
      </p>
    ),
  },
  {
    title: '2. Tự động hóa video',
    content: (
      <>
        <p><strong>Đầu vào:</strong> Kéo thả file .mp4 hoặc dán link YouTube để tải video về tự động.</p>
        <p><strong>Chế độ cắt:</strong> Chọn độ dài mỗi video (1-20 phút) hoặc tùy chỉnh thời gian cụ thể.</p>
        <p><strong>Tỉ lệ khung hình:</strong> 9:16 (TikTok/Shorts), 16:9 (YouTube), 1:1 (Instagram) hoặc giữ nguyên.</p>
        <p><strong>Anti-Detect:</strong> Xóa metadata, thêm nhiễu hạt, xóa khung hình tĩnh, đảo âm thanh 3D để tránh phát hiện nội dung không nguyên bản.</p>
        <p><strong>Đầu ra:</strong> Video đã xử lý được lưu vào thư mục đầu ra (mặc định hoặc tùy chỉnh).</p>
      </>
    ),
  },
  {
    title: '3. Workflow',
    content: (
      <p>
        Thiết kế luồng xử lý tự động bằng cách kéo thả các node. Các node có sẵn:
        Lấy URL → Tải xuống → AI Xử lý (ASR + LLM) → FFmpeg → Nạp Hồ sơ → Tải lên TikTok.
        Kết nối các node bằng đường kéo để tạo pipeline hoàn chỉnh.
      </p>
    ),
  },
  {
    title: '4. Quản lý hồ sơ',
    content: (
      <p>
        Xem thông tin tài khoản: Email, vai trò, trạng thái xác thực, ngày tạo.
        Mỗi tài khoản là một Browser Profile riêng biệt với Cookies và Proxy riêng.
      </p>
    ),
  },
  {
    title: '5. Proxy & Mạng',
    content: (
      <p>
        Cấu hình SOCKS5/Residential Proxy cho từng Browser Profile. Tính năng khóa WebRTC
        ngăn rò rỉ địa chỉ IP thật qua UDP/STUN. Máy chủ trung gian nội bộ (127.0.0.1:9050)
        tự động xác thực proxy cho Chromium.
      </p>
    ),
  },
  {
    title: '6. Cài đặt',
    content: (
      <p>
        Chọn giao diện Sáng/Tối/Hệ thống. Quản lý cache, cấu hình workflow mặc định,
        thiết lập proxy và trình duyệt.
      </p>
    ),
  },
];

export default function GuideView() {
  return (
    <>
      {sections.map(s => (
        <div
          key={s.title}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius)', padding: '20px 24px',
            maxWidth: 640, marginBottom: 16,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>
            {s.title}
          </h3>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {s.content}
          </div>
        </div>
      ))}
    </>
  );
}
