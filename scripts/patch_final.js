const fs = require('fs');
const path = require('path');

const adminHtmlPath = path.join(__dirname, '..', 'Frontend', 'admin.html');
let adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');

// 1. Fix loadCategories row mapping
adminHtml = adminHtml.replace(/tbody\.innerHTML = categories\.map\(c => `\r?\n\s+<tr class="hover:bg-slate-50 dark:hover:bg-slate-700\/50">\r?\n\s+<td class="px-6 py-4">\${c\.CategoryID}<\/td>\r?\n\s+<td class="px-6 py-4 font-bold">\${c\.CategoryName}<\/td>\r?\n\s+<td class="px-6 py-4 text-slate-500">\${c\.Description \|\| '-'\}<\/td>\r?\n\s+<td class="px-6 py-4">\${new Date\(c\.CreatedAt\)\.toLocaleDateString\('vi-VN'\)\}<\/td>\r?\n\s+<\/tr>\r?\n\s+`\)\.join\(''\);/, 
`tbody.innerHTML = categories.map(c => \`
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td class="px-6 py-4">\${c.CategoryID}</td>
                        <td class="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">\${c.CategoryName}</td>
                        <td class="px-6 py-4 text-slate-500">\${c.Description || '-'}</td>
                        <td class="px-6 py-4">\${new Date(c.CreatedAt).toLocaleDateString('vi-VN')}</td>
                        <td class="px-6 py-4 text-right">
                            <button class="text-blue-500 hover:text-blue-700 font-medium mr-3" onclick="editCategory(\${c.CategoryID})">Sửa</button>
                            <button class="text-red-500 hover:text-red-700 font-medium" onclick="deleteCategory(\${c.CategoryID})">Xóa</button>
                        </td>
                    </tr>
                \`).join('');`);

// 2. Fix saveCategory
adminHtml = adminHtml.replace(/async function saveCategory\(e\) \{[\s\S]*?showAlert\('Thêm danh mục thành công', 'success'\);[\s\S]*?\}/,
`async function saveCategory(e) {
            e.preventDefault();
            const editId = document.getElementById('categoryForm').dataset.editId;
            const data = {
                categoryName: document.getElementById('catName').value,
                description: document.getElementById('catDesc').value
            };
            try {
                let res;
                if (editId) {
                    res = await adminAPI.updateCategory(editId, data);
                } else {
                    res = await adminAPI.createCategory(data);
                }
                
                if(res.ok) {
                    document.getElementById('categoryModal').classList.replace('flex', 'hidden');
                    loadCategories();
                    showAlert(editId ? 'Cập nhật danh mục thành công' : 'Thêm danh mục thành công', 'success');
                } else showAlert('Lưu thất bại', 'error');
            } catch(e) { showAlert('Lỗi kết nối', 'error'); }
        }`);

// 3. Fix loadClasses row mapping
adminHtml = adminHtml.replace(/tbody\.innerHTML = classesList\.map\(c => `\r?\n\s+<tr class="hover:bg-slate-50 dark:hover:bg-slate-700\/50">\r?\n\s+<td class="px-6 py-4">\${c\.ClassID}<\/td>\r?\n\s+<td class="px-6 py-4 font-bold text-primary">\${c\.ClassCode}<\/td>\r?\n\s+<td class="px-6 py-4">\${c\.ClassName}<\/td>\r?\n\s+<td class="px-6 py-4">\${new Date\(c\.CreatedAt\)\.toLocaleDateString\('vi-VN'\)\}<\/td>\r?\n\s+<td class="px-6 py-4 text-right">\r?\n\s+<button class="text-primary hover:underline" onclick="showClassMembers\(\${c\.ClassID}, '\${c\.ClassName}'\)">Xem TV<\/button>\r?\n\s+<\/td>\r?\n\s+<\/tr>\r?\n\s+`\)\.join\(''\);/,
`tbody.innerHTML = classesList.map(c => \`
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td class="px-6 py-4">\${c.ClassID}</td>
                        <td class="px-6 py-4 font-bold text-primary">\${c.ClassCode}</td>
                        <td class="px-6 py-4 text-slate-700 dark:text-slate-200">\${c.ClassName}</td>
                        <td class="px-6 py-4">\${new Date(c.CreatedAt).toLocaleDateString('vi-VN')}</td>
                        <td class="px-6 py-4 text-right">
                            <button class="text-blue-500 hover:text-blue-700 font-medium mr-3" onclick="showClassMembers(\${c.ClassID}, '\${c.ClassName}')">Xem TV</button>
                            <button class="text-emerald-500 hover:text-emerald-700 font-medium mr-3" onclick="editClass(\${c.ClassID})">Sửa</button>
                            <button class="text-red-500 hover:text-red-700 font-medium" onclick="deleteClass(\${c.ClassID})">Xóa</button>
                        </td>
                    </tr>
                \`).join('');`);

