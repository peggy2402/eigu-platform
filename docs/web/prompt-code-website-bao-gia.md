## PROMPT

Bạn là một kỹ sư full-stack. Hãy phân tích kỹ yêu cầu dưới đây và xây dựng lại website **Trang khách hàng** (public) và desktop app**Trang quản trị** (admin). Trước khi code, hãy tóm tắt lại kiến trúc dữ liệu và kế hoạch triển khai, rà soát toàn bộ thông tin trong folders apps/web, tách components thật hợp lý, refactor lại toàn bộ web, sau đó mới code. Hiện tại trên trang web. Tôi muốn bỏ tab "Công cụ", "Tự động hóa", "Tài khoản", "Tiện ích" để thay bằng các tab như sau: "Hồ sơ", "Lịch sử giao dịch", "Tiếp thị liên kết", "Bảng giá","Nhật ký hoạt động", "Hướng dẫn sử dụng", "Trợ giúp"
### Phía User 
Cần hiển thị ra số dư khi nhấn vào "Xin chào, {{username}}" và dropdown xuống hiện tại đang có là "Cài đặt", "Góp ý / Báo lỗi" và nút "Đăng xuất"
### Phía Admin (trong trang website hiện tại)
Xóa bỏ hoàn toàn "Trung tâm vận hành" - Đối với giao diện trên website chỉ tập chung vào Phía User. 

### Giao diện phía người dùng 
Thay đổi menu khi đăng nhập 
- Hồ sơ
- Tiếp thị liên kết
- Bảng giá
- Hướng dẫn sử dụng 
Một trang là trang landing page về Eigu
Header có "Trang chủ", "Giới thiệu", "Bảng giá" "Tin tức", "FAQ", "Liên hệ" icon ngôn ngữ "en/vi" , "Đăng ký" và "Đăng nhập" trong trường hợp khi chưa Login, còn khi đăng nhập rồi sẽ hiển thị "Xin chào, {{Username}}", "Số dư", "Nạp tiền", "Cài đặt", "Góp ý / Báo lỗi" và nút "Đăng xuất"
Trong mục "Cài đặt" sẽ có "Giao diện ứng dụng" "Ngôn ngữ", "Thay đổi thông tin", "Đổi mật khẩu","Xóa tài khoản"
### 1\. Bối cảnh sản phẩm

Đây là bảng giá cho một nền tảng gồm nhiều **module công cụ AI video**, mỗi module bán riêng theo các gói (tier) khác nhau. Người dùng có thể mua từng module độc lập, mỗi module có 5 gói: **Trial, Basic, Pro, Team, Enterprise**.

Danh sách module (có thể mở rộng sau này qua trang quản trị):

1. **Tự động cắt video** — cắt highlight, dựng clip tự động bằng AI
2. **Tạo video AI** — tạo video từ ý tưởng / ảnh / video mẫu (text-to-video)
3. **AI Video Studio** — dựng phim, lồng tiếng, biên tập chuyên sâu
4. **Tạo video reup** — đổi bố cục, âm thanh, né bản quyền tự động
5. **Tìm ngách hot** — quét xu hướng, gợi ý ngách, phân tích đối thủ
6. **Tải video hàng loạt** — tải video hàng loạt đa nền tảng, tốc độ cao

### 2\. Cấu trúc dữ liệu (data model)

Mỗi **module** gồm:

* `id`, `name`, `tagline` (mô tả ngắn hiển thị dưới tab module)
* `tiers`: object gồm 5 gói `trial`, `basic`, `pro`, `team`, `enterprise`

Mỗi **tier** gồm các trường:

