# EIGU Platform — AI Video Module

AI Video Module — API / IPC

## 1. Transport

Giao tiếp giữa Renderer (UI) và Main Process qua **Electron IPC (contextBridge)**.

Renderer gọi:
```js
window.eiguAPI.invoke('channel', payload)  // request → response
window.eiguAPI.on('event', callback)        // main → renderer push events
```

## 2. IPC channels

### File management
- `project:new` → tạo `.eigu` file mới, trả về project handle
- `project:open` → mở file picker, đọc `.eigu`, trả về project data
- `project:openPath` → mở `.eigu` từ đường dẫn cụ thể
- `project:save` → ghi đè `.eigu` hiện tại
- `project:saveAs` → Save As dialog
- `project:export` → export video / template

### Project CRUD
- `project:get` → lấy project data hiện tại
- `project:update` → cập nhật project metadata (name, desc, ...)
- `project:delete` → archive project
- `project:restore` → unarchive project
- `project:recent` → lấy danh sách recent projects

### Scene
- `scene:create` → thêm scene mới vào project
- `scene:update` → cập nhật scene data
- `scene:delete` → xóa scene
- `scene:reorder` → sắp xếp lại thứ tự scenes
- `scene:duplicate` → nhân bản scene
- `scene:get` → lấy scene detail

### Storyboard
- `storyboard:generate` → AI generate storyboard từ input
- `storyboard:update` → cập nhật storyboard

### Character
- `character:create` → tạo character mới
- `character:update` → cập nhật character
- `character:delete` → xóa character
- `character:list` → danh sách character của project

### Asset
- `asset:import` → import file vào project (copy vào .eigu hoặc reference)
- `asset:remove` → xóa asset khỏi project
- `asset:list` → danh sách assets
- `asset:locateMissing` → dialog tìm file external bị missing

### Render
- `scene:render` → enqueue render job cho scene
- `project:render` → enqueue render tất cả scenes
- `render:cancel` → cancel job
- `render:retry` → retry job failed
- `render:queue` → lấy trạng thái queue hiện tại

### Provider
- `provider:list` → danh sách providers khả dụng
- `provider:health` → kiểm tra health của provider
- `provider:configure` → cấu hình API key cho provider

### Timeline
- `timeline:get` → lấy timeline data
- `timeline:update` → cập nhật timeline (tracks, clips)
- `timeline:preview` → generate preview segment

### Voice / Subtitle / Music
- `voice:generate` → AI generate voice từ text
- `voice:list` → voice library
- `subtitle:generate` → ASR generate subtitle
- `subtitle:update` → edit subtitle
- `music:select` → chọn AI music / import music

### Brand Kit
- `brandKit:get` → lấy brand kit
- `brandKit:update` → cập nhật brand kit
- `brandKit:snapshot` → tạo snapshot

### Version
- `version:list` → lịch sử versions
- `version:restore` → restore version cũ
- `version:diff` → so sánh 2 versions

### Knowledge / RAG
- `kb:ingest` → ingest document
- `kb:search` → search knowledge base

## 3. Events (Main → Renderer)

- `project:loaded` — project vừa được load
- `project:saved` — project vừa được save
- `project:autoSave` — auto-save hoàn tất
- `scene:updated` — scene data thay đổi
- `job:queued`
- `job:started`
- `job:progress` — { jobId, percent, eta }
- `job:completed`
- `job:failed`
- `provider:statusChanged` — provider online/offline

## 4. IPC request/response contract

### Request
```js
{
  channel: 'scene:create',
  payload: {
    projectPath: '/path/to/project.eigu',
    scene: { prompt: '...', duration: 5, ... }
  }
}
```

### Response success
```js
{
  success: true,
  data: { sceneId: 'scene_002', ... }
}
```

### Response error
```js
{
  success: false,
  error: {
    code: 'SCENE_CREATE_FAILED',
    message: 'Failed to create scene',
    details: '...'
  }
}
```

Error code ổn định để frontend map i18n:

`PROJECT_NOT_FOUND`
`PROJECT_NAME_CONFLICT`
`SCENE_CREATE_FAILED`
`RENDER_SUBMIT_FAILED`
`PROVIDER_NOT_FOUND`
`PROVIDER_UNAVAILABLE`
`ASSET_NOT_FOUND`
`ASSET_MISSING_EXTERNAL`
