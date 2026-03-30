const sql = require('mssql/msnodesqlv8');

const config = {
    server: 'MSI\\SQLEXPRESS01',
    database: 'TracNghiemWebSite',
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true,
        encrypt: false,
        trustServerCertificate: true
    }
};

async function updateSchema() {
    try {
        let pool = await sql.connect(config);
        console.log(' Kết nối SQL Server thành công');

        // Thêm cột AvatarPath vào bảng Users
        console.log('\n Thêm cột AvatarPath vào Users table...');
        await pool.request()
            .query(`
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'AvatarPath')
                BEGIN
                    ALTER TABLE Users ADD AvatarPath NVARCHAR(255);
                    PRINT 'AvatarPath column added to Users table';
                END
                ELSE
                BEGIN
                    PRINT 'AvatarPath column already exists in Users table';
                END
            `);
        console.log(' Cột AvatarPath đã được xử lý');

        // Thêm cột Explanation vào bảng Questions
        console.log('\n📝 Thêm cột Explanation vào Questions table...');
        await pool.request()
            .query(`
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Questions') AND name = 'Explanation')
                BEGIN
                    ALTER TABLE Questions ADD Explanation NVARCHAR(MAX);
                    PRINT 'Explanation column added to Questions table';
                END
                ELSE
                BEGIN
                    PRINT 'Explanation column already exists in Questions table';
                END
            `);
        console.log(' Cột Explanation đã được xử lý');

        // Thêm cột TotalQuestions vào bảng Subjects
        console.log('\n Thêm cột TotalQuestions vào Subjects table...');
        await pool.request()
            .query(`
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Subjects') AND name = 'TotalQuestions')
                BEGIN
                    ALTER TABLE Subjects ADD TotalQuestions INT DEFAULT 0;
                    PRINT 'TotalQuestions column added to Subjects table';
                END
                ELSE
                BEGIN
                    PRINT 'TotalQuestions column already exists in Subjects table';
                END
            `);
        console.log(' Cột TotalQuestions đã được xử lý');

        console.log('\n CẬP NHẬT SCHEMA THÀNH CÔNG!');
        console.log('\n Database schema đã sẵn sàng cho Avatar Upload & Excel Import');

        pool.close();
        process.exit(0);
    } catch (error) {
        console.error('\n LỖI:', error.message);
        process.exit(1);
    }
}

updateSchema();
