/* ============================================
   FORMS - src/forms.js
   Card submission, photo upload, live preview, form binding
   Depends on: storage.js, api.js, auth.js, cards.js, xp.js, badges.js, feed.js, top100.js
   ============================================ */

// --- Map API snake_case card to frontend camelCase ---
function mapCardFromAPI(c) {
  if (!c) return c;
  return {
    id: c.id, type: c.type, name: c.name,
    yearStarted: c.year_started, ageStarted: c.age_started,
    firstCourse: c.first_course, location: c.location,
    handicap: c.handicap, introducedBy: c.introduced_by,
    favClub: c.fav_club, story: c.story,
    cardColor: c.card_color, photo: c.photo_url,
    orgType: c.org_type, signatureCourse: c.signature_course,
    memberCount: c.member_count, holes: c.holes,
    founder: c.founder, tips: c.tips,
    createdAt: c.created_at, userId: c.user_id
  };
}

// --- Map frontend camelCase to API snake_case ---
function mapCardToAPI(data) {
  return {
    type: data.type, name: data.name,
    yearStarted: data.yearStarted, ageStarted: data.ageStarted,
    firstCourse: data.firstCourse, location: data.location,
    handicap: data.handicap, introducedBy: data.introducedBy,
    favClub: data.favClub, story: data.story,
    cardColor: data.cardColor, photoUrl: data.photoUrl || null,
    orgType: data.orgType, signatureCourse: data.signatureCourse,
    memberCount: data.memberCount, holes: data.holes,
    founder: data.founder
  };
}

function setCardType(type) {
  currentCardType = type;
  var tp = document.getElementById('typePlayer');
  var to = document.getElementById('typeOrg');
  var fp = document.getElementById('playerForm');
  var fo = document.getElementById('orgForm');
  if (tp) tp.classList.toggle('active', type === 'player');
  if (to) to.classList.toggle('active', type === 'org');
  if (fp) fp.style.display = type === 'player' ? '' : 'none';
  if (fo) fo.style.display = type === 'org' ? '' : 'none';
  renderPreviewCard();
}

function getFormData(type) {
  var form = document.getElementById(type === 'player' ? 'playerForm' : 'orgForm');
  if (!form) return { type: type };
  var fd = new FormData(form);
  var data = { type: type };
  for (var pair of fd.entries()) {
    if (pair[0] && pair[1] !== '') data[pair[0]] = pair[1];
  }
  data.photo = type === 'player' ? playerPhotoData : orgPhotoData;
  return data;
}

function renderPreviewCard() {
  var data = getFormData(currentCardType);
  var container = document.getElementById('cardPreviewContainer');
  if (container) container.innerHTML = renderCardHTML(data);
}

function handlePhotoUpload(input, type) {
  var file = input.files[0];
  if (!file) return;

  // Store the file for potential R2 upload later
  if (type === 'player') { window._playerPhotoFile = file; }
  else { window._orgPhotoFile = file; }

  // Show preview immediately using local FileReader
  var reader = new FileReader();
  reader.onload = function(e) {
    var dataUrl = e.target.result;
    if (type === 'player') {
      playerPhotoData = dataUrl;
      var prev = document.getElementById('playerPhotoPreview');
      if (prev) { prev.src = dataUrl; prev.style.display = 'block'; }
      var ph = document.querySelector('#playerPhotoUpload .photo-placeholder');
      if (ph) ph.style.display = 'none';
    } else {
      orgPhotoData = dataUrl;
      var prev2 = document.getElementById('orgPhotoPreview');
      if (prev2) { prev2.src = dataUrl; prev2.style.display = 'block'; }
      var ph2 = document.querySelector('#orgPhotoUpload .photo-placeholder');
      if (ph2) ph2.style.display = 'none';
    }
    renderPreviewCard();
  };
  reader.readAsDataURL(file);
}

// Stash for pending card submission (used when user signs up mid-flow)
var _pendingCardData = null;
var _pendingCardType = null;

