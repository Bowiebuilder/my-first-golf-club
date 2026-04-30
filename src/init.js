/* ============================================
   INITIALIZATION - src/init.js
   Boot sequence, event listeners
   Depends on: ALL other modules
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
  // Seed demo data on first visit
  seedDemoData();

  // Set up auth UI
  updateAuthUI();

  // Render hero stats
  updateHeroStats();

  // Render card preview on submit page
  renderPreviewCard();

  // Bind form live-preview events
  bindFormEvents();

  // Close modals on overlay click
  var modalIds = ['successModal', 'detailModal', 'authModal', 'roundModal', 'badgeModal', 'shareModal'];
  modalIds.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', function(e) {
        if (e.target === e.currentTarget) {
          e.target.style.display = 'none';
        }
      });
    }
  });

  // Escape key closes modals
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(function(m) {
        m.style.display = 'none';
      });
      closeUserDropdown();
    }
  });

  // Close user dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-avatar-wrapper')) {
      closeUserDropdown();
    }
  });
});
