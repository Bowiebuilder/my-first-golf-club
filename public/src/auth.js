/* ============================================
   AUTH SYSTEM - src/auth.js
   Uses Clerk for authentication (Google, Apple, Facebook, Email)
   Falls back to localStorage when Clerk is unavailable
   Depends on: storage.js, api.js, toasts.js, navigation.js
   ============================================ */

var _clerkReady = false;
var _clerkInstance = null;

// Wait for Clerk to load and initialize
async function initClerk() {
  // Clerk SDK loads async via script tag, sets window.Clerk
  var maxWait = 10000;
  var waited = 0;
  while (!window.Clerk && waited < maxWait) {
    await new Promise(function(r) { setTimeout(r, 100); });
    waited += 100;
  }

  if (!window.Clerk) {
    console.warn('Clerk SDK did not load - falling back to localStorage auth');
    return;
  }

  try {
    // Clerk auto-initializes from the script tag's data-clerk-publishable-key
    // Wait for it to be ready
    await window.Clerk.load();
    _clerkInstance = window.Clerk;
    _clerkReady = true;

    // Listen for auth state changes
    _clerkInstance.addListener(function(event) {
      updateAuthUI();
      // If user just signed in and there's a pending card, process it
      if (_clerkInstance.user && typeof _pendingCardData !== 'undefined' && _pendingCardData) {
        closeAuth();
        showToast('success', 'Welcome!', 'Saving your card now...');
        setTimeout(function() { processPendingCard(); }, 300);
      } else if (_clerkInstance.user) {
        closeAuth();
      }
    });

    updateAuthUI();
  } catch (e) {
    console.warn('Clerk initialization failed:', e);
  }
}

// Get the current user - prefers API._user (D1 data), then Clerk, then localStorage
function getCurrentUser() {
  // If we have synced D1 data via API, use that (has XP, badges, card_id etc)
  if (USE_API && API._user) {
    var u = API._user;
    return {
      id: u.id, email: u.email, name: u.name,
      xp: u.xp || 0, level: u.level || 'Starter',
      cardId: u.card_id, card_id: u.card_id,
      playedCourses: u.played_courses || [], played_courses: JSON.stringify(u.played_courses || []),
      unlockedBadges: u.unlocked_badges || [], unlocked_badges: JSON.stringify(u.unlocked_badges || []),
      createdAt: u.created_at, created_at: u.created_at
    };
  }

  // Clerk user present but no D1 sync yet
  if (_clerkReady && _clerkInstance && _clerkInstance.user) {
    var cu = _clerkInstance.user;
    return {
      id: cu.id,
      email: cu.primaryEmailAddress ? cu.primaryEmailAddress.emailAddress : '',
      name: cu.fullName || cu.firstName || 'User',
      xp: 0, level: 'Starter',
      cardId: null, card_id: null,
      playedCourses: [], played_courses: '[]',
      unlockedBadges: [], unlocked_badges: '[]',
      createdAt: cu.createdAt, created_at: cu.createdAt
    };
  }

  // localStorage fallback
  var email = localStorage.getItem(STORAGE_SESSION);
  if (!email) return null;
  var users = getUsers();
  return users.find(function(u) { return u.email === email; }) || null;
}

function saveCurrentUser(user) {
  // Update localStorage cache
  var users = getUsers();
  var idx = users.findIndex(function(u) { return u.email === user.email; });
  if (idx >= 0) { users[idx] = user; saveUsers(users); }
  if (USE_API) API._user = user;
}

// Open auth modal - Clerk handles the UI
function openAuth(mode) {
  var modal = document.getElementById('authModal');
  var mount = document.getElementById('clerk-auth-mount');

  if (_clerkReady && _clerkInstance && mount) {
    // Clear any previous mount
    mount.innerHTML = '';

    if (mode === 'signin') {
      _clerkInstance.mountSignIn(mount, {
        appearance: {
          variables: {
            colorPrimary: '#1a5e3a',
            colorText: '#2c2c2c',
            fontFamily: 'Inter, sans-serif',
            borderRadius: '12px'
          }
        }
      });
    } else {
      _clerkInstance.mountSignUp(mount, {
        appearance: {
          variables: {
            colorPrimary: '#1a5e3a',
            colorText: '#2c2c2c',
            fontFamily: 'Inter, sans-serif',
            borderRadius: '12px'
          }
        }
      });
    }

    modal.style.display = 'flex';
  } else {
    // Clerk not ready - show a loading state or fallback
    showToast('error', 'Loading...', 'Authentication is loading, please try again in a moment');
  }
}

function closeAuth() {
  var modal = document.getElementById('authModal');
  var mount = document.getElementById('clerk-auth-mount');

  if (_clerkReady && _clerkInstance && mount) {
    try {
      _clerkInstance.unmountSignIn(mount);
      _clerkInstance.unmountSignUp(mount);
    } catch (e) { /* may not be mounted */ }
  }

  if (modal) modal.style.display = 'none';

  // Clear pending card if user dismisses
  if (typeof _pendingCardData !== 'undefined') {
    _pendingCardData = null;
    _pendingCardType = null;
  }
}

async function handleSignOut() {
  if (_clerkReady && _clerkInstance) {
    await _clerkInstance.signOut();
  }
  localStorage.removeItem(STORAGE_SESSION);
  if (USE_API) API._user = null;
  updateAuthUI();
  closeUserDropdown();
  showSection('hero');
  showToast('success', 'Signed out', 'See you on the fairway');
}

function updateAuthUI() {
  var user = getCurrentUser();
  var loggedOut = document.getElementById('navLoggedOut');
  var loggedIn = document.getElementById('navLoggedIn');
  var mobileOut = document.getElementById('navMobileLoggedOut');
  var mobileIn = document.getElementById('navMobileLoggedIn');

  if (user) {
    if (loggedOut) loggedOut.style.display = 'none';
    if (loggedIn) loggedIn.style.display = '';
    if (mobileOut) mobileOut.style.display = 'none';
    if (mobileIn) mobileIn.style.display = '';
    var avatar = document.getElementById('navAvatar');
    if (avatar) {
      // Use Clerk profile image if available
      if (_clerkReady && _clerkInstance && _clerkInstance.user && _clerkInstance.user.imageUrl) {
        avatar.innerHTML = '<img src="' + _clerkInstance.user.imageUrl + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">';
      } else {
        avatar.textContent = getInitials(user.name);
      }
    }
  } else {
    if (loggedOut) loggedOut.style.display = '';
    if (loggedIn) loggedIn.style.display = 'none';
    if (mobileOut) mobileOut.style.display = '';
    if (mobileIn) mobileIn.style.display = 'none';
  }
}

function toggleUserDropdown() {
  var dd = document.getElementById('navDropdown');
  if (dd) dd.classList.toggle('open');
}

function closeUserDropdown() {
  var dd = document.getElementById('navDropdown');
  if (dd) dd.classList.remove('open');
}

// Legacy functions kept as no-ops for compatibility
function handleAuth(event, mode) { if (event) event.preventDefault(); openAuth(mode); return false; }
function toggleAuthMode(mode) { openAuth(mode); }
