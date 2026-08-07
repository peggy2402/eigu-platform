# Refactor Comment Thread Architecture (Tree Connector)

Hiện tại component `NewsCommentSection.tsx` đang render comment tree không đúng.

## Vấn đề

TreeConnector hiện tại đang nằm trong toàn bộ `CommentNode`.

Layout hiện tại gần giống:

```tsx
<CommentNode>
    <TreeConnector />

    <CommentContent />

    <Replies>
        ...
    </Replies>
</CommentNode>
```

Điều này khiến:

- connector bị kéo theo toàn bộ chiều cao CommentNode
- replies cũng nằm trong chiều cao đó
- line bị kéo xuyên qua branch khác
- reply cuối vẫn còn line chạy xuống dưới

Đây là lỗi kiến trúc component, không phải CSS.

---

# Mục tiêu

Refactor toàn bộ phần render comment tree theo kiến trúc giống:

- Reddit
- Facebook
- GitHub Discussions
- Discord Forum

---

# Kiến trúc mới

Tách CommentNode thành 2 phần độc lập.

```tsx
<CommentNode>

    <CommentRow />

    <RepliesContainer />

</CommentNode>
```

KHÔNG được render connector bên ngoài CommentRow.

---

## CommentRow

CommentRow chỉ chứa:

```tsx
<TreeConnector />

<Avatar />

<CommentBody />
```

TreeConnector chỉ được phép cao bằng row này.

Không được stretch.

Không được bao gồm replies.

---

## RepliesContainer

RepliesContainer chỉ chứa:

```tsx
{children.map(...)}

```

Không chứa:

- connector
- vertical line
- elbow

RepliesContainer chỉ có:

```css
margin-left

padding-left

```

để tạo indent.

---

# Component cần tách

Hiện tại NewsCommentSection.tsx quá lớn.

Hãy refactor thành:

```
components/

CommentTree/

CommentTree.tsx

CommentNode.tsx

CommentRow.tsx

TreeConnector.tsx

RepliesContainer.tsx

CommentActions.tsx

CommentAvatar.tsx

CommentBody.tsx
```

---

# TreeConnector

TreeConnector chỉ render line.

Không render avatar.

Không render content.

Không render replies.

Props:

```ts
interface TreeConnectorProps{

ancestorLines:boolean[]

hasParent:boolean

isLastSibling:boolean

avatarSize:number

}
```

---

# TreeConnector Layout

Không dùng

```css
align-self: stretch;
```

Không dùng

```css
bottom:0;
```

Không dùng

```css
height:100%;
```

Không dùng

```css
top:0;
bottom:0;
```

TreeConnector chỉ cao bằng:

```
CommentRow
```

Ví dụ:

```css
height: avatarSize;
```

Vertical line chỉ chạy trong row.

Không được chạy xuyên xuống replies.

---

# RepliesContainer

RepliesContainer có dạng:

```tsx
<div
style={{
marginLeft: INDENT
}}
>

{children}

</div>
```

RepliesContainer KHÔNG chứa connector.

---

# Recursive Render

Render theo DFS.

Pseudo:

```tsx
render(node, ancestorLines){

<CommentNode>

<CommentRow />

{node.children.length>0 && (

<RepliesContainer>

node.children.map(...)

</RepliesContainer>

)}

</CommentNode>

}
```

---

# Không được

❌ TreeConnector cao bằng toàn bộ CommentNode

❌ TreeConnector bao gồm Replies

❌ Dùng CSS hack

❌ margin âm

❌ translateY

❌ absolute kéo xuống toàn bộ node

---

# Sau khi refactor

Đảm bảo:

Root

├── Reply A

│   ├── Reply A1

│   └── Reply A2

└── Reply B

Reply B không còn bị nằm trong branch của Reply A.

Vertical line phải kết thúc ngay sau Reply A2.

Không còn hiện tượng line kéo xuyên xuống các node khác.

---

# Yêu cầu cuối

Không sửa vá CSS hiện tại.

Hãy refactor lại toàn bộ cấu trúc component theo hướng component hóa, dễ bảo trì và mở rộng.

Mỗi component chỉ có một trách nhiệm (Single Responsibility Principle).

Kết quả phải giống trải nghiệm của Reddit/Facebook/GitHub Discussions và có thể mở rộng đến nhiều cấp reply mà không bị lỗi connector.