# PROMPT TRIỂN KHAI — Module "Tạo Video AI (nhanh)" — EIGU Platform (v2 — Final)

> Đây là bản PROMPT hợp nhất, đã cập nhật toàn bộ quyết định mới nhất của Product Owner — **không còn câu hỏi mở**. Dùng tài liệu này làm **nguồn sự thật duy nhất (single source of truth)** để triển khai — không tham chiếu ngược lại các bản nháp/câu hỏi cũ trước đó.
>
> **Vai trò của bạn (AI/Dev):** Đọc kỹ toàn bộ tài liệu, sau đó triển khai module theo đúng kiến trúc, luồng xử lý, và các quy tắc nghiệp vụ được mô tả bên dưới. Nếu phát sinh câu hỏi nghiệp vụ mới ngoài phạm vi tài liệu này, cần hỏi lại Product Owner thay vì tự suy diễn.

---

## 0. Định Vị Sản Phẩm (Bối Cảnh Bắt Buộc Phải Hiểu Trước Khi Code)

- **EIGU không phải là một AI Video Provider** (như Veo, Kling, Runway) mà là **công cụ (tool)** giúp người dùng render video hàng loạt dựa trên các AI Provider có sẵn.
- Module "Tạo Video AI (nhanh)" có phạm vi **đơn giản, có chủ đích**: `Input → Render → Xuất file .mp4 → Lưu tại máy local của khách hàng`.
- **Không có khái niệm "Project" hay "Agent Memory"** trong module này — đây không phải một "AI Creative Studio" quản lý dự án dài hạn. Module không lưu trữ lịch sử hội thoại nhiều phiên, không cần bộ nhớ ngữ cảnh AI, không liên quan đến định dạng `.eigu`. Nếu tương lai EIGU phát triển module "AI Video Studio" đầy đủ có Project/Agent, đó là **phạm vi hoàn toàn khác**, không gộp vào đây.

---

## 1. Vị Trí Trong Điều Hướng (Navigation)

```
Công cụ
   └── Tạo Video AI
          ├── Copy Video
          ├── Tạo Video Từ Ý Tưởng
          ├── Tạo Video Từ Ảnh
          └── Tạo Video Theo Mẫu
```

- Mỗi màn hình con = 1 route/state riêng (SPA routing hoặc IPC route riêng cho Desktop), lazy-load độc lập.
- 4 màn hình dùng chung: **AI Config Panel** (bên phải), **Provider Router**, và cùng ghi vào **1 nhóm lịch sử "Video đã tạo"** duy nhất (bất kể tạo từ màn hình nào).
- Dựng **Shared Layout Component** (khung ngoài: sidebar submenu + AI Config Panel + nút Render) — 4 màn hình con chỉ khác phần Input bên trái.
- **Sidebar Navigation Component phải tổng quát, hỗ trợ N cấp submenu** — không hardcode riêng cho "Tạo Video AI", vì menu "Công cụ" sẽ chứa thêm các nhóm tính năng khác trong tương lai theo cùng mô hình.

### Cấu trúc mỗi màn hình con

```
┌─────────────────────────────────┬─────────────────────────────┐
│  KHU VỰC INPUT (trái)           │  KHU VỰC CẤU HÌNH AI (phải) │
│  - Tabs chọn Mode               │  - Video Model              │
│  - Form nhập theo từng Mode     │  - Số lượng phân cảnh       │
│  - Nút hành động                │  - Aspect Ratio             │
│                                 │  - Thời lượng video         │
│                                 │  - Số luồng song song       │
│                                 │  - Bật/tắt watermark        │
│                                 │  - Âm thanh & Giọng nói     │
│                                 │  - Cấu hình tạo ảnh         │
└─────────────────────────────────┴─────────────────────────────┘
│              [ ⚡ Bắt đầu Render Hàng loạt ]                   │
└───────────────────────────────────────────────────────────────┘
```

---

## 2. Chức Năng 1 — Copy Video

**Input:** ô dán link TikTok/YouTube/Facebook + nút "Phân tích Video & Lấy Kịch bản".

