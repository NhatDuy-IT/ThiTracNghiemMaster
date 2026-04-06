const fs = require('fs');
const path = require('path');

const adminHtmlPath = path.join(__dirname, '..', 'Frontend', 'admin.html');
let adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');

// 1. Fix Syntax Errors (Orphaned blocks around line 870-875)
// The issue was at:
// } else showAlert('Lỗi lưu thông báo', 'error');
//             } catch(e) { showAlert('Lỗi kết nối', 'error'); }
//         }
adminHtml = adminHtml.replace(/showAlert\(editId \? 'Cập nhật thông báo thành công' : 'Đăng thông báo thành công', 'success'\);[\s\S]*?\} else showAlert\('Lỗi lưu thông báo', 'error'\);[\s\S]*?\} catch\(e\) \{ showAlert\('Lỗi kết nối', 'error'\); \}\r?\n\s+\}/,
`showAlert(editId ? 'Cập nhật thông báo thành công' : 'Đăng thông báo thành công', 'success');
                } else showAlert('Lỗi lưu thông báo', 'error');
            } catch(e) { showAlert('Lỗi kết nối', 'error'); }
        }`);

// 2. Fix showTab Duplications
adminHtml = adminHtml.replace(/if \(tab === 'subjects'\) loadSubjects\(\);\r?\n\s+if \(tab === 'questions'\) loadQuestions\(\);\r?\n\s+if \(tab === 'users'\) loadUsers\(\);\r?\n\s+if \(tab === 'history'\) loadHistory\(\);\r?\n\s+if \(tab === 'categories'\) loadCategories\(\);\r?\n\s+if \(tab === 'classes'\) loadClasses\(\);\r?\n\s+if \(tab === 'announcements'\) loadAnnouncements\(\);\r?\n\s+if \(tab === 'feedbacks'\) loadFeedbacks\(\);\r?\n\s+if \(tab === 'questions'\) loadQuestions\(\);\r?\n\s+if \(tab === 'users'\) loadUsers\(\);\r?\n\s+if \(tab === 'history'\) loadHistory\(\);/,
`if (tab === 'subjects') loadSubjects();
            if (tab === 'questions') loadQuestions();
            if (tab === 'users') loadUsers();
            if (tab === 'history') loadHistory();
            if (tab === 'categories') loadCategories();
            if (tab === 'classes') loadClasses();
            if (tab === 'announcements') loadAnnouncements();
            if (tab === 'feedbacks') loadFeedbacks();`);

// 3. Remove global load... calls that cause redundant requests on start
// Keep only loadSubjects() at the very end or showTab('subjects')
adminHtml = adminHtml.replace(/\/\/ Call loadCategories on start\r?\n\s+loadCategories\(\);/, "// Initial data will be loaded via showTab('subjects') or explicit calls if needed.");

fs.writeFileSync(adminHtmlPath, adminHtml);
console.log("Cleanup DONE Final");
