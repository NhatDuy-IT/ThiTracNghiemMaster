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
        console.log(' Kết nối SQL Server thành công: ' + config.server);

        const tables = [
            {
                name: 'Categories',
                query: `
                    CREATE TABLE Categories (
                        CategoryID INT IDENTITY(1,1) PRIMARY KEY,
                        CategoryName NVARCHAR(100) NOT NULL,
                        Description NVARCHAR(500),
                        CreatedAt DATETIME DEFAULT GETDATE()
                    )
                `
            },
            {
                name: 'Subjects',
                query: `
                    CREATE TABLE Subjects (
                        SubjectID INT IDENTITY(1,1) PRIMARY KEY,
                        CategoryID INT FOREIGN KEY REFERENCES Categories(CategoryID) ON DELETE SET NULL,
                        SubjectName NVARCHAR(100) NOT NULL,
                        Description NVARCHAR(500),
                        Duration INT DEFAULT 45,
                        TotalQuestions INT DEFAULT 0,
                        CreatedAt DATETIME DEFAULT GETDATE()
                    )
                `
            },
            {
                name: 'Users',
                query: `
                    CREATE TABLE Users (
                        UserID INT IDENTITY(1,1) PRIMARY KEY,
                        Username NVARCHAR(50) UNIQUE NOT NULL,
                        Password NVARCHAR(255) NOT NULL,
                        FullName NVARCHAR(100),
                        Email NVARCHAR(100),
                        AvatarPath NVARCHAR(255),
                        Role NVARCHAR(20) CHECK (Role IN ('Admin', 'User')) DEFAULT 'User',
                        CreatedAt DATETIME DEFAULT GETDATE()
                    )
                `
            },
            {
                name: 'Questions',
                query: `
                    CREATE TABLE Questions (
                        QuestionID INT IDENTITY(1,1) PRIMARY KEY,
                        SubjectID INT FOREIGN KEY REFERENCES Subjects(SubjectID) ON DELETE CASCADE,
                        QuestionText NVARCHAR(MAX) NOT NULL,
                        OptionA NVARCHAR(500) NOT NULL,
                        OptionB NVARCHAR(500) NOT NULL,
                        OptionC NVARCHAR(500) NOT NULL,
                        OptionD NVARCHAR(500) NOT NULL,
                        CorrectAnswer CHAR(1) CHECK (CorrectAnswer IN ('A', 'B', 'C', 'D')) NOT NULL,
                        Explanation NVARCHAR(MAX),
                        CreatedAt DATETIME DEFAULT GETDATE()
                    )
                `
            },
            {
                name: 'ExamHistory',
                query: `
                    CREATE TABLE ExamHistory (
                        ExamID INT IDENTITY(1,1) PRIMARY KEY,
                        UserID INT FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
                        SubjectID INT FOREIGN KEY REFERENCES Subjects(SubjectID) ON DELETE CASCADE,
                        Score FLOAT NOT NULL,
                        TotalQuestions INT NOT NULL,
                        CorrectAnswers INT NOT NULL,
                        ExamDate DATETIME DEFAULT GETDATE()
                    )
                `
            },
            {
                name: 'ExamDetails',
                query: `
                    CREATE TABLE ExamDetails (
                        DetailID INT IDENTITY(1,1) PRIMARY KEY,
                        ExamID INT FOREIGN KEY REFERENCES ExamHistory(ExamID) ON DELETE CASCADE,
                        QuestionID INT FOREIGN KEY REFERENCES Questions(QuestionID) ON DELETE NO ACTION,
                        UserAnswer CHAR(1),
                        IsCorrect BIT,
                        CreatedAt DATETIME DEFAULT GETDATE()
                    )
                `
            },
            {
                name: 'Classes',
                query: `
                    CREATE TABLE Classes (
                        ClassID INT IDENTITY(1,1) PRIMARY KEY,
                        ClassName NVARCHAR(100) NOT NULL,
                        ClassCode NVARCHAR(20) UNIQUE NOT NULL,
                        Description NVARCHAR(500),
                        CreatedAt DATETIME DEFAULT GETDATE()
                    )
                `
            },
            {
                name: 'ClassMembers',
                query: `
                    CREATE TABLE ClassMembers (
                        MemberID INT IDENTITY(1,1) PRIMARY KEY,
                        ClassID INT FOREIGN KEY REFERENCES Classes(ClassID) ON DELETE CASCADE,
                        UserID INT FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
                        JoinedAt DATETIME DEFAULT GETDATE(),
                        CONSTRAINT UC_ClassMember UNIQUE(ClassID, UserID)
                    )
                `
            },
            {
                name: 'Announcements',
                query: `
                    CREATE TABLE Announcements (
                        AnnouncementID INT IDENTITY(1,1) PRIMARY KEY,
                        AdminID INT FOREIGN KEY REFERENCES Users(UserID),
                        Title NVARCHAR(200) NOT NULL,
                        Content NVARCHAR(MAX) NOT NULL,
                        IsActive BIT DEFAULT 1,
                        CreatedAt DATETIME DEFAULT GETDATE()
                    )
                `
            },
            {
                name: 'Feedbacks',
                query: `
                    CREATE TABLE Feedbacks (
                        FeedbackID INT IDENTITY(1,1) PRIMARY KEY,
                        UserID INT FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
                        SubjectID INT FOREIGN KEY REFERENCES Subjects(SubjectID) ON DELETE SET NULL,
                        Message NVARCHAR(MAX) NOT NULL,
                        Status NVARCHAR(20) DEFAULT 'Pending',
                        CreatedAt DATETIME DEFAULT GETDATE()
                    )
                `
            }
        ];

        for (const table of tables) {
            const checkQuery = `IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '${table.name}') BEGIN ${table.query} END`;
            await pool.request().query(checkQuery);
            console.log(`- Bảng ${table.name}: OK`);
        }

        // Đảm bảo cột CategoryID có trong Subjects
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Subjects') AND name = 'CategoryID')
            BEGIN
                ALTER TABLE Subjects ADD CategoryID INT FOREIGN KEY REFERENCES Categories(CategoryID) ON DELETE SET NULL;
                PRINT 'Added CategoryID to Subjects';
            END
        `);

        // Đảm bảo cột AvatarPath có trong Users
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'AvatarPath')
            BEGIN
                ALTER TABLE Users ADD AvatarPath NVARCHAR(255);
            END
        `);

        // Đảm bảo cột Explanation có trong Questions
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Questions') AND name = 'Explanation')
            BEGIN
                ALTER TABLE Questions ADD Explanation NVARCHAR(MAX);
            END
        `);

        console.log('\n NÂNG CẤP SCHEMA THÀNH CÔNG (10 BẢNG)!');
        pool.close();
        process.exit(0);
    } catch (error) {
        console.error('\n LỖI:', error.message);
        process.exit(1);
    }
}

updateSchema();
