/* ============================================
   COMMUNITY - src/community.js
   Community wall, filters, card detail, tips
   Depends on: storage.js, api.js, auth.js, cards.js, feed.js, xp.js, badges.js
   ============================================ */

// Local cache of cards fetched from API
var _communityCards = null;

async function renderCommunity() {
  // Render activity feed
  if (typeof renderActivityFeed === 'function') renderActivityFeed();

  var cards;
  try {
    if (USE_API) {
      var result = await API.getCards({
        type: currentFilter !== 'all' ? currentFilter : undefined,
        search: currentSearch || undefined,
        sort: currentSort,
        limit: 100
      });
      // Map API snake_case to frontend camelCase
      cards = result.cards.map(mapCardFromAPI);
      _communityCards = cards;
      // Also cache in localStorage
      saveCards(cards);
    } else {
      cards = _getLocalCards();
    }
  } catch (e) {
    // Fallback to localStorage
    cards = _getLocalCards();
  }

  _renderCardGrid(cards);
}

// localStorage card fetching with local filter/sort
function _getLocalCards() {
  var allCards = getCards();
  var cards = allCards.slice();

  if (currentFilter !== 'all') {
    cards = cards.filter(function(c) { return c.type === currentFilter; });
  }
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
  switch (currentSort) {
    case 'oldest-start':
      cards.sort(function(a, b) { return (a.yearStarted || 9999) - (b.yearStarted || 9999); }); break;
    case 'latest-start':
      cards.sort(function(a, b) { return (b.yearStarted || 0) - (a.yearStarted || 0); }); break;
    case 'alpha':
      cards.sort(function(a, b) { return (a.name || '').localeCompare(b.name || ''); }); break;
  }
  return cards;
}

function _renderCardGrid(cards) {
  var grid = document.getElementById('cardGrid');
  var empty = document.getElementById('emptyState');
  var noResults = document.getElementById('noResultsState');

  if (!cards || cards.length === 0) {
    if (grid) grid.style.display = 'none';
    // Show empty vs no-results based on whether we have any filter active
    var isFiltered = currentFilter !== 'all' || currentSearch;
    if (empty) empty.style.display = isFiltered ? 'none' : '';
    if (noResults) noResults.style.display = isFiltered ? '' : 'none';
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

async function openDetail(id) {
  var card;
  try {
    if (USE_API) {
      var apiCard = await API.getCard(id);
      card = mapCardFromAPI(apiCard);
    } else {
      card = getCards().find(function(c) { return c.id === id; });
    }
  } catch (e) {
    card = getCards().find(function(c) { return c.id === id; });
  }
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

async function tipCap(id) {
  var user = getCurrentUser();
  if (!user) { openAuth('signin'); return; }

  try {
    if (USE_API) {
      var result = await API.tipCap(id);
      var el = document.getElementById('tipCount-' + id);
      if (el) el.textContent = '(' + result.tips + ')';
      showToast('success', 'Cap tipped!', 'You showed appreciation');
      setTimeout(function() { checkBadges(); }, 500);
      return;
    }
  } catch (e) {
    // Fall through to localStorage
  }

  // localStorage fallback
  var cards = getCards();
  var card = cards.find(function(c) { return c.id === id; });
  if (!card) return;
  card.tips = (card.tips || 0) + 1;
  saveCards(cards);
  var el = document.getElementById('tipCount-' + id);
  if (el) el.textContent = '(' + card.tips + ')';
  addFeedItem('tip', { targetName: card.name, cardId: id });
  var users = getUsers();
  var owner = users.find(function(u) { return u.cardId === id; });
  if (owner) {
    owner.xp = (owner.xp || 0) + 10;
    owner.level = getLevel(owner.xp).name;
    var idx = users.findIndex(function(u) { return u.email === owner.email; });
    if (idx >= 0) { users[idx] = owner; saveUsers(users); }
  }
  showToast('success', 'Cap tipped!', 'You showed appreciation for ' + card.name);
  setTimeout(function() { checkBadges(); }, 500);
}

async function openShareModal() {
  var user = getCurrentUser();
  if (!user || !user.cardId) return;

  var card;
  try {
    if (USE_API) {
      var apiCard = await API.getCard(user.cardId);
      card = mapCardFromAPI(apiCard);
    } else {
      card = getCards().find(function(c) { return c.id === user.cardId; });
    }
  } catch (e) {
    card = getCards().find(function(c) { return c.id === user.cardId; });
  }
  if (!card) return;

  var container = document.getElementById('shareCardContainer');
  if (container) container.innerHTML = renderCardHTML(card);
  document.getElementById('shareModal').style.display = 'flex';
}

function closeShareModal() {
  document.getElementById('shareModal').style.display = 'none';
}
