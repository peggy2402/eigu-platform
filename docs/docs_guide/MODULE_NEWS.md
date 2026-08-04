# Feature: News Management Module — EIGU Platform (Nx Monorepo)

## Bối cảnh kỹ thuật (đọc trước khi code)

Đây là Nx Workspace gồm 3 app:
- `apps/desktop` — Electron (đã có sẵn hệ thống module, auth, IPC)
- `apps/web` (hoặc tên tương ứng) — Next.js (website public)
- `apps/api` (hoặc tên tương ứng) — NestJS (backend)

TRƯỚC KHI viết code mới, hãy:

1. Đọc cấu trúc thư mục hiện tại của cả 3 app (`nx.json`, `project.json` từng app, cấu trúc `apps/*/src`) để nắm quy ước đặt tên module, service, controller đang dùng.
2. Đọc 1 module hiện có tương tự (ví dụ module quản lý User/Product nếu có) trong cả desktop, api, web để bám theo đúng pattern code hiện tại (naming convention, cách tổ chức folder, cách gọi API, state management đang dùng ở desktop/web là gì — Redux, Zustand, React Query...).
3. Đọc hệ thống phân quyền (Role/Permission) hiện có — xác nhận cách check role Admin/Staff/User đang implement thế nào (middleware, guard, decorator ở NestJS; context/hook ở desktop và web) để tái sử dụng đúng, không viết lại hệ thống auth mới.
4. Xác nhận ORM/database đang dùng (Prisma, TypeORM...) để viết Entity/Schema đúng chuẩn.

Nếu bất kỳ điểm nào ở trên không tồn tại sẵn hoặc không rõ, hỏi tôi trước khi tự quyết định kiến trúc mới.

---

## Yêu cầu tổng thể

Xây dựng module Quản lý Tin tức (News Management) hoàn chỉnh, kiến trúc Clean Architecture, dễ mở rộng, hiệu năng tốt, chuẩn SEO, UI/UX hiện đại — trải trên cả 3 app.

---

## 1. Backend API (NestJS)

### 1.1 News Entity

Field:

```
id, title, slug, summary, content, thumbnail, gallery[], categoryId, tags[],
status, isFeatured, authorId, authorName, createdAt, updatedAt, publishedAt,
viewCount, likeCount, commentCount, readingTime, seoTitle, seoDescription,
seoKeywords, deletedAt
```

- `status`: enum (draft, published, archived)
- `deletedAt`: dùng cho soft delete
- `slug`: unique, tự sinh từ title (có xử lý trùng slug)
- `tags[]`: quan hệ many-to-many với bảng Tags riêng (không lưu string array thô)
- `categoryId`: foreign key tới bảng Category riêng

### 1.2 Ảnh dùng dạng LINK (URL) — không upload file

Toàn bộ hình ảnh trong module này (thumbnail, gallery[], ảnh trong content editor) đều lưu dưới dạng **URL string**, KHÔNG xây dựng chức năng upload file lên server/storage riêng ở giai đoạn này.

- `thumbnail`: string (URL), validate là URL hợp lệ (`@IsUrl()` hoặc regex tương đương).
- `gallery[]`: array of string URL.
- Ảnh chèn trong content editor (block "Image"/"Gallery"): lưu URL trong JSON content, không lưu file.
- KHÔNG cần thêm endpoint upload, KHÔNG cần tích hợp storage service (S3/Cloudinary...) trừ khi được yêu cầu thêm sau.
- Validation: kiểm tra link có phải định dạng ảnh hợp lệ không (đuôi file hoặc content-type) trước khi lưu, tránh user dán nhầm link không phải ảnh.
- Xử lý link ảnh die: cần có cơ chế fallback ảnh placeholder ở phía hiển thị (desktop + website), không để vỡ layout.

### 1.3 REST API — Admin/Staff (có auth, theo role)

```
GET    /news                  — list, hỗ trợ query params cho filter/sort/pagination
GET    /news/:id
POST   /news
PATCH  /news/:id
DELETE /news/:id               — soft delete
PATCH  /news/:id/publish
PATCH  /news/:id/archive
POST   /news/:id/duplicate
GET    /news/:id/preview
GET    /news/search            — search theo title/content/slug
GET    /news/filter            — filter theo category/tags/author/status/featured/date range
GET    /news/statistics
```

