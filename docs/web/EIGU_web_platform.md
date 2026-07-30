# **PROMPT — EIGU PLATFORM: REFACTOR & XÂY DỰNG LẠI TRANG KHÁCH HÀNG + KIẾN TRÚC PRICING** 

## **1. VAI TRÒ** 

Bạn đang đóng vai trò **Principal Full-Stack Engineer + Software Architect + Database Architect + UI/ UX Engineer** . 

Hãy làm việc trực tiếp trên source code hiện tại của dự án **EIGU Platform** . 

Mục tiêu là **rà soát, tái cấu trúc và nâng cấp toàn bộ phần website khách hàng (Public/User-facing Web)** , đồng thời chuẩn hóa kiến trúc dữ liệu và API để hệ thống bảng giá có thể được quản lý động từ backend/database. 

**QUAN TRỌNG:** Không được bắt đầu code ngay. 

Trước khi thay đổi code, bắt buộc phải: 


1. Rà soát toàn bộ source code hiện tại. 

2. Rà soát toàn bộ folder: 

3. <mark>`apps/web`</mark> 

4. <mark>`apps/api`</mark> 

5. <mark>`apps/api/prisma`</mark> 

6. <mark>`apps/api/src`</mark> 

7. <mark>`apps/desktop`</mark> `Bổ sung modules Quản lý bảng giá trong Desktop App chỉ dành cho Admin`

8. <mark>`packages`</mark> 

9. và các package liên quan trong monorepo nếu chúng được <mark>`apps/web`</mark> hoặc <mark>`apps/api`</mark> sử dụng. 

10. Xác định kiến trúc hiện tại đang có. 

7. Xác định các component, page, service, API, model, type, hook, state management... đang tồn tại. 

8. Xác định những phần có thể tái sử dụng. 

9. Xác định những phần cần refactor. 

10. Xác định những phần cần xóa hoàn toàn. 

11. Kiểm tra file <mark>`.env`</mark> hiện tại và cách các biến môi trường đang được sử dụng. 

12. Kiểm tra cách frontend hiện tại gọi API. 

13. Kiểm tra cách <mark>`apps/api`</mark> hiện tại tổ chức module/service/controller. 

14. Kiểm tra database hiện tại và các schema/table liên quan nếu có. 

15. Kiểm tra các dependency đang sử dụng. 

- Kiểm tra các vấn đề có thể gây conflict với kiến trúc mới. 

16. 

Sau đó mới đưa ra **kế hoạch triển khai chi tiết** . 

1 

# **2. MỤC TIÊU CHÍNH** 

Tôi muốn xây dựng lại hệ thống theo hướng: 

```
EIGU Platform
│
├── Public Website
│   ├── Trang chủ
│   ├── Giới thiệu
│   ├── Bảng giá
│   ├── Tin tức
│   ├── FAQ
│   └── Liên hệ
│
├── User Area
│   ├── Hồ sơ
│   ├── Lịch sử giao dịch
│   ├── Tiếp thị liên kết
│   ├── Bảng giá
│   ├── Nhật ký hoạt động
│   ├── Hướng dẫn sử dụng
│   └── Trợ giúp
│
└── Admin
    └── Không triển khai trên Web
       (Admin sẽ thuộc Desktop App nếu cần)
```

Website hiện tại đang có các tab: 

- Công cụ • Tự động hóa • Tài khoản • Tiện ích 

Hãy **loại bỏ cách tổ chức này** và thay thế bằng hệ thống menu mới. 

# **3. MENU USER MỚI** 

Khi người dùng đăng nhập, menu chính cần được tổ chức lại thành: 

- Hồ sơ 

- Lịch sử giao dịch 

- Tiếp thị liên kết 

- Bảng giá 

- Nhật ký hoạt động 

- Hướng dẫn sử dụng 

- Trợ giúp 

2 

Trong đó giao diện phải được thiết kế sao cho dễ mở rộng thêm module trong tương lai. 

# **4. USER DROPDOWN** 

Khi user đăng nhập, Header phải hiển thị: 

```
Xin chào, {{username}}
```

Khi click vào username, mở dropdown. 

Dropdown cần hiển thị: 

```
Số dư
Nạp tiền
Cài đặt
Góp ý / Báo lỗi
Đăng xuất
```

### **Số dư** 

Số dư tài khoản phải được hiển thị trực tiếp trong dropdown. 

Ví dụ: 

```
Xin chào, chien
Số dư
1.250.000đ
Nạp tiền
Cài đặt
Góp ý / Báo lỗi
Đăng xuất
```

Không hard-code số dư. 

Số dư phải lấy từ thông tin user/account hiện tại thông qua API/backend. 

# **5. TRẠNG THÁI CHƯA ĐĂNG NHẬP** 

Khi user chưa đăng nhập, Header hiển thị: 

3 

```
Trang chủ
Giới thiệu
Bảng giá
Tin tức
FAQ
Liên hệ
[EN/VI]
Đăng ký
Đăng nhập
```

Trong đó: 

- 

- 

- 

- <mark>`EN/VI`</mark> là icon/selector chuyển ngôn ngữ. 

- <mark>`Đăng ký`</mark> điều hướng đến flow đăng ký. 

- <mark>`Đăng nhập`</mark> điều hướng đến flow đăng nhập. 

# **6. TRẠNG THÁI ĐÃ ĐĂNG NHẬP** 

Khi user đã đăng nhập: 

Header vẫn giữ: 

```
Trang chủ
Giới thiệu
Bảng giá
Tin tức
FAQ
Liên hệ
```

Nhưng khu vực auth bên phải thay bằng: 

```
Xin chào, {{username}}
```

Khi click vào sẽ hiển thị: 

```
Số dư
Nạp tiền
Cài đặt
Góp ý / Báo lỗi
Đăng xuất
```

4 

# **7. CÀI ĐẶT TÀI KHOẢN** 

Trong <mark>`Cài đặt` ,</mark> cần có đầy đủ: 

```
Giao diện ứng dụng
Ngôn ngữ
Thay đổi thông tin
Đổi mật khẩu
Xóa tài khoản
```

Không được hard-code các thông tin tài khoản. 

Các thao tác cần được thiết kế để sau này kết nối trực tiếp với API. 

# **8. XÓA TRUNG TÂM VẬN HÀNH KHỎI WEBSITE** 

Hiện tại website có phần: 

```
Trung tâm vận hành
```

Hãy **xóa hoàn toàn phần này khỏi website** . 

Website hiện tại chỉ tập trung vào: 

#### **Trang khách hàng / User-facing experience** 

Không xây dựng Admin Dashboard trên website. 

# **9. ADMIN** 

Admin hiện tại **không cần triển khai trong website** . 

Admin sẽ nằm trong: 

```
apps/desktop
```

Desktop App hiện tại vừa là: 

- Trung tâm vận hành 

- Nền tảng phân phối cho khách hàng sử dụng 

5 

