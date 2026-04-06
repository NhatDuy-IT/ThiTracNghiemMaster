const fs = require('fs');
const path = require('path');

const homeHtmlPath = path.join(__dirname, 'Frontend', 'home.html');
let html = fs.readFileSync(homeHtmlPath, 'utf8');

// 1. Add "Góp ý" link in Nav
const navInsertOriginal = `<a class="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors" href="profile.html">Hồ sơ</a>`;
const navInsertNew = `<a class="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors" href="profile.html">Hồ sơ</a>
                        <a class="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors cursor-pointer" onclick="showFeedbackModal()">Góp ý &amp; Lớp</a>`;
html = html.replace(navInsertOriginal, navInsertNew);

// 2. Add Announcement Banner
const bannerHtml = `
        <!-- Announcements Banner -->
        <div id="announcementBanner" class="hidden relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <div class="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 shadow-sm flex items-start gap-4">
                <div class="p-2 border border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-800 rounded-lg text-primary shadow-sm flex-shrink-0">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
                </div>
                <div class="flex-1">
                    <h3 class="text-sm font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider mb-1">Thông Báo Mới Nhất</h3>
                    <div id="announcementContent" class="text-slate-700 dark:text-slate-300 space-y-4">
                        <!-- Content -->
                    </div>
                </div>
            </div>
        </div>
`;
html = html.replace('<main>', '<main>\n' + bannerHtml);

// 3. Add Feedback Modal
const modalHtml = `
    <!-- Feedback Modal -->
    <div id="feedbackModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden transform transition-all scale-95 opacity-0" id="feedbackModalContent">
            <div class="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 p-6">
                <h3 class="text-xl font-bold text-slate-900 dark:text-white">Góp ý & Lớp học</h3>
                <button onclick="closeFeedbackModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            <div class="p-6">
                <!-- Info block -->
                <div class="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h4 class="font-bold text-slate-900 dark:text-white mb-2">Lớp của tôi</h4>
                    <p class="text-sm text-slate-600 dark:text-slate-400">Danh sách các môn thi hiển thị dựa vào thiết lập của Admin. Hãy liên hệ với giáo viên nếu chưa thấy môn thi của bạn.</p>
                </div>

                <h4 class="font-bold text-slate-900 dark:text-white mb-4">Gửi Phản Hồi Hệ Thống</h4>
                <form id="feedbackForm" onsubmit="submitFeedback(event)">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Môn học liên quan (tùy chọn)</label>
                        <select id="fbSubjectId" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
                            <option value="">Chọn môn thi / Góp ý chung</option>
                        </select>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nội dung góp ý</label>
                        <textarea id="fbMessage" rows="4" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" placeholder="Hãy miêu tả vấn đề bạn gặp phải..." required></textarea>
                    </div>
                    <button type="submit" class="w-full bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-all">Gửi Phản Hồi</button>
                </form>
            </div>
        </div>
    </div>
    
    <script src="js/api.js"></script>
`;
html = html.replace('<script src="js/api.js"></script>', modalHtml);

// 4. JS Methods
const jsOriginal = "loadSubjects();";
const jsNew = `
        async function loadAnnouncements() {
            try {
                const response = await userAPI.getAnnouncements();
                const anns = await response.json();
                if(anns && anns.length > 0) {
                    document.getElementById('announcementBanner').classList.remove('hidden');
                    document.getElementById('announcementContent').innerHTML = anns.map(a => \`
                        <div class="border-b border-blue-200/50 dark:border-blue-800/50 pb-3 last:border-0 last:pb-0">
                            <h4 class="font-bold text-slate-900 dark:text-white text-lg">\${a.Title}</h4>
                            <p class="text-sm mt-1">\${a.Content}</p>
                            <span class="text-xs text-slate-500 mt-2 block">\${new Date(a.CreatedAt).toLocaleString('vi-VN')}</span>
                        </div>
                    \`).join('');
                }
            } catch(e) { console.error('Lỗi tải thông báo', e); }
        }

        function showFeedbackModal() {
            const modal = document.getElementById('feedbackModal');
            const content = document.getElementById('feedbackModalContent');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.getElementById('feedbackForm').reset();
            setTimeout(() => {
                content.classList.remove('scale-95', 'opacity-0');
                content.classList.add('scale-100', 'opacity-100');
            }, 10);
        }

        function closeFeedbackModal() {
            const modal = document.getElementById('feedbackModal');
            const content = document.getElementById('feedbackModalContent');
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.remove('flex');
                modal.classList.add('hidden');
            }, 200);
        }

        async function submitFeedback(e) {
            e.preventDefault();
            const sbj = document.getElementById('fbSubjectId').value;
            const data = {
                subjectId: sbj ? parseInt(sbj) : null,
                message: document.getElementById('fbMessage').value
            };
            try {
                const res = await userAPI.sendFeedback(data);
                if(res.ok) {
                    alert('Cảm ơn bạn đã gửi phản hồi!');
                    closeFeedbackModal();
                } else alert('Lỗi gửi phản hồi');
            } catch(e) { alert('Lỗi kết nối'); }
        }

        loadAnnouncements();
        loadSubjects();
`;

// Also inject options into the feedback select
const sbjHtmlUpdate = `container.innerHTML = subjects.map((subject, index) =>`;
const sbjHtmlNewUpdate = `
                document.getElementById('fbSubjectId').innerHTML = '<option value="">Chọn môn thi / Góp ý chung</option>' + subjects.map(s => \`<option value="\${s.SubjectID}">\${s.SubjectName}</option>\`).join('');
                container.innerHTML = subjects.map((subject, index) =>`;

html = html.replace('loadSubjects();', jsNew);
html = html.replace(sbjHtmlUpdate, sbjHtmlNewUpdate);

fs.writeFileSync(homeHtmlPath, html);
console.log("home.html patched successfully");
