/* ============================================
   CLUBHOUSE / PROFILE - src/clubhouse.js
   Dashboard, overview, rounds, badges, collection tabs
   Depends on: storage.js, api.js, auth.js, xp.js, badges.js, rounds.js, cards.js, top100.js
   ============================================ */

async function renderClubhouse() {
  var user = getCurrentUser();
  if (!user) { showSection('hero'); return; }
  await renderClubhouseHeader(user);
  await setClubhouseTab(currentClubhouseTab);
}

async function renderClubhouseHeader(user) {
  var header = document.getElementById('clubhouseHeader');
  if (!header) return;

  var level = getLevel(user.xp);
  var next = getNextLevel(user.xp);
  var progress = getLevelProgress(user.xp);
  var pct = Math.round(progress * 100);

  // Get rounds
  var roundsData = await getUserRoundsAsync();
  var rounds = roundsData.rounds || [];
  var best = roundsData.stats ? roundsData.stats.bestScore : null;

  var cards = getCards();
  var userCard = cards.find(function(c) { return c.id === user.cardId; });
  var initials = getInitials(user.name);

  var avatarHTML = userCard && userCard.photo
    ? '<img src="' + userCard.photo + '" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid var(--gold);">'
    : '<div style="width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:#fff;background:var(--green);border:3px solid var(--gold);font-family:var(--font-display);">' + initials + '</div>';

  var xpText = next
    ? user.xp + ' / ' + next.minXP + ' XP'
    : user.xp + ' XP (Max Level!)';

  var playedCount = (user.playedCourses || user.played_courses || []).length;
  var badgeCount = (user.unlockedBadges || user.unlocked_badges || []).length;

  header.innerHTML =
    '<div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap;">' +
      '<div class="clubhouse-header-card">' + avatarHTML + '</div>' +
      '<div class="clubhouse-header-info">' +
        '<h2 class="clubhouse-header-name">' + user.name + '</h2>' +
        '<div class="clubhouse-header-meta"><span class="level-badge" style="background:' + level.color + ';color:#fff;">' + level.name + '</span></div>' +
        '<div class="xp-bar-container">' +
          '<div class="xp-bar"><div class="xp-fill" style="width:' + pct + '%;"></div></div>' +
          '<span class="xp-bar-label">' + xpText + '</span>' +
        '</div>' +
      '</div>' +
      '<div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;">' +
        '<button class="btn btn-primary btn-sm" onclick="openRoundModal()">Log a Round</button>' +
        (userCard ? '<button class="btn btn-ghost-light btn-sm" onclick="editCard()">Edit Card</button>' : '') +
        (userCard ? '<button class="btn btn-ghost-light btn-sm" onclick="openShareModal()">Share Card</button>' : '<button class="btn btn-ghost-light btn-sm" onclick="showSection(\'submit\')">Create Card</button>') +
      '</div>' +
    '</div>' +
    '<div class="clubhouse-header-stats">' +
      '<div class="clubhouse-header-stat"><span class="clubhouse-header-stat-value">' + rounds.length + '</span><span class="clubhouse-header-stat-label">Rounds</span></div>' +
      '<div class="clubhouse-header-stat"><span class="clubhouse-header-stat-value">' + (best || '-') + '</span><span class="clubhouse-header-stat-label">Best Score</span></div>' +
      '<div class="clubhouse-header-stat"><span class="clubhouse-header-stat-value">' + badgeCount + '</span><span class="clubhouse-header-stat-label">Badges</span></div>' +
      '<div class="clubhouse-header-stat"><span class="clubhouse-header-stat-value">' + playedCount + '</span><span class="clubhouse-header-stat-label">Top 100 Played</span></div>' +
    '</div>';
}

async function setClubhouseTab(tab) {
  currentClubhouseTab = tab;
  document.querySelectorAll('.clubhouse-tab').forEach(function(t) {
    t.classList.toggle('active', t.getAttribute('data-tab') === tab);
  });

  var content = document.getElementById('clubhouseContent');
  if (!content) return;

  switch (tab) {
    case 'overview': await renderOverviewTab(content); break;
    case 'rounds': await renderRoundsTab(content); break;
    case 'badges': await renderBadgesTab(content); break;
    case 'collection': await renderCollectionTab(content); break;
  }
}