Nếu trong quá trình triển khai phát hiện cần có tính năng quản lý bảng giá trong Desktop App, hãy bổ sung module: 

```
Quản lý bảng giá
```

Tuy nhiên, đây **không phải phần bắt buộc phải triển khai ngay** , trừ khi kiến trúc hiện tại yêu cầu bắt buộc. 

# **10. LANDING PAGE EIGU** 

Website cần có một trang Landing Page riêng giới thiệu về EIGU. 

Landing Page phải có Header: 

```
Trang chủ
Giới thiệu
Bảng giá
Tin tức
FAQ
Liên hệ
EN / VI
Đăng ký
Đăng nhập
```

Khi đăng nhập, phần auth thay đổi thành: 

```
Xin chào, {{username}}
```

Landing Page cần được thiết kế chuyên nghiệp, hiện đại và phù hợp với một nền tảng AI Video SaaS. 

Không cần sao chép nguyên mẫu thiết kế cũ nếu thiết kế hiện tại chưa tốt. 

Ưu tiên: 

- rõ ràng • hiện đại • có tính thương hiệu • dễ mở rộng • responsive • UX tốt • typography tốt 

- spacing nhất quán 

- hierarchy rõ ràng. 

6 

# **11. BỐI CẢNH SẢN PHẨM — HỆ THỐNG PRICING** 

EIGU là một nền tảng gồm nhiều **module công cụ AI Video** . 

Mỗi module được bán độc lập. 

Mỗi module có các gói: 

```
Trial
Basic
Pro
Team
Enterprise
```

Danh sách module hiện tại: 

### **1. Tự động cắt video** 

Cắt highlight, dựng clip tự động bằng AI. 

### **2. Tạo video AI** 

Tạo video từ: 

- ý tưởng • ảnh 

- video mẫu 

- text-to-video 

### **3. AI Video Studio** 

Dựng phim, lồng tiếng và biên tập chuyên sâu. 

### **4. Tạo video reup** 

Tự động: 

- đổi bố cục 

- thay đổi âm thanh 

- né bản quyền 

### **5. Tìm ngách hot** 

Tự động: 

- quét xu hướng 

- gợi ý ngách 

- phân tích đối thủ 

7 

### **6. Tải video hàng loạt** 

Tải video hàng loạt từ nhiều nền tảng với tốc độ cao. 

Kiến trúc phải cho phép sau này Admin thêm module mới mà **không cần sửa cứng frontend** . 

# **12. DATA MODEL — MODULE** 

Mỗi module cần có cấu trúc dữ liệu tương tự: 

```
{
id,
name,
tagline,
tiers
}
```

Trong đó: 

```
id
name
tagline
tiers
```

### **<mark>`name`</mark>** 

Tên module. 

Ví dụ: 

```
Tạo video AI
```

### **<mark>`tagline`</mark>** 

Mô tả ngắn hiển thị dưới tên/tab module. 

Ví dụ: 

```
Tạo video chuyên nghiệp từ ý tưởng bằng AI
```

### **<mark>`tiers`</mark>** 

Object gồm các gói: 

8 

```
trial
basic
pro
team
enterprise
```

# **13. DATA MODEL — TIER** 

Mỗi tier cần có: 

```
label
tagline
discount
price
originalPrice
badge
content
```

Trong đó: 

### **<mark>`label`</mark>** 

Tên gói: 

```
Trial
Basic
Pro
Team
Enterprise
```

### **<mark>`tagline`</mark>** 

Mô tả ngắn của gói. 

Ví dụ: 

```
Dành cho người mới bắt đầu
```

### **<mark>`discount`</mark>** 

Phần trăm giảm giá. 

Ví dụ: 

9 

```
40
```

Tương đương: 

```
40%
```

### **<mark>`price`</mark>** 

Giá bán hiện tại. 

Ví dụ: 

```
150000
```

Hiển thị: 

```
150.000đ
```

### **<mark>`originalPrice`</mark>** 

Giá gốc trước giảm. 

Nếu không áp dụng giảm giá: 

```
0
```

Nếu có giảm giá, giá gốc được xác định theo: 

```
originalPrice = price / (1 - discount / 100)
```

Ví dụ: 

```
price = 1.800.000
discount = 40
```

thì: 

```
originalPrice = 1.800.000 / (1 - 40/100)
              = 3.000.000
```

Không được tính sai chiều. 

10 

### **<mark>`badge`</mark>** 

Nhãn hiển thị trên góc card. 

Ví dụ: 

```
""
"PHỔ BIẾN NHẤT"
"GIẢM 40%"
"GIẢM 50%"
"MỚI"
```

Tuy nhiên: 

Badge phải được thiết kế theo hướng dynamic/configurable, không hard-code danh sách badge trong UI. 

Sau này Admin có thể tạo badge mới. 

Ví dụ: 

```
SIÊU TIẾT KIỆM
HOT
BEST VALUE
NEW
LIMITED
```

Frontend phải hiển thị được mà không cần sửa code. 

# **14. CONTENT CỦA TIER** 

Mỗi tier có: 

```
machines
threads
resolution
features
```

### **<mark>`machines`</mark>** 

Số máy / thiết bị được sử dụng đồng thời. 

### **<mark>`threads`</mark>** 

Số luồng xử lý tối đa. 

11 

Nếu: 

```
0
```

thì hiểu là: 

```
Không giới hạn
```

### **<mark>`resolution`</mark>** 

Độ phân giải output. 

Ví dụ: 

```
720p
1080p/2K/4K
-
```

Nếu module không liên quan đến video output thì dùng: 

```
-
```

### **<mark>`features`</mark>** 

Danh sách tính năng: 

```
features:string[]
```

Ví dụ: 

```
[
  "Tạo video không giới hạn",
  "Copy video",
  "Tạo video từ ý tưởng"
]
```

# **15. DỮ LIỆU THẬT — MODULE TẠO VIDEO AI** 

Đối với module: 

12 

```
Tạo video AI
```

hãy sử dụng đúng số liệu sau: 

|Gói|Giá|Máy|Luồng|Độ<br>phân<br>giải|Tính năng|Ghi chú|
|---|---|---|---|---|---|---|
|Basic|150.000đ|1|4|720p|Tạo video không<br>giới hạn, Copy<br>video, Tạo từ ý<br>tưởng||
|Pro|450.000đ|1|8|1080p/<br>2K/4K|+ Tạo từ ảnh, + Tạo<br>từ video mẫu|PHỔ BIẾN NHẤT|
|Team|1.800.000đ|5|20|1080p/<br>2K/4K|Full tính năng, hỗ<br>trợ nhanh có nhân<br>viên hỗ trợ|Giá gốc<br>3.000.000đ,<br>giảm ~40%|
|Enterprise|5.400.000đ|30|Không<br>giới hạn|1080p/<br>2K/4K|Full tính năng, hỗ<br>trợ ưu tiên 24/7,<br>không giới hạn<br>video|Giá gốc<br>9.000.000đ,<br>giảm ~40%|



