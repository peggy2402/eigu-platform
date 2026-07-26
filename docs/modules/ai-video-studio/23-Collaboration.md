# EIGU Platform — AI Video Module

> [!NOTE]
> Chỉ cần cơ chế chia sẻ file .eigu đơn giản (đã có). KHÔNG cần real-time collaboration/cloud sync trong giai đoạn này.

AI Video Module — Collaboration

## Local model (hiện tại)

- Collaboration = chia sẻ file `.eigu`.
- User A gửi file `.eigu` cho User B.
- User B mở file (cần locate missing assets).
- Comments lưu trong `project.json` → comments[].

## Future cloud model

- API server + PostgreSQL.
- Real-time collaboration qua WebSocket.
- RBAC, workspace, permission.

## Concurrency (local)

Last-write-wins. File `.eigu` nào được save sau cùng là hợp lệ.
