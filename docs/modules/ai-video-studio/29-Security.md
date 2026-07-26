# EIGU Platform — AI Video Module

AI Video Module — Security Specification

## Multi-tenant Authentication & Data Isolation (Cập nhật thực tế)

- **Backend Authentication & Isolation**: Hệ thống dùng chung 1 backend API qua `/auth/login`.
- **Data Isolation**: Mỗi tài khoản đăng ký độc lập và ĐƯỢC CÁCH LY DỮ LIỆU HOÀN TOÀN (Data Isolation). Không tài khoản nào có thể truy cập dự án, thông tin hoặc lịch sử của tài khoản khác ngoại trừ role Admin trên các trang quản trị được cấp quyền riêng.
- **Token-based Scoping**: Mọi REST API Endpoint nhận JWT Token đã được giải mã phía server (`req.user.id` / `req.user.email`). Server không tin tưởng `userId` hoặc `userEmail` gửi từ client query/body.
- **Strict Role Authorization**:
  - Quyền truy cập thông tin dự án, cảnh, nhân vật, render jobs, lịch sử chat: Bắt buộc filter `WHERE userId = [req.user.id]`.
  - Quyền truy cập các trang quản trị hệ thống (`/users`, `/security/*`, `/audit-logs`): Chặn `403 Forbidden` đối với tài khoản không phải Admin / Staff.
  - Phản hồi góp ý (`/feedback`): User thường chỉ xem được lịch sử góp ý của chính mình.
- **Desktop Recent Projects Scoping**: Danh sách dự án gần đây (`recentProjects`) trong desktop client được lưu trữ tách biệt theo `recentProjects_[userId]`, đảm bảo khi thay đổi tài khoản đăng nhập trên cùng một máy tính, thông tin dự án không bị rò rỉ.

## API keys

Provider API keys:
- lưu encrypted trong `userData/api_keys_secure.json` (Electron safeStorage) theo từng tài khoản người dùng.
- không gửi xuống renderer process.
- không log.
- chỉ decrypt trong Main Process khi gọi provider API.
- rotation support.

## File security

- `.eigu` file là ZIP archive, không encryption mặc định.
- Optional: user có thể set password → AES encrypt `.eigu` file.
- External assets không được bảo vệ (file system permission).

## Audit log

Log trong `userData/logs/`:
- project creation / deletion
- API key changes
- render jobs
- provider calls (không log key)

## Safe storage

Electron `safeStorage` dùng OS keychain:
- macOS: Keychain
- Windows: Credential Manager
- Linux: libsecret
