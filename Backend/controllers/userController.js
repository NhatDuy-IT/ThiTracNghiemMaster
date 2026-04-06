const { sql, connectDB } = require('../database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware xác thực User
const verifyUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token không được cung cấp' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token không hợp lệ' });
    }
};

const userController = {
    // ==================== MÔN THI ====================

    // Lấy danh sách môn thi (User có thể xem)
    getAllSubjects: async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .query('SELECT SubjectID, SubjectName, Description FROM Subjects ORDER BY SubjectName');
            
            res.json(result.recordset);
        } catch (error) {
            console.error('Lỗi lấy danh sách môn thi:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // ==================== CÂU HỎI ====================

    // Lấy danh sách câu hỏi theo môn thi
    getQuestionsBySubject: async (req, res) => {
        try {
            const { subjectId } = req.params;
            const { limit } = req.query;

            if (!subjectId) {
                return res.status(400).json({ error: 'Thiếu SubjectID' });
            }

            const pool = await connectDB();
            
            let query = 'SELECT QuestionID, QuestionText, OptionA, OptionB, OptionC, OptionD FROM Questions WHERE SubjectID = @subjectId';
            
            if (limit) {
                query += ` ORDER BY NEWID()`; // Thứ tự ngẫu nhiên
                query = `SELECT TOP ${limit} * FROM (${query}) as Questions`;
            } else {
                query += ' ORDER BY QuestionID';
            }

            const result = await pool.request()
                .input('subjectId', sql.Int, subjectId)
                .query(query);

            res.json(result.recordset);
        } catch (error) {
            console.error('Lỗi lấy câu hỏi:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // ==================== EXAM (Nộp bài) ====================

    // Nộp bài và chấm điểm
    submitExam: async (req, res) => {
        let pool;
        try {
            const { subjectId, answers } = req.body; // answers: [{ questionId: 1, answer: 'A' }, ...]
            const userId = req.user.userId;

            if (!subjectId || !answers || !Array.isArray(answers)) {
                return res.status(400).json({ error: 'Thiếu thông tin bài thi' });
            }

            pool = await connectDB();

            // Lấy tất cả câu hỏi của môn thi
            const questionsResult = await pool.request()
                .input('subjectId', sql.Int, subjectId)
                .query('SELECT QuestionID, CorrectAnswer FROM Questions WHERE SubjectID = @subjectId');

            const questions = questionsResult.recordset;
            
            if (questions.length === 0) {
                return res.status(400).json({ error: 'Môn thi không có câu hỏi' });
            }

            // Tính điểm
            let correctCount = 0;
            const questionMap = {};
            questions.forEach(q => {
                questionMap[q.QuestionID] = q.CorrectAnswer;
            });

            const results = answers.map(answer => {
                const correctAnswer = questionMap[answer.questionId];
                const isCorrect = correctAnswer && correctAnswer.toUpperCase() === (answer.answer || '').toUpperCase();
                if (isCorrect) correctCount++;
                return {
                    questionId: answer.questionId,
                    userAnswer: answer.answer,
                    correctAnswer: correctAnswer,
                    isCorrect: isCorrect
                };
            });

            const totalQuestions = questions.length;
            const score = Math.round((correctCount / totalQuestions) * 10 * 10) / 10;

            // Bắt đầu Transaction để lưu vào 2 bảng
            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
                // 1. Lưu vào ExamHistory
                const historyResult = await new sql.Request(transaction)
                    .input('userId', sql.Int, userId)
                    .input('subjectId', sql.Int, subjectId)
                    .input('score', sql.Float, score)
                    .input('totalQuestions', sql.Int, totalQuestions)
                    .input('correctAnswers', sql.Int, correctCount)
                    .query(`
                        INSERT INTO ExamHistory (UserID, SubjectID, Score, TotalQuestions, CorrectAnswers)
                        VALUES (@userId, @subjectId, @score, @totalQuestions, @correctAnswers);
                        SELECT SCOPE_IDENTITY() as ExamID;
                    `);

                const examId = historyResult.recordset[0].ExamID;

                // 2. Lưu vào ExamDetails (Lưu từng câu trả lời)
                for (const resItem of results) {
                    await new sql.Request(transaction)
                        .input('examId', sql.Int, examId)
                        .input('questionId', sql.Int, resItem.questionId)
                        .input('userAnswer', sql.Char(1), resItem.userAnswer || null)
                        .input('isCorrect', sql.Bit, resItem.isCorrect ? 1 : 0)
                        .query(`
                            INSERT INTO ExamDetails (ExamID, QuestionID, UserAnswer, IsCorrect)
                            VALUES (@examId, @questionId, @userAnswer, @isCorrect)
                        `);
                }

                await transaction.commit();

                res.json({
                    message: 'Nộp bài thành công',
                    score: score,
                    totalQuestions: totalQuestions,
                    correctAnswers: correctCount,
                    results: results
                });
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (error) {
            console.error('Lỗi nộp bài:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // ==================== EXAM HISTORY (Lịch sử thi) ====================

    // Lấy lịch sử điểm thi của cá nhân
    getMyExamHistory: async (req, res) => {
        try {
            const userId = req.user.userId;
            const pool = await connectDB();

            const result = await pool.request()
                .input('userId', sql.Int, userId)
                .query(`
                    SELECT 
                        eh.ExamID,
                        eh.SubjectID,
                        s.SubjectName,
                        eh.Score,
                        eh.TotalQuestions,
                        eh.CorrectAnswers,
                        eh.ExamDate
                    FROM ExamHistory eh
                    INNER JOIN Subjects s ON eh.SubjectID = s.SubjectID
                    WHERE eh.UserID = @userId
                    ORDER BY eh.ExamDate DESC
                `);

            res.json(result.recordset);
        } catch (error) {
            console.error('Lỗi lấy lịch sử thi:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // Lấy chi tiết bài thi (Câu hỏi + Đáp án của User)
    getExamDetails: async (req, res) => {
        try {
            const { examId } = req.params;
            const userId = req.user.userId;
            const pool = await connectDB();

            const result = await pool.request()
                .input('examId', sql.Int, examId)
                .input('userId', sql.Int, userId)
                .query(`
                    SELECT 
                        ed.DetailID,
                        ed.ExamID,
                        ed.QuestionID,
                        ed.UserAnswer,
                        ed.IsCorrect,
                        q.QuestionText,
                        q.OptionA,
                        q.OptionB,
                        q.OptionC,
                        q.OptionD,
                        q.CorrectAnswer,
                        q.Explanation
                    FROM ExamDetails ed
                    INNER JOIN ExamHistory eh ON ed.ExamID = eh.ExamID
                    INNER JOIN Questions q ON ed.QuestionID = q.QuestionID
                    WHERE ed.ExamID = @examId AND eh.UserID = @userId
                    ORDER BY ed.DetailID ASC
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({ error: 'Không tìm thấy chi tiết bài thi' });
            }

            res.json(result.recordset);
        } catch (error) {
            console.error('Lỗi lấy chi tiết bài thi:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // ==================== PROFILE (Thông tin cá nhân) ====================

    // Lấy thông tin profile
    getProfile: async (req, res) => {
        try {
            const userId = req.user.userId;
            const pool = await connectDB();

            const result = await pool.request()
                .input('userId', sql.Int, userId)
                .query('SELECT UserID, Username, FullName, Email, AvatarPath, Role, CreatedAt FROM Users WHERE UserID = @userId');

            if (result.recordset.length === 0) {
                return res.status(404).json({ error: 'Không tìm thấy người dùng' });
            }

            res.json(result.recordset[0]);
        } catch (error) {
            console.error('Lỗi lấy profile:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // Cập nhật thông tin profile
    updateProfile: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { fullName, email } = req.body;
            const pool = await connectDB();

            await pool.request()
                .input('userId', sql.Int, userId)
                .input('fullName', sql.NVarChar(100), fullName || null)
                .input('email', sql.NVarChar(100), email || null)
                .query('UPDATE Users SET FullName = @fullName, Email = @email WHERE UserID = @userId');

            res.json({ message: 'Cập nhật thông tin thành công' });
        } catch (error) {
            console.error('Lỗi cập nhật profile:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // Đổi mật khẩu
    changePassword: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ error: 'Thiếu thông tin mật khẩu' });
            }

            const pool = await connectDB();

            // Lấy mật khẩu hiện tại
            const result = await pool.request()
                .input('userId', sql.Int, userId)
                .query('SELECT Password FROM Users WHERE UserID = @userId');

            if (result.recordset.length === 0) {
                return res.status(404).json({ error: 'Không tìm thấy người dùng' });
            }

            // Kiểm tra mật khẩu cũ
            const isMatch = await bcrypt.compare(currentPassword, result.recordset[0].Password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });
            }

            // Mã hóa mật khẩu mới
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Cập nhật mật khẩu
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('password', sql.NVarChar(255), hashedPassword)
                .query('UPDATE Users SET Password = @password WHERE UserID = @userId');

            res.json({ message: 'Đổi mật khẩu thành công' });
        } catch (error) {
            console.error('Lỗi đổi mật khẩu:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // Upload Avatar
    uploadAvatar: async (req, res) => {
        try {
            const userId = req.user.userId;

            if (!req.file) {
                return res.status(400).json({ error: 'Chưa chọn file' });
            }

            const pool = await connectDB();

            // Get old avatar path to delete
            const userResult = await pool.request()
                .input('userId', sql.Int, userId)
                .query('SELECT AvatarPath FROM Users WHERE UserID = @userId');

            if (userResult.recordset.length === 0) {
                return res.status(404).json({ error: 'Không tìm thấy người dùng' });
            }

            // Delete old avatar if exists
            if (userResult.recordset[0].AvatarPath) {
                const oldPath = path.join(__dirname, '../wwwroot/images/avatars', path.basename(userResult.recordset[0].AvatarPath));
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            // Save new avatar path
            const avatarPath = `/api/images/avatars/${req.file.filename}`;

            await pool.request()
                .input('userId', sql.Int, userId)
                .input('avatarPath', sql.NVarChar(255), avatarPath)
                .query('UPDATE Users SET AvatarPath = @avatarPath WHERE UserID = @userId');

            res.json({
                message: 'Cập nhật ảnh đại diện thành công',
                avatarPath: avatarPath
            });
        } catch (error) {
            console.error('Lỗi upload avatar:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // ==================== FEEDBACK (Gửi phản hồi) ====================

    sendFeedback: async (req, res) => {
        try {
            const { subjectId, message } = req.body;
            const userId = req.user.userId;
            const pool = await connectDB();

            await pool.request()
                .input('userId', sql.Int, userId)
                .input('subjectId', sql.Int, subjectId || null)
                .input('message', sql.NVarChar, message)
                .query('INSERT INTO Feedbacks (UserID, SubjectID, Message) VALUES (@userId, @subjectId, @message)');

            res.status(201).json({ message: 'Gửi phản hồi thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // ==================== ANNOUNCEMENTS (Thông báo) ====================

    getAnnouncements: async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request().query('SELECT * FROM Announcements WHERE IsActive = 1 ORDER BY CreatedAt DESC');
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi server' });
        }
    }
};

module.exports = { userController, verifyUser };
