# Fix Threaded Comment Tree (Reddit/Facebook Style)

Hiện tại UI Comment Thread đang render sai.

## Bug hiện tại

Ảnh đính kèm cho thấy:

- Comment root:
    Quốc Việt MMO

    ├── Khách ghé thăm

    │      ├── admin

    │      └── admin

    └── admin

Nhưng UI lại vẽ như:

Quốc Việt MMO

│

├── Khách ghé thăm

│

│

├── admin

│

├── admin

│

├── admin

Tức là đường dọc của comment đầu tiên kéo xuyên xuống comment cuối mặc dù comment cuối KHÔNG phải con của nó.

Đây là lỗi render tree.

---

## Yêu cầu

Render đúng như Reddit / Facebook / GitHub Discussion.

Ví dụ:

Root

├── Reply A

│   ├── Reply A1

│   └── Reply A2

└── Reply B

Reply B phải nằm ngoài branch của Reply A.

Không được dùng chung một vertical line.

---

## Không render line theo depth

Sai:

depth = 2
=> luôn render 2 line

Đúng:

Mỗi ancestor phải quyết định:

ancestor còn sibling phía sau?

YES

render vertical line

NO

render khoảng trắng

Ví dụ:

ancestorStack =

[
 true,
 false,
 true
]

thì render:

│

(space)

│

---

## Mỗi node cần truyền

interface ThreadNode{

id:string

parentId:string|null

children:ThreadNode[]

isLastSibling:boolean

ancestorHasNextSibling:boolean[]

}

ancestorHasNextSibling dùng để render line.

---

## Render

Pseudo:

ancestorHasNextSibling.forEach(v=>{

if(v)

render vertical line

else

render empty column

})

if(parent)

render elbow (└ hoặc ├)

render avatar

render content

---

## Chỉ render vertical line nếu ancestor còn sibling

Sai:

Reply A

│

Reply A1

│

Reply A2

│

Reply B

Đúng:

Reply A

│

Reply A1

│

Reply A2

Reply B

Vertical line phải kết thúc ngay sau Reply A2.

---

## CSS

Mỗi level có width cố định:

40px

position:relative

Vertical line:

position:absolute;

left:20px;

top:0;

bottom:0;

width:2px;

Elbow:

position:absolute;

left:20px;

top:18px;

width:16px;

height:18px;

border-left:2px solid;

border-bottom:2px solid;

border-radius:0 0 0 12px;

Không dùng margin-left để fake.

---

## Thuật toán render

Trong quá trình DFS:

render(node, ancestorLines)

newAncestor = [

...ancestorLines,

!node.isLastSibling

]

children.forEach(child){

render(child,newAncestor)

}

Như vậy:

Reply cuối cùng của branch sẽ KHÔNG truyền vertical line xuống dưới.

---

## Kết quả mong muốn

Render giống:

- Reddit
- Facebook Comment Thread
- GitHub Discussion
- Discord Forum Thread

Các branch phải độc lập hoàn toàn.

Không có bất kỳ đường dọc nào kéo xuyên qua branch khác.