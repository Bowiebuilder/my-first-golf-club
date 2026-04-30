/* ============================================
   COMMUNITY - src/community.js
   Community wall, filters, card detail, tips
   Depends on: storage.js, auth.js, cards.js, feed.js, xp.js, badges.js
   ============================================ */

function renderCommunity() {
  // Render activity feed
  if (typeof renderActivityFeed === 'function') renderActivityFeed();

  var allCards = getCards();
  var cards = allCards.slice();

  // Filter
  if (currentFilter !== 'all') {
    cards = cards.filter(function(c) { return c.type === currentFilter; });
  }

  // Search
  if (currentSearch) {
    var q = currentSearch.toLowerCase();
    cards = cards.filter(function(c) {
      return (c.name || '').toLowerCase().indexOf(q) >= 0 ||
        (c.location || '').toLowerCase().indexOf(q) >= 0 ||
        (c.firstCourse || '').toLowerCase().indexOf(q) >= 0 ||
        (c.story || '').toLowerCase().indexOf(q) >= 0 ||
        (c.signatureCourse || '').toLowerCase().indexOf(q) >= 0 ||
        (c.founder || '').toLowerCase().indexOf(q) >= 0 ||
        (c.orgType || '').toLowerCase().indexOf(q) >= 0;
    });
  }

  // Sort
  switch (currentSort) {
    case 'oldest-start':
      cards.sort(function(a, b) { return (a.yearStarted || 9999) - (b.yearStarted || 9999); });
      break;
    case 'latest-start':
      cards.sort(function(a, b) { return (b.yearStarted || 0) - (a.yearStarted || 0); });
      break;
    case 'alpha':
      cards.sort(function(a, b) { return (a.name || '').localeCompare(b.name || ''); });
      break;
    default: break; // newest - already sorted
  }

  var grid = document.getElementById('cardGrid');
  var empty = document.getElementById('emptyState');
  var noResults = document.getElementById('noResultsState');

  if (allCards.length === 0) {
    if (grid) grid.style.display = 'none';
    if (empty) empty.style.display = '';
    if (noResults) noResults.style.display = 'none';
    return;
  }

  if (cards.length === 0) {
    if (grid) grid.style.display = 'none';
    if (empty) empty.style.display = 'none';
    if (noResults) noResults.style.display = '';
    return;
  }

  if (empty) empty.style.display = 'none';
  if (noResults) noResults.style.display = 'none';
  if (grid) {
    grid.style.display = '';
    grid.innerHTML = cards.map(function(card, i) {
      return '<div class="card-enter" style="animation-delay:' + (i * 0.08) + 's" ondblclick="openDetail(\'' + card.id + '\')">' +
        renderCardHTML(card) +
      '</div>';
    }).join('');
  }
}

function filterCards(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
  });
  renderCommunity();
}

function searchCards(query) {
  currentSearch = query;
  renderCommunity();
}

function sortCards(sort) {
  currentSort = sort;
  renderCommunity();
}

