# Plan Refactoring Architecture cho `apps/desktop`

Tài liệu thiết kế tái cấu trúc (refactoring) phân hệ `apps/desktop` theo mô hình **Modular Architecture** nhằm phân định rõ ràng giữa **Main Process (Node.js/Electron Engine)** và **Renderer Process (Giao diện UI/UX)**, chia nhỏ các file monolith và gom nhóm theo Domain chuyên biệt.

---

## User Review Required

> [!IMPORTANT]
> **Điểm mấu chốt của công tác Refactoring:**
> 1. **Tách biệt 2 tiến trình (Main vs Renderer Process)**: Di dời toàn bộ logic Node.js/FFmpeg/Puppeteer/IPC về thư mục `src/main/`, và toàn bộ logic UI/HTML/CSS/JS về `src/renderer/` (hoặc `src/assets/`).
> 2. **Tách nhỏ Monolith File `views.component.js` (97KB)**: Chia nhỏ 25 tabs giao diện thành các View Renderers riêng biệt theo nhóm chức năng (`personal`, `video-tools`, `automation`, `social-accounts`, `system-admin`).
> 3. **Tập trung hóa quản lý IPC Handlers**: Tạo `main/ipc/ipc-registry.ts` quản lý và đăng ký toàn bộ các IPC handlers (`workflow`, `studio`, `api-keys`, `api-config`, `auto-update`).
> 4. **Giữ nguyên 100% chức năng hiện có & tương thích build Nx**: Cập nhật `main.ts` (entrypoint), `tsconfig.app.json` và `index.html` để ứng dụng Electron tự động tải đúng module mà không gây ra bất kỳ lỗi runtime nào.

---

## Sơ Đồ Kiến Trúc Đề Xuất (Before vs After)

### 🔴 Cấu trúc hiện tại (Lộn xộn & Monolithic):
```
apps/desktop/src/
├── main.ts                       # IPC handlers rải rác + window setup
├── ffmpeg-processor.ts            # Flat file ở src/
├── youtube-downloader.ts          # Flat file ở src/
├── browser-automation.ts         # Flat file ở src/
├── ai-video-pipeline.ts          # Flat file ở src/
├── api-key-store.ts              # Flat file ở src/
├── ai-video-studio/              # Chứa lẫn cả main TS + renderer JS + stores
│   ├── studio-ipc-handlers.ts
│   ├── studio-main.js            # ⚠️ JS file nằm lẫn trong folder TS
│   └── ...
└── assets/
    └── js/
        ├── components/
        │   └── views.component.js# ⚠️ Monolith file 97KB (chứa 25 tabs)
        ├── ui/
        │   ├── settings.js       # 77KB
        │   ├── studio-main.js    # 70KB (trùng tên với studio-main.js ở trên)
        │   ├── live-chat.js      # 55KB
        │   └── ...
```

### 🟢 Cấu trúc sau khi Refactor (Clean Modular & Domain-driven):
```
apps/desktop/src/
├── main/                          # 🟢 Main Process (Electron Engine)
│   ├── index.ts                   # Entry point chính của Electron Main Process
│   ├── config/                    # Cấu hình môi trường, cửa sổ Electron
│   │   ├── env.config.ts
│   │   └── window.config.ts
│   ├── ipc/                       # Đăng ký & quản lý IPC Handlers
│   │   ├── ipc-registry.ts        # Dispatcher trung tâm đăng ký tất cả IPC handlers
│   │   └── handlers/              # Handlers chia theo domain
│   │       ├── api-config.ipc.ts
│   │       ├── workflow.ipc.ts
│   │       ├── api-keys.ipc.ts
│   │       ├── auto-update.ipc.ts
│   │       └── studio.ipc.ts
│   ├── services/                  # Lõi xử lý nặng (Engine Services)
│   │   ├── ffmpeg-processor.service.ts
│   │   ├── youtube-downloader.service.ts
│   │   ├── browser-automation.service.ts
│   │   ├── ai-video-pipeline.service.ts
│   │   └── api-key-store.service.ts
│   └── utils/                     # Main process utilities
│       ├── path.utils.ts
│       └── logger.utils.ts
│
├── assets/                        # 🔵 Renderer Process (Giao diện UI/UX)
│   ├── css/                       # Stylesheets
│   ├── img/                       # Images & Icons
│   ├── index.html                 # Main HTML Layout
│   └── js/
│       ├── core/                  # Core State, API Client, Theme, Telemetry
│       │   ├── api.js
│       │   ├── state.js
│       │   ├── theme.js
│       │   └── telemetry.js
│       ├── components/            # Layout Components (Header, Sidebar, Auth)
│       │   ├── header.component.js
│       │   ├── sidebar.component.js
│       │   ├── auth.component.js
│       │   └── views.component.js # Component điều phối & nạp các View Renderers
│       ├── views/                 # 📂 Đã tách nhỏ từ views.component.js (25 tabs)
│       │   ├── personal/          # ho-so, tiep-thi, doi-nhom, tien-ich, guide
│       │   ├── video-tools/       # cut, ai-video, reup, hot-niche, bulk-download
│       │   ├── automation/        # workflow, record
│       │   ├── social-accounts/   # tk-tiktok, tk-facebook, tk-youtube, tk-x, tk-instagram, tk-threads
│       │   └── system-admin/      # settings, user-mgmt, telemetry, feedback-mgmt, chat-support, analytics, activity-logs
│       └── ui/                    # Feature Logic & UI Interactions
│           ├── automation-ui.js
│           ├── live-chat.js
│           ├── settings.js
│           ├── user-mgmt.js
│           ├── user-activity-logs.js
│           └── ai-video-studio/   # UI Studio logic & stores
│               ├── studio-main.js
│               ├── studio.store.js
│               └── queue.store.js
```

