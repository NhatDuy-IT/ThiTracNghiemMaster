const { sql, connectDB } = require('../Backend/database');

async function seedData() {
    try {
        const pool = await connectDB();
        console.log("Connected to DB for seeding...");

        // 1. Seed Categories
        const categories = [
            ['Công nghệ thông tin', 'Các môn học về lập trình, mạng, AI...'],
            ['Kinh tế', 'Các môn về quản trị, tài chính...'],
            ['Ngoại ngữ', 'Tiếng Anh, Tiếng Nhật, Tiếng Trung...']
        ];

        for (const [name, desc] of categories) {
            const check = await pool.request().input('name', sql.NVarChar, name).query('SELECT CategoryID FROM Categories WHERE CategoryName = @name');
            if (check.recordset.length === 0) {
                await pool.request()
                    .input('name', sql.NVarChar, name)
                    .input('desc', sql.NVarChar, desc)
                    .query('INSERT INTO Categories (CategoryName, Description) VALUES (@name, @desc)');
                console.log(`Added Category: ${name}`);
            }
        }

        // 2. Seed Classes
        const classes = [
            ['SE1501', 'Kỹ thuật phần mềm 1', 'Lớp chuyên ngành phần mềm'],
            ['IA1502', 'An toàn thông tin 2', 'Lớp chuyên ngành bảo mật']
        ];

        for (const [code, name, desc] of classes) {
            const check = await pool.request().input('code', sql.NVarChar, code).query('SELECT ClassID FROM Classes WHERE ClassCode = @code');
            if (check.recordset.length === 0) {
                await pool.request()
                    .input('code', sql.NVarChar, code)
                    .input('name', sql.NVarChar, name)
                    .input('desc', sql.NVarChar, desc)
                    .query('INSERT INTO Classes (ClassCode, ClassName, Description) VALUES (@code, @name, @desc)');
                console.log(`Added Class: ${code}`);
            }
        }

        // 3. Seed Announcements
        const admin = await pool.request().query("SELECT TOP 1 UserID FROM Users WHERE Role = 'Admin'");
        if (admin.recordset.length > 0) {
            const adminId = admin.recordset[0].UserID;
            const ann = await pool.request().query('SELECT AnnouncementID FROM Announcements');
            if (ann.recordset.length === 0) {
                await pool.request()
                    .input('adminId', sql.Int, adminId)
                    .input('title', sql.NVarChar, 'Chào mừng đến với ExamMaster')
                    .input('content', sql.NVarChar, 'Hệ thống thi trắc nghiệm trực tuyến ExamMaster version 1.0 chính thức ra mắt.')
                    .query('INSERT INTO Announcements (AdminID, Title, Content) VALUES (@adminId, @title, @content)');
                console.log('Added Sample Announcement');
            }
        }

        // 4. Seed Feedbacks
        const user = await pool.request().query("SELECT TOP 1 UserID FROM Users WHERE Role = 'User'");
        const subject = await pool.request().query('SELECT TOP 1 SubjectID FROM Subjects');
        if (user.recordset.length > 0 && subject.recordset.length > 0) {
            const userId = user.recordset[0].UserID;
            const subjectId = subject.recordset[0].SubjectID;
            const fb = await pool.request().query('SELECT FeedbackID FROM Feedbacks');
            if (fb.recordset.length === 0) {
                await pool.request()
                    .input('userId', sql.Int, userId)
                    .input('subId', sql.Int, subjectId)
                    .input('msg', sql.NVarChar, 'Đề thi môn này rất hay và sát với thực tế.')
                    .query('INSERT INTO Feedbacks (UserID, SubjectID, Message) VALUES (@userId, @subId, @msg)');
                console.log('Added Sample Feedback');
            }
        }

        console.log("Seeding completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seedData();
