# 🚀 EIGU Platform - Danh Sách Các Mô-Đun & Chức Năng Chi Tiết (Project Modules Registry)

Tài liệu quản lý, theo dõi và mô tả chi tiết toàn bộ các phân hệ, dịch vụ backend, giao diện và mô-đun chức năng trong kiến trúc **EIGU Platform** (Nx Monorepo).

---

## 1. 🏗️ Cấu Trúc Tổng Quan Ứng Dụng (Workspace Applications & Libraries)

| Tên Phân Hệ | Công Nghệ Chủ Đạo | Cổng / Môi Trường | Mô Tả Nhiệm Vụ & Quyền Hạn |
| :--- | :--- | :--- | :--- |
| **`apps/api`** | NestJS, TypeScript, Prisma, WebSockets, Swagger | `http://localhost:3001` | **Backend Gateway trung tâm**: Xử lý toàn bộ REST API, xác thực JWT, mã hóa dữ liệu, WebSocket 2 chiều, điều phối tác vụ nặng và giao tiếp Database Supabase PostgreSQL. |
| **`apps/desktop`** | Electron, Node.js, HTML5/CSS3, FFmpeg, Yt-dlp | Desktop Client (macOS & Windows) | **Ứng dụng Desktop xử lý nặng**: Xử lý cắt ghép video, lách bản quyền MD5/Anti-detect, lướt web tự động hóa (Browser Profiles), lưu trữ API Key mã hóa DPAPI/Keychain. |
| **`apps/web`** | Next.js 14 (App Router), React, WebSocket | `http://localhost:3000` | **Web Dashboard**: Bảng điều khiển từ xa theo dõi trạng thái tiến trình xử lý, quản lý báo cáo và đăng nhập trên nền tảng Web. |
| **`apps/mobile`** | Flutter, Dart | Mobile App (iOS & Android) | **Ứng dụng Di Động Native**: Theo dõi thông báo thời gian thực, giám sát tiến trình công việc từ xa và xem trạng thái máy trạm. |
| **`packages/shared`** | TypeScript Library | Cross-platform | **Thư viện dùng chung**: Chứa các DTOs, Enums, Interfaces, và hằng số tập trung (`API_ENDPOINTS`, `getApiBaseUrl()`, `getWebSocketUrl()`). |

---

## 2. ⚡ Chi Tiết Các Mô-Đun Dịch Vụ Backend Gateway (`apps/api/src`)

### 2.1. 🔐 `AuthModule` (`apps/api/src/auth/`)
Phân hệ xác thực bảo mật chuẩn Enterprise, cấp phát Token 2 lớp (Access Token + Refresh Token).

- **Các Chức Năng Chi Tiết**:
  - **Đăng ký Tài Khoản (`POST /auth/register`)**: Tạo tài khoản mới, mã hóa mật khẩu bằng `bcrypt`, tự động sinh mã OTP 6 chữ số và gửi thư xác thực qua Gmail SMTP.
  - **Xác Thực Email OTP (`POST /auth/verify-email`)**: Kiểm tra mã OTP 6 số và thời gian hết hạn (5 phút) để kích hoạt tài khoản `isVerified = true`.
  - **Gửi Lại Mã OTP (`POST /auth/resend-otp`)**: Tạo và gửi lại mã OTP mới với cơ chế giới hạn tần suất (Rate Limiting).
  - **Đăng Nhập Hệ Thống (`POST /auth/login`)**: Đăng nhập bằng Email/Username + Mật khẩu. Trả về JWT Access Token (hạn 24h) và Refresh Token (hạn 7d). Tự động ghi nhận thông tin địa chỉ IP, Hệ điều hành (OS) và Thiết bị của máy khách.
  - **Quên & Đổi Mật Khẩu (`POST /auth/forgot-password` & `/auth/reset-password`)**: Gửi token reset mật khẩu qua email và cập nhật mật khẩu mới an toàn.
  - **Làm Mới Token (`POST /auth/refresh`)**: Cấp lại Access Token mới mà không bắt người dùng phải đăng nhập lại.
  - **Đăng Xuất (`POST /auth/logout`)**: Hủy bỏ Refresh Token và xóa phiên làm việc.
  - **Lấy Thông Tin Tài Khoản (`GET /auth/me`)**: Trả về dữ liệu profile người dùng đang đăng nhập, cấp bậc Role và danh sách các Tab được phân quyền.

