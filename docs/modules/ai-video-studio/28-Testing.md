# EIGU Platform — AI Video Module

AI Video Module — Testing

## Unit

Test domain rules:

- project naming (file `.eigu` already exists)
- provider selection
- cost guardrail
- state transitions
- versioning
- `.eigu` file read/write (ZIP integrity)
- `project.json` schema validation
- asset embed vs reference logic

## Integration

- `EiguFileReader` / `EiguFileWriter` (ZIP create, extract, parse)
- provider adapter (HTTP → AI API)
- queue (enqueue, process, complete, fail, retry)
- worker thread
- FFmpeg composition
- IPC handlers (request → response round-trip)
- encrypted API key storage (safeStorage)

## E2E

Critical path:

`New Project → Save .eigu → Open .eigu → Add Scene → Render → Export → Reopen`

Test missing assets dialog:

`Create project with external asset → Move asset file → Open project → Locate dialog → Reconnect`

## Regression

Test every previously fixed bug.

## Load

Test với project có 50+ scenes, 100+ assets. Measure:

- `.eigu` file open time
- `.eigu` file save time
- memory usage
- queue behavior với batch lớn

## Failure tests

- provider unavailable
- network timeout
- file write permission denied
- `.eigu` file corrupted (ZIP error handling)
- external asset missing
- worker crash
- malformed provider response
- insufficient credits
- duplicate request

## Frontend

Kiểm tra File menu, shortcut, resize, empty/loading/error states, keyboard interaction, i18n, auto-save indicator.
