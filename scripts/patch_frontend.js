const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, '..', 'Frontend', 'js', 'api.js');
let apiJs = fs.readFileSync(apiPath, 'utf8');

// Thay thế Categories
if (!apiJs.includes('updateCategory:')) {
    apiJs = apiJs.replace(/getCategories(.*?)(?=createCategory)/s, "getCategories: () => authenticatedFetch(`${BASE_URL}/admin/categories`),\n    updateCategory: (id, data) => authenticatedFetch(`${BASE_URL}/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),\n    deleteCategory: (id) => authenticatedFetch(`${BASE_URL}/admin/categories/${id}`, { method: 'DELETE' }),\n    ");
}

// Thay thế Announcements
if (!apiJs.includes('updateAnnouncement:')) {
    apiJs = apiJs.replace(/createAnnouncement: \(data\) => authenticatedFetch\(\`\$\{BASE_URL\}\/admin\/announcements\`, \{(.*?)\}\),/s, "createAnnouncement: (data) => authenticatedFetch(`${BASE_URL}/admin/announcements`, { method: 'POST', body: JSON.stringify(data) }),\n    updateAnnouncement: (id, data) => authenticatedFetch(`${BASE_URL}/admin/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),\n    deleteAnnouncement: (id) => authenticatedFetch(`${BASE_URL}/admin/announcements/${id}`, { method: 'DELETE' }),");
}

// Thay thế Classes
if (!apiJs.includes('updateClass:')) {
    const classBlockEnd = "getClassMembers: (classId) => authenticatedFetch(`${BASE_URL}/class/${classId}/members`)";
    apiJs = apiJs.replace(classBlockEnd, "updateClass: (id, data) => authenticatedFetch(`${BASE_URL}/class/${id}`, { method: 'PUT', body: JSON.stringify(data) }),\n    deleteClass: (id) => authenticatedFetch(`${BASE_URL}/class/${id}`, { method: 'DELETE' }),\n    removeMember: (data) => authenticatedFetch(`${BASE_URL}/class/remove-member`, { method: 'DELETE', body: JSON.stringify(data) }),\n    " + classBlockEnd);
}

fs.writeFileSync(apiPath, apiJs);

// BÂY GIỜ Vá admin.html
const adminHtmlPath = path.join(__dirname, '..', 'Frontend', 'admin.html');
let adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');

// Thêm Thao tác Header cho Categories
const catHeaderOld = `<th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Ngày tạo</th>
                        </tr>`;
const catHeaderNew = `<th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Ngày tạo</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Thao tác</th>
                        </tr>`;
if(!adminHtml.includes('>Thao tác</th>\r\n                        </tr>')) {
    // Để an toàn, thay trúng chỗ (chỉ bảng categories có 4 cột)
    adminHtml = adminHtml.replace(/<th.*?Ngày tạo.*?<\/th>\s*<\/tr>/g, (match) => {
        return match.replace('</tr>', '<th class="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Thao tác</th></tr>');
    });
}

// Sửa hàm hiển thị map danh mục
const oldCatMapStr = `<td class="px-6 py-4">\\\${new Date(c.CreatedAt).toLocaleDateString('vi-VN')}</td>
                    </tr>`;
const newCatMapStr = `<td class="px-6 py-4">\\\${new Date(c.CreatedAt).toLocaleDateString('vi-VN')}</td>
                        <td class="px-6 py-4 text-right">
                            <button class="text-blue-500 hover:text-blue-700 font-medium mr-3" onclick="editCategory(\\\${c.CategoryID})">Sửa</button>
                            <button class="text-red-500 hover:text-red-700 font-medium" onclick="deleteCategory(\\\${c.CategoryID})">Xóa</button>
                        </td>
                    </tr>`;
if(!adminHtml.includes('editCategory(')) {
    adminHtml = adminHtml.replace(/<td class="px-6 py-4">\\\$\{new Date\(c\.CreatedAt\)\.toLocaleDateString\('vi-VN'\)\}<\/td>\s*<\/tr>/g, newCatMapStr);
}

// Thêm các hàm Sửa Xóa cho danh mục
const catFunctionsInsert = `
        function editCategory(id) {
            const cat = categories.find(c => c.CategoryID === id);
            if(!cat) return;
            document.getElementById('categoryModal').classList.replace('hidden', 'flex');
            document.getElementById('catName').value = cat.CategoryName;
            document.getElementById('catDesc').value = cat.Description || '';
            // Gắn tạm id vào form để dùng khi Lưu
            document.getElementById('categoryForm').dataset.editId = id;
            document.querySelector('#categoryModal h3').innerText = 'Sửa Danh Mục';
        }

        async function deleteCategory(id) {
            if(!confirm('Bạn có chắc chắn muốn xóa danh mục này? Tất cả các môn thi thuộc danh mục này sẽ bị mất danh mục gốc!')) return;
            try {
                const res = await adminAPI.deleteCategory(id);
                if(res.ok) {
                    loadCategories();
                    alert('Xóa danh mục thành công!');
                } else alert('Lỗi xóa danh mục');
            } catch(e) { alert('Lỗi kết nối'); }
        }
`;

if(!adminHtml.includes('function editCategory')) {
    adminHtml = adminHtml.replace('function showCategoryModal() {', catFunctionsInsert + '\n        function showCategoryModal() {\n            delete document.getElementById(\'categoryForm\').dataset.editId;\n            document.querySelector(\'#categoryModal h3\').innerText = \'Thêm Danh Mục\';');
}

// Sửa saveCategory để gọi Create P hoặc Update
adminHtml = adminHtml.replace(`const res = await adminAPI.createCategory(data);
                if(res.ok) {`, `
                const editId = document.getElementById('categoryForm').dataset.editId;
                let res;
                if(editId) {
                    res = await adminAPI.updateCategory(editId, data);
                } else {
                    res = await adminAPI.createCategory(data);
                }
                
                if(res.ok) {`);

fs.writeFileSync(adminHtmlPath, adminHtml);
console.log("Patch DONE Frontend");
