/* ============================================
   AUTH SYSTEM - src/auth.js
   Uses API client with localStorage fallback
   Depends on: storage.js, api.js, toasts.js, xp.js, navigation.js
   ============================================ */

// Whether to use API (true when deployed) or localStorage (local dev fallback)
var USE_API = (typeof API !== 'undefined');

function simpleHash(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    var ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return hash.toString(36);
}

function getCurrentUser() {
  // Check API cache first
  if (USE_API && API._user) return API._user;
  // Fallback to localStorage
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
  // Update API cache
  if (USE_API) API._user = user;
}

async function handleAuth(event, mode) {
  event.preventDefault();
  var form = mode === 'signup'
    ? document.getElementById('signupForm')
    : document.getElementById('signinForm');
  var fd = new FormData(form);

  if (mode === 'signup') {
    var name = fd.get('fullName');
    var email = fd.get('email');
    var pw = fd.get('password');
    var pw2 = fd.get('confirmPassword');

    if (pw !== pw2) {
      showToast('error', 'Passwords don\'t match', 'Please check your passwords');
      return false;
    }

    try {
      if (USE_API) {
        var data = await API.signup(name, email, pw);
        // Also cache in localStorage for offline compatibility
        var localUser = Object.assign({}, data.user, {
          passwordHash: simpleHash(pw),
          playedCourses: data.user.played_courses || [],
          unlockedBadges: data.user.unlocked_badges || [],
          cardId: data.user.card_id
        });
        var users = getUsers();
        users.push(localUser);
        saveUsers(users);
        localStorage.setItem(STORAGE_SESSION, email);
      } else {
        // Pure localStorage mode
        var users = getUsers();
        if (users.find(function(u) { return u.email === email; })) {
          showToast('error', 'Email taken', 'An account with this email already exists');
          return false;
        }
        var localUser = {
          email: email, name: name, passwordHash: simpleHash(pw),
          createdAt: new Date().toISOString(), xp: 0, level: 'Starter',
          cardId: null, playedCourses: [], unlockedBadges: []
        };
        users.push(localUser);
        saveUsers(users);
        localStorage.setItem(STORAGE_SESSION, email);
        awardXP(100, 'Joining the club');
      }
    } catch (err) {
      showToast('error', 'Signup failed', err.message || 'Please try again');
      return false;
    }

    closeAuth();
    updateAuthUI();

    if (typeof _pendingCardData !== 'undefined' && _pendingCardData) {
      showToast('success', 'Welcome to the club!', 'Saving your card now...');
      setTimeout(function() { processPendingCard(); }, 300);
    } else {
      showSection('submit');
      showToast('success', 'Welcome to the club!', 'Now create your playing card');
    }

  } else {
    // Sign in
    var email2 = fd.get('email');
    var pw3 = fd.get('password');

    try {
      if (USE_API) {
        var data = await API.signin(email2, pw3);
        // Cache locally
        localStorage.setItem(STORAGE_SESSION, email2);
      } else {
        var users2 = getUsers();
        var found = users2.find(function(u) { return u.email === email2; });
        if (!found || found.passwordHash !== simpleHash(pw3)) {
          showToast('error', 'Invalid credentials', 'Check your email and password');
          return false;
        }
        localStorage.setItem(STORAGE_SESSION, email2);
      }
    } catch (err) {
      showToast('error', 'Sign in failed', err.message || 'Check your credentials');
      return false;
    }

    closeAuth();
    updateAuthUI();

    var user = getCurrentUser();
    if (typeof _pendingCardData !== 'undefined' && _pendingCardData) {
      showToast('success', 'Welcome back!', 'Saving your card now...');
      setTimeout(function() { processPendingCard(); }, 300);
    } else {
      showToast('success', 'Welcome back!', 'Good to see you, ' + (user ? user.name : ''));
      showSection('clubhouse');
    }
  }

  form.reset();
  return false;
}

async function handleSignOut() {
  try {
    if (USE_API) await API.signout();
  } catch (e) { /* ignore */ }
  localStorage.removeItem(STORAGE_SESSION);
  if (USE_API) API._user = null;
  updateAuthUI();
  closeUserDropdown();
  showSection('hero');
  showToast('success', 'Signed out', 'See you on the fairway');
}

function openAuth(mode) {
  document.getElementById('authModal').style.display = 'flex';
  toggleAuthMode(mode);
  if (typeof _pendingCardData !== 'undefined' && _pendingCardData) {
    var title = document.getElementById('authModalTitle');
    if (title) title.textContent = 'Join to Save Your Card';
  }
}

function closeAuth() {
  document.getElementById('authModal').style.display = 'none';
  if (typeof _pendingCardData !== 'undefined') {
    _pendingCardData = null;
    _pendingCardType = null;
  }
}

function toggleAuthMode(mode) {
  var title = document.getElementById('authModalTitle');
  var signup = document.getElementById('signupForm');
  var signin = document.getElementById('signinForm');
  if (mode === 'signup') {
    title.textContent = 'Join the Club';
    signup.style.display = '';
    signin.style.display = 'none';
  } else {
    title.textContent = 'Welcome Back';
    signup.style.display = 'none';
    signin.style.display = '';
  }
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
    if (avatar) avatar.textContent = getInitials(user.name);
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
