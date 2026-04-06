const { sql, connectDB } = require('../database');
const jwt = require('jsonwebtoken');
const { generateQuestionTemplate, parseQuestionsFromExcel } = require('../utils/excelUtils');

const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware xác thực Admin
const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token không được cung cấp' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'Admin') {
            return res.status(403).json({ error: 'Chỉ Admin mới có quyền truy cập' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token không hợp lệ' });
    }
};

const adminController = {
    // ==================== MÔN THI ====================

    // Lấy danh sách tất cả môn thi
    getAllSubjects: async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .query(`
                    SELECT 
                        s.SubjectID, 
                        s.SubjectName, 
                        s.Description, 
                        s.Duration,
                        COUNT(q.QuestionID) as TotalQuestions
                    FROM Subjects s
                    LEFT JOIN Questions q ON s.SubjectID = q.SubjectID
                    GROUP BY s.SubjectID, s.SubjectName, s.Description, s.Duration
                    ORDER BY s.SubjectID DESC
                `);
            
            res.json(result.recordset);
        } catch (error) {
            console.error('Lỗi lấy danh sách môn thi:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // Lấy thông tin một môn thi
    getSubjectById: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = await connectDB();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT * FROM Subjects WHERE SubjectID = @id');

            if (result.recordset.length === 0) {
                return res.status(404).json({ error: 'Môn thi không tồn tại' });
            }

            res.json(result.recordset[0]);
        } catch (error) {
            console.error('Lỗi lấy thông tin môn thi:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // Thêm môn thi mới
    createSubject: async (req, res) => {
        try {
            const { subjectName, description, duration } = req.body;

            if (!subjectName) {
                return res.status(400).json({ error: 'Tên môn thi là bắt buộc' });
            }

            const pool = await connectDB();
            const result = await pool.request()
                .input('subjectName', sql.NVarChar, subjectName)
                .input('description', sql.NVarChar, description || '')
                .input('duration', sql.Int, duration || 45)
                .query(`
                    INSERT INTO Subjects (SubjectName, Description, Duration)
                    VALUES (@subjectName, @description, @duration);
                    SELECT SCOPE_IDENTITY() as SubjectID;
                `);

            const subjectId = result.recordset[0].SubjectID;

            res.status(201).json({
                message: 'Thêm môn thi thành công',
                subjectId
            });
        } catch (error) {
            console.error('Lỗi thêm môn thi:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // Cập nhật môn thi
    updateSubject: async (req, res) => {
        try {
            const { id } = req.params;
            const { subjectName, description, duration } = req.body;

            const pool = await connectDB();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('subjectName', sql.NVarChar, subjectName)
                .input('description', sql.NVarChar, description || '')
                .input('duration', sql.Int, duration || 45)
                .query(`
                    UPDATE Subjects
                    SET SubjectName = @subjectName, Description = @description, Duration = @duration
                    WHERE SubjectID = @id
                `);

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ error: 'Môn thi không tồn tại' });
            }

            res.json({ message: 'Cập nhật môn thi thành công' });
        } catch (error) {
            console.error('Lỗi cập nhật môn thi:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // Xóa môn thi
    deleteSubject: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = await connectDB();
            
            // Xóa câu hỏi thuộc môn thi trước
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Questions WHERE SubjectID = @id');

            // Xóa lịch sử thi thuộc môn thi
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM ExamHistory WHERE SubjectID = @id');

            // Xóa môn thi
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Subjects WHERE SubjectID = @id');

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ error: 'Môn thi không tồn tại' });
            }

            res.json({ message: 'Xóa môn thi thành công' });
        } catch (error) {
            console.error('Lỗi xóa môn thi:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // ==================== QUESTIONS (Câu hỏi) ====================

    // Lấy danh sách câu hỏi (có thể lọc theo môn thi)
    getAllQuestions: async (req, res) => {
        try {
            const { subjectId } = req.query;
            const pool = await connectDB();
            
            let query = 'SELECT * FROM Questions';
            let request = pool.request();

            if (subjectId) {
                query += ' WHERE SubjectID = @subjectId';
                request.input('subjectId', sql.Int, subjectId);
            }

            query += ' ORDER BY QuestionID DESC';
            const result = await request.query(query);

            res.json(result.recordset);
        } catch (error) {
            console.error('Lỗi lấy danh sách câu hỏi:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // Lấy thông tin một câu hỏi
    getQuestionById: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = await connectDB();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT * FROM Questions WHERE QuestionID = @id');

            if (result.recordset.length === 0) {
                return res.status(404).json({ error: 'Câu hỏi không tồn tại' });
            }

            res.json(result.recordset[0]);
        } catch (error) {
            console.error('Lỗi lấy thông tin câu hỏi:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // Thêm câu hỏi mới
    createQuestion: async (req, res) => {
        const { subjectId, questionText, optionA, optionB, optionC, optionD, correctAnswer } = req.body;
        if (!subjectId || !questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
            return res.status(400).json({ error: 'Thiếu thông tin câu hỏi' });
        }
        if (!['A', 'B', 'C', 'D'].includes(correctAnswer.toUpperCase())) {
            return res.status(400).json({ error: 'Đáp án đúng phải là A, B, C hoặc D' });
        }

        let pool;
        try {
            pool = await connectDB();
            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
                // Thêm câu hỏi
                const result = await new sql.Request(transaction)
                    .input('subjectId', sql.Int, subjectId)
                    .input('questionText', sql.NVarChar, questionText)
                    .input('optionA', sql.NVarChar, optionA)
                    .input('optionB', sql.NVarChar, optionB)
                    .input('optionC', sql.NVarChar, optionC)
                    .input('optionD', sql.NVarChar, optionD)
                    .input('correctAnswer', sql.Char, correctAnswer.toUpperCase())
                    .query(`
                        INSERT INTO Questions (SubjectID, QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectAnswer)
                        VALUES (@subjectId, @questionText, @optionA, @optionB, @optionC, @optionD, @correctAnswer);
                        SELECT SCOPE_IDENTITY() as QuestionID;
                    `);
                
                const questionId = result.recordset[0].QuestionID;

                // Cập nhật số lượng câu hỏi trong môn học
                await new sql.Request(transaction)
                    .input('subjectId', sql.Int, subjectId)
                    .query('UPDATE Subjects SET TotalQuestions = TotalQuestions + 1 WHERE SubjectID = @subjectId');

                await transaction.commit();

                res.status(201).json({
                    message: 'Thêm câu hỏi thành công',
                    questionId
                });
            } catch (error) {
                await transaction.rollback();
                console.error('Lỗi khi thêm câu hỏi (transaction):', error);
                res.status(500).json({ error: 'Lỗi server khi thực hiện giao dịch' });
            }
        } catch (error) {
            console.error('Lỗi kết nối database hoặc khởi tạo transaction:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // Cập nhật câu hỏi
    updateQuestion: async (req, res) => {
        try {
            const { id } = req.params;
            const { subjectId, questionText, optionA, optionB, optionC, optionD, correctAnswer } = req.body;

            if (correctAnswer && !['A', 'B', 'C', 'D'].includes(correctAnswer.toUpperCase())) {
                return res.status(400).json({ error: 'Đáp án đúng phải là A, B, C hoặc D' });
            }

            const pool = await connectDB();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('subjectId', sql.Int, subjectId)
                .input('questionText', sql.NVarChar, questionText)
                .input('optionA', sql.NVarChar, optionA)
                .input('optionB', sql.NVarChar, optionB)
                .input('optionC', sql.NVarChar, optionC)
                .input('optionD', sql.NVarChar, optionD)
                .input('correctAnswer', sql.Char, correctAnswer ? correctAnswer.toUpperCase() : null)
                .query(`
                    UPDATE Questions 
                    SET SubjectID = COALESCE(@subjectId, SubjectID),
                        QuestionText = COALESCE(@questionText, QuestionText),
                        OptionA = COALESCE(@optionA, OptionA),
                        OptionB = COALESCE(@optionB, OptionB),
                        OptionC = COALESCE(@optionC, OptionC),
                        OptionD = COALESCE(@optionD, OptionD),
                        CorrectAnswer = COALESCE(@correctAnswer, CorrectAnswer)
                    WHERE QuestionID = @id
                `);

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ error: 'Câu hỏi không tồn tại' });
            }

            res.json({ message: 'Cập nhật câu hỏi thành công' });
        } catch (error) {
            console.error('Lỗi cập nhật câu hỏi:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // Xóa câu hỏi
    deleteQuestion: async (req, res) => {
        const { id } = req.params;
        let pool;
        try {
            pool = await connectDB();
            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
                // Lấy SubjectID của câu hỏi sắp xóa
                const getSubjectIdRequest = new sql.Request(transaction);
                const subjectIdResult = await getSubjectIdRequest
                    .input('id', sql.Int, id)
                    .query('SELECT SubjectID FROM Questions WHERE QuestionID = @id');

                if (subjectIdResult.recordset.length === 0) {
                    await transaction.rollback();
                    return res.status(404).json({ error: 'Câu hỏi không tồn tại' });
                }
                const subjectId = subjectIdResult.recordset[0].SubjectID;

                // Xóa câu hỏi
                const deleteRequest = new sql.Request(transaction);
                const result = await deleteRequest
                    .input('id', sql.Int, id)
                    .query('DELETE FROM Questions WHERE QuestionID = @id');

                if (result.rowsAffected[0] === 0) {
                    await transaction.rollback();
                    return res.status(404).json({ error: 'Câu hỏi không tồn tại trong quá trình xóa' });
                }

                // Cập nhật số lượng câu hỏi
                const updateCountRequest = new sql.Request(transaction);
                await updateCountRequest
                    .input('subjectId', sql.Int, subjectId)
                    .query('UPDATE Subjects SET TotalQuestions = TotalQuestions - 1 WHERE SubjectID = @subjectId');

                await transaction.commit();
                res.json({ message: 'Xóa câu hỏi thành công' });

            } catch (error) {
                await transaction.rollback();
                console.error('Lỗi khi xóa câu hỏi (transaction):', error);
                res.status(500).json({ error: 'Lỗi server khi thực hiện giao dịch' });
            }
        } catch (error) {
            console.error('Lỗi kết nối database hoặc khởi tạo transaction:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // ==================== EXAM HISTORY (Lịch sử thi) ====================

    // Xem lịch sử thi của toàn bộ hệ thống
    getAllExamHistory: async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .query(`
                    SELECT 
                        eh.ExamID,
                        eh.UserID,
                        u.Username,
                        u.FullName,
                        eh.SubjectID,
                        s.SubjectName,
                        eh.Score,
                        eh.TotalQuestions,
                        eh.CorrectAnswers,
                        eh.ExamDate
                    FROM ExamHistory eh
                    INNER JOIN Users u ON eh.UserID = u.UserID
                    INNER JOIN Subjects s ON eh.SubjectID = s.SubjectID
                    ORDER BY eh.ExamDate DESC
                `);

            res.json(result.recordset);
        } catch (error) {
            console.error('Lỗi lấy lịch sử thi:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // ==================== USERS (Quản lý người dùng) ====================

    // Lấy danh sách tất cả người dùng
    getAllUsers: async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .query(`
                    SELECT
                        UserID,
                        Username,
                        FullName,
                        Email,
                        Role,
                        CreatedAt
                    FROM Users
                    ORDER BY CreatedAt DESC
                `);

            res.json(result.recordset);
        } catch (error) {
            console.error('Lỗi lấy danh sách người dùng:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // Lấy thông tin một người dùng
    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = await connectDB();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query(`
                    SELECT
                        UserID,
                        Username,
                        FullName,
                        Email,
                        Role,
                        CreatedAt
                    FROM Users
                    WHERE UserID = @id
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({ error: 'Người dùng không tồn tại' });
            }

            res.json(result.recordset[0]);
        } catch (error) {
            console.error('Lỗi lấy thông tin người dùng:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // Cập nhật thông tin người dùng
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { fullName, email, role } = req.body;

            const pool = await connectDB();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('fullName', sql.NVarChar, fullName)
                .input('email', sql.NVarChar, email)
                .input('role', sql.NVarChar, role)
                .query(`
                    UPDATE Users
                    SET FullName = @fullName,
                        Email = @email,
                        Role = @role
                    WHERE UserID = @id
                `);

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ error: 'Người dùng không tồn tại' });
            }

            res.json({ message: 'Cập nhật người dùng thành công' });
        } catch (error) {
            console.error('Lỗi cập nhật người dùng:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // Xóa người dùng
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;

            // Không cho phép xóa chính mình
            if (req.user.userId === parseInt(id)) {
                return res.status(400).json({ error: 'Không thể xóa tài khoản của chính mình' });
            }

            const pool = await connectDB();

            // Xóa lịch sử thi của user trước
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM ExamHistory WHERE UserID = @id');

            // Xóa user
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Users WHERE UserID = @id');

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ error: 'Người dùng không tồn tại' });
            }

            res.json({ message: 'Xóa người dùng thành công' });
        } catch (error) {
            console.error('Lỗi xóa người dùng:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // Reset mật khẩu người dùng
    resetUserPassword: async (req, res) => {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;

            if (!newPassword || newPassword.length < 6) {
                return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
            }

            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const pool = await connectDB();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('password', sql.NVarChar, hashedPassword)
                .query('UPDATE Users SET Password = @password WHERE UserID = @id');

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ error: 'Người dùng không tồn tại' });
            }

            res.json({ message: 'Reset mật khẩu thành công' });
        } catch (error) {
            console.error('Lỗi reset mật khẩu:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // ==================== EXCEL IMPORT (Nhập câu hỏi từ Excel) ====================

    // Download template file
    downloadTemplate: async (req, res) => {
        try {
            const wb = await generateQuestionTemplate();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=QuestionTemplate.xlsx');
            
            await wb.write('xlsx', res);
            res.end();
        } catch (error) {
            console.error('Lỗi download template:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // Import câu hỏi từ Excel
    importQuestions: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Chưa chọn file' });
            }

            const parseResult = await parseQuestionsFromExcel(req.file.buffer);

            if (!parseResult.success) {
                return res.status(400).json({
                    success: false,
                    message: parseResult.errors[0],
                    errors: parseResult.errors
                });
            }

            if (parseResult.data.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Không có dữ liệu hợp lệ để nhập',
                    summary: parseResult.summary,
                    errors: parseResult.errors
                });
            }

            // Insert vào database
            const pool = await connectDB();
            let importedCount = 0;
            const importErrors = [];

            for (const question of parseResult.data) {
                try {
                    await pool.request()
                        .input('subjectId', sql.Int, question.subjectId)
                        .input('questionText', sql.NVarChar, question.questionText)
                        .input('optionA', sql.NVarChar, question.optionA)
                        .input('optionB', sql.NVarChar, question.optionB)
                        .input('optionC', sql.NVarChar, question.optionC)
                        .input('optionD', sql.NVarChar, question.optionD)
                        .input('correctAnswer', sql.Char, question.correctAnswer)
                        .input('explanation', sql.NVarChar, question.explanation || null)
                        .query(`
                            INSERT INTO Questions 
                            (SubjectID, QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Explanation)
                            VALUES (@subjectId, @questionText, @optionA, @optionB, @optionC, @optionD, @correctAnswer, @explanation)
                        `);
                    
                    importedCount++;
                } catch (error) {
                    importErrors.push({
                        question: question.questionText.substring(0, 50),
                        error: error.message
                    });
                }
            }

            res.json({
                success: true,
                message: `Nhập thành công ${importedCount} câu hỏi`,
                summary: {
                    total: parseResult.summary.total,
                    imported: importedCount,
                    failed: parseResult.summary.failed,
                    databaseErrors: importErrors.length
                },
                parseErrors: parseResult.errors,
                databaseErrors: importErrors
            });

        } catch (error) {
            console.error('Lỗi nhập câu hỏi:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // ==================== CATEGORIES (Danh mục) ====================

    getAllCategories: async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request().query('SELECT * FROM Categories ORDER BY CategoryName');
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    createCategory: async (req, res) => {
        try {
            const { categoryName, description } = req.body;
            const pool = await connectDB();
            await pool.request()
                .input('name', sql.NVarChar, categoryName)
                .input('desc', sql.NVarChar, description || '')
                .query('INSERT INTO Categories (CategoryName, Description) VALUES (@name, @desc)');
            res.status(201).json({ message: 'Thêm danh mục thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // ==================== ANNOUNCEMENTS (Thông báo) ====================

    createAnnouncement: async (req, res) => {
        try {
            const { title, content } = req.body;
            const adminId = req.user.userId;
            const pool = await connectDB();
            await pool.request()
                .input('adminId', sql.Int, adminId)
                .input('title', sql.NVarChar, title)
                .input('content', sql.NVarChar, content)
                .query('INSERT INTO Announcements (AdminID, Title, Content) VALUES (@adminId, @title, @content)');
            res.status(201).json({ message: 'Đăng thông báo thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // ==================== FEEDBACKS (Phản hồi) ====================

    getAllFeedbacks: async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request().query(`
                SELECT f.*, u.FullName, s.SubjectName 
                FROM Feedbacks f
                JOIN Users u ON f.UserID = u.UserID
                LEFT JOIN Subjects s ON f.SubjectID = s.SubjectID
                ORDER BY f.CreatedAt DESC
            `);
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi server' });
        }
    }
};

module.exports = { adminController, verifyAdmin };
