# Ứng dụng Chia sẻ Ảnh (Photo Sharing App)

Dự án này là một ứng dụng full-stack (gồm React frontend và Express backend dùng cơ sở dữ liệu MongoDB Atlas) phục vụ chia sẻ ảnh, bình luận, đăng ký và xác thực người dùng.

---

## Hướng dẫn cài đặt và chạy ứng dụng

Để khởi động dự án này trên máy tính của bạn, vui lòng mở hai cửa sổ terminal trong thư mục `photo-sharing-v1` và thực hiện các bước sau:

### Bước 1: Khởi động và nạp dữ liệu mẫu cho Database

1. Đảm bảo bạn đã cài đặt các phụ thuộc (dependencies) bằng cách chạy lệnh sau tại một terminal:
   ```bash
   npm.cmd install
   ```
   *(Hoặc dùng `npm install` tùy thuộc cấu hình hệ thống)*

2. Nạp dữ liệu giả lập ban đầu vào cơ sở dữ liệu MongoDB bằng cách chạy:
   ```bash
   node ./db/dbLoad.js
   ```
   *Lưu ý: Lệnh này sẽ xóa sạch dữ liệu cũ trong cơ sở dữ liệu và nạp lại 6 người dùng mặc định kèm ảnh và bình luận mẫu của họ.*

---

### Bước 2: Khởi động Backend Server (Terminal 1)

Chạy lệnh sau để khởi chạy máy chủ backend Express:
```bash
npm.cmd run server
```
*(Hoặc dùng `npm run server`)*

Máy chủ backend sẽ chạy tại cổng **3001** (`http://127.0.0.1:3001`).

---

### Bước 3: Khởi động Frontend Client (Terminal 2)

Chạy lệnh sau để khởi chạy ứng dụng React (development server):
```bash
npm.cmd start
```
*(Hoặc dùng `npm start`)*

Ứng dụng React sẽ chạy tại cổng **3000** (`http://localhost:3000`). Trình duyệt sẽ tự động mở trang web.

---

## Tài khoản mẫu để kiểm thử (Test Accounts)

Sau khi chạy lệnh `node ./db/dbLoad.js`, cơ sở dữ liệu sẽ được tạo sẵn 6 tài khoản người dùng sau đây. 
Tất cả tài khoản đều có mật khẩu mặc định là **`password`**:

| Họ và tên | Tên đăng nhập (`login_name`) | Mật khẩu mặc định |
| :--- | :--- | :--- |
| **Ian Malcolm** | `malcolm` | `password` |
| **Ellen Ripley** | `ripley` | `password` |
| **Peregrin Took** | `took` | `password` |
| **Rey Kenobi** | `kenobi` | `password` |
| **April Ludgate** | `ludgate` | `password` |
| **John Ousterhout** | `ouster` | `password` |

---

## Danh sách các API Endpoints (Backend)

Backend Express hỗ trợ các API sau (được bảo vệ bởi cơ chế xác thực Token qua header `Authorization`):

### API không yêu cầu xác thực:
- `POST /admin/login` - Đăng nhập tài khoản. Yêu cầu body JSON: `{ "login_name": "...", "password": "..." }`.
- `POST /user` - Đăng ký tài khoản mới. Yêu cầu body JSON chứa các thông tin cá nhân cơ bản.
- `GET /test/info` - Lấy thông tin phiên bản schema database.

### API yêu cầu đăng nhập:
- `POST /admin/logout` - Đăng xuất.
- `GET /user/list` - Lấy danh sách người dùng tóm tắt (chỉ hiển thị khi đã đăng nhập).
- `GET /user/:id` - Xem chi tiết profile của một người dùng.
- `GET /photosOfUser/:id` - Lấy danh sách ảnh và bình luận của một người dùng.
- `POST /commentsOfPhoto/:photo_id` - Thêm bình luận mới dưới ảnh (gửi lên body chứa nội dung bình luận).
- `POST /photos/new` - Tải lên ảnh mới (gửi dạng Multipart Form-data chứa tệp ảnh).
