/* ============================================
   INITIALIZATION - src/init.js
   Boot sequence, event listeners
   Depends on: ALL other modules
   ============================================ */

document.addEventListener('DOMContentLoaded', async function() {
  // Enable API mode if the API client loaded
  if (typeof API !== 'undefined') USE_API = true;

  // Seed demo data for localStorage fallback on first visit
  seedDemoData();

  // Initialize Clerk auth
  if (typeof initClerk === 'function') {
    await initClerk();
  }

  // If Clerk user exists, sync with D1 via API
  if (_clerkReady && _clerkInstance && _clerkInstance.user && typeof API !== 'undefined') {
    try {
      var dbUser = await API.getMe();
      if (dbUser) {
        // Merge D1 data into the user object
        API._user = dbUser;
      }
    } catch (e) {
      // API sync failed - app still works with Clerk user locally
    }
  }

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
          // If Clerk modal, unmount first
          if (id === 'authModal') closeAuth();
          else e.target.style.display = 'none';
        }
      });
    }
  });

  // Escape key closes modals
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeAuth();
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