**Flow:**
```
Dán Link → Validate Link → Download/Extract video
   → Phân tích: STT (audio→text) + Scene Detection + Vision-Language Model mô tả từng cảnh
      + phân tích nhịp điệu/cắt dựng
   → Tổng hợp Kịch bản (Script) + Prompt chuẩn hoá theo Video Model
   → Hiển thị Script Editor (editable) cho người dùng xem/sửa
   → Bấm "Bắt đầu Render Hàng loạt"
   → Provider Router → Video Model render từng Scene
   → Ghép nối (nếu nhiều scene) → Xuất .mp4
```

**Thành phần kỹ thuật:** Video Downloader Service (TikTok/YouTube/FB — lưu ý rủi ro ToS/bản quyền, cần rate-limit/retry khi platform nguồn thay đổi cấu trúc/chặn IP); Video Analyzer Service (STT + Scene Detection + VLM); Prompt Builder (adapter theo từng Video Model); Script Editor UI.

**Riêng chức năng này có tuỳ chọn:** "Giữ lại âm thanh gốc" (checkbox, chỉ hiện ở mode Copy) → cần pipeline tách và merge lại audio gốc vào video mới.

---

## 3. Chức Năng 2 — Tạo Video Từ Ý Tưởng

**Flow:**
```
Nhập Ý tưởng (free text)
   → (Tuỳ chọn) hỏi thêm: phong cách, nhân vật, bối cảnh, cảm xúc, thể loại
   → LLM sinh Kịch bản + Prompt chi tiết theo từng Scene
   → Hiển thị Prompt để review/sửa
   → Provider Router → Video Model
   → Render theo số Scene (manual hoặc "Tự động" — AI tự quyết định dựa trên độ dài/độ phức tạp nội dung)
   → Xuất .mp4
```

**Thành phần kỹ thuật:** Idea-to-Prompt Engine (dùng chung logic Prompt Builder với Copy Video); Scene Splitter; Template Prompt adapter theo từng Model.

---

## 4. Chức Năng 3 — Tạo Video Từ Ảnh

**Input:** upload/chọn nhiều ảnh (multi-select, drag & drop) + sắp xếp thứ tự ảnh + (tuỳ chọn) mô tả chuyển động cho từng ảnh (VD: "camera zoom in chậm").

**Flow:**
```
Chọn 1..n ảnh → (tuỳ chọn) nhập mô tả chuyển động cho mỗi ảnh
   → Build Prompt (Image + Text) theo chuẩn Video Model đã chọn
   → Provider Router → Model hỗ trợ Image-to-Video (VD: Veo Frames-to-Video, Omni)
   → Render từng clip theo từng ảnh
   → Nếu nhiều ảnh: ghép nối clip theo thứ tự (có thể cần transition effect) → Xuất .mp4
```

**Thành phần kỹ thuật:** Ảnh input chỉ cần **lưu tạm thời** (temp storage) để gửi lên Provider — không đóng gói theo định dạng riêng nào, không liên quan `.eigu`; Image-to-Video Adapter (Provider Router map đúng model hỗ trợ "Frames to Video"/"Image to Video"); Multi-image Sequencing.

---

## 5. Chức Năng 4 — Tạo Video Theo Mẫu

Tính năng phức tạp nhất, gồm **2 chế độ con**.

### 5.1. Chế độ A — Ghép Nhân Vật Vào Video Mẫu (Character Replacement)

**Ví dụ thực tế:** Video mẫu là clip TikTok có sẵn (một cô gái nhảy theo trend) + 1 ảnh chân dung nhân vật mong muốn → hệ thống **thay thế nhân vật trong video gốc bằng nhân vật trong ảnh**, giữ nguyên chuyển động nhảy, góc quay, bối cảnh, nhạc nền.

