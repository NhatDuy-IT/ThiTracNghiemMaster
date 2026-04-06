const fs = require('fs');
const path = require('path');

const adminHtmlPath = path.join(__dirname, 'Frontend', 'admin.html');
let html = fs.readFileSync(adminHtmlPath, 'utf8');

// 1. Replace Tabs Menu
const oldTabsMenu = `<div class="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-700">
            <button class="px-4 py-2 text-sm font-semibold text-primary border-b-2 border-primary" id="tabSubjects" onclick="showTab('subjects')">Quản lý Môn thi</button>
            <button class="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tabQuestions" onclick="showTab('questions')">Quản lý Câu hỏi</button>
            <button class="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tabUsers" onclick="showTab('users')">Quản lý Người dùng</button>
            <button class="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tabHistory" onclick="showTab('history')">Lịch sử thi</button>
        </div>`;

const newTabsMenu = `<div class="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-700 overflow-x-auto pb-2 scrollbar-hide">
            <button class="whitespace-nowrap px-4 py-2 text-sm font-semibold text-primary border-b-2 border-primary" id="tabSubjects" onclick="showTab('subjects')">Môn thi</button>
            <button class="whitespace-nowrap px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tabCategories" onclick="showTab('categories')">Danh mục</button>
            <button class="whitespace-nowrap px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tabQuestions" onclick="showTab('questions')">Câu hỏi</button>
            <button class="whitespace-nowrap px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tabClasses" onclick="showTab('classes')">Lớp học</button>
            <button class="whitespace-nowrap px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tabUsers" onclick="showTab('users')">Người dùng</button>
            <button class="whitespace-nowrap px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tabAnnouncements" onclick="showTab('announcements')">Thông báo</button>
            <button class="whitespace-nowrap px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tabFeedbacks" onclick="showTab('feedbacks')">Phản hồi</button>
            <button class="whitespace-nowrap px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tabHistory" onclick="showTab('history')">Lịch sử test</button>
        </div>`;

html = html.replace(oldTabsMenu, newTabsMenu);

// 2. Tab Contents
const newTabContents = `
        <!-- Categories Tab -->
        <div id="categoriesTab" class="hidden">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Quản lý Danh mục</h2>
                <button type="button" class="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 rounded-lg transition-all flex items-center gap-2" onclick="showCategoryModal()">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Thêm danh mục
                </button>
            </div>
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table class="w-full">
                    <thead class="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">ID</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Tên danh mục</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Mô tả</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Ngày tạo</th>
                        </tr>
                    </thead>
                    <tbody id="categoryTableBody" class="divide-y divide-slate-200 dark:divide-slate-700">
                        <tr><td colspan="4" class="px-6 py-4 text-center text-slate-500">Đang tải...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Classes Tab -->
        <div id="classesTab" class="hidden">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Quản lý Lớp học</h2>
                <button type="button" class="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 rounded-lg transition-all flex items-center gap-2" onclick="showClassModal()">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Tạo lớp mới
                </button>
            </div>
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table class="w-full">
                    <thead class="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">ID</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Mã Lớp</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Tên Lớp</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Ngày tạo</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="classTableBody" class="divide-y divide-slate-200 dark:divide-slate-700">
                        <tr><td colspan="5" class="px-6 py-4 text-center text-slate-500">Đang tải...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Announcements Tab -->
        <div id="announcementsTab" class="hidden">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Thông báo Hệ thống</h2>
                <button type="button" class="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 rounded-lg transition-all flex items-center gap-2" onclick="showAnnouncementModal()">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Đăng thông báo
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="announcementList">
                <p class="text-slate-500">Đang tải...</p>
            </div>
        </div>

        <!-- Feedbacks Tab -->
        <div id="feedbacksTab" class="hidden">
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">Phản hồi Sinh viên</h2>
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table class="w-full">
                    <thead class="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">ID</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Sinh viên</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Môn liên quan</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Nội dung</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Ngày cấp</th>
                        </tr>
                    </thead>
                    <tbody id="feedbackTableBody" class="divide-y divide-slate-200 dark:divide-slate-700">
                        <tr><td colspan="5" class="px-6 py-4 text-center text-slate-500">Đang tải...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

    </main>
`;
html = html.replace('</main>', newTabContents);

