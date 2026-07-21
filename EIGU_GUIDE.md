# Hướng Dẫn Setup & Chạy Dự Án EIGU Platform

## 1. Yêu Cầu Hệ Thống

- **Node.js** >= 22 (hiện tại đang dùng v26.0.0)
- **npm** >= 10
- **PostgreSQL** >= 15 (local hoặc cloud)

---

## 2. Cấu Trúc Thư Mục Quan Trọng

```
eigu-platform/
├── apps/
│   ├── api/              # Backend NestJS + Supabase
│   │   ├── src/
│   │   │   ├── auth/           # Module xác thực (register, login, OTP, JWT)
│   │   │   ├── supabase/       # Supabase client service
│   │   │   ├── app/            # App module gốc
│   │   │   └── main.ts         # Entry point (cổng 3001, Swagger)
│   │   └── .env                # Biến môi trường (đã gitignore)
│   └── web/              # Frontend Next.js (Auth pages)
│       └── src/
│           ├── app/auth/       # Login, Register, Forgot-password pages
│           └── lib/api.ts      # Auth API client
├── package.json          # Root dependencies
└── EIGU_GUIDE.md         # File này
```

---

## 3. Cấu Hình Database

### 3.1. Supabase Cloud (Khuyên dùng)
Bạn chỉ cần tạo dự án trên Supabase, lấy chuỗi kết nối và dán vào biến `DATABASE_URL`.

### 3.2. Cấu Hình DATABASE_URL

File `apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

---

## 4. Cài Đặt Dependencies

```bash
# Từ thư mục gốc eigu-platform/
npm install

# Nếu gặp lỗi peer dependencies, dùng:
npm install --legacy-peer-deps
```

---

## 5. Đồng Bộ Database Schema (Supabase)

Tất cả các bảng (`User`, `Proxy`, `TikTokAccount`, `VideoTask`) sẽ được khởi tạo và quản lý trực tiếp trên giao diện **SQL Editor** hoặc **Table Editor** của bảng điều khiển Supabase Dashboard.

---

## 6. Quản Lý Dữ Liệu (Supabase Dashboard)

Bạn có thể thêm/sửa/xóa dữ liệu trực quan bằng cách truy cập vào trang quản trị của Supabase:
**https://app.supabase.com/**

---

## 7. Chạy Backend (API Server)

### 7.1. Development

```bash
cd apps/api
npx nx serve api
# hoặc
npx nest start --watch
```

Server chạy tại: **http://localhost:3001/api**

Health check:
```bash
curl http://localhost:3001/api
```

### 7.2. Swagger API Docs

Mở trình duyệt: **http://localhost:3001/api/docs**

Giao diện Swagger cho phép test tất cả endpoint Auth:
- `POST /api/auth/register` — Đăng ký
- `POST /api/auth/verify-email` — Xác thực OTP
- `POST /api/auth/login` — Đăng nhập
- `POST /api/auth/forgot-password` — Quên mật khẩu
- `POST /api/auth/reset-password` — Đặt lại mật khẩu
- `POST /api/auth/refresh` — Refresh JWT token
- `GET /api/auth/me` — Lấy thông tin user (cần Bearer token)

---

## 8. Chạy Frontend (Web App)

```bash
cd apps/web
npx nx serve web
# hoặc
npx next dev
```

Frontend chạy tại: **http://localhost:3000**

Các trang auth:
- `/auth/login` — Đăng nhập
- `/auth/register` — Đăng ký (2 bước: nhập email/password → nhập OTP)
- `/auth/forgot-password` — Quên mật khẩu (3 bước: email → OTP → mật khẩu mới)

---

## 9. Tính Năng Authentication Chi Tiết

### 9.1. Luồng Đăng Ký

```
1. POST /api/auth/register { email, password }
   → Tạo user mới (isVerified = false)
   → Gửi OTP 6 số qua email (Ethereal fake SMTP)
   → Console log: OTP và preview URL email

2. POST /api/auth/verify-email { email, otp }
   → Xác thực OTP → isVerified = true
   → Trả về accessToken + refreshToken
```

### 9.2. Luồng Đăng Nhập

```
POST /api/auth/login { email, password }
→ Kiểm tra email đã verify chưa
→ Trả về { accessToken, refreshToken, user }
```

### 9.3. Luồng Quên Mật Khẩu

```
1. POST /api/auth/forgot-password { email }
   → Gửi OTP qua email

2. POST /api/auth/reset-password { email, otp, newPassword }
   → Xác thực OTP → cập nhật password mới
```

### 9.4. JWT Tokens

| Token | Thời hạn | Mục đích |
|---|---|---|
| `accessToken` | 15 phút (cấu hình trong .env) | Gọi API có bảo vệ |
| `refreshToken` | 7 ngày | Lấy accessToken mới |

### 9.5. OTP (Email)

Khi chạy local, **không cần SMTP thật**. Hệ thống tự tạo tài khoản **Ethereal** (https://ethereal.email) và in ra console:
- Mã OTP
- URL preview email (mở browser để xem nội dung email)

Nếu muốn dùng SMTP thật, điền vào `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

## 10. Các Biến Môi Trường (apps/api/.env)

```env
# Database (bắt buộc)
DATABASE_URL="postgres://postgres:postgres@localhost:5432/eigu_platform?sslmode=disable"

# JWT (bắt buộc)
JWT_SECRET=DcQhbt2co3Xqgz1uxC9jxkSNXCL02DuQ4Dgn34XwuJi
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# SMTP (tùy chọn - bỏ trống sẽ dùng Ethereal)
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASS=
```

---

## 11. (Bỏ trống)

---

## 12. Xử Lý Lỗi Thường Gặp

### Lỗi `Cannot find module 'dotenv/config'`
```bash
npm install dotenv --save-dev --legacy-peer-deps
```

### Lỗi `'prisma' is not recognized`
```bash
npm install prisma --save-dev --legacy-peer-deps
```

### Lỗi kết nối database
- Kiểm tra PostgreSQL đã chạy: `brew services list | grep postgres`
- Kiểm tra DATABASE_URL trong `.env`
- Kiểm tra database tồn tại: `psql -l`

### Lỗi port 3001 đã được sử dụng
```bash
# Đổi port:
PORT=3002 npx nx serve api
# hoặc kill process đang dùng:
lsof -i :3001 | grep LISTEN
kill -9 <PID>
```

### Lỗi `npm ci` sandbox (chokidar/readdirp)
```bash
npm install chokidar@4.0.3 --save-dev --legacy-peer-deps
git add package-lock.json
git commit -m "fix lockfile"
git push
```

---

## 13. Kiến Trúc Tổng Quan

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  Next.js    │────▶│  NestJS API  │────▶│ PostgreSQL │
│  (port 3000)│     │  (port 3001) │     │ (5432)     │
│             │     │              │     │            │
│ Auth Pages  │     │ Auth Module  │     │ 4 tables   │
│ Login       │     │ JWT Strategy │     │ User       │
│ Register    │     │ Supabase Svc │     │ Proxy      │
│ Forgot Pwd  │     │ Swagger Docs │     │ TikTokAcc  │
└─────────────┘     └──────────────┘     │ VideoTask  │
                                          └────────────┘
```
