// Cấu hình API
const BASE_URL = 'http://localhost:3000/api';
const API_ORIGIN = BASE_URL.replace(/\/api$/, '');

function buildAssetUrl(assetPath) {
    if (!assetPath) return '';
    if (/^https?:\/\//i.test(assetPath)) return assetPath;
    return `${API_ORIGIN}${assetPath.startsWith('/') ? assetPath : `/${assetPath}`}`;
}

// Hàm hỗ trợ gọi API với xác thực
async function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        }
    };

    const response = await fetch(url, config);
    
    // Xử lý token hết hạn
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
        throw new Error('Token expired');
    }

    return response;
}

// API Xác thực
const authAPI = {
    login: (username, password) => 
        fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        }),
    
    register: (username, password, fullName, email) =>
        fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, fullName, email })
        })
};

// API Người dùng
const userAPI = {
    getSubjects: () => authenticatedFetch(`${BASE_URL}/user/subjects`),
    
    getQuestions: (subjectId) => authenticatedFetch(`${BASE_URL}/user/questions/${subjectId}`),
    
    submitExam: (subjectId, answers) => authenticatedFetch(`${BASE_URL}/user/exam/submit`, {
        method: 'POST',
        body: JSON.stringify({ subjectId, answers })
    }),
    
    getExamHistory: () => authenticatedFetch(`${BASE_URL}/user/exam-history`),

    getSavedExams: () => authenticatedFetch(`${BASE_URL}/user/saved-exams`),

    getSavedExam: (subjectId) => authenticatedFetch(`${BASE_URL}/user/saved-exams/${subjectId}`),

    saveExamDraft: (data) => authenticatedFetch(`${BASE_URL}/user/saved-exams`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    deleteSavedExam: (subjectId) => authenticatedFetch(`${BASE_URL}/user/saved-exams/${subjectId}`, {
        method: 'DELETE'
    }),
    
    // Profile
    getProfile: () => authenticatedFetch(`${BASE_URL}/user/profile`),
    
    updateProfile: (data) => authenticatedFetch(`${BASE_URL}/user/profile`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    
    changePassword: (data) => authenticatedFetch(`${BASE_URL}/user/change-password`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    // Avatar upload
    uploadAvatar: (file) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('avatar', file);

        return fetch(`${BASE_URL}/user/upload-avatar`, {
            method: 'POST',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: formData
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'index.html';
                throw new Error('Token expired');
            }
            return response;
        });
    }
};

// API Admin
const adminAPI = {
    // Subjects
    getSubjects: () => authenticatedFetch(`${BASE_URL}/admin/subjects`),
    getSubject: (id) => authenticatedFetch(`${BASE_URL}/admin/subjects/${id}`),
    createSubject: (data) => authenticatedFetch(`${BASE_URL}/admin/subjects`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateSubject: (id, data) => authenticatedFetch(`${BASE_URL}/admin/subjects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    deleteSubject: (id) => authenticatedFetch(`${BASE_URL}/admin/subjects/${id}`, {
        method: 'DELETE'
    }),
    
    // Questions
    getQuestions: (subjectId) => {
        const url = subjectId ? `${BASE_URL}/admin/questions?subjectId=${subjectId}` : `${BASE_URL}/admin/questions`;
        return authenticatedFetch(url);
    },
    getQuestion: (id) => authenticatedFetch(`${BASE_URL}/admin/questions/${id}`),
    createQuestion: (data) => authenticatedFetch(`${BASE_URL}/admin/questions`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateQuestion: (id, data) => authenticatedFetch(`${BASE_URL}/admin/questions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    deleteQuestion: (id) => authenticatedFetch(`${BASE_URL}/admin/questions/${id}`, {
        method: 'DELETE'
    }),
    
    // Exam History
    getAllExamHistory: () => authenticatedFetch(`${BASE_URL}/admin/exam-history`),

    // Users
    getUsers: () => authenticatedFetch(`${BASE_URL}/admin/users`),
    getUser: (id) => authenticatedFetch(`${BASE_URL}/admin/users/${id}`),
    updateUser: (id, data) => authenticatedFetch(`${BASE_URL}/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    deleteUser: (id) => authenticatedFetch(`${BASE_URL}/admin/users/${id}`, {
        method: 'DELETE'
    }),
    resetUserPassword: (id, newPassword) => authenticatedFetch(`${BASE_URL}/admin/users/${id}/reset-password`, {
        method: 'PUT',
        body: JSON.stringify({ newPassword })
    }),

    // Excel Import
    downloadTemplate: () => {
        const token = localStorage.getItem('token');
        return fetch(`${BASE_URL}/admin/download-template`, {
            method: 'GET',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'index.html';
                throw new Error('Token expired');
            }
            return response;
        });
    },

    importQuestions: (file) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('excelFile', file);

        return fetch(`${BASE_URL}/admin/import-questions`, {
            method: 'POST',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: formData
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'index.html';
                throw new Error('Token expired');
            }
            return response;
        });
    }
};

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}