// 4. Update showClassModal and Add editClass/deleteClass
adminHtml = adminHtml.replace(/function showClassModal\(\) \{[\s\S]*?document\.getElementById\('classForm'\)\.reset\(\);\r?\n\s+\}/,
`function showClassModal() {
            delete document.getElementById('classForm').dataset.editId;
            document.querySelector('#classModal h3').innerText = 'Tạo Lớp Học Mới';
            document.getElementById('classModal').classList.replace('hidden', 'flex');
            document.getElementById('classForm').reset();
        }

        function editClass(id) {
            const cls = classesList.find(c => c.ClassID === id);
            if(!cls) return;
            document.getElementById('classModal').classList.replace('hidden', 'flex');
            document.getElementById('clsCode').value = cls.ClassCode;
            document.getElementById('clsName').value = cls.ClassName;
            document.getElementById('clsDesc').value = cls.Description || '';
            document.getElementById('classForm').dataset.editId = id;
            document.querySelector('#classModal h3').innerText = 'Sửa Lớp Học';
        }

        async function deleteClass(id) {
            if(!confirm('Bạn có chắc chắn muốn xóa lớp học này?')) return;
            try {
                const res = await classAPI.deleteClass(id);
                if(res.ok) {
                    loadClasses();
                    showAlert('Xóa lớp học thành công', 'success');
                } else showAlert('Lỗi xóa lớp học', 'error');
            } catch(e) { showAlert('Lỗi kết nối', 'error'); }
        }`);

// 5. Fix saveClass
adminHtml = adminHtml.replace(/async function saveClass\(e\) \{[\s\S]*?showAlert\('Tạo lớp thành công', 'success'\);[\s\S]*?\}/,
`async function saveClass(e) {
            e.preventDefault();
            const editId = document.getElementById('classForm').dataset.editId;
            const data = {
                classCode: document.getElementById('clsCode').value,
                className: document.getElementById('clsName').value,
                description: document.getElementById('clsDesc').value
            };
            try {
                let res;
                if (editId) {
                    res = await classAPI.updateClass(editId, data);
                } else {
                    res = await classAPI.createClass(data);
                }
                
                if(res.ok) {
                    document.getElementById('classModal').classList.replace('flex', 'hidden');
                    loadClasses();
                    showAlert(editId ? 'Cập nhật lớp thành công' : 'Tạo lớp thành công', 'success');
                } else {
                    const dataRes = await res.json();
                    showAlert(dataRes.error || 'Lưu lớp thất bại', 'error');
                }
            } catch(e) { showAlert('Lỗi kết nối', 'error'); }
        }`);

