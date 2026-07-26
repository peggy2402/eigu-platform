# EIGU Platform — AI Video Module

AI Video Module — Observability

## Metrics

- queue depth
- queue wait time
- render time
- success rate
- failure rate
- retry count
- provider latency
- provider error rate
- storage usage (`.eigu` file size)
- cost per project / per scene

## Logs

- Log file: `userData/logs/eigu.log` (rotating, max 10MB).
- Mỗi log entry có: timestamp, level, correlationId, projectPath, sceneId, jobId.
- Không log API key hoặc sensitive payload.

## UI

- Render queue panel: progress, ETA, history.
- Project stats: total scenes rendered, total cost, total time.
- Provider health: online/offline/latency.
