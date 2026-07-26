# EIGU Platform — AI Video Module

AI Video Module — Character System

## 1. Character

Lưu trong `project.json` → characters[]:

- identity metadata
- appearance
- clothing
- style
- personality
- voice (voiceId)
- reference images (asset IDs trỏ đến `assets/` trong `.eigu`)
- generation settings
- locked attributes

## 2. Consistency

Không hứa đảm bảo tuyệt đối vì mỗi model/provider có khả năng khác nhau.

Dùng:

- reference images (embedded trong `.eigu`)
- character ID
- prompt anchors
- seed khi hỗ trợ
- provider-specific reference features
- locked attributes

## 3. Locks

- Lock Face
- Lock Hair
- Lock Outfit
- Lock Style
- Lock Seed
- Lock Character

## 4. Character version

Thay đổi character → tạo version mới trong `project.json` → versionHistory. Scene cũ giữ reference đến version cũ.
