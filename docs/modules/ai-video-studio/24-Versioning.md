# EIGU Platform — AI Video Module

AI Video Module — Versioning

## Versioned resources

- Prompt
- Story
- Storyboard
- Scene
- Character
- Timeline
- Brand Kit

## Version data

Lưu trong `project.json` → versionHistory[]:

```json
{
  "version": 3,
  "reason": "Changed scene 2 prompt",
  "createdAt": "...",
  "snapshotFile": null
}
```

Snapshot: có thể lưu full project.json snapshot hoặc diff.

## Operations

- View history (list versions từ project.json)
- Restore (load snapshot của version cũ)
- Compare (diff 2 versions)

Rollback không được xóa lịch sử.
