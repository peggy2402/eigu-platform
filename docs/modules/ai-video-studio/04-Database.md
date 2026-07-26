# EIGU Platform — AI Video Module

AI Video Module — .eigu File Format

## 1. File structure

`.eigu` là ZIP archive với cấu trúc:

```
project.eigu
├── manifest.json
├── project.json
├── assets/
│   ├── images/
│   │   ├── img_abc123.jpg
│   │   └── img_def456.png
│   ├── audio/
│   │   ├── voice_001.wav
│   │   └── music_bg.mp3
│   └── fonts/
├── thumbnails/
│   ├── scene_01.jpg
│   └── scene_02.jpg
└── exports/
    └── final_v1.mp4
```

## 2. manifest.json

```json
{
  "formatVersion": "1.0",
  "appVersion": "1.0.0",
  "createdAt": "2026-07-25T10:00:00.000Z",
  "updatedAt": "2026-07-25T10:30:00.000Z",
  "engine": "eigu-video-engine",
  "assetCount": 5,
  "totalAssetSize": 15728640
}
```

## 3. project.json schema

### Project metadata

```json
{
  "project": {
    "name": "Quảng cáo Tết 2026",
    "description": "Video quảng cáo Tết Nguyên Đán",
    "status": "draft",
    "language": "vi",
    "category": "commercial",
    "aspectRatio": "16:9",
    "resolution": { "width": 1920, "height": 1080 },
    "fps": 30,
    "duration": 30,
    "thumbnail": "thumbnails/cover.jpg",
    "tags": ["tet", "quang-cao", "2026"],
    "createdAt": "2026-07-25T10:00:00.000Z",
    "updatedAt": "2026-07-25T10:30:00.000Z"
  }
}
```

### Scenes

```json
{
  "scenes": [
    {
      "id": "scene_001",
      "order": 1,
      "status": "completed",
      "prompt": "Một ngôi đền cổ...",
      "negativePrompt": "...",
      "duration": 5,
      "camera": { "angle": "wide", "movement": "pan_right" },
      "lens": "24mm",
      "lighting": "golden_hour",
      "emotion": "happy",
      "transition": "fade_in",
      "characterIds": ["char_001"],
      "voiceId": "voice_001",
      "subtitleTrackId": "sub_001",
      "musicTrackId": "music_001",
      "providerId": "runway",
      "model": "gen3",
      "seed": 12345,
      "thumbnail": "thumbnails/scene_001.jpg",
      "output": "exports/scene_001.mp4",
      "cost": 0.05
    }
  ]
}
```

### Storyboard

```json
{
  "storyboard": {
    "scenes": ["scene_001", "scene_002", "scene_003"],
    "transitions": [
      { "from": "scene_001", "to": "scene_002", "type": "dissolve" }
    ]
  }
}
```

### Characters

```json
{
  "characters": [
    {
      "id": "char_001",
      "name": "Ông Táo",
      "appearance": "râu dài, áo dài đỏ",
      "clothing": "áo dài truyền thống",
      "style": "hoạt hình 3D",
      "personality": "vui vẻ, hài hước",
      "voiceId": "voice_táo",
      "referenceImages": ["assets/images/ong_tao_ref.jpg"],
      "generationSettings": { "seed": 888, "model": "runway-gen3" },
      "lockedAttributes": ["face", "outfit"],
      "version": 3
    }
  ]
}
```

### Assets

```json
{
  "assets": [
    {
      "id": "asset_001",
      "type": "image",
      "filename": "assets/images/img_abc123.jpg",
      "originalName": "background.jpg",
      "mimeType": "image/jpeg",
      "size": 2048576,
      "sha256": "abc...",
      "width": 1920,
      "height": 1080,
      "embedded": true,
      "externalPath": null
    },
    {
      "id": "asset_002",
      "type": "video",
      "filename": "assets/video/bg_raw.mp4",
      "embedded": false,
      "externalPath": "/Users/user/Videos/background.mp4"
    }
  ]
}
```

### Render jobs

```json
{
  "renderQueue": {
    "jobs": [
      {
        "id": "job_001",
        "sceneId": "scene_001",
        "type": "video_render",
        "status": "completed",
        "provider": "runway",
        "model": "gen3",
        "progress": 100,
        "retryCount": 0,
        "maxRetries": 3,
        "createdAt": "...",
        "startedAt": "...",
        "completedAt": "...",
        "output": "exports/scene_001.mp4",
        "error": null,
        "cost": 0.05
      }
    ]
  }
}
```

### Full timeline

```json
{
  "timeline": {
    "tracks": [
      {
        "id": "track_video",
        "type": "video",
        "clips": [
          {
            "sceneId": "scene_001",
            "start": 0,
            "duration": 5,
            "trim": { "in": 0, "out": 5 },
            "fade": { "in": 0.5, "out": 0.5 }
          }
        ]
      },
      {
        "id": "track_audio",
        "type": "voice",
        "clips": [
          {
            "assetId": "asset_voice_001",
            "start": 0,
            "duration": 5,
            "volume": 0.8
          }
        ]
      }
    ]
  }
}
```

### Brand Kit

```json
{
  "brandKit": {
    "logo": "assets/images/logo.png",
    "colors": { "primary": "#FF0000", "secondary": "#00FF00" },
    "typography": { "font": "assets/fonts/roboto.ttf" },
    "intro": "intro_template",
    "outro": "outro_template",
    "cta": "Mua ngay!",
    "voiceId": "brand_voice",
    "visualStyle": "modern_minimal",
    "watermark": false,
    "snapshotVersion": 2
  }
}
```

### Version history

```json
{
  "versionHistory": [
    {
      "version": 1,
      "reason": "Initial creation",
      "createdAt": "...",
      "snapshotFile": null
    },
    {
      "version": 2,
      "reason": "Changed scene 1 prompt",
      "createdAt": "...",
      "snapshotFile": null
    }
  ]
}
```

## 4. External references

Asset >10MB không nhúng trong `.eigu` mà lưu đường dẫn:

```json
{
  "filename": "assets/video/large_bg.mp4",
  "embedded": false,
  "externalPath": "/Users/user/Videos/background_4k.mp4",
  "fallbackPaths": [
    "D:/Videos/background_4k.mp4",
    "./media/background_4k.mp4"
  ]
}
```

Khi mở project, nếu external path không tồn tại, UI hiển thị dialog "Locate missing file" (giống Premiere, DaVinci Resolve).

## 5. project.json constraints

| Field | Rule |
|-------|------|
| scene IDs | Unique trong project |
| scene order | Phải liên tục, không gap |
| character IDs | Unique, tham chiếu scene phải valid |
| asset IDs | Unique, tham chiếu phải valid |
| job IDs | Unique |
| project name | Unique trong thư mục chứa file |
| timeline clip duration | Không vượt quá scene duration |

## 6. ZIP ghi chú

- Dùng thư viện `archiver` (Node.js) để tạo ZIP, `unzipper` hoặc `adm-zip` để đọc.
- Nén level 6 (cân bằng speed/size).
- project.json không nén (stored) để có thể đọc nhanh mà không cần giải nén toàn bộ.
- Assets nén (deflate).
- File extension `.eigu` được đăng ký với OS để mở bằng EIGU app.