# **16. 5 MODULE CÒN LẠI** 

5 module còn lại hiện chưa có dữ liệu pricing hoàn chỉnh. 

Khi triển khai UI, hãy tạo dữ liệu mẫu hợp lý để test: 

- giao diện • responsive • badge • progress bar • pricing • feature list • discount • empty state • loading state 

Giá phải tăng dần theo: 

```
Basic → Pro → Team → Enterprise
```

Trong đó: 

13 

```
Team
Enterprise
```

nên có discount khoảng: 

```
40%
```

Tuy nhiên: 

Đây chỉ là dữ liệu mẫu để test UI. 

Dữ liệu thực tế phải lấy từ database/API và có thể thay đổi từ Admin. 

#### **Không được hard-code cứng dữ liệu pricing trong frontend.** 

# **17. PUBLIC PRICING PAGE** 

Xây dựng lại trang: 

```
Bảng giá
```

Trang này phải lấy dữ liệu từ API. 

API hiện tại cần sử dụng: 

```
GET /GetInfoPrice?m={{tên_modules}}
```

Ví dụ: 

```
GET /GetInfoPrice?m=ai-video
```

Frontend phải xây dựng layer API/service riêng thay vì gọi API trực tiếp rải rác trong component. 

# **18. PRICING PAGE — MODULE TABS** 

Trang pricing cần hiển thị danh sách module. 

Mỗi module có: 

- icon riêng 

14 

• tên module • tagline 

Ví dụ: 

```
[Icon] Tự động cắt video
[Icon] Tạo video AI
[Icon] AI Video Studio
[Icon] Tạo video reup
[Icon] Tìm ngách hot
[Icon] Tải video hàng loạt
```

Khi click vào một module: 

```
Module selected
        ↓
Fetch pricing API
        ↓
Render pricing cards
```

Không reload toàn bộ trang nếu không cần thiết. 

# **19. PRICING CARD** 

Mỗi module hiển thị 4 card: 

```
Basic
Pro
Team
Enterprise
```

Gói Trial là gói dùng thử 7 ngày và cần được xử lý riêng theo yêu cầu bên dưới. 

Mỗi card phải bao gồm: 

### **Badge** 

Hiển thị ở góc card nếu tồn tại. 

Ví dụ: 

15 

```
PHỔ BIẾN NHẤT
GIẢM 40%
MỚI
```

Badge phải dynamic. 

Không hard-code màu theo một badge duy nhất. 

Có thể map theo badge type/config. 

### **Tên gói** 

Ví dụ: 

```
Pro
```

### **Tagline** 

Ví dụ: 

```
Dành cho người chuyên nghiệp
```

### **Giá gốc** 

Nếu có: 

```
3.000.000đ
```

hiển thị: 

```
gạch ngang
```

### **Giá hiện tại** 

Ví dụ: 

```
1.800.000đ
```

16 

hiển thị lớn và nổi bật. 

### **Đơn vị tiền** 

Hiển thị: 

```
đ
```

Sử dụng locale: 

```
vi-VN
```

### **Chu kỳ** 

Đối với gói thông thường: 

```
/tháng
```

Ví dụ: 

```
1.800.000đ / tháng
```

### **Trial** 

Riêng gói Trial: 

```
7 ngày
```

Không hiển thị: 

```
/tháng
```

### **VAT** 

Hiển thị: 

17 

```
Giá đã bao gồm VAT
```

### **CTA** 

Nút: 

```
Chọn gói này
```

Gói Pro hoặc gói được đánh dấu nổi bật phải có CTA nổi bật hơn. 

# **20. FLOW CHỌN GÓI** 

Khi click: 

```
Chọn gói này
```

phải có hook sẵn cho hệ thống thanh toán tương lai. 

Tối thiểu phải điều hướng đến: 

```
/checkout
```

và truyền: 

```
module
tier
price
```

Ví dụ: 

```
/checkout?module=ai-video&tier=pro
```

Không cần triển khai payment gateway ngay. 

Nhưng architecture phải đủ sạch để sau này kết nối: 

```
Pricing
   ↓
Checkout
```

18 

```
   ↓
Payment Gateway
   ↓
Payment Success
   ↓
Activate Subscription
```

# **21. THREAD PROGRESS BAR** 

Mỗi pricing card cần có progress bar thể hiện số luồng xử lý. 

Ví dụ module có: 

```
Basic = 4
Pro = 8
Team = 20
Enterprise = Unlimited
```

Thì bar phải được tính tương đối dựa trên mức thread cao nhất của module. 

Ví dụ: 

```
Basic      ███░░░░░░░
Pro        █████░░░░░
Team       ██████████
Enterprise ∞
```

Logic tính phải nằm ở utility/helper riêng. 

Ví dụ: 

```
percentage = currentThreads / maxThreads * 100
```

Nếu: 

```
threads = 0
```

thì hiểu: 

```
Unlimited
```

Không để logic này rải rác trong JSX. 

19 

Phải có comment giải thích logic quan trọng. 

# **22. THÔNG SỐ NGẮN** 

Pricing card cần hiển thị: 

```
Số máy
Độ phân giải
```

Ví dụ: 

```
1 máy
720p
```

Nếu: 

```
machines = 0
```

thì cần thống nhất cách hiển thị: 

```
Không giới hạn
```

hoặc theo convention hiện tại của API. 

# **23. FEATURE LIST** 

Danh sách tính năng hiển thị dạng: 

✓ `Tạo Video không giới hạn` ✓ `Copy Video` ✓ `Tạo Video từ Ý tưởng` 

Mỗi feature có icon check. 

Phải hỗ trợ số lượng feature bất kỳ. 

Không giới hạn 3 hoặc 4 feature. 

20 

# **24. RESPONSIVE** 

Pricing grid phải responsive: 

### **Desktop** 

```
4 columns
```

### **Tablet** 

```
2 columns
```

### **Mobile** 

```
1 column
```

Header, navigation, module tabs và pricing cards đều phải responsive. 

Không được chỉ responsive phần card. 

# **25. DESIGN DIRECTION** 

Phong cách tham khảo: 

- nền tối 

- navy/black • điểm nhấn vàng 

- pricing card bo góc lớn 

- badge nổi trên viền card 

- typography rõ ràng • dễ so sánh 

Tuy nhiên: 

Không cần sao chép thiết kế mẫu một cách máy móc. 

Hãy tự đề xuất một hướng UI có cá tính riêng cho EIGU. 

#### Ưu tiên: 

```
Gọn
Rõ
Dễ so sánh
```

21 

```
Premium
Modern AI SaaS
```

Có thể sử dụng: 

• typography mạnh • gradient rất nhẹ • subtle glow • border effect • glass effect nếu phù hợp • hover state • animation nhẹ • transition mượt 

Nhưng tránh: 

• quá nhiều animation • UI rối • card quá nhiều màu • hiệu ứng làm giảm khả năng so sánh giá. 

