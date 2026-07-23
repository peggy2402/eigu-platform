# Đặc Tả Kiến Trúc Hệ Thống: EIGU Platform
**Chủ đề:** Tự Động Hóa MMO Định Tuyến TikTok Châu Âu & Hạ Tầng Đa Nền Tảng (Nx Monorepo)

> **LƯU Ý DÀNH CHO AI ASSISTANT:** Đây là tài liệu thiết kế hệ thống chuyên sâu (System Architecture Specification) của nền tảng EIGU. Hãy tham chiếu tài liệu này để hiểu rõ về các quyết định kiến trúc, luồng dữ liệu, danh mục API và các rào cản kỹ thuật trước khi đề xuất bất kỳ giải pháp lập trình nào.

---

## 1. Bối Cảnh Và Thách Thức (Context)
Sự bùng nổ của các nền tảng video ngắn (đặc biệt là TikTok) tạo ra cơ hội lớn tại các thị trường có RPM (Revenue Per Mille) cao như Châu Âu (Đức, Pháp, Anh, Séc) và Mỹ. Tuy nhiên, quy trình MMO thủ công hiện tại (tải video YouTube -> cắt bằng CapCut -> chuyển qua iPhone cũ -> upload thủ công) không thể mở rộng và tốn quá nhiều nguồn lực.

**Rủi ro kỹ thuật từ TikTok:**
- Chính sách **Tính toàn vẹn và Xác thực** cấm giả mạo vị trí.
- Thuật toán quét **Nội dung không nguyên bản (Unoriginal Content)** liên tục phân tích file hash và dấu vân tay âm thanh.
- Rò rỉ IP thực, VPN sai lệch, hoặc Browser Fingerprint không khớp sẽ dẫn đến đình chỉ tài khoản hàng loạt.

**Giải pháp:** **EIGU Platform** - Hệ sinh thái tự động hóa toàn diện đảm bảo định tuyến 100% IP Châu Âu, tích hợp AI lách thuật toán kiểm duyệt an toàn và bền vững.

---

## 2. Kiến Trúc Tổng Thể (Monorepo Workspace)
Dự án được hợp nhất dưới sự quản lý của **Nx Workspace** thay vì polyrepo. Điều này giúp hỗ trợ đa ngôn ngữ (TypeScript, Dart/C++) và tận dụng cơ chế chia sẻ cấu trúc dữ liệu, Remote Caching, và Dependency Graph.

### Cấu Trúc Phân Bổ:
| Tên Ứng Dụng / Gói | Công Nghệ Nền Tảng | Vai Trò Và Chức Năng Cốt Lõi |
| :--- | :--- | :--- |
| `apps/api` | NestJS (TypeScript) | Lõi máy chủ trung tâm (Cổng 3001). Quản lý 30 REST API, 2 WebSocket Gateways, xử lý JWT, lập lịch Cron Jobs & Prisma 7 Supabase. |
| `apps/web` | Next.js (TypeScript) | Dashboard đám mây (Cổng 3000). Cung cấp giao diện React Flow để thiết kế workflow, theo dõi log, quản lý cấu hình. |
| `apps/desktop` | Electron (TypeScript)| Máy khách cục bộ thực thi tác vụ nặng. Chạy Chromium Anti-detect, FFmpeg song song SSD, yt-dlp anti-bot, chèn Logo 9 vị trí. |
| `apps/mobile` | Flutter (Dart/C++) | Ứng dụng iOS/Android theo dõi tiến trình từ xa, nhận Push Notifications khi workflow hoàn tất hoặc lỗi. |
| `packages/shared`| TypeScript / C++ | Thư viện dùng chung chứa Interfaces, DTOs, JSON Schema của workflow, đảm bảo tính nhất quán. |

---

## 3. Danh Mục Hạ Tầng Giao Tiếp (30 REST API Endpoints & 2 WebSocket Namespaces)

Hệ thống cung cấp **30 REST API Endpoints** chuẩn Swagger (tại `/api/docs`) và **2 Kênh WebSocket Full-duplex**:

### 🔐 1. Module Auth (`/api/auth`) - 9 Endpoints
- `POST /api/auth/register`: Đăng ký tài khoản (Cấp OTP 6 số).
- `POST /api/auth/verify-email`: Xác thực tài khoản với OTP.
- `POST /api/auth/resend-otp`: Gửi lại mã OTP.
- `POST /api/auth/login`: Đăng nhập bằng Email/Password (Trả JWT Access & Refresh Token).
- `POST /api/auth/forgot-password`: Yêu cầu OTP quên mật khẩu.
- `POST /api/auth/reset-password`: Đặt lại mật khẩu mới.
- `POST /api/auth/refresh`: Làm mới JWT Access Token.
- `POST /api/auth/logout`: Đăng xuất và vô hiệu hóa token.
- `GET /api/auth/me`: Lấy profile tài khoản hiện tại.

### 👥 2. Module Users & Phân Quyền (`/api/users`) - 7 Endpoints
- `GET /api/users`: Truy vấn danh sách người dùng (Search, Filter Role, Pagination).
- `PATCH /api/users/:id/role`: Cập nhật quyền (Admin, Staff, User).
- `PATCH /api/users/:id/ban`: Khóa/Mở khóa tài khoản (Ban vĩnh viễn / tạm thời + lý do).
- `GET /api/users/:id/tab-permissions`: Lấy quyền hiển thị các Tab.
- `PATCH /api/users/:id/tab-permissions`: Phân quyền ẩn/hiện từng Tab.
- `GET /api/users/:id/tabs`: Lấy chuỗi Allowed Tabs.
- `PATCH /api/users/:id/tabs`: Cập nhật chuỗi Allowed Tabs.

### 💬 3. Module Support Chat (`/api/chat` & `/chat`) - 3 Endpoints + 1 WebSocket
- `GET /api/chat/history`: Lấy lịch sử cuộc trò chuyện theo Email.
- `GET /api/chat/sessions`: Lấy danh sách các phiên chat cho Staff Console.
- `DELETE /api/chat/cleanup`: Tự động xóa tin nhắn cũ hơn 24h (Auto TTL Cleanup).
- `WebSocket /chat`: Kênh WebSocket giao tiếp thời gian thực 2 chiều (`chat:join`, `chat:send_message`, `chat:mark_seen`, `chat:message_received`, `chat:status_updated`, `chat:sessions_updated`).

### 🔔 4. Module Notifications (`/api/notifications`) - 5 Endpoints
- `GET /api/notifications`: Lấy danh sách thông báo hệ thống.
- `POST /api/notifications`: Tạo thông báo mới (Admin).
- `PUT /api/notifications/:id`: Cập nhật nội dung thông báo.
- `DELETE /api/notifications/:id`: Xóa thông báo.
- `PATCH /api/notifications/read-all`: Đánh dấu đã đọc tất cả thông báo.

### 💬 5. Module Feedback (`/api/feedback`) - 3 Endpoints
- `POST /api/feedback/report`: Gửi báo lỗi/góp ý kèm ảnh đính kèm tới Discord Webhook (Giới hạn 3 lượt/ngày).
- `GET /api/feedback`: Lấy danh sách phản hồi cho Admin/Staff.
- `DELETE /api/feedback/:id`: Xóa phản hồi.

### 🎙️ 6. Module Voice AI (`/api/voice`) - 2 Endpoints
- `GET /api/voice/speakers`: Lấy danh sách giọng đọc AI (ElevenLabs, OmniVoice, Self-hosted).
- `POST /api/voice/convert`: Chuyển đổi giọng đọc từ file audio.

### ⚙️ 7. System & Workflow Gateway - 1 Endpoint + 1 WebSocket
- `GET /api`: Health Check Endpoint kiểm tra hệ thống.
- `WebSocket /workflow`: Cổng điều phối luồng xử lý tự động hóa (YouTube Download, FFmpeg Progress %, Status updates).

---

## 4. Hệ Thống Giao Tiếp Thời Gian Thực (Real-Time Architecture)
Hệ thống kết hợp **WebSocket (Socket.IO)** và **WebRTC**:
- **WebSocket (Socket.IO):** NestJS API (`@WebSocketGateway()`) điều phối 2 cổng `/workflow` (tiến trình cắt ghép video) và `/chat` (tin nhắn hỗ trợ 2 chiều User ↔ Staff ↔ AI).
- **WebRTC:** Dùng cho giám sát màn hình Headless Browser độ trễ cực thấp (P2P). NestJS làm Signaling Server (trao đổi SDP/ICE candidates), luồng video truyền trực tiếp từ Desktop lên Web.

---

