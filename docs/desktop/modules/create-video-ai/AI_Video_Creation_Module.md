# Module "Tạo Video AI" — Tài Liệu Thiết Kế Chi Tiết

> Tài liệu này mô tả chi tiết các chức năng, cấu hình, và luồng xử lý của module **Tạo Video AI**, dựa trên UI hiện tại và các đề xuất nâng cấp. Mục tiêu: dùng làm tài liệu tham chiếu để chỉnh sửa / nâng cấp module.

---

## 1. Tổng Quan Module

Module "Tạo Video AI" là màn hình trung tâm cho phép người dùng tạo video bằng AI theo **4 phương thức đầu vào (input mode)** khác nhau, cùng chia sẻ chung một **bảng cấu hình AI (AI Config Panel)** ở bên phải.

### 1.1. Các phương thức tạo video (Input Modes)

| # | Mode | Mô tả ngắn |
|---|------|------------|
| 1 | **Copy Video** | Dán link TikTok/YouTube/Facebook → phân tích video gốc → sinh Prompt → render video mới |
| 2 | **Tạo từ Ý tưởng** | Người dùng nhập ý tưởng (text) → sinh Prompt → chuyển thành video |
| 3 | **Tạo video từ hình ảnh** | Người dùng chọn 1 hoặc nhiều ảnh bất kỳ → chuyển hình ảnh thành video |
| 4 | **Tạo theo Video mẫu** | Tải lên video mẫu + ảnh nhân vật → ghép nhân vật vào video mẫu, hoặc sao chép 100% cấu trúc video mẫu với nhân vật/bối cảnh khác |

### 1.2. Cấu trúc màn hình

```
┌────────────────────────────────┬────────────────────────────────┐
│  KHU VỰC INPUT (trái)          │  KHU VỰC CẤU HÌNH AI (phải)    │
│  - Tabs chọn Mode              │  - Video Model                 │
│  - Form nhập theo từng Mode    │  - Số lượng phân cảnh          │
│  - Nút hành động (Phân tích /  │  - Aspect Ratio                │
│    Tạo Prompt / Preview)       │  - Thời lượng video            │
│                                │  - Số luồng song song          │
│                                │  - Bật/tắt watermark           │
│                                │  - Âm thanh & Giọng nói        │
│                                │  - Cấu hình tạo ảnh (Nano      │
│                                │    Banana / model khác)        │
└────────────────────────────────┴────────────────────────────────┘
│                        [ ⚡ Bắt đầu Render ]                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Chức Năng 1 — Copy Video

### 2.1. Mục đích
Cho phép người dùng sao chép ý tưởng / cấu trúc / kịch bản từ một video có sẵn trên mạng xã hội (TikTok, YouTube, Facebook), sau đó tái tạo lại thành video mới bằng AI.

### 2.2. Input
- Ô nhập: **"Dán link TikTok/YouTube/Facebook..."**
- Nút: **"Phân tích Video & Lấy Kịch bản"**

### 2.3. Luồng xử lý (Flow)

```
Người dùng dán Link
      ↓
Hệ thống validate Link (domain, format, tồn tại)
      ↓
Download / Extract video (qua service bên thứ 3 hoặc downloader nội bộ)
      ↓
Phân tích video:
   - Tách audio → Speech-to-Text (lấy thoại/voice-over)
   - Phân tích khung hình (scene detection, nhận diện nhân vật, bối cảnh, hành động, chuyển cảnh)
   - Phân tích nhịp điệu / cắt dựng (pacing, số lượng cut, độ dài mỗi cảnh)
      ↓
Tổng hợp thành Kịch bản (Script) + Prompt chuẩn hoá cho Video Model
      ↓
Hiển thị Kịch bản cho người dùng xem / chỉnh sửa (editable)
      ↓
Người dùng bấm "Bắt đầu Render Hàng loạt"
      ↓
Gửi Prompt + Cấu hình AI (bên phải) → Provider Router → Video Model
      ↓