* `label` — tên gói hiển thị
* `tagLine` - Tagline cho gói
* `discount` - Số % giảm giá
* `price` — giá bán hiện tại (đ/tháng)
* `originalPrice` — giá gốc trước giảm (0 nếu không áp dụng giảm giá); giá gốc tính = `price / (1 - discount/100)`
* `badge` — nhãn hiển thị góc thẻ: rỗng / "PHỔ BIẾN NHẤT" / "GIẢM 40%" / "GIẢM 50%" / "MỚI" (badge càng ngày càng nên là danh sách có thể tuỳ biến, không hard-code)
* `content` - nội dung chi tiết hiển thị trong mỗi tiers chứa các trường `machines`, `threads`, `resolution`, `features`
* `machines` — số máy/thiết bị được dùng đồng thời
* `threads` — số luồng xử lý tối đa (0 = không giới hạn)
* `resolution` — độ phân giải xuất video (vd "720p", "1080p/2K/4K", hoặc "-" nếu module không liên quan đến video output)
* `features` — mảng string, danh sách tính năng của gói
* `discount` - số % giảm giá (vd 40)
**Ví dụ dữ liệu mẫu cho module "Tạo video AI"** (dùng đúng số liệu thật của dự án, các module khác hiện đang là placeholder cần rà soát lại):

|Gói|Giá|Máy|Luồng|Độ phân giải|Tính năng|Ghi chú|
|-|-|-|-|-|-|-|
|Basic|150.000đ|1|4|720p|Tạo video không giới hạn, Copy video, Tạo từ ý tưởng||
|Pro|450.000đ|1|8|1080p/2K/4K|+ Tạo từ ảnh, Tạo từ video mẫu|Badge "PHỔ BIẾN NHẤT"|
|Team|1.800.000đ|5|20|1080p/2K/4K|Full tính năng, hỗ trợ nhanh có nhân viên hỗ trợ|Giá gốc 3.000.000đ, giảm \~40%|
|Enterprise|5.400.000đ|30|không giới hạn|1080p/2K/4K|Full tính năng, hỗ trợ ưu tiên 24/7, không giới hạn video|Giá gốc 9.000.000đ, giảm \~40%|

5 module còn lại áp dụng cùng cấu trúc 4 gói, số liệu cụ thể sẽ được nhập/chỉnh qua trang quản trị — khi code, hãy để sẵn dữ liệu mẫu hợp lý cho từng module (giá tăng dần theo mức Basic → Enterprise, Team/Enterprise luôn có giảm giá \~40%) để test giao diện, nhưng đừng hard-code cứng nhắc — toàn bộ phải sửa được từ admin.

### 3\. Yêu cầu Trang khách hàng (Public Pricing Page)

* Header có tên thương hiệu + thanh chuyển đổi giữa "Trang khách hàng" / "Quản trị giá" (ở bản thật, phần quản trị phải có xác thực đăng nhập riêng, không public).
* Danh sách tab các module (có icon riêng cho từng module), chọn tab nào thì hiển thị bảng giá của module đó + mô tả ngắn (`tagline`).
* Grid 4 thẻ giá (Basic/Pro/Team/Enterprise) cho module đang chọn, mỗi thẻ gồm:

  * Badge góc thẻ nếu có (nổi bật khác màu tuỳ loại: phổ biến nhất = màu vàng/nhấn, giảm giá = màu đỏ)
  * Tên gói
  * Giá gốc gạch ngang (nếu có) + giá bán hiện tại lớn, đơn vị "đ"
  * Dòng "/ tháng" + số máy sử dụng
  * Dòng "Giá đã bao gồm VAT"
  * Nút CTA "Chọn gói này" (gói Pro/phổ biến nhất nổi bật hơn các gói khác)
  * Thanh trực quan hoá số luồng xử lý (progress bar) so với mức luồng cao nhất của module đó
  * Bảng thông số ngắn: số máy, độ phân giải
  * Danh sách tính năng dạng bullet có icon check
* Responsive: 4 cột (desktop) → 2 cột (tablet) → 1 cột (mobile).
* Phong cách hình ảnh tham khảo: nền tối (navy/đen), điểm nhấn màu vàng, thẻ bo góc lớn, badge nổi trên viền thẻ trên — nhưng khuyến khích AI đưa ra một hướng thiết kế có cá tính riêng (typography, màu sắc, chi tiết) thay vì rập khuôn, miễn giữ đúng tinh thần "gọn, rõ, dễ so sánh gói".
* Riêng gói Trial thì sẽ là gói dùng thử 7 ngày, hiển thị "7 ngày" thay vì "/ tháng".
### 4\. Yêu cầu Trang Quản trị (Admin — Pricing Management) - Desktop App apps/desktop

