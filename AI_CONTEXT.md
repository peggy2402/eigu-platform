# EIGU Platform - Master AI Context

> **LUU Y DANH CHO CAC AI ASSISTANT (Claude, GPT, Gemini...):**
> Khi ban duoc them vao du an nay de ho tro code, HAY DOC KY TAI LIEU NAY TRUOC TIEN de hieu cau truc he thong va khong pha vo kien truc.

## 1. Tong quan Kien truc (Nx Monorepo)
Du an duoc quan ly trong mot **Nx Workspace** (`npx nx ...`) bao gom 4 ung dung va 1 thu vien dung chung.
* **Co so ha tang:** Node.js, TypeScript.

### Cau truc thu muc:
- `apps/api` (NestJS): Backend Gateway trung tam (Cong 3001). Cung cap REST API (co Swagger tai `/api/docs`) va WebSockets de quan ly toan bo trang thai he thong.
- `apps/web` (Next.js): Dashboard giam sat (Cong 3000). Su dung React Flow, Dark Mode, ket noi Socket.io de theo doi tien trinh thoi gian thuc.
- `apps/desktop` (Electron + Node.js): Worker xu ly nang. Nhan file keo tha (.mp4, YouTube), goi IPC xuong loi Node.js de chay FFmpeg (bam video, chong MD5) va goi Puppeteer de luot Web/TikTok Anti-detect.
- `apps/mobile` (Flutter Native): Ung dung dien thoai Live Telemetry, dung Dart, ket noi Socket.io de hien thi trang thai tu xa.
- `packages/shared`: Noi dinh nghia cac Type, DTO, Interface dung chung cho ca 4 app tren (VD: `VideoWorkflowRequest`).

