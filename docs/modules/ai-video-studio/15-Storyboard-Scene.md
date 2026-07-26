# EIGU Platform — AI Video Module

AI Video Module — Storyboard & Scene

## Storyboard

Storyboard là structured plan trước render. Lưu trong `project.json` → storyboard.

Mỗi storyboard gồm scene list, order, transitions, estimated duration, visual references.

## Scene

Scene lưu trong `project.json` → scenes[].

Scene states:

`DRAFT → READY → QUEUED → RENDERING → COMPLETED`

Error: `RENDERING → FAILED`

## Scene preview

- Thumbnail: lưu trong `.eigu` → `thumbnails/`.
- Generated image preview: lưu trong `.eigu` → `exports/` hoặc `thumbnails/`.
- Video preview sau render: lưu trong `.eigu` → `exports/`.

## Operations

- Add
- Edit
- Duplicate
- Delete
- Reorder
- Split
- Merge
- Regenerate
- Render

## Dependencies

Scene có thể phụ thuộc Character, Asset, Voice, Music hoặc scene trước đó. Dependency lưu trong scene.characterIds, scene.voiceId, ...