---

## Proposed Changes

### Phase 1: Restructure Main Process (`src/main/`)
1. **Tạo cấu trúc thư mục `src/main/`**:
   - `src/main/services/`: Di chuyển các service xử lý nặng:
     - `ffmpeg-processor.ts` ➔ `ffmpeg-processor.service.ts`
     - `youtube-downloader.ts` ➔ `youtube-downloader.service.ts`
     - `browser-automation.ts` ➔ `browser-automation.service.ts`
     - `ai-video-pipeline.ts` ➔ `ai-video-pipeline.service.ts`
     - `api-key-store.ts` ➔ `api-key-store.service.ts`
   - `src/main/ipc/`: Tách toàn bộ `ipcMain.on` / `ipcMain.handle` từ `main.ts` và `ai-video-studio/studio-ipc-handlers.ts` thành các IPC modules chuẩn hoá:
     - `api-config.ipc.ts`
     - `workflow.ipc.ts`
     - `api-keys.ipc.ts`
     - `auto-update.ipc.ts`
     - `studio.ipc.ts`
     - `ipc-registry.ts` (Hàm `registerAllIpcHandlers(window, socket)` gọi đăng ký tất cả)
   - `src/main/config/`:
     - `window.config.ts`: Cấu hình tạo BrowserWindow và redirect log.
   - `src/main.ts`: Re-export hoặc trỏ entrypoint Electron tới `src/main/index.ts` để đảm bảo compatibility với Nx `project.json`.

---

### Phase 2: Refactor Renderer Views (`src/assets/js/views/`)
1. **Tách file monolith `views.component.js` (97KB)** thành các file view nhỏ hơn trong `src/assets/js/views/`:
   - `personal.views.js`: Chứa template render cho 5 tab cá nhân (`ho-so`, `tiep-thi`, `doi-nhom`, `tien-ich`, `guide`).
   - `video-tools.views.js`: Chứa template render cho 5 tab công cụ video (`cut`, `ai-video`, `reup`, `hot-niche`, `bulk-download`).
   - `automation.views.js`: Chứa template render cho 2 tab tự động hóa (`workflow`, `record`).
   - `social-accounts.views.js`: Chứa template render cho 6 tab tài khoản mạng xã hội (`tk-tiktok`, `tk-facebook`, `tk-youtube`, `tk-x`, `tk-instagram`, `tk-threads`).
   - `system-admin.views.js`: Chứa template render cho 7 tab hệ thống & admin (`settings`, `user-mgmt`, `telemetry`, `feedback-mgmt`, `chat-support`, `analytics`, `user-activity-logs`).
2. **Cập nhật `views.component.js`**: Trở thành View Coordinator sạch sẽ, chỉ chịu trách nhiệm ghép nối (compose) HTML từ các module views trên và trả về cho `index.html`.
3. **Cọn dẹp các file duplicate**: Xóa bỏ file `src/ai-video-studio/studio-main.js` bị nằm nhầm vị trí và giữ lại bản chuẩn trong `src/assets/js/ui/ai-video-studio/`.

---

### Phase 3: Cập nhật References & HTML Script Tags
1. Cập nhật `src/assets/index.html` để import các script views mới trước `views.component.js` hoặc dùng ES module loading chuẩn.
2. Cập nhật `tsconfig.app.json` nếu cần để bao bọc đúng các đường dẫn TypeScript mới.

---

## Verification Plan

### Automated Verification
- Kiểm tra biên dịch TypeScript toàn bộ ứng dụng Desktop:
  ```bash
  npx tsc --noEmit -p apps/desktop/tsconfig.app.json
  ```

### Manual & Runtime Verification
- Chạy thử ứng dụng Desktop thông qua Nx:
  ```bash
  npx nx serve desktop
  ```
- Kiểm tra các chức năng IPC và UI:
  1. Khởi động cửa sổ ứng dụng Electron không có lỗi console crash.
  2. Thao tác chuyển qua lại giữa cả 25 tabs giao diện (Cá nhân, Công cụ, Tự động hóa, Tài khoản, Hệ thống).
  3. Thử nút Chọn thư mục / Mở thư mục output (IPC `open-output-folder`, `select-output-folder`).
  4. Thử tính năng Cắt Video & Tải YouTube (IPC `start-workflow`).
  5. Thử tính năng Quản lý API Key (IPC `get-api-keys`, `add-api-key`).

---

**Sau khi bạn duyệt Kế hoạch này (hoặc có góp ý điều chỉnh), tôi sẽ lập tức triển khai công tác refactor từng bước một cách an toàn và chuẩn xác.**
