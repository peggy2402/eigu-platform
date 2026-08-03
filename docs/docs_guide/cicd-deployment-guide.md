# 🚀 Hướng dẫn CI/CD – EIGU Platform

> **Mục tiêu**: Mỗi khi commit/merge code vào nhánh `main`, toàn bộ hệ thống sẽ tự động cập nhật:
> - 🌐 **Web** (Next.js) → Tự động deploy lên **Vercel**
> - 🖥️ **Desktop** (Electron) → Tự động đóng gói `.exe` / `.dmg` và phát hành lên **GitHub Releases**
> - 🔌 **API** (NestJS) → Tự động deploy lên **Railway**

---

## Tổng quan luồng hoạt động

```
Anh viết code
    ↓
git commit + git push origin main
    ↓
GitHub nhận thay đổi
    ├── Vercel (Web) → Tự động build & deploy Next.js
    ├── Railway (API) → Tự động build & deploy NestJS
    └── GitHub Actions (Desktop) → Tự động đóng gói .exe/.dmg → GitHub Releases
```

---

## PHẦN 1 – Web (Next.js) → Vercel

> ✅ Dự án đã có `vercel.json`, chỉ cần kết nối GitHub với Vercel 1 lần duy nhất.

### Bước 1: Kết nối Repository với Vercel

1. Truy cập [vercel.com](https://vercel.com) → Đăng nhập bằng GitHub.
2. Nhấn **"Add New Project"**.
3. Tìm và chọn repository **`peggy2402/eigu-platform`** → Nhấn **"Import"**.

### Bước 2: Cấu hình Project

| Trường | Giá trị |
|--------|---------|
| **Framework Preset** | `Next.js` |
| **Root Directory** | *(để trống)* |
| **Build Command** | `npm run vercel-build` |
| **Output Directory** | `apps/web/.next` |
| **Install Command** | `npm ci` |

### Bước 3: Thêm Environment Variables

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://URL-API-CUA-BAN.up.railway.app/api` |
| `NEXT_PUBLIC_WS_URL` | `https://URL-API-CUA-BAN.up.railway.app` |

> ⚠️ Điền URL Railway sau khi hoàn thành Phần 2.

### Bước 4: Deploy

Nhấn **"Deploy"** → Xong! Từ bây giờ:

```bash
git push origin main  →  Vercel tự động deploy Web trong ~2 phút
```

---

## PHẦN 2 – API (NestJS) → Railway

### Bước 1: Tạo tài khoản Railway

1. Truy cập [railway.app](https://railway.app).
2. Nhấn **"Login with GitHub"**.

### Bước 2: Tạo Project mới

1. Nhấn **"New Project"** → **"Deploy from GitHub repo"**.
2. Chọn **`peggy2402/eigu-platform`**.

### Bước 3: Cấu hình Service

Vào Service vừa tạo → tab **"Settings"**:

| Trường | Giá trị |
|--------|---------|
| **Root Directory** | `apps/api` |
| **Build Command** | `npm ci && npx nx build api` |
| **Start Command** | `node dist/apps/api/main.js` |
| **Branch** | `main` |

### Bước 4: Thêm Environment Variables

Vào tab **"Variables"** → thêm toàn bộ biến từ file `apps/api/.env`:

```
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
SEPAY_WEBHOOK_SECRET=...
SEPAY_BANK_NAME=ACB
SEPAY_ACCOUNT_NO=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
PORT=3001
```

> 🔐 KHÔNG commit file `.env` lên GitHub. Chỉ nhập thẳng vào Railway.

### Bước 5: Lấy URL API

Sau khi Railway deploy xong, lấy URL dạng:
```
https://eigu-platform-api.up.railway.app
```

Cập nhật biến này vào **Vercel** (Phần 1 - Bước 3) và vào ứng dụng **Desktop** (file `apps/api/.env` → biến `NEXT_PUBLIC_API_URL`).

### Từ bây giờ (Tự động 100%)

```bash
git push origin main  →  Railway tự động deploy API trong ~3–5 phút
```

---

## PHẦN 3 – Desktop (Electron) → GitHub Releases

> ✅ Đã cấu hình xong hoàn toàn qua GitHub Actions.

### Cơ chế hoạt động

Mỗi khi push **Git Tag** dạng `v*` → GitHub Actions tự động:
1. Build Electron app.
2. Đóng gói bộ cài `.exe` (Windows) + `.dmg` (macOS).
3. Publish lên **GitHub Releases**.
4. Ứng dụng Desktop của người dùng tự động phát hiện bản mới → hiển thị nút **"Update"**.

### Quy trình phát hành phiên bản Desktop mới

**Bước 1**: Sửa số phiên bản trong 2 file:

```javascript
// apps/desktop/src/assets/js/ui/auto-update.js – dòng 3
const CURRENT_VERSION = '1.0.1'; // ← số phiên bản mới
```

```json
// apps/desktop/package.json
{ "version": "1.0.1" }
```

**Bước 2**: Commit và push lên `main`:

```bash
git add .
git commit -m "feat: release v1.0.1 - [mô tả thay đổi]"
git push origin main
```

**Bước 3**: Gắn Tag và push:

```bash
git tag v1.0.1
git push origin v1.0.1
```

**Kết quả**: Sau 5–10 phút, bộ cài `.exe` và `.dmg` xuất hiện tại mục Releases, người dùng tự động nhận thông báo cập nhật!

---

## PHẦN 4 – Quy trình làm việc hàng ngày

```bash
# 1. Code trên nhánh developer
git checkout developer

# 2. Commit và push lên developer
git add .
git commit -m "feat: thêm tính năng XYZ"
git push origin developer

# 3. Merge vào main để auto-deploy Web & API
git checkout main
git merge developer
git push origin main
# → Web (Vercel) & API (Railway) tự động cập nhật!

# 4. Khi muốn phát hành bản Desktop mới:
git tag v1.0.x
git push origin v1.0.x
# → Desktop tự động build & release!
```

---

## Bảng tóm tắt

| Thành phần | Nền tảng | Kích hoạt khi | Thời gian |
|------------|----------|----------------|-----------|
| **Web** (Next.js) | Vercel | Push vào `main` | ~2 phút |
| **API** (NestJS) | Railway | Push vào `main` | ~3–5 phút |
| **Desktop** (Electron) | GitHub Actions | Push Tag `v*` | ~5–10 phút |

---

## Câu hỏi thường gặp

**Q: Chi phí như thế nào?**
- **Vercel**: Miễn phí (Hobby plan) cho cá nhân.
- **Railway**: Miễn phí $5 credit/tháng. Gói $20/tháng cho production.
- **GitHub Actions**: Miễn phí 2,000 phút/tháng.

**Q: Làm sao biết deploy thành công?**
- Vercel: [vercel.com/dashboard](https://vercel.com/dashboard)
- Railway: [railway.app/dashboard](https://railway.app/dashboard)
- Desktop: [github.com/peggy2402/eigu-platform/actions](https://github.com/peggy2402/eigu-platform/actions)

**Q: Cần thay đổi biến môi trường API thì làm thế nào?**
→ Vào Railway → Service → tab **Variables** → sửa trực tiếp → Railway tự động redeploy.
