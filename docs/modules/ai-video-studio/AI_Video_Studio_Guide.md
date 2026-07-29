# AI Video Studio – Kiến Trúc Lại Toàn Diện (EIGU)

> **Vai trò yêu cầu:** Software Architect, Solution Architect, Product Owner, Senior Fullstack Engineer (20+ năm kinh nghiệm)
>
> **Nguyên tắc bắt buộc:** KHÔNG viết code ngay. Phải phân tích toàn bộ hệ thống hiện tại, điều tra các module liên quan, đánh giá kiến trúc, xác định các phần đã tồn tại / đã dùng / đang mock, sau đó mới đưa ra phương án thiết kế. Tuyệt đối không viết code khi chưa hoàn thành bước phân tích.

---

## 1. Mục Tiêu

Thiết kế lại hoàn toàn **Module AI Video Studio** của EIGU từ đầu.

- **Loại ứng dụng:** Desktop Application
- **Yêu cầu mở rộng:** Hệ thống phải đủ khả năng mở rộng trong nhiều năm tới

### Các yêu cầu chức năng cốt lõi

- Hỗ trợ nhiều AI Provider
- Hỗ trợ BYOK (Bring Your Own Key)
- Hỗ trợ No-BYOK
- Subscription theo tháng
- Credit System
- Admin Backoffice
- Billing
- Payment
- Pricing Engine
- API Key Vault
- Model Management
- Provider Routing
- Retry
- Failover
- Audit Log

### Ràng buộc thiết kế

- **Không được hardcode bất kỳ Provider nào.**
- **Mọi thứ đều phải cấu hình được.**

---

## 2. Bước Điều Tra Bắt Buộc (Trước Khi Thiết Kế)

Trước khi đề xuất bất kỳ kiến trúc nào, phải điều tra từng thành phần sau. Với mỗi thành phần, liệt kê toàn bộ nơi đang sử dụng (Entity, Migration, Seeder, Repository, Service, Controller, API, Cron, Scheduler, Module, Frontend, IPC, Desktop). Nếu không dùng thì ghi rõ. **Không được đoán.**

| # | Thành phần | Nội dung cần điều tra |
|---|------------|------------------------|
| 1 | **AIProvider** | Bảng này đang được dùng thật hay chỉ là mock data? Điều tra Entity, Migration, Seeder, Repository, Service, Controller, API, Cron, Scheduler, Module, Frontend, IPC, Desktop |
| 2 | **AIModelConfig** | Có đang được dùng để render, billing, pricing, model selector — hay chỉ mới seed dữ liệu? |
| 3 | **ApiKeyVault** | Điều tra toàn diện |
| 4 | **UserApiKey** | Điều tra toàn diện |
| 5 | **Billing** | Điều tra toàn diện |
| 6 | **Credit** | Điều tra toàn diện |
| 7 | **Transaction** | Điều tra toàn diện |
| 8 | **Subscription** | Điều tra toàn diện |
| 9 | **Payment** | Điều tra toàn diện |
| 10 | **Role** | Điều tra cơ chế phân quyền hiện tại |

### Sau khi điều tra — Xuất báo cáo phân loại

Mỗi thành phần cần được gắn nhãn theo các phân loại sau:

- Đã dùng
- Đang dùng một phần
- Mock
- Không dùng
- Nên giữ
- Nên xoá
- Nên merge

---

## 3. Mô Hình Kinh Doanh

Đây là hệ thống **SaaS**.

- Khách hàng **KHÔNG** mua API.
- Khách hàng **KHÔNG** mua Google.
- Khách hàng **KHÔNG** mua OpenAI.
- Khách hàng chỉ mua **quyền sử dụng EIGU**.
- EIGU sẽ là đơn vị đứng giữa (middleman) giữa khách hàng và các AI Provider.

---

## 4. Subscription

Khách hàng mua theo tháng. Ví dụ các gói:

- **Trial** ~ 7 ngày
- **Basic** / tháng
- **Pro** / tháng
- **Team** / tháng
- **Enterprise** / tháng, quý, 6 tháng, 12 tháng

### Mỗi gói phải có

- Giá bán
- Thời hạn
- Số Credit
- Model được phép
- Giới hạn
- Quota
- Trial
- Feature

---

## 5. Credit System

- Credit là **đơn vị nội bộ**.
- Credit **KHÔNG** phải USD.
- Credit **KHÔNG** quy đổi trực tiếp sang USD.
- Khách hàng chỉ thấy Credit.

### Tuyệt đối không được hiển thị cho khách hàng

- Giá USD
- Provider
- API Key
- Chi phí thật

---

## 6. Admin AI Budget

Mỗi gói Subscription sẽ có thêm một trường: **`MonthlyAIBudget`**

**Ví dụ:**

| Mục | Giá trị |
|-----|---------|
| Giá bán | 650.000 VNĐ |
| Monthly AI Budget | 300.000 VNĐ |

Phần còn lại (350.000 VNĐ trong ví dụ trên) dùng cho:

- Lợi nhuận
- Server
- Storage
- Bandwidth
- Email
- Payment fee
- Marketing
- Support
- Dự phòng

> ⚠️ **Tuyệt đối không sử dụng toàn bộ tiền khách trả để chi cho AI Provider.**

