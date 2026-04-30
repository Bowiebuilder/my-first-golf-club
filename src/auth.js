/* ============================================
   AUTH SYSTEM - src/auth.js
   Signup, signin, session, UI updates
   Depends on: storage.js, toasts.js, xp.js, navigation.js
   ============================================ */

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
  var email = localStorage.getItem(STORAGE_SESSION);
  if (!email) return null;
  var users = getUsers();
  return users.find(function(u) { return u.email === email; }) || null;
}

function saveCurrentUser(user) {
  var users = getUsers();
  var idx = users.findIndex(function(u) { return u.email === user.email; });
  if (idx >= 0) {
    users[idx] = user;
    saveUsers(users);
  }
}

function handleAuth(event, mode) {
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

    var users = getUsers();
    if (users.find(function(u) { return u.email === email; })) {
      showToast('error', 'Email taken', 'An account with this email already exists');
      return false;
    }

    var user = {
      email: email,
      name: name,
      passwordHash: simpleHash(pw),
      createdAt: new Date().toISOString(),
      xp: 0,
      level: 'Starter',
      cardId: null,
      playedCourses: [],
      unlockedBadges: []
    };
    users.push(user);
    saveUsers(users);
    localStorage.setItem(STORAGE_SESSION, email);
    closeAuth();
    updateAuthUI();
    awardXP(100, 'Joining the club');

    // If there's a pending card, process it now (don't navigate away)
    if (typeof _pendingCardData !== 'undefined' && _pendingCardData) {
      showToast('success', 'Welcome to the club!', 'Saving your card now...');
      setTimeout(function() { processPendingCard(); }, 300);
    } else {
      showSection('submit');
      showToast('success', 'Welcome to the club!', 'Now create your playing card');
    }
  } else {
    var email2 = fd.get('email');
    var pw3 = fd.get('password');
    var users2 = getUsers();
    var found = users2.find(function(u) { return u.email === email2; });

    if (!found || found.passwordHash !== simpleHash(pw3)) {
      showToast('error', 'Invalid credentials', 'Check your email and password');
      return false;
    }

    localStorage.setItem(STORAGE_SESSION, email2);
    closeAuth();
    updateAuthUI();

    // If there's a pending card, process it now
    if (typeof _pendingCardData !== 'undefined' && _pendingCardData) {
      showToast('success', 'Welcome back!', 'Saving your card now...');
      setTimeout(function() { processPendingCard(); }, 300);
    } else {
      showToast('success', 'Welcome back!', 'Good to see you, ' + found.name);
      showSection('clubhouse');
    }
  }

  form.reset();
  return false;
}

function handleSignOut() {
  localStorage.removeItem(STORAGE_SESSION);
  updateAuthUI();
  closeUserDropdown();
  showSection('hero');
  showToast('success', 'Signed out', 'See you on the fairway');
}

function openAuth(mode) {
  document.getElementById('authModal').style.display = 'flex';
  toggleAuthMode(mode);

  // If triggered from card submission, show contextual title
  if (typeof _pendingCardData !== 'undefined' && _pendingCardData) {
    var title = document.getElementById('authModalTitle');
    if (title) title.textContent = 'Join to Save Your Card';
  }
}

function closeAuth() {
  document.getElementById('authModal').style.display = 'none';
  // Clear pending card if user dismisses the auth modal
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
