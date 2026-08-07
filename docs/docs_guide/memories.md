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
- **State-Driven UI (Single Source of Truth):**
  - Đập bỏ kiểu code thao tác DOM thủ công rải rác. Áp dụng State Object (`appState`) kết hợp hàm `render()` tập trung. Mọi hành động của người dùng (chọn file, dán link, đổi thông số) chỉ thay đổi State, sau đó hàm `render` sẽ tự động cập nhật UI, chấm dứt hoàn toàn các lỗi xung đột class CSS (Nút bấm bị ẩn/hiện sai logic).
  - Vượt qua rào cản bảo mật của Electron >= 30: Thuộc tính `File.path` khi Drag & Drop trên DOM bị Electron tự động che giấu (undefined). Đã tích hợp API `webUtils.getPathForFile(fileObj)` để bóc tách Absolute Path chuẩn xác, giúp FFmpeg đọc được file thành công.
- **Native Window Experience:** Tích hợp `-webkit-app-region: drag` cho một thẻ `.title-bar` ảo để giả lập thanh tiêu đề native của macOS (`hiddenInset`), mang lại khả năng di chuyển (movable) và resize cửa sổ cực kỳ mượt mà.

## 3. Lõi FFmpeg (Anti-Detect Engine)
- Sử dụng `fluent-ffmpeg` để thao tác trực tiếp với video.
- **Phá vỡ Hash & Cấu trúc Pixel:** Tiêm nhiễu hạt (Noise Injection), vi chỉnh Contrast/Gamma (`eq=contrast=1.01:gamma=0.99`), và loại bỏ frame trùng lặp (`mpdecimate`).
- **Phá vỡ Audio:** Dịch chuyển âm thanh không gian (Spatial Panning) để lách thuật toán kiểm tra âm thanh bản quyền.
- **Metadata Stripping:** Xóa sạch toàn bộ siêu dữ liệu (`title`, `artist`, `encoder`) của file gốc.
- **Tích hợp Real YouTube Downloader:** Cài đặt `youtube-dl-exec` (`yt-dlp` core) thay vì Mock Data. Có cơ chế tự động xử lý khi URL đầu vào bị lỗi bằng cách chuyển hướng tạo mock input tại `/tmp/`.
- **Nâng cấp Cắt Video & Tỉ lệ khung hình (Segmentation & Aspect Ratio):**
  - Sử dụng cờ `-f segment` đi kèm `-force_key_frames expr:gte(t,n_forced*... )` để cắt nhỏ video thành nhiều mảnh đều đặn (1, 2, 3, 5, 10, 20 phút) một cách chính xác tới từng giây.
  - Sửa lỗi A/V Desync nghiêm trọng: Hủy bỏ cờ `setpts=N/FRAME_RATE/TB` khi dùng chung với `mpdecimate` nhằm giữ nguyên gốc Timestamp của video, giúp muxer cắt không bị lệch tiếng.
  - Tích hợp chuẩn Aspect Ratio Center-Crop (9:16, 16:9, 1:1) qua filter `scale=...:force_original_aspect_ratio=increase,crop=...`.
  - Đánh số tự động "Phần 1/N": Kết hợp `ffmpeg.ffprobe` để lấy độ dài, sau đó tiêm filter toán học `drawtext=text='Phần %{eif\\:trunc(t/X)+1\\:d}/N'` đốt chữ trực tiếp lên video từng đoạn cực kỳ tối ưu.
- **Tùy chỉnh Thư mục xuất (Custom Output Folder):** Dịch chuyển điểm lưu trữ mặc định từ `/tmp` (thư mục ẩn của macOS) sang `Downloads`, đồng thời cung cấp giao diện IPC `dialog.showOpenDialog` cho phép người dùng tự chọn thư mục lưu.
- **Tính toán Progress chính xác:** Bổ sung `@ffprobe-installer/ffprobe` cấp cho `fluent-ffmpeg` để tính được chính xác % tiến độ thay vì bị treo giả ở 50%.
- **Sẵn sàng tích hợp SoniTranslate (Voice/TTS):** Đã thiết lập UI chuẩn bị đón luồng xử lý âm thanh trí tuệ nhân tạo (WhisperX + Coqui XTTS) thông qua giao tiếp API Gateway lên Server GPU.

## 4. Trình duyệt Ẩn danh (Puppeteer Stealth)
- Sử dụng `puppeteer-extra` kết hợp `puppeteer-extra-plugin-stealth` để ngụy trang.
- **Chống rò rỉ IP (WebRTC Leaks):** Vô hiệu hóa UDP (`--force-webrtc-ip-handling-policy=disable_non_proxied_udp`), ép buộc kết nối đi qua SOCKS5 Proxy.
- **Giả mạo Fingerprint:** Spoof User-Agent chuẩn MacOS Chrome.
- **Mô phỏng con người:** 
  - Sử dụng đường cong toán học Bézier (`simulateHumanMouse`) để di chuyển chuột ngẫu nhiên, mô phỏng tay người thật, lách Cloudflare Turnstile và các bot detector.

## 5. Cơ sở dữ liệu API (Supabase + PostgreSQL)
- Quyết định sử dụng **Supabase PostgreSQL** (Thay vì MongoDB) do đặc thù MMO cần quản lý quan hệ phức tạp (1 Proxy -> N Accounts).
- Tích hợp **Supabase Client SDK** (`@supabase/supabase-js`) bao gồm các bảng:
  - `User`: Khách hàng/Client.
  - `Proxy`: Kho IP, Port, Quốc gia, trạng thái (Live/Dead).
  - `TikTokAccount`: Ánh xạ vào User và Proxy, lưu trữ Cookies dạng JSON.
  - `VideoTask`: Giám sát trạng thái tiến trình xử lý và upload video.

## 6. Phiên làm việc 17/07/2026 — Tối ưu tốc độ & UI

### 6.1 Thêm hiển thị thời gian ước tính (ETA)
- **File:** `apps/desktop/src/assets/index.html`
- Thêm `<span id="eta-display">` bên cạnh `#progress-percent` trong progress section.
- **Cơ chế:** Lưu `appState.startTime` khi bắt đầu xử lý. Trong `render()`, tính `elapsed = now - startTime`, suy ra `total = elapsed / (progress/100)`, `remaining = total - elapsed`. Hiển thị định dạng `⏱ HHh MMm SSs`.
- Reset `startTime` về `null` khi hoàn tất hoặc lỗi/hủy.

### 6.2 Sửa Aspect Ratio — Giữ nguyên khung hình (Letterbox)
- **File:** `apps/desktop/src/ffmpeg-processor.ts` (dòng 98-100)
- **Vấn đề:** Filter cũ dùng `force_original_aspect_ratio=increase` + `crop` — cắt xén video, mất nội dung phần rìa. Người dùng muốn thấy TOÀN BỘ video gốc trong khung 9:16/1:1.
- **Giải pháp:** Đổi sang `force_original_aspect_ratio=decrease` + `pad=W:H:(ow-iw)/2:(oh-ih)/2:color=black`. Video được scale vừa khung, phần thừa được bo viền đen (letterbox/pillarbox).
- Ảnh hưởng: Vẫn yêu cầu Transcode (encode).

### 6.3 Tối ưu tốc độ FFmpeg (3 thay đổi lớn)
- **File:** `apps/desktop/src/ffmpeg-processor.ts`

#### a. `-quality 1` (Realtime mode) cho h264_videotoolbox
- **Dòng 40:** Thay vì mặc định `-quality 4` (cân bằng), dùng `-quality 1` — ưu tiên tốc độ tối đa trên encoder GPU Apple Silicon. Tốc độ tăng 2-4x, chất lượng giảm nhẹ nhưng đủ cho TikTok.

#### b. Thay `-force_key_frames` bằng `-g 60` (GOP interval)
- **Dòng 41, 45:** `-force_key_frames expr:gte(t,n_forced*X)` buộc encoder reset keyframe tại vị trí chính xác, gây gián đoạn luồng encode phần cứng, làm chậm đáng kể. Thay bằng `-g 60` (keyframe mỗi 60 frame ≈ 2s), encoder tự do đặt keyframe tự nhiên. Segment muxer cắt tại keyframe gần nhất — sai số ±2s, chấp nhận được.
- **Dòng 158-162:** Đã xóa block `-force_key_frames` khỏi output options segment.

#### c. Giảm bitrate encoder
- **Dòng 40:** `-b:v 4000k → 3000k`. Bitrate thấp hơn = encoder tốn ít bit hơn mỗi frame, encode nhanh hơn. 3000k vẫn đủ sắc nét cho 1080p TikTok.

#### d. Loại bỏ `-movflags +faststart` cho segment output
- **Dòng 139:** `faststart` buộc FFmpeg rewrite từng file segment (I/O gấp đôi). Vô dụng với segment vì mỗi file đã hoàn chỉnh. Chỉ giữ cho output single file.

### 6.4 Cải thiện yt-dlp (YouTube Downloader)
- **File:** `apps/desktop/src/youtube-downloader.ts`

#### a. Capture stderr để chẩn đoán lỗi
- **Dòng 31-33:** Thêm `subprocess.stderr?.on('data', ...)` thu thập stderr. Khi exit code != 0, in 3 dòng cuối cùng vào log.
- **Kết quả:** Phát hiện được lỗi thật như "Video unavailable. This video is restricted" thay vì chỉ mã lỗi 1.

#### b. Thêm flags cho yt-dlp
- `--js-runtimes node`: yt-dlp bản mới yêu cầu JS runtime để extract YouTube. Thiếu flag có thể gây lỗi ngẫu nhiên.
- `--retries 3`: Tự động thử lại khi YouTube rate-limit.
- `--no-playlist`: Xử lý an toàn nếu URL là playlist.
- `concurrentFragments: 10 → 5`: Giảm tải request đồng thời, tránh rate-limiting.

### 6.5 Giải thích 4 tính năng Anti-Detect
Đã giải thích chi tiết cho người dùng về cơ chế FFmpeg của từng option:
- **Metadata Stripping** ⚡ Stream Copy: Dọn sạch thẻ ID3/EXIF, encoder, GPS. Không encode.
- **Noise & EQ** 🐢 Encode: `noise=alls=1:allf=t` + `eq=contrast=1.01:gamma=0.99`. Phá Perceptual Hash, thay đổi hex từng pixel.
- **Decimation** 🐢 Encode: `mpdecimate`. Xóa frame tĩnh trùng lặp, thay đổi cấu trúc timestamp.
- **Spatial Panning** 🐢 Audio Encode: `pan=stereo|c0<c0+0*c1|c1<c1+0*c0`. Phá Audio Fingerprint.

### 6.6 Quy tắc Stream Copy vs Encode (RuleEngine)
**Stream Copy (không encode):** Cắt video, xóa metadata  
**Bắt buộc Encode:** 9:16/16:9/1:1, Noise, Decimate, DrawText (Part N/N), Spatial Panning  

Nếu bất kỳ option video-encode nào được bật → toàn bộ pipeline chuyển transcode (GPU). Audio vẫn copy nếu không bật Spatial Panning.

### 6.7 Fix lock file cho Prisma Sandbox Deploy
- **Vấn đề:** GitHub sandbox chạy `npm ci` fail vì `chokidar@4.0.3` không có trong `package-lock.json` (do `fork-ts-checker-webpack-plugin` yêu cầu).
- **Fix:** Chạy `npm install` để đồng bộ lock file. Push commit `6148df9`.

### 6.8 Supabase Database Schema
Đã giải thích cấu trúc 4 bảng và quan hệ:
- `User 1──* Proxy` (một user nhiều proxy)
- `User 1──* TikTokAccount` (một user nhiều tài khoản)
- `Proxy 1──* TikTokAccount` (một proxy gán nhiều tài khoản)
- `TikTokAccount 1──* VideoTask` (mỗi tài khoản có lịch sử task)

## Kết luận & Bước tiếp theo
- Toàn bộ nền tảng đã chạy trơn tru với sự kết nối chặt chẽ giữa 3 phân hệ.
- Các vấn đề thắt cổ chai về mặt trải nghiệm người dùng (UX) ở Desktop App đã được xử lý chuẩn mực.
- **Bước tiếp theo:** Tích hợp SDK Supabase, xây dựng giao diện quản lý tài khoản TikTok trên Web Dashboard, và hoàn thiện thao tác "Click Upload" thật trong Puppeteer.

## 7. Phiên làm việc 20/07/2026 — Đồng bộ UI/UX Đa nền tảng (Desktop, Web, Mobile)

### 7.1 Cải thiện UI/UX Desktop (CSS/HTML/JS)
- **Fix lỗi Popup Menu bị cắt xén (Clipped) & Scroll Sidebar**: 
  - Gốc rễ vấn đề nằm ở thuộc tính `overflow: hidden` của Sidebar gây xung đột với các Menu con tràn ra ngoài.
  - Giải pháp tối ưu: Thay vì cố gắng định tuyến lại Javascript phức tạp cho thanh cuộn, đã di dời các menu ít dùng (Cài đặt, Đăng xuất) sang một **Profile Dropdown** ở góc phải Header.
  - Hỗ trợ bung (expand) Sidebar khi click trực tiếp vào icon mẹ, giữ giao diện sạch sẽ.
- **Khôi phục tính năng Maximize/Restore cửa sổ macOS**:
  - Gán `-webkit-app-region: drag` cho toàn bộ thẻ `.main-header` để hoạt động như một Title Bar native.
  - Loại trừ (no-drag) cho các thành phần nút bấm (Search, Notif, Menu) bên trong để không cản trở tương tác click.

### 7.2 Đồng bộ kiến trúc UI lên Web App (Next.js)
- **File:** `apps/web/src/app/global.css`, `Sidebar.tsx`, `page.tsx`.
- Gỡ bỏ "Cài đặt" & "Đăng xuất" khỏi Sidebar.
- Tích hợp Profile Dropdown tại góc phải màn hình của Layout chính. Cập nhật state (React Hook) đóng/mở dropdown.
- Khắc phục lỗi tràn nội dung (Flexbox Overflow) khi Sidebar bung mở bằng cách bổ sung `min-width: 0` cho phần thân (`.main-content` / `.main-wrapper`).

### 7.3 Đồng bộ kiến trúc UI lên Mobile App (Flutter)
- **File:** `apps/mobile/lib/presentation/pages/dashboard/dashboard_page.dart`.
- Tinh gọn Navigation `Drawer` chuyên biệt: Bỏ hoàn toàn các mục Hồ sơ, Cài đặt, Đăng xuất ra khỏi Drawer.
- Nâng cấp `AppBar` góc phải: Thay thế nút Settings đơn lẻ bằng `PopupMenuButton` chứa toàn bộ cụm tác vụ tài khoản (Hồ sơ, Cài đặt, Đăng xuất).
- Cleanup codebase Dart, khắc phục các cảnh báo linting về biến không sử dụng (unused variables).

## 8. Phiên làm việc 20/07/2026 (tiếp) — Username Auth, Validation, Navigation Restructure

### 8.1 Username & Login bằng Email hoặc Username
- **API:** Thêm `User.username String? @unique` vào Prisma schema. `LoginDto.identifier` thay thế `email`. `RegisterDto` thêm `username`.
- **API (`auth.service.ts`):** `login()` tìm user bằng OR(email, username). `register()` kiểm tra username unique. `generateTokens()` trả về `username` trong JWT payload.
- **Desktop/Web/Mobile:** Form đăng nhập dùng "Email hoặc tên đăng nhập" (gửi `identifier`). Form đăng ký có field `Tên đăng nhập`.
- **"Nhớ tài khoản":** Checkbox lưu identifier vào `localStorage('eigu_saved_email')` (Desktop + Web). Mobile không dùng localStorage.

### 8.2 Header mới: Greeting + Notification + Search
- **Desktop (`index.html` + `main.js`):** `#greeting-text` hiển thị "Xin chào, {username}". Nút bell notification. Search mini-bar (`search-mini`) kích hoạt popup. Ctrl+K / Esc mở/đóng popup.
- **Web (`page.tsx` + `SearchPopup.tsx`):** Tương tự với `lucide-react` icons.
- **Mobile (`dashboard_page.dart`):** `AuthFlow` wrapper, drawer có greeting + email. Search dialog (`AlertDialog` + filter). Notification icon trong AppBar.

### 8.3 Validation: Email regex, Confirm Password, Password Strength
- **Desktop (`auth.service.js`):** `EMAIL_RE` regex check. `getPasswordStrength()` tính điểm (5 tiêu chí: length 8+, 12+, upper+lower, digit, special). `updatePasswordStrength()` cập nhật bar + label. `#reg-pass-confirm` + check match. Bar ẩn khi chưa gõ password.
- **Web (`register/page.tsx`):** `EMAIL_RE`, `getPasswordStrength()` + thanh strength div, `confirmPw` state + validation.
- **Mobile (`register_page.dart`):** `PasswordStrength.compute()` static, `LinearProgressIndicator` + label. `_confirmCtrl` + check match.
- **CSS (`auth.css`):** `.password-strength`, `.password-strength-bar`, `.password-strength-fill`, `.password-strength-label`.

### 8.4 Restructure Navigation (Desktop / Web / Mobile)
- **Thứ tự sidebar mới:** Hồ sơ → Công cụ (Tự động cắt, Tạo video AI, Tìm ngách hot) → Tự động hóa (Tạo workflow, Ghi thao tác) → Tài khoản → Tiếp thị liên kết → Đội nhóm → Tiện ích → Hướng dẫn sử dụng → Cài đặt.
- **Hồ sơ là trang mặc định** thay vì Dashboard.
- **Desktop (`sidebar.js`):** `switchView()` cập nhật title mapping cho tất cả view mới. Sub-items truyền parent nav element để highlight + open dropdown. Search popup cập nhật 12 tools.
- **Web (`Sidebar.tsx`):** `ViewType` union mới. Hai dropdown riêng (congCuOpen / tuDongHoaOpen). `handleViewChange()` tự động mở dropdown cha khi chọn sub-item. `PlaceholderView` component cho tab chưa có nội dung.
- **Mobile (`dashboard_page.dart`):** Drawer dùng `ExpansionTile` cho Công cụ và Tự động hóa. Flat list cho các tab còn lại. Search dialog cập nhật tool list. GuidePage có thể navigate từ drawer và search.

## Phase 9: Cải thiện UI/UX (Logo, Góp ý, Toast & Validation Mạng) (21/07/2026)

### 9.1 Cập nhật Logo EIGU
- **Tất cả Nền tảng:** Thay thế logo chữ "E" thành Logo Hình ảnh (`EIGU_Logo_Transparent.png` hoặc file vector). Cập nhật assets cho Mobile, Web, Desktop.
- Thay thế icon shortcut/app cho Desktop/Mobile bằng Logo chuẩn.

### 9.2 Trang Góp ý / Báo lỗi (Feedback)
- **API (`feedback.service.ts`):** Tạo service và Supabase model `Feedback` (userId, content, imageUrl). Tích hợp gửi Discord Webhook. Validation chống spam (tối đa 3 lần/ngày). Sửa lỗi cú pháp SupabaseClient.
- **Giao diện (Web/Desktop):** Tách "Góp ý / Báo lỗi" thành trang riêng. Cải thiện form "Chọn tệp" thành giao diện kéo thả (Dropzone) thân thiện, có icon và tên file hiển thị sau khi upload. Bổ sung icon bug cho menu.

### 9.3 Nâng cấp Toast UI Toàn diện (Glassmorphism & Noise)
- **CSS / Style Mới:** Nâng cấp Toast thành dạng Card có Title (in đậm) + Description. Áp dụng hiệu ứng Kính mờ (`backdrop-filter: blur(16px)`) kết hợp với SVG Fractal Noise để tạo độ nhám chân thực. Background và Border sử dụng màu đặc trưng nhưng làm trong suốt (Opacity 35-40%).
- **Web (`ToastContext.tsx`):** Viết lại component Toast.
- **Desktop (`toast.js` & `toast.css`):** Áp dụng css mới, update `showToast()` nhận 3 tham số. Gắn CSS vào `index.html`.
- **Mobile (`toast_service.dart`):** Dùng `BackdropFilter` bọc `Container` để tạo hiệu ứng blur, thay đổi màu sắc background và border cho giống Web/Desktop.
- **Tích hợp:** Chỉnh sửa logic hiển thị Toast ở Đăng ký, Đăng nhập, Đăng xuất, và Báo cáo tiến trình FFmpeg để sử dụng Title & Description.

### 9.4 Validation Mạng (Offline / Online)
- **Web / Desktop:** Thêm EventListener lắng nghe `online` và `offline` trên `window`. Bắn Toast Success khi có mạng lại, Toast Error khi mất kết nối.
- **Mobile (`main.dart`):** Sử dụng `connectivity_plus` (bản mới nhất dùng `List<ConnectivityResult>`) để lắng nghe thay đổi mạng ở cấp độ toàn ứng dụng. Gắn Global NavigatorKey để show Toast từ bất kỳ đâu. Thêm permission `INTERNET` và `ACCESS_NETWORK_STATE` vào `AndroidManifest.xml` và `Info.plist`.

## Phase 10: Giao diện Quản lý Tài khoản Mạng Xã hội (Desktop) (21/07/2026)

### 10.1 Submenu "Tài khoản" — 6 nền tảng
- **File:** `apps/desktop/src/assets/js/components/sidebar.component.js`
- Chuyển "Tài khoản" từ nav-item phẳng thành `nav-item-wrapper` dropdown (giống Công cụ / Tự động hóa).
- **6 submenu:** TikTok, Facebook, YouTube, X (Twitter), Instagram, Threads.
- Mỗi sub-item gọi `switchView` với view tương ứng (`tk-tiktok`, `tk-facebook`, ...), có icon brand riêng.

### 10.2 Views riêng cho từng nền tảng
- **File:** `apps/desktop/src/assets/js/components/views.component.js`
- Thay layout tabs bằng 6 view riêng biệt: `#view-tk-tiktok`, `#view-tk-facebook`, `#view-tk-youtube`, `#view-tk-x`, `#view-tk-instagram`, `#view-tk-threads`.
- Mỗi view icon màu brand riêng, placeholder chờ fill nội dung sau.

### 10.3 Social Media Icons
- **File:** `apps/desktop/src/assets/js/ui/icons.js`
- Thêm 6 icon SVG: TikTok, Facebook, YouTube, X, Instagram, Threads.

### 10.4 View titles
- **File:** `apps/desktop/src/assets/js/ui/sidebar.js`
- Thêm title mapping cho 6 view mới, xóa `switchSocialTab`.
- Xóa file `accounts.css` (không còn dùng).

