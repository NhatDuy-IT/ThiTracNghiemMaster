const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Cấu hình Lưu trữ Ảnh Đại Diện
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../wwwroot/images/avatars');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
    }
});

// File filter cho Ảnh Đại Diện
const avatarFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file JPG, JPEG hoặc PNG'));
    }
};

// Cấu hình Upload Ảnh Đại Diện
const uploadAvatar = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 
    },
    fileFilter: avatarFileFilter
});

// File filter cho Import Câu Hỏi từ Excel
const excelFileFilter = (req, file, cb) => {
    const allowedTypes = /xlsx|xls/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /spreadsheet|excel/.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file Excel (.xlsx hoặc .xls)'));
    }
};


// Cấu hình Upload Import Câu Hỏi từ Excel
const uploadExcel = multer({
    storage: multer.memoryStorage(), 
    fileFilter: excelFileFilter
});

module.exports = {
    uploadAvatar: uploadAvatar.single('avatar'),
    uploadExcel: uploadExcel.single('excelFile')
};