# **26. API RESPONSE HIỆN TẠI** 

API pricing hiện tại: 

```
GET /GetInfoPrice?m={{tên_modules}}
```

Response: 

```
{
"success":true,
"data":[
{
"basic":{
"label":"Basic",
"tagline":"Dành cho người mới bắt đầu",
"price":150000,
"oldPrice":250000,
"content":{
""
"badge":,
"total_user_limit":1,
"total_core_limit":20,
"resolution":"720p",
"features":[
"Tạo Video không giới hạn",
"Copy Video",
"Tạo Video từ Ý tưởng"
```

22 

```
]
}
},
"pro":{
"label":"Pro",
"tagline":"Dành cho người chuyên nghiệp",
"price":450000,
"oldPrice":2000000,
"content":{
"badge":"PHỔ BIẾN NHẤT",
"total_machines_limit":5,
"total_threads_limit":50,
"resolution":"1080p/2K/4K",
"features":[
"Full tính năng",
"Hỗ trợ ưu tiên 24/7",
"GIẢM ~ 40%"
]
}
},
"team":{
"label":"Team",
"tagline":"Dành cho đội nhóm",
"price":1500000,
"oldPrice":2000000,
"content":{
"badge":"TIẾT KIỆM",
"total_machines_limit":10,
"total_threads_limit":100,
"resolution":"1080p/2K/4K",
"features":[
"Tạo Video không giới hạn",
"Full tính năng",
"Hỗ trợ ưu tiên 24/7",
"GIẢM ~ 40%"
]
}
},
"enterprise":{
"label":"Enterprise",
"tagline":"Dành cho doanh nghiệp",
"price":6000000,
"oldPrice":10000000,
"discount":40,
"content":{
"badge":"GIẢM GIÁ",
"total_machines_limit":5,
"total_threads_limit":50,
"resolution":"1080p/2K/4K",
"features":[
"Tạo Video không giới hạn",
```

23 

```
"Full tính năng",
"Hỗ trợ ưu tiên 24/7",
"GIẢM ~ 40%"
]
}
}
}
]
}
```

Lưu ý: Response trên là cấu trúc API hiện tại cần được rà soát thực tế trong source. Không được mặc định rằng structure thực tế hoàn toàn giống ví dụ nếu source code hiện tại đang khác. 

Nếu API hiện tại đang sử dụng tên field: 

```
oldPrice
total_user_limit
total_core_limit
total_machines_limit
total_threads_limit
```

thì phải xây dựng một **mapping/normalization layer** để frontend có model thống nhất. 

Không để component UI phụ thuộc trực tiếp vào API response legacy. 

# **27. DATA NORMALIZATION** 

Đề xuất frontend có model nội bộ thống nhất, ví dụ: 

```
typePricingTier={
id:string;
label:string;
tagline:string;
price:number;
originalPrice:number;
discount:number;
badge?:string;
machines:number;
threads:number;
resolution:string;
features:string[];
};
```

API adapter có nhiệm vụ convert: 

24 

```
API Response
     ↓
Normalizer / Mapper
     ↓
Frontend Domain Model
     ↓
UI Components
```

Điều này rất quan trọng vì API hiện tại đang có naming không hoàn toàn thống nhất. 

Ví dụ: 

```
oldPrice
→ originalPrice
total_user_limit
→ machines
total_threads_limit
→ threads
```

Không được đưa mapping này trực tiếp vào component. 

# **28. DATABASE** 

Dữ liệu pricing phải được lưu trong database. 

#### **Không được hard-code pricing trong frontend.** 

Database dự kiến sử dụng: 

```
Supabase
+
PostgreSQL
```

Pricing phải có API: 

```
GET → public
POST/PATCH/DELETE → admin authenticated
```

25 

# **29. DATABASE MODEL ĐỀ XUẤT** 

Hãy thiết kế database theo hướng dynamic. 

Không nên tạo: 

```
basic_price
pro_price
team_price
enterprise_price
```

thành các column cố định. 

Thay vào đó nên có cấu trúc relational: 

```
pricing_modules
pricing_tiers
pricing_badges
pricing_features
```

hoặc một schema tương đương phù hợp với source hiện tại. 

Cần cân nhắc: 

```
pricing_modules
```

chứa: 

```
id
name
slug
tagline
icon
is_active
sort_order
created_at
updated_at
```

```
pricing_tiers
```

chứa: 

26 

```
id
module_id
code
label
tagline
price
original_price
discount
machines
threads
resolution
badge_id
billing_period
trial_days
is_active
sort_order
created_at
updated_at
```

Feature có thể thiết kế: 

```
pricing_tier_features
```

hoặc JSONB nếu phù hợp với architecture. 

Badge nên được dynamic: 

```
pricing_badges
```

ví dụ: 

```
id
name
code
style
color/config
is_active
```

Không hard-code badge trong frontend. 

# **30. TRIAL** 

Tier Trial phải được hỗ trợ ngay trong database. 

27 

Ví dụ: 

```
code = trial
trial_days = 7
billing_period = trial
```

UI phải hiển thị: 

```
7 ngày
```

thay vì: 

```
/tháng
```

Không nên dùng logic: 

```
if(label==="Trial")
```

để xác định Trial. 

Phải dựa trên dữ liệu: 

```
billing_period
trial_days
tier code
```

# **31. ADMIN DATA MANAGEMENT** 

Dữ liệu pricing phải được cập nhật từ Admin. 

Admin có thể: 

- tạo module 

- sửa module 

- xóa module 

- bật/tắt module 

- thay đổi thứ tự module 

- tạo tier 

- sửa tier 

- thay đổi giá 

- thay đổi giá gốc 

- thay đổi discount 

28 

- thay đổi badge 

- thay đổi machines 

- thay đổi threads 

- thay đổi resolution 

- thêm/xóa feature 

- thay đổi thứ tự feature 

- bật/tắt tier 

Frontend public chỉ có nhiệm vụ: 

```
GET pricing
```

và render dữ liệu. 

# **32. PUBLIC / ADMIN AUTHORIZATION** 

Public endpoint: 

```
GET /GetInfoPrice
```

được phép public. 

Các endpoint thay đổi pricing: 

```
POST
PATCH
PUT
DELETE
```

phải yêu cầu: 

```
Authenticated Admin
```

Không được tin tưởng role từ frontend. 

Authorization phải được kiểm tra tại backend. 

# **33. BACKEND** 

Backend hiện tại: 

29 

```
apps/api
```

đang sử dụng: 

```
NestJS
```

Bắt buộc rà soát architecture hiện tại trước khi thay đổi. 

Cần kiểm tra: 

```
controllers
modules
services
repositories
guards
auth
database
DTO
entities/models
config
environment
```

Sau đó xác định: 

- Có thể tái sử dụng gì? 

- API pricing hiện tại nằm ở đâu? 

- <mark>`/GetInfoPrice`</mark> đang được implement như thế nào? 

- Có cần refactor không? 