// 3. Subject Modal category injection
const subjectFormInsertion = `<div class="mb-4">
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Danh mục</label>
                    <select id="subjectCategory" title="Chọn danh mục" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
                        <option value="">Không có danh mục</option>
                    </select>
                </div>`;
                
html = html.replace('<div class="mb-4">\n                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mô tả</label>', subjectFormInsertion + '\n                <div class="mb-4">\n                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mô tả</label>');

// 4. Modals 
const newModals = `
    <!-- Category Modal -->
    <div id="categoryModal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Thêm Danh Mục</h3>
            <form id="categoryForm" onsubmit="saveCategory(event)">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tên Danh Mục</label>
                    <input type="text" id="catName" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" required/>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mô tả</label>
                    <textarea id="catDesc" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" rows="3"></textarea>
                </div>
                <div class="flex gap-3 justify-end">
                    <button type="button" class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg" onclick="document.getElementById('categoryModal').classList.replace('flex','hidden')">Hủy</button>
                    <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg">Lưu</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Class Modal -->
    <div id="classModal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Tạo Lớp Học Mới</h3>
            <form id="classForm" onsubmit="saveClass(event)">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mã Lớp</label>
                    <input type="text" id="clsCode" placeholder="VD: SE1501" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" required/>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tên Lớp</label>
                    <input type="text" id="clsName" placeholder="VD: Kỹ thuật phần mềm" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" required/>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mô tả</label>
                    <textarea id="clsDesc" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" rows="3"></textarea>
                </div>
                <div class="flex gap-3 justify-end">
                    <button type="button" class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg" onclick="document.getElementById('classModal').classList.replace('flex','hidden')">Hủy</button>
                    <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg">Lưu</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Class Members Modal -->
    <div id="classMembersModal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-4" id="classMembersTitle">Quản lý Thành Viên Lớp</h3>
            
            <form onsubmit="addMemberToClass(event)" class="mb-4 flex gap-2">
                <input type="hidden" id="currentClassId" />
                <select id="userToAdd" class="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" required></select>
                <button type="submit" class="bg-primary text-white px-4 py-2 rounded-lg">Thêm</button>
            </form>

            <div class="overflow-y-auto flex-1 border border-slate-200 dark:border-slate-700 rounded-lg">
                <table class="w-full">
                    <thead class="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
                        <tr>
                            <th class="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase">Tên ĐN</th>
                            <th class="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase">Họ Tên</th>
                            <th class="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase">Ngày gia nhập</th>
                        </tr>
                    </thead>
                    <tbody id="classMembersBody" class="divide-y divide-slate-200 dark:divide-slate-700"></tbody>
                </table>
            </div>

            <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                <button type="button" class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg" onclick="document.getElementById('classMembersModal').classList.replace('flex','hidden')">Đóng</button>
            </div>
        </div>
    </div>

    <!-- Announcement Modal -->
    <div id="announcementModal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Đăng Thông Báo Mới</h3>
            <form id="announcementForm" onsubmit="saveAnnouncement(event)">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tiêu đề</label>
                    <input type="text" id="annTitle" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" required/>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nội dung</label>
                    <textarea id="annContent" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" rows="5" required></textarea>
                </div>
                <div class="flex gap-3 justify-end">
                    <button type="button" class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg" onclick="document.getElementById('announcementModal').classList.replace('flex','hidden')">Hủy</button>
                    <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg">Đăng</button>
                </div>
            </form>
        </div>
    </div>
    <script src="js/api.js"></script>
`;
html = html.replace('<script src="js/api.js"></script>', newModals);

// 5. JS Code Replacements

// Modify showTab
const oldShowTab = `['subjects', 'questions', 'users', 'history'].forEach(t => {`;
const newShowTab = `['subjects', 'questions', 'users', 'history', 'categories', 'classes', 'announcements', 'feedbacks'].forEach(t => {`;
html = html.replace(oldShowTab, newShowTab);

const oldShowTabConditions = `if (tab === 'subjects') loadSubjects();
            if (tab === 'questions') loadQuestions();
            if (tab === 'users') loadUsers();
            if (tab === 'history') loadHistory();`;