## 5. Phá Hủy Dấu Vân Tay Kỹ Thuật Số Bằng FFmpeg & Logo Overlay
EIGU dùng bộ lọc FFmpeg phức tạp để tạo ra thực thể nhị phân mới hoàn toàn:

| Kỹ Thuật Biến Đổi | Tham Số / Bộ Lọc | Cơ Chế Đánh Lừa TikTok |
| :--- | :--- | :--- |
| **Chèn Logo / Watermark 9 Vị Trí** | `movie='logo.png',scale=iw*ratio:-1,format=rgba,colorchannelmixer=aa=opacity[logo]; [in][logo]overlay=x:y` | Ghi đè nhãn thương hiệu độc quyền lên 9 vị trí (Top-Left ➔ Bottom-Right), chống reup trái phép. |
| **Vi Chỉnh Màu Sắc (EQ Sliders)** | `-vf "eq=brightness=...:contrast=...:saturation=..."` | Thay đổi giá trị Hex của hàng triệu Pixel, phá hủy bộ lọc Perceptual Hash trùng lặp. |
| **Loại Bỏ Khung Hình Trùng Lặp (Decimation)** | `-vf mpdecimate,setpts=N/FRAME_RATE/TB` | Xóa khung hình tĩnh, tái cấu trúc timestamps. Phá hủy chữ ký Perceptual Hash. |
| **Chuyển Đổi Không Gian Âm Thanh (Spatial Panning)** | `-af "pan=stereo\|c0<c0+0*c1"` | Đảo kênh, trộn âm thanh không gian để vượt qua quét phổ âm (audio fingerprint). |
| **Xóa Bỏ Dấu Vết Siêu Dữ Liệu (Metadata Stripping)** | `-map_metadata -1 -metadata title="" ...` | Dọn sạch thẻ ID3, EXIF, phần mềm biên tập, tạo tệp MP4 "sạch" tuyệt đối. |

---

## 6. Trình Duyệt Chống Phát Hiện & Quản Lý Hồ Sơ (Anti-Detect Browser)
- **Engine-Level Spoofing:** EIGU phân phối bản Fork Chromium tùy chỉnh (C++). Mọi lệnh gọi API định tuyến Canvas, WebGL, Audio, GPU, Fonts, HardwareConcurrency đều trả về giá trị giả mạo cấp lõi (Coherence Matching).
- **Profile Isolation:** Quản lý `user-data-dir` cục bộ cho mỗi tài khoản. Nạp lại nguyên vẹn Cookies, Cache, IndexedDB.

---

## 7. Đảm Bảo Định Tuyến Mạng & Chống Rò Rỉ WebRTC Tuyệt Đối
- **Khóa WebRTC (WebRTC IP Handling Policy):** Chromium tùy chỉnh bật cờ `media.peerconnection.ice.default_address_only` và buộc chính sách định tuyến `Disable non-proxied UDP`. UDP bị ép qua Proxy, chặn rò rỉ 100%.
- **Local Helper Proxy (Cầu Nối Nội Bộ):** Desktop App tích hợp máy chủ trung gian (127.0.0.1:9050). Puppeteer kết nối không mật khẩu, Helper Proxy sẽ gắn xác thực, mã hóa và điều hướng gói tin SOCKS5 ra mạng Châu Âu.

---

## 8. Quản Lý Dữ Liệu & Tự Động Xóa Cũ (Supabase TTL Auto-Cleanup)
- **Prisma 7 + Supabase PostgreSQL**: Quản lý schema tập trung tại `schema.prisma` và `prisma.config.ts`.
- **Tự Động Xóa Tin Nhắn Cũ 24h (TTL Cleanup)**: `ChatService` tự động chạy Cron job mỗi 1 giờ xóa các bản ghi tin nhắn chat có `createdAt < 24h`, giữ cho dung lượng cơ sở dữ liệu Supabase luôn ở mức tối thiểu và tốc độ truy vấn luôn nhanh nhất.

---

## 9. Kết Luận
Nền tảng EIGU tái cấu trúc toàn diện quy trình MMO TikTok. Sự kết hợp giữa Nx Monorepo, 32 Cổng giao tiếp API/WebSocket, AI LLM/ASR, biến đổi FFmpeg hạ tầng nhị phân và C++ Custom Chromium tạo ra một danh tính số Châu Âu 100% nguyên bản, mang lại lợi thế mở rộng không giới hạn.