---

## 7. Google / Provider Balance

Đây là phần **cực kỳ quan trọng**.

- Admin là người mua các gói của AI Provider, ví dụ:
  - Google AI Pro
  - Vertex AI
  - OpenAI
  - Runway
  - Kling
  - ...

**Ví dụ luồng:**

Admin mua Google AI Pro 18 tháng → Google cấp 1050 Credit (hoặc quota tương đương theo chính sách của Provider) → EIGU sẽ tiêu hao số Credit/quota này trước.

### Nếu Provider hỗ trợ Credit/Quota

```
Render
  ↓
Provider trừ Credit/quota
  ↓
Khi Credit/quota = 0
  ↓
Nếu đã bật Pay-as-you-go
  ↓
Mới bắt đầu tính phí theo tiền thật
```

### Nếu Provider không có Credit/quota

Chỉ hỗ trợ Pay-as-you-go → hệ thống phải hỗ trợ cơ chế đó trực tiếp.

> **Thiết kế phải đủ linh hoạt để hoạt động với cả hai mô hình** (Credit/quota-based và Pay-as-you-go).

---

## 8. Pricing Engine

Pricing Engine phải là **trung tâm** của hệ thống.

### Luồng quyết định

```
User
  ↓
Subscription
  ↓
Model
  ↓
Pricing Rule
  ↓
Credit
  ↓
Provider
  ↓
Render
```

### Phải hỗ trợ

- Markup
- Buffer
- Multiplier
- Promotion
- Retry
- Refund
- Trial rule

> **Không được hardcode.**

---

## 9. Provider Router

- **Không được gọi Provider trực tiếp.**
- Mọi request phải đi qua **Provider Router**.

### Router quyết định

- Provider nào
- Model nào
- Fallback
- Retry
- Timeout
- Load Balance
- Priority
- Future Routing

---

## 10. API Key Vault (No-BYOK)

API Key do **Admin** quản lý. Một Provider có thể có nhiều API Key.

### Chức năng cần hỗ trợ

- Thêm
- Sửa
- Xoá
- Ping
- Rotate
- Enable
- Disable
- Priority
- Weight
- **Check healthy of key** (kiểm tra xem key thật sự sống hay chết — bắt buộc để còn đổi key khác)

---

## 11. BYOK (Chỉ Phù Hợp Với Khách Hàng Enterprise)

- Người dùng có thể nhập API Key riêng.
- Hệ thống phải **tự động quyết định**:
  - Render bằng Key của User
  - hay Key của Admin

---

## 12. Client (Góc Nhìn Người Dùng Cuối)

### Client không được nhìn thấy

- Provider
- API Key
- USD
- Chi phí thật

### Client chỉ thấy

- Model
- Credit
- Subscription

---

## 13. Admin Backoffice

Các màn hình cần có:

- API Key Vault
- Provider
- Model
- Pricing
- Subscription
- Credit
- Transaction
- Billing
- Payment
- Trial
- User
- Dashboard

---

## 14. Payment

Thiết kế module Payment **độc lập**, có thể tích hợp:

- **SePay** (vì hầu hết khách hàng là người Việt nên ưu tiên tích hợp trước)
- VNPay
- Momo
- Stripe
- PayOS
- LemonSqueezy
- Paddle

> **Không được phụ thuộc vào 1 cổng thanh toán duy nhất.**

---

## 15. Billing

Thiết kế đầy đủ các luồng:

- Subscription
- Renew
- Expire
- Top-up Credit
- Refund
- Invoice
- History

---

## 16. Local Storage

- File lưu trữ: `.eigu`, Video, Image, Audio
- Chỉ lưu trên máy người dùng (local, không lưu server)
- Database chỉ lưu **metadata**

---

## 17. Output Yêu Cầu (Thứ Tự Bắt Buộc)

> **Không code.** Xuất lần lượt theo đúng thứ tự sau:

1. Báo cáo điều tra toàn bộ hệ thống hiện tại
2. Những vấn đề đang tồn tại
3. Kiến trúc mới đề xuất
4. Database Design
5. ERD
6. Flow
7. Sequence Diagram
8. Module Breakdown
9. API Design
10. Billing Design
11. Pricing Engine Design
12. Provider Router Design
13. API Key Vault Design
14. Credit System Design
15. Subscription Design
16. Payment Design
17. Security Design
18. Migration Plan
19. Risk Analysis
20. **Sau khi được duyệt toàn bộ kiến trúc mới bắt đầu được phép code.**

---

## Tóm Tắt Nguyên Tắc Cốt Lõi

| Nguyên tắc | Mô tả |
|------------|-------|
| Không hardcode Provider | Mọi Provider phải cấu hình được |
| Không gọi Provider trực tiếp | Luôn đi qua Provider Router |
| Credit ≠ USD | Credit là đơn vị nội bộ, không quy đổi trực tiếp |
| Ẩn chi phí thật với Client | Client chỉ thấy Model, Credit, Subscription |
| Không dùng hết ngân sách AI | Luôn giữ MonthlyAIBudget < giá bán gói |
| Đa cổng thanh toán | Không phụ thuộc 1 payment gateway |
| Điều tra trước, thiết kế sau | Không code cho đến khi kiến trúc được duyệt |