const newShowTabConditions = `if (tab === 'subjects') loadSubjects();
            if (tab === 'questions') loadQuestions();
            if (tab === 'users') loadUsers();
            if (tab === 'history') loadHistory();
            if (tab === 'categories') loadCategories();
            if (tab === 'classes') loadClasses();
            if (tab === 'announcements') loadAnnouncements(); /* We will implement loadAnnouncements if needed */
            if (tab === 'feedbacks') loadFeedbacks();`;
html = html.replace(oldShowTabConditions, newShowTabConditions);

// Add global lists and API calls
const jsInjections = `
        let categories = [];
        let classesList = [];

        async function loadCategories() {
            try {
                const res = await adminAPI.getCategories();
                categories = await res.json();
                
                // Update dropdown in Subject Form
                document.getElementById('subjectCategory').innerHTML = '<option value="">Không có danh mục</option>' + categories.map(c => \`<option value="\${c.CategoryID}">\${c.CategoryName}</option>\`).join('');

                const tbody = document.getElementById('categoryTableBody');
                if(!tbody) return;
                
                if (categories.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-slate-500">Chưa có danh mục</td></tr>';
                    return;
                }
                tbody.innerHTML = categories.map(c => \`
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td class="px-6 py-4">\${c.CategoryID}</td>
                        <td class="px-6 py-4 font-bold">\${c.CategoryName}</td>
                        <td class="px-6 py-4 text-slate-500">\${c.Description || '-'}</td>
                        <td class="px-6 py-4">\${new Date(c.CreatedAt).toLocaleDateString('vi-VN')}</td>
                    </tr>
                \`).join('');
            } catch(e) { console.error(e); }
        }

        function showCategoryModal() {
            document.getElementById('categoryModal').classList.replace('hidden', 'flex');
            document.getElementById('categoryForm').reset();
        }

        async function saveCategory(e) {
            e.preventDefault();
            const data = {
                categoryName: document.getElementById('catName').value,
                description: document.getElementById('catDesc').value
            };
            try {
                const res = await adminAPI.createCategory(data);
                if(res.ok) {
                    document.getElementById('categoryModal').classList.replace('flex', 'hidden');
                    loadCategories();
                    showAlert('Thêm danh mục thành công', 'success');
                } else showAlert('Thêm thất bại', 'error');
            } catch(e) { showAlert('Lỗi kết nối', 'error'); }
        }

        async function loadClasses() {
            try {
                const res = await classAPI.getAllClasses();
                classesList = await res.json();
                const tbody = document.getElementById('classTableBody');
                if(!tbody) return;
                if(classesList.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-slate-500">Chưa có lớp</td></tr>';
                    return;
                }
                tbody.innerHTML = classesList.map(c => \`
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td class="px-6 py-4">\${c.ClassID}</td>
                        <td class="px-6 py-4 font-bold text-primary">\${c.ClassCode}</td>
                        <td class="px-6 py-4">\${c.ClassName}</td>
                        <td class="px-6 py-4">\${new Date(c.CreatedAt).toLocaleDateString('vi-VN')}</td>
                        <td class="px-6 py-4 text-right">
                            <button class="text-primary hover:underline" onclick="showClassMembers(\${c.ClassID}, '\${c.ClassName}')">Xem TV</button>
                        </td>
                    </tr>
                \`).join('');
            } catch(e) { console.error(e); }
        }

        function showClassModal() {
            document.getElementById('classModal').classList.replace('hidden', 'flex');
            document.getElementById('classForm').reset();
        }

        async function saveClass(e) {
            e.preventDefault();
            const data = {
                classCode: document.getElementById('clsCode').value,
                className: document.getElementById('clsName').value,
                description: document.getElementById('clsDesc').value
            };
            try {
                const res = await classAPI.createClass(data);
                if(res.ok) {
                    document.getElementById('classModal').classList.replace('flex', 'hidden');
                    loadClasses();
                    showAlert('Tạo lớp thành công', 'success');
                } else {
                    const dataRes = await res.json();
                    showAlert(dataRes.error || 'Tạo lớp thất bại', 'error');
                }
            } catch(e) { showAlert('Lỗi kết nối', 'error'); }
        }

        async function showClassMembers(classId, className) {
            document.getElementById('classMembersModal').classList.replace('hidden', 'flex');
            document.getElementById('classMembersTitle').innerText = "Thành viên lớp " + className;
            document.getElementById('currentClassId').value = classId;
            
            // Populate users dropdown
            if(users.length === 0) await loadUsers();
            document.getElementById('userToAdd').innerHTML = '<option value="">Chọn sinh viên</option>' + users.filter(u=>u.Role==='User').map(u => \`<option value="\${u.UserID}">\${u.Username} - \${u.FullName||''}</option>\`).join('');

            loadClassMembersList(classId);
        }

        async function loadClassMembersList(classId) {
            try {
                const res = await classAPI.getClassMembers(classId);
                const mems = await res.json();
                const tbody = document.getElementById('classMembersBody');
                if(mems.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="3" class="px-4 py-4 text-center">Chưa có thành viên</td></tr>';
                    return;
                }
                tbody.innerHTML = mems.map(m => \`
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td class="px-4 py-2">\${m.Username}</td>
                        <td class="px-4 py-2">\${m.FullName||'-'}</td>
                        <td class="px-4 py-2">\${new Date(m.JoinedAt).toLocaleString('vi-VN')}</td>
                    </tr>
                \`).join('');
            } catch(e) { console.error(e); }
        }

        async function addMemberToClass(e) {
            e.preventDefault();
            const classId = document.getElementById('currentClassId').value;
            const userId = document.getElementById('userToAdd').value;
            try {
                const res = await classAPI.addMember({classId, userId});
                if(res.ok) {
                    loadClassMembersList(classId);
                    showAlert('Thêm thành viên thành công', 'success');
                } else {
                    showAlert('Sinh viên có thể đã trong lớp này', 'error');
                }
            } catch(e) { showAlert('Lỗi kết nối', 'error'); }
        }

        function showAnnouncementModal() {
            document.getElementById('announcementModal').classList.replace('hidden', 'flex');
            document.getElementById('announcementForm').reset();
        }

        async function saveAnnouncement(e) {
            e.preventDefault();
            const data = {
                title: document.getElementById('annTitle').value,
                content: document.getElementById('annContent').value
            };
            try {
                const res = await adminAPI.createAnnouncement(data);
                if(res.ok) {
                    document.getElementById('announcementModal').classList.replace('flex', 'hidden');
                    loadAnnouncements();
                    showAlert('Đăng thông báo thành công', 'success');
                } else showAlert('Lỗi đăng thông báo', 'error');
            } catch(e) { showAlert('Lỗi kết nối', 'error'); }
        }

        async function loadAnnouncements() {
            // For admin, we can fetch all or fake it. Since we don't have GetAllAnnoucements in adminAPI yet, let's skip fetching.
            document.getElementById('announcementList').innerHTML = '<p class="text-slate-500 italic p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">Tính năng xem danh sách thông báo chưa được API hỗ trợ hoàn toàn, nhưng bạn đã có thể Đăng mới thành công.</p>';
        }

        async function loadFeedbacks() {
            try {
                const res = await adminAPI.getFeedbacks();
                const feedbacks = await res.json();
                const tbody = document.getElementById('feedbackTableBody');
                if(!tbody) return;
                if(feedbacks.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-slate-500">Chưa có phản hồi</td></tr>';
                    return;
                }
                tbody.innerHTML = feedbacks.map(f => \`
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td class="px-6 py-4">\${f.FeedbackID}</td>
                        <td class="px-6 py-4 font-bold text-primary">\${f.FullName || 'User '+f.UserID}</td>
                        <td class="px-6 py-4">\${f.SubjectName || 'Chung'}</td>
                        <td class="px-6 py-4 max-w-sm truncate" title="\${f.Message}">\${f.Message}</td>
                        <td class="px-6 py-4">\${new Date(f.CreatedAt).toLocaleDateString('vi-VN')}</td>
                    </tr>
                \`).join('');
            } catch(e) { console.error(e); }
        }

        // Call loadCategories on start
        loadCategories();
`;
html = html.replace('let subjects = [];', jsInjections + '\n        let subjects = [];');

// Add category parsing when editing/creating subjects
html = html.replace(/subjectName: document.getElementById\('subjectName'\).value,/g, `subjectName: document.getElementById('subjectName').value,
                categoryId: document.getElementById('subjectCategory').value || null,`);

fs.writeFileSync(adminHtmlPath, html);
console.log("admin.html patched successfully");