- Guard theo role: Admin full quyền; Staff không được xóa hệ thống phân quyền/quản trị (bám theo hệ thống Role/Permission hiện có của project, không viết middleware mới).
- Validate DTO đầy đủ (class-validator) cho từng endpoint.

### 1.4 REST API — Public (cho Website, không cần auth)

```
GET /public/news
GET /public/news/:slug
GET /public/news/related
GET /public/news/latest
GET /public/news/search
GET /public/news/categories
```

- Chỉ trả về bài `status = published`, không trả về bài draft/archived/đã xóa.
- Tăng `viewCount` khi gọi `GET /public/news/:slug` (cân nhắc debounce/cache theo IP+session để tránh spam tăng view).

### 1.5 Comment System API

```
GET    /news/:id/comments        — trả dạng cây (nested), có phân trang theo top-level comment
POST   /news/:id/comments
PATCH  /comments/:id
DELETE /comments/:id
POST   /comments/:id/reply
POST   /comments/:id/like        — mỗi user chỉ like 1 lần, có thể toggle/đổi sang dislike
POST   /comments/:id/dislike
POST   /comments/:id/report
```

- Comment hỗ trợ reply không giới hạn cấp (self-referencing relation: `parentId`).
- Optimize query lấy cây comment: tránh N+1 query (dùng recursive CTE hoặc load toàn bộ rồi build tree ở application layer, chọn cách phù hợp với ORM đang dùng).

---

## 2. Desktop Application (Electron — apps/desktop)

### 2.1 Module mới: News Management

- Chỉ hiển thị trong sidebar/menu với role **Admin** và **Staff** — ẨN hoàn toàn với role **User** (kiểm tra ở cả UI render và route guard, không chỉ ẩn UI).

### 2.2 Phân quyền trong module

| Hành động | Admin | Staff |
|---|---|---|
| Tạo/sửa/publish/draft bài | ✅ | ✅ |
| Xóa bài | ✅ | ❌ |
| Archive bài | ✅ | ❌ |
| Quản lý danh mục/tags | ✅ | ❌ |
| Quản lý bình luận (mod) | ✅ | ✅ |
| Quản lý phân quyền hệ thống | ✅ | ❌ |

### 2.3 UI danh sách — Data Table

**Cột hiển thị:** Thumbnail, Tiêu đề, Slug, Danh mục, Tags, Tác giả, Trạng thái, Featured, Lượt xem, Lượt thích, Tổng bình luận, Ngày tạo, Ngày cập nhật, Action.

**Filter:** search theo title/content/slug, category, tags, người tạo, trạng thái, featured, khoảng thời gian.

**Sort:** mới nhất, cũ nhất, nhiều view, nhiều like, nhiều comment.

**Pagination:** chuẩn (không infinite scroll ở desktop admin table).

**Action theo dòng:** Edit, Delete (nếu có quyền), Publish/Draft toggle, Archive, Duplicate, Preview.

### 2.4 Editor bài viết

Rich content editor hỗ trợ: heading (H1-H6), paragraph, quote, code block, image, gallery, video, table, bullet/ordered list, callout, divider.

- Khi thêm ảnh (thumbnail, gallery, hoặc block ảnh trong content): UI hiển thị input dạng "Dán link ảnh" (paste URL), kèm preview ảnh ngay sau khi dán link để xác nhận link hợp lệ (dùng `<img>` với `onError` fallback khi link chết).
- Không thêm nút "Upload from computer" ở giai đoạn này.
- Xác nhận thư viện editor đang dùng sẵn trong project nếu có (ví dụ TipTap/Slate) — không tự thêm thư viện mới nếu đã có sẵn công cụ tương đương.

---

## 3. Website (Next.js)

### 3.1 Trang danh sách tin tức

- Grid card: Desktop 3 card/hàng, Tablet 2 card/hàng, Mobile 1 card/hàng.
- Mỗi card: thumbnail, category, tiêu đề, mô tả ngắn, tác giả, ngày đăng, thời gian đọc, lượt xem, tổng bình luận.
- Click card → `/news/:slug`.
- Pagination hoặc infinite scroll (chọn 1, ưu tiên infinite scroll cho trải nghiệm mobile).

### 3.2 Trang chi tiết bài viết

Layout 2 cột: LEFT 70% (nội dung chính) / RIGHT 30% (sidebar).

