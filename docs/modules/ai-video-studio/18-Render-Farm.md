# EIGU Platform — AI Video Module

AI Video Module — Render Engine

## Goal

Xử lý render job local trên máy người dùng.

## Components

- **Queue** (in-process, persisted trong `.eigu` project.json)
- **Worker** (chạy trong Main Process, có thể tách worker thread)
- **Provider adapter** (HTTP → AI API)
- **FFmpeg** (composition, encoding, subtitle burn-in)
- **File system** (output lưu vào `.eigu` → exports/ hoặc `~/Downloads/eigu/`)

## Flow

```
User click "Render Scene"
  → enqueue job (lưu vào project.json)
  → Worker: ProviderAdapter.generate(request)
    → Poll job status (nếu async)
    → Download output
  → FFmpeg composition (nếu multi-scene)
  → Lưu output vào exports/
  → Update project.json (job status, output path)
  → IPC event → UI update
```

## Concurrency

- Mặc định 2 job đồng thời.
- Configurable trong app settings.
- Giới hạn bởi CPU/RAM/GPU.

## Failover

- Job persisted trong `.eigu` → recover sau restart.
- Provider failure → retry (max 3 lần).
- Worker crash → job reset về QUEUED khi app restart.

## Output

- Scene render: `.eigu` → `exports/scene_{id}.mp4`
- Full project render: `.eigu` → `exports/final.mp4` + user chọn đường dẫn export riêng nếu muốn.