**Input (đã CHỐT):**
- Upload Video mẫu
- Upload Ảnh nhân vật — **tối đa 2 ảnh** (không giới hạn nhiều góc). **Lý do:** module phục vụ video ngắn theo trend (thường < 1 phút, dạng 1 nhân vật nữ nhảy đơn giản), không phải video dài/tuyển tập nhiều nhân vật. Giới hạn 2 ảnh giúp tăng độ chính xác nhận diện nhân vật, tránh trường hợp 1 ảnh chứa nhiều nhân vật gây nhầm lẫn cho Model.
- **Provider PoC đầu tiên (đã CHỐT): Gemini Omni** — model hỗ trợ "tạo và chỉnh sửa video từ bất kỳ input tham chiếu nào". Làm PoC với Gemini Omni trước, sau đó mới xét mở rộng sang Provider khác (Kling, Runway...).

**Flow:**
```
Upload Video mẫu + Ảnh nhân vật (tối đa 2 ảnh)
   → Phân tích Video mẫu: motion/pose tracking, bối cảnh, khung hình, timing
   → Phân tích Ảnh nhân vật: đặc điểm khuôn mặt, ngoại hình
   → Build Prompt/Reference Input cho Gemini Omni
   → Render video mới: giữ nguyên chuyển động/bối cảnh gốc, nhân vật là ảnh mới
   → Xuất .mp4
```

### 5.2. Chế độ B — Sao Chép 100% Cấu Trúc, Đổi Nhân Vật & Bối Cảnh (Full Remake)

**Flow:**
```
Upload Video mẫu
   → Phân tích cấu trúc: số cảnh, thời lượng mỗi cảnh, loại chuyển động camera, bố cục, nhịp độ, transitions
   → Người dùng nhập mô tả Nhân vật mới + Bối cảnh mới (text hoặc ảnh tham chiếu)
   → Build Prompt kết hợp: [Cấu trúc video mẫu] + [Nhân vật/Bối cảnh mới]
   → Render từng Scene theo cấu trúc gốc, nội dung hình ảnh mới
   → Ghép nối → Xuất .mp4
```

### 5.3. Thành phần kỹ thuật dùng chung

- **Video Structure Analyzer**: trích xuất khung sườn video mẫu (số cảnh, thời lượng, góc quay, chuyển động camera, nhịp cắt) — tái dùng engine tương tự Chức năng 1 nhưng tập trung vào *cấu trúc* thay vì *nội dung*.
- **Character/Reference Injection Engine**: cần Provider hỗ trợ reference image + video/motion (đầu tiên: Gemini Omni).
- **Consistency Check**: đảm bảo nhân vật mới nhất quán qua nhiều cảnh (subject consistency) — là tiêu chí quan trọng khi đánh giá Provider mở rộng sau này.
- **Model Management cần capability flag** đánh dấu rõ model nào hỗ trợ "video-to-video editing với reference input", để Provider Router chỉ route đúng loại request này tới đúng model.

---

## 6. Cấu Hình AI (AI Config Panel) — Dùng Chung 4 Chức Năng

### 6.1. Danh sách cấu hình

| Cấu hình | Loại | Ghi chú |
|----------|------|---------|
| Video Model | Dropdown | Lấy động từ `AIModelConfig`, không hardcode |
| Số lượng phân cảnh | Dropdown/Số | "Tự động" hoặc số cụ thể |
| Aspect Ratio | Dropdown | 16:9 / 9:16 / 1:1 — theo danh sách model đã chọn hỗ trợ |
| Thời lượng video | Dropdown | Auto/8s/10s... theo giới hạn từng Model |
| Số luồng song song | Số | **Khác nhau theo từng gói — xem bảng mục 10** (Basic 4 / Pro 8 / Team 20 / Enterprise cao nhất) |
| Watermark (của Provider/Model) | Toggle | Xem quy tắc chi tiết mục 6.2 |
| Âm thanh & Giọng nói | Checkbox | "Giữ âm thanh gốc" chỉ hiện ở mode Copy Video |

### Cấu hình tạo ảnh (khi có bước sinh ảnh trung gian)

| Cấu hình | Loại |
|----------|------|
| Model tạo ảnh | Dropdown (VD: Nano Banana) |
| Số lượng ảnh | Số |
| Tỉ lệ ảnh | Dropdown |