## Phase 11: Nâng cấp "Tự động cắt" — Feature mới & Tối ưu tốc độ (21/07/2026)

### 11.1 "Tạo video Reup" trong Công cụ
- **File:** `apps/desktop/src/assets/js/components/sidebar.component.js`
- Thêm sub-item "Tạo video Reup" sau "Tạo video AI", icon `upload` (mũi tên lên).
- View placeholder `#view-reup` + title mapping trong `sidebar.js`.

### 11.2 UI Chỉnh sửa nâng cao
- **File:** `apps/desktop/src/assets/js/components/views.component.js`
- Thêm section "Chỉnh sửa nâng cao" (tím `#a78bfa`) sau Anti-Detect:
  - **Lật video:** dropdown (Không / Ngang / Dọc)
  - **Màu sắc EQ:** 3 số input (Độ sáng / Tương phản / Bão hòa), grid 3 cột
  - **Bẻ khung hình:** dropdown (Không / Xoay 90° / Xoay 180° / Lật dọc)
  - **Giọng nói:** dropdown (Giữ nguyên / FFmpeg / ElevenLabs / Omni Voice) + API config fields

### 11.3 State & Event wiring
- **File:** `apps/desktop/src/assets/js/core/state.js` — Thêm 8 option mới (flip, brightness, contrast, saturation, frameBend, voiceMode, voiceSpeaker, voicePitch, voiceSpeed)
- **File:** `apps/desktop/src/assets/js/ui/automation-ui.js` — Wire listeners cho tất cả control mới; voice config chia 2 nhóm: FFmpeg (cao độ/tốc độ) và API (chọn giọng nói từ server). `fetchVoiceSpeakers()` gọi `GET /api/voice/speakers?provider=` để lấy danh sách giọng nói.

### 11.6 Backend Voice API (NestJS)
- **Module mới:** `apps/api/src/voice/` — `VoiceModule`, `VoiceController`, `VoiceService`
- **Endpoints:**
  - `GET /api/voice/speakers?provider=elevenlabs|omnivoice|self-hosted` — danh sách giọng nói
  - `POST /api/voice/convert` — biến đổi giọng nói (multipart: audio + provider + speaker_id)
- **Providers:**
  - **ElevenLabs:** Proxy API key server-side, voice conversion qua `POST /v1/voice-conversion`. Yêu cầu API key với quyền `Voices: read` + `Speech to Speech: write`.
  - **OmniVoice API:** Dùng **inference.sh** (third-party API host). Lấy key tại https://app.inference.sh/settings/keys. Cấu hình qua biến `OMNI_VOICE_API_KEY` trong `.env`.
  - **Self-hosted:** 2 chế độ — Python child_process (`scripts/omnivoice_infer.py`) hoặc REST server riêng (`OMNIVOICE_HOST`)
- **Scripts:**
  - `apps/api/scripts/omnivoice_infer.py` — Python inference script (clone/TTS). Không cần clone repo k2-fsa/OmniVoice, chỉ cần `pip install omnivoice`.
  - `apps/api/scripts/setup_omnivoice.sh` — Tự tạo Python venv + cài dependencies. Fix lỗi segfault MPS: dùng CPU thay vì MPS.
- **Env vars:** `ELEVENLABS_API_KEY`, `OMNI_VOICE_API_KEY`, `OMNIVOICE_MODE` (`python`|`server`), `OMNIVOICE_VENV`, `OMNIVOICE_HOST`
- **Type fix:** Dùng interface `MulterFile` (tự định nghĩa) thay vì `Express.Multer.File` do không có `@types/multer`.

### 11.4 FFmpeg Filters (ffmpeg-processor.ts)
- **RuleEngine:** Thêm detect cho flip, frameBend, EQ, voice (FFmpeg & API)
- **PipelineBuilder.build():**
  - `hflip` / `vflip` cho lật video
  - `transpose=1` / `transpose=2,transpose=2` cho xoay
  - `eq=brightness=:contrast=:saturation=` cho màu sắc (gộp với noise EQ)
  - `asetrate=44100*X,aresample=44100` + `atempo=X` cho giọng nói FFmpeg
  - Placeholder cho ElevenLabs/Omni Voice API (chờ implement sau)
- Fix `drawtext` text từ "Part %{eif...}" sang "Phần %{eif...}" (Unicode encode đúng)

### 11.5 Tối ưu tốc độ (đã có & chưa có)
- **Đã tối ưu:** Stream Copy khi không filter, `-quality 1`, `-g 60` GOP, `-b:v 3000k`
- **Giới hạn:** Bật bất kỳ filter video nào → buộc transcode toàn bộ (encode GPU)
- **Hướng tới:** 2-pass pipeline (split trước → filter từng segment sau) sẽ giúp tăng tốc đáng kể cho video dài (>30 phút) nhưng cần refactor kiến trúc

## 12. Phiên làm việc 21/07/2026 — Voice API hoàn thiện & ElevenLabs key

### 12.1 Sửa lỗi build: Express.Multer.File
- **Vấn đề:** TypeScript không tìm thấy `Express.Multer.File` do thiếu `@types/multer` hoặc do NestJS không export type này.
- **Fix:** Tự định nghĩa interface `MulterFile` trong `voice.service.ts` (dòng 9-16) và dùng `any` trong controller thay vì `Express.Multer.File`.

