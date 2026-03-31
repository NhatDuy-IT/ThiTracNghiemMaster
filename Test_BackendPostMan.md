# 🚀 HƯỚNG DẪN TEST API EXAMMASTER (DÀNH CHO NGÀY BÁO CÁO)

Tài liệu này được thiết kế để bạn có thể thực hiện kiểm thử từng bước (step-by-step) một cách mượt mà nhất trong buổi báo cáo đồ án.

--

## 🛠️ CHUẨN BỊ CHUNG
- **Base URL**: `http://localhost:3000/api`
- **Headers mật định**: `Content-Type: application/json`
- **Biến môi trường**: Nên tạo một biến `token` trong Postman để dán mã JWT vào sau khi đăng nhập.

---

## 🕒 GIAI ĐOẠN 1: XÁC THỰC (AUTHENTICATION)
*Đây là bước đầu tiên để chứng minh hệ thống quản lý tài khoản tốt.*

### 1. Đăng ký tài khoản (Học sinh mới)
- **Method**: `POST`
- **URL**: `{{baseUrl}}/auth/register`
- **Mục tiêu**: Tạo một học sinh mới để bắt đầu thi.
- **Body**:
```json
{
  "username": "student_test",
  "password": "123",
  "fullName": "Nguyễn Văn Test",
  "email": "test@gmail.com"
}
```

### 2. Đăng nhập (Lấy mã Token)
- **Method**: `POST`
- **URL**: `{{baseUrl}}/auth/login`
- **Mục tiêu**: Lấy mã `token` để dùng cho tất cả các bước sau.
- **Body**:
```json
{
  "username": "student_test",
  "password": "123"
}
```
> [!TIP]
> **Quan trọng**: Sau khi nhấn Send, hãy Copy chuỗi `token` trong kết quả trả về và dán vào phần **Authorization -> Bearer Token** của các API tiếp theo.

### 3. Đăng nhập nhanh bằng Google (Tính năng cao cấp)
- **Method**: `POST`
- **URL**: `{{baseUrl}}/auth/google-login`
- **Body**: `{"credential": "TOKEN_GOOGLE_CỦA_BẠN"}`

---

## 📝 GIAI ĐOẠN 2: LUỒNG THI (EXAM FLOW)
*Chứng minh logic thi trắc nghiệm hoạt động chuẩn xác.*

### 4. Xem danh sách môn thi
- **URL**: `GET {{baseUrl}}/user/subjects`
- **Mục tiêu**: Show cho giảng viên thấy các môn học hiện có trong Database.

### 5. Lấy đề thi (Câu hỏi)
- **URL**: `GET {{baseUrl}}/user/questions/1`
- **Giải thích**: Số `1` là mã môn thi (SubjectID). API này sẽ trả về danh sách câu hỏi để học sinh làm bài.

### 6. Nộp bài và Chấm điểm tự động
- **Method**: `POST`
- **URL**: `{{baseUrl}}/user/exam/submit`
- **Body**:
```json
{
  "subjectId": 1,
  "answers": [
    { "questionId": 1, "answer": "A" },
    { "questionId": 2, "answer": "B" }
  ]
}
```
- **Kết quả**: Hệ thống sẽ trả về ngay lập tức: **Số câu đúng, Tổng điểm, Thời gian nộp**.

### 7. Xem lại lịch sử thi
- **URL**: `GET {{baseUrl}}/user/exam-history`
- **Mục tiêu**: Chứng minh kết quả thi đã được lưu lại vĩnh viễn trong CSDL.

---

## 👤 GIAI ĐOẠN 3: THÔNG TIN CÁ NHÂN (USER PROFILE)
*Chứng minh tính năng quản lý profile và bảo mật.*

### 8. Xem Profile & Upload Ảnh đại diện
- **GET** `{{baseUrl}}/user/profile`: Xem thông tin hiện tại.
- **POST** `{{baseUrl}}/user/upload-avatar`: (Dùng Body -> Form-data) để chọn 1 tấm ảnh làm đại diện.

### 9. Đổi mật khẩu
- **URL**: `PUT {{baseUrl}}/user/change-password`
- **Body**: `{"oldPassword": "123", "newPassword": "456"}`

---

## ⚙️ GIAI ĐOẠN 4: QUẢN TRỊ (ADMIN CONTROL)
*Dành cho giảng viên muốn xem khả năng quản lý của hệ thống.*

### 10. Quản lý Môn học & Câu hỏi
- **POST** `{{baseUrl}}/admin/subjects`: Thêm môn mới (ví dụ: "Lập trình Java").
- **POST** `{{baseUrl}}/admin/questions`: Thêm câu hỏi khó vào môn học.

### 11. Nhập đề thi từ Excel (Tính năng tối ưu)
- **URL**: `POST {{baseUrl}}/admin/import-questions`
- **Mục tiêu**: Thay vì nhập từng câu, Admin chỉ cần up 1 file Excel lên là có ngay đề thi 50 câu.

### 12. Quản lý người dùng (Quản trị viên)
- **GET** `{{baseUrl}}/admin/users`: Xem danh sách tất cả thí sinh.
- **DELETE** `{{baseUrl}}/admin/users/5`: Xóa một thí sinh vi phạm quy chế.

---

## 💡 MẸO TRÌNH BÀY (PRESENTATION TIPS)
1. **Dùng Collection**: Gom tất cả API này vào 1 Folder trong Postman tên là "BÁO CÁO ĐỒ ÁN".
2. **Sắp xếp**: Đánh số thứ tự từ 1 đến 12 như trên để không bị rối khi giảng viên hỏi.
3. **Thao tác nhanh**: Chuẩn bị sẵn các chuỗi JSON trong Body để chỉ cần nhấn **Send** là có kết quả ngay.

---
*Chúc bạn có một buổi báo cáo thành công rực rỡ!* 🎓🏆
