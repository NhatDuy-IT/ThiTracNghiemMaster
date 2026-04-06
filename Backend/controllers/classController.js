const { sql, connectDB } = require('../database');

const classController = {
    // Lấy danh sách tất cả các lớp
    getAllClasses: async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request().query('SELECT * FROM Classes ORDER BY CreatedAt DESC');
            res.json(result.recordset);
        } catch (error) {
            console.error('Lỗi lấy danh sách lớp:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // Tạo lớp học mới
    createClass: async (req, res) => {
        try {
            const { className, classCode, description } = req.body;
            if (!className || !classCode) {
                return res.status(400).json({ error: 'Thiếu tên hoặc mã lớp' });
            }

            const pool = await connectDB();
            await pool.request()
                .input('name', sql.NVarChar, className)
                .input('code', sql.NVarChar, classCode)
                .input('desc', sql.NVarChar, description || '')
                .query('INSERT INTO Classes (ClassName, ClassCode, Description) VALUES (@name, @code, @desc)');

            res.status(201).json({ message: 'Tạo lớp học thành công' });
        } catch (error) {
            console.error('Lỗi tạo lớp:', error);
            if (error.message.includes('UNIQUE')) {
                return res.status(400).json({ error: 'Mã lớp đã tồn tại' });
            }
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // Thêm sinh viên vào lớp
    addMember: async (req, res) => {
        try {
            const { classId, userId } = req.body;
            const pool = await connectDB();

            await pool.request()
                .input('classId', sql.Int, classId)
                .input('userId', sql.Int, userId)
                .query('INSERT INTO ClassMembers (ClassID, UserID) VALUES (@classId, @userId)');

            res.json({ message: 'Thêm sinh viên vào lớp thành công' });
        } catch (error) {
            console.error('Lỗi thêm thành viên:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // Lấy danh sách thành viên của một lớp
    getClassMembers: async (req, res) => {
        try {
            const { classId } = req.params;
            const pool = await connectDB();

            const result = await pool.request()
                .input('classId', sql.Int, classId)
                .query(`
                    SELECT u.UserID, u.Username, u.FullName, u.Email, cm.JoinedAt
                    FROM ClassMembers cm
                    JOIN Users u ON cm.UserID = u.UserID
                    WHERE cm.ClassID = @classId
                `);

            res.json(result.recordset);
        } catch (error) {
            console.error('Lỗi lấy thành viên lớp:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    }
};

module.exports = classController;
