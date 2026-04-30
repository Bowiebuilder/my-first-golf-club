/* ============================================
   ROUNDS - src/rounds.js
   Round logging, modal, user rounds
   Depends on: storage.js, auth.js, xp.js, badges.js, feed.js, top100.js, toasts.js
   ============================================ */

function openRoundModal() {
  var user = getCurrentUser();
  if (!user) { openAuth('signin'); return; }
  document.getElementById('roundModal').style.display = 'flex';
  // Set date default to today
  var dateInput = document.querySelector('#roundForm input[name="date"]');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
}

function closeRoundModal() {
  document.getElementById('roundModal').style.display = 'none';
}

function logRound(event) {
  event.preventDefault();
  var user = getCurrentUser();
  if (!user) { openAuth('signin'); return false; }

  var form = document.getElementById('roundForm');
  var fd = new FormData(form);

  var courseName = fd.get('courseName');
  var date = fd.get('date');
  var score = parseInt(fd.get('score'));
  var par = parseInt(fd.get('par')) || 72;
  var conditions = fd.get('conditions') || '';
  var notes = fd.get('notes') || '';

  if (!courseName || !date || isNaN(score)) {
    showToast('error', 'Missing fields', 'Please fill in course, date, and score');
    return false;
  }

  var round = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    userId: user.email,
    courseName: courseName,
    date: date,
    score: score,
    par: par,
    conditions: conditions,
    notes: notes,
    createdAt: new Date().toISOString()
  };

  var rounds = getRounds();
  rounds.unshift(round);
  saveRounds(rounds);

  // Award XP
  awardXP(25, 'Logging a round at ' + courseName);

  // Check if Top 100 course
  if (typeof isTop100Course === 'function' && isTop100Course(courseName)) {
    if (!user.playedCourses) user.playedCourses = [];
    if (user.playedCourses.indexOf(courseName) < 0) {
      user.playedCourses.push(courseName);
      saveCurrentUser(user);
      setTimeout(function() {
        awardXP(50, 'Playing a Top 100 course!');
        addFeedItem('course_played', { courseName: courseName });
      }, 700);
    }
  }

  // Feed
  addFeedItem('round_logged', { courseName: courseName, score: score, par: par });

  // Close modal, reset form
  closeRoundModal();
  form.reset();

  showToast('success', 'Round logged!', score + ' at ' + courseName);

  // Check badges
  setTimeout(function() { checkBadges(); }, 1000);

  return false;
}

function getUserRounds(email) {
  var target = email || (getCurrentUser() ? getCurrentUser().email : null);
  if (!target) return [];
  return getRounds().filter(function(r) { return r.userId === target; });
}

function getBestRound(rounds) {
  if (!rounds || rounds.length === 0) return null;
  return rounds.reduce(function(best, r) {
    return r.score < best.score ? r : best;
  }, rounds[0]);
}

function getAverageScore(rounds) {
  if (!rounds || rounds.length === 0) return 0;
  var total = rounds.reduce(function(sum, r) { return sum + r.score; }, 0);
  return Math.round(total / rounds.length);
}
