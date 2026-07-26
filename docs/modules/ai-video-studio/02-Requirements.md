# EIGU Platform — AI Video Module

AI Video Module — Requirements

## 1. Project

Project là một file `.eigu` trên filesystem.

### Metadata

- name
- description
- status (`draft | generating | ready | rendering | completed | failed | cancelled | archived`)
- language
- category
- aspectRatio
- resolution
- fps
- duration
- thumbnail
- tags
- createdAt
- updatedAt

### Naming

Tên project = tên file `.eigu` (không bao gồm extension).

Nếu đã tồn tại `My Video.eigu` → user chọn Save As với tên khác, hoặc app tự động ghi đè (confirm dialog).

## 2. Creation modes

- Copy Video
- Tạo từ Ý tưởng
- Tạo từ Hình ảnh
- Tạo từ nhiều Hình ảnh
- Tạo từ Character
- Tạo từ Story
- Tạo từ Script
- Tạo từ PDF
- Tạo từ Website/URL
- Tạo từ Blog
- Tạo từ News
- Tạo từ Markdown
- Tạo từ JSON
- Tạo từ Audio
- Tạo từ Voice
- Tạo từ Product
- Tạo từ Template

## 3. Scene

Mỗi scene có prompt, negative prompt, duration, camera, lens, lighting, emotion, transition, character, references, voice, subtitle, music, provider, seed và status.

Scene data lưu trong `project.json` → scenes[].

## 4. Project lifecycle

`Draft → Generating → Ready → Rendering → Completed / Failed / Cancelled / Archived`

Trạng thái lưu trong `project.json` → project.status.

## 5. File operations

- **New Project**: Tạo `.eigu` file mới tại đường dẫn user chọn.
- **Open Project**: File picker → đọc `.eigu` → parse → render UI.
- **Save**: Ghi đè file `.eigu` hiện tại (auto-save 30s + manual Ctrl+S).
- **Save As**: Copy sang file `.eigu` mới.
- **Recent Projects**: Danh sách đường dẫn file gần đây (lưu trong config.json).
- **Export**: Xuất video hoặc template `.eigu`.

## 6. Auto-save

- Auto-save mỗi 30 giây nếu có thay đổi.
- Trước khi ghi đè, tạo backup `.eigu.bak`.
- Khi render, snapshot project.json để rollback nếu crash.

## 7. Delete

Soft delete: đánh dấu `status: archived` trong project.json.
Hard delete: xóa file `.eigu` khỏi filesystem (confirm dialog).

## 8. Acceptance

Mọi nút trong UI phải có IPC channel thực tế hoặc bị ẩn/disabled. Không để chức năng giả.