async function submitCard(event, type) {
  event.preventDefault();
  var data = getFormData(type);

  // Validate
  if (!data.name || !data.yearStarted || !data.story) {
    showToast('error', 'Missing fields', 'Please fill in all required fields');
    return false;
  }
  if (!data.location) {
    showToast('error', 'Missing location', 'Please fill in your location');
    return false;
  }
  if (type === 'player' && !data.firstCourse) {
    showToast('error', 'Missing course', 'Please fill in your first course');
    return false;
  }

  // If not logged in, stash the data and prompt signup
  if (!getCurrentUser()) {
    _pendingCardData = data;
    _pendingCardType = type;
    openAuth('signup');
    return false;
  }

  await _saveCard(data, type);
  return false;
}

// Core save logic - used by both submitCard and processPendingCard
async function _saveCard(data, type) {
  var card;
  var isEdit = false;
  var user = getCurrentUser();

  try {
    if (USE_API) {
      // Upload photo to R2 first if there's a file
      var photoFile = type === 'player' ? window._playerPhotoFile : window._orgPhotoFile;
      if (photoFile) {
        try {
          var photoUrl = await API.uploadPhoto(photoFile);
          data.photoUrl = photoUrl;
        } catch (e) {
          // Photo upload failed - continue without it
          console.warn('Photo upload failed:', e);
        }
      }

      var apiData = mapCardToAPI(data);
      var result = await API.createOrUpdateCard(apiData);
      card = mapCardFromAPI(result.card);
      isEdit = result.updated || false;

      // Also update localStorage cache
      if (!isEdit) {
        var cards = getCards();
        cards.unshift(card);
        saveCards(cards);
      }

      // Refresh user from API (card_id, xp etc updated server-side)
      await API.getMe();
      user = getCurrentUser();
    } else {
      // localStorage-only mode
      isEdit = user && user.cardId;
      if (isEdit) {
        var cards = getCards();
        var idx = cards.findIndex(function(c) { return c.id === user.cardId; });
        if (idx >= 0) {
          data.id = cards[idx].id;
          data.createdAt = cards[idx].createdAt;
          data.tips = cards[idx].tips || 0;
          cards[idx] = data;
          saveCards(cards);
          card = data;
        } else {
          card = addCard(data);
          user.cardId = card.id;
        }
      } else {
        card = addCard(data);
      }

      if (!isEdit) {
        user.cardId = card.id;
        awardXP(100, 'Creating your playing card');
        addFeedItem('card_created', { cardType: type, cardName: data.name });
      }

      if (type === 'player' && typeof isTop100Course === 'function' && isTop100Course(data.firstCourse)) {
        if (!user.playedCourses) user.playedCourses = [];
        if (user.playedCourses.indexOf(data.firstCourse) < 0) {
          user.playedCourses.push(data.firstCourse);
        }
      }
      saveCurrentUser(user);
    }
  } catch (err) {
    showToast('error', 'Save failed', err.message || 'Please try again');
    return;
  }

  // Show success modal
  var modalCard = document.getElementById('modalCard');
  if (modalCard) modalCard.innerHTML = renderCardHTML(card);

  var xpEl = document.getElementById('successXP');
  if (xpEl) {
    xpEl.innerHTML = isEdit
      ? '<span style="color:var(--green);font-weight:600;">Card updated successfully!</span>'
      : '<span style="color:var(--gold);font-family:var(--font-accent);font-size:20px;">+100 XP</span> for creating your card!';
  }

  if (isEdit) {
    showToast('success', 'Card updated', 'Your playing card has been updated');
  }

  var modal = document.getElementById('successModal');
  if (modal) modal.style.display = 'flex';

  // Reset form
  _resetForm(type);

  // Check badges
  setTimeout(function() { checkBadges(); }, 1200);
}

function _resetForm(type) {
  var form = document.getElementById(type === 'player' ? 'playerForm' : 'orgForm');
  if (form) form.reset();

  if (type === 'player') {
    playerPhotoData = null;
    window._playerPhotoFile = null;
    var pp = document.getElementById('playerPhotoPreview');
    if (pp) pp.style.display = 'none';
    var pph = document.querySelector('#playerPhotoUpload .photo-placeholder');
    if (pph) pph.style.display = '';
  } else {
    orgPhotoData = null;
    window._orgPhotoFile = null;
    var op = document.getElementById('orgPhotoPreview');
    if (op) op.style.display = 'none';
    var oph = document.querySelector('#orgPhotoUpload .photo-placeholder');
    if (oph) oph.style.display = '';
  }
  renderPreviewCard();
}

