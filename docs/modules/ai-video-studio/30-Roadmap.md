# EIGU Platform — AI Video Module

AI Video Module — Roadmap

## Phase 0 — Local Foundation (NOW)

- [ ] .eigu file format (ZIP + project.json schema)
- [ ] EiguFileReader / EiguFileWriter
- [ ] File management (New, Open, Save, Save As, Recent)
- [ ] IPC handlers for project CRUD
- [ ] IPC handlers for scene CRUD
- [ ] Scene render queue (in-process)
- [ ] Provider adapter (Runway, Kling, ...)
- [ ] API key encrypted storage
- [ ] Auto-save 30s
- [ ] Missing assets dialog
- [ ] Scene thumbnail generation
- [ ] FFmpeg composition
- [ ] Export video

## Phase 1 — Stable Core

- [ ] Storyboard generation
- [ ] Scene regeneration
- [ ] Scene preview
- [ ] Provider health
- [ ] Cost estimate
- [ ] Error handling + i18n
- [ ] Responsive UI
- [ ] Keyboard shortcuts

## Phase 2 — Production Studio

- [ ] Timeline editor
- [ ] Character library
- [ ] Asset library
- [ ] Voice / Subtitle / Music
- [ ] Brand Kit
- [ ] Version history

## Phase 3 — AI Intelligence

- [ ] AI Director
- [ ] Prompt Builder
- [ ] RAG (Knowledge Base)
- [ ] Quality Check

## Phase 4 — Scale

- [ ] Batch generation
- [ ] A/B generation
- [ ] Provider benchmark
- [ ] Cost guardrails

## Phase 4.5 — Batch Production at Scale (ƯU TIÊN CAO NHẤT)

- [ ] Batch submit 100+ scenes cùng lúc không nghẽn IPC
- [ ] Concurrency control thông minh (điều chỉnh theo provider rate limit)
- [ ] Dashboard theo dõi tiến độ batch lớn (real-time progress, ETA)
- [ ] Resume batch sau khi app crash/restart
- [ ] Cost tracking tổng cho toàn batch trước khi enqueue
- [ ] Error isolation: 1 scene lỗi không làm dừng cả batch
- [ ] Export hàng loạt sau khi hoàn tất

## Phase 5 — Enterprise & Reliability

- [ ] Advanced observability
- [ ] FinOps
- [ ] Audit/compliance
- [ ] High availability