- 

- Có API legacy nào cần giữ compatibility không? 

- 

- Supabase đang được kết nối ở đâu? 

- 

- Database client đang được tổ chức như thế nào? 

- 

# **34. SUPABASE** 

Backend sử dụng: 

```
Supabase
PostgreSQL
```

Cần kiểm tra <mark>`.env`</mark> hiện tại. 

Không được commit: 

30 

```
SUPABASE_SERVICE_ROLE_KEY
DATABASE_PASSWORD
JWT_SECRET
API_SECRET
```

hoặc các secret khác vào source code. 

Frontend chỉ được sử dụng những environment variable thực sự được phép public. 

Không expose service role key vào browser. 

# **35. FRONTEND ARCHITECTURE** 

Frontend: 

```
apps/web
```

sử dụng: 

```
Next.js
```

Cần rà soát toàn bộ folder trước. 

Không được tạo thêm một hệ thống component song song nếu component hiện tại có thể tái sử dụng. 

Mục tiêu: 

```
Existing Components
        ↓
Audit
        ↓
Reuse / Refactor
        ↓
Remove duplicates
        ↓
New Architecture
```

# **36. COMPONENT ARCHITECTURE ĐỀ XUẤT** 

Có thể tổ chức theo hướng: 

31 

```
apps/web/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── about/
│   │   ├── pricing/
│   │   ├── news/
│   │   ├── faq/
│   │   └── contact/
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   │
│   ├── dashboard/
│   │   ├── profile/
│   │   ├── transactions/
│   │   ├── affiliate/
│   │   ├── pricing/
│   │   ├── activity-logs/
│   │   ├── guide/
│   │   └── help/
│   │
│   └── checkout/
│
├── components/
│   ├── layout/
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── UserDropdown/
│   │   └── LanguageSwitcher/
│   │
│   ├── pricing/
│   │   ├── PricingPage/
│   │   ├── PricingModuleTabs/
│   │   ├── PricingCard/
│   │   ├── PricingGrid/
│   │   ├── PricingBadge/
│   │   ├── PricingFeatures/
│   │   ├── PricingStats/
│   │   └── ThreadProgress/
│   │
│   ├── user/
│   │   ├── Profile/
│   │   ├── Balance/
│   │   └── Settings/
│   │
│   └── common/
│
├── features/
```

32 

```
│   ├── pricing/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── utils/
│   │   └── mappers/
│   │
│   └── auth/
│
├── lib/
│   ├── api/
│   ├── auth/
│   └── utils/
│
└── types/
```

Đây chỉ là kiến trúc đề xuất. 

#### **Không được áp dụng máy móc.** 

Trước khi tạo cấu trúc này, hãy kiểm tra cấu trúc hiện tại trong <mark>`apps/web`</mark> và điều chỉnh để phù hợp với codebase thực tế. 

# **37. COMPONENT RESPONSIBILITY** 

Không tạo một component khổng lồ như: 

```
PricingPage.tsx
```

chứa toàn bộ: 

• API call • mapping • discount calculation • rendering • responsive layout • checkout navigation • badge logic 

Hãy tách rõ: 

```
API
↓
Mapper
↓
Hook
↓
```

33 

```
Domain Model
↓
UI
```

Ví dụ: 

```
usePricing()
```

chịu trách nhiệm fetch data. 

```
normalizePricingResponse()
```

chịu trách nhiệm normalize API. 

```
calculateDiscount()
```

chịu trách nhiệm tính discount. 

```
calculateThreadPercentage()
```

chịu trách nhiệm progress bar. 

```
PricingCard
```

chỉ chịu trách nhiệm render. 

# **38. LOADING STATE** 

Pricing page phải có loading state. 

Không được để UI trống trong lúc API loading. 

Có thể dùng: 

```
Skeleton
```

cho: 

- module tabs 

- pricing card • price 

34 

• features 

# **39. EMPTY STATE** 

Nếu API trả về: 

```
success = true
data = []
```

phải hiển thị empty state rõ ràng. 

Ví dụ: 

```
Chưa có bảng giá cho module này.
```

Không crash. 

# **40. ERROR STATE** 

Nếu API lỗi: 

```
500
401
403
network error
timeout
```

phải có UI thông báo phù hợp. 

Ví dụ: 

```
Không thể tải bảng giá.
Vui lòng thử lại.
```

Có nút: 

```
Thử lại
```

35 

# **41. API ERROR HANDLING** 

Frontend không được giả định: 

```
response.data.basic
```

luôn tồn tại. 

Phải validate / normalize response. 

Backend cũng cần validate request. 

# **42. TYPE SAFETY** 

Nếu project đang sử dụng TypeScript thì ưu tiên TypeScript strict. 

Không lạm dụng: 

```
any
```

Không sử dụng: 

```
asany
```

chỉ để bypass lỗi type. 

Nếu API response không thống nhất, hãy tạo type riêng và mapper. 

# **43. MONEY FORMATTING** 

Tất cả giá tiền phải format theo: 

```
vi-VN
```

Ví dụ: 

```
150000
```

→ 

36 

```
150.000đ
```

Không dùng string hard-code: 

```
"150.000đ"
```

trong database hoặc component. 

Database lưu số: 

```
150000
```

UI mới format. 

# **44. DISCOUNT LOGIC** 

Không được tin tưởng tuyệt đối <mark>`discount`</mark> nếu backend có thể không gửi. 

Có thể tính: 

```
discount = (1 - price / originalPrice) * 100
```

Nếu: 

```
originalPrice <= 0
```

thì: 

```
discount = 0
```

Nếu backend gửi <mark>`discount` ,</mark> cần thống nhất source of truth. 

Phải tránh trường hợp: 

```
price
originalPrice
discount
```

không khớp nhau. 

37 

Hãy đề xuất trong kiến trúc backend/database cách xử lý tốt nhất. 

# **45. GIÁ GỐC** 

Nếu có: 

```
discount = 40%
price = 1.800.000đ
```

thì: 

```
originalPrice = price / (1 - discount / 100)
```

Không sử dụng: 

```
price * (1 + discount / 100)
```

vì công thức đó không cho ra giá gốc chính xác. 

# **46. API CONTRACT** 

Cần rà soát API hiện tại: 

```
GET /GetInfoPrice?m={{tên_modules}}
```

và xác định: 

- URL thực tế • base URL • auth requirement • request format • response format • error format • naming convention • module identifier • caching • timeout • retry 

Nếu cần refactor API, phải đảm bảo không phá vỡ các client hiện tại nếu chúng đang sử dụng endpoint cũ. 

38 

# **47. STORAGE** 

Phần storage phải được rà soát. 

Nếu cần lưu: 

• icon module • logo • hình ảnh pricing • badge asset • news images • user avatar 

thì sử dụng storage phù hợp, ưu tiên Supabase Storage nếu architecture hiện tại phù hợp. 

Database chỉ lưu: 

```
storage path / public URL
```

