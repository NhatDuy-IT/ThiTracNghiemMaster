const fs = require('fs');
const path = require('path');

// 1. UPDATE adminController.js
const adminCtrlPath = path.join(__dirname, '..', 'Backend', 'controllers', 'adminController.js');
let adminCtrl = fs.readFileSync(adminCtrlPath, 'utf8');

const oldAdminCategories = `    createCategory: async (req, res) => {
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
    },`;

const newAdminCategories = `    createCategory: async (req, res) => {
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

    updateCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const { categoryName, description } = req.body;
            const pool = await connectDB();
            await pool.request()
                .input('id', sql.Int, id)
                .input('name', sql.NVarChar, categoryName)
                .input('desc', sql.NVarChar, description || '')
                .query('UPDATE Categories SET CategoryName = @name, Description = @desc WHERE CategoryID = @id');
            res.json({ message: 'Cập nhật danh mục thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    deleteCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = await connectDB();
            // Set CategoryID null cho cac subject trước khi xoa
            await pool.request()
                .input('id', sql.Int, id)
                .query('UPDATE Subjects SET CategoryID = NULL WHERE CategoryID = @id');
            // Xóa Category
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Categories WHERE CategoryID = @id');
            res.json({ message: 'Xóa danh mục thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi server' });
        }
    },`;

adminCtrl = adminCtrl.replace(oldAdminCategories, newAdminCategories);

const oldAdminAnnouncements = `    createAnnouncement: async (req, res) => {
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
    },`;

const newAdminAnnouncements = `    createAnnouncement: async (req, res) => {
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

    updateAnnouncement: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, content } = req.body;
            const pool = await connectDB();
            await pool.request()
                .input('id', sql.Int, id)
                .input('title', sql.NVarChar, title)
                .input('content', sql.NVarChar, content)
                .query('UPDATE Announcements SET Title = @title, Content = @content WHERE AnnouncementID = @id');
            res.json({ message: 'Cập nhật thông báo thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    deleteAnnouncement: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = await connectDB();
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Announcements WHERE AnnouncementID = @id');
            res.json({ message: 'Xóa thông báo thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi server' });
        }
    },`;

adminCtrl = adminCtrl.replace(oldAdminAnnouncements, newAdminAnnouncements);

const oldAdminFeedbacks = `    getAllFeedbacks: async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request().query(\`
                SELECT f.*, u.FullName, s.SubjectName 
                FROM Feedbacks f
                JOIN Users u ON f.UserID = u.UserID
                LEFT JOIN Subjects s ON f.SubjectID = s.SubjectID
                ORDER BY f.CreatedAt DESC
            \`);
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi server' });
        }
    }
};`;

const newAdminFeedbacks = `    getAllFeedbacks: async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request().query(\`
                SELECT f.*, u.FullName, s.SubjectName 
                FROM Feedbacks f
                JOIN Users u ON f.UserID = u.UserID
                LEFT JOIN Subjects s ON f.SubjectID = s.SubjectID
                ORDER BY f.CreatedAt DESC
            \`);
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    deleteFeedback: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = await connectDB();
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Feedbacks WHERE FeedbackID = @id');
            res.json({ message: 'Xóa phản hồi thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi server' });
        }
    }
};`;

adminCtrl = adminCtrl.replace(oldAdminFeedbacks, newAdminFeedbacks);

fs.writeFileSync(adminCtrlPath, adminCtrl);

// 2. UPDATE admin.js routes
const adminRoutesPath = path.join(__dirname, '..', 'Backend', 'routes', 'admin.js');
let adminRoutes = fs.readFileSync(adminRoutesPath, 'utf8');

adminRoutes = adminRoutes.replace(
    `router.post('/categories', adminController.createCategory);`,
    `router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);`
);

adminRoutes = adminRoutes.replace(
    `router.post('/announcements', adminController.createAnnouncement);`,
    `router.post('/announcements', adminController.createAnnouncement);
router.put('/announcements/:id', adminController.updateAnnouncement);
router.delete('/announcements/:id', adminController.deleteAnnouncement);`
);

adminRoutes = adminRoutes.replace(
    `router.get('/feedbacks', adminController.getAllFeedbacks);`,
    `router.get('/feedbacks', adminController.getAllFeedbacks);
router.delete('/feedbacks/:id', adminController.deleteFeedback);`
);

fs.writeFileSync(adminRoutesPath, adminRoutes);

// 3. UPDATE classController.js
const classCtrlPath = path.join(__dirname, '..', 'Backend', 'controllers', 'classController.js');
let classCtrl = fs.readFileSync(classCtrlPath, 'utf8');

const oldClassCtrlMethods = `    addMember: async (req, res) => {
        try {
            const { classId, userId } = req.body;
            const pool = await connectDB();
            await pool.request()
                .input('classId', sql.Int, classId)
                .input('userId', sql.Int, userId)
                .query('INSERT INTO ClassMembers (ClassID, UserID) VALUES (@classId, @userId)');
            res.status(201).json({ message: 'Thêm thành viên thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi thêm thành viên (có thể đã tồn tại)' });
        }
    },`;

