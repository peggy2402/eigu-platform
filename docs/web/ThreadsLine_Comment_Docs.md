# HỆ THỐNG ĐƯỜNG NỐI BÌNH LUẬN (COMMENT THREAD LINE) - ĐẶC TẢ KIẾN TRÚC & HƯỚNG DẪN KỸ THUẬT

> **Tài liệu chính thức dành cho EIGU Platform**  
> **Đường dẫn file:** `docs/web/ThreadsLine_Comment_Docs.md`  
> **Phiên bản kiến trúc:** v3.0 (Measured SVG Overlay Architecture)  
> **Cập nhật lần cuối:** 07/08/2026  

---

## 1. TỔNG QUAN & NGUYÊN TẮC CỐT LÕI (CORE PRINCIPLES)

Hệ thống cây bình luận (Comment Tree) của EIGU Platform áp dụng nguyên tắc kiến trúc **"Correct by Construction" (Đúng nhờ cấu trúc đo đạc)**.

### Triết lý thiết kế:
1. **Không đoán nhận kích thước CSS:** Hoàn toàn **KHÔNG** dùng các số pixel đoán mò (như `top: 15px`, `bottom: -16px`), **KHÔNG** dùng `border-left` giả lập trên các thẻ `div` lồng nhau.
2. **Loại bỏ đứt đoạn line do Margin/Padding:** Mọi đường nối thread được vẽ tập trung trong một **Lớp phủ SVG duy nhất (`Measured SVG Overlay`)** dựa trên **tọa độ DOM thực tế** của các Avatar.
3. **Độ chính xác tuyệt đối 100%:** Dù nội dung comment co giãn, người dùng mở Form Trả lời, bấm "Xem thêm", hay Resize màn hình, các đường line SVG sẽ tự động re-route chính xác vào tâm Avatar mà không bao giờ bị đứt đoạn hay lệch sub-pixel.

---

## 2. NGUYÊN NHÂN CÁC LỖI TRONG QUÁ KHỨ (ANTIPATTERNS TO AVOID)

Để tránh lặp lại các sự cố kỹ thuật trong tương lai, mọi lập trình viên **TUYỆT ĐỐI KHÔNG** quay lại các cách làm sau:

| Antipattern (Cách làm sai) | Hậu quả gây ra | Lý do thất bại |
|---|---|---|
| **1. Dùng `border-left` trên thẻ `div` đệ quy lồng nhau** | Line đâm xuyên qua các nhánh sibling bên dưới | Khối `div` cha tự co giãn chiều cao theo nội dung con, kéo theo `border-left` bị co giãn ngoài kiểm soát. |
| **2. Ghép nhiều đoạn line `div` tuyệt đối ở từng Row** | Xuất hiện khe hở 16px giữa các dòng comment (Dashed/Broken line) | Thẻ Row có `marginBottom: 16px`. Các đoạn `div` ngắn ở từng row chỉ phủ từ `top: 0` đến `bottom: 0` của chính row đó, để hở 16px khoảng trống margin ngoài box. |
| **3. Áp dụng `<motion.div layout>` lên cả đường nối** | Đường line bị ngợn sóng, răng cưa (Wavy/Jagged line) | Framer Motion áp dụng inline CSS `transform: translate3d(...)` sub-pixel khác nhau giữa các dòng khi layout shift, làm lệch các đoạn line 2px xếp chồng. |
| **4. Hardcode số pixel center avatar** | Line lệch khỏi tâm Avatar trên các màn hình/browser khác nhau | Trình duyệt làm tròn sub-pixel khác nhau khi font load hoặc zoom màn hình. |

---

## 3. CẤU TRÚC THỜI GIAN THỰC (COMPONENT HIERARCHY & ARCHITECTURE)

```
[NewsCommentSection.tsx]
   │
   └── [CommentTree.tsx]  <--- (Container `position: relative`)
          ├── <svg> Measured Overlay Layer </svg>  (z-index: 0, inset: 0, pointer-events: none)
          │      └── <path d="..." /> (Các đường uốn cong đo tọa độ chuẩn)
          │
          └── <div className="comment-flat-list"> (z-index: 1)
                 ├── [CommentRow] (Node 1)
                 │      ├── [TreeGutter] (Chỉ làm nhiệm vụ thụt lề: width = depth * 36px)
                 │      └── <motion.div> (Fade enter/exit content)
                 │             ├── [CommentAvatar] (Gắn `data-avatar-id={comment.id}`)
                 │             └── [CommentBody] (Tên, Badges, Text, Actions, Form)
                 ├── [CommentRow] (Node 2)
                 └── ...
```

---

## 4. THUẬT TOÁN ĐO TỌA ĐỘ VÀ VẼ ĐƯỜNG NỐI SVG (SVG PATH MATHEMATICS)

### Bước 1: Flattening dữ liệu cây (DFS 1D Array)
Trong `useFlattenTree.ts`, cây đệ quy được biến đổi thành Mảng 1D phẳng. Mỗi phần tử `FlatCommentNode` lưu giữ thông tin `comment`, `depth`, `isLastSibling`, `ancestorHasNextSibling`.

### Bước 2: Định vị Avatar trong DOM
Trong `CommentAvatar.tsx`, thẻ container Avatar bắt buộc phải mang thuộc tính định danh:
```tsx
<div data-avatar-id={commentId} style={{ width: avatarSize, height: avatarSize, ... }}>
```

