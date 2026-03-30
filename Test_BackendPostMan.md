### 1. **Đăng ký tài khoản mới**
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Body** (JSON):
```json
{
  "username": "student01",
  "password": "123456",
  "fullName": "Nguyễn Văn A",
  "email": "student01@gmail.com"
}
```
```json
{
  "message": "Đăng ký thành công!",
  "user": {
    "UserID": 1,
    "Username": "student01",
    "FullName": "Nguyễn Văn A",
    "Email": "student01@gmail.com",
    "Role": "User"
  }
}
```
---

### 2. **Đăng nhập**
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/auth/login`
- **Body**:
```json
{
  "username": "student01",
  "password": "123456"
}
```

**Response:**
```json
{
  "message": "Đăng nhập thành công!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "UserID": 1,
    "Username": "student01",
    "FullName": "Nguyễn Văn A",
    "Role": "User"
  }
}
```
---

##  B. USER API (`/api/user`) - Dành cho học sinh

**Tất cả API dưới đây cần Token!**
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <token_vừa_lấy_được>`

### 3. **Lấy danh sách môn thi**
- **Method**: `GET`
- **URL**: `http://localhost:3000/api/user/subjects`

**Response:**
```json
[
  {
    "SubjectID": 1,
    "SubjectName": "Toán học",
    "Description": "Môn toán cơ bản"
  },
  {
    "SubjectID": 2,
    "SubjectName": "Tiếng Anh",
    "Description": "Tiếng Anh giao tiếp"
  }
]
```

---

### 4. **Lấy câu hỏi của môn thi**
- **Method**: `GET`
- **URL**: `http://localhost:3000/api/user/questions/1`
  (Số 1 là SubjectID)

**Response:**
```json
[
  {
    "QuestionID": 1,
    "QuestionText": "2 + 2 = ?",
    "OptionA": "3",
    "OptionB": "4",
    "OptionC": "5",
    "OptionD": "6"
  }
]
```

---

### 5. **Nộp bài thi**
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/user/submit-exam`
- **Body**:
```json
{
  "subjectId": 1,
  "answers": [
    { "questionId": 1, "answer": "B" },
    { "questionId": 2, "answer": "A" }
  ]
}
```

**Response:**
```json
{
  "message": "Nộp bài thành công!",
  "score": 8.5,
  "correctAnswers": 17,
  "totalQuestions": 20
}
```

---

### 6. **Xem lịch sử thi**
- **Method**: `GET`
- **URL**: `http://localhost:3000/api/user/history`

**Response:**
```json
[
  {
    "ExamID": 1,
    "SubjectName": "Toán học",
    "Score": 8.5,
    "ExamDate": "2026-02-23T10:30:00.000Z"
  }
]
```

---

## C. ADMIN API (`/api/admin`) - Dành cho quản trị viên

**Cần đăng nhập với tài khoản Admin!**

### 7. **Thêm môn thi mới**
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/admin/subjects`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Body**:
```json
{
  "subjectName": "Vật lý",
  "description": "Môn vật lý cơ bản"
}
```

---

### 8. **Thêm câu hỏi mới**
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/admin/questions`
- **Body**:
```json
{
  "subjectId": 1,
  "questionText": "3 + 5 = ?",
  "optionA": "6",
  "optionB": "7",
  "optionC": "8",
  "optionD": "9",
  "correctAnswer": "C"
}
```
---

### 9. **Xem tất cả lịch sử thi (toàn hệ thống)**
- **Method**: `GET`
- **URL**: `http://localhost:3000/api/admin/all-history`

---

### 10. **Xóa môn thi**
- **Method**: `DELETE`
- **URL**: `http://localhost:3000/api/admin/subjects/1`
  (Số 1 là SubjectID cần xóa)

---

### 11. **Cập nhật câu hỏi**
- **Method**: `PUT`
- **URL**: `http://localhost:3000/api/admin/questions/1`
- **Body**:
```json
{
  "questionText": "2 x 3 = ?",
  "optionA": "5",
  "optionB": "6",
  "optionC": "7",
  "optionD": "8",
  "correctAnswer": "B"
}






