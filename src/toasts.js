/* ============================================
   TOAST NOTIFICATIONS - src/toasts.js
   ============================================ */

function showToast(type, title, message, duration) {
  duration = duration || 4000;
  var container = document.getElementById('toastContainer');
  if (!container) return;

  var icons = {
    xp: '&#11088;',
    badge: '&#127942;',
    level: '&#128640;',
    success: '&#9989;',
    error: '&#10060;'
  };

  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerHTML =
    '<span class="toast-icon">' + (icons[type] || icons.success) + '</span>' +
    '<div class="toast-content">' +
      '<div class="toast-title">' + title + '</div>' +
      '<div class="toast-message">' + message + '</div>' +
    '</div>';

  container.appendChild(toast);

  setTimeout(function() {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(function() { toast.remove(); }, 300);
  }, duration);
}
