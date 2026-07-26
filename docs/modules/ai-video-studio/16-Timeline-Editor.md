# EIGU Platform — AI Video Module

AI Video Module — Timeline Editor

## Goal

Timeline là nơi dựng video cuối cùng.

## Tracks

- Video
- Voice
- Music
- SFX
- Subtitle
- Overlay

## Data

Timeline lưu trong `project.json` → timeline.

```json
{
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
    }
  ]
}
```

## Operations

- Move
- Trim
- Split
- Duplicate
- Delete
- Insert
- Snap
- Volume
- Fade
- Transition

## Performance

Không render toàn bộ video khi chỉ chỉnh timeline. Lưu timeline state → tạo composition/render job khi user export.

## Persistence

Autosave timeline vào `project.json` mỗi 30 giây.