function closeModal() {
  var m = document.getElementById('successModal');
  if (m) m.style.display = 'none';
}

// Called after auth completes - checks if there's a pending card to submit
async function processPendingCard() {
  if (!_pendingCardData || !_pendingCardType) return;
  if (!getCurrentUser()) return;

  var data = _pendingCardData;
  var type = _pendingCardType;
  _pendingCardData = null;
  _pendingCardType = null;

  await _saveCard(data, type);
}

function bindFormEvents() {
  var playerForm = document.getElementById('playerForm');
  if (playerForm) {
    playerForm.querySelectorAll('input, textarea, select').forEach(function(el) {
      el.addEventListener('input', renderPreviewCard);
      el.addEventListener('change', renderPreviewCard);
    });
    var ps = playerForm.querySelector('textarea[name="story"]');
    if (ps) {
      ps.addEventListener('input', function() {
        var c = document.getElementById('playerCharCount');
        if (c) c.textContent = ps.value.length;
      });
    }
  }

  var orgForm = document.getElementById('orgForm');
  if (orgForm) {
    orgForm.querySelectorAll('input, textarea, select').forEach(function(el) {
      el.addEventListener('input', renderPreviewCard);
      el.addEventListener('change', renderPreviewCard);
    });
    var os = orgForm.querySelector('textarea[name="story"]');
    if (os) {
      os.addEventListener('input', function() {
        var c = document.getElementById('orgCharCount');
        if (c) c.textContent = os.value.length;
      });
    }
  }
}

// --- Edit existing card ---
async function editCard() {
  var user = getCurrentUser();
  if (!user || !user.cardId) return;

  var card;
  try {
    if (USE_API) {
      var apiCard = await API.getCard(user.cardId);
      card = mapCardFromAPI(apiCard);
    } else {
      var cards = getCards();
      card = cards.find(function(c) { return c.id === user.cardId; });
    }
  } catch (e) {
    // Fallback to localStorage
    var cards = getCards();
    card = cards.find(function(c) { return c.id === user.cardId; });
  }

  if (!card) { showToast('error', 'Card not found', 'Could not load your card'); return; }

  setCardType(card.type || 'player');
  showSection('submit');

  setTimeout(function() {
    var formId = card.type === 'org' ? 'orgForm' : 'playerForm';
    var form = document.getElementById(formId);
    if (!form) return;

    var fields = ['name', 'yearStarted', 'ageStarted', 'firstCourse', 'location',
                  'handicap', 'introducedBy', 'story', 'orgType', 'signatureCourse',
                  'memberCount', 'founder', 'holes'];
    fields.forEach(function(field) {
      var input = form.querySelector('[name="' + field + '"]');
      if (input && card[field]) input.value = card[field];
    });

    if (card.favClub) {
      var radio = form.querySelector('input[name="favClub"][value="' + card.favClub + '"]');
      if (radio) radio.checked = true;
    }
    if (card.cardColor) {
      var colorRadio = form.querySelector('input[name="cardColor"][value="' + card.cardColor + '"]');
      if (colorRadio) colorRadio.checked = true;
    }
    if (card.photo) {
      if (card.type === 'player') {
        playerPhotoData = card.photo;
        var prev = document.getElementById('playerPhotoPreview');
        if (prev) { prev.src = card.photo; prev.style.display = 'block'; }
        var ph = document.querySelector('#playerPhotoUpload .photo-placeholder');
        if (ph) ph.style.display = 'none';
      } else {
        orgPhotoData = card.photo;
        var prev2 = document.getElementById('orgPhotoPreview');
        if (prev2) { prev2.src = card.photo; prev2.style.display = 'block'; }
        var ph2 = document.querySelector('#orgPhotoUpload .photo-placeholder');
        if (ph2) ph2.style.display = 'none';
      }
    }

    var storyEl = form.querySelector('textarea[name="story"]');
    if (storyEl) {
      var countId = card.type === 'player' ? 'playerCharCount' : 'orgCharCount';
      var countEl = document.getElementById(countId);
      if (countEl) countEl.textContent = storyEl.value.length;
    }
    renderPreviewCard();
  }, 100);
}
