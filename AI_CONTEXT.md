# EIGU Platform - Master AI Context

> **LUU Y DANH CHO CAC AI ASSISTANT (Claude, GPT, Gemini...):**
> Khi ban duoc them vao du an nay de ho tro code, HAY DOC KY TAI LIEU NAY TRUOC TIEN de hieu cau truc he thong va khong pha vo kien truc.

## 1. Tong quan Kien truc (Nx Monorepo)
Du an duoc quan ly trong mot **Nx Workspace** (`npx nx ...`) bao gom 4 ung dung va 1 thu vien dung chung.
* **Co so ha tang:** Node.js, TypeScript.

### Cau truc thu muc:
- `apps/api` (NestJS): Backend Gateway trung tam (Cong 3001). Cung cap REST API (co Swagger tai `/api/docs`) va WebSockets de quan ly toan bo trang thai he thong.
- `apps/web` (Next.js): Dashboard giam sat (Cong 3000). Su dung React Flow, Dark Mode, ket noi Socket.io de theo doi tien trinh thoi gian thuc.
- `apps/desktop` (Electron + Node.js): Worker xu ly nang. Nhan file keo tha (.mp4, YouTube), goi IPC xuong loi Node.js de chay FFmpeg (bam video, chong MD5) va goi Puppeteer de luot Web/TikTok Anti-detect.
- `apps/mobile` (Flutter Native): Ung dung dien thoai Live Telemetry, dung Dart, ket noi Socket.io de hien thi trang thai tu xa.
- `packages/shared`: Noi dinh nghia cac Type, DTO, Interface dung chung cho ca 4 app tren (VD: `VideoWorkflowRequest`).

## 2. Quy tac Lap trinh (Code Conventions)
1. **Tuyet doi khong lap lai code dinh nghia (DRY):** Bat cu cau truc du lieu nao truyen qua mang (API/WebSocket) deu phai duoc khai bao trong thu muc `packages/shared` va import cheo vao cac app.
2. **Giao dien & Tham my:**
   - **KHONG SU DUNG EMOJI ICON** trong bat ky giao dien nao (Web, Desktop, Mobile). Emoji gay cam giac thieu chuyen nghiep.
   - **Desktop:** Dung SVG icons inline (xem `js/ui/icons.js`).
   - **Web:** Dung `lucide-react` icons (da co trong dependencies).
   - **Mobile:** Dung Material Icons (`Icons.*`).
   - **CSS/UI:** Dark mode, gradient, animation muot ma.
   - **Sidebar UI State (CRITICAL):** Khi viet code chuyen tab (switchView / toggleDropdown), LUON LUON phai don dep trang thai cua cac menu khac (`.nav-item.open`). Tuyet doi khong de quen xoa class `.open` khi chuyen sang mot tab khong co dropdown, de tranh loi cac submenu cua tab cu van bi hien thi chong cheo len nhau.
   - **Search Popup Navigation (CRITICAL):** Đối với các tab có dropdown submenu (như "Công cụ", "Tự động hóa", "Tài khoản"), trong menu tìm kiếm (`header.component.js`) tuyệt đối KHÔNG ĐƯỢC để kết quả tìm kiếm trỏ thẳng vào thẻ cha (ví dụ `data-view="tai-khoan"`) vì thẻ cha không có View riêng. Phải đưa toàn bộ các thẻ con (sub-items) vào kết quả tìm kiếm để điều hướng đúng vào chức năng.
   - **Event Data / Status Update (CRITICAL):** Thống nhất code kiểu key-value (chuẩn hóa schema). Truyền status event qua IPC hoặc WebSocket phải dùng object (ví dụ `{ state: 'success', message: '...' }`). TUYỆT ĐỐI KHÔNG dùng string matching trên UI (ví dụ `msg.includes('Hoàn tất')`) để suy luận logic trạng thái.
   - **Responsive UI Layout & Button Scaling (CRITICAL):** TUYỆT ĐỐI KHÔNG ép cố định `width: 100%` cho các nút bấm phụ (như nút "Gửi", "Lọc", "Thao tác") bên trong các container nằm ngang (flex row) khiến nút bị giãn dài quá khổ. Các container chính (`.view`, `#view-user-management`, `#view-chat-support`) phải được thiết kế Responsive tự điều chỉnh độ rộng (`width: 100%; box-sizing: border-box; flex: 1;`), co giãn mượt mà khi người dùng thay đổi kích thước cửa sổ.
3. **Moi truong Development / Production:**
   - **Backend (`apps/api`):**
     - Su dung `Logger` tu `@nestjs/common` (khong dung `console.log`).
     - Debug logs duoc ghi o level `debug`, chi hien thi trong moi truong development.
     - Production chi ghi log o level `warn` va `error`.
   - **Frontend (`apps/web`, `apps/desktop`, `apps/mobile`):**
     - Luon luon hien thi UI than thien voi nguoi dung.
     - Khong duoc dung `console.log` trong production code.
     - **Desktop:** Dung `addLog()` de hien thi log o UI console cho nguoi dung.
     - **Mobile:** Dung `debugPrint()` (tu `flutter/foundation.dart`) thay vi `print()` - debugPrint chi chay trong debug mode.
4. **Co che hoat dong cua Nx:**
   - Khong duoc dung cac lenh `npm start` hay `npm run dev` thong thuong.
   - Lenh chay: `npx nx serve <app_name>`.
   - Voi Web Next.js: `npx nx dev web`.
   - Rieng Desktop (Electron) da duoc tinh chinh cau hinh `serve` trong `project.json` de chay thang lenh `npx electron`.
5. **WebSocket:** Luong du lieu giua API, Web, Desktop va Mobile dua hoan toan vao kien truc Event-driven qua Socket.io-client.

## 3. Trang thai Hien tai (Checkpoint)
- Da hoan thanh Giai doan 1: **Prototype End-to-End**.
- Luong da thong tu luc nguoi dung keo tha file o Desktop -> Nhan tin IPC -> Node.js gia lap goi FFmpeg -> Mo Chromium (Puppeteer) -> Bao cao % tien do len API Gateway -> Phan hoi thoi gian thuc ra bieu do React Flow o Web Dashboard.

## 4. Muc tieu tiep theo
- Trieu khai thuat toan xu ly FFmpeg that (Decimation, Noise Injection).
- Viet kich ban Puppeteer phuc tap hon: Fake Fingerprint, vuot Captcha, tu dong dien form Upload TikTok.
- Thiet ke co so du lieu (Database) tren API de luu lai lich su cac video da upload.
