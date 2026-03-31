const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, connectDB } = require('../database');
const { OAuth2Client } = require('google-auth-library');

const JWT_SECRET = 'your-secret-key-change-in-production';
const GOOGLE_CLIENT_ID = '9283643935-t4gksptkt24m4k8e21o87414cgtjd14l.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const authController = {
    // Đăng ký
    register: async (req, res) => {
        try {
            const { username, password, fullName, email } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: 'Username và password là bắt buộc' });
            }

            const pool = await connectDB();

            // Kiểm tra username đã tồn tại chưa
            const checkUser = await pool.request()
                .input('username', sql.NVarChar, username)
                .query('SELECT UserID FROM Users WHERE Username = @username');

            if (checkUser.recordset.length > 0) {
                return res.status(400).json({ error: 'Username đã tồn tại' });
            }

            // Mã hóa password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Thêm user mới
            const result = await pool.request()
                .input('username', sql.NVarChar, username)
                .input('password', sql.NVarChar, hashedPassword)
                .input('fullName', sql.NVarChar, fullName || '')
                .input('email', sql.NVarChar, email || '')
                .input('role', sql.NVarChar, 'User')
                .query(`
                    INSERT INTO Users (Username, Password, FullName, Email, Role)
                    VALUES (@username, @password, @fullName, @email, @role);
                    SELECT SCOPE_IDENTITY() as UserID;
                `);

            const userId = result.recordset[0].UserID;

            res.status(201).json({
                message: 'Đăng ký thành công',
                user: {
                    userId,
                    username,
                    fullName,
                    email,
                    role: 'User'
                }
            });
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // Đăng nhập
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: 'Username và password là bắt buộc' });
            }

            const pool = await connectDB();

            // Tìm user
            const result = await pool.request()
                .input('username', sql.NVarChar, username)
                .query('SELECT * FROM Users WHERE Username = @username');

            if (result.recordset.length === 0) {
                return res.status(401).json({ error: 'Username hoặc password không đúng' });
            }

            const user = result.recordset[0];

            // Kiểm tra password
            const isMatch = await bcrypt.compare(password, user.Password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Username hoặc password không đúng' });
            }

            // Tạo JWT token
            const token = jwt.sign(
                { userId: user.UserID, username: user.Username, role: user.Role },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Đăng nhập thành công',
                token,
                user: {
                    userId: user.UserID,
                    username: user.Username,
                    fullName: user.FullName,
                    email: user.Email,
                    role: user.Role
                }
            });
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    },

    // Đăng nhập Google
    googleLogin: async (req, res) => {
        try {
            const { credential } = req.body;
            if (!credential) {
                return res.status(400).json({ error: 'Thiếu Google credential token' });
            }

            // Verify Google Token
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            
            const email = payload['email'];
            const name = payload['name'];
            const picture = payload['picture'];

            if (!email) {
                return res.status(400).json({ error: 'Không thể lấy email từ Google' });
            }

            const pool = await connectDB();

            // Tìm user qua Email
            const checkUser = await pool.request()
                .input('email', sql.NVarChar, email)
                .query('SELECT * FROM Users WHERE Email = @email');

            let user;

            if (checkUser.recordset.length > 0) {
                // User đã tồn tại -> Đăng nhập
                user = checkUser.recordset[0];
                
                // Cập nhật lại Avatar nếu cần thiết
                if (!user.AvatarPath && picture) {
                    await pool.request()
                        .input('email', sql.NVarChar, email)
                        .input('avatar', sql.NVarChar, picture)
                        .query('UPDATE Users SET AvatarPath = @avatar WHERE Email = @email');
                    user.AvatarPath = picture;
                }
            } else {
                // User chưa tồn tại -> Tạo mới với Username = Email
                const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-10) + Date.now().toString(), 10);
                
                // Đảm bảo username không bị trùng do user tạo tay
                const checkUsername = await pool.request()
                    .input('username', sql.NVarChar, email)
                    .query('SELECT UserID FROM Users WHERE Username = @username');
                    
                const finalUsername = checkUsername.recordset.length > 0 ? email + "_" + Math.floor(Math.random()*1000) : email;

                const insertResult = await pool.request()
                    .input('username', sql.NVarChar, finalUsername)
                    .input('password', sql.NVarChar, randomPassword)
                    .input('fullName', sql.NVarChar, name || '')
                    .input('email', sql.NVarChar, email)
                    .input('role', sql.NVarChar, 'User')
                    .input('avatar', sql.NVarChar, picture || '')
                    .query(`
                        INSERT INTO Users (Username, Password, FullName, Email, Role, AvatarPath)
                        VALUES (@username, @password, @fullName, @email, @role, @avatar);
                        SELECT SCOPE_IDENTITY() as UserID;
                    `);

                user = {
                    UserID: insertResult.recordset[0].UserID,
                    Username: finalUsername,
                    FullName: name,
                    Email: email,
                    Role: 'User',
                    AvatarPath: picture
                };
            }

            // Cấp JWT Token
            const token = jwt.sign(
                { userId: user.UserID, username: user.Username, role: user.Role },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Đăng nhập Google thành công',
                token,
                user: {
                    userId: user.UserID,
                    username: user.Username,
                    fullName: user.FullName,
                    email: user.Email,
                    role: user.Role,
                    avatar: user.AvatarPath
                }
            });
        } catch (error) {
            console.error('Lỗi đăng nhập Google:', error);
            res.status(500).json({ error: 'Lỗi server hoặc lỗi xác thực từ Google' });
        }
    }
};

module.exports = authController;