**Nguyên tắc:** toàn bộ Model/Aspect Ratio/Duration khả dụng phải **lấy động** từ `AIModelConfig` theo Provider đang active — không hardcode Frontend. Mỗi Model cần metadata: aspect ratio hỗ trợ, duration hỗ trợ, hỗ trợ audio gốc không, hỗ trợ reference/character injection không, chi phí AI Budget quy đổi (nội bộ, xem mục 8.3), có hỗ trợ ẩn/hiện watermark không.

### 6.2. Quy Tắc Watermark (3 loại — bắt buộc phân biệt rõ)

| Loại | Là gì | Hiển thị trên video xuất? | Kiểm soát bởi |
|------|-------|------------------------------|----------------|
| **1. EIGU Watermark** | Logo/tên EIGU | **KHÔNG BAO GIỜ**, ở mọi gói kể cả Free/Trial | Cấm tuyệt đối |
| **2. Watermark hiển thị của Provider** | Logo Model AI (VD: Veo) tự gắn khi render | Có thể **Ẩn/Hiện** — tuỳ có mua add-on hay không | EIGU xử lý bằng **blur/che toạ độ** ở hậu kỳ |
| **3. SynthID (watermark ẩn)** | Thuỷ vân số vô hình, xác minh nội dung AI | **Luôn có mặt**, không thể tắt, mọi gói | Provider (Google) áp đặt — EIGU không can thiệp |

**Lý do EIGU không gắn watermark riêng:** EIGU định vị là **công cụ (tool)**, không phải nền tảng/thương hiệu tạo video AI — gắn thương hiệu EIGU lên sản phẩm cuối có thể gây hiểu lầm về nguồn gốc nội dung. → Không có khái niệm "EIGU watermark" trong toàn hệ thống, trường "watermark" trong Model Management chỉ áp dụng cho Loại 2.

**Cơ chế xử lý watermark Provider (đã CHỐT — final):**
- **Không bắt buộc gọi API ẩn watermark chính thức của Provider** (vì không phải Provider nào cũng hỗ trợ). Ưu tiên xử lý bằng **kỹ thuật hậu kỳ**: xác định toạ độ (x, y, width, height) vùng watermark theo từng Model → **blur/che vùng đó** trong Video Post-Processing Service, trước khi xuất `.mp4` cuối.
- Giữ toggle "Ẩn/Hiện watermark" trong AI Config Panel.
- **Cách tính phí:** flat fee cố định, nạp thêm 1 lần để mở khoá — VD **50.000 VNĐ** (số tiền cụ thể do Admin cấu hình, không hardcode). **Không tính theo Credit, không khác nhau theo Model/Provider** — mức phí đồng nhất cho toàn bộ hệ thống, bất kể dùng Model/Provider nào.
- Đây là **add-on trả phí độc lập với Subscription Package**, giao dịch Billing/Payment riêng, tách khỏi Subscription chính.
- **Chu kỳ mua (đã CHỐT):** add-on này **mua theo chu kỳ Subscription** (Tháng / Quý / 6 Tháng / Năm) — **không phải mua 1 lần dùng vĩnh viễn**. Khi Subscription hết hạn hoặc không gia hạn add-on ở chu kỳ tiếp theo, tính năng "Ẩn watermark" tự động tắt (video sau đó render sẽ hiện watermark của Provider trở lại) → cần trường `watermark_addon_expiry_date` gắn theo tài khoản, đồng bộ theo chu kỳ Billing của add-on.

**Hệ quả kiến trúc:**
- Bảng `ModelWatermarkRegion` (`model_id`, `x`, `y`, `width`, `height` hoặc vùng động theo tỉ lệ khung hình) — Admin tự cấu hình, không hardcode toạ độ trong code.
- **Video Post-Processing Service** (chạy sau Render, trước xuất file cuối): đọc cấu hình vùng watermark của Model đã dùng → nếu user đã mua add-on → blur/che vùng đó → xuất `.mp4` cuối.