const newClassCtrlMethods = `    addMember: async (req, res) => {
        try {
            const { classId, userId } = req.body;
            const pool = await connectDB();
            await pool.request()
                .input('classId', sql.Int, classId)
                .input('userId', sql.Int, userId)
                .query('INSERT INTO ClassMembers (ClassID, UserID) VALUES (@classId, @userId)');
            res.status(201).json({ message: 'Thêm thành viên thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi thêm thành viên (có thể đã tồn tại)' });
        }
    },

    updateClass: async (req, res) => {
        try {
            const { id } = req.params;
            const { classCode, className, description } = req.body;
            const pool = await connectDB();
            await pool.request()
                .input('id', sql.Int, id)
                .input('classCode', sql.NVarChar, classCode)
                .input('className', sql.NVarChar, className)
                .input('desc', sql.NVarChar, description || '')
                .query('UPDATE Classes SET ClassCode = @classCode, ClassName = @className, Description = @desc WHERE ClassID = @id');
            res.json({ message: 'Cập nhật thông tin lớp thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    deleteClass: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = await connectDB();
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM ClassMembers WHERE ClassID = @id');
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Classes WHERE ClassID = @id');
            res.json({ message: 'Xóa lớp học thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    removeMember: async (req, res) => {
        try {
            const { classId, userId } = req.body; // Hoặc params
            const pool = await connectDB();
            await pool.request()
                .input('classId', sql.Int, classId)
                .input('userId', sql.Int, userId)
                .query('DELETE FROM ClassMembers WHERE ClassID = @classId AND UserID = @userId');
            res.json({ message: 'Xóa thành viên khỏi lớp thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi server' });
        }
    },`;

if(classCtrl.includes('updateClass:')) {
    console.log('Class CRUD already updated');
} else {
    classCtrl = classCtrl.replace(oldClassCtrlMethods, newClassCtrlMethods);
    fs.writeFileSync(classCtrlPath, classCtrl);
}

// 4. UPDATE class.js routes
const classRoutesPath = path.join(__dirname, '..', 'Backend', 'routes', 'class.js');
let classRoutes = fs.readFileSync(classRoutesPath, 'utf8');

if(!classRoutes.includes('deleteClass')) {
    classRoutes = classRoutes.replace(
        `router.post('/add-member', verifyAdmin, classController.addMember);`,
        `router.post('/add-member', verifyAdmin, classController.addMember);
router.put('/:id', verifyAdmin, classController.updateClass);
router.delete('/:id', verifyAdmin, classController.deleteClass);
router.delete('/remove-member', verifyAdmin, classController.removeMember);`
    );
    fs.writeFileSync(classRoutesPath, classRoutes);
}

// 5. UPDATE api.js
const apiPath = path.join(__dirname, '..', 'Frontend', 'js', 'api.js');
let apiJs = fs.readFileSync(apiPath, 'utf8');

apiJs = apiJs.replace(
    `createCategory: (data) => authenticatedFetch(\`\${BASE_URL}/admin/categories\`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),`,
    `createCategory: (data) => authenticatedFetch(\`\${BASE_URL}/admin/categories\`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateCategory: (id, data) => authenticatedFetch(\`\${BASE_URL}/admin/categories/\${id}\`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    deleteCategory: (id) => authenticatedFetch(\`\${BASE_URL}/admin/categories/\${id}\`, {
        method: 'DELETE'
    }),`
);

apiJs = apiJs.replace(
    `createAnnouncement: (data) => authenticatedFetch(\`\${BASE_URL}/admin/announcements\`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),`,
    `createAnnouncement: (data) => authenticatedFetch(\`\${BASE_URL}/admin/announcements\`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateAnnouncement: (id, data) => authenticatedFetch(\`\${BASE_URL}/admin/announcements/\${id}\`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    deleteAnnouncement: (id) => authenticatedFetch(\`\${BASE_URL}/admin/announcements/\${id}\`, {
        method: 'DELETE'
    }),`
);

apiJs = apiJs.replace(
    `getFeedbacks: () => authenticatedFetch(\`\${BASE_URL}/admin/feedbacks\`)`,
    `getFeedbacks: () => authenticatedFetch(\`\${BASE_URL}/admin/feedbacks\`),
    deleteFeedback: (id) => authenticatedFetch(\`\${BASE_URL}/admin/feedbacks/\${id}\`, {
        method: 'DELETE'
    })`
);

apiJs = apiJs.replace(
    `addMember: (data) => authenticatedFetch(\`\${BASE_URL}/class/add-member\`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),`,
    `addMember: (data) => authenticatedFetch(\`\${BASE_URL}/class/add-member\`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateClass: (id, data) => authenticatedFetch(\`\${BASE_URL}/class/\${id}\`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    deleteClass: (id) => authenticatedFetch(\`\${BASE_URL}/class/\${id}\`, {
        method: 'DELETE'
    }),
    removeMember: (data) => authenticatedFetch(\`\${BASE_URL}/class/remove-member\`, {
        method: 'DELETE',
        body: JSON.stringify(data)
    }),`
);

fs.writeFileSync(apiPath, apiJs);

console.log("CRUD Backend APIs patched successfully.");
