# 🌐 Hướng Dẫn Cấu Trúc URL & Mã Hóa Tiền Tố (Obfuscation Code Guide)

Tài liệu hướng dẫn chi tiết về Kiến trúc Định tuyến URL, Phân tách **Domain Server Host (`baseUrl`)** và **Mã Tiền Tố Mã Hóa (`obf_code` / `API_PREFIX`)** dành cho Admin & Developers trên **EIGU Platform**.

---

## 1. 📐 Kiến Trúc Định Tuyến URL (URL Routing Architecture)

Toàn bộ ứng dụng Client (Desktop Electron, Web Next.js, Mobile Flutter) và Backend API Gateway đều tuân theo công thức cấu tạo đường dẫn chuẩn hóa 3 lớp:

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 CÔNG THỨC TẠO API URL                   │
                  └─────────────────────────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
 [ 1. Domain Base Host ]  +  [ 2. Obfuscation Prefix ]  +  [ 3. API Endpoint Route ]
    (https://api.eigu.com)      (/api/eigu-v1-t24v02c03)         (/auth/login)
                                       │
                                       ▼
            👉 KẾT QUẢ: https://api.eigu.com/api/eigu-v1-t24v02c03/auth/login
```

### Chi Tiết Thành Phần:

1. **`baseUrl` (Server Base Host)**:
   - **Local Development**: `http://localhost:3001`
   - **Production Cloud**: `https://api.eigu.com`
2. **`obf_code` (Mã Obfuscation / Tiền Tố Mã Hóa `API_PREFIX`)**:
   - Mặc định: `eigu-v1-t24v02c03`
   - Tùy biến mã hóa: `v1`, `v2`, `sec-89f2`, `prod-x98f21a`
   - **Đường dẫn Server Base (`serverUrl`)**: `${baseUrl}/api/${obf_code}`
3. **`LOGIN` / Endpoints**:
   - `auth/login`, `auth/register`, `users`, `chat/history`
   - **Đường dẫn API hoàn chỉnh**: `${serverUrl}/${LOGIN}` ➔ `${baseUrl}/api/${obf_code}/auth/login`

---

## 2. 🛡️ Lợi Ích Của Mã Tiền Tố Động (`obf_code`)

- **Chống Dò Quét Tự Động (Scan Bot / Hacker Protection)**:
  Hacker dùng các công cụ tự động để dò các đường dẫn mặc định như `https://api.eigu.com/api/auth/login` sẽ nhận phản hồi **`404 Not Found`** ngay lập tức.
- **Tùy Biến Động Nhẹ Nhàng Bằng Admin UI**:
  Admin chỉ cần nhập mã `obf_code` mới (Ví dụ: `eigu-v1-x98f21a`) trong tab Cài đặt ➔ Hệ thống tự động ghép với `baseUrl` (`https://api.eigu.com`) thành `https://api.eigu.com/api/eigu-v1-x98f21a`.

---

## 3. 📌 Các Vị Trí Cấu Hình Trên Dự Án (Configuration Registry)

| Mô-Đun / Ứng Dụng | File Cấu Hình | Biến Môi Trường / Hằng Số |
| :--- | :--- | :--- |
| **1. Backend Server (`apps/api`)** | [`apps/api/.env`](file:///Users/peggy2402/Projects/eigu-platform/apps/api/.env) | `API_PREFIX=api/eigu-v1-t24v02c03`<br>`NEXT_PUBLIC_API_URL=http://localhost:3001/api/eigu-v1-t24v02c03` |
| **2. Desktop App Engine (`apps/desktop`)** | [`apps/desktop/src/main.ts`](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/src/main.ts) & [`config.js`](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/src/assets/js/config.js) | Đọc động qua IPC `sendSync('get-api-config-sync')`. Tránh hoàn toàn LocalStorage Hijacking. |
| **3. Web Dashboard (`apps/web`)** | [`apps/web/.env`](file:///Users/peggy2402/Projects/eigu-platform/apps/web/.env) | `NEXT_PUBLIC_API_URL=http://localhost:3001/api/eigu-v1-t24v02c03` |
| **4. Shared Fallback (`packages/shared`)** | [`packages/shared/src/lib/constants.ts`](file:///Users/peggy2402/Projects/eigu-platform/packages/shared/src/lib/constants.ts) | `getApiBaseUrl()` tự động kết hợp `baseUrl` + `API_PREFIX` |

---

## 🚀 4. Quy Trình Chuyển Đổi Sang Môi Trường Production Cloud

Khi triển khai ứng dụng lên server thực tế (Ví dụ domain `https://api.eigu.com`):

### Bước 1: Cập nhật `apps/api/.env` trên Server
```env
PORT=3001
API_PREFIX=api/eigu-v1-t24v02c03
NEXT_PUBLIC_API_URL=https://api.eigu.com/api/eigu-v1-t24v02c03
NEXT_PUBLIC_WS_URL=https://api.eigu.com
```

### Bước 2: Cập nhật `apps/web/.env` trên Web Cloud
```env
PORT=3000
NEXT_PUBLIC_API_URL=https://api.eigu.com/api/eigu-v1-t24v02c03
NEXT_PUBLIC_WS_URL=https://api.eigu.com
```

### Bước 3: Admin Đổi Mã `obf_code` Trong Desktop Client App
1. Đăng nhập tài khoản Admin trên Desktop App.
2. Vào **Cài đặt** ➔ Khu vực **🔒 Cấu Hình Mã Tiền Tố Động (Admin Custom Obfuscation Prefix)**.
3. Nhập mã `obf_code` mới (Ví dụ: `eigu-v1-t24v02c03`).
4. Xem trước đường dẫn server hiển thị chính xác: `https://api.eigu.com/api/eigu-v1-t24v02c03`.
5. Bấm **Lưu Mã Tiền Tố**. Hệ thống tự động cập nhật và kết nối mượt mà tới `https://api.eigu.com/api/eigu-v1-t24v02c03/auth/login`!
