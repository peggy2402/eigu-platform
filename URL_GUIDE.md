# Hướng Dẫn Cấu Hình & Thay Đổi Địa Chỉ URL (API / Web / Mobile / Desktop)

Tài liệu hướng dẫn chi tiết các vị trí cần thay đổi địa chỉ URL khi chuyển đổi môi trường từ **Local Development (`http://localhost:3001`)** sang **Production Cloud (`https://api.yourdomain.com`)**, bao gồm kỹ thuật **Bảo mật Obfuscated Custom API Prefix (Phiên bản hóa & Mã hóa tiền tố API)**.

---

## 📌 Tóm Tắt Nhanh Các Vị Trí Cần Thay Đổi

| Ứng Dụng / Mô-Đun | Vị Trí File Cần Sửa | Biến / Dòng Cần Thay Đổi |
| :--- | :--- | :--- |
| **1. Desktop App (`apps/desktop`)** | [`apps/desktop/src/assets/js/config.js`](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/src/assets/js/config.js) | `DEFAULT_API_BASE_URL` & `DEFAULT_WEBSOCKET_URL` |
| **2. Backend API Server (`apps/api`)** | [`apps/api/.env`](file:///Users/peggy2402/Projects/eigu-platform/apps/api/.env) | `API_PREFIX`, `NEXT_PUBLIC_API_URL` & `NEXT_PUBLIC_WS_URL` |
| **3. Web Dashboard (`apps/web`)** | [`apps/web/.env`](file:///Users/peggy2402/Projects/eigu-platform/apps/web/.env) | `NEXT_PUBLIC_API_URL` & `NEXT_PUBLIC_WS_URL` |
| **4. Shared Fallback (`packages/shared`)** | [`packages/shared/src/lib/constants.ts`](file:///Users/peggy2402/Projects/eigu-platform/packages/shared/src/lib/constants.ts) | `DEFAULT_API_BASE_URL` & `DEFAULT_WEBSOCKET_URL` |

---

## 🔒 Kỹ Thuật Custom API Prefix & Obfuscation (Chống Scan API / Hacking)

Để tránh bị Hacker dò quét (Scan Route Bot) hoặc các công cụ tự động phát hiện API endpoints mặc định (`/api/auth/login`), hệ thống EIGU Platform cho phép **Tùy biến tiền tố API tùy ý** thông qua biến `API_PREFIX` trong file [`apps/api/.env`](file:///Users/peggy2402/Projects/eigu-platform/apps/api/.env):

### Ví Dụ 1: Đổi sang phiên bản Versioning (`api/v1` hoặc `api/v2`)
Trong file `apps/api/.env`:
```env
API_PREFIX=api/v1
```
➔ Đường dẫn API mặc định trở thành: `https://api.yourdomain.com/api/v1/auth/login`  
➔ Trang tài liệu Swagger tự động đổi thành: `https://api.yourdomain.com/api/v1/docs`

### Ví Dụ 2: Đổi sang Chuỗi Mã Hóa Bảo Mật / Secret Obfuscated Hash (`api/eigu-v1-x98f21a`)
Trong file `apps/api/.env`:
```env
API_PREFIX=api/eigu-v1-x98f21a
```
➔ Đường dẫn API trở thành: `https://api.yourdomain.com/api/eigu-v1-x98f21a/auth/login`  
➔ **Lợi ích**: Hacker thử gọi `/api/auth/login` sẽ bị trả về `404 Not Found` ngay lập tức!

---

## 🛠️ Chi Tiết Cấu Hình Theo Từng Ứng Dụng

### 1. Desktop Engine (`apps/desktop`)

- **File cấu hình tập trung**: [`apps/desktop/src/assets/js/config.js`](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/src/assets/js/config.js)
- **Nội dung sửa**:

```javascript
// Thay đổi 'http://localhost:3001' thành URL Production của bạn (Kèm API_PREFIX mới):
const DEFAULT_API_BASE_URL = localStorage.getItem('eigu_api_url') || 'https://api.yourdomain.com/api/eigu-v1-x98f21a';
const DEFAULT_WEBSOCKET_URL = localStorage.getItem('eigu_ws_url') || 'https://api.yourdomain.com';
```

> 💡 **Đổi động không cần build lại App**: Người dùng hoặc Admin có thể đổi trực tiếp URL trong giao diện Desktop bằng cách lưu vào `localStorage`:
> ```javascript
> localStorage.setItem('eigu_api_url', 'https://api.yourdomain.com/api/eigu-v1-x98f21a');
> localStorage.setItem('eigu_ws_url', 'https://api.yourdomain.com');
> ```

---

### 2. Backend API Server (`apps/api`)

- **File biến môi trường**: [`apps/api/.env`](file:///Users/peggy2402/Projects/eigu-platform/apps/api/.env)
- **Nội dung sửa**:

```env
PORT=3001
API_PREFIX=api/eigu-v1-x98f21a
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/eigu-v1-x98f21a
NEXT_PUBLIC_WS_URL=https://api.yourdomain.com
```

---

### 3. Web Dashboard (`apps/web` - Next.js)

- **File biến môi trường**: [`apps/web/.env`](file:///Users/peggy2402/Projects/eigu-platform/apps/web/.env)
- **Nội dung sửa**:

```env
PORT=3000
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/eigu-v1-x98f21a
NEXT_PUBLIC_WS_URL=https://api.yourdomain.com
```

---

### 4. Thư Viện Dùng Chung (`packages/shared`)

- **File hằng số mặc định**: [`packages/shared/src/lib/constants.ts`](file:///Users/peggy2402/Projects/eigu-platform/packages/shared/src/lib/constants.ts)
- **Nội dung sửa**:

```typescript
export const DEFAULT_API_BASE_URL = 'https://api.yourdomain.com/api/eigu-v1-x98f21a';
export const DEFAULT_WEBSOCKET_URL = 'https://api.yourdomain.com';
```

---

## ⚡ Kiểm Tra Sau Khi Thay Đổi

1. **Khởi chạy API Server**: `npx nx serve api` ➔ Truy cập trang tài liệu Swagger tại `https://api.yourdomain.com/api/eigu-v1-x98f21a/docs`.
2. **Kiểm tra WebSocket Chat**: Mở Desktop App và mở tab Chat ➔ Kiểm tra Console hiển thị `✅ Chat WebSocket Connected`.