## 2. Quy tac Lap trinh (Code Conventions)
1. **Tuyet doi khong lap lai code dinh nghia (DRY):** Bat cu cau truc du lieu nao truyen qua mang (API/WebSocket) deu phai duoc khai bao trong thu muc `packages/shared` va import cheo vao cac app.
2. **Giao dien & Tham my:**
   - **KHONG SU DUNG EMOJI ICON** trong bat ky giao dien nao (Web, Desktop, Mobile). Emoji gay cam giac thieu chuyen nghiep.
   - **Desktop:** Dung SVG icons inline (xem `js/ui/icons.js`).
   - **Web:** Dung `lucide-react` icons (da co trong dependencies).
   - **Mobile:** Dung Material Icons (`Icons.*`).
   - **CSS/UI:** Dark mode, gradient, animation muot ma.
   - **Sidebar UI State (CRITICAL):** Khi viet code chuyen tab (switchView / toggleDropdown), LUON LUON phai don dep trang thai cua cac menu khac (`.nav-item.open`). Tuyet doi khong de quen xoa class `.open` khi chuyen sang mot tab khong co dropdown, de tranh loi cac submenu cua tab cu van bi hien thi chong cheo len nhau.
   - **Search Popup Navigation (CRITICAL):** Đối với các tab có dropdown submenu (như "Công cụ", "Tự động hóa", "Tài khoản"), trong menu tìm kiếm (`header.component.js`) tuyệt đối KHÔNG ĐƯỢC để kết quả tìm kiếm trỏ thẳng vào thẻ cha (ví dụ `data-view="tai-khoan"`) vì thẻ cha không có View riêng. Phải đưa toàn bộ các thẻ con (sub-items) vào kết quả tìm kiếm để điều hướng đúng vào chức năng.
   - **Event Data / Status Update (CRITICAL):** Thống nhất code kiểu key-value (chuẩn hóa schema). Truyền status event qua IPC hoặc WebSocket phải dùng object (ví dụ `{ state: 'success', message: '...' }`). TUYỆT ĐỐI KHÔNG dùng string matching trên UI (ví dụ `msg.includes('Hoàn tất')`) để suy luận logic trạng thái.
   - **Responsive UI Layout & Button Scaling (CRITICAL):** TUYỆT ĐỐI KHÔNG ép cố định `width: 100%` cho các nút bấm phụ (như nút "Gửi", "Lọc", "Thao tác") bên trong các container nằm ngang (flex row) khiến nút bị giãn dài quá khổ. Các container chính (`.view`, `#view-user-management`, `#view-chat-support`) phải được thiết kế Responsive tự điều chỉnh độ rộng (`width: 100%; box-sizing: border-box; flex: 1;`), co giãn mượt mà khi người dùng thay đổi kích thước cửa sổ.
   - **Responsive Data Tables & Mobile/Compact Layout (CRITICAL UI/UX):** Đối với tất cả các bảng dữ liệu (Data Tables) có nhiều cột (> 4-5 cột như Quản lý User/Staff, Feedback, Lịch sử thông báo...):
     1. Khung chứa Bảng (`.table-wrapper`) phải luôn có `overflow-x: auto; width: 100%;` và thẻ `<table>` có `min-width: 850px;` để ở độ phân giải lớn không bao giờ bị cắt xén (clipped) các cột bên phải.
     2. Khi thu nhỏ cửa sổ ứng dụng (hoặc màn hình hẹp `< 900px`), hệ thống phải tự động chuyển đổi linh hoạt từ dạng Bảng (`<table>`) sang dạng **Danh sách Thẻ Responsive (Card Grid Layout)**. Mỗi Card chứa đầy đủ thông tin (Header, Trạng thái, Thông số, Nút Thao Tác) giúp trải nghiệm UI/UX tự nhiên, mượt mà trên mọi kích thước màn hình mà không bị méo hay che khuất cột.
   - **Modern Soft Button Styling & UX Design System (CRITICAL UI/UX):**
     1. **TUYỆT ĐỐI KHÔNG SỬ DỤNG VIỀN KHÔ CỨNG THÔ LÁP (`border: 1px/2px solid #000000` / khung đen cứng)** cho các nút bấm (`.btn-outline`, `.btn-primary`, `.btn-danger`...). Các nút bấm phải thiết kế mềm mại, hiện đại theo chuẩn Premium Soft UI với `border-radius: 8px;`, viền nhạt mượt mà (`border: 1px solid var(--border-color)` hoặc `rgba(99, 102, 241, 0.25)`), hiệu ứng hover mượt và bóng đổ dịu nhẹ (`box-shadow: 0 2px 8px rgba(...)`).
     2. Nút bấm phụ / Nút thao tác (`.btn-outline`) phải hòa nhập tự nhiên với phông nền, chữ nét sắc nét, hover chuyển màu mượt mà, loại bỏ hoàn toàn các đường viền đen đậm cứng nhắc.
   - **Real-time Chat UX & Messaging Standards (CRITICAL UI/UX):**
     1. **Tự động Cuộn xuống Tin nhắn Mới nhất (Auto-Scroll to Bottom):** Khi mở khung chat hoặc có tin nhắn mới, giao diện khung chat phải ngay lập tức cuộn xuống dưới cùng (`container.scrollTop = container.scrollHeight`). TUYỆT ĐỐI KHÔNG để khung chat bị dừng ở tin nhắn trên cùng gây bất tiện cho người dùng.
     2. **Cập nhật Real-time Tức Thì (No Page Reload):** Mọi tin nhắn gửi từ phía User hoặc Staff phải lập tức xuất hiện trên màn hình theo thời gian thực mà không bắt người dùng bấm nút nạp lại.
     3. **Trạng thái Tin nhắn (`Đã gửi` / `Đã xem`):** Hiển thị rõ ràng nhãn trạng thái ("Đã gửi", "Đã xem") bên dưới bong bóng tin nhắn. Khi Staff xem cuộc trò chuyện của User, trạng thái tin nhắn phía User sẽ tự động chuyển thành "Đã xem".
     4. **Tương tác Nâng cao (Quote Reply, Emoji Reactions & Trigger `@Eigu AI`):** Hỗ trợ Trả lời tin nhắn (Quote Reply), Thả biểu cảm Emoji Reaction, Emoji Picker tại ô input, và chỉ kích hoạt AI khi có cú pháp `@Eigu AI <nội dung>` hoặc dùng các Slash Command (`/help`, `/staff`, `/ai`).
   - **Global Keydown Event Guards (CRITICAL):** khi lắng nghe sự kiện phím toàn cục (ví dụ `Enter` hay `Escape`), LUÔN LUÔN phải kiểm tra container hiển thị (`auth-container.style.display !== 'none'`). TUYỆT ĐỐI KHÔNG kích hoạt các hàm submit form Đăng nhập / Đăng ký khi người dùng đã vào ứng dụng chính, tránh gây ra thông báo lỗi hoặc Toast Đăng nhập sai vị trí.
   - **No Default Raw Number Inputs & Custom Sliders (CRITICAL UI/UX):**
     1. **TUYỆT ĐỐI KHÔNG SỬ DỤNG THẺ `<input type="number">` MẶC ĐỊNH VỚI ICON MŨI TÊN TĂNG/GIẢM TRẮNG THÔ LÁP** cho các thông số vi chỉnh màu sắc (Độ sáng, Tương phản, Độ bão hòa), cao độ/tốc độ âm thanh hay kích thước.
     2. Mọi thông số dạng định lượng/tỉ lệ phải được thiết kế dạng **Thanh Kéo Ngang (Custom Range Slider `<input type="range">`)** có Badge số hiển thị giá trị hiện tại (ví dụ `1.00x`, `15%`).
     3. Tất cả các tùy chọn chỉnh sửa hình ảnh/video phải hỗ trợ **Hiệu ứng Live Preview Thời Gian Thực** trực tiếp trên khung xem trước (Video Preview Viewport) để người dùng thấy rõ sự thay đổi trước khi bấm bắt đầu xử lý.
   - **Structured System Knowledge & Tab Guidance (CRITICAL):** Trợ lý AI (`@Eigu AI`) và các công cụ tìm kiếm trong hệ thống phải được trang bị tri thức đầy đủ về 25 `tabKey` (bao gồm các parent tabs và sub-items như `cut`, `ai-video`, `reup`, `hot-niche`, `bulk-download`, `workflow`, `record`, `tk-tiktok`, `tk-facebook`, `tk-youtube`, `tk-x`, `tk-instagram`, `tk-threads`, `settings`, `feedback`...). Trả lời của AI phải dựa trên cấu trúc tính năng thực tế của EIGU Platform, không được dùng các câu trả lời ngắn cứng nhắc hay giả lập mơ hồ.
   - **Tự Động Cập Nhật Danh Sách Mô-Đun Dự Án (CRITICAL AUTOMATION SKILL):**
     1. Khi người dùng yêu cầu "Bổ sung module '<tên_module>'" hoặc "Thêm module '<tên_module>'", AI phải **TỰ ĐỘNG** đọc và cập nhật mô-đun mới vào file [MODULES_PROJECT.md](file:///Users/peggy2402/Projects/eigu-platform/MODULES_PROJECT.md) dưới nhóm phân hệ tương ứng.
     2. AI phải kiểm tra xem mô-đun đó thuộc nhóm Backend API, Workspace App hay UI View (25 tabKeys) để xếp đúng vị trí và cập nhật tổng số lượng mô-đun chính xác.
   - **Real-Time Event Deduplication & Client Temp ID Matching (CRITICAL REALTIME SKILL):**
     1. **TUYỆT ĐỐI KHÔNG TẠO TRÙNG LẶP TIN NHẮN / DỮ LIỆU THỜI GIAN THỰC (No Duplicate Message Render):** Khi kết nối WebSocket / Socket.io truyền nhận dữ liệu giữa Client và Server, LUÔN LUÔN phải truyền mã định danh tin nhắn (`id` / `tempId`) từ phía client lên server và phản hồi ngược lại.
     2. Khi client nhận sự kiện WebSocket `chat:message_received`, phải kiểm tra trùng lặp theo `(m.id === msg.id || (m.sender === msg.sender && m.text === msg.message && timeDelta < 10s))`. Nếu bản ghi tạm đã tồn tại trên RAM/DOM thì chỉ **cập nhật trạng thái/ID chuẩn**, tuyệt đối KHÔNG `push` trùng lặp khiến cùng một nội dung tin nhắn xuất hiện 2 lần trên màn hình User và Staff.
   - **Strict Module Targeting & Prompt Guide Compliance Skill (CRITICAL PROMPT SKILL):**
     1. **LẬP TRÌNH CHÍNH XÁC THEO MÔ-ĐUN YÊU CẦU:** AI phải tham chiếu file [PROMPT_GUIDE_MODULES.md](file:///Users/peggy2402/Projects/eigu-platform/PROMPT_GUIDE_MODULES.md) và [MODULES_PROJECT.md](file:///Users/peggy2402/Projects/eigu-platform/MODULES_PROJECT.md) để xác định đúng mã `tabKey` (ví dụ `cut`, `reup`, `tk-tiktok`, `chat-support`) và các file mã nguồn liên quan.
     2. Mọi chỉnh sửa chỉ được tác động chính xác vào đúng mô-đun được chỉ định, tuyệt đối KHÔNG làm ảnh hưởng tác dụng phụ (side effects) tới các mô-đun hoặc phân hệ khác trong hệ thống.
   - **Cross-Platform Dual OS Compatibility Skill (Windows & macOS) (CRITICAL CROSS-PLATFORM SKILL):**
     1. **TƯƠNG THÍCH 100% TRÊN CẢ WINDOWS VÀ MACOS (PRODUCTION READY):** Tất cả mã nguồn (Desktop Electron, Node.js, FFmpeg, File System, Shell) phải hoạt động hoàn hảo trên cả 2 hệ điều hành Windows và macOS.
     2. **Chuẩn hóa Đường Dẫn (Path Normalization):** TUYỆT ĐỐI KHÔNG hardcode dấu `/` kiểu Unix hay `\` kiểu Windows hoặc đường dẫn cố định `/tmp`. Luôn sử dụng module `path` của Node.js (`path.join()`, `path.resolve()`) và API native Electron (`app.getPath('downloads')`, `app.getPath('temp')`, `os.tmpdir()`).
     3. **Tự Động Nhận Diện HĐH & Encoders (OS Detection):** Sử dụng `process.platform === 'win32'` (Windows) và `process.platform === 'darwin'` (macOS) để quyết định bộ mã hóa video phù hợp (`hevc_videotoolbox` / `h264_videotoolbox` trên macOS vs `libx264` / `h264_nvenc` / `h264_amf` / `libx265` trên Windows).
     4. **Mở Thư Mục & Tương Tác Native OS:** Sử dụng `shell.openPath()` của Electron để mở cửa sổ native File Explorer trên Windows và Finder trên macOS. Xử lý đường dẫn file binary (`@ffmpeg-installer`, `youtube-dl-exec`) tương thích động theo từng kiến trúc CPU/OS (`win32-x64`, `darwin-arm64`, `darwin-x64`).
3. **Moi truong Development / Production:**
   - **Backend (`apps/api`):**
     - Su dung `Logger` tu `@nestjs/common` (khong dung `console.log`).
     - Debug logs duoc ghi o level `debug`, chi hien thi trong moi truong development.
     - Production chi ghi log o level `warn` va `error`.
   - **Frontend (`apps/web`, `apps/desktop`, `apps/mobile`):**
     - Luon luon hien thi UI than thien voi nguoi dung.
     - Khong duoc dung `console.log` trong production code.
     - **Desktop:** Dung `addLog()` de hien thi log o UI console cho nguoi dung.
     - **Mobile:** Dung `debugPrint()` (tu `flutter/foundation.dart`) thay vi `print()` - debugPrint chi chay trong debug mode.
4. **Co che hoat dong cua Nx:**
   - Khong duoc dung cac lenh `npm start` hay `npm run dev` thong thuong.
   - Lenh chay: `npx nx serve <app_name>`.
   - Voi Web Next.js: `npx nx dev web`.
   - Rieng Desktop (Electron) da duoc tinh chinh cau hinh `serve` trong `project.json` de chay thang lenh `npx electron`.
5. **WebSocket:** Luong du lieu giua API, Web, Desktop va Mobile dua hoan toan vao kien truc Event-driven qua Socket.io-client.

## 3. Trang thai Hien tai (Checkpoint)
- Da hoan thanh Giai doan 1: **Prototype End-to-End**.
- Luong da thong tu luc nguoi dung keo tha file o Desktop -> Nhan tin IPC -> Node.js gia lap goi FFmpeg -> Mo Chromium (Puppeteer) -> Bao cao % tien do len API Gateway -> Phan hoi thoi gian thuc ra bieu do React Flow o Web Dashboard.

## 4. Muc tieu tiep theo
- Trieu khai thuat toan xu ly FFmpeg that (Decimation, Noise Injection).
- Viet kich ban Puppeteer phuc tap hon: Fake Fingerprint, vuot Captcha, tu dong dien form Upload TikTok.
- Thiet ke co so du lieu (Database) tren API de luu lai lich su cac video da upload.