---

### 2.2. 👥 `UsersModule` (`apps/api/src/users/`)
Phân hệ quản lý tài khoản người dùng, phân quyền RBAC (Role-Based Access Control) và Phân quyền Tab linh hoạt.

- **Các Chức Năng Chi Tiết**:
  - **Danh Sách Người Dùng (`GET /users`)**: Trả về danh sách tài khoản thực trong DB Supabase. Hỗ trợ tìm kiếm theo Email/Username, lọc theo Vai trò (`admin`, `staff`, `user`), lọc trạng thái (`active`, `banned`) và phân trang.
  - **Thay Đổi Vai Trò Người Dùng (`PATCH /users/:id/role`)**: Admin chuyển đổi vai trò của tài khoản giữa `ADMIN`, `STAFF`, và `USER`.
  - **Khóa & Mở Khóa Tài Khoản (`PATCH /users/:id/ban`)**: Admin có quyền Ban (khóa truy cập ngay lập tức) hoặc Unban tài khoản.
  - **Quản Lý Phân Quyền Tab Nhân Viên (`GET` & `PATCH /users/:id/tab-permissions`)**: Admin chủ động bật/tắt hiển thị từng Tab chức năng riêng biệt cho từng tài khoản Staff/User (Ví dụ: Cho phép Staff A xem tab TikTok nhưng ẩn tab Facebook).

---

### 2.3. 💬 `ChatModule` (`apps/api/src/chat/`)
Phân hệ hỗ trợ khách hàng thời gian thực (Real-time Live Support) kết hợp giữa Trợ lý AI và Đội ngũ Hỗ trợ.

- **Các Chức Năng Chi Tiết**:
  - **WebSocket 2 Chiều (`ChatGateway`)**: Kết nối Socket.io giữa máy khách (User) và Trung tâm hỗ trợ (Staff/Admin).
  - **Trợ Lý AI Tự Động (`@Eigu AI`)**: Khi tin nhắn có nhắc tới `@Eigu AI`, hệ thống tự động trả lời thắc mắc của người dùng dựa trên cơ sở tri thức hệ thống.
  - **Quản Lý Phiên Chat Khách Hàng (`GET /chat/sessions`)**: Staff và Admin xem danh sách các cuộc trò chuyện đang chờ xử lý.
  - **Xem Lịch Sử Trò Chuyện (`GET /chat/history`)**: Tải lại tin nhắn cũ theo Session ID.
  - **Tính Năng Trò Chuyện Nâng Cao**: Trích dẫn phản hồi (Quote Reply), Biểu cảm Emoji Popover, Nhắc tên (`@mention`), Đánh dấu đã đọc (`mark_seen`).
  - **Dọn Rác Tự Động (`DELETE /chat/cleanup`)**: Tự động xóa sạch các tin nhắn và cuộc trò chuyện cũ hơn 24 giờ để đảm bảo hiệu năng DB.

---

### 2.4. 🔔 `NotificationsModule` (`apps/api/src/notifications/`)
Phân hệ trung tâm thông báo toàn hệ thống và phát thông báo đa điểm.