### Bước 3: Thuật toán đo vị trí tương quan
Trong `CommentTree.tsx`, hàm `recomputePaths()` đo tọa độ tâm Avatar cha `(x1, y1)` và vị trí mép trái tâm Avatar con `(x2, y2)` so với container SVG:

```ts
const parentRect = parentEl.getBoundingClientRect();
const childRect = childEl.getBoundingClientRect();
const containerRect = containerEl.getBoundingClientRect();

// Tọa độ tâm Avatar cha
const x1 = parentRect.left - containerRect.left + parentRect.width / 2;
const y1 = parentRect.top - containerRect.top + parentRect.height / 2;

// Tọa độ mép trái tâm Avatar con
const x2 = childRect.left - containerRect.left;
const y2 = childRect.top - containerRect.top + childRect.height / 2;
```

### Bước 4: Công thức công bezier góc uốn 90°
Đường path SVG uốn góc vuông mềm mại (bán kính góc `r = 12px`):
```ts
if (x2 > x1 && y2 > y1) {
  const radius = Math.min(12, Math.abs(y2 - y1) / 2, Math.abs(x2 - x1) / 2);
  const pathD = `M ${x1},${y1} V ${y2 - radius} Q ${x1},${y2} ${x1 + radius},${y2} H ${x2}`;
  paths.push(pathD);
}
```

* **`M ${x1},${y1}`**: Bắt đầu từ tâm Avatar cha.
* **`V ${y2 - radius}`**: Đi thẳng đứng xuống dường như chạm góc rẽ.
* **`Q ${x1},${y2} ${x1 + radius},${y2}`**: Lướt uốn cong 90 độ mềm mại qua điểm điều khiển.
* **`H ${x2}`**: Đi ngang đâm chuẩn xác vào lề trái Avatar con.

---

## 5. CƠ CHẾ TỰ ĐỘNG CẬP NHẬT KHI THAY ĐỔI GIAO DIỆN (DYNAMIC RE-ROUTING)

Để đảm bảo đường line không bị đứt hay chệch khi có tương tác người dùng:

1. **`useLayoutEffect`**: Tái tính toán ngay trước khi trình duyệt Repaint mỗi khi danh sách `flatNodes` hoặc trạng thái reply thay đổi.
2. **`ResizeObserver`**: Theo dõi biến động kích thước của toàn bộ `comment-tree-container` và từng thẻ `.comment-thread-item`. Khi người dùng:
   - Mở/đóng Form trả lời (Reply Form).
   - Nhấn "Xem thêm" văn bản dài.
   - Resize cửa sổ trình duyệt.
   - Thu gọn / Mở rộng sub-thread (Collapse / Expand).  
   `ResizeObserver` lập tức kích hoạt `recomputePaths()`, làm đường SVG **tự động co giãn re-route ngay trong thời gian thực**.
3. **`pointer-events: none`**: Thẻ `<svg>` có `pointer-events: none`, đảm bảo không cản trở bất kỳ thao tác click/hover nào vào nội dung bình luận.

---

## 6. DANH SÁCH COMPONENT & QUY ĐỊNH CHÚ Ý (DEV CHECKLIST)

### File quy định:
- **`apps/web/src/components/news/CommentTree/TreeTypes.ts`**: Lưu giữ các hằng số `COLUMN_WIDTH = 36`, `LINE_WIDTH = 2`, `LINE_COLOR = 'rgba(255, 255, 255, 0.25)'`.
- **`apps/web/src/components/news/CommentTree/TreeGutter.tsx`**: Chỉ giữ nhiệm vụ tạo khoảng thụt lề (`width: depth * COLUMN_WIDTH`). **KHÔNG THÊM BẤT KỲ ĐƯỜNG KẺ CSS NÀO VÀO FILE NÀY**.
- **`apps/web/src/components/news/CommentTree/CommentAvatar.tsx`**: Phải luôn duy trì `data-avatar-id={commentId}`.
- **`apps/web/src/components/news/CommentTree/CommentRow.tsx`**: Thẻ wrapper ngoài cùng phải là `div` tĩnh. Chỉ áp dụng animation cho phần content bên trong.
- **`apps/web/src/components/news/CommentTree/CommentTree.tsx`**: Chịu trách nhiệm quản lý thẻ `<svg>` overlay và `ResizeObserver`.

---

## 7. QUY TRÌNH KIỂM THỬ KHI CÓ THAY ĐỔI (TESTING GUIDELINES)

Mọi thay đổi liên quan đến UI Comment Tree trong tương lai cần vượt qua 3 bài test:

1. **Test Mở Form Trả Lời:** Click "Trả lời" ở comment giữa cây. Xác nhận đường line nối xuống các comment phía dưới tự rẽ nhánh mở rộng ra, không bị đứt đoạn.
2. **Test Responsive Resize:** Co giãn độ rộng màn hình từ Desktop xuống Mobile. Xác nhận các đường line SVG bám dính 100% vào tâm Avatar.
3. **Test Collapse / Expand:** Thu gọn và mở lại danh sách phản hồi. Xác nhận đường line xuất hiện/mất đi mượt mà không để lại vết sẹo CSS.
