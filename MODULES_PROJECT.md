# EIGU Platform - Danh Sách Các Mô-Đun Dự Án (Project Modules Registry)

Tài liệu quản lý và theo dõi toàn bộ các phân hệ, mô-đun chức năng trong dự án **EIGU Platform** (Nx Monorepo).

---

## 1. 🏗️ Cấu Trúc Ứng Dụng (Workspace Applications & Libraries)
- `apps/api` (NestJS): Backend Gateway trung tâm (Cổng 3001), xử lý REST API, Swagger và WebSockets Real-time.
- `apps/desktop` (Electron + Node.js): Desktop App xử lý nặng (FFmpeg video, lách MD5, Puppeteer lướt web anti-detect).
- `apps/web` (Next.js): Dashboard giám sát theo dõi tiến trình thời gian thực (Cổng 3000).
- `apps/mobile` (Flutter Native): App điện thoại theo dõi trạng thái hệ thống từ xa (Live Telemetry).
- `packages/shared`: Thư viện chứa các DTOs, Interfaces & Enums dùng chung cho ứng dụng.

---

## 2. ⚡ Backend Services & API Modules (`apps/api/src`)
1. **`AuthModule` (`auth/`)**: Xác thực tài khoản (Đăng ký, Đăng nhập, OTP, JWT, Quên mật khẩu).
2. **`UsersModule` (`users/`)**: Quản lý người dùng, phân quyền (Admin / Staff / User), Ban / Unban tài khoản.
3. **`ChatModule` (`chat/`)**: Hỗ trợ trực tuyến thời gian thực WebSocket 2 chiều (User ↔ Staff ↔ AI) & Tự động xóa tin nhắn sau 24h.
4. **`NotificationsModule` (`notifications/`)**: Hệ thống chuông thông báo toàn cục và Push Notification.
5. **`FeedbackModule` (`feedback/`)**: Tiếp nhận Góp ý / Báo lỗi gửi thẳng về Discord Webhook.
6. **`VoiceModule` (`voice/`)**: Quản lý giọng nói AI (ElevenLabs, Omni Voice) & xử lý cao độ FFmpeg.
7. **`PrismaModule` (`prisma/`)**: Quản lý kết nối cơ sở dữ liệu Supabase PostgreSQL.
8. **`AppModule` (`app/`)**: Mô-đun gốc điều phối hệ thống & WebSocket Workflow Gateway.

---

## 3. 🖥️ Phân Hệ Giao Diện & Tính Năng (UI Views & Feature Modules)

### A. Nhóm Cá Nhân & Tiếp Thị (5 mô-đun)
1. **`ho-so`**: Hồ sơ cá nhân, đổi avatar, đổi mật khẩu và xem lịch sử đăng nhập.
2. **`tiep-thi`**: Tiếp thị liên kết (Affiliate), mã giới thiệu & theo dõi doanh thu hoa hồng.
3. **`doi-nhom`**: Quản lý Đội nhóm (Team Workspaces), phân quyền thành viên.
4. **`tien-ich`**: Bộ tiện ích (Check IP Proxy, Convert định dạng, bóc tách OCR, tạo QR code).
5. **`guide`**: Tài liệu Hướng dẫn sử dụng toàn tập từ A-Z.

### B. Nhóm Công Cụ Video AI (`cong-cu` - 5 mô-đun)
6. **`cut`**: Tự động cắt Video (Smart Cut), lách Cloudflare & xuất các phân đoạn.
7. **`ai-video`**: Tạo Video AI (Sora, Veo, Kling, Luma) từ kịch bản/Prompt.
8. **`reup`**: Tạo Video Reup lách bản quyền (MD5 Hash, Filter, Speed, Zoom).
9. **`hot-niche`**: Tìm ngách Hot & phân tích xu hướng nội dung viral.
10. **`bulk-download`**: Tải video hàng loạt từ TikTok/Douyin/YouTube không dính watermark.

### C. Nhóm Tự Động Hóa (`tu-dong-hoa` - 2 mô-đun)
11. **`workflow`**: Trình xây dựng luồng tự động hóa kéo thả (Workflow Builder).
12. **`record`**: Ghi thao tác chuột/bàn phím & phát lại tự động mô phỏng người thật.

### D. Nhóm Quản Lý Tài Khoản Mạng Xã Hội (`tai-khoan` - 6 mô-đun)
13. **`tk-tiktok`**: Quản lý tài khoản, cookie JSON & Proxy riêng biệt cho TikTok.
14. **`tk-facebook`**: Quản lý via Facebook & tự động tương tác nguồn cấp.
15. **`tk-youtube`**: Quản lý kênh YouTube & tích hợp YouTube Data API v3.
16. **`tk-x`**: Quản lý tài khoản X (Twitter) & tự động đăng bài/retweet.
17. **`tk-instagram`**: Quản lý tài khoản Instagram & đăng Story/Reel.
18. **`tk-threads`**: Quản lý tài khoản Threads & lên lịch bài viết.

### E. Nhóm Hệ Thống & Quản Trị (7 mô-đun)
19. **`settings`**: Cài đặt & Bể chứa API Keys mã hóa (Gemini API, Fal.ai...).
20. **`feedback`**: Gửi phản hồi / Báo lỗi hệ thống kèm ảnh đính kèm.
21. **`user-mgmt`**: Bảng điều khiển Quản lý Người dùng dành cho Admin.
22. **`chat-support`**: Console hỗ trợ khách hàng dành cho Staff/Admin.
23. **`live-chat-widget`**: Widget hỗ trợ trực tiếp thời gian thực cho User.
24. **`notifications-center`**: Trung tâm quản lý thông báo hệ thống.
25. **`activity-logs`**: Console nhật ký hoạt động hệ thống (FFmpeg/Node logs).
