/* ============================================
   AUTH SYSTEM - src/auth.js
   Uses Clerk for authentication (Google, Apple, Facebook, Email)
   Falls back to localStorage when Clerk is unavailable
   Depends on: storage.js, api.js, toasts.js, navigation.js
   ============================================ */

var _clerkReady = false;
var _clerkInstance = null;
var _authMode = null; // 'signin' or 'signup'

// Wait for Clerk to load and initialize with UI bundle
async function initClerk() {
  // Wait for Clerk global to appear (set by the defer script tag)
  var maxWait = 15000;
  var waited = 0;
  while (!window.Clerk && waited < maxWait) {
    await new Promise(function(r) { setTimeout(r, 150); });
    waited += 150;
  }

  if (!window.Clerk) {
    console.warn('Clerk SDK did not load');
    return;
  }

  try {
    // Load Clerk with the UI constructor (from the separate UI bundle)
    var loadOptions = {};
    if (window.__internal_ClerkUICtor) {
      loadOptions.ui = { ClerkUI: window.__internal_ClerkUICtor };
    }
    await window.Clerk.load(loadOptions);

    _clerkInstance = window.Clerk;
    _clerkReady = true;

    // Listen for auth state changes
    _clerkInstance.addListener(function() {
      updateAuthUI();

      // If user just signed in
      if (_clerkInstance.user) {
        // Close our modal
        var modal = document.getElementById('authModal');
        if (modal && modal.style.display !== 'none') {
          closeAuth();
        }

        // If there's a pending card from the form flow, process it
        if (typeof _pendingCardData !== 'undefined' && _pendingCardData) {
          showToast('success', 'Welcome!', 'Saving your card now...');
          setTimeout(function() { processPendingCard(); }, 500);
        }
      }
    });

    updateAuthUI();
  } catch (e) {
    console.warn('Clerk init failed:', e);
  }
}

// Get the current user
function getCurrentUser() {
  // Prefer API._user (has D1 data: XP, badges, card_id)
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
  var users = getUsers();
  var idx = users.findIndex(function(u) { return u.email === user.email; });
  if (idx >= 0) { users[idx] = user; saveUsers(users); }
  if (USE_API) API._user = user;
}

// Open auth - mount Clerk SignIn/SignUp into our modal
function openAuth(mode) {
  if (!_clerkReady || !_clerkInstance) {
    showToast('error', 'Loading...', 'Authentication is still loading. Please try again in a moment.');
    return;
  }

  _authMode = mode;
  var modal = document.getElementById('authModal');
  var mount = document.getElementById('clerk-auth-mount');
  if (!modal || !mount) return;

  // Show context toast if triggered from card submission
  if (typeof _pendingCardData !== 'undefined' && _pendingCardData) {
    showToast('success', 'Almost there!', 'Sign in to save your card to the community');
  }

  // Clear previous mount
  mount.innerHTML = '';

  var appearance = {
    variables: {
      colorPrimary: '#1a5e3a',
      fontFamily: 'Inter, -apple-system, sans-serif',
      borderRadius: '12px'
    }
  };

  if (mode === 'signin') {
    _clerkInstance.mountSignIn(mount, { appearance: appearance });
  } else {
    _clerkInstance.mountSignUp(mount, { appearance: appearance });
  }

  modal.style.display = 'flex';
}

function closeAuth() {
  var modal = document.getElementById('authModal');
  var mount = document.getElementById('clerk-auth-mount');

  if (_clerkReady && _clerkInstance && mount) {
    try { _clerkInstance.unmountSignIn(mount); } catch (e) {}
    try { _clerkInstance.unmountSignUp(mount); } catch (e) {}
    mount.innerHTML = '';
  }

  if (modal) modal.style.display = 'none';
  _authMode = null;

  // Clear pending card if user dismisses without signing in
  if (!getCurrentUser() && typeof _pendingCardData !== 'undefined') {
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

// Legacy functions kept for HTML onclick compatibility
function handleAuth(event, mode) { if (event) event.preventDefault(); openAuth(mode); return false; }
function toggleAuthMode(mode) { closeAuth(); setTimeout(function() { openAuth(mode); }, 100); }