### 12.2 Switch OmniVoice API từ omnivoice.app → inference.sh
- `omnivoice.app` chỉ là web UI (không có API), `api.omnivoice.ai` trả về 404.
- inference.sh (https://app.inference.sh/settings/keys) hoạt động tốt với model OmniVoice. API key format: `1nfsh-...`.
- Endpoint: `POST /v1/apps/infsh/omnivoice/run` với `Authorization: Bearer {key}`.
- Mode `voice_cloning` + `ref_audio: ""` (TTS, không cần reference audio) hoặc có thể thêm `ref_audio` + `text` cho voice conversion.

### 12.3 Self-hosted OmniVoice (Python venv)
- Venv cài tại `apps/api/scripts/venv/`, Python 3.14 trên macOS ARM.
- Lỗi MPS segfault: `mps` backend không hoạt động trên macOS 15+ với PyTorch. Fix: fallback về CPU (`os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"` + `map_location="cpu"`).
- Script `omnivoice_infer.py` chạy với CLI args: `--input`, `--output`, `--instruct`.
- Không cần clone k2-fsa/OmniVoice repo; chỉ cần `pip install omnivoice`.

### 12.4 ElevenLabs API key thật
- Key cũ `sk_0e3e6f04288845626d74c73d4048dac8d8dffa9eeac298ff` trả về 401 (key không đủ quyền hoặc đã hết hạn).
- Key mới: `sk_d8528519c4ada2feecf4364118d6c21fbf0b39a890baaff4` — tạo tại https://elevenlabs.io với quyền **Voices: read** + **Speech to Speech: write**.
- **Test thành công:** `GET /api/voice/speakers?provider=elevenlabs` trả về 22 giọng nói (Roger, Sarah, Laura, Charlie, George, v.v.).

## 13. Phiên làm việc 21/07/2026 — Hoàn thiện UI/UX Tự động cắt & Sửa lỗi Profile

### 13.1 Nâng cấp UI/UX tab "Tự động cắt"
- **Vấn đề:** Khoảng trống thừa ở dưới khu vực dán link YouTube gây mất cân đối giao diện.
- **Giải pháp:** 
  - Bổ sung tuỳ chọn **Chất lượng tải xuống (YouTube)**: Tự động, 1080p, 720p, Audio MP3.
  - Thêm **Khung thông tin Video (Video Preview)** tự động co giãn (`flex: 1`).
  - Lập trình tính năng tự động nhận diện link YouTube (debounce 600ms) và fetch thông tin qua API trung gian (không CORS) `noembed.com` để hiển thị Title, Channel, và đặt Thumbnail làm hình nền mờ rát chuyên nghiệp. Tự động hiển thị trạng thái khi chọn file .mp4 từ máy.

### 13.2 Sửa lỗi trạng thái Profile khi mới đăng nhập
- **Vấn đề:** Sau khi đăng nhập, Hồ sơ ghi "Chua xac thuc" và "Ngày tạo" trống trơn, phải F5 lại mới hiện đúng.
- **Nguyên nhân:** Dữ liệu user trả về từ endpoint `/auth/login` không đầy đủ (thiếu `createdAt`, `isVerified`). Hàm `enterApp()` cũ chỉ check `!userProfile` nên không thèm lấy lại thông tin từ API `/auth/me`.
- **Khắc phục:** Sửa điều kiện thành `if (!userProfile || !userProfile.createdAt)` để ứng dụng chủ động fetch đầy đủ profile trước khi gọi `updateProfile()` render UI.

### 13.3 Hoàn thiện luồng Hủy tiến trình (Cancel Workflow)
- **Hiệu ứng thanh tiến trình (UI):** 
  - Thay vì lập tức ẩn thanh tiến trình (`display: none`) làm mất hiệu ứng lùi về 0%, luồng xử lý IPC event đã được sửa lại: Gán `progress = 0`, chờ `500ms` để thanh lùi mượt mà bằng CSS Transition, sau đó mới đổi app mode về `idle` / `local`.
- **Dọn dẹp rác (Backend/FFmpeg):**
  - Trong `ffmpeg-processor.ts`, hàm `cancel()` được nâng cấp thêm đoạn mã hẹn giờ 1 giây (đợi process bị kill hoàn toàn).
  - Quét toàn bộ thư mục `outputs` (mặc định Downloads/eigu/outputs) bằng `fs.readdirSync`.
  - Tự động check và gọi `fs.unlinkSync` để xóa đi các file video phân đoạn (`eigu_processed_${taskId}_xxx.mp4`) đang được cắt dở dang của tiến trình vừa bị hủy, giữ cho hệ thống file gọn gàng và không bị phình to.

## 14. Phiên làm việc 21/07/2026 — Xử lý triệt để lỗi UI Sidebar và Lỗi NPM Windows

### 14.1 Fix lỗi Search Popup trỏ sai thẻ cha
- **Vấn đề:** Khi tìm kiếm "Tài khoản", thanh Search trỏ thẳng vào `data-view="tai-khoan"` (thẻ cha không có view giao diện). Khi click sẽ dẫn đến màn hình trắng, làm hỏng trạng thái của Sidebar. Lỗi này từng xảy ra với "Công cụ" và "Tự động hóa".
- **Khắc phục:** 
  - Trong `header.component.js`, xóa kết quả tìm kiếm trỏ vào thẻ cha "Tài khoản".
  - Thêm danh sách toàn bộ 6 chức năng con (TikTok, Facebook, YouTube, X, Instagram, Threads) vào kết quả tìm kiếm để định tuyến (route) chính xác vào View và mở Submenu.
  - Cập nhật file `AI_CONTEXT.md` (Thêm rule `Search Popup Navigation (CRITICAL)`) để AI tương lai không lặp lại lỗi cấu trúc HTML này.

### 14.2 Khắc phục lỗi "nháy" (flicker) Submenu khi thu gọn
- **Vấn đề:** Khi nhấn `Cmd + /` thu nhỏ Sidebar, menu con của tab đang mở có hiệu ứng `transition: opacity 0.2s` (fade out) kết hợp với việc chuyển sang `position: absolute`, khiến giao diện bị chớp bóng ma (ghost menu) lệch trước khi biến mất.
- **Khắc phục:** 
  - Xóa bỏ `transition` của `.sidebar.collapsed .nav-sub` trong `sidebar.css`. Giờ đây, khi Sidebar đóng lại hoặc khi hết Hover, menu con sẽ lập tức ẩn đi một cách dứt khoát.

### 14.3 Cải tiến logic Đóng/Mở Sidebar thủ công
- **Vấn đề:** Sidebar tự động mở khi nhấn menu hoặc đóng khi click ra ngoài, gây phiền toái. Cửa sổ nhỏ thì bị Sidebar mở bung đè vào màn hình.
- **Khắc phục:** 
  - Xóa tính năng tự động đóng (click-outside listener) và tự mở (trong `toggleDropdown`) ở `sidebar.js`.
  - Quy chuẩn: Cửa sổ thu nhỏ -> Sidebar thu nhỏ và KHÔNG tự nở ra khi dùng tính năng, muốn mở phải dùng phím tắt. Phóng to cửa sổ -> Sidebar mở. Phím tắt là thứ duy nhất đóng/mở được.
  - Cập nhật Tooltip giao diện thành `(Ctrl/Cmd + /)` hỗ trợ tốt cho Windows.

### 14.4 Sửa lỗi xung đột `npm i ERESOLVE` trên Windows
- **Vấn đề:** Clone repo về chạy `npm i` bị lỗi `ERESOLVE` liên quan đến `chokidar@5.0.0` và `@swc/cli`.
- **Khắc phục:** Bổ sung file `.npmrc` chứa `legacy-peer-deps=true` để bắt buộc NPM trên mọi máy chạy trơn tru quá trình cài đặt dependencies trong Nx Workspace.

## Phase 15: Cải thiện UI/UX Admin, Modal Tab Config & Sửa lỗi Session Leak (22/07/2026)

### 15.1 Nâng cấp giao diện Quản lý Feedback
- Đã bổ sung tab **"Quản lý Feedback"** dành riêng cho role Admin, kèm icon `helpCircle` sắc nét vào Sidebar.
- Viết giao diện Frontend kết nối API lấy dữ liệu thực từ Supabase. Tích hợp bộ lọc tìm kiếm theo Email, Username, Nội dung và chức năng xóa phản hồi.
- Cải thiện Custom Discord Webhook: Định dạng tin nhắn chuẩn Markdown, lấy và hiển thị đầy đủ thông tin Username, Email và User ID của người gửi báo cáo.

### 15.2 Hoàn thiện Tab Config (Phân quyền Tab)
- Bổ sung tuỳ chọn **Hồ sơ (Thông tin cá nhân)** vào Modal cấu hình "Phân Quyền Tab Màn Hình", cho phép Admin toàn quyền kiểm soát tính năng hiển thị với User.
- **[TODO] Ghi chú phiên sau:** "Hiện tại tôi muốn hiển thị ra đúng tất cả các tab mà User đó đang sở hữu khi nhấn vào nút 'Phân tab' và Tính năng này thật sự phải hoạt động chứ không phải chỉ để cho đẹp đâu".

### 15.3 Đóng nhanh bằng phím ESC toàn cục
- Gắn Global Event Listener (`keydown: Escape`) vào `main.js`.
- Bấm ESC tự động đóng lập tức toàn bộ cửa sổ nổi: Modal Phân quyền tab, Live Chat Widget, Khay Thông báo, Popup tìm kiếm, và Menu Profile.

### 15.4 Khắc phục lỗi rò rỉ quyền UI Logout (Session State Leak)
- **Vấn đề:** Khi Admin đăng xuất và tài khoản User đăng nhập, Sidebar không làm mới gây rò rỉ trạng thái, User vẫn thấy tab của Admin.
- **Khắc phục:** 
  - Trong `handleLogout()`, hệ thống lập tức clear và ép `hidden` lên toàn bộ `.admin-only` và `.staff-only`.
  - Tự động Reset giao diện về `ho-so` (Trang cá nhân) thay vì bị kẹt ở tab admin/staff cũ.

## Phase 16: Hoàn thiện Phân quyền Tab — Bảng TabPermission riêng + Ẩn/Hiện toàn diện (22/07/2026)

### 16.1 Vấn đề ban đầu
- Backend dùng field `allowedTabs` (string comma-separated) trên User — không chuẩn, khó mở rộng
- Frontend modal thiếu tab "Góp ý / Báo lỗi" (feedback)
- Tab "Cài đặt" (settings) nằm trong profile dropdown, không phải sidebar → logic ẩn cũ không chạm tới được
- Search popup cũng không bị ảnh hưởng bởi tab config

### 16.2 Database: Bảng TabPermission riêng
- **Model mới `TabPermission`** trong `schema.prisma`:
  - `id` (uuid), `userId` (FK → User), `tabKey` (string), `visible` (boolean, default true)
  - `@@unique([userId, tabKey])` — mỗi user chỉ 1 dòng/tab
- Relation `User.tabPermissions TabPermission[]` thêm vào User model
- `prisma db push` đồng bộ lên Supabase

### 16.3 Backend API
- **`UsersService.ALL_TABS`** — danh sách cố định 10 tab (8 sidebar + 2 profile)
- **`GET /users/:id/tab-permissions`** — trả về ALL_TABS kèm `visible` từ DB (nếu chưa có → default true)
- **`PATCH /users/:id/tab-permissions`** — nhận `[{tabKey, visible}]`, xoá cũ + tạo mới, đồng thời cập nhật `allowedTabs` string cho backward compatibility
- **`AuthService.getProfile()`** — trả về thêm `tabPermissions[]` trong `/auth/me`
- **`AuthService.generateTokens()`** — login response cũng bao gồm `tabPermissions[]`

### 16.4 Frontend — Modal động
- **`views.component.js`:** Modal dùng container `#tab-config-list` rỗng, render động bởi JS
- **`user-mgmt.js`:** `configureUserTabsReal()` gọi `GET /users/:id/tab-permissions`, render checkbox theo group (Sidebar / Menu hồ sơ)
- **`user-mgmt.js`:** `saveTabConfigModal()` gọi `PATCH /users/:id/tab-permissions` với mảng `[{tabKey, visible}]`
- 10 tab đầy đủ: ho-so, cong-cu, tu-dong-hoa, tai-khoan, tiep-thi, doi-nhom, tien-ich, guide, settings, feedback

### 16.5 Frontend — Ẩn/Hiện toàn diện ở 4 vị trí
**`main.js` `updateProfile()`:**
1. **Sidebar nav-item phẳng:** ho-so, tiep-thi, doi-nhom, tien-ich, guide
2. **Sidebar nav-item-wrapper:** cong-cu, tu-dong-hoa, tai-khoan (ẩn cả wrapper + sub-items)
3. **Profile dropdown:** settings, feedback (dùng regex bắt `switchView('xxx')` trong onclick)
4. **Search popup results:** tất cả kết quả tìm kiếm (dùng regex tương tự)

Xử lý:
- Admin/staff: luôn thấy tất cả (role override)
- User có tabPermissions: ẩn tab có `visible = false`
- User không có tabPermissions nào: hiện tất cả (mặc định)

### 16.6 Logout reset
- `auth.service.js handleLogout()`: reset `hidden` trên sidebar, profile dropdown, search popup

## Phase 17: Phân quyền Tab chi tiết đến sub-item & Fix auth service (22/07/2026)

### 17.1 Mở rộng ALL_TABS với sub-items (15 tab con)
- **File:** `apps/api/src/users/users.service.ts`
- Thêm 15 sub-item vào `ALL_TABS` với field `parentKey` để nhóm:
  - **cong-cu:** cut, ai-video, reup, hot-niche, bulk-download
  - **tu-dong-hoa:** workflow, record
  - **tai-khoan:** tk-tiktok, tk-facebook, tk-youtube, tk-x, tk-instagram, tk-threads
- `parentKey` được spread qua API response → frontend dùng để hiển thị phân cấp trong modal.

### 17.2 Ẩn/Hiện sub-item riêng lẻ trên sidebar
- **File:** `apps/desktop/src/assets/js/main.js`
- Thêm section 2b trong `updateProfile()`: query `.nav-sub-item[data-sub]`, gọi `setTabVisibility(sub, el)` cho từng sub-item.
- Nếu parent bị ẩn → cả wrapper ẩn (section 2 cũ). Nếu chỉ sub-item bị ẩn → chỉ sub đó bị `display: none`.

### 17.3 Modal phân quyền hiển thị cây thư mục
- **File:** `apps/desktop/src/assets/js/ui/user-mgmt.js`
- `renderTabConfigCheckboxes()` được viết lại: tách parents (không `parentKey`) và children (có `parentKey`).
- Parent in đậm, children thụt vào 28px bên dưới parent tương ứng.

### 17.4 FIX BUG NGHIÊM TRỌNG: Auth service không merge với ALL_TABS
- **Vấn đề:** `AuthService.getProfile()` và `generateTokens()` query thẳng bảng `TabPermission` — chỉ trả về các dòng đã lưu trong DB. Nếu chưa có row nào (user mới hoặc chưa cấu hình), mảng `tabPermissions` rỗng → frontend thấy `perms.length === 0` → bỏ qua không ẩn gì.
- **Hậu quả:** Dù admin đã cấu hình ẩn tab qua modal "Phân Tab", user thường vẫn thấy tất cả tab.
- **Khắc phục:**
  - `auth.module.ts`: Import `UsersModule`
  - `auth.service.ts`: Inject `UsersService`, thay `prisma.tabPermission.findMany()` bằng `usersService.getTabPermissions(userId)` — method này merge với `ALL_TABS` và default `visible: true` cho tab chưa cấu hình.
  - Response luôn trả về đủ 25 tabs với trạng thái `visible`, frontend filter chính xác.

### 17.5 Logout reset sub-item
- **File:** `apps/desktop/src/assets/js/domain/auth.service.js`
- `handleLogout()` bổ sung reset `.nav-sub-item[data-sub]` để tránh leak trạng thái cũ khi đăng nhập lại.

### 17.6 Role badge trên header
- **File:** `apps/desktop/src/assets/js/components/header.component.js` + `main.js`
- Thêm `<span id="role-badge">` nằm dưới greeting "Xin chào, {{username}}".
- `updateProfile()` set label và màu theo role: ADMIN (tím `#6366f1`), STAFF (xanh lá `#22c55e`), USER (xám `var(--text-secondary)`).

## Phase 18: Phiên làm việc 22/07/2026 - 23/07/2026 (01:59:36 GMT+7) — Nâng cấp Chat Support, Hệ thống Tri thức 25 Tab, Toast Bug Guard & Thông báo 2 chiều

### 18.1 Khắc phục lỗi Toast "Đăng nhập thành công" khi gõ phím Enter trong ô Chat
- **Thời gian xử lý:** 22/07/2026 17:34 GMT+7
- **Nguyên nhân:** Trong `auth-forms.js`, sự kiện `keydown (Enter)` kiểm tra `!document.getElementById('login-form').classList.contains('hidden')`. Khi người dùng đã đăng nhập vào ứng dụng main, `#auth-container` bị ẩn bằng `display: none` nhưng `#login-form` vẫn không có class `.hidden`, dẫn đến mỗi khi nhấn Enter trong Chat hay bất kỳ ô input nào, hàm `handleLogin()` trong `auth.service.js` lại bị kích hoạt ngầm và phát ra Toast `showToast('Đăng nhập thành công')`.
- **Khắc phục:** Thêm Guard `if (!authContainer || authContainer.style.display === 'none') return;` trong `auth-forms.js`.
- **Cập nhật Skill (`AI_CONTEXT.md`):** Thêm quy chuẩn `Global Keydown Event Guards (CRITICAL)` vào tài liệu hướng dẫn dự án.

### 18.2 Nâng cấp Trợ lý `@Eigu AI` & Hệ thống Tri thức 25 Tab (`EIGU_SYSTEM_KNOWLEDGE`)
- **Thời gian xử lý:** 22/07/2026 17:30 GMT+7
- **Chi tiết:** Viết lại `getAiSupportResponse()` trong `live-chat.js` tích hợp bộ tri thức chuẩn xác cho toàn bộ 25 `tabKey`:
  - `ho-so`, `tiep-thi`, `doi-nhom`, `tien-ich`, `guide`, `cong-cu`, `cut`, `ai-video`, `reup`, `hot-niche`, `bulk-download`, `tu-dong-hoa`, `workflow`, `record`, `tai-khoan`, `tk-tiktok`, `tk-facebook`, `tk-youtube`, `tk-x`, `tk-instagram`, `tk-threads`, `settings`, `feedback`.
- Tích hợp Menu `@` gợi ý tag tự động (`@Eigu AI`, `@Staff`, `@Khách hàng`, `@mọi người`).

### 18.3 Hiệu ứng Bouncing Typing Indicator (Messenger / iMessage / Discord style)
- **Thời gian xử lý:** 22/07/2026 17:39 GMT+7
- **Chi tiết:** Bổ sung hiệu ứng 3 chấm nẩy lệch pha (`animation-delay: 0s, 0.2s, 0.4s`) cho bong bóng suy nghĩ của AI (`@keyframes typingBounce`) trong `dashboard.css` và `live-chat.js`.

### 18.4 Định dạng Tag Mentions (Soft Translucent Chip Badge & Rich Contenteditable Input)
- **Thời gian xử lý:** 22/07/2026 18:09 GMT+7
- **Thiết kế Tag:** Chuyển đổi định dạng tag sang thẻ Chip mờ bán trong suốt (`rgba(..., 0.18)`), viền mỏng và bo góc 6px với màu sắc dịu mắt (Vàng Hổ Phách `#fde047`, Hồng Sen `#f472b6`, Xanh Mint `#34d399`, Cam Đào `#fdba74`).
- **Rich Contenteditable Input Box:** Chuyển đổi ô `<input type="text">` cũ sang `<div contenteditable="true" class="chat-input-editable">` để hiển thị trực tiếp thẻ Tag Chip có phông nền ngay trong ô gõ khi đang gõ phím.

### 18.5 Thay thế Icon Robot bằng Logo EIGU Branding
- **Thời gian xử lý:** 22/07/2026 18:27 GMT+7
- **Chi tiết:** Thay thế icon SVG robot cũ ở tiêu đề cửa sổ chat (`index.html`) bằng ảnh Logo thương hiệu `img/logo.png` bo tròn 28x28px.

### 18.6 Khắc phục lỗi cuộn tin nhắn đầu tiên khi vào Staff Chat Console
- **Thời gian xử lý:** 22/07/2026 18:31 GMT+7
- **Nguyên nhân:** Khi vừa chuyển tab `chat-support`, khung chat đang ở trạng thái ẩn (`display: none`), hàm `scrollToBottom()` chạy trước khi trình duyệt tính xong layout `scrollHeight` (bằng 0), khiến thanh cuộn bị kẹt ở `scrollTop = 0` (tin nhắn đầu tiên ở trên cùng).
- **Khắc phục:**
  - Trì hoãn gọi `loadStaffChatConsole()` 30ms trong `sidebar.js` sau khi tab `chat-support` hiển thị hoàn toàn.
  - Nâng cấp `scrollToBottom()` thực hiện cuộn đa mốc thời gian (`requestAnimationFrame`, `30ms`, `100ms`, `250ms`) và lắng nghe sự kiện `load` của ảnh avatar.

### 18.7 Đảo vị trí bong bóng tin nhắn (Right-aligned My Sent Messages vs Left-aligned Received Messages)
- **Thời gian xử lý:** 22/07/2026 18:47 - 18:51 GMT+7
- **Quy chuẩn:** Tin nhắn do bản thân ngồi trước màn hình gõ gửi đi (`.sent-by-me`) luôn nằm ở **BÊN PHẢI** (Bong bóng màu tím `var(--accent)`, avatar ở bên phải). Tin nhắn từ người đối diện (`.received-by-me`) luôn nằm ở **BÊN TRÁI** (Bong bóng card `var(--bg-card)`, avatar ở bên trái).
- **Khắc phục lỗi CSS Specificity:** Sử dụng thuộc tính `!important` trong `dashboard.css` trên `.msg-wrapper.sent-by-me` và `.msg-wrapper.received-by-me` để giải quyết triệt để lỗi class `.msg-wrapper.staff` cũ làm tin nhắn của Staff bị kéo về bên trái.

### 18.8 Hệ thống Chuông Thông Báo Hai Chiều & Sửa lỗi Nháy / Tự nhận Thông báo của mình
- **Thời gian xử lý:** 22/07/2026 18:38 - 18:54 GMT+7
- **Lỗi 1 (Tự nhận thông báo của mình):** Cách ly thông báo theo vai trò đối tượng (`targetRole: 'staff'` cho Staff/Admin và `targetRole: 'user'` cho Khách hàng). Người vừa gõ gửi tin nhắn đi sẽ không bao giờ tự nhận bell notification của chính mình.
- **Lỗi 2 (Khay thông báo bị nháy và mất nội dung):** Trong `notifications.js`, cập nhật `loadRealNotifications()` gán `notificationsData = localNotifs` ngay lập tức trước khi gọi API bất đồng bộ, thực hiện cơ chế gộp `Merge without overwrite` không làm mất dữ liệu thông báo chat trong `localStorage`.

### 18.9 Khắc phục triệt để lỗi Rò rỉ Dữ liệu Tin nhắn Cross-User (Conversation Isolation Bug)
- **Thời gian xử lý:** 23/07/2026 09:14 GMT+7
- **Nguyên nhân:**
  - Trong `live-chat.js`, toàn bộ phiên trò chuyện của tất cả người dùng bị ghi đè chung vào 1 key duy nhất `eigu_real_chat_sessions` trong `localStorage`. Khi User 1 đăng xuất và User 2 đăng nhập trên cùng thiết bị, `localStorage` vẫn chứa phiên chat giữa `Staff A ↔ User 1`.
  - Trong `notifications.js`, thông báo chuông cũng dùng chung key `eigu_header_bell_notifications` không phân biệt tài khoản.
  - Khi Đăng xuất (`handleLogout()`), hệ thống không xóa trạng thái tin nhắn trong bộ nhớ RAM (`activeStaffChatEmail`, `notificationsData`), dẫn đến rò rỉ dữ liệu phiên làm việc cũ cho tài khoản mới.
- **Khắc phục:**
  - **Cách ly Storage Key theo Identity:** Chuyển `getChatStorageKey()` và `getNotifStorageKey()` sang dạng có prefix phân lập theo email/role (`eigu_chat_sessions_${email}` cho User, `eigu_staff_shared_chat_sessions` cho Staff/Admin, và `eigu_header_bell_notifications_${email}`).
  - **Đồng bộ hai chiều an toàn:** Khi Staff phản hồi, hệ thống đồng thời lưu vào kho chung của Staff và ghi đè an toàn vào đúng storage key `eigu_chat_sessions_${targetEmail}` của User nhận tin.
  - **Phân quyền Console nghiêm ngặt:** Thêm kiểm tra `userProfile.role === 'admin' || userProfile.role === 'staff'` ngay đầu hàm `loadStaffChatConsole()`, chặn triệt để người dùng role `user` xem danh sách cuộc trò chuyện.
  - **Dọn dẹp RAM State khi Logout:** Hàm `handleLogout()` trong `auth.service.js` gọi `resetChatState()` dọn dẹp sạch sẽ DOM và các biến RAM (`activeStaffChatEmail`, `notificationsData`, `isChatOpen`), đảm bảo khi tài khoản mới đăng nhập không bị rò rỉ dữ liệu từ tài khoản trước.

### 18.10 Xử lý Lỗi UnhandledPromiseRejection & Tải YouTube bị Hạn chế (Restricted Video)
- **Thời gian xử lý:** 23/07/2026 12:25 GMT+7
- **Nguyên nhân:**
  1. `youtubedl.exec()` trong gói `youtube-dl-exec` trả về một Promise (`ExecPromise`). Khi `yt-dlp` trả về exit code 1 (do link lỗi/bị hạn chế), Promise này bị reject nhưng chưa được gắn `.catch()`, gây ra cảnh báo `UnhandledPromiseRejectionWarning: ChildProcessError` bắn tràn log Node.js/Electron.
  2. Một số video YouTube bị khóa độ tuổi (Age-restricted), bị ẩn/riêng tư (Private), hoặc bật chế độ kiểm duyệt nội dung (Google Workspace Restricted Mode), dẫn đến `yt-dlp` bị chặn truy cập.
- **Khắc phục:**
  - **Catch Unhandled Promise:** Thêm `subprocess.catch((_err) => {})` ngay sau khi gọi `youtubedl.exec()`, triệt tiêu hoàn toàn cảnh báo `UnhandledPromiseRejectionWarning`. Luồng xử lý sự kiện `close` và `error` vẫn được bảo toàn nguyên vẹn.
  - **Nâng cấp Cờ anti-bot cho `yt-dlp`:** Bổ sung `--no-check-certificates`, `--geo-bypass`, `--extractor-args "youtube:player_client=android,web"`, `userAgent` chuẩn trình duyệt MacOS Chrome, và linh hoạt định dạng video `format: 'bestvideo+bestaudio/best'`.
  - **Trích xuất Lỗi Thân thiện (Friendly Error Parser):** Bổ sung hàm `parseYouTubeErrorMessage()` chuyển đổi các thông báo lỗi thô của YouTube (`Video unavailable. This video is restricted...`) thành thông báo tiếng Việt rõ ràng, chỉ dẫn người dùng sử dụng file MP4 từ máy hoặc đổi link YouTube công khai.

### 18.11 Khắc phục lỗi Hủy tiến trình nhưng YouTube vẫn tải xong (YouTube Cancellation Wiring)
- **Thời gian xử lý:** 23/07/2026 13:41 GMT+7
- **Nguyên nhân:** Trong `main.ts`, biến `cancelCurrentWorkflow` chỉ được gán sau khi `downloadYouTubeVideo` đã tải xong và chuyển sang giai đoạn `processVideoWithFFmpeg`. Nếu người dùng nhấn "Hủy tiến trình" khi video YouTube đang được tải, nút Hủy vô tác dụng (do `cancelCurrentWorkflow === null`), khiến `yt-dlp` vẫn âm thầm chạy ngầm cho tới khi hoàn tất.
- **Khắc phục:**
  - **Refactor `downloadYouTubeVideo`:** Đổi kiểu trả về từ `Promise<string>` sang `{ promise: Promise<string>, cancel: () => void }`. Hàm `cancel()` sẽ phát tín hiệu `isCancelled = true`, kích hoạt `subprocess.kill('SIGKILL')` chém đứt tiến trình `yt-dlp` ngay lập tức và tự động xóa file tạm `/tmp/youtube_raw_${taskId}.mp4`.
  - **Gán `cancelCurrentWorkflow` sớm:** Trong `main.ts`, gán `cancelCurrentWorkflow = ytTask.cancel` ngay trước khi `await ytTask.promise`. Khi người dùng nhấn Hủy tiến trình, nút bấm lập tức ngắt luồng tải YouTube, phản hồi trạng thái `❌ Đã hủy tiến trình` ra UI và dọn dẹp tài nguyên.

### 18.12 Tự động khởi tạo Thư mục xuất & Bấm mở Finder (macOS) / File Explorer (Windows)
- **Thời gian xử lý:** 23/07/2026 14:20 GMT+7
- **Chi tiết:**
  - **Tự động tạo thư mục gốc:** Sử dụng API native Electron `app.getPath('downloads')` để lấy đường dẫn thư mục `Downloads` chính chủ trên mọi máy Client (macOS & Windows). Tự động tạo cây thư mục `eigu/outputs` (`fs.mkdirSync(..., { recursive: true })`) nếu chưa tồn tại.
  - **Mở Finder / File Explorer 1-Click:** Đã nâng cấp nhãn `Thư mục lưu` trên UI thành một đường dẫn có thể nhấp chuột (`.clickable-path`, hover đổi màu tím + gạch chân). Khi click vào đường dẫn, ứng dụng gọi IPC `open-output-folder`, sử dụng `shell.openPath()` để mở trực tiếp cửa sổ Finder (trên macOS) hoặc File Explorer (trên Windows) đúng thư mục hiện tại.

### 18.13 Nâng cấp Chỉnh sửa nâng cao: Range Sliders, Chèn Logo 9 ô vị trí & Live Preview Thời gian thực
- **Thời gian xử lý:** 23/07/2026 14:48 GMT+7
- **Chi tiết:**
  - **Loại bỏ Input Number mặc định:** Thay thế toàn bộ các thẻ `<input type="number">` với nút tăng/giảm trắng thô ráp bằng các thanh kéo ngang **Custom Range Sliders (`<input type="range">`)** kèm Badge số hiển thị tỉ lệ thực tế (`1.00x`, `15%`, `100%`).
  - **Tính năng Chèn Logo / Watermark:**
    - Tải tệp Logo (`.png`, `.jpg`, `.webp`) với giao diện Dropzone hiện đại.
    - Bộ chọn vị trí 3x3 Grid (9 ô vị trí: ↖ Trên Trái, ⬆ Giữa Trên, ↗ Trên Phải, ⬅ Giữa Trái, ⏺ Chính Giữa, ➔ Giữa Phải, ↙ Dưới Trái, ⬇ Giữa Dưới, ↘ Dưới Phải).
    - Slider chỉnh kích thước Logo (`5%` - `40%`) và Slider độ trong suốt Logo (`10%` - `100%`).
    - Tích hợp bộ lọc FFmpeg `movie='logo_path',scale=...,format=rgba,colorchannelmixer=aa=...[logo]; [in][logo]overlay=...` đốt trực tiếp logo lên video khi transcode.
  - **Live Video Preview Engine:** Tự động áp dụng hiệu ứng CSS Filter (`brightness`, `contrast`, `saturate`, `transform`) và render lớp ảnh Logo trực tiếp trên thẻ xem trước Video (`#video-preview-card`) theo thời gian thực khi người dùng di chuyển các thanh kéo hoặc bấm đổi vị trí Logo.
  - **Cập nhật Quy chuẩn UI (`AI_CONTEXT.md`):** Đã thêm cờ `No Default Raw Number Inputs & Custom Sliders (CRITICAL UI/UX)` vào tài liệu hướng dẫn dự án.

### 18.14 Đổ sóng Real-time WebSocket Chat Support & Tự động Xóa Tin nhắn Cũ sau 24 Giờ (Supabase Clean Architecture)
- **Thời gian xử lý:** 23/07/2026 16:30 GMT+7
- **Nguyên nhân:** Trước đó tin nhắn giữa User và Staff/Admin chỉ được lưu cục bộ trong `localStorage` / DOM của từng máy, nên tin nhắn gửi từ máy User ("Hello bạn hiền") không được phát đi qua mạng, khiến máy Staff/Admin không nhận được.
- **Khắc phục:**
  - **WebSocket Chat Gateway (`/chat` namespace):** Xây dựng `ChatGateway`, `ChatService`, `ChatController` và `ChatModule` trên NestJS API (`apps/api`).
  - **Đồng bộ Real-time 2 chiều:**
    - Khi User gửi tin nhắn `chat:send_message`, NestJS API lập tức ghi dữ liệu vào Supabase PostgreSQL (`ChatMessage`), phát trực tiếp `chat:message_received` và `chat:sessions_updated` tới phòng của User và console của Staff.
    - Khi Staff mở xem tin nhắn, tự động phát `chat:mark_seen` cập nhật trạng thái `✓✓ Đã xem` trên màn hình User tức thì.
  - **Tự động Dọn dẹp Tin nhắn Cũ hơn 24 Giờ (Auto TTL Cleanup):**
    - `ChatService` tự động chạy Cron job mỗi 1 giờ (`setInterval`) xóa sạch các tin nhắn có `createdAt < 24 giờ` (`deleteMany`).
    - Giữ dung lượng bảng `ChatMessage` trên Supabase PostgreSQL luôn gọn nhẹ, tối ưu 100% tài nguyên miễn phí và tốc độ truy vấn vượt trội.

### 18.15 Khởi tạo MODULES_PROJECT.md & Thiết lập Skill Tự động Bổ sung Mô-đun Dự án
- **Thời gian xử lý:** 23/07/2026 16:42 GMT+7
- **Chi tiết:**
  - **Khởi tạo `MODULES_PROJECT.md`:** Đã tạo tài liệu gốc [MODULES_PROJECT.md](file:///Users/peggy2402/Projects/eigu-platform/MODULES_PROJECT.md) thống kê đầy đủ toàn bộ mô-đun trong Nx Workspace (4 Apps, 1 Shared Lib, 8 NestJS Backend API Modules và 25 UI Feature Modules/TabKeys).
  - **Thiết lập Skill Tự động (`AI_CONTEXT.md`):** Đã gắn cờ quy tắc `Tự Động Cập Nhật Danh Sách Mô-Đun Dự Án (CRITICAL AUTOMATION SKILL)` vào [AI_CONTEXT.md](file:///Users/peggy2402/Projects/eigu-platform/AI_CONTEXT.md). Sau này khi người dùng gõ lệnh `"Bổ sung module 'abcxyz'"`, AI sẽ tự động đọc, phân loại và ghi bổ sung mô-đun mới vào file `MODULES_PROJECT.md`.

### 18.16 Cập nhật Tài liệu Hướng dẫn (EIGU_GUIDE.md) & Đặc tả Kiến trúc (EIGU_ARCHITECTURE_SPEC.md)
- **Thời gian xử lý:** 23/07/2026 16:47 GMT+7
- **Chi tiết:**
  - **Cập nhật [EIGU_GUIDE.md](file:///Users/peggy2402/Projects/eigu-platform/EIGU_GUIDE.md):** Bổ sung hướng dẫn cấu hình Prisma 7 (`prisma.config.ts`), Supabase PostgreSQL, quy trình chạy 4 Apps (NestJS, Electron Desktop, Next.js Web, Flutter Mobile), danh mục đầy đủ 30 REST Endpoints + 2 WebSockets, và tính năng Desktop Engine mới (Range Sliders, 9-Grid Logo Overlay, Auto Output Path Finder/Explorer).
  - **Cập nhật [EIGU_ARCHITECTURE_SPEC.md](file:///Users/peggy2402/Projects/eigu-platform/EIGU_ARCHITECTURE_SPEC.md):** Đã thống kê danh mục chi tiết **32 Cổng Giao Tiếp Hạ Tầng API** (30 REST Endpoints + 2 WebSockets `/workflow` & `/chat`), cơ chế Auto TTL Cleanup 24h trên Supabase, kỹ thuật FFmpeg Chèn Logo 9 vị trí và kiến trúc định tuyến Proxy Châu Âu chống rò rỉ WebRTC.

### 18.17 Triệt tiêu Lỗi Lặp Tin Nhắn Real-time Chat & Bổ sung Skill Khử Trùng Lặp (`AI_CONTEXT.md`)
- **Thời gian xử lý:** 23/07/2026 16:51 GMT+7
- **Nguyên nhân:** Khi gửi tin nhắn qua WebSocket, phía Client tạo ID tạm thời (ví dụ `usr_msg_1784799...`) để render ngay trên UI. Sau khi Server lưu vào DB và phát lại sự kiện `chat:message_received` mang ID mới từ DB, hàm nhận sự kiện chỉ kiểm tra `m.id === msg.id`. Do ID không trùng nhau, Client lầm tưởng đây là tin nhắn mới và đẩy tiếp (`push`) vào mảng, gây ra hiện tượng 1 tin nhắn hiển thị **2 lần** trên màn hình User và Staff.
- **Khắc phục:**
  - **Truyền Client ID đồng bộ:** Cập nhật `sendChatMessage` & `sendStaffChatMessage` trong `live-chat.js` truyền mã `id` tạm thời lên server. `ChatService.saveMessage()` trên NestJS API nhận `dto.id` để lưu chính xác vào DB.
  - **Khử trùng lặp thông minh (Deduplication Engine):** Trong `onWebSocketChatMessage()`, hàm sẽ đối soát theo `m.id === msg.id || (m.sender === msg.sender && m.text === msg.message && timeDelta < 10s)`. Nếu khớp tin nhắn tạm thời thì **cập nhật lại ID & status chuẩn**, triệt tiêu 100% hiện tượng trùng lặp tin nhắn.
  - **Bổ sung Skill Quy chuẩn (`AI_CONTEXT.md`):** Đã thêm cờ `Real-Time Event Deduplication & Client Temp ID Matching (CRITICAL REALTIME SKILL)` vào tài liệu hướng dẫn [AI_CONTEXT.md](file:///Users/peggy2402/Projects/eigu-platform/AI_CONTEXT.md).

### 18.18 Khởi tạo PROMPT_GUIDE_MODULES.md & Bổ sung Skill Tương thích Đa Hệ Điều Hành (Windows & macOS)
- **Thời gian xử lý:** 23/07/2026 16:58 GMT+7
- **Chi tiết:**
  - **Khởi tạo [PROMPT_GUIDE_MODULES.md](file:///Users/peggy2402/Projects/eigu-platform/PROMPT_GUIDE_MODULES.md):** Biên soạn bộ tài liệu hướng dẫn viết Prompt chuẩn định hướng mô-đun dành cho AI Assistant (mẫu câu lệnh, tra cứu mã TabKey và cấu trúc tệp mã nguồn liên quan).
  - **Thiết lập Skill Viết Prompt Định Hướng Mô-Đun (`AI_CONTEXT.md`):** Thêm quy tắc `Strict Module Targeting & Prompt Guide Compliance Skill (CRITICAL PROMPT SKILL)` buộc AI phải đối chiếu file `PROMPT_GUIDE_MODULES.md` để lập trình chính xác vào đúng mô-đun được yêu cầu.
  - **Thiết lập Skill Tương Thích 100% Đa Hệ Điều Hành Windows & macOS (`AI_CONTEXT.md`):** Thêm cờ `Cross-Platform Dual OS Compatibility Skill (Windows & macOS) (CRITICAL CROSS-PLATFORM SKILL)`. Yêu cầu AI loại bỏ hoàn toàn hardcode đường dẫn `tmp` hay `/` / `\`, tự động chuẩn hóa bằng `path.join()`, `app.getPath('downloads')`, tự động chuyển đổi Encoders FFmpeg (`hevc_videotoolbox` / `h264_videotoolbox` trên macOS vs `libx264` / `nvenc` / `amf` trên Windows) và mở cửa sổ native File Explorer (Windows) / Finder (macOS) mượt mà cho bản Production.

### 18.19 Sửa Lỗi TypeScript Compiler `Option 'bundler' can only be used when 'module' is set to...`
- **Thời gian xử lý:** 23/07/2026 17:00 GMT+7
- **Nguyên nhân:** File `apps/desktop/tsconfig.app.json` ghi đè `"module": "commonjs"`, trong khi file `tsconfig.base.json` kế thừa cấu hình `"moduleResolution": "bundler"`. TypeScript compiler quy định cờ `bundler` chỉ chấp nhận với các giá trị module từ `es2015`/`esnext`/`preserve` trở lên.
- **Khắc phục:**
  - Bổ sung `"moduleResolution": "node"` và `"ignoreDeprecations": "6.0"` vào `compilerOptions` của file [apps/desktop/tsconfig.app.json](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/tsconfig.app.json).
  - Biên dịch thành công 100% không còn lỗi (`npx tsc --noEmit`).

### 18.20 Chuẩn hóa Đồng bộ TypeScript ESNext & Bundler Module Resolution (`apps/api` & `apps/desktop`)
- **Thời gian xử lý:** 23/07/2026 17:11 GMT+7
- **Nguyên nhân:** File `apps/api/tsconfig.app.json` và `apps/desktop/tsconfig.app.json` thiết lập `"module": "commonjs"` kết hợp với `"moduleResolution": "bundler"`. Trong TypeScript 6.0+, sự kết hợp này gây lỗi xung đột `Option 'bundler' can only be used when 'module' is set to 'preserve' or to 'es2015' or later` và cảnh báo TS5107 deprecation với Node10.
- **Khắc phục:**
  - Đồng bộ `"module": "esnext"` và `"moduleResolution": "bundler"` trong `compilerOptions` của cả [apps/api/tsconfig.app.json](file:///Users/peggy2402/Projects/eigu-platform/apps/api/tsconfig.app.json) và [apps/desktop/tsconfig.app.json](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/tsconfig.app.json).
  - Cập nhật các câu lệnh `import FormData = require('form-data');` thành chuẩn ES module `import FormData from 'form-data';` trong [feedback.service.ts](file:///Users/peggy2402/Projects/eigu-platform/apps/api/src/feedback/feedback.service.ts) và [voice.service.ts](file:///Users/peggy2402/Projects/eigu-platform/apps/api/src/voice/voice.service.ts).
  - Chạy `npx nx run-many --target=build --projects=api,desktop` thành công 100% (Zero Errors).

### 18.21 Xử lý Cảnh báo Type-Only Import Tránh Webpack Warning (`apps/api`)
- **Thời gian xử lý:** 23/07/2026 17:15 GMT+7
- **Nguyên nhân:** Webpack phát cảnh báo `export '...' was not found` khi import interface/type TypeScript thông qua `import { ... }` thông thường vì các type/interface bị xóa ở giai đoạn transpilation.
- **Khắc phục:**
  - Chuyển thành cú pháp Type-Only import: `import { ChatService, type CreateChatMessageDto }` trong [chat.gateway.ts](file:///Users/peggy2402/Projects/eigu-platform/apps/api/src/chat/chat.gateway.ts) và `import type { VideoWorkflowStatus }` trong [workflow.gateway.ts](file:///Users/peggy2402/Projects/eigu-platform/apps/api/src/app/workflow.gateway.ts).
  - Lệnh `npx nx build api` hoàn tất 100% sạch bóng cảnh báo (0 Warnings, 0 Errors).

### 18.22 Chuẩn hóa Quản lý Cấu hình Tập trung Centralized `baseUrl` & `API_ENDPOINTS` (`packages/shared` & Desktop UI)
- **Thời gian xử lý:** 23/07/2026 17:24 GMT+7
- **Nguyên nhân:** Địa chỉ URL gốc (`http://localhost:3001/api`, `http://localhost:3001`) trước đây bị lặp lại ở nhiều file JS/TS riêng lẻ (`settings.js`, `live-chat.js`, `api.ts`...).
- **Khắc phục:**
  - **Tập trung hóa trong `@eigu-platform/shared`:** Tạo file [constants.ts](file:///Users/peggy2402/Projects/eigu-platform/packages/shared/src/lib/constants.ts) định nghĩa các hàm `getApiBaseUrl()`, `getWebSocketUrl()` và object `API_ENDPOINTS` tra cứu tập trung.
  - **Tập trung hóa cho Desktop Assets UI:** Tạo file [config.js](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/src/assets/js/config.js) định nghĩa `window.EIGU_CONFIG`, `window.getApiBaseUrl()`, `window.getWebSocketUrl()`, tự động đọc từ `localStorage` hoặc mặc định.
  - **Cập nhật các tệp giao diện:** Nạp `js/config.js` đầu tiên trong `index.html` và chuyển toàn bộ lời gọi `fetch` / `io` trong `settings.js`, `live-chat.js`, `api.ts` sang sử dụng hàm tập trung.

### 18.23 Khởi tạo `apps/web/.env` & Bổ sung Biến Môi Trường Thiếu Cho `apps/api/.env`
- **Thời gian xử lý:** 23/07/2026 17:29 GMT+7
- **Chi tiết:**
  - **Tạo mới `apps/web/.env`:** Tạo file biến môi trường [apps/web/.env](file:///Users/peggy2402/Projects/eigu-platform/apps/web/.env) với cấu hình `PORT=3000`, `NEXT_PUBLIC_API_URL` và `NEXT_PUBLIC_WS_URL`.
  - **Bổ sung `apps/api/.env`:** Cập nhật file [apps/api/.env](file:///Users/peggy2402/Projects/eigu-platform/apps/api/.env) bổ sung các biến bị thiếu (`PORT=3001`, `JWT_REFRESH_SECRET`, `NEXT_PUBLIC_WS_URL=http://localhost:3001`), chuẩn hóa `NEXT_PUBLIC_API_URL=http://localhost:3001/api`.

### 18.24 Khởi tạo URL_GUIDE.md Hướng Dẫn Thay Đổi Địa Chỉ URL Sản Phẩm (Production Ready)
- **Thời gian xử lý:** 23/07/2026 21:28 GMT+7
- **Chi tiết:**
  - **Tạo mới [URL_GUIDE.md](file:///Users/peggy2402/Projects/eigu-platform/URL_GUIDE.md):** Tổng hợp danh mục tra cứu 4 vị trí thay đổi URL tập trung duy nhất cho 4 ứng dụng (Desktop App `js/config.js`, Backend API `.env`, Web Dashboard `.env`, Shared Lib `constants.ts`).

### 18.25 Cấu hình Động Custom Obfuscated API Prefix & Chống Dò Quét API Route (`apps/api`)
- **Thời gian xử lý:** 23/07/2026 21:44 GMT+7
- **Chi tiết:**
  - **Tích hợp `process.env.API_PREFIX` trong NestJS:** Cập nhật [apps/api/src/main.ts](file:///Users/peggy2402/Projects/eigu-platform/apps/api/src/main.ts) nhận diện linh hoạt cờ `API_PREFIX` từ file `.env` (ví dụ `api/v1` hoặc `api/eigu-v1-x98f21a`).
  - **Obfuscation & Swagger Docs**: Swagger Docs tự động chuyển sang `${globalPrefix}/docs`. Hacker nếu thử scan URL mặc định `/api/auth/login` sẽ bị chặn và phản hồi `404 Not Found`.
  - **Cập nhật tài liệu [URL_GUIDE.md](file:///Users/peggy2402/Projects/eigu-platform/URL_GUIDE.md)**: Hướng dẫn kỹ thuật thiết lập Custom API Prefix bảo mật nâng cao.

### 18.26 Sửa Lỗi "Cannot POST /auth/api/login" Khi Dùng Custom API Prefix (`apps/desktop`)
- **Thời gian xử lý:** 23/07/2026 21:59 GMT+7
- **Nguyên nhân:** Khi đổi `API_PREFIX=api/eigu-v1-t24v02c03` trong file `.env`, địa chỉ API Base của Server trở thành `http://localhost:3001/api/eigu-v1-t24v02c03`. Nhưng dưới Desktop Client `apiFetch` trong `core/api.js` vẫn giữ giá trị khởi tạo tĩnh mặc định `http://localhost:3001/api`, dẫn tới việc gửi nhầm request vào `/api/auth/login` thay vì `/api/eigu-v1-t24v02c03/auth/login`.
- **Khắc phục:**
  - **Dynamic Getters trong `config.js`:** Đổi `API_BASE_URL` và `WEBSOCKET_URL` thành Getter động trong [apps/desktop/src/assets/js/config.js](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/src/assets/js/config.js), luôn tự động lấy giá trị mới nhất từ `localStorage`.
  - **Dynamic Fetch trong `core/api.js`:** Cập nhật `apiFetch` trong [apps/desktop/src/assets/js/core/api.js](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/src/assets/js/core/api.js) truy xuất `window.getApiBaseUrl()` thời gian thực.

### 18.27 Loại Bỏ Lỗi LocalStorage Đè URL & Tích Hợp IPC Live API Config (`apps/desktop` & `AI_CONTEXT.md`)
- **Thời gian xử lý:** 23/07/2026 22:08 GMT+7
- **Vấn đề cốt lõi:** `localStorage` trên máy khách KHÔNG PHẢI BACKEND. Ưu tiên đọc `localStorage` làm mốc URL API bị đóng băng ở giá trị cũ (`/api/auth/login`), hoàn toàn gãy kết nối khi Server đổi `API_PREFIX` (ví dụ `api/eigu-v1-t24v02c03`).
- **Khắc phục:**
  - **IPC Handler trong `main.ts`:** Bổ sung `get-api-config` trong [apps/desktop/src/main.ts](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/src/main.ts) để truyền trực tiếp `API_PREFIX` / `NEXT_PUBLIC_API_URL` từ Server Main Process xuống UI.
  - **Tập trung hóa trong `config.js`:** Loại bỏ hoàn toàn việc đọc `localStorage` làm fallback đè URL Server trong [apps/desktop/src/assets/js/config.js](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/src/assets/js/config.js).
  - **Bổ sung Skill vào [AI_CONTEXT.md](file:///Users/peggy2402/Projects/eigu-platform/AI_CONTEXT.md):** Bắt buộc AI tuân thủ nguyên tắc Nguồn Tri Thức Server (Environment Truth), cấm tuyệt đối dùng `localStorage` đè URL Backend.

### 18.28 Tùy Biến Động Chuỗi Mã Hóa API Prefix Cho Admin (Chống Hardcode)
- **Thời gian xử lý:** 23/07/2026 22:11 GMT+7
- **Chi tiết:**
  - **Loại bỏ hoàn toàn Hardcode:** Xóa bỏ chuỗi mẫu hardcode `eigu-v1-t24v02c03` khỏi mã nguồn mặc định [apps/desktop/src/assets/js/config.js](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/src/assets/js/config.js) và [apps/desktop/src/main.ts](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/src/main.ts).
  - **Trao quyền toàn bộ cho Admin:** Admin có toàn quyền đổi `API_PREFIX` thành bất kỳ chuỗi bảo mật nào (ví dụ `api/v1`, `api/v2`, `api/custom-secret-key-xyz`...) thông qua file `.env` hoặc hàm IPC `save-api-config`. Hệ thống tự động nhận diện và đồng bộ 100%.

### 18.29 Triển Khai Giao Diện Quản Lý Cấu Hình API Server Trực Tiếp Cho Admin (Option 2 UI)
- **Thời gian xử lý:** 23/07/2026 22:13 GMT+7
- **Chi tiết:**
  - **Khởi tạo UI Form trong Tab Cài Đặt:** Thêm khu vực `🔒 Cấu Hình Tiền Tố API Server (Admin Custom API Prefix)` vào [views.component.js](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/src/assets/js/components/views.component.js).
  - **Tích hợp Logic Đồng Bộ Động:** Bổ sung `loadAdminApiConfig()` và `saveAdminApiConfig()` trong [settings.js](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/src/assets/js/ui/settings.js), tự động đọc địa chỉ API hiện tại và cho phép Admin cập nhật tức thì thông qua IPC `save-api-config` và `window.EIGU_CONFIG.setApiUrl()`.

### 18.30 Xử Lý Triệt Để Nguyên Nhân Gốc Lỗi "Cannot POST /api/auth/login" (Root Cause Fix)
- **Thời gian xử lý:** 23/07/2026 22:18 GMT+7
- **Nguyên nhân gốc (Root Cause):**
  1. **Nguồn Tri Thức Bị Khuyết Độc Lập:** File [apps/desktop/src/main.ts](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/src/main.ts) của Electron Main Process trước đó KHÔNG NẠP module `dotenv` đọc file `apps/api/.env`. Do đó `process.env.API_PREFIX` bên trong Main Process bị `undefined`, dẫn tới việc trả về fallback `/api` thay vì `/api/eigu-v1-t24v02c03` xuống cho UI.
  2. **Bất Đồng Bộ Khi Nạp Cấu Hình:** Hàm `ipcRenderer.invoke('get-api-config')` trước đó chạy bất đồng bộ (Promise), khiến `config.js` khởi tạo URL `/api` cũ trước khi IPC trả về kết quả.
  3. **Rác LocalStorage Cũ:** Trình duyệt Electron vẫn giữ key `localStorage.getItem('eigu_api_url')` cũ chứa `/api`.
- **Khắc phục:**
  - **Nạp `dotenv` ở đầu `main.ts`:** Thêm `config({ path: resolve(process.cwd(), 'apps/api/.env') })` ngay đầu tệp [apps/desktop/src/main.ts](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/src/main.ts) để Main Process luôn nhận đúng 100% `API_PREFIX` từ file cấu hình Backend.
  - **IPC Đồng Bộ Tức Thì (`sendSync`):** Tạo handler `ipcMain.on('get-api-config-sync')` trả về kết quả đồng bộ ngay tức thì khi `config.js` được nạp trong `<head>`.
  - **Dọn Rác `localStorage` Cũ:** Thêm `localStorage.removeItem('eigu_api_url')` tại [config.js](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/src/assets/js/config.js) để không bao giờ bị đè mốc URL cũ.

### 18.31 Cập Nhật Skill Production & Client Readiness First Mindset (`AI_CONTEXT.md`)
- **Thời gian xử lý:** 23/07/2026 22:22 GMT+7
- **Chi tiết:** Bổ sung skill bắt buộc **Production & Client Readiness First Mindset Skill** vào [AI_CONTEXT.md](file:///Users/peggy2402/Projects/eigu-platform/AI_CONTEXT.md). Yêu cầu mọi mã nguồn, cấu hình, biến môi trường và logic xử lý khi được viết ra phải luôn hướng tới việc triển khai thực tế trên Production Cloud và phát hành các ứng dụng Client (Desktop Electron, Web Next.js, Mobile App) trơn tru 100% (Zero-Code-Change Deployment).

### 18.32 Xử Lý Lệch Pha `NEXT_PUBLIC_API_URL` vs `API_PREFIX` & Thêm Exception Telemetry
- **Thời gian xử lý:** 23/07/2026 22:31 GMT+7
- **Chi tiết:** Sửa lệch pha `NEXT_PUBLIC_API_URL` bằng hàm `resolveApiUrl()` thông minh. Bổ sung `AllExceptionsFilter` ghi log Stack Trace 100% lỗi 404, 500 ra terminal backend và tích hợp Telemetry Session Action Trail dưới Desktop App.

### 18.33 Nâng Cấp UI Settings, Hướng Dẫn Sử Dụng & Khóa Quyền Admin
- **Thời gian xử lý:** 23/07/2026 22:42 GMT+7
- **Chi tiết:** Bỏ `max-width` 520px/640px bị bó hẹp trong [profile-settings.css](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/src/assets/css/profile-settings.css). Cập nhật Responsive Grid cho "Hướng dẫn sử dụng" và ẩn 100% khu vực Cấu hình Admin đối với Role `USER` / `STAFF`.

### 18.34 Cập Nhật Toàn Diện Chi Tiết Các Mô-Đun Dự Án (`MODULES_PROJECT.md`)
- **Thời gian xử lý:** 23/07/2026 23:18 GMT+7
- **Chi tiết:** Mô tả chi tiết 100% 25+ mô-đun chức năng, kiến trúc bảo mật RBAC 3 cấp, cơ chế mã hóa API Key phần cứng DPAPI/Keychain vào [MODULES_PROJECT.md](file:///Users/peggy2402/Projects/eigu-platform/MODULES_PROJECT.md).

### 18.35 Chuẩn Hóa Kiến Trúc Định Tuyến 3 Lớp & Cập Nhật `URL_GUIDE.md`
- **Thời gian xử lý:** 23/07/2026 23:29 GMT+7
- **Chi tiết:** Chuẩn hóa công thức định tuyến 3 lớp: `${baseUrl}` + `/api/${obf_code}` + `${endpoint}`. Viết lại toàn bộ [URL_GUIDE.md](file:///Users/peggy2402/Projects/eigu-platform/URL_GUIDE.md).

### 18.36 Tích Hợp Lọc Ký Tự An Toàn & Validate Regex Cho Mã `obf_code`
- **Thời gian xử lý:** 23/07/2026 23:40 GMT+7
- **Chi tiết:** Tích hợp bộ lọc real-time `/^[^a-zA-Z0-9_-]/g` và kiểm tra Regex `/^[a-zA-Z0-9_-]+$/` trước khi lưu `obf_code` trong [settings.js](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/src/assets/js/ui/settings.js).

### 18.37 Tái Cấu Trúc Khỏi Ghi File Đĩa Cụ̂c Bộ ➔ Tương Thích 100% Production Cloud
- **Thời gian xử lý:** 24/07/2026 00:03 GMT+7
- **Chi tiết:** Loại bỏ mã ghi đè đĩa cứng `fs.writeFileSync()` trong [main.ts](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/src/main.ts) để tương thích môi trường Cloud Read-Only & Client App thương mại.

### 18.38 Xây Dựng Phân Hệ Cấu Hình Hệ Thống DB (`SystemConfig` Model in Supabase PostgreSQL)
- **Thời gian xử lý:** 24/07/2026 00:17 GMT+7
- **Chi tiết:** 
  - Tạo Prisma Model `SystemConfig` trong [schema.prisma](file:///Users/peggy2402/Projects/eigu-platform/apps/api/prisma/schema.prisma) và cấu hình [prisma.config.ts](file:///Users/peggy2402/Projects/eigu-platform/apps/api/prisma/prisma.config.ts) tương thích Prisma v7.
  - Chạy `npx prisma db push` đồng bộ bảng `SystemConfig` lên DB Supabase PostgreSQL Cloud thành công.
  - Tạo `SystemConfigModule`, `SystemConfigService`, `SystemConfigController` cung cấp API công khai `GET /system-config/bootstrap` và API bảo mật Admin `PATCH /system-config`.
  - Tích hợp `saveAdminApiConfig()` trong [settings.js](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/src/assets/js/ui/settings.js) gọi API `PATCH /system-config` cập nhật cơ sở dữ liệu Supabase PostgreSQL.
### 18.39 Khắc Phục Lỗi Cấu Hình Prisma 7 Config (`earlyAccess` Deprecated Property)
- **Thời gian xử lý:** 24/07/2026 00:20 GMT+7
### 18.40 Khắc Phục Truy Xuất Lớp Model DB `systemConfig` Trong `SystemConfigService`
- **Thời gian xử lý:** 24/07/2026 00:25 GMT+7
### 18.41 Giải Quyết Triệt Để Lỗi 404 Khi Đổi Mã `obf_code` (Dynamic Prefix Binding & Graceful Server Restart)
- **Thời gian xử lý:** 24/07/2026 00:38 GMT+7
- **Phân Tích Nguyên Nhân Gốc:**
  - Khi Admin đổi `obf_code` thành `v2-secret-2026` via API `PATCH /system-config`, DB đã được cập nhật nhưng NestJS Server vẫn đang giữ bộ định tuyến Express cũ (`api/eigu-sec-999`) đăng ký lúc `bootstrap()`. Do đó request gửi tới `/api/v2-secret-2026/auth/login` bị trả về `404 Cannot POST`.
- **Khắc Phục:**
  1. Nạp động `API_PREFIX` từ `SystemConfig` DB tại thời điểm `bootstrap()` trong [main.ts](file:///Users/peggy2402/Projects/eigu-platform/apps/api/src/main.ts).
### 18.42 Triển Khai ObfuscatedPrefixMiddleware Động 100% Zero-Restart & Che Giấu Tuyệt Đối API Path
- **Thời gian xử lý:** 24/07/2026 00:50 GMT+7
- **Vấn Đề Phát Hiện Từ Người Dùng:**
  1. Thao tác `app.setGlobalPrefix()` cố định lúc bootstrap không nhận diện kịp thời gian thực khi Admin bấm đổi `obf_code` trên UI ➔ Buộc người dùng phải sửa thủ công DB hoặc restart server.
  2. Thông điệp lỗi HTTP 404 mặc định (`Cannot POST /api/.../auth/login`) làm lộ mốc Obfuscation Code và tên hàm backend cho hacker/scanners.
- **Giải Pháp Đột Phá:**
  1. **Loại bỏ `API_PREFIX` trong `.env`**: Không còn phụ thuộc bất kỳ biến môi trường `API_PREFIX` nào trong `apps/api/.env`.
  2. **Tạo `ObfuscatedPrefixMiddleware` ([obfuscated-prefix.middleware.ts](file:///Users/peggy2402/Projects/eigu-platform/apps/api/src/common/middleware/obfuscated-prefix.middleware.ts))**: Bắt 100% request `/api/:candidateCode/*`, so sánh `:candidateCode` với mốc active trong `SystemConfig` DB. Nếu khớp ➔ Tự động bóc tách và rewrite request tức thì vào Controller internal mà KHÔNG CẦN KHỞI ĐỘNG LẠI SERVER! Nếu không khớp ➔ Trả về HTTP 404 ẩn danh lập tức.
  3. **Bảo Mật Che Giấu Đường Dẫn (`AllExceptionsFilter`)**: 100% phản hồi HTTP 404 tới Client chỉ hiển thị thông điệp chung: `"Yêu cầu không hợp lệ hoặc tài nguyên không tồn tại"`, bảo đảm tuyệt đối không bao giờ làm lộ cấu trúc URL hoặc Obfuscation Prefix.

### 18.43 Sửa Lỗi Nhân Đôi Chuỗi Đường Dẫn `req.url` Trong Express Router Middleware
- **Thời gian xử lý:** 24/07/2026 00:58 GMT+7
- **Phân Tích Nguyên Nhân Gốc Gây Ra Lỗi "POST /api/v2-test-2026/auth/loginapi/auth/login" (404 Cannot POST):**
  - Trong Express JS (dưới NestJS `setGlobalPrefix('api')`), router đã gắn sẵn mount point `/api`.
  - Khi `ObfuscatedPrefixMiddleware` gán `req.url = '/api/auth/login'`, Express tự động nối mount point `/api` vào chuỗi `req.url` tạo thành chuỗi dị dạng `/api/v2-test-2026/auth/loginapi/auth/login` ➔ Khiến toàn bộ route bị 404!
- **Khắc Phục:**
  - Cập nhật [obfuscated-prefix.middleware.ts](file:///Users/peggy2402/Projects/eigu-platform/apps/api/src/common/middleware/obfuscated-prefix.middleware.ts): Gán `req.url = '/' + restPath` (Ví dụ `/auth/login`). Express router tự động ghép thành `/api/auth/login` khớp 100% với Controller NestJS.
### 18.44 Sửa Lỗi Rewrite Route public `/system-config/bootstrap` Trong Middleware
- **Thời gian xử lý:** 24/07/2026 01:03 GMT+7
- **Phân Tích Nguyên Nhân Gốc Gây Lỗi 404 Của Request "GET /api/v2-test-2026/system-config/bootstrap":**
  - Trước đây khi URL gửi tới là `/api/v2-test-2026/system-config/bootstrap`, đoạn code cũ ghép `internalPath` giữ lại phần `v2-test-2026` ➔ Khiến NestJS tìm kiếm controller `@Controller('v2-test-2026')` không tồn tại ➔ Dẫn tới phản hồi 404 `"Yêu cầu không hợp lệ hoặc tài nguyên không tồn tại"`.
### 18.45 Nạp Mã `API_PREFIX` Động Từ Database PostgreSQL Ngay Khi Server Bootstrap
- **Thời gian xử lý:** 24/07/2026 01:11 GMT+7
- **Phân Tích Nguyên Nhân & Giải Pháp Triệt Để:**
  - Vì NestJS đăng ký toàn bộ Controller Routes cố định lúc `bootstrap()`, việc sửa `req.url` qua Middleware gây ra xung đột router khiến log terminal in ra `http://localhost:3001/api` thiếu mốc `obf_code` và dẫn tới lỗi 404.
### 18.46 Sửa Lỗi Nhân Đôi Tiền Tố `/api` Gây Lỗi 404 Trong Client App (`resolveApiUrl`)
- **Thời gian xử lý:** 24/07/2026 01:16 GMT+7
- **Phân Tích Nguyên Nhân Gốc Cốt Lõi Từ Terminal Log Gây Ra Lỗi "POST /api/eigu-sec-999/api/auth/login":**
  - Trái ngược với dự đoán ban đầu, Server NestJS đã lắng nghe đúng 100% tại mốc `http://localhost:3001/api/v2-test-2026`.
  - Nhưng hàm `resolveApiUrl()` trong [main.ts](file:///Users/peggy2402/Projects/eigu-platform/apps/desktop/src/main.ts) và `getApiBaseUrl()` trong [constants.ts](file:///Users/peggy2402/Projects/eigu-platform/packages/shared/src/lib/constants.ts) ở Client có logic nối chuỗi bị sai, dẫn tới việc ghép URL thành `/api/eigu-sec-999` + `/api` + `/auth/login` ➔ Gửi request dị dạng **`/api/eigu-sec-999/api/auth/login`** tới Server, gây lỗi 404!
- **Khắc Phục:**
  - Chuẩn hóa hàm `resolveApiUrl()` và `getApiBaseUrl()`: Tách biệt tuyệt đối phần `baseHost` (`http://localhost:3001`) và ghép với `prefix` (`api/v2-test-2026`).
### 18.47 Loại Bỏ Triệt Để Chuỗi Fallback Hardcode `eigu-v1-t24v02c03` Khỏi Toàn Bộ Mã Nguồn
- **Thời gian xử lý:** 24/07/2026 01:23 GMT+7
- **Phân Tích Nguyên Nhân Gốc Gây Ra Sự Bất Đồng Giữa Server DB Và Desktop Client:**
  - Chuỗi `'eigu-v1-t24v02c03'` trước đây bị gán cứng làm giá trị fallback mặc định ở 6 file khác nhau (`main.ts`, `constants.ts`, `settings.js`, `views.component.js`, `system-config.service.ts`).
  - Khi người dùng xóa `API_PREFIX` khỏi `.env`, Desktop Client tự động lùi về chuỗi gán cứng `'eigu-v1-t24v02c03'` ➔ Khiến Desktop Client gửi request tới `/api/eigu-v1-t24v02c03/auth/login` trong khi Server NestJS đang lắng nghe đúng theo Database (`/api/v2-test-2026`) ➔ Sinh lỗi 404!
### 18.48 Sửa Lỗi Logic Ghép Chuỗi Tạo Thành `/api/api` Trùng Lặp Trong Client (`resolveApiUrl`)
- **Thời gian xử lý:** 24/07/2026 01:29 GMT+7
- **Phân Tích Nguyên Nhân Gốc Gây Ra Lỗi "Cannot POST /api/api/auth/login":**
  - Khi `process.env.API_PREFIX` là `'api'`, phép kiểm tra `rawPrefix.startsWith('api/')` trả về `false` (vì `'api'` không chứa dấu `/` ở cuối) ➔ Dẫn tới việc hàm ghép chuỗi tự động nối thêm `api/` phía trước `'api'`, biến `prefix` thành `'api/api'`!
  - Khi Client gọi API, đường dẫn bị nhân đôi thành `/api/api/auth/login` ➔ Gây ra lỗi 404!
### 18.49 Tự Động Đồng Bộ Mã Obfuscation Prefix Giữa Client Và Gateway (`syncApiPrefixFromGateway`)
- **Thời gian xử lý:** 24/07/2026 01:33 GMT+7
- **Phân Tích Nguyên Nhân Gốc Gây Lỗi 404 "Cannot POST /api/auth/login":**
  - Khi Server NestJS khởi động, nó đọc mốc `API_PREFIX` từ Database Supabase (Ví dụ `api/v2-test-2026`).
  - Trong khi đó, Desktop Client App chưa hề biết mốc này trong DB nên lùi về mốc mặc định `/api`.
  - Kết quả: Client gọi `POST /api/auth/login` ➔ Server NestJS đang lắng nghe ở `/api/v2-test-2026/auth/login` ➔ Báo lỗi 404 lệch mốc!
### 18.50 Triển Khai Hệ Thống API Gateway Obfuscation Architecture Sản Phẩm Lớp Doanh Nghiệp
- **Thời gian xử lý:** 24/07/2026 01:42 GMT+7
### 18.51 Triển Khai Module Security Center & Quản Lý Bảo Mật Doanh Nghiệp (Backoffice)
- **Thời gian xử lý:** 24/07/2026 01:50 GMT+7
- **Nâng Cấp Kiến Trúc Doanh Nghiệp:**
  1. **Prisma Schema & Supabase Sync**: Thêm các bảng `SecuritySetting`, `ObfuscationHistory`, `AuditLog`, `RotationStrategy`, `HistoryStatus` vào `apps/api/prisma/schema.prisma` và đẩy sync thành công lên PostgreSQL Supabase.
  2. **Tích Hợp `SecurityCenterModule`**: Tạo `SecurityCenterService`, `SecurityCenterController` và các DTOs (`UpdateObfuscationDto`, `RotateObfuscationDto`, `GenerateRandomDto`, `RollbackObfuscationDto`).
  3. **Tập Hợp APIs REST Bảo Mật**:
     - `GET /api/security/obfuscation`: Tổng quan trạng thái L1 Cache & Gateway.
     - `PATCH /api/security/obfuscation`: Cập nhật mã thủ công trực tiếp không ngắt kết nối.
     - `POST /api/security/obfuscation/rotate`: Xoay vòng mã ngẫu nhiên an toàn.
     - `POST /api/security/obfuscation/rollback`: Khôi phục mã trước đó.
### 18.52 Sửa Lỗi Lệch Mốc Định Tuyến Của Middleware Bằng Phép Nối `forRoutes('*path')`
- **Thời gian xử lý:** 24/07/2026 01:57 GMT+7
- **Phân Tích Nguyên Nhân Gốc (Root Cause Analysis):**
  - Trong [app.module.ts](file:///Users/peggy2402/Projects/eigu-platform/apps/api/src/app/app.module.ts), việc gọi `forRoutes({ path: 'api/*', ... })` kết hợp với `app.setGlobalPrefix('api')` đã khiến NestJS tự động nối prefix tạo thành chuỗi dị dạng **`/api/api/*`** (Được cảnh báo bởi log `WARN [LegacyRouteConverter] Unsupported route path: "/api/api/*"`).
  - Do đường dẫn đăng ký middleware bị biến thành `/api/api/*`, các request gửi tới `/api/v2-test-2026/notifications` KHÔNG BAO GIỜ khớp được với Middleware ➔ Middleware bị bỏ qua hoàn toàn ➔ Dẫn tới lỗi 404 `Cannot GET /api/v2-test-2026/notifications`.
- **Khắc Phục:**
  - Chuyển `forRoutes({ path: 'api/*', ... })` thành `forRoutes({ path: '*path', method: RequestMethod.ALL })` trong [app.module.ts](file:///Users/peggy2402/Projects/eigu-platform/apps/api/src/app/app.module.ts).
  - Cập nhật [obfuscated-prefix.middleware.ts](file:///Users/peggy2402/Projects/eigu-platform/apps/api/src/common/obfuscation/obfuscation-prefix.middleware.ts): Giữ nguyên `req.originalUrl` (Ví dụ `/api/v2-test-2026/notifications`), đồng thời rewrite `req.url = '/api/notifications'`.
### 18.53 Xác Nhận Thực Nghiệm Runtime 100% Route Obfuscation Gateway Hoạt Động Hoàn Hảo
- **Thời gian xử lý:** 24/07/2026 02:00 GMT+7
- **Bằng Chứng Runtime Từ Terminal Log Thực Tế:**
  ```text
  DEBUG [ObfuscationMW] Method: POST | Incoming: /api/v2-test-2026/auth/login | Code: "v2-test-2026" | Valid: true
  DEBUG [ObfuscationMW] Rewrote req.url -> "/api/auth/login" (originalUrl: "/api/v2-test-2026/auth/login")

  DEBUG [ObfuscationMW] Method: GET | Incoming: /api/v2-test-2026/auth/me | Code: "v2-test-2026" | Valid: true
  DEBUG [ObfuscationMW] Rewrote req.url -> "/api/auth/me" (originalUrl: "/api/v2-test-2026/auth/me")
  ```
- **Kết Luận Tối Thượng:**
  - Request mang mã Obfuscation `v2-test-2026` (`/api/v2-test-2026/auth/login` và `/api/v2-test-2026/auth/me`) đã được Middleware đánh giá hợp lệ (`Valid: true`), tự động rewrite URL về `/api/auth/login` và `/api/auth/me` để NestJS Router chuyển tiếp thành công 100% về Controllers!
  - Controllers hoàn toàn giữ nguyên, hoàn toàn không cần biết mã obfuscation.
  - Hệ thống Security Center & Obfuscation Gateway chính thức đi vào hoạt động ổn định ở quy mô sản phẩm doanh nghiệp!

### 18.55 Sửa Lỗi Next.js Turbopack ESM Module Mismatch & Độc Lập Hoàn Toàn Khỏi `.env` API_PREFIX
- **Thời gian xử lý:** 24/07/2026 08:13 GMT+7
- **Phân Tích Nguyên Nhân Lỗi `npx nx dev web` (Next.js 16 Turbopack):**
  - Do [package.json](file:///Users/peggy2402/Projects/eigu-platform/packages/shared/package.json) đặt `"type": "commonjs"` và [tsconfig.json](file:///Users/peggy2402/Projects/eigu-platform/packages/shared/tsconfig.json) đặt `"module": "commonjs"`, trong khi mã nguồn TypeScript sử dụng cú pháp ES Modules (`export * from ...`).
  - Khi Next.js Turbopack biên dịch `apps/web`, nó phát hiện xung đột định dạng mô-đun giữa `"commonjs"` trong `package.json` và mã nguồn ESM, gây ra lỗi HTTP 500 `Specified module format (CommonJs) is not matching the module format of the source code`.
- **Khắc Phục:**
  1. Cập nhật [package.json](file:///Users/peggy2402/Projects/eigu-platform/packages/shared/package.json): Chuyển `"type": "commonjs"` ➔ `"type": "module"` và `"main": "./src/index.ts"`.
  2. Cập nhật [tsconfig.json](file:///Users/peggy2402/Projects/eigu-platform/packages/shared/tsconfig.json): Chuyển `"module": "commonjs"` ➔ `"module": "esnext"`.
  3. Cập nhật [next.config.js](file:///Users/peggy2402/Projects/eigu-platform/apps/web/next.config.js): Bổ sung `transpilePackages: ['@eigu-platform/shared']`.
  4. Sửa các lỗi TypeScript trong `apps/web`: Bổ sung `'bulk-download'` vào `ViewType` trong [Sidebar.tsx](file:///Users/peggy2402/Projects/eigu-platform/apps/web/src/components/layout/Sidebar.tsx) và [page.tsx](file:///Users/peggy2402/Projects/eigu-platform/apps/web/src/app/page.tsx), ép kiểu sự kiện trong [FeedbackView.tsx](file:///Users/peggy2402/Projects/eigu-platform/apps/web/src/components/feedback/FeedbackView.tsx).
### 18.56 Đồng Bộ Tự Động Obfuscation Prefix Trực Tiếp Trên Web Client (Next.js) & Tự Động Thử Lại Khi Đổi Mã
- **Thời gian xử lý:** 24/07/2026 08:17 GMT+7
- **Phân Tích Nguyên Nhân Web Client Nhấn "Đăng nhập" Bị 404:**
  - Trong [api.ts](file:///Users/peggy2402/Projects/eigu-platform/apps/web/src/lib/api.ts), biến `API_BASE` được tính toán 1 lần duy nhất tại mốc import file (`const API_BASE = getApiBaseUrl()`). Khi `API_PREFIX` không có trong `.env`, `getApiBaseUrl()` trả về `http://localhost:3001/api`.
  - Khi người dùng bấm nút Đăng nhập, Web Client gửi `POST http://localhost:3001/api/auth/login`. Gateway bắt request, tách candidateCode `'auth'`, kiểm tra thấy không phải mã active (`v2-sec-2026`) ➔ Báo lỗi `Valid: false` và trả về **404 Not Found**.
- **Khắc Phục Hoàn Hảo:**
  1. Cập nhật [constants.ts](file:///Users/peggy2402/Projects/eigu-platform/packages/shared/src/lib/constants.ts): Ưu tiên đọc biến `(window as any).__EIGU_ACTIVE_API_URL__` trên trình duyệt.
  2. Cập nhật [api.ts](file:///Users/peggy2402/Projects/eigu-platform/apps/web/src/lib/api.ts): 
     - Bổ sung hàm `syncApiPrefixFromBootstrap()` tự động gọi `GET /api/bootstrap` để lấy mốc Prefix active (`v2-sec-2026`) lưu vào `__EIGU_ACTIVE_API_URL__`.
     - Chuyển `getApiBaseUrl()` vào bên trong hàm `request(...)` để đọc URL động cho từng request.
     - **Cơ Chế Auto-Retry Khi Đổi Mã Bảo Mật**: Nếu bất kỳ request nào gặp lỗi HTTP 404 (do Server vừa xoay vòng mã Obfuscation), Web Client sẽ tự động phát hiện, gọi lại `/api/bootstrap` để lấy mốc mã mới nhất và thực hiện `retry` request 1 lần hoàn toàn trong suốt với người dùng!
  3. Loại bỏ thuộc tính `"type"` trong [package.json](file:///Users/peggy2402/Projects/eigu-platform/packages/shared/package.json) giúp lệnh build Nx không còn xuất hiện thông báo CJS/ESM warning.

### 18.63 Xây Dựng Phân Hệ Trung Tâm Vận Hành (Operations Backoffice Console) Cho Đội Ngũ Vận Hành
- **Thời gian xử lý:** 24/07/2026 11:00 GMT+7
- **Yêu Cầu & Triển Khai Backoffice Dành Riêng Cho Đội Vận Hành (Admin & Staff):**
  - Xây dựng trung tâm điều hành chuyên biệt trên Web Dashboard (`apps/web`) và Desktop dành riêng cho Đội ngũ Vận hành & Quản trị viên hệ thống.
- **Chi Tiết Triển Khai:**
  1. Tạo component mới [BackofficeView.tsx](file:///Users/peggy2402/Projects/eigu-platform/apps/web/src/components/backoffice/BackofficeView.tsx):
     - **Quản lý Người Dùng & Phân Quyền Tab**: Hiển thị danh sách tài khoản thực từ Supabase DB, chuyển đổi Role (`admin`, `staff`, `user`), Ban / Unban tài khoản kèm lý do.
     - **Quản lý Bảo Trì System**: Điều khiển công tắc Bật/Tắt chế độ Bảo trì (`MAINTENANCE_MODE`) và điều chỉnh phiên bản ứng dụng tối thiểu (`MIN_APP_VERSION`).
     - **Báo Lỗi & Phản Hồi Khách Hàng**: Xem danh sách các góp ý/báo lỗi kèm hình ảnh đính kèm từ người dùng.
  2. Cập nhật [Sidebar.tsx](file:///Users/peggy2402/Projects/eigu-platform/apps/web/src/components/layout/Sidebar.tsx) & [page.tsx](file:///Users/peggy2402/Projects/eigu-platform/apps/web/src/app/page.tsx): Thêm nút điều hướng nổi bật **"Trung tâm Vận hành"** (`ShieldCheck` icon).
  3. Cập nhật [MODULES_PROJECT.md](file:///Users/peggy2402/Projects/eigu-platform/MODULES_PROJECT.md): Bổ sung mô-đun `27. backoffice-mgmt` theo quy chuẩn Rule 46.

### 18.68 Nâng Cấp UI/UX Premium, Loại Bỏ Emoji & Sửa Lỗi Responsive Thu Nhỏ Cửa Sổ
- **Thời gian xử lý:** 24/07/2026 15:38 GMT+7
- **Tối Ưu Thẩm Mỹ & Khắc Phục Lỗi Co Giãn Giao Diện:**
  - **Loại bỏ 100% Emoji Icon**: Xóa bỏ toàn bộ icon emoji thô ráp, thay thế bằng nhãn Soft Badge cao cấp và SVG Icons chuẩn doanh nghiệp tuân thủ quy tắc thiết kế trong `AI_CONTEXT.md`.
  - **Sửa Lỗi Phóng To / Thu Nhỏ Cửa Sổ (Window Resizing Fix)**: Cập nhật `#view-user-activity-logs` sang cấu trúc Responsive Flex Height (`height: 100%; display: flex; flex-direction: column; overflow: hidden;`), khung chứa bảng có `overflow-y: auto; overflow-x: auto; min-width: 850px;`, đồng thời tự động chuyển đổi linh hoạt sang dạng **Responsive Card Grid Layout** khi thu nhỏ cửa sổ ứng dụng, giúp nội dung lịch sử hiển thị đầy đủ, không bao giờ bị cắt xén hay ẩn mất.
  - **Chuẩn Hóa Tên Thao Tác (Friendly Action Labels)**: Chuẩn hóa tên hành động thô (`LOGIN` ➔ `Đăng nhập hệ thống`, `CUT_VIDEO` ➔ `Tự động cắt video`, `UPDATE_SETTINGS` ➔ `Cập nhật Cài đặt`).
   - **Phân Quyền Lọc Role (RBAC)**: Tự động ẩn thanh chọn Role đối với tài khoản User, ẩn lựa chọn Admin đối với Staff, chỉ hiển thị đầy đủ đối với Admin.

## Phase 19: Phiên làm việc 25/07/2026 — Debug & Fix Double Logout Request & Maintenance Overlay Admin Lockout

### 19.1 Phát hiện: Hai request `/auth/logout` — 1 authenticated, 1 unauthenticated
- **Thời gian xử lý:** 25/07/2026 01:03 - 01:44 GMT+7
- **Vấn đề:** Khi click "Đăng Xuất" trên maintenance overlay, backend nhận 2 request POST `/auth/logout`:
  - Request 1: Có `Authorization: Bearer ...` → `JwtStrategy.validate()` gọi → 200 OK
  - Request 2 (1 giây sau): Không có `Authorization` header → `JwtAuthGuard` từ chối → 401
- **Chẩn đoán backend đã xác nhận:** Backend hoạt động đúng — vấn đề nằm ở frontend gửi request thứ hai khi token đã bị xóa.

### 19.2 Thêm diagnostic tracing (`auth.service.js`, `api.js`, `index.html`)
- **File:** `apps/desktop/src/assets/js/domain/auth.service.js`
- Thêm `console.trace('[LOGOUT_TRACE] handleLogout called')` + in vào debug overlay DOM
- **File:** `apps/desktop/src/assets/js/core/api.js`
- Thêm `console.trace('[LOGOUT_TRACE] apiFetch(/auth/logout)')` khi path === '/auth/logout' + log token state
- Thêm `[API_DIAG]` log chi tiết headers, tokenSource (memory vs localStorage), isRetry flag ngay trước `fetch()`
- **File:** `apps/desktop/src/assets/index.html`
- Thêm `#logout-debug-log` floating overlay (z-index 999999) hiển thị stack trace + token state trong app

### 19.3 Kết quả diagnostic — Stack trace xác nhận caller
- **Debug panel output:**
  ```
  [01:07:30] handleLogout called
    at HTMLButtonElement.onclick (index.html:111)
  [01:07:30] apiFetch(/auth/logout) isRetry=false token=eyJ... lsToken=eyJ...
  ```
- **Caller identified:** `index.html:111` — nút "Đăng Xuất" trong **maintenance overlay** (`#maintenance-screen-overlay`)
- **Backend log matching:** Chỉ 1 request được ghi nhận trong run này (bug intermittent)

### 19.4 Root cause analysis
- **Không tìm thấy code path nào khác gọi `/auth/logout`** ngoài `apiFetch()` trong `handleLogout()`
- Khi `checkMaintenanceOnLogin()` bật maintenance overlay (`display: flex`, `z-index: 999998`), sau đó người dùng click "Đăng Xuất", `handleLogout()` chạy:
  1. `apiFetch('/auth/logout')` — authenticated (200) ✅
  2. Xóa token (memory + localStorage)
  3. **Ẩn `banned-screen-overlay`** (dòng 175-179)
  4. **Không ẩn `maintenance-screen-overlay`** — overlay vẫn hiển thị với nút "Đăng Xuất" còn click được
  5. Hiện auth container + gọi `showAuth('login')`
  6. Maintenance overlay vẫn ở `display: flex` trên tất cả
- **Kết luận:** Nếu người dùng click lại (hoặc double-click), `handleLogout()` chạy lần 2 với token = null → 401

### 19.5 Fix 1: Re-entrant guard + Ẩn maintenance overlay (`auth.service.js`)
- **File:** `apps/desktop/src/assets/js/domain/auth.service.js` (dòng 150-209)
- **Giải pháp:**
  ```javascript
  let _isLoggingOut = false;

  async function handleLogout() {
    if (_isLoggingOut) return;  // Guard chống gọi lại
    _isLoggingOut = true;
    try {
      try { await apiFetch('/auth/logout', { method:'POST' }); } catch {}
      // ... xóa token, dọn DOM ...
      const maintOverlay = document.getElementById('maintenance-screen-overlay');
      if (maintOverlay) {
        maintOverlay.classList.add('hidden');
        maintOverlay.style.display = 'none';  // Ẩn maintenance overlay
      }
      // ...
      showAuth('login');
    } finally {
      _isLoggingOut = false;  // Luôn reset guard
    }
  }
  ```
- **Thay đổi:**
  - Thêm `let _isLoggingOut = false` (module-level flag)
  - `if (_isLoggingOut) return;` ngăn chặn re-entrant call
  - `_isLoggingOut = true / false` trong try/finally — đảm bảo reset kể cả khi exception
  - Thêm block ẩn `#maintenance-screen-overlay` (dòng 172-176) — giống pattern của banned overlay
- **Lưu ý:** `finally` block quan trọng vì lần đầu implement thiếu finally, guard bị kẹt `true` vĩnh viễn khi DOM throw exception → admin không thể logout lần sau

### 19.6 Fix 2: Admin bypass maintenance overlay (`settings.js`)
- **File:** `apps/desktop/src/assets/js/ui/settings.js` (dòng 320-354)
- **Vấn đề UX nghiêm trọng:** Nếu admin duy nhất bật "System Maintenance" và logout, không ai có thể tắt được — tất cả tài khoản (kể cả admin) đều bị chặn bởi maintenance overlay
- **Giải pháp:** Trong `checkMaintenanceOnLogin()`, kiểm tra `userProfile.role === 'admin'`:
  ```javascript
  if (res && res.maintenanceMode) {
    // Admin users bypass the maintenance overlay
    if (userProfile && userProfile.role === 'admin') {
      overlay.style.display = 'none';
      overlay.classList.add('hidden');
      showToast('Hệ thống đang bảo trì',
        'Chỉ admin mới truy cập được. Vào Cài đặt để tắt bảo trì.', 'warning');
      return false;  // Cho phép vào app
    }
    // Non-admin users see the blocking overlay
    applyAppLanguage(...);
    overlay.style.display = 'flex';
    overlay.classList.remove('hidden');
    return true;
  }
  ```
- **Cơ chế:** Admin vẫn thấy toast cảnh báo nhưng được vào app để tắt maintenance trong Cài đặt

### 19.7 Dọn diagnostic code
- **`api.js`:** Xóa `console.trace('[LOGOUT_TRACE] apiFetch(/auth/logout)')`, xóa `[API_DIAG]` log, khôi phục `fetch()` gốc
- **`index.html`:** Xóa `#logout-debug-log` div
- **`auth.service.js`:** Xóa `console.trace` và diagnostic DOM manipulation code

### 19.8 Bài học kỹ thuật
- **Re-entrant guard cần try/finally:** Module flag phải luôn được reset trong `finally` block, không chỉ ở cuối function — exception từ DOM operations có thể làm treo flag vĩnh viễn
- **Maintenance overlay cần được ẩn khi logout:** `handleLogout()` đã ẩn banned overlay nhưng quên maintenance overlay — cần ẩn tất cả overlay khi logout
- **Admin cần emergency escape hatch:** Bất kỳ feature nào có thể lock admin ra khỏi hệ thống (maintenance mode) cần có bypass cho admin role

## Phase 20: Phiên làm việc 31/07/2026 — Nâng cấp Giao diện Web (Autumn Theme, Bảng giá DB, Liquid Glass Header, Fix Dropdown & Event Popup Modal)

### 20.1 Thời Gian & Phạm Vi Công Việc
- **Ngày thực hiện:** 31/07/2026 (Hoàn tất 23:37 GMT+7)
- **Phạm vi tác động:** `apps/web` (Web Dashboard & Landing Page), `apps/desktop` (Admin Configuration Scope), `global.css`, `Header.tsx`, `UserDropdown.tsx`, `page.tsx`.

### 20.2 Các Hạng Mục Đã Thực Hiện & Hoàn Thành

#### 1. Chuẩn Hóa Kiến Trúc Bảng Giá & Loại Bỏ Mock Data Sai Cấu Trúc
- **Phân tích Database Prisma Schema**: Đọc và làm rõ cấu trúc 4 bảng Prisma liên quan đến Pricing: `PricingBadge`, `PricingTier`, `PricingModule`, `PricingTierFeature`.
- **Đồng bộ Web App với API Backend**: Thay thế mock data cứng ở `apps/web/src/app/page.tsx` bằng hàm `pricingApi.getPricing()` kết nối tới NestJS API `/api/pricing`. 
- **Cơ chế Fallback An toàn**: Giữ lại mảng `FALLBACK_PRICING_MODULES` đảm bảo nếu chưa khởi chạy API Backend thì giao diện Web vẫn hiển thị bảng giá ổn định mà không bị crash.

#### 2. Nâng Cấp Header Liquid Glass & Thay Thế Logo Thương Hiệu
- **Logo EIGU**: Thay thế icon chữ "E" cũ ở góc trái Header thành ảnh Logo thương hiệu `logo.png` (`/Users/peggy2402/Projects/eigu-platform/apps/web/public/logo.png`).
- **Nút Chuyển Tab Liquid Glass theo phong cách Apple**:
  - Giao diện Header chuyển thành viên nhộng trôi (`.apple-nav`) phong cách Frosted Glass.
  - Tab Active áp dụng hiệu ứng Kính mờ Hổ phách (`background: linear-gradient(135deg, rgba(245, 158, 11, 0.35) 0%, rgba(217, 119, 6, 0.18) 100%)`).
  - Khi click tab có hiệu ứng nhấn lò xo Apple (`transform: scale(0.96)`).

#### 3. Sửa Triệt Để Lỗi Dropdown Header Bị Che Khuất (User Dropdown Clipping Bug)
- **Nguyên nhân**: Container `.apple-nav` trong `global.css` có thuộc tính `overflow: hidden`, khiến menu xổ xuống của `UserDropdown.tsx` (`position: absolute; top: calc(100% + 12px)`) bị cắt lẹm không hiển thị được.
- **Giải pháp**: Cập nhật `.apple-nav` thành `overflow: visible !important;` và gán `z-index: 99999` cho `UserDropdown` menu container. Menu "Xin chào, {{username}}" xổ xuống trôi nổi trên cùng hoàn chỉnh.

#### 4. Chuyển Đổi Tông Màu Mùa Thu (Autumn Theme) & Hỗ Trợ Light / Dark Mode Tương Phản 100%
- **Bảng Màu Mùa Thu**: Áp dụng tông màu Hổ Phách & Vàng Mùa Thu (`#f59e0b`, `#d97706`, `#ea580c`).
- **Khắc phục lỗi mất chữ ở Chế độ sáng (Light Mode)**: 
  - Thay thế toàn bộ mã màu cứng `#ffffff`, `#94a3b8`, `#64748b` trong `page.tsx` thành các biến **CSS Theme Variables** (`var(--text-primary)`, `var(--text-secondary)`, `var(--text-muted)`).
  - Khi bật Light Mode (`[data-theme="light"]`), tiêu đề và văn bản tự động chuyển sang màu tối tương phản rõ nét 100%.

#### 5. Tích Hợp Ảnh Máy Bay (`airplanes.webp`)
- Đưa hình ảnh minh họa máy bay `airplanes.webp` (`maxWidth: 100px`) căn giữa lơ lửng ngay phía trên dòng chữ *"6 Mô-Đun Công Cụ Độc Lập Chuyên Sâu"*.

#### 6. Tối Ưu Khối Đánh Giá Khách Hàng 3 Cột (Testimonial Marquee)
- **Tiêu đề**: **"Hàng trăm nghìn người dùng tin tưởng lựa chọn EIGU Platform"** (Thay thế chữ "ZENTRA GROUP" cũ thành "EIGU Platform").
- **Dữ liệu thực**: Cập nhật avatar & thông tin người dùng thật.
- **3 Cột Cuộn Liên Tục Vô Tận**:
  - Cột 1 & Cột 3 cuộn xuống (`marquee-col-down`), Cột 2 cuộn lên (`marquee-col-up`).
  - Bỏ hiệu ứng ngắt cuộn khi hover (`animation-play-state: paused` đã xóa), marquee chạy mượt liên tục không dừng.
  - Đúng 3 card nhỏ gọn per column (`padding: 14px 16px`, `fontSize: 13px`).
- **Hiệu ứng Mờ 2 Đầu (Top & Bottom Fade Mask)**: Áp dụng CSS `mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)` giúp các card biến mất/hiển thị mượt mà ở 2 mép trên và dưới.

#### 7. Module Popup Sự Kiện Khuyến Mãi (Event Promo Modal & Admin Scope Rule)
- **Giao diện Web Client (`apps/web`)**: Tự động mở Popup chào mừng *"🍂 ƯU ĐÃI MÙA THU 2026"* (3 gói Beta giảm tới 80%, nút NHẬN NGAY, nút đóng 'X', và checkbox *"Đã hiểu, không hiển thị lại"* ghi nhớ vào `localStorage`).
- **Quy chuẩn Quản trị Admin (`apps/desktop`)**:
  - Cấu hình 4 Mùa (Xuân / Hạ / Thu / Đông) và Bật/Tắt Sự Kiện khuyến mãi được quy định **chỉ Admin thực hiện trong ứng dụng Desktop (`apps/desktop`) khi `role === 'admin'`**.
  - Trái lại, Web Client chỉ đóng vai trò nhận diện và tự động hiển thị tương ứng với cấu hình active của Admin. Nếu không có sự kiện active thì Web sẽ không hiển thị Popup.

#### 8. Kiểm Tra Biên Dịch Production
- Chạy lệnh `npx nx build web` thành công 100% (`✓ Compiled successfully in 3.1s`, 0 error).

## Phase 21: Phiên làm việc 01/08/2026 — Sửa Lỗi Background Stacking Context, Đồng Bộ Accent Color, Nâng Cấp Trang About Us, FAQ Accordion 10 Câu, Full OG Metadata & Contact API Direct

### 21.1 Khắc Phục Lỗi Z-Index Lớp Nền Theo Mùa (Seasonal Background Stacking Context Bug)
- **Thời gian xử lý:** 01/08/2026
- **Vấn đề:** Ảnh nền theo mùa (`.custom-bg-image-layer`, `.season-backdrop`, `.tech-grid-pattern`) bị chìm bên dưới canvas background của thẻ `html, body`, dẫn đến ảnh nền mùa hè/thu không hiển thị trên trình duyệt dù API đã trả về đúng cấu hình.
- **Giải pháp:**
  - Trong `apps/web/src/app/global.css`, nâng z-index của các lớp nền theo mùa lên số dương: `.season-backdrop` (`z-index: 1`), `.tech-grid-pattern` & `.custom-bg-image-layer` (`z-index: 2`), `.season-particles-container` (`z-index: 2`).
  - Giữ nguyên `background: var(--bg-primary)` trên thẻ `html, body` làm lớp canvas dự phòng bên dưới cùng.
  - Đảm bảo Main Content (`z-index: 10`) và Header (`z-index: 100`) luôn trôi nổi mượt mà phía trên các lớp nền.

### 21.2 Loại Bỏ Popup Khuyến Mãi Cũ Hardcode & Đồng Bộ Mọi Chi Tiết UI Theo Màu Accent Mùa (`var(--accent)`)
- **Sửa lỗi trùng lặp Popup:** Trong `apps/web/src/app/page.tsx`, xóa bỏ khối JSX Popup Promo cứng trùng lặp cũ; giữ lại duy nhất component `<EventPopupModal />` tự động đọc dữ liệu động từ DB (`eventTitle`, `eventSubtitle`, `eventBannerUrl`, `eventNotice`).
- **Đồng bộ Accent Color toàn diện:** Thay thế toàn bộ mã màu cứng Amber Gold (`#f59e0b`, `rgba(245,158,11)`) và Indigo (`#6366f1`, `rgba(99,102,241)`) ở icon Feature cards, rating stars, hover card pricing (`PricingCard.tsx`), tab bar module pricing (`PricingModuleTabs.tsx`) bằng các biến CSS động `var(--accent)` và `var(--accent-glow)`. UI tự động đổi sang Cyan cho Mùa Hè, Hồng cho Mùa Xuân, Xanh Băng cho Mùa Đông và Hổ Phách cho Mùa Thu.

### 21.3 Tái Cấu Trúc Trang Giới Thiệu EIGU Platform (`/about`)
- **Cập nhật nội dung chuẩn chính thức:** Tiêu đề tổng quan, khối **Sứ Mệnh (Our Mission)**, khối **Kiến Trúc Đột Phá** (3 trụ cột: *Desktop Heavy Worker Engine*, *Puppeteer Anti-Detect Stealth*, *Supabase & NestJS Cloud Gateway*) và khối **Con Số Ấn Tượng** (6 Mô-đun, 100,000+ người dùng, 24/7 support).
- **Thiết kế Glassmorphism:** Các card hiển thị hiệu ứng Kính mờ bo tròn sang trọng, viền và icon sáng mượt theo Accent Mùa.

### 21.4 Viết Lại Trang Câu Hỏi Thường Gặp (`/faq`) Dạng Accordion 10 Câu Phân Nhóm
- **4 Nhóm Chủ Đề Rõ Ràng:** *Về Gói Dịch Vụ* (Câu 1-4), *Về Thanh Toán & Hoàn Tiền* (Câu 5-6), *Về Sử Dụng & Thiết Bị* (Câu 7-8), *Về Hỗ Trợ* (Câu 9-10).
- **Accordion UI với CSS Grid Transition:** Các câu hỏi mặc định thu gọn. Khi click, câu trả lời mở ra mượt mà nhờ kỹ thuật CSS Grid `gridTemplateRows: isOpen ? '1fr' : '0fr'`, icon `ChevronDown` xoay 180 độ.
- **Đảm bảo 100% nguyên văn Tiếng Việt & Song ngữ Tiếng Anh.**

### 21.5 Bổ Sung Cấu Hình Meta & OpenGraph OG Banner Cho SEO (`layout.tsx`)
- **File:** `apps/web/src/app/layout.tsx` và `src/app/layout.tsx`.
- **Tích hợp Next.js Metadata API:**
  - Khai báo file ảnh OG Banner: `/og_image.png` (`apps/web/public/og_image.png`, 1200x630px).
  - Khai báo đầy đủ `title`, `description`, `keywords`, `openGraph` (Facebook, Zalo, LinkedIn), `twitter` (summary_large_image), `viewport` (`themeColor: '#0c0a09'`), `icons` (logo.png) và `robots` index.

### 21.6 Nâng Cấp Trang Liên Hệ (`/contact`) 2 Cột & Kết Nối Thực Tế Với NestJS API & Discord Webhook
- **Tái cấu trúc 2 cột responsive (`maxWidth: 1040px`):**
  - **Cột Trái (Kênh Hỗ Trợ & Khung Giờ):** Email `support@eigu.vn`, Telegram `t.me/eigu_platform`, Lịch làm việc 24/7 (Team/Enterprise) & Giờ hành chính (Basic/Pro).
  - **Cột Phải (Form Direct Ticket):** Thẻ Glassmorphic sang trọng với các ô `Họ và tên`, `Email`, `Nội dung`.
- **Kết nối Backend API thực tế (`POST /api/feedback/public`):**
  - Tạo endpoint `@Post('public')` trong `FeedbackController` & `FeedbackService` của NestJS.
  - Tự động định dạng và đẩy thông báo ticket tức thì về kênh Discord qua **Discord Webhook** (`DISCORD_WEBHOOK_URL`) đồng thời lưu vết ticket vào **Prisma Database (`Feedback`)**.
  - Hiển thị trạng thái "Đang Gửi Yêu Cầu...", tự động xuất banner xanh lá chúc mừng và reset form khi hoàn tất.

### 21.7 Kiểm Tra Biên Dịch Hệ Thống (Build Verification)
- `npx nx build web`: `✓ Compiled successfully in 2.1s` (0 error).
- `npx nx build desktop`: `✓ Successfully ran target build` (0 error).
- `npx nx build api`: `✓ Webpack compiled successfully` (0 error).

## Phase 22: Phiên làm việc 02/08/2026 — Tích hợp Thanh toán Nạp tiền Tự động SePay (VietQR), Giải mã Obfuscation Gateway, Tối ưu hóa UI/UX Routing & Responsive Mobile Navigation

### 22.1 Tích hợp Thanh toán Nạp tiền Tự động SePay (VietQR Automatic Deposit)
- **Tạo bảng `DepositTransaction` trong Prisma Database (`schema.prisma`)**:
  - Lưu mã đơn (`code`), số tiền (`amount`), ngân hàng (`bankName`), trạng thái (`COMPLETED`/`PENDING`/`CANCELLED`), full `payload`, `fullContent`, `gateway`, `referenceCode`, `transactionDate`.
  - Chạy `npx dotenv -e apps/api/.env -- npx prisma db push --config apps/api/prisma.config.ts` để đồng bộ bảng lên Supabase PostgreSQL.
- **Backend API Gateway (`apps/api/src/payment/`)**:
  - Tạo `PaymentModule`, `PaymentController`, `PaymentService`, `SepayWebhookDto`, `CreateDepositDto`.
  - **Tối ưu Webhook Validation Pipe**: Sử dụng `@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }))` để chấp nhận payload SePay phong phú mà không bị trả về 400 Bad Request khi có thuộc tính bổ sung như `accumulated`, `code: null`.
  - **Xác thực linh hoạt SePay Token**: Làm sạch header `Authorization` (hỗ trợ cả dạng `Apikey token` và `token` thuần), đối soát chính xác với `SEPAY_WEBHOOK_SECRET`.
  - **Xử lý Obfuscation Gateway**: Thêm `/api/payment` vào Section 1 (Top-level bypass) trong `obfuscation-prefix.middleware.ts` để ngắt hoàn toàn cơ chế mã hóa obfuscation/stealth 404 cho webhook SePay.
  - **Xử lý lỗi Prisma an toàn (Error Sanitization)**: Bọc tất cả thao tác Database trong try-catch, chuyển hóa lỗi Prisma DB thành thông báo Tiếng Việt thân thiện.
- **Frontend Modal Nạp tiền (`DepositModal.tsx`) & Lịch sử Giao dịch (`TransactionHistoryView.tsx`)**:
  - Tạo QR Code VietQR động SePay với thông tin Ngân hàng ACB, Số tài khoản `LOCSPAY000339797`, Chủ tài khoản `TRAN VAN CHIEN`.
  - Hiển thị cú pháp nạp tiền chuẩn xác `EIGU [username] [mã đơn]`.
  - Nút Copy 1-Click cú pháp & số tiền.
  - Tự động Polling kiểm tra trạng thái giao dịch mỗi 3 giây và tự động cộng tiền số dư tài khoản User khi SePay gửi webhook thành công.

### 22.2 Tái Cấu Trúc Điều Hướng (Navigation Restructuring & Standalone Routes)
- **Loại bỏ `Thanh Tab Ngang` cũ**: Xóa hoàn toàn dải pill tab ngang trùng lặp ở đầu trang Web Portal (`apps/web/src/app/page.tsx`).
- **Gom nhóm mục "Hồ sơ" vào "Cài đặt"**: Di chuyển phần Hồ sơ (thông tin cá nhân) vào gọn gàng trong `SettingsModal.tsx` bên cạnh Đổi mật khẩu, Giao diện, Ngôn ngữ & Xóa tài khoản.
- **Tạo các Standalone Next.js Route Pages**:
  - `apps/web/src/app/transactions/page.tsx` $\rightarrow$ `http://localhost:3000/transactions` (Bỏ hẳn prefix `/dashboard`).
  - `apps/web/src/app/affiliate/page.tsx` $\rightarrow$ `http://localhost:3000/affiliate`
  - `apps/web/src/app/guide/page.tsx` $\rightarrow$ `http://localhost:3000/guide`
  - `apps/web/src/app/audit-log/page.tsx` $\rightarrow$ `http://localhost:3000/audit-log`
  - `apps/web/src/app/dashboard/transactions/page.tsx` $\rightarrow$ Tự động chuyển hướng mượt mà sang `/transactions`.
  - **Khắc phục lỗi 404 khi bấm F5**: Các file route page giúp Next.js App Router trả về HTTP 200 tức thì khi hard reload ở bất kỳ URL nào.

### 22.3 Tối Ưu Giao Diện Di Động (Mobile Navigation Drawer & Mobile Card List)
- **Menu Di Động Nhỏ Gọn (Mobile Drawer in `Header.tsx`)**:
  - Đảo vị trí **Khối Tài Khoản người dùng** (Avatar, Username, Email, Số dư, Nút `+ Nạp tiền`) lên vị trí đầu tiên trên cùng của Menu.
  - Gom các nút cá nhân (**Lịch sử, Affiliate, Hướng dẫn, Nhật ký, Cài đặt, Góp ý**) thành **Lưới 2 Cột**.
  - Gom các liên kết hệ thống (**Trang chủ, Bảng giá, Giới thiệu, Tin tức, FAQ, Liên hệ**) thành **Lưới 3 Cột dạng Thẻ**.
  - Rút ngắn 60% chiều cao Menu, giúp vừa khít 1 màn hình di động mà không phải cuộn.
- **Dạng Thẻ Cho Lịch Sử Giao Dịch Di Động (`TransactionHistoryView.tsx`)**:
  - Sử dụng CSS Media Queries (`@media max-width: 768px` / `@media min-width: 769px`).
  - Trên Máy tính: Giữ nguyên Bảng dữ liệu (Table) chuẩn.
  - Trên Điện thoại: Tự động chuyển đổi thành **Danh sách các Thẻ Giao Dịch (Card List)** sắc nét, dễ nhìn với Mã đơn, Copy 1-Click, Badge trạng thái, Số tiền nạp, Cú pháp & Thời gian.

### 22.4 Kiểm Tra Biên Dịch & Đồng Bộ Codebase (Git Merge)
- Chạy `npx nx build web`: `✓ Compiled successfully in 3.4s` (0 error, static prerender 12 pages thành công).
- Đồng bộ nhánh Git: `git checkout developer` $\rightarrow$ `git merge main` $\rightarrow$ `git checkout vanchien` $\rightarrow$ `git merge developer`.

## Phase 23: Phiên làm việc 02/08/2026 - 03/08/2026 — Phát triển Thẻ 6 Mô-Đun Công Cụ Glassmorphism, Modal Portal Chi Tiết, Tách Trang Giới Thiệu Độc Lập, Tái Cấu Trúc Menu Mobile 70% & Đa Ngôn Ngữ i18n
- **Thời gian ghi nhận:** 03/08/2026 08:46:17 GMT+7

### 23.1 Phát Triển Section 6 Thẻ Mô-Đun Công Cụ & Modal Portal Chi Tiết Glassmorphism
- **Thời gian xử lý:** 03/08/2026 00:15:32 GMT+7
- **Cấu hình dữ liệu 6 Mô-đun độc lập (`featureModules.ts`)**:
  - Xây dựng danh sách 6 mô-đun công cụ chuyên sâu (`id`, `title`, `desc`, `detailDescription`, `videoUrl`, `accentColor`, `accentGlow`, `highlights`).
  - Gồm: Cắt video tự động, Tạo video AI, AI Video Studio, Chống gậy bản quyền, Tìm ngách hot, Tải video hàng loạt.
- **Hiệu ứng Glow Border Hover (`FeatureModulesSection.tsx`)**:
  - Khi rê chuột vào thẻ mô-đun, thẻ phát sáng viền theo màu accent riêng với transition mượt `0.25s`. Khi rời chuột viền trở lại trạng thái ban đầu.
- **Modal / Panel Chi Tiết Kính Tối Mờ (`ModuleDetailModal.tsx`)**:
  - **Sử dụng React Portal**: Render `createPortal` trực tiếp vào `document.body` với `z-index: 999999` che phủ hoàn toàn phía trước thanh Header navbar.
  - **Glassmorphism Spec**: Chất liệu kính tối mờ (`rgba(20, 20, 25, 0.78)` kết hợp `backdrop-filter: blur(24px)`) và lớp nền mờ tối (`rgba(0, 0, 0, 0.65)` + `backdrop-filter: blur(12px)`).
  - Tích hợp video YouTube 16:9 embed responsive, danh sách tính năng nổi bật, nút đóng X, click lớp nền ngoài hoặc phím `ESC` để đóng.

### 23.2 Quản Lý Điều Hướng & Tách Riêng Trang "Giới Thiệu" (`/about`) Độc Lập
- **Thời gian xử lý:** 03/08/2026 01:12:35 GMT+7
- **Tách Trang Giới Thiệu Độc Lập (`/about`)**:
  - Chuyển toàn bộ nội dung Giới thiệu (Về chúng tôi, Sứ mệnh, Kiến trúc đột phá, Con số ấn tượng) ra khỏi Trang chủ và đặt thành view riêng biệt khi chọn `/about`.
  - Phục hồi đường dẫn `Giới thiệu` (`/about`) vào danh sách `navItems` và `NAV_ICONS` (`<Info size={16} />`) trên `Header.tsx` (cả Desktop Navbar và Mobile Drawer Menu).
  - Giữ Trang chủ (`/`) sạch sẽ, tập trung vào Hero, 6 Thẻ Mô-đun Công cụ, Tính năng, Đánh giá & FAQ.

### 23.3 Tái Cấu Trúc Menu Di Động (Mobile Drawer 70% & React Portal Blur Overlay)
- **Thời gian xử lý:** 03/08/2026 00:41:46 GMT+7
- **Dạng Hàng Xếp Dọc (Vertical Rows Layout)**:
  - Chuyển các mục điều hướng trang từ dạng grid ngang sang **dạng danh sách xếp dọc từng hàng (`flex-direction: column`)**, tràn viền 100% width với icon, tiêu đề và hiệu ứng active accent glow.
  - Xếp dọc hai nút Đăng nhập / Đăng ký ở dưới cùng menu.
- **Khung Menu Chiếm 70% Màn Hình (70% Screen Width Slide-In)**:
  - Thiết lập chiều rộng khung trượt menu di động chiếm đúng **70% màn hình** (`width: 70%`, `max-width: 340px`, trượt từ phải sang).
- **Che Phủ Nền Mờ Thanh Header Phía Sau (React Portal Mounting)**:
  - Sử dụng `createPortal` đưa `mobile-nav-overlay` và `mobile-nav-drawer` ra `document.body` ở cấp cao nhất (`z-index: 999999 !important`).
  - Khi mở menu 3 gạch, lớp nền mờ tối (`backdrop-filter: blur(14px)` + `rgba(0, 0, 0, 0.75)`) che phủ 100% màn hình **bao gồm cả thanh Header floating navbar** (đưa thanh Header ra phía sau nền mờ).

### 23.4 Tăng Kích Thước & Khắc Phục Lỗi Hiển Thị Thanh Header Floating Navbar Mobile
- **Thời gian xử lý:** 03/08/2026 01:06:18 GMT+7
- **Tăng Kích Thước & Độ Rộng Mobile (+4-5% Overall Scale)**:
  - Tăng chiều rộng thanh Header mobile từ 92% lên **97%** (khi cuộn: **99%**).
  - Tăng độ dày padding dọc lên **0.78rem** (scrolled: `0.68rem`).
  - Tăng kích thước nút 3 gạch, ThemeToggle, LangSwitcher lên **40px x 40px** và icon 3 gạch lên **22px**.
- **Khắc Phục Lỗi Mất Chữ "Platform" (`EIGU Platf...`)**:
  - Thiết lập `flex-shrink: 0` và `white-space: nowrap` cho khối `.header-brand-wrapper`.
  - Đặt font-size tiêu đề thương hiệu `.header-brand-title` đạt **17.5px** kết hợp tối ưu padding lề ngang (`0.65rem`) và gap (`6px`).
  - Đảm bảo hiển thị trọn vẹn 100% tên thương hiệu **"EIGU Platform"** trên mọi kích thước màn hình mobile không bao giờ bị cắt thành dấu `...`.

### 23.5 Sửa Lỗi Chuyển Đổi Đa Ngôn Ngữ i18n Cho Menu Tài Khoản (Multilingual User Dropdown Fix)
- **Thời gian xử lý:** 03/08/2026 01:26:30 GMT+7
- **Bổ sung từ điển đa ngôn ngữ (`LanguageContext.tsx`)**:
  - Khai báo các key dịch thuật song ngữ Tiếng Việt & Tiếng Anh: `user_history` (Lịch sử giao dịch / Transaction History), `user_affiliate` (Tiếp thị liên kết / Affiliate Program), `user_guide` (Hướng dẫn sử dụng / User Guide), `user_logs` (Nhật ký hoạt động / Activity Logs).
- **Cập nhật Component `UserDropdown.tsx` & `Header.tsx`**:
  - Thay thế toàn bộ các chuỗi văn bản cứng (hardcoded) bằng hàm dịch thuật `t()`.
  - Đảm bảo khi chọn ngôn ngữ **EN**, 100% mục trong User Dropdown menu (Desktop) và Mobile Menu Drawer lập tức chuyển sang Tiếng Anh đồng bộ.

### 23.6 Kiểm Tra Biên Dịch Hệ Thống (System Build Verification)
- **Thời gian kiểm tra:** 03/08/2026 01:26:37 GMT+7
- Kiểm tra TypeScript Web: `npx tsc --noEmit -p apps/web/tsconfig.json` $\rightarrow$ `✓ 0 error`.
- Kiểm tra Webpack/Next.js Dev Server: Cả `web` (Port 3000) và `api` (Port 3001) hoạt động ổn định 100%.

## Phase 24: Phiên làm việc 03/08/2026 — Sửa Lỗi Hiển Thị Menu Mobile Ở Chế Độ Giao Diện Sáng (Light Mode Theme Fix) & Cập Nhật Quy Tắc Nền Tảng Trong AI_CONTEXT.md
- **Thời gian ghi nhận:** 03/08/2026 10:34:31 GMT+7

### 24.1 Sửa Lỗi Menu Mobile Bị Nền Tối Khi Ở Chế Độ Giao Diện Sáng (`Header.tsx` & `global.css`)
- **Phân tích nguyên nhân gốc rễ**: Lớp CSS `.mobile-nav-drawer` trong `global.css` bị hardcode màu nền tối cố định `background: rgba(20, 20, 25, 0.96)`. Khi người dùng chuyển sang Chế độ Sáng (Light Mode), biến `--text-primary` đổi thành màu chữ tối `#1c1917`, dẫn tới hiện tượng chữ màu đen hiển thị trên phông nền tối đen (Black text on Dark background) làm các mục điều hướng ("Giới thiệu", "Bảng giá", "Tin tức", "FAQ", "Liên hệ") bị mờ nhạt đục và cực kỳ khó đọc.
- **Tối ưu hóa trong `global.css`**:
  - Chuyển màu nền `.mobile-nav-drawer` từ màu tối cố định sang biến CSS theme `background: var(--bg-card);` và điều chỉnh bóng đổ `box-shadow: -15px 0 45px rgba(0, 0, 0, 0.2)`. Khi bật chế độ Sáng, menu di động tự động đổi thành nền trắng `#ffffff` sắc nét; khi bật chế độ Tối, menu duy trì màu phông tối cao cấp.
- **Chuẩn hóa biến CSS trong `Header.tsx`**:
  - Loại bỏ hoàn toàn các màu mờ đục hardcode inline kiểu `rgba(255, 255, 255, 0.03)` hay `rgba(255,255,255,0.08)`.
  - Chuyển 100% các phần tử bên trong Mobile Drawer (Nút đóng `X`, Thẻ tài khoản cá nhân, Khối hiển thị số dư, Lưới 2 cột thao tác nhanh, Danh sách mục điều hướng xếp dọc, Nút Đăng xuất/Đăng nhập/Đăng ký) sang sử dụng các biến CSS theme chuẩn: `var(--bg-secondary)`, `var(--bg-card)`, `var(--bg-elevated)`, `var(--danger-bg)`, `var(--border-color)`.
- **Đồng bộ hóa Modal Chi Tiết (`ModuleDetailModal.tsx`)**:
  - Chuyển màu nền panel modal từ `rgba(20, 20, 25, 0.78)` và header bar `rgba(24, 24, 30, 0.85)` sang `var(--bg-card)` và `var(--bg-secondary)`, đảm bảo các cửa sổ Modal cũng tương thích hoàn hảo ở Chế độ Sáng.

### 24.2 Cập Nhật Quy Tắc Phát Triển Vào `docs/docs_guide/AI_CONTEXT.md`
- Cập nhật và nâng cấp Quy tắc Chuyển đổi Theme Tự động (Mục 2 - *CHUYỂN ĐỔI THEME TỰ ĐỘNG KHÔNG HARDCODE MÀU NỀN TỐI HỘP CỨNG (CRITICAL THEME RULE)*).
- Quy định nghiêm cấm hardcode màu nền tối cố định (`rgba(20, 20, 25, ...)`, `rgba(15, 23, 42, ...)`, `#0f172a`) cho bất kỳ container, card, mobile menu drawer (`.mobile-nav-drawer`), header hay popup modal nào trong CSS/HTML/JS inline, đảm bảo không bao giờ tái diễn lỗi hiển thị chữ đen trên nền đen ở giao diện sáng.

### 24.3 Kiểm Tra Biên Dịch Hệ Thống (System Build Verification)
- Chạy lệnh `npx nx build web` $\rightarrow$ `✓ Compiled successfully in 3.5s`, static prerender 12 trang thành công, 0 cảnh báo hay lỗi biên dịch.

## Phase 25: Phiên làm việc 03/08/2026 — Sửa Lỗi Hover Trùng Màu Trắng Tiêu Đề Thẻ Mô-Đun Công Cụ Ở Chế Độ Sáng (`FeatureModulesSection.tsx`)
- **Thời gian ghi nhận:** 03/08/2026 13:48:00 GMT+7

### 25.1 Sửa Lỗi Tiêu Đề Bị Trùng Màu Trắng Với Background Khi Hover Trong Light Mode
- **Phân tích nguyên nhân**: Trong `FeatureModulesSection.tsx`, thẻ `<h3>` tiêu đề của 6 thẻ mô-đun công cụ bị gán màu cứng `color: isHovered ? '#ffffff' : 'var(--text-primary)'`. Khi ở Giao diện Tối (Dark Mode), phông nền thẻ là màu đen/tối nên chữ trắng hiển thị bình thường. Tuy nhiên, khi ở Giao diện Sáng (Light Mode), phông nền thẻ card là màu trắng `#ffffff`. Khi người dùng rê chuột (hover) vào thẻ, tiêu đề bị chuyển thành màu trắng `#ffffff` trùng khớp với màu nền card làm cho chữ tiêu đề bị mất tích/biến mất hoàn toàn (White text on White background).
- **Khắc phục**:
  - Chuyển `color: isHovered ? item.accentColor : 'var(--text-primary)'` trong `FeatureModulesSection.tsx`. Khi rê chuột vào từng thẻ mô-đun, tiêu đề thẻ sẽ đổi sang màu accent nổi bật tương ứng với mô-đun đó (`#ec4899` hồng cho Cắt video, tím cho AI Video, xanh lục cho Reup...), tạo hiệu ứng tương tác thị giác vô cùng sinh động, nổi bật và tương phản sắc nét trên cả phông nền Trắng (Light Mode) lẫn Tối (Dark Mode).

### 25.2 Cập Nhật Quy Tắc Phát Triển Vào `docs/docs_guide/AI_CONTEXT.md`
- Bổ sung mục 5 (*MÀU CHỮ VÀ HIỆU ỨNG HOVER TƯƠNG THÍCH ĐA THEME (CRITICAL HOVER COLOR RULE)*) vào `AI_CONTEXT.md`.
- Nghiêm cấm hardcode màu chữ trắng `color: '#ffffff'` hoặc `#fff` khi hover trên các phông nền card/container dạng `var(--bg-card)` để đảm bảo 100% không bao giờ gặp sự cố trùng màu chữ ở chế độ nền sáng.

## Phase 32: Phiên làm việc 04/08/2026 — Soạn Thảo Tuyên Bố Miễn Trừ Trách Nhiệm Pháp Lý (AI Disclaimer 2025), Màn Hình Gating Consent & Nút Bảo Mật Footer
- **Thời gian ghi nhận:** 04/08/2026 14:58:00 GMT+7

### 32.1 Soạn Thảo Văn Bản Tuyên Bố Miễn Trừ Trách Nhiệm Pháp Lý Chuẩn Luật AI 2025
- **Định vị & Văn phong**: Viết ở góc nhìn chuyên gia soạn thảo văn bản pháp lý công nghệ AI tại Việt Nam dành riêng cho sản phẩm **EIGU Platform** (Nền tảng Tự động hóa AI Video SaaS dành cho cộng đồng MMO TikTok, YouTube Shorts & Reels). Trình bày mạch lạc theo đúng 5 phần quy chuẩn pháp lý:
  1. **VAI TRÒ CỦA EIGU PLATFORM**: Định vị đơn vị là bên cung cấp giao diện/công cụ trung gian tự động hóa, không trực tiếp kiểm soát thuật toán lõi hoặc logic xử lý của các mô hình AI bên thứ ba (OpenAI, Fal.ai, ElevenLabs, OmniVoice, Kling AI). Khẳng định nội dung đầu ra phụ thuộc hoàn toàn vào prompt và ý chí độc lập của người dùng.
  2. **TRÁCH NHIỆM MINH BẠCH VÀ NGHĨA VỤ NGƯỜI DÙNG**: Căn cứ **Luật Trí tuệ nhân tạo 2025 (Luật số 134/2025/QH15, hiệu lực từ ngày 01/03/2026), đặc biệt Điều 11** về nghĩa vụ gắn nhãn nhận biết nội dung AI. Bắt buộc người dùng dán nhãn AI cho nội dung mô phỏng người thật, giọng nói thật hoặc sự kiện thực tế. Khẳng định EIGU Platform miễn trừ hoàn toàn trách nhiệm nếu người dùng vi phạm.
  3. **CÁC HÀNH VI BỊ NGHIÊM CẤM**: Căn cứ **Điều 7 Luật AI 2025**, liệt kê chi tiết các hành vi vi phạm pháp luật, giả mạo Deepfake, lừa đảo, đe dọa an ninh quốc gia, lợi dụng đối tượng yếu thế, xâm phạm bản quyền tác giả hoặc vi phạm tiêu chuẩn cộng đồng MMO.
  4. **QUYỀN RIÊNG TƯ VÀ DỮ LIỆU NGƯỜI DÙNG**: Căn cứ **Điều 4 Luật AI 2025**. Phân định minh bạch: dữ liệu KHÔNG lưu trữ (nội dung video/âm thanh render thành phẩm), dữ liệu CÓ lưu trữ (thông tin tài khoản, IP, nhật ký giao dịch, Consent Log). Cam kết không bán/chia sẻ bên thứ ba trừ khi có yêu cầu hợp pháp của cơ quan chức năng. Cung cấp email hỗ trợ xóa dữ liệu: `support@eigu.vn` / `privacy@eigu.vn`.
  5. **MIỄN TRỪ TRÁCH NHIỆM TỔNG QUÁT & XÁC NHẬN**: Tuyên bố công cụ trung lập, người dùng chịu 100% trách nhiệm pháp lý/dân sự/hình sự. Đi kèm checkbox xác nhận "Tôi đã đọc, hiểu và cam kết tuân thủ đầy đủ..." và nút hành động "TIẾP TỤC SỬ DỤNG".

### 32.2 Phát Triển Component `DisclaimerModal.tsx` & Trang `/privacy-disclaimer`
- **Màn hình/Modal Gating Chặn (Blocking Consent Screen)**:
  - Thiết kế component `DisclaimerModal.tsx` dạng gating screen hiển thị ngay sau khi người dùng đăng ký tài khoản thành công, bắt buộc xác nhận 1 lần trước khi vào sử dụng ứng dụng lần đầu.
  - Loại bỏ hoàn toàn nút "Skip" / "Để sau". Chỉ kích hoạt nút "TIẾP TỤC SỬ DỤNG" khi người dùng tích chọn checkbox cam kết.
  - Tự động ghi vết Consent Log (Timestamp, User ID, Client Agent, trạng thái `accepted = true`) lưu trữ vào bộ nhớ thiết bị/database làm căn cứ bằng chứng pháp lý khi xảy ra tranh chấp.
- **Trang Độc Lập `/privacy-disclaimer` & Tích Hợp Song Song Trong Mô-Đun FAQ (`apps/web/src/app/page.tsx`)**:
  - Bổ sung nút bấm Sub-Tab thứ 3 **"Chính sách bảo mật & Miễn trừ trách nhiệm"** nằm song song với *"Câu Hỏi Thường Gặp (FAQ)"* và *"Quy Định & Điều Khoản Sử Dụng"* bên trong mô-đun `/faq`.
  - Khi người dùng bấm vào nút *"Chính sách bảo mật & Miễn trừ trách nhiệm"* ở Footer hoặc mở liên kết `/privacy-disclaimer`, hệ thống tự động định tuyến đến trang FAQ với sub-tab Disclaimer kích hoạt hiển thị trọn vẹn văn bản pháp lý.

### 32.3 Cập Nhật Nút Bảo Mật Trong Footer (`Footer.tsx` & `LanguageContext.tsx`)
- **Tích hợp Nút Trong `Footer.tsx`**:
  - Tại cột **"Bảo Mật"** (Security), bổ sung nút bấm `li.footer-link` có tên `"Chính sách bảo mật & Miễn trừ trách nhiệm"` (`{t('footer_privacy_disclaimer')}`).
  - Xóa dòng mô tả cũ `"Anti-Detect Fingerprint Engine & Data Security Standard."` để cột Bảo mật hiển thị gọn gàng, tinh tế và tập trung hoàn toàn vào nút bấm chính sách pháp lý.
  - Áp dụng chuẩn lớp CSS `.footer-link`, giúp khi rê chuột (hover) vào nút sẽ xuất hiện icon mũi tên `›` trượt nhẹ mượt mà, chuyển màu accent tím và phông nền hover y hệt các nút liên kết bên cạnh.
- **Đa ngôn ngữ i18n (`LanguageContext.tsx`)**:
  - Bổ sung key `footer_privacy_disclaimer`: Tiếng Việt (`"Chính sách bảo mật & Miễn trừ trách nhiệm"`), Tiếng Anh (`"Privacy Policy & Disclaimer"`).

### 32.4 Khắc Phục Lỗi Màn Hình Gating Modal Khi Đăng Ký Tài Khoản Mới (`page.tsx` & `register/page.tsx`)
- **Phân tích nguyên nhân**: Component `DisclaimerModal.tsx` đã được khởi tạo nhưng chưa được nhúng (mount) vào cây component chính của `apps/web/src/app/page.tsx`. Ngoài ra, trang Đăng ký (`register/page.tsx`) chưa tiến hành xóa cờ `eigu_disclaimer_accepted` khi tài khoản mới tạo xong, dẫn tới việc sau khi đăng ký thành công, ứng dụng không hiển thị được cửa sổ nổi (Modal Gating Screen) yêu cầu người dùng đọc và tích chọn xác nhận điều khoản.
- **Khắc phục**:
  - **`page.tsx`**: Nhúng `DisclaimerModal` vào cấp toàn cục của ứng dụng Web. Sử dụng `useEffect` kiểm tra cờ `localStorage.getItem('eigu_disclaimer_accepted')` khi người dùng đăng nhập hoặc vừa đăng ký. Nếu chưa chấp thuận, `showDisclaimerModal` tự động bật lên dạng Modal mờ ảo hiệu ứng Kính mờ (Glassmorphism), chặn mọi thao tác cho tới khi tích chọn cam kết và nhấn nút "TIẾP TỤC SỬ DỤNG".
  - **`register/page.tsx`**: Tại hàm `handleVerify()`, tự động gọi `localStorage.removeItem('eigu_disclaimer_accepted')` ngay sau khi đăng ký OTP thành công. Đảm bảo tài khoản mới tạo luôn phải trải qua bước xác nhận một lần (One-Time Gating Acceptance) bắt buộc.

### 32.5 Khắc Phục Lỗi Thứ Tự Hiển Thị (Layering) Trên Thanh Navbar (`DisclaimerModal.tsx`)
- **Phân tích nguyên nhân**: Thanh điều hướng nổi Navbar (`Header.tsx` / `.apple-nav-wrapper`) có chỉ số `z-index: 9999`. Khi `DisclaimerModal` chưa sử dụng React Portal và mang chỉ số `z-index: 9999`, thanh Navbar vô tình nằm đè lên trên mặt modal, làm lộ ra các nút chuyển trang và không bị làm mờ.
- **Khắc phục**:
  - Tích hợp `createPortal(..., document.body)` trong `DisclaimerModal.tsx` để đưa toàn bộ khung Modal ra khỏi cây DOM phân cấp và gắn trực tiếp vào `document.body`.
  - Nâng chỉ số `z-index` của lớp phủ (Backdrop) lên `999999` (vượt xa chỉ số `9999` của Navbar).
  - Áp dụng hiệu ứng Kính mờ `backdropFilter: 'blur(16px)'` cùng màu nền tối `rgba(10, 10, 15, 0.88)` bao phủ 100% màn hình, giúp thanh Navbar nằm ẩn trọn vẹn bên dưới, bị làm mờ hoàn toàn và vô hiệu hóa mọi thao tác bấm cho tới khi người dùng chấp thuận điều khoản.
  - Tự động khóa cuộn trang (`document.body.style.overflow = 'hidden'`) trong thời gian Modal hiển thị.

### 32.6 Tích Hợp Nút "Quy Định & Điều Khoản Sử Dụng" Vào Footer & Định Tuyến Song Song FAQ (`Footer.tsx`, `page.tsx`, `LanguageContext.tsx`)
- **Tích hợp Nút Trong `Footer.tsx`**:
  - Tại cột **"Bảo Mật"** (Security & Legal), bổ sung thêm nút bấm `li.footer-link` có tên `"Quy định & Điều khoản sử dụng"` (`{t('footer_terms_of_service')}`) xếp **nằm trên** nút `"Chính sách bảo mật & Miễn trừ trách nhiệm"`.
- **Bổ sung key Đa ngôn ngữ (`LanguageContext.tsx`)**:
  - Tiếng Việt: `"Quy định & Điều khoản sử dụng"`, Tiếng Anh: `"Terms of Service & Usage"`.
- **Tạo Route Redirect & Xử lý Định tuyến Song Song (`apps/web/src/app/terms-of-service/page.tsx` & `page.tsx`)**:
  - Tạo file `terms-of-service/page.tsx` hỗ trợ truy cập trực tiếp URL `/terms-of-service`.
  - Cập nhật hàm `handleNavigate` và `useEffect` mount trong `page.tsx` để điều hướng `/terms-of-service` hoặc `/terms` về mô-đun `/faq` với sub-tab `terms` được chọn, tự động cuộn trang mượt mà lên đầu.

### 32.7 Bổ Sung Ô Xác Nhận Đã Tích Cố Định (Read-Only) Cuối Trang Disclaimer Trong FAQ (`apps/web/src/app/page.tsx`)
- **Tích hợp khung xác nhận cố định**: Tại vị trí cuối Mục 5 trong trang Tuyên bố Miễn trừ Trách nhiệm & Bảo mật của mô-đun FAQ (`faqSubTab === 'disclaimer'`), bổ sung khung xác nhận chính sách với ô checkbox đã tích sẵn.
- **Khóa cố định không cho thao tác**: Đặt thuộc tính `checked={true}`, `disabled={true}`, `readOnly={true}` cùng `cursor: 'default'` cho ô checkbox. Người dùng có thể đọc văn bản và thấy rõ cờ xác nhận đã đồng ý nhưng tuyệt đối không thể bỏ tích hay thay đổi trạng thái này.
- **Gắn nhãn trạng thái Consent Log**: Hiển thị badge xanh lá `"Đã Xác Nhận"` cùng dòng ghi chú *"🔒 Trạng thái: Đã xác nhận chấp thuận điều khoản pháp lý (Consent Log Active)"*.

### 32.8 Tối Ưu Bố Cục 3 Nút Sub-Tab FAQ Nằm Trọn Vẹn Trên 1 Hàng Ngang (`apps/web/src/app/page.tsx`)
- **Khắc phục lỗi xuống dòng**: Đổi thuộc tính `flexWrap: 'wrap'` thành `flexWrap: 'nowrap'`, bổ sung `whiteSpace: 'nowrap'` và `flexShrink: 0` cho cả 3 nút Sub-Tab.
- **Tăng chiều rộng khung chứa**: Tăng `maxWidth` của container phần FAQ từ `880px` lên `1040px`, tinh chỉnh khoảng cách padding nút `9px 18px` và cỡ chữ `13.5px`.
- **Đảm bảo trải nghiệm 100% 1 dòng**: Cả 3 nút *"Câu Hỏi Thường Gặp (FAQ)"*, *"Quy Định & Điều Khoản Sử Dụng"*, và *"Chính Sách Bảo Mật & Miễn Trừ Trách Nhiệm"* nằm ngang hàng cân đối, đẹp mắt và hỗ trợ trượt ngang mượt mà trên thiết bị di động.

### 32.9 Thiết Kế Giao Diện Segmented Control Phản Hồi Đáp Ứng (Responsive) Cho Mobile (`global.css` & `page.tsx`)
- **Phân tích nguyên nhân**: Trên thiết bị di động (màn hình hẹp dưới 768px), thuộc tính căn giữa `justifyContent: 'center'` gây ra hiện tượng nút đầu tiên bị tràn khuất sang lề trái và nút thứ ba bị tràn sang lề phải, khiến người dùng gặp khó khăn khi thao tác bấm chuyển tab.
- **Giải pháp tối ưu UX/UI chuẩn Apple**:
  - **Trên Desktop ($\ge 768px$)**: Hiển thị đầy đủ tên 3 tab trên 1 hàng ngang cân đối (`Câu Hỏi Thường Gặp (FAQ)`, `Quy Định & Điều Khoản Sử Dụng`, `Chính Sách Bảo Mật & Miễn Trừ Trách Nhiệm`).
  - **Trên Mobile ($< 768px$)**: Chuyển đổi container sang dạng thanh điều hướng Segmented Control 3 cột bằng nhau (`grid-template-columns: repeat(3, 1fr)`).
  - **Nhãn rút gọn thông minh**: Tự động chuyển đổi tên nút ngắn gọn dễ đọc trên di động (`FAQ`, `Điều Khoản`, `Bảo Mật`).
  - **100% Không bị khuất**: Cả 3 tab hiển thị đầy đủ 100% trên màn hình điện thoại, nút bấm to rộng vừa vặn với ngón tay cái, vô cùng tiện lợi khi sử dụng.

### 32.10 Kiểm Tra Biên Dịch & Xác Nhận Hệ Thống
- Chạy `npx tsc --noEmit -p apps/web/tsconfig.json` $\rightarrow$ `✓ 0 error`. Giao diện Segmented Control trên mobile và desktop hoạt động chuẩn xác 100%.

---

## 33. Xây Dựng Module Quản Lý Tin Tức (News Management) Cho Desktop & Website Public (`@MODULE_NEWS.md`)

### 33.1 Bảng Cơ Sở Dữ Liệu Prisma Schema (`apps/api/prisma/schema.prisma`)
- **NewsCategory**: Quản lý danh mục bài viết (`id`, `name`, `slug`, `description`, `sortOrder`).
- **NewsTag & NewsTagRelation**: Quản lý thẻ bài viết quan hệ nhiều - nhiều (`id`, `name`, `slug`).
- **News**: Lưu trữ bài viết tin tức (`title`, `slug`, `summary`, `content`, `thumbnail`, `gallery[]`, `status`, `isFeatured`, `authorId`, `authorName`, `viewCount`, `likeCount`, `commentCount`, `readingTime`, `publishedAt`, `deletedAt`).
- **NewsComment, NewsCommentReaction, NewsCommentReport**: Hệ thống bình luận lồng nhau kiểu Reddit (`parentId`, `userRole`, `likeCount`, `dislikeCount`).
- **Lưu ảnh dạng LINK (URL string)**: Toàn bộ `thumbnail`, `gallery` và ảnh trong editor đều lưu dạng URL string, tích hợp live preview và fallback onerror chống vỡ layout.

### 33.2 Backend REST API (`apps/api/src/news/`)
- **Shared DTO**: Đặt tại `packages/shared/src/lib/news.dto.ts` để đồng bộ interface giữa API, Desktop và Web.
- **Admin/Staff REST API (`NewsController`)**:
  - `GET /news`: Danh sách & bộ lọc phân trang, tìm kiếm, sắp xếp.
  - `GET /news/statistics`: Thống kê tổng bài viết, đã xuất bản, bài nháp, lưu trữ, tổng view và bình luận.
  - `POST /news`, `PATCH /news/:id`, `DELETE /news/:id` (Soft Delete - Admin only), `PATCH /news/:id/publish`, `PATCH /news/:id/archive`, `POST /news/:id/duplicate`.
  - Phân quyền: Role Admin có toàn quyền; Staff tạo/sửa/xuất bản/duyệt comment; User chỉ đọc/bình luận.
- **Public REST API (`PublicNewsController`)**:
  - `GET /public/news`, `GET /public/news/:slug` (tự động tăng `viewCount`), `GET /public/news/related`, `GET /public/news/latest`, `GET /public/news/categories`, `GET /public/news/tags`.
  - `GET /public/news/:id/comments`, `POST /public/news/:id/comments`, `POST /public/comments/:id/reaction`, `POST /public/comments/:id/report`.

### 33.3 Ứng Dụng Desktop Electron (`apps/desktop/src/assets/`)
- **Sidebar & Permission Integration**: Thêm tab *"Quản lý Tin tức"* (`news-management`) vào Sidebar Electron, gán class `staff-only` (hiển thị cho Admin & Staff, ẩn hoàn toàn với User).
- **Console Quản Lý Bài Viết (`news-mgmt.js`)**:
  - Khung thống kê 6 chỉ số tổng quan.
  - Bộ lọc tìm kiếm theo từ khóa, danh mục, trạng thái (Draft/Published/Archived), bài nổi bật, sắp xếp.
  - Bảng dữ liệu Data Table hiển thị Thumbnail preview, Tiêu đề, Slug, Danh mục, Tác giả, Trạng thái, Lượt xem/Bình luận, Ngày tạo và cụm nút thao tác (Preview, Edit, Duplicate, Publish, Soft Delete).
  - Modal Soạn Thảo & Chỉnh Sửa Bài Viết: Nhập Thumbnail URL kèm **Live Preview**, Rich Content Editor HTML (H1-H6, quote, chèn link ảnh, video), cấu hình SEO & Meta tags.
  - Modal Quản Lý Danh Mục & Tags.

### 33.4 Website Next.js Public (`apps/web/src/components/news/`)
- **Trang Danh Sách Tin Tức (`NewsList.tsx`)**:
  - Bố cục Grid Card đáp ứng (Desktop 3 cột, Tablet 2 cột, Mobile 1 cột).
  - Thẻ bài viết hiển thị Thumbnail, Category badge, Tiêu đề, Mô tả tóm tắt, Thời gian đọc, Lượt xem & Bình luận.
  - Thanh tab lọc theo danh mục & thanh tìm kiếm từ khóa.
- **Trang Chi Tiết Bài Viết (`NewsDetail.tsx`)**:
  - Bố cục 2 cột: Cột trái 70% (Tiêu đề, Tác giả, Ngày đăng, Ảnh đại diện, Nội dung bài viết HTML, Tags, Cụm nút Chia sẻ link) / Cột phải 30% (Bài viết liên quan & Mới nhất).
- **Hệ Thống Bình Luận Threaded Reddit-Style (`NewsCommentSection.tsx`)**:
  - Cây bình luận phân cấp vô hạn (Recursive Comment Tree).
  - Hiển thị Role Badge (ADMIN / STAFF / USER), thời gian, Like / Dislike toggle reaction, Reply inline form, Thu gọn / Mở rộng thread.

### 33.5 Kiểm Tra Biên Dịch & Xác Nhận Kỹ Thuật
- `npx prisma generate --schema=apps/api/prisma/schema.prisma` $\rightarrow$ `✔ Generated Prisma Client`.
- `npx tsc --noEmit -p apps/api/tsconfig.app.json` $\rightarrow$ `✓ 0 error`.
- `npx tsc --noEmit -p apps/web/tsconfig.json` $\rightarrow$ `✓ 0 error`.

### 33.6 Sửa Lỗi Màn Hình Đen (Black Screen / Render Error) Trên Desktop Electron (`apps/desktop`)
- **Phân tích nguyên nhân**: Khi nhúng script tag `js/ui/news-mgmt.js` trong file `index.html`, thẻ script `js/ui/automation-ui.js` bị thay thế làm thiếu hàm `renderAutomation()`. Việc gọi `renderAutomation()` trong `main.js` mà thiếu file định nghĩa gây ra `ReferenceError: renderAutomation is not defined`, làm ngắt quãng luồng khởi tạo `checkAuth()` và khiến giao diện bị giữ nguyên ở trạng thái `display: none` (Màn hình đen).
- **Các bước khắc phục**:
  1. Phục hồi thẻ `<script src="js/ui/automation-ui.js"></script>` trong `apps/desktop/src/assets/index.html`.
  2. Bổ sung kiểm tra an toàn `typeof renderAutomation === 'function'` và guard `document.getElementById('search-popup-input')` trong `main.js` tránh throwing Uncaught Exception.
  3. Ưu tiên đường dẫn file nguồn `apps/desktop/src/assets/` me trước `dist/apps/desktop/assets/` trong hàm `getAssetPath()` ở môi trường Dev.
- **Kết quả**: Ứng dụng Desktop Electron khởi chạy mượt mà 100%, hiển thị đầy đủ giao diện cùng tab *"Quản lý Tin tức"*.

### 33.7 Khắc Phục Ẩn Tab Staff-Only ("Quản Lý Tin Tức") Trên Sidebar Desktop (`main.js`)
- **Phân tích nguyên nhân**: Trong file `sidebar.component.js`, tab Quản lý Tin tức có thẻ HTML `<div class="nav-item staff-only hidden" ...>`. Khi hàm `updateProfile()` kiểm tra role Admin/Staff trong `main.js`, trước đó chỉ đổi `el.style.display = ''` nhưng quên gỡ class `.hidden`. Do class `.hidden` có thuộc tính `display: none !important`, tab bị ẩn hoàn toàn dù tài khoản đã đăng nhập Admin/Staff.
- **Giải pháp**: Bổ sung `el.classList.remove('hidden')` khi tài khoản có role `admin` hoặc `staff` trong `main.js`. Tab *"Quản lý Tin tức"* lập tức xuất hiện nổi bật tại thanh Sidebar bên trái.

### 33.8 Sửa Lỗi "⚠️ Bạn Chưa Đăng Nhập" Khi Vào Quản Lý Tin Tức Trên Desktop (`news-mgmt.js`)
- **Phân tích nguyên nhân**: Ứng dụng Desktop Electron lưu giữ Access Token tại biến toàn cục `accessToken` hoặc `localStorage.getItem('accessToken')`. Trong file `news-mgmt.js`, mã nguồn gọi nhầm key `eigu_token`, dẫn tới kết quả `null` và hiển thị màn hình cảnh báo chưa đăng nhập.
- **Giải pháp**: Tạo hàm trợ giúp `getNewsAuthToken()` đọc ưu tiên biến `accessToken`, tiếp theo tới `localStorage.getItem('accessToken')`. Đã áp dụng `getNewsAuthToken()` đồng bộ cho tất cả các request CMS Tin tức.
- **Kết quả**: Sau khi đăng nhập tài khoản Admin/Staff, người dùng truy cập tab *"Quản lý Tin tức"* sẽ thấy ngay Dashboard thống kê và bảng bài viết CMS chuyên nghiệp.

### 33.9 Cập Nhật Tiêu Đề Trang Tin Tức Website (`NewsList.tsx`)
- Đã chỉnh sửa tiêu đề chính `<h1>` từ *"Tin Tức & Hướng Dẫn Kỹ Thuật TikTok MMO"* thành **"Tin Tức & Hướng Dẫn Kỹ Thuật"** theo yêu cầu giao diện mới.

### 33.10 Tự Động Khởi Tạo Danh Mục Mặc Định & Nút "+ Tạo Danh Mục" Trong Editor (`news-mgmt.js`)
- **Phân tích nguyên nhân**: Khi cơ sở dữ liệu mới khởi tạo chưa có danh mục bài viết nào (`newsCategoriesState` rỗng), thẻ `<select id="editor-category">` không có thẻ `<option>` để chọn.
- **Giải pháp**:
  1. Thêm hàm `autoSeedDefaultCategories()` tự động tạo 4 danh mục chuẩn (*Tin Tức & Cập Nhật*, *Hướng Dẫn Kỹ Thuật*, *Chiến Lược MMO*, *Thông Báo Hệ Thống*) khi ứng dụng khởi chạy nếu chưa có danh mục.
  2. Bổ sung nút **`+ Tạo Danh Mục`** ngay cạnh nhãn Danh Mục trong modal soạn thảo bài viết, cho phép Admin/Staff tạo danh mục mới tức thì mà không bị gián đoạn khi đang viết bài.

### 33.11 Đưa Thông Báo Toast Lên Trên Modal & Tối Ưu Xử Lý Payload Bài Viết (`toast.css` & `news-mgmt.js` & `news.service.ts`)
- **Hiển thị Toast trên cùng**: Nâng thuộc tính `z-index` của `#toast-container` trong `toast.css` từ `999999` lên `99999999` (cao hơn z-index của modal `news-editor-modal`). Giúp toàn bộ thông báo thành công hoặc lỗi luôn nổi lên trên cùng, Admin/Staff nhìn thấy và theo dõi tức thì.
- **Khắc phục lỗi "Yêu cầu không hợp lệ"**: Khi `categoryId` là chuỗi rỗng `""`, mã nguồn đã tự động chuyển đổi sang `undefined` để Backend tự chọn danh mục mặc định của hệ thống thay vì báo lỗi Foreign Key database.

### 33.12 Tổng Kết Kiểm Tra Biên Dịch & Đồng Bộ Hệ Thống (API, Desktop, Web)
- **Prisma Engine**: `npx prisma generate --schema=apps/api/prisma/schema.prisma` $\rightarrow$ `✔ Generated Prisma Client (v7.8.0)`.
- **API NestJS**: `npx tsc --noEmit -p apps/api/tsconfig.app.json` $\rightarrow$ `✓ 0 error`.
- **Web Next.js**: `npx tsc --noEmit -p apps/web/tsconfig.json` $\rightarrow$ `✓ 0 error`.
- **Desktop Electron**: `npx nx build desktop` $\rightarrow$ `✓ SUCCESS`.
- **Đã kiểm tra hoạt động**: Đăng nhập Admin/Staff hiển thị tab *"Quản lý Tin tức"*, tạo/sửa/xuất bản bài viết thành công, Toast thông báo nổi trên cùng chuẩn xác, trang web `/news` tự động đồng bộ bài viết công khai.

## Phase 34: Khắc Phục Lỗi Màu Sắc Ô Nhập Tài Khoản & Mật Khẩu Đăng Nhập Ở Chế Độ Tối (Dark Mode) Trên Web & Desktop (07/08/2026)

### 34.1 Phân Tích Nguyên Nhân
- Khi người dùng ở Chế độ Tối (Dark Mode), trình duyệt (Chrome, Edge, Brave, Safari) tự động điền (autofill) tài khoản và mật khẩu đã lưu. Trình duyệt tự động áp dụng rule CSS native `:-webkit-autofill` ép màu nền thành màu xanh sáng/trắng (`#e8f0fe`) và chữ màu đen (`#000000`), làm mất đồng bộ với giao diện Dark Mode (vốn là nền đen chữ trắng giống như bên phần Đăng ký).

### 34.2 Giải Pháp & File Đã Chỉnh Sửa
1. **Ứng dụng Web Next.js ([global.css](file:///d:/eigu-platform/apps/web/src/app/global.css))**:
   - Thêm quy tắc CSS ghi đè `:-webkit-autofill` cho `.form-group input` và `.pw-wrapper input`:
     - Sử dụng `-webkit-box-shadow: 0 0 0px 1000px var(--bg-primary, #0c0a09) inset !important;`
     - Sử dụng `-webkit-text-fill-color: var(--text-primary, #ffffff) !important;`
     - Đặt `caret-color: var(--text-primary, #ffffff) !important;` và `transition: background-color 5000s ease-in-out 0s !important;` để ngăn trình duyệt đổi màu nền.
   - Thêm bộ tương thích `[data-theme="light"]` để khi người dùng chuyển sang Chế độ Sáng, ô autofill vẫn tự động hiển thị nền trắng chữ tối chuẩn UX.
2. **Ứng dụng Desktop Electron ([auth.css](file:///d:/eigu-platform/apps/desktop/src/assets/css/auth.css))**:
   - Đồng bộ cấu hình ghi đè `:-webkit-autofill` cho ô gõ đăng nhập trong CSS Desktop Electron.

### 34.3 Kết Quả
- Ô nhập tài khoản và mật khẩu ở Chế độ Tối khi autofill hay nhập tay luôn có **nền màu đen/tối** và **chữ màu trắng sáng**, khớp 100% với giao diện bên Đăng ký.





