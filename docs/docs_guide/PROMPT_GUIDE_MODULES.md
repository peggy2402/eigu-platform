# Hướng Dẫn Viết Prompt Chuẩn Định Hướng Mô-Đun Cho AI Assistant

Tài liệu hướng dẫn người dùng cách đặt câu hỏi và ra lệnh (Prompt Engineering) để AI Assistant (Claude, ChatGPT, Gemini, Antigravity) lập trình chính xác 100% vào đúng mô-đun mong muốn mà không gây sai lệch kiến trúc dự án **EIGU Platform**.

---

## 1. Nguyên Tắc Cốt Lõi Khi Đặt Prompt Cho AI

1. **Chỉ định rõ Tên Mô-đun hoặc TabKey**: Luôn nhắc đến `tabKey` (ví dụ `cut`, `reup`, `tk-tiktok`, `chat-support`) hoặc tên mô-đun API (ví dụ `AuthModule`, `ChatModule`).
2. **Kèm theo Đường dẫn File (nếu có)**: Sử dụng cú pháp `@<tên_file>` (ví dụ `@live-chat.js`, `@ffmpeg-processor.ts`, `@views.component.js`).
3. **Mô tả hành vi mong muốn & Đầu ra**: Nêu rõ tính năng mới, kết quả UI hoặc dữ liệu cần trả về.

---

## 2. Các Mẫu Prompt Chuẩn (Prompt Templates)

### 📌 Mẫu 1: Thêm/Sửa tính năng trên một Mô-đun Giao diện (Desktop/Web View)
```text
Tôi muốn nâng cấp mô-đun '[tên_tabKey hoặc tên phân hệ]' (ví dụ: 'cut' / Tự động cắt).
Yêu cầu:
- Bổ sung [tính năng X].
- Sử dụng giao diện Range Slider kéo ngang (không dùng input number thô).
- Cập nhật đúng các file liên quan: @views.component.js, @automation-ui.js, @automation.css.
```

### 📌 Mẫu 2: Thêm một Mô-đun mới vào Dự án
```text
Bổ sung module '[tên_module_mới]' (ví dụ: 'auto-comment' / Tự động bình luận TikTok).
Yêu cầu:
- Tạo view mới và khai báo tabKey 'auto-comment' trong sidebar.
- Tự động ghi nhận mô-đun mới này vào file @MODULES_PROJECT.md.
```

### 📌 Mẫu 3: Lập trình Mô-đun Backend API mới (NestJS)
```text
Tạo mô-đun Backend API mới '[tên_module_api]' trong apps/api.
Yêu cầu:
- Tạo đầy đủ Controller, Service, DTOs và Module.
- Tích hợp bảo mật JWT Auth Guard và khai báo Swagger API Docs.
- Đảm bảo tương thích với Prisma 7 + Supabase PostgreSQL.
```

### 📌 Mẫu 4: Xử lý Lỗi / Bug trên Mô-đun cụ thể
```text
Mô-đun '[tên_module]' đang gặp sự cố [mô tả lỗi].
Hãy kiểm tra file @[tên_file], đọc log lỗi và khắc phục theo nguyên tắc Cross-Platform (chạy mượt trên cả Windows và macOS).
```

---

## 3. Danh Sách Mã Mô-Đun (TabKeys) Chuẩn Để Sử Dụng Trong Prompt

| Mã TabKey | Tên Phân Hệ Chức Năng | File Giao Diện Chính |
| :--- | :--- | :--- |
| `ho-so` | Hồ sơ cá nhân | `profile.component.js` |
| `tiep-thi` | Tiếp thị liên kết (Affiliate) | `views.component.js` |
| `doi-nhom` | Đội nhóm (Workspaces) | `views.component.js` |
| `tien-ich` | Tiện ích mở rộng | `views.component.js` |
| `guide` | Hướng dẫn sử dụng | `views.component.js` |
| `cut` | Tự động cắt video | `automation-ui.js` |
| `ai-video` | Tạo video AI | `ai-video-ui.js` |
| `reup` | Tạo video Reup | `automation-ui.js` |
| `hot-niche` | Tìm ngách hot | `automation-ui.js` |
| `bulk-download` | Tải video hàng loạt | `automation-ui.js` |
| `workflow` | Trình tạo Workflow | `workflow.service.js` |
| `record` | Ghi thao tác chuột/bàn phím | `automation-ui.js` |
| `tk-tiktok` | Quản lý nick TikTok | `views.component.js` |
| `tk-facebook` | Quản lý nick Facebook | `views.component.js` |
| `tk-youtube` | Quản lý kênh YouTube | `views.component.js` |
| `tk-x` | Quản lý nick X (Twitter) | `views.component.js` |
| `tk-instagram` | Quản lý nick Instagram | `views.component.js` |
| `tk-threads` | Quản lý nick Threads | `views.component.js` |
| `settings` | Cài đặt & Bể chứa API Keys | `settings.js` |
| `feedback` | Góp ý / Báo lỗi | `feedback-mgmt.js` |
| `user-mgmt` | Quản lý User (Admin) | `user-mgmt.js` |
| `chat-support` | Console Chat Support (Staff) | `live-chat.js` |
