# Hướng Dẫn Setup & Chạy Dự Án EIGU Platform (Master Guide)

> **Tài liệu hướng dẫn phát triển và vận hành toàn diện hệ thống EIGU Platform (Nx Monorepo)**

---

## 1. Yêu Cầu Hệ Thống (System Requirements)

- **Node.js** >= 22 (Khuyên dùng v26.0.0+)
- **npm** >= 10
- **PostgreSQL** >= 15 (Supabase Cloud PostgreSQL hoặc Local)
- **FFmpeg & yt-dlp** (Tự động nạp qua Node.js binaries trong `@ffmpeg-installer` và `youtube-dl-exec`)
- **Flutter SDK** >= 3.22 (Dành cho việc build `apps/mobile`)

---

## 2. Cấu Trúc Dự Án (Nx Monorepo Architecture)

```
eigu-platform/
├── apps/
│   ├── api/                  # Backend API Server (NestJS + Prisma 7 + Supabase + Swagger)
│   │   ├── src/
│   │   │   ├── auth/         # Module xác thực (Register, Login, OTP, JWT, Refresh Token)
│   │   │   ├── users/        # Module quản lý người dùng, phân quyền Admin/Staff, Ban/Unban
│   │   │   ├── chat/         # Module WebSocket Chat Support 2 chiều & Tự động xóa tin nhắn 24h
│   │   │   ├── notifications/# Module quản lý thông báo hệ thống
│   │   │   ├── feedback/     # Module gửi báo lỗi / góp ý qua Discord Webhook
│   │   │   ├── voice/        # Module quản lý giọng nói AI (ElevenLabs, OmniVoice)
│   │   │   ├── prisma/       # Service kết nối cơ sở dữ liệu Supabase
│   │   │   ├── app/          # Core Module & Workflow Gateway WebSocket
│   │   │   └── main.ts       # Entry point (Cổng 3001, Swagger tại /api/docs)
│   │   ├── prisma/           # Schema Prisma (schema.prisma)
│   │   └── prisma.config.ts  # Cấu hình Prisma 7 kết nối Supabase
│   ├── desktop/              # Electron Engine xử lý nặng (FFmpeg, yt-dlp, Anti-detect Browser)
│   │   └── src/
│   │       ├── assets/       # Giao diện UI (HTML/CSS/JS native, SVG Icons, Range Sliders)
│   │       ├── ffmpeg-processor.ts # Lõi cắt ghép song song SSD, lách MD5 & chèn Logo 9 vị trí
│   │       ├── youtube-downloader.ts # Tải video YouTube thực bằng yt-dlp (anti-bot)
│   │       └── main.ts       # Main Process điều phối IPC và cửa sổ Electron
│   ├── web/                  # Next.js Web Dashboard giám sát luồng công việc (Cổng 3000)
│   └── mobile/               # Flutter Cross-Platform Telemetry Mobile App
├── packages/
│   └── shared/               # Shared TypeScript DTOs, Types & Interfaces
├── AI_CONTEXT.md             # Quy chuẩn lập trình & tri thức dành cho AI Assistant
├── MODULES_PROJECT.md        # Danh sách mô-đun chi tiết của dự án
└── EIGU_ARCHITECTURE_SPEC.md # Đặc tả kiến trúc kỹ thuật hệ thống
```

---

## 3. Cấu Hình Cơ Sở Dữ Liệu (Supabase PostgreSQL + Prisma 7)

### 3.1. Biến Môi Trường (`apps/api/.env`)

Tạo file `apps/api/.env` với nội dung cấu hình chuẩn:

```env
PORT=3001
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# JWT Secrets
JWT_SECRET="eigu_super_secret_jwt_key_2026"
JWT_REFRESH_SECRET="eigu_super_secret_refresh_key_2026"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# SMTP (Email OTP) - Mặc định tự dùng Ethereal Fake SMTP khi test local
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 3.2. Cấu Hình Prisma 7 (`apps/api/prisma.config.ts`)

Prisma 7 quản lý kết nối cơ sở dữ liệu tập trung tại `prisma.config.ts`:

```typescript
import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres',
  },
});
```

### 3.3. Đồng Bộ Cơ Sở Dữ Liệu Lên Supabase

Chạy lệnh đồng bộ Schema Prisma với Supabase PostgreSQL:

```bash
npx dotenv -e apps/api/.env -- npx prisma db push --config apps/api/prisma.config.ts
npx prisma generate --schema=apps/api/prisma/schema.prisma
```

---

## 4. Cài Đặt Dependencies & Khởi Động Ứng Dụng

### 4.1. Cài Đặt Thư viện

```bash
# Từ thư mục gốc eigu-platform/
npm install

# Nếu gặp lỗi xung đột peer dependencies:
npm install --legacy-peer-deps
```

### 4.2. Khởi Động Backend API (NestJS - Cổng 3001)

```bash
npx nx serve api
```

API Server chạy tại: **http://localhost:3001/api**  
Trang tài liệu Swagger: **http://localhost:3001/api/docs**

### 4.3. Khởi Động Desktop Engine (Electron)

```bash
npx nx serve desktop
```

Desktop App sẽ hiển thị màn hình ứng dụng hỗ trợ kéo thả Video, cắt lách MD5, chèn Logo 9 vị trí và Chat Support real-time.

### 4.4. Khởi Động Web Dashboard (Next.js - Cổng 3000)

```bash
npx nx dev web
```

Dashboard chạy tại: **http://localhost:3000**

---

## 5. Danh Sách Chi Tiết 30 REST API Endpoints & 2 WebSockets

Tài liệu Swagger tự động tại `http://localhost:3001/api/docs` cung cấp danh sách đầy đủ **30 REST API Endpoints** và **2 Cổng WebSocket**:

### 🔐 Auth Module (`/api/auth`) - 9 Endpoints
1. `POST /api/auth/register`: Đăng ký tài khoản (Tạo OTP 6 số).
2. `POST /api/auth/verify-email`: Xác thực tài khoản với OTP.
3. `POST /api/auth/resend-otp`: Gửi lại mã OTP xác thực.
4. `POST /api/auth/login`: Đăng nhập bằng Email/Password (Cấp JWT Token).
5. `POST /api/auth/forgot-password`: Yêu cầu mã OTP quên mật khẩu.
6. `POST /api/auth/reset-password`: Đặt lại mật khẩu bằng OTP.
7. `POST /api/auth/refresh`: Làm mới JWT Access Token (`accessToken`).
8. `POST /api/auth/logout`: Đăng xuất và vô hiệu hóa RefreshToken.
9. `GET /api/auth/me`: Lấy thông tin tài khoản hiện tại kèm IP/Thiết bị.

### 👥 Users Module (`/api/users`) - 7 Endpoints
10. `GET /api/users`: Danh sách tài khoản (Tìm kiếm, phân loại Role, sắp xếp).
11. `PATCH /api/users/:id/role`: Cập nhật quyền (Admin, Staff, User).
12. `PATCH /api/users/:id/ban`: Khóa/Mở khóa tài khoản (Ban vĩnh viễn hoặc tạm thời + Lý do).
13. `GET /api/users/:id/tab-permissions`: Lấy danh sách quyền hiển thị các Tab.
14. `PATCH /api/users/:id/tab-permissions`: Cập nhật phân quyền ẩn/hiện Tab.
15. `GET /api/users/:id/tabs`: Lấy chuỗi cấu hình Allowed Tabs.
16. `PATCH /api/users/:id/tabs`: Cập nhật chuỗi cấu hình Allowed Tabs.

### 💬 Support Chat Module (`/api/chat` & `/chat`) - 3 Endpoints + 1 WebSocket
17. `GET /api/chat/history`: Lấy lịch sử nhắn tin theo `userEmail`.
18. `GET /api/chat/sessions`: Lấy danh sách các phiên chat cho Staff Console.
19. `DELETE /api/chat/cleanup`: Tự động xóa các tin nhắn cũ hơn 24 giờ (Auto TTL Cleanup).
20. `WebSocket /chat`: Kênh WebSocket giao tiếp thời gian thực 2 chiều (`chat:join`, `chat:send_message`, `chat:mark_seen`, `chat:message_received`, `chat:status_updated`, `chat:sessions_updated`).

### 🔔 Notifications Module (`/api/notifications`) - 5 Endpoints
21. `GET /api/notifications`: Lấy danh sách thông báo hệ thống.
22. `POST /api/notifications`: Tạo thông báo hệ thống mới (Admin).
23. `PUT /api/notifications/:id`: Cập nhật thông báo.
24. `DELETE /api/notifications/:id`: Xóa thông báo.
25. `PATCH /api/notifications/read-all`: Đánh dấu đã đọc tất cả thông báo.

### 💬 Feedback Module (`/api/feedback`) - 3 Endpoints
26. `POST /api/feedback/report`: Gửi báo lỗi/góp ý kèm ảnh lên Discord Webhook (Giới hạn 3 lần/ngày).
27. `GET /api/feedback`: Lấy danh sách góp ý dành cho Admin/Staff.
28. `DELETE /api/feedback/:id`: Xóa góp ý.

### 🎙️ Voice AI Module (`/api/voice`) - 2 Endpoints
29. `GET /api/voice/speakers`: Lấy danh sách giọng đọc AI (ElevenLabs, OmniVoice, Self-hosted).
30. `POST /api/voice/convert`: Chuyển đổi giọng đọc từ file audio.

### ⚙️ System & Workflow Gateway - 1 Endpoint + 1 WebSocket
31. `GET /api`: Health Check Endpoint kiểm tra hệ thống.
32. `WebSocket /workflow`: Cổng điều phối luồng xử lý tự động hóa (YouTube Download, FFmpeg Progress %, Status updates).

---

## 6. Các Tính Năng Nổi Bật Trên Desktop Engine

1. **Thư Mục Xuất Tự Động & Mở 1-Click**:
   - Tự động tạo cây thư mục `Downloads/eigu/outputs` trên mọi máy khách (macOS & Windows).
   - Bấm vào đường dẫn lưu trên UI để mở thẳng cửa sổ Finder (macOS) hoặc File Explorer (Windows).
2. **Chỉnh Sửa Nâng Cao (Advanced Edit UI)**:
   - Sử dụng **Range Sliders** mượt mà cho Độ sáng, Tương phản, Độ bão hòa, Cao độ âm thanh.
   - **Xem trước thời gian thực (Live Video Preview Engine)** áp dụng CSS Filter trực tiếp lên hình xem trước.
3. **Chèn Logo / Watermark 9 Vị Trí**:
   - Bộ chọn 9 ô vị trí (3x3 Grid), thanh kéo kích thước % và độ mờ opacity.
   - Tích hợp bộ lọc FFmpeg `movie` đốt logo sắc nét trực tiếp lên video khi transcode.
4. **Trạm Hỗ Trợ Real-Time Chat (User ↔ Staff ↔ AI)**:
   - Truyền tin nhắn tức thì qua WebSocket, tự động xóa tin nhắn cũ sau 24 giờ bảo vệ bộ nhớ Supabase.
