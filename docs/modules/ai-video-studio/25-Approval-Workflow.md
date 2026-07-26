# EIGU Platform — AI Video Module

> [!NOTE]
> Approval multi-user routing KHÔNG cần thiết ở giai đoạn này — dùng self-review đơn giản (status draft/ready) là đủ.

AI Video Module — Approval Workflow

## States

`DRAFT → REVIEW → APPROVED → PUBLISHED`

Ngoài ra: REJECTED, CHANGES_REQUESTED, ARCHIVED

## Data

Status lưu trong `project.json` → project.status.
Approval history lưu trong `project.json` → approvalHistory[].

## Local mode

Approval là self-review hoặc manual flag. Không có multi-user routing.

## Publish gate

Không publish nếu status chưa phải APPROVED.