- **Các Chức Năng Chi Tiết**:
  - **Tải Thông Báo Cá Nhân (`GET /notifications`)**: Lấy danh sách thông báo riêng của từng tài khoản.
  - **Phát Thông Báo Hệ Thống (`POST /notifications`)**: Admin tạo và phát thông báo (System Broadcaster) tới toàn bộ các ứng dụng máy trạm (Desktop, Web, Mobile).
  - **Quản Lý & Đánh Dấu Đã Đọc (`PATCH /notifications/read-all` & `DELETE /notifications/:id`)**: Đánh dấu tất cả thông báo đã đọc hoặc xóa thông báo cũ.

---

### 2.5. 📩 `FeedbackModule` (`apps/api/src/feedback/`)
Phân hệ tiếp nhận ý kiến đóng góp, báo lỗi kèm hình ảnh đính kèm từ người dùng.

- **Các Chức Năng Chi Tiết**:
  - **Gửi Báo Cáo / Góp Ý (`POST /feedback/report`)**: Người dùng gửi nội dung báo lỗi kèm đính kèm file ảnh. Hệ thống tự động đẩy thông báo tức thì về **Discord Webhook** của đội ngũ phát triển.
  - **Quản Lý Feedback Dành Cho Admin/Staff (`GET` & `DELETE /feedback`)**: Bảng điều khiển xem, lọc, xem ảnh đính kèm và dọn dẹp các báo cáo phản hồi.

---

### 2.6. 🎙️ `VoiceModule` (`apps/api/src/voice/`)
Phân hệ tích hợp trí tuệ nhân tạo chuyển đổi văn bản thành giọng nói (Text-to-Speech).

- **Các Chức Năng Chi Tiết**:
  - **Danh Sách Giọng Đọc (`GET /voice/speakers`)**: Tải danh sách các giọng đọc đa ngôn ngữ từ **ElevenLabs API** và **Self-hosted OmniVoice (Python)**.
  - **Chuyển Đổi Văn Bản Thành Giọng Nói (`POST /voice/convert`)**: Xuất file âm thanh (.mp3/.wav), hỗ trợ điều chỉnh tốc độ đọc (speed), cao độ (pitch) và hiệu ứng bộ lọc âm thanh.

---

### 2.7. ⚙️ `PrismaModule` & `AppModule` Core Telemetry
- **Prisma PostgreSQL**: Quản lý các Model `User`, `Notification`, `Feedback`, `ChatMessage`, `ChatSession`, `TabPermission`.
- **Workflow WebSocket Gateway (`reportProgress`)**: Truyền tải tiến trình tự động hóa video thời gian thực từ Desktop App lên Server và Web Dashboard.
- **Global Exception Filter & Telemetry (`AllExceptionsFilter`)**: Bắt 100% lỗi 404, 500, DB crashes, tự động ghi nhận **Full Stack Trace**, Error ID, Path, IP và Timestamp ra log server.

---

## 3. 🖥️ Phân Hệ Giao Diện & Tính Năng Desktop Client (`apps/desktop`)

