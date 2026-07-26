# EIGU Platform — AI Video Module

AI Video Module — Provider System

## 1. Goal

Cho phép tích hợp nhiều AI provider mà không làm thay đổi business logic.

Provider/model bao gồm Gemini, OpenAI, Veo, Fal.ai, Kling, Runway, Pika, PixVerse, Luma, Hailuo, Wan.

## 2. Ownership Model & SaaS Architecture (No BYOK)

- **Platform Ownership**: Nền tảng sở hữu và quản lý tập trung toàn bộ API key provider trên Backend (`apps/api`).
- **No BYOK**: Khách hàng KHÔNG cấu hình key riêng. Màn hình quản lý key chỉ dành riêng cho tài khoản Admin trên Server.
- **Credit Deduction**: Chi phí sử dụng được quy đổi và trừ trực tiếp vào số dư Credit (`creditBalance`) của tài khoản khách hàng khi render job thành công.

## 3. Adapter

Business layer gọi interface `VideoGenerationProvider`.

Provider adapter chịu trách nhiệm mapping request/response riêng của từng API phía Server Backend.

## 4. Provider metadata

- id
- key/name
- model
- capability
- resolution
- duration
- aspect ratio
- creditCost
- latency
- health
- rate limit
- availability

## 5. API key storage & Security

API Keys được lưu trữ duy nhất trên Backend Server (trong Vault / Encrypted Database / Environment Variables), tuyệt đối không lưu hay lộ xuống máy khách hàng dưới bất kỳ hình thức nào.