Không lưu binary image trực tiếp trong PostgreSQL nếu không có lý do rõ ràng. 

# **48. CACHE / PERFORMANCE** 

Pricing là dữ liệu public nên có thể cache. 

Hãy đánh giá: 

- Next.js caching • server-side fetch • client-side cache • revalidation • API cache 

Không được cache dữ liệu pricing quá lâu khiến user nhìn thấy giá cũ sau khi Admin update. 

Hãy đề xuất strategy hợp lý. 

# **49. SECURITY** 

Kiểm tra: 

- authentication • authorization • admin role 

- API access 

39 

• Supabase RLS • service role • environment variables • CORS • CSRF nếu phù hợp • input validation • SQL injection • XSS • mass assignment 

Đặc biệt: 

Public user không được phép sửa pricing bằng cách gọi API trực tiếp. 

# **50. RÀ SOÁT** **<mark>`.env`</mark>** 

Hiện tại tôi đã có file: 

```
.env
```

Hãy kiểm tra <mark>`.env`</mark> thực tế trong repository. 

Không được yêu cầu tôi tạo lại nếu biến đã tồn tại. 

Hãy xác định: 

```
Biến nào frontend sử dụng?
Biến nào backend sử dụng?
Biến nào public?
Biến nào secret?
Biến nào dư thừa?
Biến nào thiếu?
```

Nếu phát hiện thiếu environment variable: 

```
Tên biến
Mục đích
Scope
Ví dụ giá trị
```

phải được ghi rõ. 

Không được commit secret thật. 

40 

# **51. RÀ SOÁT TOÀN BỘ** **<mark>`apps/web`</mark>** 

Trước khi code cần kiểm tra: 

```
apps/web
```

bao gồm: 

• pages • layouts • components • hooks • services • API clients • contexts • providers • stores • types • utils • styles • assets • middleware • auth • routing • environment • package dependencies 

Sau đó báo cáo: 

```
File / folder
↓
Vai trò
↓
Đang được sử dụng ở đâu
↓
Giữ / Refactor / Xóa
↓
Lý do
```

# **52. RÀ SOÁT TOÀN BỘ** **<mark>`apps/api`</mark>** 

Tương tự, kiểm tra: 

41 

```
apps/api
```

bao gồm: 

- modules 

- controllers 

- services 

- repositories 

- DTO 

- guards 

- interceptors 

- pipes 

- auth 

- database 

- Supabase 

- PostgreSQL 

- configuration 

- environment 

- existing pricing APIs 

Đặc biệt cần tìm: 

```
GetInfoPrice
```

và xác định implementation thực tế. 

# **53. RÀ SOÁT DATABASE** 

Nếu database đã tồn tại: 

Không được tạo schema mới một cách mù quáng. 

Hãy: 
1. Kiểm tra trong file apps/api/prisma/schema.prisma hiện tại 

2. Kiểm tra schema hiện tại. 

3. Kiểm tra table hiện tại. 

4. Kiểm tra relationship. 

5. Kiểm tra index. 

6. Kiểm tra RLS. 

7. Kiểm tra migration. 

8. Kiểm tra data hiện tại. 

9. Xác định bảng nào có thể tái sử dụng. 

10. Xác định bảng nào cần migration. 

11. Xác định dữ liệu nào cần seed. 

42 

# **54. MIGRATION** 

Nếu cần thay đổi database: 

Phải tạo migration có kiểm soát. 

Không được: 

```
DROP DATABASE
```

hoặc xóa dữ liệu hiện tại nếu không có lý do và xác nhận rõ ràng. 

Nếu cần migrate pricing cũ: 

```
Legacy Pricing
      ↓
Migration
      ↓
New Pricing Schema
```

Phải bảo toàn dữ liệu cần thiết. 

# **55. SEED DATA** 

Tạo seed data cho 6 module. 

Module: 

```
Tự động cắt video
Tạo video AI
AI Video Studio
Tạo video reup
Tìm ngách hot
Tải video hàng loạt
```

<mark>`Tạo video AI`</mark> sử dụng dữ liệu thật đã cung cấp. 

5 module còn lại sử dụng placeholder hợp lý. 

Seed phải chạy được nhiều lần mà không tạo duplicate nếu có thể. 

43 

# **56. KHÔNG HARDCODE** 

Không hard-code: 

```
module name
module pricing
price
originalPrice
discount
badge
features
machines
threads
resolution
```

trong React/Next.js. 

Frontend chỉ có thể chứa: 

```
UI configuration
icons mapping
layout configuration
```

Nhưng module pricing thực tế phải lấy từ API/database. 

# **57. ICON MODULE** 

Mỗi module cần có icon riêng. 

Nếu icon được xác định dựa trên: 

```
icon key
```

thì frontend có thể map: 

```
"video-cut" → Scissors
"ai-video" → Sparkles
"video-studio" → Clapperboard
...
```

Nhưng: 

Không hard-code toàn bộ module data vào frontend. 

44 

Icon mapping chỉ là UI concern. 

# **58. ROUTING** 

Cần xây dựng routing rõ ràng. 

Ví dụ: 

```
/
├── /about
├── /pricing
├── /news
├── /faq
├── /contact
│
├── /login
├── /register
│
├── /dashboard
│   ├── /profile
│   ├── /transactions
│   ├── /affiliate
│   ├── /pricing
│   ├── /activity-logs
│   ├── /guide
│   └── /help
│
└── /checkout
```

Nếu source hiện tại đã có routing tương tự, hãy reuse/refactor thay vì tạo duplicate. 

# **59. USER AREA** 

User Area cần có navigation: 

```
Hồ sơ
Lịch sử giao dịch
Tiếp thị liên kết
Bảng giá
Nhật ký hoạt động
Hướng dẫn sử dụng
Trợ giúp
```

UI cần có active state rõ ràng. 

45 

# **60. HỒ SƠ** 

Trang: 

```
Hồ sơ
```

cần chuẩn bị để hiển thị: 

• username • email • avatar • thông tin cá nhân • số dư • ngày đăng ký • trạng thái tài khoản 

Các dữ liệu này phải lấy từ user/session API. 

# **61. LỊCH SỬ GIAO DỊCH** 

Trang: 

```
Lịch sử giao dịch
```

cần được chuẩn bị để hiển thị: 

```
Mã giao dịch
Thời gian
Loại giao dịch
Số tiền
Trạng thái
Nội dung
```

Chưa cần triển khai payment gateway nếu chưa có. 

Nhưng architecture phải đủ để tích hợp sau này. 

# **62. TIẾP THỊ LIÊN KẾT** 

Trang: 

46 

```
Tiếp thị liên kết
```

cần được chuẩn bị để sau này hiển thị: 

• affiliate code • referral link • lượt click • số người đăng ký • doanh thu • hoa hồng • lịch sử hoa hồng 

Không cần fake API nếu backend chưa có. 

Nếu chưa có backend, hãy tạo placeholder UI rõ ràng thay vì hard-code dữ liệu giả như dữ liệu thật. 

