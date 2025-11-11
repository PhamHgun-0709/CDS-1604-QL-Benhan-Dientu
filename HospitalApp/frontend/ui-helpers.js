// ===== UI HELPER LIBRARY =====
// Toast Notifications, Loading Spinners, Confirm Dialogs, etc.

// Toast Notification System
class Toast {
  constructor() {
    this.container = null;
    this.init();
  }
  
  init() {
    if (!document.getElementById('toast-container')) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('toast-container');
    }
  }
  
  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close">&times;</button>
    `;
    
    this.container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('toast-show'), 10);
    
    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.hide(toast));
    
    // Auto hide
    if (duration > 0) {
      setTimeout(() => this.hide(toast), duration);
    }
    
    return toast;
  }
  
  hide(toast) {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 300);
  }
  
  success(message, duration) {
    return this.show(message, 'success', duration);
  }
  
  error(message, duration) {
    return this.show(message, 'error', duration);
  }
  
  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }
  
  info(message, duration) {
    return this.show(message, 'info', duration);
  }
}

// Loading Spinner
class Loading {
  constructor() {
    this.overlay = null;
    this.init();
  }
  
  init() {
    if (!document.getElementById('loading-overlay')) {
      this.overlay = document.createElement('div');
      this.overlay.id = 'loading-overlay';
      this.overlay.className = 'loading-overlay';
      this.overlay.innerHTML = `
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p class="loading-text">Đang tải...</p>
        </div>
      `;
      document.body.appendChild(this.overlay);
    } else {
      this.overlay = document.getElementById('loading-overlay');
    }
  }
  
  show(text = 'Đang tải...') {
    const loadingText = this.overlay.querySelector('.loading-text');
    if (loadingText) loadingText.textContent = text;
    this.overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  
  hide() {
    this.overlay.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// Confirm Dialog
class Confirm {
  constructor() {
    this.dialog = null;
    this.init();
  }
  
  init() {
    if (!document.getElementById('confirm-dialog')) {
      this.dialog = document.createElement('div');
      this.dialog.id = 'confirm-dialog';
      this.dialog.className = 'confirm-dialog';
      this.dialog.innerHTML = `
        <div class="confirm-content">
          <div class="confirm-icon"></div>
          <h3 class="confirm-title"></h3>
          <p class="confirm-message"></p>
          <div class="confirm-actions">
            <button class="btn-cancel">Hủy</button>
            <button class="btn-confirm">Xác nhận</button>
          </div>
        </div>
      `;
      document.body.appendChild(this.dialog);
    } else {
      this.dialog = document.getElementById('confirm-dialog');
    }
  }
  
  show(options = {}) {
    const {
      title = 'Xác nhận',
      message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
      confirmText = 'Xác nhận',
      cancelText = 'Hủy',
      type = 'warning', // warning, danger, info
      onConfirm = () => {},
      onCancel = () => {}
    } = options;
    
    const icons = {
      warning: '⚠️',
      danger: '🗑️',
      info: 'ℹ️'
    };
    
    this.dialog.querySelector('.confirm-icon').textContent = icons[type] || icons.warning;
    this.dialog.querySelector('.confirm-title').textContent = title;
    this.dialog.querySelector('.confirm-message').textContent = message;
    this.dialog.querySelector('.btn-confirm').textContent = confirmText;
    this.dialog.querySelector('.btn-cancel').textContent = cancelText;
    
    const confirmBtn = this.dialog.querySelector('.btn-confirm');
    const cancelBtn = this.dialog.querySelector('.btn-cancel');
    
    // Apply danger style for delete actions
    if (type === 'danger') {
      confirmBtn.style.background = '#ef4444';
    } else {
      confirmBtn.style.background = '';
    }
    
    const handleConfirm = () => {
      this.hide();
      onConfirm();
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
    };
    
    const handleCancel = () => {
      this.hide();
      onCancel();
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
    };
    
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    
    this.dialog.classList.add('show');
  }
  
  hide() {
    this.dialog.classList.remove('show');
  }
}

// Password Toggle
function setupPasswordToggles() {
  document.querySelectorAll('input[type="password"]').forEach(input => {
    // Skip if already setup
    if (input.parentElement.classList.contains('password-wrapper')) return;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'password-wrapper';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'password-toggle';
    toggle.innerHTML = '👁️';
    toggle.title = 'Hiện/Ẩn mật khẩu';
    
    toggle.addEventListener('click', () => {
      if (input.type === 'password') {
        input.type = 'text';
        toggle.innerHTML = '🙈';
      } else {
        input.type = 'password';
        toggle.innerHTML = '👁️';
      }
    });
    
    wrapper.appendChild(toggle);
  });
}

// Button Loading State
function setButtonLoading(button, loading = true, originalText = null) {
  if (loading) {
    button.dataset.originalText = button.textContent;
    button.textContent = '⏳ Đang xử lý...';
    button.disabled = true;
  } else {
    button.textContent = originalText || button.dataset.originalText || button.textContent;
    button.disabled = false;
    delete button.dataset.originalText;
  }
}

// Initialize UI Helpers
const toast = new Toast();
const loading = new Loading();
const confirm = new Confirm();

// Export for use in other modules
window.toast = toast;
window.loading = loading;
window.confirm = confirm;
window.setupPasswordToggles = setupPasswordToggles;
window.setButtonLoading = setButtonLoading;

// Auto-setup password toggles on page load
document.addEventListener('DOMContentLoaded', () => {
  setupPasswordToggles();
});

export { toast, loading, confirm, setupPasswordToggles, setButtonLoading };
