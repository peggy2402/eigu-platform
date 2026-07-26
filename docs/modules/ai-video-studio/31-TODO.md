# EIGU Platform — AI Video Module

AI Video Module — TODO

## P0 — .eigu File Engine

- [ ] Định nghĩa `project.json` schema (TypeScript interface).
- [ ] Implement `EiguFileWriter` — tạo ZIP archive.
- [ ] Implement `EiguFileReader` — đọc + parse ZIP archive.
- [ ] Implement `EiguFileManager` — new, open, save, saveAs, recent.
- [ ] Auto-save timer (30s).
- [ ] Backup file `.eigu.bak` trước ghi đè.
- [ ] Register `.eigu` file extension với OS (macOS Info.plist, Windows registry).
- [ ] File picker filter `*.eigu`.

## P0 — IPC Handlers (Local)

- [ ] `project:new` — dialog chọn đường dẫn → tạo `.eigu`
- [ ] `project:open` — file picker → đọc `.eigu` → trả data
- [ ] `project:save` — ghi đè `.eigu`
- [ ] `project:saveAs` — save as dialog
- [ ] `project:get` — lấy project data hiện tại
- [ ] `project:update` — cập nhật project metadata
- [ ] `project:delete` — archive / xóa file
- [ ] `project:restore` — unarchive
- [ ] `project:recent` — danh sách recent
- [ ] `scene:create` — thêm scene vào project.json
- [ ] `scene:update` — cập nhật scene
- [ ] `scene:delete` — xóa scene
- [ ] `scene:reorder` — reorder
- [ ] `scene:render` — enqueue render job
- [ ] `storyboard:generate` — AI generate storyboard
- [ ] `character:create/update/delete`
- [ ] `asset:import` — copy vào `.eigu` assets/ hoặc external reference
- [ ] `asset:locateMissing` — dialog locate missing files
- [ ] `render:queue` — lấy queue status
- [ ] `render:cancel` — cancel job
- [ ] `render:retry` — retry failed job
- [ ] `provider:list` — danh sách providers
- [ ] `provider:configure` — lưu API key encrypted
- [ ] `provider:health` — kiểm tra provider

## P0 — Asset Management

- [ ] Import file → check size → embed hoặc reference.
- [ ] SHA-256 hash để detect duplicate.
- [ ] MIME validation.
- [ ] Missing assets dialog (locate external files).
- [ ] Thumbnail generation cho images/video.

## P0 — Render Pipeline

- [ ] In-process queue (p-queue hoặc BullMQ embedded).
- [ ] Job lifecycle (queued → processing → completed/failed).
- [ ] Provider adapter interface.
- [ ] Runway ML adapter (video generation).
- [ ] Kling adapter.
- [ ] Polling job status cho async providers.
- [ ] Download output → lưu vào `.eigu` exports/.
- [ ] Retry logic (max 3, exponential backoff).
- [ ] FFmpeg composition (multi-scene → single video).
- [ ] Queue UI (waiting, active, completed, failed).

## P0 — Security

- [ ] API key encrypted storage (Electron safeStorage).
- [ ] API key management UI.
- [ ] IPC channel validation (chỉ Main Process gọi provider API).

## P0 — UI

- [ ] File menu (New, Open, Save, Save As, Recent, Export).
- [ ] Project workspace (storyboard grid, scene cards).
- [ ] Scene properties panel.
- [ ] Render queue panel.
- [ ] Provider config panel.
- [ ] Unsaved indicator.
- [ ] Missing assets dialog.
- [ ] i18n support.
- [ ] Keyboard shortcuts (Ctrl+S, Ctrl+O, Ctrl+N, Ctrl+E).

## P1 — High

- [ ] Batch generation UI (nhập 100+ ý tưởng/prompt cùng lúc)
- [ ] Batch progress dashboard (bao nhiêu đang chờ/chạy/xong/lỗi)
- [ ] Batch cost estimate trước khi chạy
- [ ] Batch resume sau crash
- [ ] Storyboard generation UI.
- [ ] Scene regeneration.
- [ ] Scene preview (video player).
- [ ] Provider health dashboard.
- [ ] Cost estimate before render.
- [ ] Error handling + toast messages.
- [ ] Responsive layout.
- [ ] Export video (render full project).

## P2 — Medium

- [ ] Timeline editor (tracks, clips, trim, fade).
- [ ] Character library UI.
- [ ] Asset library browser.
- [ ] Voice generation (TTS).
- [ ] Subtitle generation (ASR).
- [ ] Music selection.
- [ ] Brand Kit editor.
- [ ] Version history UI.

## P3 — Advanced

- [ ] AI Director (story → storyboard).
- [ ] Prompt Builder.
- [ ] RAG (knowledge base ingestion + search).
- [ ] Quality Check.
- [ ] A/B generation.
- [ ] Provider benchmark.
- [ ] Cost guardrails.

## Definition of Done

- [ ] `.eigu` file operations hoạt động (new/open/save/saveAs).
- [ ] Backend logic implemented trong Main Process.
- [ ] Frontend UI implemented.
- [ ] Loading state.
- [ ] Empty state.
- [ ] Error state.
- [ ] Success state.
- [ ] i18n.
- [ ] Logging.
- [ ] Tests.
- [ ] Documentation updated.
- [ ] Không còn mock data.
