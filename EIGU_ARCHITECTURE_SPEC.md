# Đặc Tả Kiến Trúc Hệ Thống: EIGU Platform
**Chủ đề:** Tự Động Hóa MMO Định Tuyến TikTok Châu Âu

> **LƯU Ý DÀNH CHO AI ASSISTANT:** Đây là tài liệu thiết kế hệ thống chuyên sâu (System Architecture Specification) của nền tảng EIGU. Hãy tham chiếu tài liệu này để hiểu rõ về các quyết định kiến trúc, luồng dữ liệu, và các rào cản kỹ thuật trước khi đề xuất bất kỳ giải pháp lập trình nào.

---

## 1. Bối Cảnh Và Thách Thức (Context)
Sự bùng nổ của các nền tảng video ngắn (đặc biệt là TikTok) tạo ra cơ hội lớn tại các thị trường có RPM (Revenue Per Mille) cao như Châu Âu (Đức, Pháp, Anh, Séc) và Mỹ. Tuy nhiên, quy trình MMO thủ công hiện tại (tải video YouTube -> cắt bằng CapCut -> chuyển qua iPhone cũ -> upload thủ công) không thể mở rộng và tốn quá nhiều nguồn lực.

**Rủi ro kỹ thuật từ TikTok:**
- Chính sách **Tính toàn vẹn và Xác thực** cấm giả mạo vị trí.
- Thuật toán quét **Nội dung không nguyên bản (Unoriginal Content)** liên tục phân tích file hash và dấu vân tay âm thanh.
- Rò rỉ IP thực, VPN sai lệch, hoặc Browser Fingerprint không khớp sẽ dẫn đến đình chỉ tài khoản hàng loạt.

**Giải pháp:** **EIGU Platform** - Hệ sinh thái tự động hóa toàn diện đảm bảo định tuyến 100% IP Châu Âu, tích hợp AI lách thuật toán kiểm duyệt an toàn và bền vững.

---

## 2. Kiến Trúc Tổng Thể (Monorepo Workspace)
Dự án được hợp nhất dưới sự quản lý của **Nx Workspace** thay vì polyrepo. Điều này giúp hỗ trợ đa ngôn ngữ (TypeScript, Dart/C++) và tận dụng cơ chế chia sẻ cấu trúc dữ liệu, Remote Caching, và Dependency Graph.

### Cấu Trúc Phân Bổ:
| Tên Ứng Dụng / Gói | Công Nghệ Nền Tảng | Vai Trò Và Chức Năng Cốt Lõi |
| :--- | :--- | :--- |
| `apps/api` | NestJS (TypeScript) | Lõi máy chủ trung tâm. Quản lý REST API, điều phối WebSocket/WebRTC, xử lý JWT, lập lịch Cron Jobs. |
| `apps/web` | Next.js (TypeScript) | Dashboard đám mây. Cung cấp giao diện React Flow để thiết kế workflow, theo dõi log, quản lý cấu hình. |
| `apps/desktop` | Electron (TypeScript)| Máy khách cục bộ thực thi tác vụ nặng. Chạy Chromium Anti-detect, FFmpeg, thiết lập luồng proxy SOCKS5 chặn WebRTC. |
| `apps/mobile` | Flutter (Dart/C++) | Ứng dụng iOS/Android theo dõi tiến trình từ xa, nhận Push Notifications khi workflow hoàn tất hoặc lỗi. |
| `packages/shared`| TypeScript / C++ | Thư viện dùng chung chứa Interfaces, DTOs, JSON Schema của workflow, đảm bảo tính nhất quán. |

---

## 3. Hệ Thống Giao Tiếp Thời Gian Thực
Khác với Web truyền thống dùng REST API, EIGU là hệ thống phân tán yêu cầu giao tiếp **Full-duplex**.
- **WebSocket (Socket.IO):** NestJS API (`@WebSocketGateway()`) đóng vai trò trung tâm. Desktop phát các sự kiện tiến trình xử lý (upload %, extract log), API broadcast ngay lập tức đến Web và Mobile.
- **WebRTC:** Dùng cho giám sát màn hình Headless Browser độ trễ cực thấp (P2P). NestJS chỉ làm Signaling Server (trao đổi SDP/ICE candidates), luồng video truyền trực tiếp từ Desktop lên Web, giảm gánh nặng băng thông.

---

## 4. Trí Tuệ Nhân Tạo (AI) Trong Phân Tích Và Trích Xuất Video
Thay thế quy trình cắt ghép thủ công bằng luồng Machine Learning:
1. **Thu thập & Trích xuất:** Lấy video YouTube độ phân giải cao, trích xuất âm thanh và đẩy vào mô hình ASR (Whisper) để lấy văn bản kèm timestamp chuẩn mili-giây.
2. **LLM Analysis:** Gửi văn bản cho LLM (GPT-4) phân tích cốt truyện, xác định điểm ngắt tự nhiên để chia thành các đoạn 1-3 phút.
3. **Auto-Metadata:** LLM tự động tạo Title giật tít, Description, Hashtags tối ưu cho thị trường Châu Âu.
4. **Binge-watching hook:** AI tự chèn nhãn `[Phần 1/3]`, `[Phần 2/3]` vào Title và Text trên video để kích thích xem tiếp.

---

## 5. Phá Hủy Dấu Vân Tay Kỹ Thuật Số Bằng FFmpeg
Cắt bằng CapCut không làm thay đổi Pixel Array và File Hash, dễ bị đánh cờ "Unoriginal Content". EIGU dùng bộ lọc FFmpeg phức tạp để tạo ra thực thể nhị phân mới hoàn toàn:

