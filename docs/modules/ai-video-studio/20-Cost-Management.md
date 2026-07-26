# EIGU Platform — AI Video Module

AI Video Module — Cost Management & Credit Billing

## 1. Credit Balance & Deduction Workflow

- **Credit Balance**: Mỗi tài khoản khách hàng sở hữu số dư Credit (`User.creditBalance`) trên Backend.
- **Pre-render Credit Check**: Trước khi submit render job, Backend đối chiếu `creditBalance >= provider.creditCost`. Nếu số dư không đủ, Backend từ chối với lỗi `INSUFFICIENT_CREDIT` và hướng dẫn khách hàng nạp thêm credit.
- **Post-render Deduction**: Credit CHỈ thực sự bị trừ SAU KHI render job hoàn tất THÀNH CÔNG (tránh trừ tiền khi render lỗi).
- **CreditTransaction Audit Trail**: Mọi giao dịch trừ/nạp credit đều được ghi vết vào bảng `CreditTransaction` (`userId`, `amount`, `type`, `jobId`, `providerId`, `createdAt`).

## 2. Track

- provider cost (per scene / per creditCost)
- model cost
- voice cost
- composition cost
- estimated vs actual cost

Dữ liệu chi phí lưu song song trong `project.json` (cục bộ) và `CreditTransaction` (trên Backend).

## 3. Dual-Layer Guardrails

1. **Layer 1 (Tài khoản SaaS)**: Số dư Credit khả dụng (`User.creditBalance`) trên Server.
2. **Layer 2 (Cá nhân tự cấu hình)**: Per-project budget và per-job limit do user tự thiết lập trong dự án `.eigu`.

## 4. Policy

Khi gần/vượt limit hoặc hết credit:
- Warning dialog / Toast thông báo hạn mức.
- Block render lệnh nếu không đủ Credit hoặc quá giới hạn ngân sách dự án.
- Khuyên dùng provider tiết kiệm hơn (nếu khả thi).
