const express = require('express');
const router = express.Router();
const { adminController, verifyAdmin } = require('../controllers/adminController');
const { uploadExcel } = require('../middleware/fileUpload');

// Tất cả các route Admin đều cần xác thực
router.use(verifyAdmin);

// ==================== SUBJECTS (Môn thi) ====================
// Lấy danh sách tất cả môn thi
router.get('/subjects', adminController.getAllSubjects);

// Lấy thông tin một môn thi
router.get('/subjects/:id', adminController.getSubjectById);

// Thêm môn thi mới
router.post('/subjects', adminController.createSubject);

// Cập nhật môn thi
router.put('/subjects/:id', adminController.updateSubject);

// Xóa môn thi
router.delete('/subjects/:id', adminController.deleteSubject);

// ==================== QUESTIONS (Câu hỏi) ====================
// Lấy danh sách câu hỏi
router.get('/questions', adminController.getAllQuestions);

// Lấy thông tin một câu hỏi
router.get('/questions/:id', adminController.getQuestionById);

// Thêm câu hỏi mới
router.post('/questions', adminController.createQuestion);

// Cập nhật câu hỏi
router.put('/questions/:id', adminController.updateQuestion);

// Xóa câu hỏi
router.delete('/questions/:id', adminController.deleteQuestion);

// ==================== EXAM HISTORY (Lịch sử thi) ====================
// Xem lịch sử thi của toàn bộ hệ thống
router.get('/exam-history', adminController.getAllExamHistory);

// ==================== USERS (Quản lý người dùng) ====================
// Lấy danh sách tất cả người dùng
router.get('/users', adminController.getAllUsers);

// Lấy thông tin một người dùng
router.get('/users/:id', adminController.getUserById);

// Cập nhật thông tin người dùng
router.put('/users/:id', adminController.updateUser);

// Xóa người dùng
router.delete('/users/:id', adminController.deleteUser);

// Reset mật khẩu người dùng
router.put('/users/:id/reset-password', adminController.resetUserPassword);

// ==================== EXCEL IMPORT (Nhập câu hỏi từ Excel) ====================
// Download template
router.get('/download-template', adminController.downloadTemplate);

// Import questions from Excel
router.post('/import-questions', uploadExcel, adminController.importQuestions);

// ==================== CATEGORIES (Danh mục) ====================
router.get('/categories', adminController.getAllCategories);
router.post('/categories', adminController.createCategory);

// ==================== ANNOUNCEMENTS (Thông báo) ====================
router.post('/announcements', adminController.createAnnouncement);

// ==================== FEEDBACKS (Phản hồi) ====================
router.get('/feedbacks', adminController.getAllFeedbacks);

module.exports = router;
