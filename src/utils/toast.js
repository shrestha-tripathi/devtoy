/**
 * DevToyNative - Toast Notification System
 */

let toastContainer = null;

/**
 * Initialize toast container
 */
function ensureContainer() {
  if (!toastContainer) {
    toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      toastContainer.id = 'toastContainer';
      document.body.appendChild(toastContainer);
    }
  }
  return toastContainer;
}

/**
 * Show a toast notification
 * @param {Object} options - Toast options
 * @param {string} options.message - Toast message
 * @param {string} options.type - Toast type (success, error, info)
 * @param {number} options.duration - Duration in ms (default: 3000)
 */
export function showToast({ message, type = 'info', duration = 3000 }) {
  const container = ensureContainer();
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <path d="M22 4 12 14.01l-3-3"/>
    </svg>`,
    error: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="m15 9-6 6M9 9l6 6"/>
    </svg>`,
    info: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4M12 8h.01"/>
    </svg>`
  };
  
  toast.innerHTML = `
    ${icons[type] || icons.info}
    <span class="toast-message">${escapeHtml(message)}</span>
  `;
  
  container.appendChild(toast);
  
  // Auto remove
  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
  
  return toast;
}

/**
 * Show success toast
 * @param {string} message - Toast message
 */
export function success(message) {
  return showToast({ message, type: 'success' });
}

/**
 * Show error toast
 * @param {string} message - Toast message
 */
export function error(message) {
  return showToast({ message, type: 'error' });
}

/**
 * Show info toast
 * @param {string} message - Toast message
 */
export function info(message) {
  return showToast({ message, type: 'info' });
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export default { showToast, success, error, info };