function openDetail(id) {
  var cards = getCards();
  var card = cards.find(function(c) { return c.id === id; });
  if (!card) return;

  var isPlayer = card.type === 'player';
  var era = getEra(card.yearStarted);
  var initials = getInitials(card.name);
  var user = getCurrentUser();

  var photoHTML = card.photo
    ? '<img src="' + card.photo + '" alt="' + card.name + '" style="width:140px;height:140px;border-radius:50%;object-fit:cover;border:3px solid var(--gold);">'
    : '<div style="width:140px;height:140px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:48px;font-weight:900;color:#fff;background:var(--green);border:3px solid var(--gold);font-family:var(--font-display);">' + initials + '</div>';

  var stats = [];
  if (isPlayer) {
    if (card.yearStarted) stats.push({ l: 'Year Started', v: card.yearStarted });
    if (card.firstCourse) stats.push({ l: 'First Course', v: card.firstCourse });
    if (card.ageStarted) stats.push({ l: 'Age Started', v: card.ageStarted });
    if (card.handicap) stats.push({ l: 'Handicap', v: card.handicap });
    if (card.introducedBy) stats.push({ l: 'Introduced By', v: card.introducedBy });
    if (card.favClub) stats.push({ l: 'Favorite Club', v: card.favClub });
  } else {
    if (card.yearStarted) stats.push({ l: 'Established', v: card.yearStarted });
    if (card.orgType) stats.push({ l: 'Type', v: card.orgType });
    if (card.signatureCourse) stats.push({ l: 'Signature Course', v: card.signatureCourse });
    if (card.memberCount) stats.push({ l: 'Members', v: card.memberCount });
    if (card.holes) stats.push({ l: 'Holes', v: card.holes });
    if (card.founder) stats.push({ l: 'Founder', v: card.founder });
  }

  var statsHTML = stats.map(function(s) {
    return '<div class="detail-stat-item"><div class="label">' + s.l + '</div><div class="value">' + s.v + '</div></div>';
  }).join('');

  var tipHTML = user
    ? '<div style="margin-top:20px;display:flex;gap:12px;align-items:center;">' +
        '<button class="btn btn-primary" onclick="tipCap(\'' + card.id + '\')" style="font-size:14px;padding:8px 20px;">&#127913; Tip Your Cap <span id="tipCount-' + card.id + '">(' + (card.tips || 0) + ')</span></button>' +
        '<span style="font-size:12px;color:var(--text-muted);">Show appreciation</span>' +
      '</div>'
    : '<p style="margin-top:16px;font-size:13px;color:var(--text-muted);"><a href="#" onclick="openAuth(\'signin\');closeDetailModal();return false;">Sign in</a> to tip your cap</p>';

  document.getElementById('detailContent').innerHTML =
    '<div style="text-align:center;">' + photoHTML + '</div>' +
    '<div class="detail-info">' +
      '<h3>' + card.name + '</h3>' +
      '<div class="detail-type">' + (isPlayer ? 'PLAYER CARD' : 'CLUB CARD') + ' &bull; ' + (card.location || '') + ' &bull; <span class="era-badge era-' + era + '">' + getEraLabel(era) + '</span></div>' +
      '<div class="detail-story">' + (card.story || '') + '</div>' +
      '<div class="detail-stats-grid">' + statsHTML + '</div>' +
      tipHTML +
    '</div>';

  document.getElementById('detailModal').style.display = 'flex';
}

function closeDetailModal() {
  document.getElementById('detailModal').style.display = 'none';
}

function tipCap(id) {
  var user = getCurrentUser();
  if (!user) { openAuth('signin'); return; }

  var cards = getCards();
  var card = cards.find(function(c) { return c.id === id; });
  if (!card) return;

  card.tips = (card.tips || 0) + 1;
  saveCards(cards);

  // Update count display
  var el = document.getElementById('tipCount-' + id);
  if (el) el.textContent = '(' + card.tips + ')';

  // Feed item
  addFeedItem('tip', { targetName: card.name, cardId: id });

  // Award XP to card owner (find user who owns this card)
  var users = getUsers();
  var owner = users.find(function(u) { return u.cardId === id; });
  if (owner) {
    owner.xp = (owner.xp || 0) + 10;
    owner.level = getLevel(owner.xp).name;
    var idx = users.findIndex(function(u) { return u.email === owner.email; });
    if (idx >= 0) { users[idx] = owner; saveUsers(users); }
  }

  showToast('success', 'Cap tipped!', 'You showed appreciation for ' + card.name);

  // Check tipped badge for the owner
  setTimeout(function() { checkBadges(); }, 500);
}

// Share modal
function openShareModal() {
  var user = getCurrentUser();
  if (!user || !user.cardId) return;

  var cards = getCards();
  var card = cards.find(function(c) { return c.id === user.cardId; });
  if (!card) return;

  var container = document.getElementById('shareCardContainer');
  if (container) container.innerHTML = renderCardHTML(card);

  document.getElementById('shareModal').style.display = 'flex';
}

function closeShareModal() {
  document.getElementById('shareModal').style.display = 'none';
}
