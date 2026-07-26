# EIGU Platform — AI Video Module

AI Video Module — Overview

## 1. Mục tiêu

AI Video là module Production của EIGU Platform, không phải màn hình `Prompt → Render → Download`.

Module phải hỗ trợ toàn bộ vòng đời:

`Idea → Research → Story → Storyboard → Scene → Assets → Prompt → Voice → Subtitle → Music → Render → QC → Export → Publish`

## 2. Phạm vi

- Tạo video từ ý tưởng, ảnh, nhiều ảnh, story, script, URL, PDF, product, audio, voice, template.
- Quản lý Project, Storyboard, Scene, Character, Asset, Brand Kit.
- AI Director và Prompt Builder.
- Multi-provider video generation.
- Queue, retry, priority, background worker.
- Preview và realtime render progress.
- Versioning, collaboration, approval.
- Cost guardrail, benchmark, observability.
- Auto publish qua API chính thức khi nền tảng hỗ trợ.

## 3. File Format — `.eigu`

`.eigu` là định dạng file project chuẩn của EIGU Platform, tương tự `.prproj` (Premiere Pro), `.aep` (After Effects), `.fcpxml` (Final Cut Pro).

Mỗi project là **một file `.eigu` duy nhất** — người dùng có thể lưu, copy, backup, gửi cho người khác.

### Cấu trúc file (ZIP archive)

```
project.eigu
├── manifest.json           # version, app version, created date
├── project.json            # toàn bộ dữ liệu project
├── assets/                 # media nhúng trong project
│   ├── images/
│   ├── audio/
│   └── fonts/
├── thumbnails/             # ảnh preview scene
└── exports/                # video đã render (optional)
```

**project.json** chứa toàn bộ structured data:

- project metadata (name, aspect ratio, resolution, fps, duration, ...)
- scenes (prompt, negative prompt, duration, camera, lighting, ...)
- storyboard (scene list, order, transitions)
- characters (appearance, voice, reference images, ...)
- brand kit (logo, colors, typography, ...)
- timeline (tracks, clips, trim, fade, ...)
- provider configs (provider ID, model, parameters, API key refs)
- render queue (pending, completed, failed jobs)
- version history

### External references

Asset lớn (video raw, nhạc dài, ...) có thể được reference bằng đường dẫn tuyệt đối hoặc relative thay vì nhúng trong `.eigu`.

### Design principles

- `.eigu` là ZIP archive để có thể inspect/extract thủ công.
- `project.json` dùng JSON để dễ đọc, debug, version control.
- Binary assets nhúng khi ≤ 10MB, reference đường dẫn nếu lớn hơn.
- File format version trong `manifest.json` để đảm bảo backward compatibility.
- Auto-save định kỳ ghi đè file `.eigu` hiện tại.

## 4. Storage paths

| Dữ liệu | Vị trí |
|---------|--------|
| Project files | User tự chọn (mặc định `~/Documents/eigu/`) |
| App config | `app.getPath('userData')/config.json` |
| API keys (encrypted) | `app.getPath('userData')/api_keys_secure.json` |
| Cache/thumbnails | `app.getPath('userData')/cache/` |
| Render output | `~/Downloads/eigu/outputs/<projectName>/` |
| Logs | `app.getPath('userData')/logs/` |

## 5. Quy mô mục tiêu

`.eigu` file design hỗ trợ project từ 1 scene → hàng trăm scene. Asset nhúng phải có giới hạn dung lượng, asset lớn dùng external reference.

## 6. Nguyên tắc

- Production-first.
- **File-based, local-first.** Mọi dữ liệu nằm trong file `.eigu`. Cloud là optional (sync/backup).
- Electron desktop app là first-class citizen.
- Không mock data trong production UI.
- Mọi provider phải đi qua adapter.
- Mọi job phải có trạng thái và lifecycle rõ ràng.
- Có audit, observability và recovery.