**Quy tắc SynthID (Loại 3):** bắt buộc, mặc định, không thể tắt, áp dụng mọi gói kể cả cao cấp nhất. **Không hiển thị bất kỳ lựa chọn "ẩn SynthID" nào trong UI.**

---

## 7. Output & Mô Hình Tính Phí

### 7.1. Output chuẩn
- Video: `.mp4` (chuẩn cho cả 4 chức năng)
- Ảnh trung gian (nếu có bước sinh ảnh): `.png`/`.jpg`
- File tải về/xem trực tiếp trong app — **không đóng gói theo định dạng dự án riêng nào**; lưu trữ lâu dài kiểu "Project" (nếu có) là tính năng khác, ngoài phạm vi module này.

### 7.2. Mô Hình Tính Phí (đã CHỐT — Final): KHÔNG dùng Credit — Flat/Unlimited theo gói

> Module "Tạo Video AI (nhanh)" **không tính phí theo Credit trên mỗi lượt render**. Miễn tài khoản đã mua **bất kỳ gói Subscription trả phí nào** đang mở quyền module này, người dùng **tạo video không giới hạn số lượng** trong thời hạn gói. Mục tiêu: tạo cảm giác thoải mái, không lo đếm lượt render.

**Nguyên tắc:**
- Không trừ Credit khi render ở module này — bất kể Model, số Scene, Duration.
- Điều kiện render duy nhất: **(1)** tài khoản có quyền truy cập module/màn hình đó (Entitlement — xem mục 10), **(2)** Subscription còn hiệu lực.
- Ngoại lệ duy nhất phát sinh phí thêm: **add-on "Ẩn watermark"** (flat fee riêng, mục 6.2).

> ✅ **Đã CHỐT (Product Owner xác nhận):** mô hình Flat/Unlimited này **chỉ áp dụng riêng cho module "Tạo Video AI (nhanh)"**, **không phải** định hướng chung cho toàn bộ EIGU Platform. Các module khác trong tương lai (VD: "AI Video Studio" đầy đủ) vẫn có thể theo mô hình Credit-metered. → Kiến trúc Billing **bắt buộc phải hỗ trợ song song 2 chế độ tính phí theo từng module**: `Subscription`/`Package`/`Module` cần có cờ `billing_mode` (`flat` | `credit`) gắn theo từng `module_key`, để Pricing Engine biết module nào bỏ qua Credit (chỉ kiểm tra Entitlement + Expiry) và module nào vẫn trừ Credit theo lượt.

### 7.3. Giám sát AI Budget nội bộ (bắt buộc, không phải tính phí khách hàng)

Vì không tính Credit theo lượt, **Admin AI Budget** (chi phí AI thật trả cho Provider) là **rủi ro vận hành chính**. Cần:
- **Internal Usage Monitor** (ẩn với khách hàng, không ảnh hưởng trải nghiệm "không giới hạn"): theo dõi tài khoản nào tiêu tốn AI Budget bất thường so với mức trung bình của gói.
- **Fair-Use Policy ẩn** (ngưỡng cảnh báo nội bộ, không công bố công khai là "giới hạn"): cơ sở để Admin xử lý lạm dụng cực đoan (VD: script tự động render hàng nghìn video/ngày).

### 7.4. Luồng xử lý khi bấm Render

```
Bấm "Bắt đầu Render Hàng loạt"
   → Kiểm tra Entitlement: tài khoản có quyền dùng màn hình này không? (mục 10)
      (Không) → Chặn, hiển thị badge "Upgrade" → Popup "Bảng giá"
      (Có) → Kiểm tra Subscription còn hiệu lực?
         (Hết hạn) → Chặn, yêu cầu gia hạn
         (Còn hiệu lực) → Provider Router → Render (không trừ Credit)
   → Ghi Usage Log nội bộ (chỉ Admin giám sát — mục 7.3, KHÔNG trừ tiền khách)
   → Nếu đã mua add-on "Ẩn watermark" → Video Post-Processing Service blur vùng watermark
   → Xuất .mp4, lưu tại máy local khách hàng
```

---

## 8. Bảng Giá Chính Thức

