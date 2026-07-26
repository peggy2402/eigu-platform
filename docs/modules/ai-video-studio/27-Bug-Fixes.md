# EIGU Platform — AI Video Module

AI Video Module — Bug Fixes

## BUG-001 — AIJob provider FK

### Symptom

`AIJob_providerId_fkey` khi gọi render.

### Root cause

`providerId` không tồn tại hoặc không được resolve.

### Fix

- Resolve provider từ config (project.json hoặc app config).
- Validate existence trước khi enqueue.
- UI disable render khi provider unavailable.
- Error code `PROVIDER_NOT_FOUND`.

## BUG-002 — Duplicate Project Name

### Fix

Kiểm tra tên file `.eigu` trong thư mục đích. Nếu trùng → "File already exists" dialog (giống mọi app desktop khác).

## BUG-003 — Missing Delete Project

Implement:

- Archive (soft delete trong project.json)
- Hard delete (xóa file `.eigu`)
- Confirm dialog
- Restore từ recent list nếu còn file

## BUG-004 — Failed to submit render

Trace: UI → IPC → service → provider → queue → worker.

## BUG-005 — Failed to create scene

Validate DTO, project.json integrity.

## BUG-006 — Storyboard generated nhưng scene pending

Phân biệt UI state: Storyboard != rendered video. Scene pending hiển thị storyboard thumbnail placeholder.

## BUG-007 — Tabs không responsive

Flex/grid. Remove fixed widths.

## BUG-008 — Toast không đa ngôn ngữ

IPC error code → i18n translation.

## BUG-009 — Hidden functional failures

Audit button/action. Disable nếu chưa có IPC handler.

## Regression checklist

- [ ] New project (tạo file `.eigu`)
- [ ] Open project (file picker → load `.eigu`)
- [ ] Save / Save As (ghi đè/ghi mới `.eigu`)
- [ ] Duplicate naming (file exists dialog)
- [ ] Delete / Restore
- [ ] Generate storyboard
- [ ] Create scene
- [ ] Scene preview (từ thumbnails/)
- [ ] Submit render (IPC → queue → provider)
- [ ] Queue progress
- [ ] Retry / Cancel
- [ ] Missing assets dialog
- [ ] Auto-save
- [ ] i18n
- [ ] Responsive