async function renderOverviewTab(container) {
  var user = getCurrentUser();
  if (!user) return;

  var roundsData = await getUserRoundsAsync();
  var rounds = roundsData.rounds || [];
  var stats = roundsData.stats || {};
  var memberSince = new Date(user.createdAt || user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  var playedCount = (user.playedCourses || user.played_courses || []).length;
  var badgeCount = (user.unlockedBadges || user.unlocked_badges || []).length;

  var recentRounds = rounds.slice(0, 3);
  var recentHTML = recentRounds.length > 0
    ? recentRounds.map(function(r) { return renderRoundEntry(r); }).join('')
    : '<p class="text-muted" style="padding:20px;text-align:center;">No rounds logged yet. <a href="#" onclick="openRoundModal();return false;">Log your first round</a></p>';

  var badges = user.unlockedBadges || user.unlocked_badges || [];
  var recentBadges = badges.slice(-3).reverse();
  var badgeHTML = recentBadges.length > 0
    ? recentBadges.map(function(bid) {
        var badge = BADGES.find(function(b) { return b.id === bid; });
        if (!badge) return '';
        return '<div class="mini-badge"><span class="mini-badge-icon">' + badge.icon + '</span><span>' + badge.name + '</span></div>';
      }).join('')
    : '<p class="text-muted" style="padding:20px;text-align:center;">No badges yet. Keep playing!</p>';

  container.innerHTML =
    '<div class="overview-grid">' +
      '<div class="stat-card"><div class="stat-card-icon">&#9971;</div><div class="stat-card-value">' + rounds.length + '</div><div class="stat-card-label">Total Rounds</div></div>' +
      '<div class="stat-card"><div class="stat-card-icon">&#127942;</div><div class="stat-card-value">' + (stats.bestScore || '-') + '</div><div class="stat-card-label">Best Score</div></div>' +
      '<div class="stat-card"><div class="stat-card-icon">&#128200;</div><div class="stat-card-value">' + (stats.avgScore || '-') + '</div><div class="stat-card-label">Avg Score</div></div>' +
      '<div class="stat-card"><div class="stat-card-icon">&#127757;</div><div class="stat-card-value">' + playedCount + '</div><div class="stat-card-label">Top 100 Played</div></div>' +
      '<div class="stat-card"><div class="stat-card-icon">&#127183;</div><div class="stat-card-value">' + badgeCount + '/' + BADGES.length + '</div><div class="stat-card-label">Badges</div></div>' +
      '<div class="stat-card"><div class="stat-card-icon">&#128197;</div><div class="stat-card-value" style="font-size:18px;">' + memberSince + '</div><div class="stat-card-label">Member Since</div></div>' +
    '</div>' +
    '<div class="overview-sections">' +
      '<div class="overview-block"><h3>Recent Rounds</h3>' + recentHTML + '</div>' +
      '<div class="overview-block"><h3>Recent Badges</h3><div class="mini-badge-row">' + badgeHTML + '</div></div>' +
    '</div>';
}

function renderRoundEntry(r) {
  var diff = r.score - (r.par || 72);
  var diffStr = diff === 0 ? 'E' : (diff > 0 ? '+' + diff : '' + diff);
  var colorClass = diff < 0 ? 'round-under' : (diff === 0 ? 'round-even' : 'round-over');

  return '<div class="round-entry">' +
    '<div class="round-score-circle ' + colorClass + '">' +
      '<span class="round-score-num">' + r.score + '</span>' +
      '<span class="round-vs-par">' + diffStr + '</span>' +
    '</div>' +
    '<div class="round-details">' +
      '<div class="round-course">' + (r.courseName || r.course_name) + '</div>' +
      '<div class="round-meta">' +
        '<span>' + new Date(r.date).toLocaleDateString() + '</span>' +
        (r.conditions ? ' &bull; <span class="round-conditions">' + r.conditions + '</span>' : '') +
      '</div>' +
      (r.notes ? '<div class="round-notes">' + r.notes + '</div>' : '') +
    '</div>' +
  '</div>';
}

async function renderRoundsTab(container) {
  var user = getCurrentUser();
  if (!user) return;

  var roundsData = await getUserRoundsAsync();
  var rounds = roundsData.rounds || [];

  if (rounds.length === 0) {
    container.innerHTML =
      '<div class="empty-state" style="padding:60px 20px;">' +
        '<div class="empty-icon">&#9971;</div>' +
        '<h3>No rounds logged yet</h3>' +
        '<p>Start tracking your rounds to see your progress over time.</p>' +
        '<button class="btn btn-primary" onclick="openRoundModal()">Log Your First Round</button>' +
      '</div>';
    return;
  }

  container.innerHTML =
    '<div class="rounds-header">' +
      '<h3>' + rounds.length + ' Round' + (rounds.length !== 1 ? 's' : '') + ' Logged</h3>' +
      '<button class="btn btn-primary btn-sm" onclick="openRoundModal()">Log a Round</button>' +
    '</div>' +
    '<div class="rounds-list">' +
      rounds.map(function(r) { return renderRoundEntry(r); }).join('') +
    '</div>';
}

async function renderBadgesTab(container) {
  var user = getCurrentUser();
  if (!user) return;

  var userBadges = user.unlockedBadges || user.unlocked_badges || [];
  var unlocked = userBadges.length;
  var total = BADGES.length;

  container.innerHTML =
    '<div class="badges-header">' +
      '<h3>Badges</h3>' +
      '<p>' + unlocked + ' of ' + total + ' unlocked</p>' +
    '</div>' +
    '<div class="badge-grid">' +
      BADGES.map(function(badge) {
        var isUnlocked = userBadges.indexOf(badge.id) >= 0;
        return '<div class="badge-card ' + (isUnlocked ? 'unlocked' : 'locked') + '">' +
          '<div class="badge-icon">' + badge.icon + '</div>' +
          '<div class="badge-name">' + badge.name + '</div>' +
          '<div class="badge-desc">' + badge.description + '</div>' +
          (isUnlocked ? '<div class="badge-check">&#10003;</div>' : '<div class="badge-lock">&#128274;</div>') +
        '</div>';
      }).join('') +
    '</div>';
}

async function renderCollectionTab(container) {
  var user = getCurrentUser();
  if (!user) return;

  var courses = (typeof TOP_100_DATA !== 'undefined') ? (TOP_100_DATA.world || []) : [];
  var played = user.playedCourses || user.played_courses || [];
  var playedCount = 0;

  courses.forEach(function(c) {
    if (played.some(function(p) { return p.toLowerCase().indexOf(c.name.toLowerCase()) >= 0 || c.name.toLowerCase().indexOf(p.toLowerCase()) >= 0; })) {
      playedCount++;
    }
  });

  var pct = courses.length > 0 ? Math.round((playedCount / courses.length) * 100) : 0;

  container.innerHTML =
    '<div class="collection-header">' +
      '<h3>Top 100 Collection</h3>' +
      '<p>Play courses from the World Top 100 list to grow your collection.</p>' +
      '<div class="collection-progress">' +
        '<div class="collection-progress-bar"><div class="collection-progress-fill" style="width:' + pct + '%;"></div></div>' +
        '<span class="collection-progress-text">' + playedCount + ' / ' + courses.length + ' played (' + pct + '%)</span>' +
      '</div>' +
    '</div>' +
    '<div class="collection-grid">' +
      courses.map(function(course) {
        var isPlayed = played.some(function(p) {
          return p.toLowerCase().indexOf(course.name.toLowerCase()) >= 0 || course.name.toLowerCase().indexOf(p.toLowerCase()) >= 0;
        });
        return '<div class="collection-item ' + (isPlayed ? 'played' : 'unplayed') + '">' +
          '<span class="collection-item-check">' + (isPlayed ? '&#10003;' : '#' + course.rank) + '</span>' +
          '<div>' +
            '<div class="collection-item-name">' + course.name + '</div>' +
            '<div class="collection-item-location">' + course.location + '</div>' +
          '</div>' +
          (isPlayed
            ? ''
            : '<button class="btn btn-sm btn-ghost-light" onclick="markCoursePlayed(\'' + course.name.replace(/'/g, "\\'") + '\')">Played it</button>') +
        '</div>';
      }).join('') +
    '</div>';
}