Chu kỳ thanh toán: Tháng / Quý / 6 Tháng / Năm.

| Gói | Giá (VNĐ/tháng) | Số Video | Luồng song song tối đa | Độ phân giải | Màn hình được dùng | Số máy |
|-----|------------------|----------|--------------------------|---------------|------------------------|---------|
| **Basic** | 150.000 | Không giới hạn | 4 | 720p | Copy Video, Tạo từ Ý tưởng | 1 |
| **Pro** | 450.000 | Không giới hạn | 8 | 1080p/2K | Full 4 màn hình | 1 |
| **Team** | 1.800.000 | Không giới hạn | 20 | 1080p/2K/4K | Full 4 màn hình | 5 (giảm ~40%*, hỗ trợ nhanh) |
| **Enterprise** | 5.400.000 | Không giới hạn | **20 (max)** | 4K+ | Full 4 màn hình | 30 (giảm ~40%*, hỗ trợ ưu tiên 24/7) |

`*` **"Giảm ~40%" là một ưu đãi có sẵn, đi kèm mặc định của gói Team/Enterprise** — **không** gắn với/áp dụng cho bất kỳ điều kiện nào khác (không phải chiết khấu theo chu kỳ thanh toán hay điều kiện riêng gì cả). Hiển thị đơn thuần như một quyền lợi liệt kê trong gói, không cần logic tính toán riêng.

**Số luồng song song KHÁC NHAU theo từng gói** (Basic 4 / Pro 8 / Team 20 / Enterprise 20 — **20 luồng là mức trần tối đa của toàn hệ thống**, Team và Enterprise dùng chung mức trần này) — đây là số liệu **chính thức, thay thế mọi quyết định "đồng nhất mọi gói" ở các bản nháp trước**.

---

## 9. Mô Hình Entitlement (Quyền Truy Cập) — ĐÃ CHỐT, ÁP DỤNG TOÀN PLATFORM

> **Quyết định cuối cùng của Product Owner:** Đây là cơ chế entitlement **chung cho mọi module trong EIGU Platform**, không riêng module "Tạo Video AI":
>
> - **Mỗi module có badge "Upgrade" cạnh tab/menu của module đó.**
> - Bấm vào badge (hoặc vào tính năng bị khoá) → hiển thị **Popup "Bảng giá"** (Basic/Pro/Team/Enterprise) → chọn gói phù hợp để mở khoá tính năng của module đó.

### 9.1. Cơ chế Trial (7 ngày)

- Tài khoản mới (**gói Trial**) được **sử dụng TẤT CẢ các module/màn hình** (không giới hạn theo tier) trong **7 ngày**.
- **Sau 7 ngày**, nếu tài khoản **chưa nâng cấp** lên gói trả phí → mỗi module/màn hình hiển thị **badge "Upgrade"**; các màn hình vượt quyền của gói hiện tại bị khoá cho tới khi nâng cấp.
- Khi nâng cấp và chọn gói → mở khoá đúng tập màn hình mà gói đó cho phép (theo bảng mục 8/9.2).

### 9.2. Entitlement theo từng màn hình con (sau khi hết Trial)

| Màn hình con | Basic | Pro | Team | Enterprise |
|---------------|:-----:|:---:|:----:|:----------:|
| Copy Video | ✅ | ✅ | ✅ | ✅ |
| Tạo Video Từ Ý Tưởng | ✅ | ✅ | ✅ | ✅ |
| Tạo Video Từ Ảnh | ❌ | ✅ | ✅ | ✅ |
| Tạo Video Theo Mẫu | ❌ | ✅ | ✅ | ✅ |

→ Basic chỉ mở 2/4 màn hình; từ Pro trở lên mở đủ 4/4.

### 9.3. Nguyên tắc UX (đã CHỐT)

- **Menu/màn hình LUÔN HIỂN THỊ** cho mọi tài khoản (Basic/Trial hết hạn...) — **không ẩn hẳn** menu khỏi giao diện.
- Với màn hình vượt quyền gói hiện tại: hiển thị **badge "Upgrade"** trên chính tab/menu đó → bấm vào mở **Popup "Bảng giá"** để chọn gói.
- Đây là hành vi **thống nhất cho toàn bộ EIGU Platform**, không chỉ riêng module Tạo Video AI.

