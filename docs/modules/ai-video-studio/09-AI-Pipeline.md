# EIGU Platform — AI Video Module

AI Video Module — AI Pipeline

## Pipeline

`Input → Research → Story → Director Plan → Storyboard → Scene Prompts → Assets → Generation → Composition → QC → Export`

## Input normalization

Mọi creation mode phải chuyển về một canonical project specification và lưu vào `project.json`.

## AI Director output

AI Director không render trực tiếp. Nó tạo structured plan:

- story beats
- scene count
- shot type
- camera
- pacing
- transition
- visual style
- character requirements
- audio requirements

Kết quả lưu vào `project.json` → storyboard.

## Determinism

Lưu prompt version, model, parameters, seed, input asset IDs trong `project.json` → scenes[]. Đảm bảo tái tạo được kết quả.

## Regeneration

Cho phép regenerate một scene mà không phải render lại toàn project (chỉ cần cập nhật scene đó trong `project.json`).

## Quality gates

Trước render:

- Missing provider?
- Missing asset? (kiểm tra trong `.eigu` assets/ + external paths)
- Invalid duration?
- Invalid aspect ratio?
- Content safety failure?
- Insufficient budget/credits?