// 6. Implement real loadAnnouncements
adminHtml = adminHtml.replace(/async function loadAnnouncements\(\) \{[\s\S]*?Tính năng xem danh sách thông báo chưa được API hỗ trợ hoàn toàn[\s\S]*?\}/,
`async function loadAnnouncements() {
            try {
                const res = await adminAPI.getAnnouncements();
                const anns = await res.json();
                const container = document.getElementById('announcementList');
                if(!container) return;
                if(anns.length === 0) {
                    container.innerHTML = '<p class="text-slate-500 italic p-4 bg-slate-50 dark:bg-slate-800 rounded-lg w-full">Chưa có thông báo nào.</p>';
                    return;
                }
                container.innerHTML = anns.map(a => \`
                    <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
                        <div class="flex justify-between items-start mb-4">
                            <h4 class="font-bold text-lg text-slate-900 dark:text-white">\${a.Title}</h4>
                            <div class="flex gap-2">
                                <button onclick="editAnnouncement(\${a.AnnouncementID})" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-blue-500" title="Sửa">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                </button>
                                <button onclick="deleteAnnouncement(\${a.AnnouncementID})" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-red-500" title="Xóa">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                            </div>
                        </div>
                        <p class="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">\${a.Content}</p>
                        <div class="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs text-slate-500">
                            <span>Bởi: \${a.FullName || 'Admin'}</span>
                            <span>\${new Date(a.CreatedAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                    </div>
                \`).join('');
            } catch(e) { console.error(e); }
        }

        function editAnnouncement(id) {
            // Need to fetch announcements or use a global list
            // For simplicity, let's assume we have a global list
            adminAPI.getAnnouncements().then(res=>res.json()).then(anns => {
                const a = anns.find(x => x.AnnouncementID === id);
                if(!a) return;
                document.getElementById('announcementModal').classList.replace('hidden', 'flex');
                document.getElementById('annTitle').value = a.Title;
                document.getElementById('annContent').value = a.Content;
                document.getElementById('announcementForm').dataset.editId = id;
                document.querySelector('#announcementModal h3').innerText = 'Sửa Thông Báo';
                document.querySelector('#announcementForm button[type="submit"]').innerText = 'Lưu thay đổi';
            });
        }

        async function deleteAnnouncement(id) {
            if(!confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return;
            try {
                const res = await adminAPI.deleteAnnouncement(id);
                if(res.ok) {
                    loadAnnouncements();
                    showAlert('Xóa thông báo thành công', 'success');
                } else showAlert('Lỗi xóa thông báo', 'error');
            } catch(e) { showAlert('Lỗi kết nối', 'error'); }
        }`);

// 7. Fix showAnnouncementModal to reset editId
adminHtml = adminHtml.replace(/function showAnnouncementModal\(\) \{[\s\S]*?document\.getElementById\('announcementForm'\)\.reset\(\);\r?\n\s+\}/,
`function showAnnouncementModal() {
            delete document.getElementById('announcementForm').dataset.editId;
            document.getElementById('announcementModal').classList.replace('hidden', 'flex');
            document.getElementById('announcementForm').reset();
            document.querySelector('#announcementModal h3').innerText = 'Đăng Thông Báo Mới';
            document.querySelector('#announcementForm button[type="submit"]').innerText = 'Đăng';
        }`);

// 8. Fix saveAnnouncement
adminHtml = adminHtml.replace(/async function saveAnnouncement\(e\) \{[\s\S]*?showAlert\('Đăng thông báo thành công', 'success'\);[\s\S]*?\}/,
`async function saveAnnouncement(e) {
            e.preventDefault();
            const editId = document.getElementById('announcementForm').dataset.editId;
            const data = {
                title: document.getElementById('annTitle').value,
                content: document.getElementById('annContent').value
            };
            try {
                let res;
                if (editId) {
                    res = await adminAPI.updateAnnouncement(editId, data);
                } else {
                    res = await adminAPI.createAnnouncement(data);
                }
                
                if(res.ok) {
                    document.getElementById('announcementModal').classList.replace('hidden', 'flex');
                    loadAnnouncements();
                    showAlert(editId ? 'Cập nhật thông báo thành công' : 'Đăng thông báo thành công', 'success');
                } else showAlert('Lỗi lưu thông báo', 'error');
            } catch(e) { showAlert('Lỗi kết nối', 'error'); }
        }`);