# **63. NHẬT KÝ HOẠT ĐỘNG** 

Trang: 

```
Nhật ký hoạt động
```

sẽ dùng để hiển thị các hoạt động của user. 

Ví dụ: 

```
Đăng nhập
Đăng xuất
Đổi mật khẩu
Mua gói
Nạp tiền
Sử dụng module
```

Không cần triển khai toàn bộ activity tracking nếu backend hiện tại chưa hỗ trợ, nhưng phải chuẩn bị kiến trúc. 

# **64. HƯỚNG DẪN SỬ DỤNG** 

Trang: 

```
Hướng dẫn sử dụng
```

47 

dành cho user tìm hiểu cách sử dụng EIGU. 

Có thể tổ chức: 

```
Getting Started
Module Guides
Pricing
Account
Payment
Troubleshooting
```

# **65. TRỢ GIÚP** 

Trang: 

```
Trợ giúp
```

có thể bao gồm: 

- FAQ • Contact Support • Góp ý • Báo lỗi 

- Troubleshooting 

# **66. CODE QUALITY** 

Code phải: 

- rõ ràng 

- dễ đọc 

- dễ maintain 

- có TypeScript type 

- tách responsibility 

- tránh duplicate 

- tránh component quá lớn 

- tránh logic business trong UI 

- tránh API call trực tiếp trong presentation component 

- có comment tại các logic quan trọng 

Không comment những dòng code hiển nhiên. 

Comment nên tập trung vào: 

48 

```
discount calculation
thread calculation
API mapping
legacy compatibility
auth/security
pricing normalization
```

# **67. TESTING** 

Sau khi triển khai cần kiểm tra: 

### **Frontend** 

```
npm / pnpm / yarn build
typecheck
lint
```

theo package manager hiện tại của project. 

### **Backend** 

```
build
typecheck
lint
test
```

nếu project hỗ trợ. 

### **Functional** 

Test: 

```
Public page
Login
Logout
User dropdown
Balance
Settings
Pricing
Module switch
Pricing API
Loading
Empty
Error
```

49 

```
Checkout
Responsive
```

# **68. PRICING TEST CASES** 

Bắt buộc test các trường hợp: 

### **Case 1** 

```
price = 150000
originalPrice = 0
```

Không hiển thị giá gốc. 

### **Case 2** 

```
price = 1800000
originalPrice = 3000000
```

Hiển thị: 

```
3.000.000đ
1.800.000đ
```

### **Case 3** 

```
discount = 40
```

Badge: 

```
GIẢM 40%
```

nếu backend cấu hình như vậy. 

### **Case 4** 

```
threads = 0
```

Hiển thị: 

50 

```
Không giới hạn
```

### **Case 5** 

```
resolution = "-"
```

Không hiển thị một thông tin video không liên quan. 

### **Case 6** 

```
trial
```

hiển thị: 

```
7 ngày
```

không phải: 

```
/tháng
```

# **69. OUTPUT BẮT BUỘC** 

Sau khi rà soát và triển khai, hãy báo cáo theo đúng thứ tự sau. 

## **PHẦN 1 — KẾT QUẢ RÀ SOÁT HIỆN TRẠNG** 

Báo cáo: 

```
apps/web
apps/api
packages
database
.env
dependencies
routing
auth
pricing API
```

Nêu rõ: 

51 

```
Đang có gì?
Đang hoạt động thế nào?
Vấn đề gì?
Có duplicate gì?
Có legacy gì?
Có thể reuse gì?
Cần xóa gì?
Cần refactor gì?
```

# **PHẦN 2 — KIẾN TRÚC ĐỀ XUẤT** 

Trình bày: 

```
Frontend
Backend
Database
API
Authentication
Storage
Pricing
Checkout
Admin
```

và flow: 

```
User
 ↓
Next.js
 ↓
NestJS API
 ↓
Supabase
 ↓
PostgreSQL
```

# **PHẦN 3 — KIẾN TRÚC THƯ MỤC** 

Đưa ra tree đầy đủ sau refactor. 

Ví dụ: 

52 

```
apps/web/
apps/api/
packages/
```

Giải thích vai trò của các folder quan trọng. 

# **PHẦN 4 — COMPONENT ARCHITECTURE** 

Liệt kê các component chính và trách nhiệm: 

```
Header
UserDropdown
LanguageSwitcher
PricingModuleTabs
PricingGrid
PricingCard
PricingBadge
ThreadProgress
PricingFeatures
...
```

# **PHẦN 5 — DATABASE SCHEMA** 

Đưa ra: 

- table • column • type • nullable 

- default • relation • index • RLS 

- migration strategy 

# **PHẦN 6 — API CONTRACT** 

Đưa ra: 

```
GET /GetInfoPrice
```

53 

và các API Admin nếu cần. 

Mô tả: 

```
request
response
authentication
authorization
error
validation
```

# **PHẦN 7 — FRONTEND CODE** 

Triển khai đầy đủ: 

- Landing Page • Header • User dropdown • Pricing page • Module tabs • Pricing cards • Responsive • Loading • Empty 

- Error 

- Checkout hook 

- User pages 

- Settings navigation 

# **PHẦN 8 — BACKEND CODE** 

Triển khai: 

- Pricing module 

- Controller 

- Service 

- DTO 

- Repository/data access 

- Supabase integration 

- Database query 

- Public GET endpoint 

- Admin mutation endpoint 

- Authorization 

- Validation 

54 

# **PHẦN 9 — SUPABASE / POSTGRESQL** 

Triển khai: 

• SQL migration • schema • indexes • RLS • seed data 

# **PHẦN 10 — STORAGE** 

Nêu rõ: 

```
Storage bucket
Folder structure
Naming convention
Public/private
URL strategy
```

nếu cần sử dụng storage. 

# **PHẦN 11 —** **<mark>`.env`</mark>** 

Rà soát <mark>`.env`</mark> thực tế. 

Không được expose secret. 

Liệt kê: 

```
Variable
Purpose
Used by
Public/Private
Required/Optional
```

# **PHẦN 12 — LOCAL DEVELOPMENT** 

Hướng dẫn đầy đủ cách chạy local. 

55 

Ví dụ: 

```
pnpminstall
pnpmnxserveweb
pnpmnxserveapi
```

Nhưng phải kiểm tra package manager và script thực tế trong repository trước khi đưa lệnh. 

Hướng dẫn: 

`1. Install dependencies` 

`2. Setup env` 

`3. Setup Supabase` 

`4. Run migration` 

`5. Run seed` 

`6. Start API` 

`7. Start Web` 

`8. Test pricing API` 

`9. Test frontend` 

# **PHẦN 13 — CHECKLIST KIỂM TRA** 

Cuối cùng phải có checklist: 

```
[ ] Web build
```

```
[ ] API build
```

```
[ ] TypeScript
```

- `[ ] Lint` 

```
[ ] Landing page
```

