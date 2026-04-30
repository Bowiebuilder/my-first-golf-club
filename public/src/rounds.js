/* ============================================
   ROUNDS - src/rounds.js
   Round logging, modal, user rounds
   Depends on: storage.js, api.js, auth.js, xp.js, badges.js, feed.js, top100.js, toasts.js
   ============================================ */

// Cache for API rounds data
var _cachedRounds = null;
var _cachedRoundStats = null;

function openRoundModal() {
  var user = getCurrentUser();
  if (!user) { openAuth('signin'); return; }
  document.getElementById('roundModal').style.display = 'flex';
  var dateInput = document.querySelector('#roundForm input[name="date"]');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
}

function closeRoundModal() {
  document.getElementById('roundModal').style.display = 'none';
}

async function logRound(event) {
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

  // Field-level validation
  _clearErrors(form);
  var errors = 0;

  if (!courseName || courseName.trim().length < 2) {
    _showFieldError(form, 'courseName', 'Which course did you play?');
    errors++;
  }
  if (!date) {
    _showFieldError(form, 'date', 'When did you play this round?');
    errors++;
  }
  if (isNaN(score)) {
    _showFieldError(form, 'score', 'What was your total score?');
    errors++;
  } else if (score < 40 || score > 200) {
    _showFieldError(form, 'score', 'Score should be between 40 and 200');
    errors++;
  }

  if (errors > 0) {
    _scrollToFirstError(form);
    showToast('error', errors + ' field' + (errors > 1 ? 's' : '') + ' need attention', 'Please check the highlighted fields');
    return false;
  }

  try {
    if (USE_API) {
      await API.logRound({
        courseName: courseName, date: date, score: score,
        par: par, conditions: conditions, notes: notes
      });
      // Invalidate cache so clubhouse reloads fresh
      _cachedRounds = null;
      _cachedRoundStats = null;
      // Refresh user (XP updated server-side)
      await API.getMe();
    } else {
      // localStorage mode
      var round = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        userId: user.email, courseName: courseName, date: date,
        score: score, par: par, conditions: conditions,
        notes: notes, createdAt: new Date().toISOString()
      };
      var rounds = getRounds();
      rounds.unshift(round);
      saveRounds(rounds);
      awardXP(25, 'Logging a round at ' + courseName);

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
      addFeedItem('round_logged', { courseName: courseName, score: score, par: par });
    }
  } catch (err) {
    showToast('error', 'Failed to log round', err.message || 'Please try again');
    return false;
  }

  closeRoundModal();
  form.reset();
  showToast('success', 'Round logged!', score + ' at ' + courseName);
  setTimeout(function() { checkBadges(); }, 1000);
  return false;
}

// Get rounds - uses API with cache, falls back to localStorage
async function getUserRoundsAsync() {
  if (_cachedRounds) return { rounds: _cachedRounds, stats: _cachedRoundStats };
  try {
    if (USE_API) {
      var result = await API.getRounds(200);
      // Map snake_case to camelCase
      _cachedRounds = result.rounds.map(function(r) {
        return {
          id: r.id, userId: r.user_id, courseName: r.course_name,
          date: r.date, score: r.score, par: r.par,
          conditions: r.conditions, notes: r.notes, createdAt: r.created_at
        };
      });
      _cachedRoundStats = result.stats;
      return { rounds: _cachedRounds, stats: _cachedRoundStats };
    }
  } catch (e) { /* fall through */ }
  // localStorage fallback
  var rounds = getUserRounds();
  return { rounds: rounds, stats: _computeStats(rounds) };
}

// Sync version for localStorage mode
function getUserRounds(email) {
  var target = email || (getCurrentUser() ? getCurrentUser().email : null);
  if (!target) return [];
  return getRounds().filter(function(r) { return r.userId === target; });
}

function _computeStats(rounds) {
  if (!rounds || rounds.length === 0) return { total: 0, bestScore: null, bestCourse: null, avgScore: null };
  var best = getBestRound(rounds);
  return {
    total: rounds.length,
    bestScore: best ? best.score : null,
    bestCourse: best ? best.courseName : null,
    avgScore: getAverageScore(rounds)
  };
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
