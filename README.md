# ThiTracNghiemMaster
ThiTracNghiemMaster
>>>>>>> 5f832c4d0ab7ca1bc28b7fedf25bd1fc220979e3
=======
# Website Thi Trắc Nghiệm

Đồ án website thi trắc nghiệm trực tuyến với Backend (Node.js + Express) và Frontend (HTML/CSS/JS + Bootstrap).

## Công nghệ sử dụng

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Web Framework
- **SQL Server** - Cơ sở dữ liệu
- **msnodesqlv8** - Driver kết nối SQL Server (Windows Authentication)
- **JWT** - Xác thực và phân quyền
- **bcryptjs** - Mã hóa password

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling
- **Vanilla JavaScript** - Logic
- **Bootstrap 5** - UI Framework

---

## Cấu trúc dự án

```
MasterExamVer1/
├── Backend/
│   ├── controllers/
│   │   ├── authController.js    # Xử lý đăng ký, đăng nhập
│   │   ├── adminController.js   # CRUD Admin
│   │   └── userController.js    # Chức năng User
│   ├── routes/
│   │   ├── auth.js              # Route Auth
│   │   ├── admin.js             # Route Admin
│   │   └── user.js              # Route User
│   ├── middleware/
│   │   └── fileUpload.js        # Upload file middleware
│   ├── utils/
│   │   └── excelUtils.js        # Utils Excel
│   ├── wwwroot/
│   │   └── images/avatars/      # Thư mục avatar
│   ├── database.js              # Cấu hình kết nối SQL Server
│   ├── database.sql             # Script tạo database
│   ├── index.js                 # File khởi động server
│   └── test-db.js               # Test kết nối database
├── Frontend/
│   ├── index.html               # Trang đăng nhập/đăng ký
│   ├── home.html                # Trang chủ - danh sách môn thi
│   ├── exam.html                # Trang thi trắc nghiệm
│   ├── history.html             # Lịch sử thi
│   ├── profile.html             # Trang profile user
│   ├── admin.html               # Trang quản lý Admin
│   ├── components/
│   │   └── modals.html          # Các modal components
│   └── js/
│       ├── api.js               # Các hàm gọi API
│       └── modal.js             # Modal handlers
├── package.json                  # Cấu hình npm
├── .gitignore                    # Git ignore
└── README.md                    # File hướng dẫn này
```

---

## Các bước cài đặt và chạy

### Bước 1: Cài đặt SQL Server

1. Cài đặt **SQL Server Express** (nếu chưa có)
2. Cài đặt **SQL Server Management Studio (SSMS)**
3. Server name: `MSI\SQLEXPRESS01`

### Bước 2: Tạo Database

1. Mở **SQL Server Management Studio**
2. Kết nối đến server `MSI\SQLEXPRESS01`
3. Mở file `Backend/database.sql`
4. Execute toàn bộ script để tạo database và các bảng

### Bước 3: Cài đặt Node.js Dependencies

```
npm install
```

### Bước 4: Chạy Backend Server

```
npm start
```

Server chạy tại **http://localhost:3000**

### Bước 5: Chạy Frontend

**Live Server (khuyến nghị)** hoặc mở trực tiếp `Frontend/index.html`

---

## Tính năng chính

✅ **User**: Đăng ký/đăng nhập, chọn môn thi, thi trắc nghiệm (đếm ngược), xem lịch sử, profile  
✅ **Admin**: Quản lý môn thi/câu hỏi, xem thống kê toàn hệ thống  
✅ **Responsive**: Mobile-friendly với Bootstrap 5  
✅ **JWT Authentication** & Role-based access  
✅ **File Upload**: Avatar user  

## License

MIT
=======
# ThiTracNghiemMaster
ThiTracNghiemMaster
>>>>>>> 5f832c4d0ab7ca1bc28b7fedf25bd1fc220979e3
