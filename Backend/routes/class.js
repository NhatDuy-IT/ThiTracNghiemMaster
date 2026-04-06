const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { verifyAdmin } = require('../controllers/adminController');
const { verifyUser } = require('../controllers/userController');

// Quản lý lớp học cần quyền Admin
router.get('/', verifyAdmin, classController.getAllClasses);
router.post('/', verifyAdmin, classController.createClass);
router.post('/add-member', verifyAdmin, classController.addMember);

// Xem thành viên lớp có thể dành cho cả User (sinh viên trong lớp)
router.get('/:classId/members', verifyUser, classController.getClassMembers);

module.exports = router;
