# TASK: Refactor Comment Thread Tree (Nested Comments)

## Vấn đề hiện tại

UI Comment Thread hiện tại bị lỗi khi hiển thị các comment nhiều cấp.

Các lỗi đang gặp:

1. Đường nối (vertical line) của comment cha kéo xuyên xuống các comment không cùng nhánh.
2. Khi reply nhiều cấp, line bị chồng chéo.
3. Có comment cấp cuối vẫn còn đường nối kéo xuống.
4. Các nhánh con không được tách độc lập.
5. Avatar không nằm đúng vị trí bắt đầu của nhánh.
6. Mỗi node đang tự render line riêng dẫn tới layout bị rối.

Ví dụ:

Parent
├── Child A
│   ├── Child A1
│   └── Child A2
└── Child B

Nhưng UI hiện tại lại render gần giống:

│
├── Child A
│
│
├── Child A1
│
├── Child A2
│
│
├── Child B
│
│

=> Sai hoàn toàn.

---

# Mục tiêu

Render giống Reddit, Facebook, Discord Thread hoặc GitHub Discussions.

Mỗi branch phải độc lập.

Ví dụ đúng:

Parent
│
├── Child A
│   │
│   ├── Child A1
│   │
│   └── Child A2
│
└── Child B

Nếu Child B không còn reply:

Parent
│
└── Child B

Không được còn line kéo xuống.

---

# Kiến trúc cần refactor

Không render line bằng position absolute toàn cục.

Không dùng một div kéo dài.

Thay vào đó:

Mỗi CommentNode chỉ chịu trách nhiệm render:

- chính nó
- danh sách children

Pseudo:

<CommentNode>

    Avatar

    Content

    Children

</CommentNode>

Children sẽ tự render tiếp CommentNode.

Recursive Tree.

---

# Indent

Mỗi cấp:

padding-left: 32px

hoặc

margin-left: 32px

Không hardcode nhiều giá trị.

Ví dụ:

depth * INDENT_SIZE

---

# Vertical Line

Line phải được render theo từng cấp.

Không render một line kéo toàn bộ container.

Ví dụ:

<div class="thread-column">

    vertical-line

    elbow

</div>

Nếu node là node cuối cùng:

Không render vertical line phía dưới.

Nếu node còn sibling:

Render line kéo xuống.

---

# Elbow Line

Mỗi comment con cần:

```
│
├──
```

hoặc

```
│
└──
```

Tuỳ:

isLastChild

Nếu là cuối:

└──

Nếu chưa:

├──

---

# Recursive Data

Ví dụ:

[
    {
        id:1,
        children:[
            {
                id:2,
                children:[
                    {
                        id:3
                    },
                    {
                        id:4
                    }
                ]
            },
            {
                id:5
            }
        ]
    }
]

CommentNode chỉ cần:

comment

depth

isLast

parentLines

---

# parentLines

Đây là phần quan trọng.

Khi render recursive cần truyền mảng:

parentLines

Ví dụ:

[
 true,
 false,
 true
]

Ý nghĩa:

Cấp 1 còn line

Cấp 2 hết line

Cấp 3 còn line

Render dựa vào parentLines.

Pseudo:

parentLines.map(showLine)

Nếu true:

render vertical line

Nếu false:

render empty space

Đây là cách Reddit và VSCode Tree hoạt động.

---

# CSS

Không dùng magic number.

Tạo:

const INDENT = 32

const AVATAR = 40

const LINE_WIDTH = 2

const ELBOW = 16

---

# Không dùng

❌ position:absolute kéo xuyên toàn bộ

❌ border-left cho toàn bộ container

❌ margin-left cố định nhiều nơi

❌ render line ở component cha

---

# Nên dùng

✅ Recursive Component

✅ Flex

✅ CSS Grid

✅ parentLines

✅ depth

✅ isLastChild

---

# Responsive

Desktop

Tablet

Mobile

đều phải đúng.

Line không bị lệch.

Avatar luôn căn giữa line.

---

# Kết quả mong muốn

UI giống:

- Reddit Comment Thread
- GitHub Discussion
- Discord Thread
- Hacker News

Không còn:

- line dư
- line đâm xuyên
- line chồng
- line kéo vô tận
- avatar lệch
- nhánh sai

---

# Output yêu cầu

1. Refactor toàn bộ component CommentThread.

2. Refactor CommentNode thành Recursive Component.

3. Viết lại logic render line.

4. Tạo helper renderParentLines().

5. Tạo TreeConnector component nếu cần.

6. Loại bỏ toàn bộ CSS dư.

7. Giữ nguyên API và dữ liệu hiện tại.

8. Chỉ thay đổi UI rendering.

9. Code sạch, dễ mở rộng và tối ưu hiệu năng (React.memo nếu phù hợp).

10. Đảm bảo thread hoạt động đúng với số cấp lồng nhau không giới hạn.