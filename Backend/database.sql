-- =============================================
-- Script Thiết Kế CSDL Toàn Diện cho ExamMaster (10 Bảng)
-- =============================================

-- 1. Tạo CSDL nếu chưa tồn tại
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'TracNghiemWebSite')
BEGIN
    CREATE DATABASE TracNghiemWebSite;
END
GO

USE TracNghiemWebSite;
GO

-- =============================================
-- 1. Bảng Users (Người dùng)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        UserID INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(50) UNIQUE NOT NULL,
        Password NVARCHAR(255) NOT NULL,
        FullName NVARCHAR(100),
        Email NVARCHAR(100),
        AvatarPath NVARCHAR(255),
        Role NVARCHAR(20) CHECK (Role IN ('Admin', 'User')) DEFAULT 'User',
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- =============================================
-- 2. Bảng Categories (Danh mục môn học)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Categories')
BEGIN
    CREATE TABLE Categories (
        CategoryID INT IDENTITY(1,1) PRIMARY KEY,
        CategoryName NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500),
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- =============================================
-- 3. Bảng Subjects (Môn thi)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Subjects')
BEGIN
    CREATE TABLE Subjects (
        SubjectID INT IDENTITY(1,1) PRIMARY KEY,
        CategoryID INT FOREIGN KEY REFERENCES Categories(CategoryID) ON DELETE SET NULL,
        SubjectName NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500),
        Duration INT DEFAULT 45,
        TotalQuestions INT DEFAULT 0,
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- =============================================
-- 4. Bảng Questions (Câu hỏi)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Questions')
BEGIN
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
    );
END
GO

-- =============================================
-- 5. Bảng ExamHistory (Lịch sử thi)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ExamHistory')
BEGIN
    CREATE TABLE ExamHistory (
        ExamID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
        SubjectID INT FOREIGN KEY REFERENCES Subjects(SubjectID) ON DELETE CASCADE,
        Score FLOAT NOT NULL,
        TotalQuestions INT NOT NULL,
        CorrectAnswers INT NOT NULL,
        ExamDate DATETIME DEFAULT GETDATE()
    );
END
GO

-- =============================================
-- 6. Bảng ExamDetails (Chi tiết bài thi)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ExamDetails')
BEGIN
    CREATE TABLE ExamDetails (
        DetailID INT IDENTITY(1,1) PRIMARY KEY,
        ExamID INT FOREIGN KEY REFERENCES ExamHistory(ExamID) ON DELETE CASCADE,
        QuestionID INT FOREIGN KEY REFERENCES Questions(QuestionID) ON DELETE NO ACTION,
        UserAnswer CHAR(1),
        IsCorrect BIT,
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- =============================================
-- 7. Bảng Classes (Lớp học)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Classes')
BEGIN
    CREATE TABLE Classes (
        ClassID INT IDENTITY(1,1) PRIMARY KEY,
        ClassName NVARCHAR(100) NOT NULL,
        ClassCode NVARCHAR(20) UNIQUE NOT NULL,
        Description NVARCHAR(500),
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- =============================================
-- 8. Bảng ClassMembers (Thành viên lớp học)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ClassMembers')
BEGIN
    CREATE TABLE ClassMembers (
        MemberID INT IDENTITY(1,1) PRIMARY KEY,
        ClassID INT FOREIGN KEY REFERENCES Classes(ClassID) ON DELETE CASCADE,
        UserID INT FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
        JoinedAt DATETIME DEFAULT GETDATE(),
        CONSTRAINT UC_ClassMember UNIQUE(ClassID, UserID)
    );
END
GO

-- =============================================
-- 9. Bảng Announcements (Thông báo)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Announcements')
BEGIN
    CREATE TABLE Announcements (
        AnnouncementID INT IDENTITY(1,1) PRIMARY KEY,
        AdminID INT FOREIGN KEY REFERENCES Users(UserID),
        Title NVARCHAR(200) NOT NULL,
        Content NVARCHAR(MAX) NOT NULL,
        IsActive BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- =============================================
-- 10. Bảng Feedbacks (Phản hồi)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Feedbacks')
BEGIN
    CREATE TABLE Feedbacks (
        FeedbackID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
        SubjectID INT FOREIGN KEY REFERENCES Subjects(SubjectID) ON DELETE SET NULL,
        Message NVARCHAR(MAX) NOT NULL,
        Status NVARCHAR(20) DEFAULT 'Pending', -- Pending, Reviewed, ActionTaken
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

PRINT N'✅ Đã khởi tạo cấu trúc 10 bảng thành công!';