Hệ thống giao diện EIGU Desktop bao gồm **25+ Mô-đun Chức Năng** được sắp xếp khoa học theo từng nhóm công việc:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              EIGU DESKTOP CLIENT                                │
├───────────────────┬──────────────────────────────────┬──────────────────────────┤
│ CÁ NHÂN & TIẾP THỊ│ CÔNG CỤ VIDEO AI & TỰ ĐỘNG HÓA  │ QUẢN TRỊ & MẠNG XÃ HỘI   │
├───────────────────┼──────────────────────────────────┼──────────────────────────┤
│ 1. Hồ sơ cá nhân  │ 6. Tự động cắt video (Smart Cut) │ 13. Quản lý TikTok       │
│ 2. Tiếp thị affiliate│ 7. Sinh video AI (Prompt to Video)│ 14. Quản lý Facebook via│
│ 3. Quản lý đội nhóm│ 8. Reup lách bản quyền (Anti-MD5)│ 15. Quản lý YouTube      │
│ 4. Bộ tiện ích MMO│ 9. Phân tích ngách Hot Viral     │ 16. Quản lý X (Twitter)  │
│ 5. Hướng dẫn sử dụng│10. Tải hàng loạt no watermark   │ 17. Quản lý Instagram    │
│                   │11. Visual Workflow Builder       │ 18. Quản lý Threads      │
│                   │12. Ghi & Phát lại thao tác       │ 19. Cài đặt hệ thống     │
│                   │                                  │ 20. Báo lỗi & Telemetry  │
│                   │                                  │ 21. Quản lý User (Admin) │
│                   │                                  │ 22. Staff Chat Console   │
└───────────────────┴──────────────────────────────────┴──────────────────────────┘
```

---

### 3.1. 👤 Nhóm Mô-Đun Cá Nhân & Tiếp Thị (5 Mô-đun)

#### 1. 📌 `ho-so` (Hồ Sơ Cá Nhân)
- **Tính năng**: Hiển thị avatar, tên người dùng, email, cấp bậc vai trò (Admin / Staff / User badge). Cho phép đổi mật khẩu, cập nhật avatar và xem lịch sử đăng nhập (IP, OS, Thiết bị).

#### 2. 🤝 `tiep-thi` (Tiếp Thị Liên Kết - Affiliate)
- **Tính năng**: Quản lý mã giới thiệu riêng (Referral Code), link tiếp thị liên kết, theo dõi tổng số người đăng ký qua link và biểu đồ doanh thu hoa hồng rút về.

#### 3. 👥 `doi-nhom` (Quản Lý Đội Nhóm - Workspaces)
- **Tính năng**: Tạo nhóm làm việc chung (Team Workspace), mời thành viên qua email, phân quyền nhóm và chia sẻ tài nguyên video/kịch bản.

#### 4. 🧰 `tien-ich` (Bộ Tiện Ích Đa Năng MMO)
- **Tính năng**:
  - Check IP & độ sạch Proxy SOCKS5.
  - Bóc tách văn bản từ ảnh (OCR).
  - Tự động tạo mã QR Code tùy biến.
  - Chuyển đổi nhanh định dạng Video / Audio (.mp4, .mkv, .mp3, .wav).

#### 5. 📚 `guide` (Hướng Dẫn Sử Dụng Responsive)
- **Tính năng**: Giao diện thẻ bài Responsive Multi-column Grid hướng dẫn chi tiết từ A-Z cách sử dụng tính năng cắt ghép video, thiết kế workflow, nạp proxy và lách bản quyền.

---

### 3.2. 🎬 Nhóm Mô-Đun Công Cụ Video AI (`cong-cu` - 5 Mô-đun)

#### 6. ✂️ `cut` (Tự Động Cắt Video Smart Cut)
- **Tính năng**:
  - Nhập file `.mp4` hoặc dán link YouTube để tự động tải về bằng `yt-dlp`.
  - Chọn chế độ cắt theo thời lượng (1-20 phút) hoặc cắt theo khoảnh khắc có hội thoại (Silence Detection).
  - Tự động thay đổi tỉ lệ khung hình: `9:16` (TikTok/Shorts/Reels), `16:9` (YouTube), `1:1` (Instagram).

#### 7. 🤖 `ai-video` (Tạo Video AI Từ Kịch Bản)
- **Tính năng**: Tích hợp API Fal.ai, OpenAI Sora, Kling AI và Luma Dream Machine để sinh video ngắn 4K từ câu lệnh (Text-to-Video) hoặc từ ảnh có sẵn (Image-to-Video).

#### 8. 🛡️ `reup` (Tạo Video Reup Lách Bản Quyền Anti-Detect)
- **Tính năng**:
  - Thay đổi MD5 Hash của video.
  - Chèn nhiễu hạt (Noise Filter), lật khung hình (Horizontal Flip), thu phóng nhẹ (Dynamic Zoom).
  - Đảo dải tần âm thanh 3D, thay đổi pitch/speed để vượt qua thuật toán Content ID của TikTok, Facebook và YouTube.

#### 9. 🔥 `hot-niche` (Tìm Ngách Hot & Xu Hướng Viral)
- **Tính năng**: Phân tích danh sách từ khóa hot, xem xu hướng video viral trên TikTok/Douyin và gợi ý kịch bản ăn đề xuất.

#### 10. 📥 `bulk-download` (Tải Video Hàng Loạt KhÔNG Dính Logo)
- **Tính năng**: Tải toàn bộ video từ một Kênh/User TikTok, Douyin hoặc Playlist YouTube không dính Watermark với tốc độ cao.

---

### 3.3. 🔄 Nhóm Mô-Đun Tự Động Hóa (`tu-dong-hoa` - 2 Mô-đun)

#### 11. 🔀 `workflow` (Visual Workflow Builder Drag & Drop)
- **Tính năng**: Trình thiết kế luồng xử lý tự động hóa kéo thả trực quan. Cho phép kết nối các Node: `Lấy URL` ➔ `Tải Xuống` ➔ `AI Xử Lý (ASR + Voice)` ➔ `FFmpeg Anti-detect` ➔ `Mở Trình Duyệt` ➔ `Tải Lên TikTok`.

#### 12. 🎙️ `record` (Ghi & Phát Lại Thao Tác Trình Duyệt)
- **Tính năng**: Ghi lại các hành vi click chuột, cuộn trang, gõ phím trên trình duyệt Chromium và tự động phát lại (Macro Replay) mô phỏng hành vi người dùng thật.

---

### 3.4. 🌐 Nhóm Mô-Đun Quản Lý Tài Khoản Mạng Xã Hội (`tai-khoan` - 6 Mô-đun)

#### 13. 🎵 `tk-tiktok` (Quản Lý Tài Khoản TikTok)
- **Tính năng**: Lưu trữ danh sách tài khoản TikTok, Cookie JSON, Proxy riêng biệt. Tự động nạp profile trình duyệt và đăng video lên kênh.

#### 14. 📘 `tk-facebook` (Quản Lý Via & Fanpage Facebook)
- **Tính năng**: Quản lý nick Facebook Via/Clone, tự động lướt Newfeed tương tác nhẹ và đăng Reel lên Fanpage.

#### 15. 🔴 `tk-youtube` (Quản Lý Kênh YouTube)
- **Tính năng**: Tích hợp YouTube Data API v3 để theo dõi số lượng Subscribe, View và upload video Shorts tự động.

#### 16. 🐦 `tk-x` (Quản Lý Tài Khoản X / Twitter)
- **Tính năng**: Quản lý tài khoản X, tự động đăng bài tweet kèm hình ảnh/video và retweet.

#### 17. 📸 `tk-instagram` (Quản Lý Tài Khoản Instagram)
- **Tính năng**: Quản lý nick Instagram, đăng ảnh Carousel và đăng video Reels.

#### 18. 🧵 `tk-threads` (Quản Lý Tài Khoản Threads)
- **Tính năng**: Quản lý tài khoản Threads và lên lịch đăng bài tự động.

---

### 3.5. ⚙️ Nhóm Mô-Đun Hệ Thống & Quản Trị (7 Mô-đun)

#### 19. ⚙️ `settings` (Cài Đặt Hệ Thống & Bể Chứa API Keys Mã Hóa)
- **Tính năng**:
  - Chuyển đổi giao diện Sáng / Tối / Hệ thống.
  - **Bể chứa API Keys**: Lưu trữ Gemini API, Fal.ai, OpenAI API Keys được mã hóa bằng chip bảo mật máy tính (DPAPI trên Windows / Keychain trên macOS).
  - **🔒 Cấu hình Tiền tố API Server (Admin Only)**: Cho phép Admin thay đổi `API_PREFIX` động tại thời gian thực để chống Hacker dò quét route.

#### 20. 📊 `telemetry` (Dashboard Theo Dõi Bug & Stack Trace - Admin Only)
- **Tính năng**: Tự động bắt 100% Stack Trace lỗi JavaScript/HTTP, theo dõi độ trễ mạng và xem vết hành vi người dùng trước khi xảy ra sự cố (Session Replay Action Trail).

#### 21. 👥 `user-mgmt` (Quản Lý Người Dùng & Phân Quyền Tab Real DB - Admin Only)
- **Tính năng**: Bảng điều khiển xem danh sách user thực từ Database. Admin có quyền đổi Role, Khóa tài khoản (Ban/Unban) và Bật/Tắt hiển thị từng Tab riêng biệt cho nhân viên.

#### 22. 💬 `chat-support` (Console Hỗ Trợ Khách Hàng Dành Cho Staff & Admin)
- **Tính năng**: Giao diện chat màn hình rộng dành cho Staff/Admin trao đổi trực tiếp với khách hàng, hỗ trợ quote reply, emoji và xem danh sách các phiên chat chưa xử lý.

#### 23. 💬 `live-chat-widget` (Widget Chat Nổi Dành Cho User)
- **Tính năng**: Nút chat bong bóng tròn góc dưới màn hình cho phép người dùng mở khung chat gửi tin nhắn hỗ trợ trực tiếp.

#### 24. 🔔 `notifications-center` (Trung Tâm Thông Báo & System Broadcaster)
- **Tính năng**: Xem danh sách thông báo và công cụ dành cho Admin phát thông báo khẩn cấp tới toàn bộ ứng dụng đang chạy.

#### 25. 📜 `activity-logs` (Console Nhật Ký Hoạt Động Hệ Thống)
- **Tính năng**: Hiển thị dữ liệu log thời gian thực của FFmpeg, Yt-dlp và Node.js process.

---

## 4. 🔒 Cơ Chế Bảo Mật & Phân Quyền Hệ Thống (Security & Authorization)

1. **Phân Quyền 3 Cấp Độc Lập (RBAC)**:
   - `ADMIN`: Toàn quyền hệ thống. Quyền duy nhất được xem **Cấu hình Tiền tố API**, **Dashboard Giám sát Bug Telemetry** và **Quản lý User/Phân quyền Tab**.
   - `STAFF`: Quyền nhân viên. Được sử dụng các công cụ làm việc và hỗ trợ khách hàng trong `chat-support`. Không được xem cấu hình hệ thống Admin.
   - `USER`: Quyền người dùng thông thường. Chỉ được sử dụng các tính năng cơ bản và gửi góp ý/báo lỗi.

2. **Chống Quét Route Tự Động (API Prefix Obfuscation)**:
   - Cho phép đổi tiền tố API tùy ý (Ví dụ `/api/eigu-v1-t24v02c03`). Bất kỳ bot hacker nào gọi vào các đường dẫn mặc định `/api/auth/login` sẽ bị trả về `404 Not Found` ngay lập tức.

3. **Mã Hóa API Key Cục Bộ (Hardware Encryption)**:
   - Các API Key nhạy cảm (Gemini, OpenAI, Fal.ai) được mã hóa bằng thuật toán AES-256 mã hóa phần cứng của OS (Windows DPAPI / macOS Keychain) trước khi ghi xuống đĩa cứng.

---

## 5. 🛠️ Quy Trình Đóng Gói & Phát Hành (Packaging & Production Deploy)

- **Lệnh Khởi Chạy Development**:
  - API Gateway: `npx nx serve api`
  - Desktop App: `npx nx serve desktop`
  - Web Dashboard: `npx nx serve web`
- **Lệnh Kiểm Tra TypeScript & Build Production**:
  - Kiểm tra Type: `npx tsc --noEmit -p apps/desktop/tsconfig.app.json`
  - Build Toàn Bộ: `npx nx run-many --target=build --projects=shared,api,desktop --skip-nx-cache`
