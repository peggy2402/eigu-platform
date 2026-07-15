# EIGU Platform - Master AI Context

> **LƯU Ý DÀNH CHO CÁC AI ASSISTANT (Claude, GPT, Gemini...):**  
> Khi bạn được thêm vào dự án này để hỗ trợ code, HÃY ĐỌC KỸ TÀI LIỆU NÀY TRƯỚC TIÊN để hiểu cấu trúc hệ thống và không phá vỡ kiến trúc.

## 1. Tổng quan Kiến trúc (Nx Monorepo)
Dự án được quản lý trong một **Nx Workspace** (`npx nx ...`) bao gồm 4 ứng dụng và 1 thư viện dùng chung.
* **Cơ sở hạ tầng:** Node.js, TypeScript.

### Cấu trúc thư mục:
- `apps/api` (NestJS): Backend Gateway trung tâm (Cổng 3001). Cung cấp REST API (có Swagger tại `/api/docs`) và WebSockets để quản lý toàn bộ trạng thái hệ thống.
- `apps/web` (Next.js): Dashboard giám sát (Cổng 3000). Sử dụng React Flow, Tailwind/CSS thuần, Dark Mode, kết nối Socket.io để theo dõi tiến trình thời gian thực.
- `apps/desktop` (Electron + Node.js): Worker xử lý nặng. Nhận file kéo thả (.mp4, YouTube), gọi IPC xuống lõi Node.js để chạy FFmpeg (băm video, chống MD5) và gọi Puppeteer để lướt Web/TikTok Anti-detect.
- `apps/mobile` (Flutter Native): Ứng dụng điện thoại Live Telemetry, dùng Dart, kết nối Socket.io để hiển thị trạng thái từ xa.
- `packages/shared`: Nơi định nghĩa các Type, DTO, Interface dùng chung cho cả 4 app trên (VD: `VideoWorkflowRequest`).

## 2. Quy tắc Lập trình (Code Conventions)
1. **Tuyệt đối không lặp lại code định nghĩa (DRY):** Bất cứ cấu trúc dữ liệu nào truyền qua mạng (API/WebSocket) đều phải được khai báo trong thư mục `packages/shared` và import chéo vào các app.
2. **Giao diện & Thẩm mỹ:** Mọi giao diện (Web, Desktop, Mobile) phải tuân theo phong cách **Dark Mode** hiện đại, sử dụng gradient, animation mượt mà.
3. **Cơ chế hoạt động của Nx:** 
   - Không được dùng các lệnh `npm start` hay `npm run dev` thông thường. 
   - Lệnh chạy: `npx nx serve <app_name>`.
   - Với Web Next.js: `npx nx dev web`.
   - Riêng Desktop (Electron) đã được tinh chỉnh cấu hình `serve` trong `project.json` để chạy thẳng lệnh `npx electron`.
4. **WebSocket:** Luồng dữ liệu giữa API, Web, Desktop và Mobile dựa hoàn toàn vào kiến trúc Event-driven qua Socket.io-client.

## 3. Trạng thái Hiện tại (Checkpoint)
- Đã hoàn thành Giai đoạn 1: **Prototype End-to-End**.
- Luồng đã thông từ lúc người dùng kéo thả file ở Desktop -> Nhắn tin IPC -> Node.js giả lập gọi FFmpeg -> Mở Chromium (Puppeteer) -> Báo cáo % tiến độ lên API Gateway -> Phản hồi thời gian thực ra biểu đồ React Flow ở Web Dashboard.

## 4. Mục tiêu tiếp theo
- Triển khai thuật toán xử lý FFmpeg thật (Decimation, Noise Injection).
- Viết kịch bản Puppeteer phức tạp hơn: Fake Fingerprint, vượt Captcha, tự động điền form Upload TikTok.
- Thiết kế cơ sở dữ liệu (Database) trên API để lưu lại lịch sử các video đã upload.
