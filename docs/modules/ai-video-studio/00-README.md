# EIGU Platform — AI Video Module

> [!IMPORTANT]
> Mục tiêu cốt lõi: sản xuất hàng loạt (batch) 100+ video AI nhanh, ổn định. Auto-Publish, Collaboration real-time, Approval multi-user KHÔNG nằm trong phạm vi hiện tại.

## Purpose

Đây là tài liệu tổng quan của module AI Video.

## Architecture

AI Video Module không phải một tính năng "Prompt → Video".

Nó là một AI Video Production Pipeline:

Idea
→ Research
→ Story
→ Storyboard
→ Scene
→ Character
→ Prompt
→ Voice
→ Subtitle
→ Music
→ Render
→ QC
→ Export

Mỗi project là **một file `.eigu`** — portable project file (ZIP archive) chứa toàn bộ dữ liệu, assets, thumbnails và exports.

## Documentation Map

| File | Nội dung |
|---|---|
| 01-Overview.md | Tổng quan module + `.eigu` file format |
| 02-Requirements.md | Functional requirements |
| 03-Architecture.md | Kiến trúc file-based local-first |
| 04-Database.md | `.eigu` file format schema (ZIP + project.json) |
| 05-API.md | IPC channels thay REST |
| 06-UI-UX.md | Giao diện desktop (File menu, auto-save) |
| 07-Queue-System.md | In-process queue, persist trong `.eigu` |
| 08-Provider-System.md | AI Provider + encrypted API keys |
| 09-AI-Pipeline.md | Pipeline tạo video |
| 10-Character-System.md | Character consistency |
| 11-Asset-System.md | Asset management (embedded/external) |
| 12-Brand-Kit.md | Brand Kit |
| 13-Knowledge-Base-RAG.md | RAG |
| 14-AI-Director.md | AI Director |
| 15-Storyboard-Scene.md | Storyboard & Scene |
| 16-Timeline-Editor.md | Timeline |
| 17-Voice-Subtitle-Music.md | Audio |
| 18-Render-Farm.md | Render Engine |
| 19-Observability.md | Monitoring / Logs |
| 20-Cost-Management.md | Cost |
| 21-Content-Safety.md | Safety |
| 22-Auto-Publish.md | ⛔ NGOÀI PHẠM VI — không triển khai |
| 23-Collaboration.md | File sharing (`*.eigu`) |
| 24-Versioning.md | Versioning |
| 25-Approval-Workflow.md | Approval |
| 26-AB-Generation.md | A/B Testing |
| 27-Bug-Fixes.md | Bug tracking |
| 28-Testing.md | Testing |
| 29-Security.md | Security |
| 30-Roadmap.md | Roadmap |
| 31-TODO.md | Implementation TODO |