```
[ ] Login
```

```
[ ] Register
```

```
[ ] User dropdown
```

```
[ ] Balance
```

```
[ ] Settings
```

```
[ ] Pricing
```

```
[ ] Pricing API
```

```
[ ] Module switching
```

```
[ ] Discount
```

```
[ ] Original price
```

```
[ ] Trial
```

```
[ ] Thread progress
```

```
[ ] Responsive
```

```
[ ] Loading
```

```
[ ] Empty
```

```
[ ] Error
```

56 

```
[ ] Checkout
```

```
[ ] Database
```

```
[ ] Supabase
```

```
[ ] RLS
[ ] Admin authorization
```

```
[ ] Storage
[ ] .env
```

# **70. QUY TRÌNH THỰC HIỆN BẮT BUỘC** 

Không được triển khai theo kiểu sửa từng file ngẫu nhiên. 

Hãy thực hiện theo quy trình: 

```
STEP 1
Rà soát toàn bộ repository
        ↓
STEP 2
Rà soát apps/web
        ↓
STEP 3
Rà soát apps/api
        ↓
STEP 4
Rà soát database + Supabase
        ↓
STEP 5
Rà soát .env
        ↓
STEP 6
Rà soát pricing API hiện tại
        ↓
STEP 7
Đưa ra báo cáo kiến trúc hiện tại
        ↓
STEP 8
Đề xuất kiến trúc mới
        ↓
STEP 9
Đề xuất database schema
        ↓
STEP 10
Đề xuất component architecture
        ↓
STEP 11
Xác định file cần giữ / sửa / xóa / tạo
        ↓
```

57 

```
STEP 12
Refactor architecture
        ↓
STEP 13
Implement database + migration
        ↓
STEP 14
Implement API
        ↓
STEP 15
Implement frontend
        ↓
STEP 16
Implement pricing UI
        ↓
STEP 17
Implement User Area
        ↓
STEP 18
Implement checkout hook
        ↓
STEP 19
Build + typecheck + lint
        ↓
STEP 20
Test toàn bộ flow
        ↓
STEP 21
Review lại source code sau triển khai
        ↓
STEP 22
Báo cáo kết quả cuối cùng
```

# **71. NGUYÊN TẮC QUAN TRỌNG** 

### **Không được làm** 

- Không hard-code pricing. • Không hard-code discount. • Không hard-code badge. • Không hard-code feature. • Không hard-code số máy. • Không hard-code threads. • Không hard-code resolution. • Không đưa secret vào frontend. • Không expose Supabase Service Role Key. • Không bỏ qua <mark>`.env` .</mark> 

- Không bỏ qua source code hiện tại. 

58 

- Không tạo architecture mới mà không kiểm tra architecture cũ. 

- Không tạo component duplicate nếu đã có component tương tự. 

- Không xóa dữ liệu database tùy tiện. 

- Không phá API hiện tại mà không đánh giá compatibility. 

- Không đưa business logic vào UI component. 

- Không để API response legacy lan trực tiếp vào UI. 

# **72. NGUYÊN TẮC REFACTOR** 

Mục tiêu không chỉ là: 

```
"làm cho chạy"
```

mà phải đạt: 

```
Clean
Maintainable
Scalable
Type-safe
Reusable
Responsive
Secure
Easy to extend
```

Đặc biệt hệ thống pricing phải hỗ trợ tương lai: 

```
Thêm module
Thêm tier
Thêm badge
Thêm feature
Thêm billing period
Thêm pricing rule
Thêm currency
Thêm payment provider
```

mà không cần sửa quá nhiều frontend. 

# **73. KẾT QUẢ CUỐI CÙNG MONG MUỐN** 

Sau khi hoàn thành, EIGU Web phải có kiến trúc: 

59 



<!-- Start of picture text -->
                    ┌───────────────────┐<br>                    │   EIGU WEBSITE    │<br>                    └─────────┬─────────┘<br>                              │<br>             ┌────────────────┴────────────────┐<br>             │                                 │<br>      Public Website                       User Area<br>             │                                 │<br>   ┌─────────┼─────────┐             ┌─────────┼─────────┐<br>   │         │         │             │         │         │<br> Home     Pricing     News         Profile   History   Affiliate<br>   │         │                       │         │         │<br> About     FAQ                     Pricing   Activity  Settings<br> Contact                           Guide     Help<br>             │<br>             ▼<br>      GET /GetInfoPrice<br>             │<br>             ▼<br>        NestJS API<br>             │<br>             ▼<br>          Supabase<br>             │<br>             ▼<br>        PostgreSQL<br><!-- End of picture text -->

Pricing phải có flow: 

```
Database
   ↓
NestJS API
   ↓
Normalizer / Mapper
   ↓
Next.js Data Layer
   ↓
Pricing Hook
   ↓
Pricing Components
   ↓
User
```

Checkout: 

```
User
 ↓
Chọn gói
```

60 

```
 ↓
Checkout
 ↓
module + tier + price
 ↓
Payment Gateway
```

Admin: 

```
Desktop App
     ↓
Quản lý bảng giá
     ↓
NestJS API
     ↓
Supabase / PostgreSQL
     ↓
Public Pricing API
     ↓
EIGU Website
```

# **74. YÊU CẦU CUỐI CÙNG** 

Một lần nữa: 

#### **Không bắt đầu code ngay.** 

Trước tiên hãy: 

1. Rà soát toàn bộ source code thực tế. 2. Đọc toàn bộ <mark>`apps/web` .</mark> 3. Đọc toàn bộ <mark>`apps/api` .</mark> 4. Rà soát <mark>`.env` .</mark> 

5. Rà soát database/Supabase. 

6. Rà soát API <mark>`/GetInfoPrice` .</mark> 

7. Rà soát authentication hiện tại. 

8. Rà soát routing hiện tại. 

9. Rà soát component hiện tại. 

10. Rà soát những phần liên quan đến Admin/Trung tâm vận hành. 11. Xác định chính xác những gì cần xóa. 

12. Xác định chính xác những gì cần giữ. 

13. Xác định những gì cần refactor. 14. Xác định những gì cần tạo mới. 

#### Sau đó **trình bày kế hoạch và kiến trúc trước** . 

Chỉ sau khi hoàn tất bước phân tích mới bắt đầu triển khai. 

61 

Trong quá trình triển khai, nếu phát hiện architecture hiện tại khác với giả định trong prompt này, hãy **ưu tiên source code thực tế** , ghi nhận sự khác biệt và điều chỉnh giải pháp phù hợp thay vì ép codebase phải theo một architecture giả định. 

Mục tiêu cuối cùng là biến EIGU thành một hệ thống: 

#### **Public Website + User Portal + Dynamic Pricing + Supabase/PostgreSQL + NestJS API + Desktop Admin Architecture** 

với pricing hoàn toàn dynamic, có thể quản lý từ Admin và không phải sửa frontend mỗi khi thay đổi giá/gói/module. 

62 

