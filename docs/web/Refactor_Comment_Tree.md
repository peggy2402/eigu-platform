# BÁO CÁO NGHIÊN CỨU KIẾN TRÚC COMMENT TREE & TREE-VIEW CHUẨN ENTERPRISE

> **Ngày thực hiện:** 06/08/2026  
> **Dự án:** EIGU Platform (`apps/web`)  
> **Tài liệu mục tiêu:** `docs/web/Refactor_Comment_Tree.md`

---

## I. THAM KHẢO & PHÂN TÍCH CÁC THƯ VIỆN OPEN-SOURCE HÀNG ĐẦU

### 1. VSCode Core Tree System (`abstractTree.ts` / `asyncDataTree.ts`)
- **Nguồn tham chiếu:** [microsoft/vscode (GitHub)](https://github.com/microsoft/vscode/tree/main/src/vs/base/browser/ui/tree)
- **Cấu trúc thực tế:** VSCode **không bao giờ** dùng cấu trúc DOM lồng đệ quy dạng `<div><div><div>...</div></div></div>`.
- **Cách hoạt động:**
  - Cây được **Flatten (làm phẳng)** thành một mảng 1 chiều chứa danh sách các Node đang hiển thị (`FlatNode[]`).
  - Mỗi Node chứa metadata: `{ element, depth, isLastChild, indentGuides: boolean[] }`.
  - Mọi dòng (Row) nằm cùng một cấp độ DOM phẳng (`<div class="monaco-list-row">`).
  - Đường line nối (Indent Guide) được vẽ bằng mảng các thẻ `<span>` nhỏ cố định độ rộng `16px` ở đầu mỗi Row.
- **Áp dụng cho EIGU:** **100% ÁP DỤNG**. Kiến trúc làm phẳng cây (Flattened Tree) giúp loại bỏ tận gốc lỗi đè height và đâm xuyên nhánh của DOM lồng nhau.

---

### 2. Thư Viện React Arborist (`react-arborist`)
- **Nguồn tham chiếu:** [brimdata/react-arborist (GitHub)](https://github.com/brimdata/react-arborist)
- **Cấu trúc thực tế:** Thư viện Tree View phổ biến nhất cho React (dùng trong các ứng dụng quản lý file & comment tree complex).
- **Cách hoạt động:**
  - Dùng thuật toán DFS làm phẳng Tree thành Mảng 1D.
  - Tích hợp Virtual List (`react-window`) để chỉ render các dòng đang nằm trong Viewport.
  - Vị trí Indent được tính bằng công thức toán học đơn giản: `style={{ paddingLeft: node.level * indentSize }}`.
- **Áp dụng cho EIGU:** Mẫu thiết kế phân tách giữa **State Cây (Tree Model)** và **View Dòng Phẳng (Flat Row View)**.

---

### 3. Atlassian UI Tree (`@atlaskit/tree`) & Radix UI
- **Nguồn tham chiếu:** [atlassian/atlaskit-mk-2](https://bitbucket.org/atlassian/atlaskit-mk-2)
- **Cấu trúc thực tế:** Lưu dữ liệu dưới dạng Normalized State Map (`items: { [id]: { id, children: [] } }`).
- **Cách hoạt động:** Mọi thao tác Collapse/Expand chỉ là cập nhật danh sách `expandedIds` dạng Set/Array, không đụng đến DOM tree.

---

## II. ĐÁP ỨNG CHÍNH XÁC 10 CÂU HỎI KIẾN TRÚC

### 1. Các hệ thống lớn có dùng `border-left` để tạo tree không?
- **Trả lời:** **KHÔNG**. Dùng `border-left` trên các thẻ `div` lồng đệ quy là nguyên nhân chính gây ra lỗi kéo xuyên nhánh (bleeding). Khi nội dung comment con dài ra, thẻ `div` cha tự co giãn height, kéo theo `border-left` đâm xuyên qua các nhánh sibling bên dưới.
- Các hệ thống lớn dùng **mảng các cột Indent Gutter cố định theo Row** hoặc **Pseudo-element (`::before`) có height cố định bằng đúng hàng đó**.

### 2. Connector được render ở đâu?
- **Trả lời:** Connector được render **nằm hoàn toàn bên trong cột Gutter bên trái của từng Row đơn lẻ**. Nó KHÔNG bao bọc các comment con (Replies).

### 3. Connector có thuộc từng node không hay là layer độc lập?
- **Trả lời:** Với Flat Tree (VSCode / Reddit), Connector thuộc về **khung lề trái (Left Gutter) của chính Node/Row đó**. Nó độc lập hoàn toàn với các Row khác.

### 4. Layout được quyết định bởi gì?
- **Trả lời:** Dùng **Flexbox 2 cột** hoặc **CSS Grid 3 cột** (`[Indent Gutter | Avatar Column | Content Column]`) trên mỗi Row phẳng.

### 5. Indent được tính như thế nào?
- **Trả lời:** Công thức chuẩn toán học: `indentWidth = depth * INDENT_STEP` (với `INDENT_STEP` cố định, ví dụ `24px` hoặc `32px`). Hoàn toàn không phụ thuộc vào kích thước biến đổi của Avatar hay Text.

### 6. Avatar có nằm trong Grid/Flex không?
- **Trả lời:** Avatar là một Flex Item cố định kích thước (`flex-shrink: 0`, `width: 36px` / `28px`) nằm ở Cột 2 của Row.

### 7. CommentBody có width thế nào?
- **Trả lời:** `flex: 1` với `min-width: 0` để tự co giãn an toàn và xử lý xuống hàng/break-word chuẩn xác.

### 8. Reply được render như thế nào?
- **Trả lời:** 
  - *Sai (Naive Recursive):* `<CommentNode><Content /><RepliesContainer><CommentNode /></RepliesContainer></CommentNode>` -> Gây lồng DOM sâu và lỗi inherited height.
  - *Đúng (Enterprise Flat List):* Các reply chỉ đơn giản là các **Row tiếp theo trong Mảng 1D**, có `depth = parent.depth + 1`.

### 9. Các hệ thống lớn có render Recursive Component không?
- **Trả lời:** **KHÔNG**. Hệ thống lớn (Reddit, VSCode, Discord) sẽ **Flatten (làm phẳng)** cây dữ liệu thành danh sách Mảng 1D DFS (`FlatNode[]`) rồi dùng `.map()` để render danh sách phẳng.

### 10. Tree Line được tính như thế nào?
- **Trả lời:** Trong thuật toán Flattening DFS, mỗi `FlatNode` tự động tính sẵn một mảng boolean `ancestorHasNextSibling: boolean[]` độ dài đúng bằng `depth`.
  - Nếu `ancestorHasNextSibling[i] === true`: Render 1 đoạn line dọc `│` ở cột `i`.
  - Nếu `ancestorHasNextSibling[i] === false`: Render khoảng trắng (Space) ở cột `i`.

---

## III. PHÂN TÍCH 3 PHƯƠNG ÁN KIẾN TRÚC THIẾT KẾ NEW

### Phương án A: Recursive CSS Grid (Tối ưu hóa Cây Đệ Quy)
- **Mô tả:** Giữ nguyên dữ liệu cây đệ quy nhưng chuẩn hóa Layout bằng CSS Grid 3 cột cho từng Row.
- **Ưu điểm:** Dễ hiểu với người mới, JSX nhìn giống cấu trúc Cây.
- **Nhược điểm:** DOM bị lồng sâu (`<div>` trong `<div>`), vẫn dễ bị lỗi inherited height khi co giãn văn bản.
- **Khả năng mở rộng:** Tối đa ~50-100 comment.

---

### Phương án B: SVG Overlay Layer (Vẽ Đường Bằng SVG Toàn Cục)
- **Mô tả:** Render danh sách comment phẳng không có đường kẻ. Dùng một thẻ `<svg>` đè lên toàn bộ vùng comment, đo tọa độ `(x, y)` của các Avatar bằng `getBoundingClientRect()` và vẽ các đường cong SVG (`<path d="M... C..." />`).
- **Ưu điểm:** Đường uốn cong đẹp 100% như Figma / React Flow, đường kẻ không bao giờ bị đứt hay lệch.
- **Nhược điểm:** Phải đo tọa độ DOM liên tục, gây giật lag (Reflow/Repaint) khi Scroll hoặc Window Resize.
- **Khả năng mở rộng:** Kém trên thiết bị di động.

---

### Phương án C: Flattened DFS Tree List (Chuẩn VSCode / Reddit / Enterprise)
- **Mô tả:**
  1. Dùng một hàm Helper DFS làm phẳng `comments` (Cây) thành `flatComments` (Mảng 1D).
  2. Mỗi phần tử `FlatNode` chứa: `{ comment, depth, isLastSibling, ancestorHasNextSibling: boolean[], isVisible }`.
  3. Giao diện chỉ cần render `<div className="comment-list">{flatComments.map(node => <CommentRow key={node.id} node={node} />)}</div>`.
- **Ưu điểm:**
  - **DOM Phẳng 100%:** Cấu trúc DOM chỉ sâu 1 cấp, loại bỏ triệt để 100% lỗi co giãn height & đâm xuyên line.
  - **Hiệu năng cực cao:** Xử lý 10,000+ comment mượt mà.
  - **Thuận tiện tích hợp:** Dễ dàng thêm Virtual Scroll (`react-window`), Collapse/Expand chỉ trong 1 pass array filter.
- **Nhược điểm:** Cần 1 hàm helper DFS biến đổi dữ liệu (khoảng 15 dòng code).

---

## IV. BẢNG SO SÁNH TỔNG HỢP KIẾN TRÚC

| Tiêu chí | Phương án A (CSS Grid Đệ Quy) | Phương án B (SVG Overlay) | **Phương án C (Flattened DFS List)** |
|---|---|---|---|
| **Performance** | Trung bình (O(N) nested DOM) | Thấp (Lag do reflow DOM) | **Cực cao (O(N) 1D Flat List)** |
| **Infinite Depth** | Bị hạn chế bởi DOM depth | Trung bình | **Vô hạn (DOM luôn phẳng)** |
| **Collapse / Expand** | Phức tạp (State trong component) | Rất phức tạp (Tái tính SVG) | **Cực dễ (Array Filter O(N))** |
| **Virtual Scroll** | ❌ Không thể | ❌ Không thể | **✅ Hoàn toàn tương thích** |
| **Animation** | Trung bình | Khó | **Mượt mà (Framer Motion / CSS)** |
| **Maintainability** | Thấp | Thấp | **Rất cao (SRP chuẩn)** |
| **Khớp Reddit Style** | Khớp một phần | Khớp một phần | **Khớp 100%** |
| **Khớp Facebook Style**| Khớp một phần | Khớp một phần | **Khớp 100%** |

---

## V. ĐỀ XUẤT LỰA CHỌN DUY NHẤT CHO EIGU PLATFORM

### **LỰA CHỌN NGHỆ CỦA EIGU: PHƯƠNG ÁN C (Flattened DFS Tree List)**

#### Lý do lựa chọn duy nhất:
1. **Giải quyết triệt để Root Cause:** Mọi sự cố đứt line, chồng line, bleeding line trước đây đều do cơ chế co giãn chiều cao của DOM đệ quy lồng nhau. Phương án C đưa toàn bộ các dòng bình luận về **cùng 1 cấp DOM phẳng**, biến mỗi dòng thành một khối độc lập với chiều cao cố định. Line của dòng N không bao giờ ảnh hưởng đến dòng N+1.
2. **Tuân thủ nguyên tắc SRP (Single Responsibility Principle):**
   - **Data Layer:** `useFlattenTree(comments)` chịu trách nhiệm tính toán độ sâu `depth` và mảng `ancestorHasNextSibling`.
   - **Render Layer:** `<CommentRow />` chỉ nhận data phẳng và hiển thị đúng 1 dòng.
3. **Sẵn sàng cho tương lai:** Dễ dàng nâng cấp lên Virtual Scrolling, Lazy Loading sub-thread, và Animation thu gọn/mở rộng mượt mà trên React 19 / Next.js 15 App Router.