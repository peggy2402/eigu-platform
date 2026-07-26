# EIGU Platform — AI Video Module

AI Video Module — A/B Generation

## Goal

Tạo nhiều biến thể trong cùng một project `.eigu`:

- title
- hook
- script
- thumbnail
- voice
- scene pacing
- video

## Storage

Biến thể lưu trong `project.json` → dưới dạng variant scenes hoặc variant projects.

Mỗi variant có:

- variantId
- hypothesis
- configuration (prompt, model, seed khác)
- output (path trong exports/)
- metrics

## Cost

Hiển thị estimated cost trước khi enqueue batch.