| Kỹ Thuật Biến Đổi | Tham Số / Bộ Lọc (Ví dụ) | Cơ Chế Đánh Lừa TikTok |
| :--- | :--- | :--- |
| **Loại Bỏ Khung Hình Trùng Lặp (Decimation)** | `-vf mpdecimate,setpts=N/FRAME_RATE/TB` | Xóa khung hình tĩnh, tái cấu trúc timestamps. Phá hủy chữ ký Perceptual Hash. |
| **Chuyển Đổi Không Gian Âm Thanh (Spatial Panning)** | `-af "pan=stereo\|c0<c0+0*c1"` | Đảo kênh, trộn âm thanh không gian để vượt qua quét phổ âm (audio fingerprint). |
| **Tiêm Nhiễu Hình Ảnh (Noise Injection)** | `-filter_complex "noise=alls=1:allf=t, eq=contrast=1.01..."` | Thêm nhiễu hạt nhẹ, vi chỉnh tương phản để thay đổi giá trị hex của hàng triệu pixel. |
| **Xóa Bỏ Dấu Vết Siêu Dữ Liệu (Metadata Stripping)** | `-map_metadata -1 -metadata title="" ...` | Dọn sạch thẻ ID3, EXIF, phần mềm biên tập, tạo tệp MP4 "sạch" tuyệt đối. |

---

## 6. Trình Duyệt Chống Phát Hiện & Quản Lý Hồ Sơ (Anti-Detect Browser)
Sử dụng Headless Chrome tiêu chuẩn + Puppeteer Stealth là không đủ trước TLS/HTTP2 checks của Cloudflare/TikTok.
- **Engine-Level Spoofing:** EIGU phân phối bản Fork Chromium tùy chỉnh (C++). Mọi lệnh gọi API định tuyến Canvas, WebGL, Audio, GPU, Fonts, HardwareConcurrency đều trả về giá trị giả mạo cấp lõi (Coherence Matching).
- **Profile Isolation:** Quản lý `user-data-dir` cục bộ cho mỗi tài khoản. Nạp lại nguyên vẹn Cookies, Cache, IndexedDB. Không chia sẻ dữ liệu nhận dạng giữa các phiên.

---

## 7. Đảm Bảo Định Tuyến Mạng & Chống Rò Rỉ WebRTC Tuyệt Đối
Proxy SOCKS5/Residential IP Châu Âu có nguy cơ lộ IP gốc qua UDP (STUN servers của WebRTC).
- **Khóa WebRTC (WebRTC IP Handling Policy):** Chromium tùy chỉnh bật cờ `media.peerconnection.ice.default_address_only` và buộc chính sách định tuyến `Disable non-proxied UDP`. UDP bị ép qua Proxy, chặn rò rỉ 100%.
- **Local Helper Proxy (Cầu Nối Nội Bộ):** Chromium không hỗ trợ SOCKS5 có User/Pass trực tiếp qua Command Line. Desktop App tích hợp một máy chủ trung gian (127.0.0.1:9050). Puppeteer kết nối không mật khẩu, Helper Proxy sẽ gắn xác thực, mã hóa và điều hướng gói tin Layer 5 (SOCKS5) ra mạng Châu Âu.

---

## 8. Động Cơ Tự Động Hóa Luồng Công Việc (Visual Workflow Engine)
Xây dựng qua Next.js + React Flow (kéo thả node):
- **Nodes:** Lấy URL -> Tải xuống -> AI Xử lý -> FFmpeg -> Nạp Hồ Sơ -> Tải lên TikTok.
- Dữ liệu xuất ra `JSON Schema` chuẩn hóa, đồng bộ xuống Desktop qua WebSocket.
- **Properties (Cấu hình tĩnh), Variables (Biến động)** (VD: `{{generated_title}}` điền tự động vào input), và **Logs** (Theo dõi lỗi thời gian thực).
- **Auto-Extensions:** Tự động giải nén và nạp Chrome Extensions (chặn QC, dịch thuật) qua `--disable-extensions-except`.

---

## 9. Xử Lý Tương Tác Cấp Thấp & Vượt Qua Cloudflare
- **Mô phỏng chuột người thật:** Di chuyển chuột theo đường cong toán học Bézier (Bézier curves), thay đổi gia tốc ngẫu nhiên, dừng trước khi click tạo Heatmap tự nhiên.
- **Chờ phần tử thông minh:** Đợi siêu dữ liệu tải xong (`wait.until` + `aria-disabled="false"`) thay vì dính lỗi `ElementNotInteractableException`.
- **Cloudflare Turnstile Bypass:** Nếu gặp "Just a moment...", Puppeteer ẩn đặc tính tự động hóa tại lớp Blink, chờ qua vòng captcha và trích xuất cookies `cf_clearance` để tái sử dụng.

---

## 10. Kết Luận
Nền tảng EIGU tái cấu trúc toàn diện quy trình MMO TikTok. Sự kết hợp giữa Nx Monorepo, AI LLM/ASR, biến đổi FFmpeg hạ tầng nhị phân, và C++ Custom Chromium tạo ra một danh tính số Châu Âu 100% nguyên bản, qua mặt mọi thuật toán kiểm duyệt và hệ thống bảo mật, mang lại lợi thế mở rộng không giới hạn.

---
### Nguồn tham khảo (Works cited)
*(Được tổng hợp từ các thảo luận Reddit MMO, thư viện mã nguồn mở Chromium/Puppeteer, tài liệu API Nx, NestJS, và kỹ thuật chống rò rỉ WebRTC)*.