Render video mới theo từng Scene
      ↓
Ghép nối (nếu nhiều scene) → Xuất video hoàn chỉnh
```

### 2.4. Các thành phần kỹ thuật cần có

- **Video Downloader Service**: hỗ trợ TikTok, YouTube, Facebook (cần tính đến rủi ro pháp lý bản quyền / ToS của các nền tảng, và giới hạn tốc độ / chống chặn IP)
- **Video Analyzer Service**:
  - Speech-to-Text (STT)
  - Scene Detection / Shot Boundary Detection
  - Vision-Language Model để mô tả nội dung từng cảnh (dùng chính AI Provider đã cấu hình, ví dụ Gemini)
- **Prompt Builder**: chuẩn hoá kết quả phân tích thành Prompt template theo từng Video Model (vì mỗi model — Veo 3, Omni, ... — có cấu trúc prompt khác nhau)
- **Script Editor UI**: cho phép người dùng sửa kịch bản trước khi render (rất quan trọng để tránh render sai ý)

### 2.5. Lưu ý nghiệp vụ / rủi ro

- Cần làm rõ ranh giới giữa "lấy cảm hứng / phân tích cấu trúc" và "sao chép nguyên bản nội dung có bản quyền" — nên có disclaimer và cơ chế người dùng tự chịu trách nhiệm nội dung.
- Cần rate-limit / retry khi nền tảng nguồn (TikTok/YouTube/FB) thay đổi cấu trúc hoặc chặn tải video.
- Âm thanh gốc: có tuỳ chọn **"Giữ lại âm thanh gốc (chỉ cho chế độ Copy)"** → cần pipeline tách và merge lại audio gốc vào video mới.

---

## 3. Chức Năng 2 — Tạo Từ Ý Tưởng

### 3.1. Mục đích
Người dùng nhập ý tưởng bằng văn bản (text) → hệ thống sinh Prompt chi tiết → chuyển thành video.

### 3.2. Luồng xử lý (Flow)

```
Người dùng nhập Ý tưởng (free text)
      ↓
(Tuỳ chọn) Hệ thống hỏi thêm chi tiết: phong cách, nhân vật, bối cảnh, cảm xúc, thể loại
      ↓
AI (LLM) sinh Kịch bản + Prompt chi tiết theo từng Scene
      ↓
Hiển thị Prompt cho người dùng review / chỉnh sửa
      ↓
Gửi Prompt + Cấu hình AI → Provider Router → Video Model
      ↓
Render theo số lượng Scene (manual hoặc tự động dựa trên nội dung)
      ↓
Xuất video hoàn chỉnh
```

### 3.3. Thành phần kỹ thuật

- **Idea-to-Prompt Engine**: dùng LLM để mở rộng ý tưởng ngắn thành kịch bản đầy đủ (có thể tái sử dụng chung logic Prompt Builder với chức năng Copy Video)
- **Scene Splitter**: nếu chọn "Tự động (Dựa trên nội dung)" → AI tự quyết định số lượng phân cảnh dựa trên độ dài & độ phức tạp nội dung
- **Template Prompt theo Model**: mỗi Video Model có prompt schema riêng, cần lớp adapter chuyển đổi

---

## 4. Chức Năng 3 — Tạo Video Từ Hình Ảnh

### 4.1. Mục đích
Người dùng chọn một hoặc nhiều hình ảnh bất kỳ (upload hoặc chọn từ thư viện) → AI chuyển hoá thành video (image-to-video).

### 4.2. Input cần bổ sung trong UI

- Khu vực upload / chọn nhiều ảnh (multi-select, drag & drop)
- Sắp xếp thứ tự ảnh (nếu tạo video nhiều cảnh nối tiếp từ nhiều ảnh)
- (Tuỳ chọn) Prompt bổ sung mô tả chuyển động / hành động mong muốn cho từng ảnh (ví dụ: "nhân vật quay đầu và mỉm cười", "camera zoom in chậm")

### 4.3. Luồng xử lý (Flow)

```
Người dùng chọn 1..n ảnh
      ↓