// 9. Fix loadFeedbacks row mapping
adminHtml = adminHtml.replace(/tbody\.innerHTML = feedbacks\.map\(f => `\r?\n\s+<tr class="hover:bg-slate-50 dark:hover:bg-slate-700\/50">\r?\n\s+<td class="px-6 py-4">\${f\.FeedbackID}<\/td>\r?\n\s+<td class="px-6 py-4 font-bold text-primary">\${f\.FullName \|\| 'User '\+f\.UserID\}<\/td>\r?\n\s+<td class="px-6 py-4">\${f\.SubjectName \|\| 'Chung'\}<\/td>\r?\n\s+<td class="px-6 py-4 max-w-sm truncate" title="\${f\.Message}">\${f\.Message}<\/td>\r?\n\s+<td class="px-6 py-4">\${new Date\(f\.CreatedAt\)\.toLocaleDateString\('vi-VN'\)\}<\/td>\r?\n\s+<\/tr>\r?\n\s+`\)\.join\(''\);/,
`tbody.innerHTML = feedbacks.map(f => \`
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td class="px-6 py-4">\${f.FeedbackID}</td>
                        <td class="px-6 py-4 font-bold text-primary">\${f.FullName || 'User '+f.UserID}</td>
                        <td class="px-6 py-4">\${f.SubjectName || 'Chung'}</td>
                        <td class="px-6 py-4 max-w-sm truncate" title="\${f.Message}">\${f.Message}</td>
                        <td class="px-6 py-4">\${new Date(f.CreatedAt).toLocaleDateString('vi-VN')}</td>
                        <td class="px-6 py-4 text-right">
                            <button class="text-red-500 hover:text-red-700 font-medium" onclick="deleteFeedback(\${f.FeedbackID})">Xóa</button>
                        </td>
                    </tr>
                \`).join('');`);

// 10. Implement deleteFeedback
adminHtml = adminHtml.replace(/async function loadFeedbacks\(\) \{[\s\S]*?catch\(e\) \{ console\.error\(e\); \}\r?\n\s+\}/,
`async function loadFeedbacks() {
            try {
                const res = await adminAPI.getFeedbacks();
                const feedbacks = await res.json();
                const tbody = document.getElementById('feedbackTableBody');
                if(!tbody) return;
                if(feedbacks.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-slate-500">Chưa có phản hồi</td></tr>';
                    return;
                }
                tbody.innerHTML = feedbacks.map(f => \`
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td class="px-6 py-4">\${f.FeedbackID}</td>
                        <td class="px-6 py-4 font-bold text-primary">\${f.FullName || 'User '+f.UserID}</td>
                        <td class="px-6 py-4">\${f.SubjectName || 'Chung'}</td>
                        <td class="px-6 py-4 max-w-sm truncate" title="\${f.Message}">\${f.Message}</td>
                        <td class="px-6 py-4">\${new Date(f.CreatedAt).toLocaleDateString('vi-VN')}</td>
                        <td class="px-6 py-4 text-right">
                            <button class="text-red-500 hover:text-red-700 font-medium" onclick="deleteFeedback(\${f.FeedbackID})">Xóa</button>
                        </td>
                    </tr>
                \`).join('');
            } catch(e) { console.error(e); }
        }

        async function deleteFeedback(id) {
            if(!confirm('Bạn có chắc chắn muốn xóa phản hồi này?')) return;
            try {
                const res = await adminAPI.deleteFeedback(id);
                if(res.ok) {
                    loadFeedbacks();
                    showAlert('Xóa phản hồi thành công', 'success');
                } else showAlert('Lỗi xóa phản hồi', 'error');
            } catch(e) { showAlert('Lỗi kết nối', 'error'); }
        }`);

fs.writeFileSync(adminHtmlPath, adminHtml);
console.log("Patch DONE Final");
