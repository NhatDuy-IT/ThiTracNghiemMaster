const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'Frontend', 'admin.html');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    `<button class="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tabQuestions" onclick="showTab('questions')">Quản lý Câu hỏi</button>`,
    `<button class="whitespace-nowrap px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tabQuestions" onclick="showTab('questions')">Câu hỏi</button>`
);

content = content.replace(
    `<button class="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tabUsers" onclick="showTab('users')">Quản lý Người dùng</button>`,
    `<button class="whitespace-nowrap px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tabUsers" onclick="showTab('users')">Người dùng</button>`
);

content = content.replace(
    `<button class="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tabHistory" onclick="showTab('history')">Lịch sử thi</button>`,
    `<button class="whitespace-nowrap px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tabHistory" onclick="showTab('history')">Lịch sử</button>`
);

fs.writeFileSync(file, content);
console.log("Fixed standard classes.");
