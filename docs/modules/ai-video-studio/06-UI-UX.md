# EIGU Platform — AI Video Module

AI Video Module — UI/UX

## 1. Layout

Thiết kế desktop-first:

- **Menu bar**: File (New, Open, Save, Save As, Recent, Export), Edit, View, Help.
- **Left navigation**: Project list / File browser.
- **Project header**: Tên project, status, Save indicator.
- **Creation toolbar**: Nút tạo theo các mode.
- **Storyboard/Scene workspace**: Grid scenes với drag-drop reorder.
- **Central preview**: Video preview + scene preview.
- **Timeline**: Multi-track timeline editor.
- **Right properties panel**: Scene properties, character properties.
- **Bottom render queue**: Queue status, progress, job list.

Các panel phải responsive theo kích thước cửa sổ và có thể resize.

## 2. File menu

| Command | Shortcut | Action |
|---------|----------|--------|
| New Project | Ctrl+N | Tạo `.eigu` file mới (dialog chọn đường dẫn) |
| Open Project | Ctrl+O | File picker filter `*.eigu` |
| Save | Ctrl+S | Ghi đè `.eigu` hiện tại |
| Save As | Ctrl+Shift+S | Save As dialog |
| Recent Projects | — | Danh sách `.eigu` gần đây |
| Export Video | Ctrl+E | Export render output |
| Export Template | — | Export project as `.eigu` template |
| Exit | — | Đóng app (auto-save nếu chưa save) |

**Khi tạo project mới**: dialog chọn thư mục & nhập tên.
**Khi save lần đầu**: dialog Save As.
**Khi chưa save và có thay đổi**: indicator trên title bar + confirm dialog khi đóng.

## 3. Creation modes

Không dồn mọi form vào một màn hình. Dùng creation wizard hoặc tabs:

- Copy
- Idea
- Image
- Story/Script
- Product
- Template

## 4. Scene card

Mỗi scene phải hiển thị:

- Thumbnail/preview (từ file `.eigu` → thumbnails/).
- Scene number.
- Status.
- Duration.
- Provider.
- Progress (nếu đang render).
- Cost estimate.
- Error state.
- Retry button (nếu failed).

Pending không được là một ô trống. Nếu chưa render, có thể hiển thị storyboard thumbnail hoặc generated preview placeholder.

## 5. Missing assets dialog

Khi mở `.eigu` file mà external assets bị missing:

```
Dialog "Locate Missing Files"
├── File: background_4k.mp4
│   └── [Locate...] → file picker
├── File: intro_logo.png
│   └── [Locate...]
├── [Skip All] / [Cancel]
└── [Reconnect All] nếu tìm thấy folder gốc
```

Giống Premiere Pro / DaVinci Resolve.

## 6. Responsive

Không hardcode width. Dùng flex/grid/minmax và resizable containers.

## 7. States

Phải thiết kế đầy đủ:

`idle/loading/generating/queued/rendering/completed/failed/cancelled/empty`

## 8. i18n

Không viết toast text trực tiếp. Dùng translation key:

`file.new`
`file.open`
`file.save`
`file.saveAs`
`video.render.success`
`video.render.failed`
`scene.create.failed`
`project.deleted`

IPC error code ổn định; frontend map code → translation.

## 9. UX

- Skeleton loading khi mở project lớn.
- Progress bar cho render queue + ETA.
- Retry button cho failed jobs.
- Cancel button cho queued/rendering jobs.
- Preview auto-play khi chọn scene.
- Empty state khi chưa có scene nào.
- Confirmation dialog trước khi delete.
- Keyboard shortcuts.
- Accessible focus state.
- **Unsaved indicator**: dấu `●` trên title bar + "Save changes?" khi đóng.