* Chưa cần. Nhưng nếu triển khai bắt buộc phải bổ sung modules "Quản lý bảng giá"

### 5\. Yêu cầu kỹ thuật
* Dự án này đang thuộc Mono Repo, với cấu trúc như sau
```
eigu-platform/
├─ apps/
│  ├─ web/           ←frontend (Next.js) — đây là chỗ cần code
│  ├─ api/           ←backend API (NestJS) — backend của EIGU
│  └─ desktop/        ←desktop application (vừa làm Trung tâm vận hành, vừa là nền tảng phân phối cho khách hàng sử dụng)
├─ packages/
├─ nx.json
└─ tsconfig.base.json
```

* Dữ liệu giá phải lưu trong database (không hard-code trong code), có API để đọc (public) và ghi (chỉ admin đã đăng nhập).
* Nút "Chọn gói này" cần có hook sẵn để nối vào cổng thanh toán sau này (tối thiểu: điều hướng đến trang checkout kèm thông tin module + gói đã chọn).
* Code rõ ràng, tách component hợp lý, có comment ở những chỗ logic quan trọng (tính % giảm giá, tính bar luồng xử lý...).
* Đảm bảo responsive và có trạng thái loading/empty rõ ràng.
* Đối với "Bảng giá" sẽ lấy ra từ thông tin API GET /GetInfoPrice?m={{tên_modules}}
* Ví dụ:
  Response
  ```
  { 
    "success": true, 
    "data": [
      "basic": {
        "label": "Basic",
        "tagline": "Dành cho người mới bắt đầu",
        "price": 150000,
        "oldPrice": 250000,
        "content": [
          "badge": "",
          "total_user_limit": 1,
          "total_core_limit": 20,
          "resolution": "720p",
          "features": [
            "Tạo Video không giới hạn",
            "Copy Video",
            "Tạo Video từ Ý tưởng",
          ]
        ]
      },
      "pro": {
        "label": "Pro",
        "tagline": "Dành cho người chuyên nghiệp",
        "price": 450000,
        "oldPrice": 2000000,
        "content": [
          "badge": "PHỔ BIẾN NHẤT",
          "total_machines_limit": 5,
          "total_threads_limit": 50,
          "resolution": "1080p/2K/4K",
          "features": [
            "Full tính năng",
            "Hỗ trợ ưu tiên 24/7",
            "GIẢM ~ 40%",
          ]
        ]
      },
      "team": {
        "label": "Team",
        "tagline": "Dành cho đội nhóm",
        "price": 1500000,
        "oldPrice": 2000000,
        "content": [
          "badge": "TIẾT KIỆM",
          "total_machines_limit": 10,
          "total_threads_limit": 100,
          "resolution": "1080p/2K/4K",
          "features": [
            "Tạo Video không giới hạn",
            "Full tính năng",
            "Hỗ trợ ưu tiên 24/7",
            "GIẢM ~ 40%",
          ]
        ]
      },
      "enterprise": {
        "label": "Enterprise",
        "tagline": "Dành cho doanh nghiệp",
        "price": 6000000,
        "oldPrice": 10000000,
        "discount": 40,
        "content": [
          "badge": "GIẢM GIÁ",
          "total_machines_limit": 5,
          "total_threads_limit": 50,
          "resolution": "1080p/2K/4K",
          "features": [
            "Tạo Video không giới hạn",
            "Full tính năng",
            "Hỗ trợ ưu tiên 24/7",
            "GIẢM ~ 40%",
          ]
        ]
      }
    ] 
  }
  ```
* Mấy cái này sẽ update từ giao diện Admin
### 6\. Đầu ra mong muốn

Hãy trình bày:

1. Kiến trúc thư mục / component đề xuất
2. Schema database đề xuất
3. Code triển khai đầy đủ (frontend (NextJs) + backend/API (Supabase + PostgreSQL) + phần lưu trữ)
4. Hướng dẫn chạy thử ở local
5. Rà soát lại toàn bộ web + api(framework Nestjs trong folder apps/api) và đưa ra Kết quả rà soát tôi đang có file .env

