# EIGU Platform — AI Video Module

AI Video Module — Asset System

## 1. Asset types

- Image (JPEG, PNG, WebP, SVG)
- Video (MP4, MOV, WebM)
- Audio (WAV, MP3, OGG, FLAC)
- Music
- Voice
- Font (TTF, OTF)
- Logo
- Intro / Outro templates
- CTA overlays
- Generated previews

## 2. Storage model

### Embedded assets (≤ 10MB)

Lưu trực tiếp trong file `.eigu` → `assets/` folder.

Phù hợp với: logo, font, small images, voice clips, short audio.

### External references (> 10MB)

Asset lưu ngoài filesystem, `.eigu` lưu đường dẫn.

Phù hợp với: video raw, nhạc dài, project templates.

Khi mở project, nếu file không tìm thấy → dialog "Locate Missing Files".

### Import flow

```
User drag file hoặc click Import
  → File dialog / drop handler
  → Nếu file ≤ 10MB: copy vào assets/ trong .eigu
  → Nếu file > 10MB: lưu đường dẫn, không copy
  → Cập nhật project.json → assets[]
  → IPC event → UI update
```

## 3. Asset metadata

```json
{
  "id": "asset_001",
  "type": "image",
  "filename": "assets/images/bg.jpg",
  "originalName": "background.jpg",
  "mimeType": "image/jpeg",
  "size": 2048576,
  "sha256": "abc123def456...",
  "width": 1920,
  "height": 1080,
  "embedded": true,
  "externalPath": null,
  "fallbackPaths": []
}
```

## 4. Requirements

- MIME validation khi import.
- Size limits: embedded max 10MB, external unlimited.
- Duplicate detection bằng SHA-256 hash.
- Thumbnail generation cho images/video.
- "Locate Missing Files" dialog cho external assets.

## 5. Smart reuse

Asset hash + generation metadata có thể được dùng để tìm asset tương đương trong cùng project và tránh import trùng.