(Tuỳ chọn) Nhập mô tả chuyển động / prompt bổ sung cho mỗi ảnh
      ↓
Hệ thống build Prompt (Image + Text) theo chuẩn của Video Model đã chọn
      ↓
Gửi tới Provider Router → Model hỗ trợ Image-to-Video (VD: Veo Frames-to-Video, Omni)
      ↓
Render từng clip theo từng ảnh
      ↓
Nếu nhiều ảnh: ghép nối các clip theo thứ tự → xuất video hoàn chỉnh
```

### 4.4. Thành phần kỹ thuật

- **Image Upload & Storage**: lưu tạm ảnh gốc (local `.eigu` theo thiết kế đã thống nhất, kèm metadata trong DB)
- **Image-to-Video Adapter**: một số Provider gọi là "Frames to Video" hoặc "Image to Video" — cần Provider Router map đúng model hỗ trợ tính năng này
- **Multi-image Sequencing**: cơ chế nối nhiều clip (giữa các ảnh) mượt mà — có thể cần thêm transition effect

---

## 5. Chức Năng 4 — Tạo Theo Video Mẫu

Đây là tính năng **quan trọng và phức tạp nhất**, cần tách thành 2 chế độ con.

### 5.1. Chế độ A — Ghép nhân vật vào Video mẫu (Character Replacement)

**Mục đích:** Người dùng tải lên 1 video mẫu (mẫu chuyển động/kịch bản) + 1 ảnh nhân vật → AI thay thế nhân vật trong video mẫu bằng nhân vật mới, giữ nguyên chuyển động, bối cảnh, góc quay, nhịp điệu.

**Input:**
- Upload Video mẫu
- Upload Ảnh nhân vật (1 hoặc nhiều góc mặt để tăng độ chính xác)

**Flow:**
```
Upload Video mẫu + Ảnh nhân vật
      ↓
Phân tích Video mẫu: tách chuyển động (motion/pose tracking), bối cảnh, khung hình, timing
      ↓
Phân tích Ảnh nhân vật: đặc điểm khuôn mặt, ngoại hình
      ↓
Build Prompt / Reference Input cho Model hỗ trợ "Character/Reference-based Generation"
   (ví dụ: Gemini Omni — "Create and edit videos from any input reference")
      ↓
Render video mới: giữ nguyên chuyển động/bối cảnh của video mẫu, nhân vật là ảnh mới
      ↓
Xuất video hoàn chỉnh
```

### 5.2. Chế độ B — Sao chép 100% cấu trúc, đổi nhân vật & bối cảnh (Full Remake)

**Mục đích:** Sao chép toàn bộ cấu trúc kịch bản / chuyển động / nhịp cắt của video mẫu, nhưng nhân vật và bối cảnh hoàn toàn khác (không cần giữ nguyên bối cảnh cũ).

**Flow:**
```
Upload Video mẫu
      ↓
Phân tích cấu trúc: số cảnh, thời lượng mỗi cảnh, loại chuyển động camera,
   bố cục, nhịp độ, transitions
      ↓
Người dùng nhập mô tả Nhân vật mới + Bối cảnh mới (text hoặc ảnh tham chiếu)
      ↓
Build Prompt kết hợp: [Cấu trúc từ video mẫu] + [Nhân vật/Bối cảnh mới từ người dùng]
      ↓
Render từng Scene theo cấu trúc gốc nhưng nội dung hình ảnh mới
      ↓
