# EIGU Platform - Development Memories

## Ngày 15/07/2026: Giai đoạn 1 - Khởi tạo & End-to-End Prototype
**Mục tiêu:** Xây dựng khung Monorepo và kết nối các phân hệ để luồng tự động hóa chạy trơn tru từ frontend tới worker.

### 🌟 Các thành tựu đạt được:
1. **Khởi tạo Kiến trúc Nx Monorepo:**
   - Cấu hình thành công workspace chứa 4 ứng dụng (apps) và 1 thư viện dùng chung (packages/shared).
   - Thiết lập cấu trúc DTO (`VideoWorkflowRequest`) dùng chung cho toàn bộ hệ thống để đảm bảo tính đồng nhất dữ liệu.

2. **Xây dựng API Gateway (NestJS - Cổng 3001):**
   - Đóng vai trò máy chủ trung tâm.
   - Tích hợp thành công **WebSocket (Socket.io)** để lắng nghe tiến trình từ Worker và phát sóng (broadcast) tới các Client.
   - Tích hợp **Swagger UI** tại `/api/docs` để chuẩn hóa tài liệu giao tiếp.

3. **Phát triển Web Dashboard (Next.js - Cổng 3000):**
   - Nâng cấp giao diện UI Dark Mode hiện đại sử dụng thư viện `@xyflow/react` (React Flow) để biểu diễn trực quan luồng công việc (Video -> FFmpeg -> Browser -> TikTok).
   - Tích hợp Socket.io-client kết hợp với `framer-motion`: Khi luồng xử lý chạy, các Node (nút thắt) sẽ đổi màu, viền sáng lên và các đường nối (Edge) sẽ có hiệu ứng cuộn chảy (animated) theo tiến độ % thực tế.

4. **Xây dựng Desktop Worker (Electron + Node.js):**
   - Khởi tạo script chạy ngầm và cấu trúc lại thành ứng dụng **Electron Desktop** thực thụ với `BrowserWindow`.
   - Bổ sung giao diện GUI (`index.html`): Hỗ trợ Kéo thả (Drag & Drop) file `.mp4` hoặc dán link YouTube.
   - Ứng dụng cơ chế **IPC (Inter-Process Communication)** để truyền lệnh từ giao diện HTML (Renderer) gọi xuống lõi Node.js (Main) kích hoạt xử lý.
   - Giả lập (Mock) quá trình băm video bằng **FFmpeg** để vượt qua rào cản phần mềm môi trường Mac.
   - Tích hợp thành công **Puppeteer** để tự động bật trình duyệt Chromium Anti-detect, lướt tới trang upload TikTok và giả lập vẽ đường cong chuột (Bézier curves) như người thật.

5. **Phát triển Mobile App (Flutter Native):**
   - Tạo mới Native Flutter App thay vì dùng plugin lỗi thời.
   - Cấu hình file `project.json` để đưa Flutter vào quản lý đồng nhất trong Nx Workspace.
   - Thiết kế giao diện Dark Mode Telemetry trên điện thoại, kết nối trực tiếp với WebSocket để giám sát từ xa quy trình băm video trên Mac.

### 📝 Bài học / Ghi chú kỹ thuật:
- Công cụ Nx CLI có cơ chế định tuyến port riêng (`-p` là project thay vì port), nên với Next.js chạy qua Nx thì cổng mặc định luôn là 3000.
- Các công cụ như `@nxrocks/nx-flutter` hay `nx-electron` nếu bị lỗi tương thích với bản Nx mới nhất thì nên dùng Native CLI (như `flutter create`) sau đó tự viết `project.json` để quản lý.
- Tiến trình tải bản binary gốc của Electron/Puppeteer lần đầu cần có mạng quốc tế ổn định.

> *"Một khởi đầu xuất sắc cho một siêu hệ thống tự động hóa MMO phức tạp!"*
