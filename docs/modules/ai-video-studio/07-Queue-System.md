# EIGU Platform — AI Video Module

AI Video Module — Queue System

## 1. Stack

- **In-process queue** (chạy trong Electron Main Process).
- Dùng `p-queue` hoặc BullMQ worker embedded (no Redis).
- Queue state lưu trong memory + persist qua project.json trong `.eigu`.

## 2. Job types

- STORY_GENERATION
- STORYBOARD_GENERATION
- SCENE_GENERATION
- IMAGE_GENERATION
- VIDEO_RENDER
- VOICE_GENERATION
- SUBTITLE_GENERATION
- COMPOSITION
- QUALITY_CHECK
- PUBLISH

## 3. Lifecycle

`CREATED → QUEUED → PROCESSING → COMPLETED`

Failure:

`PROCESSING → RETRYING → FAILED`

Cancellation:

`QUEUED/PROCESSING → CANCEL_REQUESTED → CANCELLED`

## 4. Requirements

- Idempotency.
- Priority.
- Concurrency limits.
- Retry/backoff (max 3 retries).
- Timeout (30 phút mỗi job).
- Dependency graph (scene B cần scene A render xong).
- Dead-letter queue (failed sau 3 lần -> DLQ).
- Job progress (0-100%).
- Job metadata (provider, model, cost...).
- Recovery sau app restart (đọc từ project.json trong `.eigu`).

## 5. Persistence

- Jobs được lưu trong `project.json` → renderQueue.jobs[].
- Khi app start, job `PROCESSING` được reset về `QUEUED` để retry.
- Queue rebuild từ project.json.
- Không cần external Redis.

## 6. Concurrency

Mặc định chạy **2 job đồng thời** (có thể config).

Provider rate limit: queue tự điều chỉnh nếu provider trả về rate limit error.

## 7. Batch

Batch 1,000+ videos không được tạo 1,000 IPC requests đồng thời. Tạo batch manifest trong project.json rồi enqueue có kiểm soát.

## 8. UI

Queue panel hiển thị:

- waiting (số lượng)
- active (job hiện tại + progress)
- completed
- failed (có retry button)
- cancelled
