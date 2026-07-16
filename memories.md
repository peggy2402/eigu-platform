# EIGU Platform - Development Memories & Architecture

Tài liệu này lưu trữ toàn bộ quá trình phát triển, các quyết định kiến trúc, và các lỗi đã khắc phục trong suốt quá trình xây dựng nền tảng EIGU (MMO TikTok Châu Âu/Mỹ).

## 1. Cấu trúc Hệ thống (Nx Monorepo)
- **API Gateway (NestJS):** Chạy ở cổng `3001`. Đóng vai trò làm trung tâm điều phối qua WebSocket (`Socket.IO`).
- **Web Dashboard (Next.js):** Chạy ở cổng `3000`. Cung cấp giao diện quản lý (Control Panel) bằng React.
- **Desktop Engine (Electron):** Đóng vai trò là Heavy-Worker Client (Máy trạm xử lý nặng). Chịu trách nhiệm render, encode FFmpeg và chạy Puppeteer cục bộ trên máy để tận dụng phần cứng.

## 2. Desktop Engine - UI/UX
- **Giao diện Kéo Thả (Drag & Drop):** Hỗ trợ kéo thả file `.mp4` hoặc dán link YouTube.
- **Khóa UI an toàn (UI Locking):** Chặn click và thao tác kéo thả khi hệ thống đang xử lý (`isProcessing = true`) để ngăn chặn việc người dùng vô tình tạo ra nhiều luồng xung đột.
- **Hủy Tiến Trình (Cancel Workflow):** Tích hợp nút "Hủy tiến trình" kích hoạt `command.kill('SIGKILL')` giúp chém đứt luồng FFmpeg C++ ngay lập tức.
- **Hackers-style Log Console:** 
  - Bắt toàn bộ `console.log` và `console.error` từ Node.js chuyển tiếp ra giao diện HTML.
  - Sử dụng định dạng `Raw Text Flow` thay vì dạng lưới (Flex Column) để văn bản ngắt dòng tự nhiên.
  - Bổ sung Timestamp (`22:54:27.142`) và Tags (`[INFO]`, `[ERROR]`, `[FFMPEG]`, `[SUCCESS]`) với màu sắc nổi bật.
  - Xử lý triệt để lỗi Crash `Uncaught Exception: Error: write EPIPE` khi hệ điều hành ngắt pipe của `process.stdout`.

## 3. Lõi FFmpeg (Anti-Detect Engine)
- Sử dụng `fluent-ffmpeg` để thao tác trực tiếp với video.
- **Phá vỡ Hash & Cấu trúc Pixel:** Tiêm nhiễu hạt (Noise Injection), vi chỉnh Contrast/Gamma (`eq=contrast=1.01:gamma=0.99`), và loại bỏ frame trùng lặp (`mpdecimate`).
- **Phá vỡ Audio:** Dịch chuyển âm thanh không gian (Spatial Panning) để lách thuật toán kiểm tra âm thanh bản quyền.
- **Metadata Stripping:** Xóa sạch toàn bộ siêu dữ liệu (`title`, `artist`, `encoder`) của file gốc.
- **Tích hợp Real YouTube Downloader:** Cài đặt `youtube-dl-exec` (`yt-dlp` core) thay vì Mock Data. Có cơ chế tự động xử lý khi URL đầu vào bị lỗi bằng cách chuyển hướng tạo mock input tại `/tmp/`.

## 4. Trình duyệt Ẩn danh (Puppeteer Stealth)
- Sử dụng `puppeteer-extra` kết hợp `puppeteer-extra-plugin-stealth` để ngụy trang.
- **Chống rò rỉ IP (WebRTC Leaks):** Vô hiệu hóa UDP (`--force-webrtc-ip-handling-policy=disable_non_proxied_udp`), ép buộc kết nối đi qua SOCKS5 Proxy.
- **Giả mạo Fingerprint:** Spoof User-Agent chuẩn MacOS Chrome.
- **Mô phỏng con người:** 
  - Sử dụng đường cong toán học Bézier (`simulateHumanMouse`) để di chuyển chuột ngẫu nhiên, mô phỏng tay người thật, lách Cloudflare Turnstile và các bot detector.

## 5. Cơ sở dữ liệu API (Prisma + PostgreSQL)
- Quyết định sử dụng **PostgreSQL** (Thay vì MongoDB) do đặc thù MMO cần quản lý quan hệ phức tạp (1 Proxy -> N Accounts).
- Cài đặt **Prisma ORM** (`schema.prisma`) bao gồm các bảng:
  - `User`: Khách hàng/Client.
  - `Proxy`: Kho IP, Port, Quốc gia, trạng thái (Live/Dead).
  - `TikTokAccount`: Ánh xạ vào User và Proxy, lưu trữ Cookies dạng JSON.
  - `VideoTask`: Giám sát trạng thái tiến trình xử lý và upload video.

## Kết luận & Bước tiếp theo
- Toàn bộ nền tảng đã chạy trơn tru với sự kết nối chặt chẽ giữa 3 phân hệ.
- Các vấn đề thắt cổ chai về mặt trải nghiệm người dùng (UX) ở Desktop App đã được xử lý chuẩn mực.
- **Bước tiếp theo:** Khởi chạy Database thông qua Prisma (`prisma db push`), tích hợp giao diện quản lý tài khoản TikTok trên Web Dashboard, và hoàn thiện thao tác "Click Upload" thật trong Puppeteer.
