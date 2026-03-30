function showAlert(message, type = 'info') {
    const modal = document.getElementById('alertModal');
    const content = document.getElementById('alertModalContent');
    const icon = document.getElementById('alertIcon');
    const title = document.getElementById('alertTitle');
    const messageEl = document.getElementById('alertMessage');
    

    messageEl.textContent = message;
    //set icon and title based on type
    if (type === 'success') {
        title.textContent = 'Thành công';
        icon.innerHTML = `
            <div class="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
            </div>
        `;
    } else if (type === 'error') {
        title.textContent = 'Lỗi';
        icon.innerHTML = `
            <div class="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </div>
        `;
    } else if (type === 'warning') {
        title.textContent = 'Cảnh báo';
        icon.innerHTML = `
            <div class="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
            </div>
        `;
    } else {
        title.textContent = 'Thông báo';
        icon.innerHTML = `
            <div class="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </div>
        `;
    }
    
    // Show modal with animation
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeAlert() {
    const modal = document.getElementById('alertModal');
    const content = document.getElementById('alertModalContent');
    
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }, 200);
}

// Show Confirm Modal (thay thế confirm())
function showConfirm(message, onConfirm, onCancel = null) {
    const modal = document.getElementById('confirmModal');
    const content = document.getElementById('confirmModalContent');
    const messageEl = document.getElementById('confirmMessage');
    
    messageEl.textContent = message;
    
    // Store callbacks
    window._confirmCallback = onConfirm;
    window._cancelCallback = onCancel;
    
    // Show modal with animation
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeConfirm() {
    const modal = document.getElementById('confirmModal');
    const content = document.getElementById('confirmModalContent');
    
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        if (window._cancelCallback) {
            window._cancelCallback();
        }
        window._confirmCallback = null;
        window._cancelCallback = null;
    }, 200);
}

function confirmYes() {
    const modal = document.getElementById('confirmModal');
    const content = document.getElementById('confirmModalContent');
    
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        if (window._confirmCallback) {
            window._confirmCallback();
        }
        window._confirmCallback = null;
        window._cancelCallback = null;
    }, 200);
}

// Override native alert and confirm (optional)
window.alert = function(message) {
    showAlert(message, 'info');
};

// Close modals with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeAlert();
        closeConfirm();
    }
});