Ghép nối → Xuất video hoàn chỉnh
```

### 5.3. Thành phần kỹ thuật dùng chung cho Chức năng 4

- **Video Structure Analyzer**: trích xuất "khung sườn" của video mẫu (số cảnh, thời lượng, loại góc quay, chuyển động camera, nhịp cắt) — tương tự engine dùng ở Chức năng 1 (Copy Video) nhưng tập trung vào *cấu trúc* thay vì *nội dung*
- **Character/Reference Injection Engine**: cần Provider hỗ trợ input dạng reference image kết hợp video/motion (hiện tại ví dụ thực tế: Gemini Omni của Google Flow hỗ trợ "tạo và chỉnh sửa video từ bất kỳ input tham chiếu nào — thật hoặc do AI tạo")
- **Consistency Check**: đảm bảo nhân vật mới giữ được tính nhất quán (subject consistency) qua nhiều cảnh — đây là điểm quan trọng khi chọn Provider (một số model như Nano Banana được quảng bá mạnh ở khả năng "subject consistency")

> ⚠️ Cần điều tra & quyết định: tính năng "ghép nhân vật vào video mẫu" đòi hỏi Provider có khả năng **video-to-video editing với reference input** — không phải Video Model nào cũng hỗ trợ. Cần đánh dấu rõ trong **Model Management** model nào hỗ trợ tính năng này (capability flag), để Provider Router chỉ route đúng các request loại này tới đúng model.

---

## 6. Cấu Hình AI (AI Config Panel) — Dùng Chung Cho Cả 4 Chức Năng

### 6.1. Danh sách cấu hình

| Cấu hình | Loại | Ví dụ giá trị | Ghi chú |
|----------|------|----------------|---------|
| **Mô hình tạo Video (Video Model)** | Dropdown | Veo 3 (8s/clip), Gemini Omni Flash, ... | Lấy động từ bảng `AIModelConfig`, không hardcode |
| **Số lượng phân cảnh (Scenes)** | Dropdown / Số | Tự động (dựa trên nội dung), hoặc số cụ thể (1, 2, 3...) | Ảnh hưởng trực tiếp đến số Credit tiêu tốn |
| **Tỉ lệ khung hình (Aspect Ratio)** | Dropdown | 16:9 (YouTube), 9:16 (TikTok/Reels), 1:1 (Instagram) | Phải theo danh sách ratio mà Model đã chọn hỗ trợ |
| **Thời lượng video (Duration)** | Dropdown | Auto, 8s, 10s, ... | Phụ thuộc giới hạn của từng Model |
| **Số luồng song song (Parallel Threads)** | Số | 1, 2, 3, 4 (tối đa 4) | Ảnh hưởng tốc độ render hàng loạt & tải hệ thống / rate-limit Provider |
| **Watermark** | Toggle | Bật / Tắt | Có thể ràng buộc theo gói Subscription (VD: gói Free/Basic bắt buộc bật watermark) |
| **Âm thanh & Giọng nói** | Checkbox | Giữ lại âm thanh gốc (chỉ cho chế độ Copy) | Chỉ hiển thị khi ở mode Copy Video |

### 6.2. Cấu hình tạo ảnh (Image Generation Config)

Phần này xuất hiện khi luồng cần sinh ảnh trung gian (ví dụ: sinh ảnh nhân vật/bối cảnh trước khi tạo video, hoặc chức năng tạo ảnh độc lập trong studio).

| Cấu hình | Loại | Ví dụ giá trị |
|----------|------|----------------|
| **Model tạo ảnh** | Dropdown | Nano Banana, hoặc model ảnh khác của Provider khác |
| **Số lượng ảnh** | Số | 1, 2, 4, ... |
| **Tỉ lệ ảnh (Aspect Ratio)** | Dropdown | 16:9, 9:16, 1:1, ... |

### 6.3. Nguyên tắc thiết kế cấu hình

- Toàn bộ danh sách Model, Aspect Ratio, Duration khả dụng **phải lấy động** từ `AIModelConfig` (theo Provider đang active), **không hardcode** trong Frontend.
- Mỗi Model cần có metadata mô tả: aspect ratio hỗ trợ, duration hỗ trợ, có hỗ trợ audio gốc không, có hỗ trợ reference/character injection không, chi phí Credit quy đổi.
- Số luồng song song tối đa nên là **cấu hình theo gói Subscription** (VD: Basic tối đa 1 luồng, Pro tối đa 2, Team/Enterprise tối đa 4) chứ không cố định cứng cho mọi user.
- Watermark on/off nên gắn với **feature flag của Subscription**, không phải cấu hình tự do cho mọi khách hàng.

---

## 7. Nghiên Cứu Tham Khảo: Tính Năng "Tác Nhân" (Agent) Trong Google Flow

Người dùng có tham khảo Google Flow (labs.google/fx) và phát hiện tính năng **"Tác nhân"** với popup **"Hướng dẫn cho tác nhân"** (tạo nguyên tắc cho tác nhân). Dưới đây là kết quả tìm hiểu về bản chất tính năng này, dựa trên trang giới thiệu chính thức của Google Flow:

### 7.1. Bản chất tính năng Agent trong Google Flow

Theo mô tả chính thức, Agent trong Google Flow được xây dựng trên nền tảng Gemini, đóng vai trò như một **đối tác sáng tạo thông minh** — nó hiểu ngữ cảnh của cả dự án, giúp người dùng khám phá và lặp lại (iterate) ý tưởng trong khi vẫn duy trì mạch sáng tạo (<cite index="2-1">Your agent in Google Flow is an intelligent, creative partner. It's built with Gemini's intelligence and a deep understanding of your project to help unlock some of your best work while you stay in the flow</cite>), và được mô tả với vai trò chính là hỗ trợ khám phá, lặp ý tưởng cùng người dùng trong giai đoạn lên kế hoạch (Plan).

Trong cấu trúc trang, Agent nằm trong nhóm 3 năng lực cốt lõi của Flow:

1. **Plan** – Gặp gỡ Agent, khám phá & lặp ý tưởng cùng Agent
2. **Create** – Tạo hình ảnh/video độ nét cao từ text/ảnh/video (kết hợp Gemini Omni) hoặc xây dựng "custom tools"
3. **Refine** – Dùng ngôn ngữ tự nhiên để chỉnh sửa lặp đi lặp lại (iterative edits), tinh chỉnh từng asset, và áp dụng thay đổi đó trên toàn dự án

Ngoài ra, theo bảng giá, Agent là một **tính năng theo gói (tiered feature)**: gói miễn phí có "Agent" cơ bản, gói Plus có "Higher access to agent", gói Pro/Ultra có mức truy cập Agent cao hơn nữa — cho thấy Agent được giới hạn mức sử dụng (quota) theo Subscription tier, tương tự cách EIGU đang thiết kế Credit theo gói.

### 7.2. Suy luận về nút "Hướng dẫn cho tác nhân" (System Instructions cho Agent)

Popup **"Hướng dẫn cho tác nhân / tạo nguyên tắc cho tác nhân"** mà bạn thấy, về bản chất kỹ thuật, tương đương với cơ chế **System Prompt / Custom Instructions** cấp dự án (project-level system instructions) cho một AI Agent — cho phép người dùng định nghĩa:

- Phong cách sáng tạo mong muốn xuyên suốt dự án (tone, art direction, nhân vật cố định, thế giới quan)
- Các nguyên tắc/ràng buộc mà Agent phải tuân theo khi gợi ý ý tưởng, viết prompt, hoặc chỉnh sửa
- Ngữ cảnh nền (background context) để Agent không cần người dùng lặp lại thông tin dự án mỗi lần hỏi

Đây thực chất là một lớp "Agent Memory / Project Instructions", giúp Agent duy trì tính nhất quán khi hỗ trợ người dùng qua nhiều lượt tương tác trong cùng một dự án.

### 7.3. Đề xuất áp dụng cho EIGU — Module "AI Creative Agent"

Đề xuất bổ sung một tính năng tương tự vào module Tạo Video AI của EIGU:

| Thành phần | Mô tả đề xuất |
|------------|----------------|
| **Project Agent Instructions** | Mỗi Project của người dùng có 1 vùng cấu hình "Nguyên tắc cho Agent": phong cách, nhân vật cố định, giới hạn nội dung, ngôn ngữ, tone giọng |
| **Agent Chat Panel** | Một khung chat bên cạnh khu vực tạo video, cho phép người dùng trò chuyện với Agent để: gợi ý ý tưởng, chỉnh sửa Prompt, review kịch bản trước khi render |
| **Agent = LLM Orchestrator** | Về kiến trúc, Agent chính là lớp gọi tới LLM (có thể là Gemini, GPT, Claude... tuỳ Provider cấu hình) kèm theo: system instructions của project + lịch sử hội thoại + ngữ cảnh project (kịch bản, ảnh, video hiện có) |
| **Agent Access Tier** | Giới hạn số lượt tương tác Agent theo Subscription (giống cách Google Flow giới hạn "Higher access to agent" theo gói) — tiêu hao Credit riêng, tách khỏi Credit render video |
| **Agent Actions** | Agent nên có khả năng gọi tới các chức năng khác trong hệ thống (ví dụ: tự động điền Prompt vào form Tạo từ Ý tưởng, tự đề xuất Aspect Ratio phù hợp với nền tảng đích mà người dùng nói ra) — tương tự khái niệm "tool calling" |

> **Lưu ý kiến trúc:** Nếu triển khai, Agent nên đi qua cùng **Pricing Engine** và **Provider Router** đã thiết kế ở tài liệu tổng thể — không tạo một luồng gọi AI riêng biệt không qua Router, để đảm bảo tính nhất quán về billing, credit, và khả năng đổi Provider trong tương lai.

---

## 8. Tổng Hợp Yêu Cầu Kỹ Thuật Bổ Sung (So Với Bảng Hiện Tại)

| Hạng mục | Trạng thái hiện tại (theo UI) | Đề xuất bổ sung |
|----------|-------------------------------|-------------------|
| Copy Video | Đã có UI, cần rõ luồng phân tích + STT + Scene Detection | Xây Video Analyzer Service |
| Tạo từ Ý tưởng | Chưa thấy UI trong ảnh, cần thiết kế thêm tab/form | Idea-to-Prompt Engine |
| Tạo từ hình ảnh | Chưa có trong UI hiện tại | Thêm tab "Tạo từ hình ảnh", Image Upload multi-select |
| Tạo theo Video mẫu | Chưa có trong UI hiện tại | Thêm tab mới, 2 chế độ con (Character Replacement / Full Remake) |
| Cấu hình AI | Đã có Model, Scenes, Aspect Ratio; **thiếu**: Duration, Parallel Threads, Watermark toggle | Bổ sung 3 cấu hình này vào panel bên phải |
| Cấu hình tạo ảnh | Chưa có trong UI | Thêm block "Cấu hình tạo ảnh" (model, số lượng, tỉ lệ) |
| Agent / Tác nhân | Chưa có | Thiết kế mới: Project Agent Instructions + Agent Chat Panel |

---

## 9. Câu Hỏi Cần Làm Rõ Trước Khi Thiết Kế Chi Tiết Hơn

1. Chức năng "Tạo từ Ý tưởng", "Tạo từ hình ảnh", "Tạo theo Video mẫu" sẽ là các **tab riêng** trong cùng 1 màn hình (giống Copy Video / Tạo từ Ý tưởng hiện tại), hay là **màn hình riêng biệt**?
2. Với "Ghép nhân vật vào video mẫu" — hệ thống có cần cho phép nhiều ảnh nhân vật (nhiều góc) để tăng độ chính xác không?
3. Agent có cần lưu lịch sử hội thoại lâu dài theo từng Project (Agent Memory) hay chỉ theo phiên làm việc (session)?
4. Số luồng song song tối đa (4) có áp dụng chung cho mọi gói Subscription, hay giới hạn theo từng gói như đề xuất ở mục 6.3?
5. Watermark: có cho phép user trả thêm Credit để tắt watermark theo lượt (pay-per-use), hay chỉ gắn cứng theo gói Subscription?
