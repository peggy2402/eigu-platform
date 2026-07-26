# EIGU Platform — AI Video Module

AI Video Module — Architecture

## 1. Architectural style

- Modular Monolith trong Electron Main Process kết hợp SaaS Backend API (`apps/api`).
- Clean Architecture với file-based storage cục bộ `.eigu`.
- Event-driven cho các tác vụ async.
- SaaS Credit & Centralized Provider Integration.

## 2. Layered architecture

```
┌─────────────────────────────────────────────────────┐
│  Renderer Process (HTML/JS/CSS)                     │
│  ↔ IPC (contextBridge)                              │
├─────────────────────────────────────────────────────┤
│  Main Process (Desktop App Client)                  │
│  ├── ProjectService / SceneService (Local .eigu)    │
│  └── Backend API HTTP Client (JWT Auth)             │
├─────────────────────────────────────────────────────┤
│  Backend Server (apps/api - NestJS SaaS Gateway)    │
│  ├── ApiKeyVault (Centralized Server Provider Keys) │
│  ├── Credit & Billing Engine (CreditBalance)        │
│  ├── AI Generation & Render Workers                 │
│  └── PostgreSQL Database (Prisma ORM)               │
└─────────────────────────────────────────────────────┘
```

## 3. Data flow

### New project → Save

```
Renderer → IPC 'project:create' → ProjectService.create()
  → Khởi tạo Project entity in memory
  → IPC response → Renderer cập nhật UI
Renderer → IPC 'project:save'
  → ProjectService.save() → EiguFileWriter.write(project)
  → Nén project.json + assets → ZIP → ghi file .eigu
  → IPC response → Renderer hiển thị đường dẫn
```

### Open project

```
Renderer → IPC 'project:open' (filePath)
  → Dialog hiển thị file picker (.eigu filter)
  → Chọn file → EiguFileReader.read(filePath)
  → Giải nén → parse project.json → load assets vào cache
  → IPC response → Renderer render toàn bộ project
```

### Render flow (SaaS Credit Route)

```
Renderer → IPC 'scene:render' (sceneId)
  → Client gọi Backend API POST /api/ai-video/render (mang JWT Token)
  → Backend kiểm tra creditBalance >= creditCost (Nếu thiếu -> trả INSUFFICIENT_CREDIT)
  → Backend Enqueue Job → Gọi Provider bằng Centralized Server Key
  → Job hoàn tất thành công → Backend trừ creditBalance & ghi CreditTransaction
  → Client tải Video kết quả về thư mục [ProjectName]_media/ cục bộ
```

## 4. Source of truth

- **File `.eigu` trên filesystem** là source of truth duy nhất cho dự án cục bộ.
- **Tài khoản Backend (`User.creditBalance`)** là source of truth duy nhất cho số dư credit và quyền truy cập AI Providers.

## 5. Bounded contexts

- Project (file management)
- Scene (scene CRUD + generation)
- Character (character library)
- Asset (media management)
- Provider (AI service integration)
- Render (queue + execution)
- Timeline (editing + composition)
- Voice/Subtitle/Music
- Credit & Billing (User credit transactions)

## 6. SaaS Model & Network Scoping (Client vs Centralized Backend)

- Quản lý project/scene/storyboard vẫn local-first (file `.eigu`).
- NHƯNG mọi lệnh **GENERATE PROMPT** và **RENDER VIDEO** bắt buộc gọi qua Backend API (`apps/api`), yêu cầu kết nối mạng + đăng nhập (JWT token), vì key AI provider do nền tảng sở hữu tập trung, khách hàng không tự mang key (No BYOK).
- Chi phí sử dụng được quy đổi và trừ trực tiếp vào số dư Credit (`creditBalance`) của tài khoản khách hàng trên Backend sau khi job render hoàn tất thành công.
