const express = require('express');
const router = express.Router();
const { userController, verifyUser } = require('../controllers/userController');
const { uploadAvatar } = require('../middleware/fileUpload');

// Tất cả các route User đều cần xác thực
router.use(verifyUser);

// ==================== SUBJECTS (Môn thi) ====================
// Lấy danh sách môn thi
router.get('/subjects', userController.getAllSubjects);

// ==================== QUESTIONS (Câu hỏi) ====================
// Lấy danh sách câu hỏi theo môn thi
router.get('/questions/:subjectId', userController.getQuestionsBySubject);

// ==================== EXAM (Nộp bài) ====================
// Nộp bài và chấm điểm
router.post('/exam/submit', userController.submitExam);

// ==================== EXAM HISTORY (Lịch sử thi) ====================
// Lấy lịch sử điểm thi của cá nhân
router.get('/exam-history', userController.getMyExamHistory);

// ==================== PROFILE (Thông tin cá nhân) ====================
// Lấy thông tin profile
router.get('/profile', userController.getProfile);

// Cập nhật thông tin profile
router.put('/profile', userController.updateProfile);

// Đổi mật khẩu
router.put('/change-password', userController.changePassword);

// Upload avatar
router.post('/upload-avatar', uploadAvatar, userController.uploadAvatar);

module.exports = router;
