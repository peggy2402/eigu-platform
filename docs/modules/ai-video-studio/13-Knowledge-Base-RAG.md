# EIGU Platform — AI Video Module

AI Video Module — Knowledge Base / RAG

## Sources

- PDF
- DOC/DOCX
- Website
- Product documentation
- FAQ
- Training material
- Markdown
- Text

## Pipeline

`Ingest → Parse → Chunk → Embed → Index → Retrieve → Context → Generate`

## Storage

- Documents: lưu trong `userData/knowledge/` (filesystem).
- Embeddings: local vector file (`userData/knowledge/embeddings.json` hoặc sqlite-vec).
- Index: persisted trên filesystem.
- Mỗi project có thể reference knowledge base documents.

## Requirements

- Document version.
- Source URL.
- Citation/source traceability.
- Re-index on update.
- Delete propagation.

## AI use

RAG context cung cấp dữ liệu cho Story, Script, Prompt Builder, AI Director và QC.