### 9.4. Hệ quả kiến trúc

- `module_key` trong bảng `PackageModuleAccess` cần chi tiết **theo từng màn hình con**:
  - `ai_video_copy`, `ai_video_idea`, `ai_video_image`, `ai_video_template`
- Mỗi `module_key` map với danh sách gói được phép dùng — cấu hình động qua Admin Backoffice, **không hardcode**.
- Bảng `TrialAccess` (hoặc field tương đương trên `Subscription`): `trial_start_date`, `trial_end_date` (mặc định +7 ngày), `trial_status`. Trong thời gian Trial, entitlement check **bỏ qua bảng `PackageModuleAccess`** và cho phép truy cập toàn bộ module.
- Sau khi Trial hết hạn (`trial_end_date` < hiện tại) và chưa có Subscription trả phí active → entitlement check quay lại dùng `PackageModuleAccess` theo gói hiện tại (nếu chưa mua gói nào → coi như không có quyền màn hình nào, chỉ hiển thị badge Upgrade khắp nơi).

---

## 10. Yêu Cầu Kỹ Thuật Tổng Hợp Cần Triển Khai

| Hạng mục | Yêu cầu |
|----------|---------|
| Routing | 4 route/screen riêng trong submenu "Tạo Video AI", dùng Shared Layout Component |
| Copy Video | Video Downloader + Video Analyzer (STT/Scene Detection/VLM) + Script Editor |
| Tạo Từ Ý Tưởng | Idea-to-Prompt Engine + Scene Splitter |
| Tạo Từ Ảnh | Multi-image upload + Image-to-Video Adapter + Sequencing |
| Tạo Theo Mẫu | 2 chế độ (Character Replacement tối đa 2 ảnh / Full Remake) + Video Structure Analyzer + Character/Reference Injection Engine (PoC: Gemini Omni) |
| AI Config Panel | Model/Aspect Ratio/Duration lấy động từ `AIModelConfig`; số luồng song song theo gói (bảng mục 8) |
| Watermark | 3 loại tách bạch: EIGU (cấm), Provider (blur hậu kỳ + add-on flat fee 50k, không phân biệt Model, **mua theo chu kỳ Tháng/Quý/6 Tháng/Năm — không phải 1 lần vĩnh viễn**), SynthID (luôn bật, ẩn khỏi UI) |
| Billing | Flat/Unlimited theo gói — **chỉ áp dụng riêng module "Tạo Video AI (nhanh)"**, không phải toàn platform; cờ `billing_mode` (`flat`\|`credit`) gắn theo `module_key` để hỗ trợ song song nhiều module với mô hình tính phí khác nhau |
| Entitlement | Trial 7 ngày full-access toàn platform → sau đó theo `PackageModuleAccess` per-screen; badge "Upgrade" luôn hiển thị, không ẩn menu |
| Giám sát vận hành | Internal Usage Monitor + Fair-Use Policy ẩn (không hiển thị khách hàng) |
| Loại trừ phạm vi | Không xây Project, không xây Agent Memory/Agent Chat cho module này |

---

## 11. Trạng Thái Tài Liệu

✅ **Không còn câu hỏi mở.** Toàn bộ các điểm nghiệp vụ (bảng giá, số luồng song song, mô hình tính phí, chu kỳ add-on watermark, entitlement, giới hạn ảnh nhân vật, Provider ưu tiên PoC, cơ chế Trial/Upgrade) đã được Product Owner xác nhận và CHỐT trong tài liệu này. **Tài liệu này là bản đặc tả cuối cùng (final spec) — sẵn sàng để triển khai trực tiếp.**

Nếu trong quá trình triển khai phát sinh thêm câu hỏi nghiệp vụ mới, cần quay lại xác nhận với Product Owner trước khi tự ý quyết định, thay vì suy diễn từ các quyết định đã có ở trên.