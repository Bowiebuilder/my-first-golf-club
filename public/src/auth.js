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
  var maxWait = 10000;
  var waited = 0;
  while (!window.Clerk && waited < maxWait) {
    await new Promise(function(r) { setTimeout(r, 100); });
    waited += 100;
  }

  if (!window.Clerk) {
    console.warn('Clerk SDK did not load');
    return;
  }

  try {
    await window.Clerk.load();
    _clerkInstance = window.Clerk;
    _clerkReady = true;

    // Listen for auth state changes
    _clerkInstance.addListener(function() {
      updateAuthUI();
      // If user just signed in and there's a pending card, process it
      if (_clerkInstance.user && typeof _pendingCardData !== 'undefined' && _pendingCardData) {
        showToast('success', 'Welcome!', 'Saving your card now...');
        setTimeout(function() { processPendingCard(); }, 500);
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

// Open Clerk's auth UI
function openAuth(mode) {
  if (!_clerkReady || !_clerkInstance) {
    showToast('error', 'Loading...', 'Authentication is loading, please try again in a moment');
    return;
  }

  // Show context toast if triggered from card submission
  if (typeof _pendingCardData !== 'undefined' && _pendingCardData) {
    showToast('success', 'Almost there!', 'Sign in to save your card to the community');
  }

  var clerkOptions = {
    appearance: {
      variables: {
        colorPrimary: '#1a5e3a',
        fontFamily: 'Inter, sans-serif',
        borderRadius: '12px'
      }
    }
  };

  // Use Clerk's redirect method - works reliably with the CDN bundle
  // After auth completes, Clerk redirects back to our site and the
  // addListener callback detects the signed-in user
  try {
    if (mode === 'signin') {
      _clerkInstance.redirectToSignIn({ redirectUrl: window.location.href });
    } else {
      _clerkInstance.redirectToSignUp({ redirectUrl: window.location.href });
    }
  } catch (e) {
    console.error('Clerk auth error:', e);
    showToast('error', 'Auth unavailable', 'Please refresh the page and try again');
  }
}

function closeAuth() {
  if (_clerkReady && _clerkInstance) {
    try { _clerkInstance.closeSignIn(); } catch (e) {}
    try { _clerkInstance.closeSignUp(); } catch (e) {}
  }
  // Also hide our custom modal overlay if it was shown
  var modal = document.getElementById('authModal');
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
function toggleAuthMode(mode) { openAuth(mode); }
