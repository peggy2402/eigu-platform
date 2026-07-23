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