**Left column:**
- Header: avatar tác giả, tên, ngày đăng, thời gian đọc, lượt xem, category, tags.
- Ảnh đại diện bài viết.
- Nội dung bài viết (render đúng toàn bộ block type đã định nghĩa ở trên).
- Share buttons: Facebook, X, LinkedIn, Telegram, Copy Link.
- Comment section.

**Right column (sidebar):**
- Bài viết liên quan (thumbnail, tiêu đề, ngày đăng).
- Bài viết mới nhất (thumbnail, tiêu đề, ngày đăng).

### 3.3 Render ảnh từ URL

- Render ảnh trực tiếp từ URL đã lưu (không phải file upload nội bộ).
- Nếu dùng `next/image`: cần cấu hình `images.remotePatterns` (hoặc `domains` tùy version Next.js) trong `next.config.js` để cho phép domain ảnh ngoài.
- Nếu nguồn ảnh không cố định domain (link dán từ nhiều nơi khác nhau): cân nhắc dùng `<img>` thường thay vì `next/image` để tránh phải whitelist domain liên tục.
  - Tradeoff: `next/image` tối ưu hơn (lazy-load, resize tự động) nhưng cần whitelist domain trước; `<img>` thường linh hoạt hơn nhưng mất tối ưu tự động.
- Cần fallback ảnh placeholder khi link ảnh die, tránh vỡ layout.

### 3.4 Hệ thống bình luận (Reddit-style)

- Threaded/nested/recursive comment tree, reply không giới hạn cấp — dùng recursive component.
- Mỗi comment hiển thị: avatar, tên, role badge (nếu có), thời gian, nội dung, like, dislike, reply, edit (nếu là chủ sở hữu), delete (nếu có quyền), report, copy link.
- Like/Dislike: mỗi user 1 lần mỗi loại, có thể đổi trạng thái (toggle).
- Reply: click mở input ngay dưới comment đang reply.
- Input comment: avatar, textarea auto-resize, emoji (optional), nút gửi/hủy, hỗ trợ Enter gửi / Shift+Enter xuống dòng.
- Comment dài: giới hạn hiển thị 4–6 dòng, có "Xem thêm"/"Thu gọn", xử lý `overflow-wrap: anywhere` và `word-break: break-word` để không vỡ layout với text/URL dài.
- Collapse/expand toàn bộ thread (giống Reddit).
- Update tổng số comment ngay sau khi gửi (optimistic update; realtime nếu project đã có sẵn hạ tầng websocket, không tự thêm mới nếu chưa có).

### 3.5 SEO

Mỗi bài viết cần đầy đủ: SEO title, SEO description, SEO keywords, OpenGraph tags, Twitter Card, canonical URL, JSON-LD structured data (schema.org Article).

### 3.6 Hiệu năng

- Lazy loading ảnh (`next/image` hoặc `loading="lazy"` nếu dùng `<img>`).
- SSR hoặc ISR cho trang tin tức (ưu tiên ISR với revalidate hợp lý cho bài đã publish, vì nội dung không đổi liên tục).
- Cache API response phía server nếu có Redis/cache layer sẵn trong project.
- Tối ưu Core Web Vitals (đặc biệt LCP cho ảnh thumbnail, CLS cho layout card).

---

## 4. UI/UX chung (áp dụng cả desktop admin & website)

- Style: Minimal, Professional, Dashboard-style, smooth animation, responsive, Dark/Light mode, accessibility cơ bản (WCAG).
- Bám theo design token/theme hiện có của project (đọc file theme/tailwind config hiện tại trước khi thêm màu/style mới).

---

## 5. Thứ tự triển khai đề xuất

1. Backend: Entity + Migration + DTO + Module CRUD cơ bản (chưa comment).
2. Backend: API public (đọc-only) cho website.
3. Backend: Comment system (entity + API).
4. Desktop: Module News (list + CRUD UI + phân quyền hiển thị).
5. Website: Trang danh sách + trang chi tiết (chưa comment).
6. Website: Comment system UI (recursive component) + kết nối API comment.
7. SEO + performance pass cuối cùng.

**Lưu ý thực thi:** Sau mỗi bước lớn, dừng lại để review trước khi qua bước tiếp theo — không code toàn bộ một lần rồi mới báo cáo.
