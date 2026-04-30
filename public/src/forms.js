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
    cardColor: c.card_color, borderStyle: c.border_style || 'gold',
    photo: c.photo_url,
    avatarId: c.avatar_id, avatarColor: c.avatar_color,
    nationality: c.nationality, nationalityCode: c.nationality_code,
    firstCourseCountry: c.first_course_country,
    firstCourseLat: c.first_course_lat, firstCourseLon: c.first_course_lon,
    localCourse: c.local_course,
    localCourseLat: c.local_course_lat, localCourseLon: c.local_course_lon,
    dreamPartner: c.dream_partner, dreamCourse: c.dream_course,
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
    cardColor: data.cardColor, borderStyle: data.borderStyle || 'gold',
    photoUrl: data.photoUrl || null,
    avatarId: data.avatarId || null, avatarColor: data.avatarColor || null,
    nationality: data.nationality, nationalityCode: data.nationalityCode,
    firstCourseCountry: data.firstCourseCountry,
    firstCourseLat: data.firstCourseLat ? parseFloat(data.firstCourseLat) : null,
    firstCourseLon: data.firstCourseLon ? parseFloat(data.firstCourseLon) : null,
    localCourse: data.localCourse,
    localCourseLat: data.localCourseLat ? parseFloat(data.localCourseLat) : null,
    localCourseLon: data.localCourseLon ? parseFloat(data.localCourseLon) : null,
    dreamPartner: data.dreamPartner, dreamCourse: data.dreamCourse,
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

// --- Field-level validation helpers ---
function _clearErrors(form) {
  form.querySelectorAll('.form-group.has-error').forEach(function(g) {
    g.classList.remove('has-error');
  });
  form.querySelectorAll('.field-error').forEach(function(e) { e.remove(); });
}

function _showFieldError(form, fieldName, message) {
  var input = form.querySelector('[name="' + fieldName + '"]');
  if (!input) return;
  var group = input.closest('.form-group');
  if (!group) return;
  group.classList.add('has-error');
  var err = document.createElement('span');
  err.className = 'field-error';
  err.textContent = message;
  // Add after the input (or after char-count if it exists)
  var charCount = group.querySelector('.char-count');
  if (charCount) { charCount.parentNode.insertBefore(err, charCount.nextSibling); }
  else { group.appendChild(err); }
}

function _scrollToFirstError(form) {
  var firstError = form.querySelector('.form-group.has-error');
  if (firstError) {
    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    var input = firstError.querySelector('input, textarea, select');
    if (input) input.focus();
  }
}

function _validateCardForm(form, data, type) {
  _clearErrors(form);
  var errors = 0;

  if (!data.name || data.name.trim().length < 2) {
    _showFieldError(form, 'name', type === 'player' ? 'Please enter your full name' : 'Please enter the organization name');
    errors++;
  }

  if (!data.yearStarted) {
    _showFieldError(form, 'yearStarted', type === 'player' ? 'When did you start playing?' : 'When was the organization established?');
    errors++;
  } else {
    var year = parseInt(data.yearStarted);
    if (year < 1400 || year > new Date().getFullYear()) {
      _showFieldError(form, 'yearStarted', 'Please enter a valid year');
      errors++;
    }
  }

  if (!data.location || data.location.trim().length < 2) {
    _showFieldError(form, 'location', 'Where are you based? e.g. Cape Town, South Africa');
    errors++;
  }

  if (type === 'player' && (!data.firstCourse || data.firstCourse.trim().length < 2)) {
    _showFieldError(form, 'firstCourse', 'What was the first course you played?');
    errors++;
  }

  if (type === 'org' && !data.orgType) {
    _showFieldError(form, 'orgType', 'Please select an organization type');
    errors++;
  }

  if (!data.story || data.story.trim().length < 10) {
    _showFieldError(form, 'story', data.story ? 'Tell us a bit more - at least a couple of sentences' : (type === 'player' ? 'Tell us about how your golf journey began' : 'Tell us the founding story'));
    errors++;
  }

  if (errors > 0) {
    _scrollToFirstError(form);
    showToast('error', errors + ' field' + (errors > 1 ? 's' : '') + ' need attention', 'Please check the highlighted fields');
  }

  return errors === 0;
}

async function submitCard(event, type) {
  event.preventDefault();
  var data = getFormData(type);

  // Validate with field-level errors
  var formId = type === 'player' ? 'playerForm' : 'orgForm';
  var form = document.getElementById(formId);
  if (!_validateCardForm(form, data, type)) return false;

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

  // Launch celebration!
  if (typeof showCelebration === 'function') {
    showCelebration(card, isEdit);
  }

  // Reset form
  _resetForm(type);

  // Check badges after celebration has time to show
  setTimeout(function() { checkBadges(); }, 2000);
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

function _clearFieldError(el) {
  var group = el.closest('.form-group');
  if (group && group.classList.contains('has-error')) {
    group.classList.remove('has-error');
    var err = group.querySelector('.field-error');
    if (err) err.remove();
  }
}

function bindFormEvents() {
  var playerForm = document.getElementById('playerForm');
  if (playerForm) {
    playerForm.querySelectorAll('input, textarea, select').forEach(function(el) {
      el.addEventListener('input', function() { renderPreviewCard(); _clearFieldError(el); });
      el.addEventListener('change', function() { renderPreviewCard(); _clearFieldError(el); });
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
      el.addEventListener('input', function() { renderPreviewCard(); _clearFieldError(el); });
      el.addEventListener('change', function() { renderPreviewCard(); _clearFieldError(el); });
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

    // Update submit button text to "Update"
    var submitBtn = document.getElementById(card.type === 'player' ? 'playerSubmitBtn' : 'orgSubmitBtn');
    if (submitBtn) submitBtn.textContent = 'Update Your ' + (card.type === 'player' ? 'Player' : 'Club') + ' Card \u2192';

    var fields = ['name', 'yearStarted', 'ageStarted', 'firstCourse', 'location',
                  'handicap', 'introducedBy', 'story', 'orgType', 'signatureCourse',
                  'memberCount', 'founder', 'holes',
                  'nationality', 'nationalityCode', 'firstCourseCountry',
                  'localCourse', 'dreamPartner', 'dreamCourse', 'borderStyle'];
    fields.forEach(function(field) {
      var input = form.querySelector('[name="' + field + '"]');
      if (input && card[field]) input.value = card[field];
    });

    // Split full name into firstName / lastName for the wizard
    if (card.type === 'player' && card.name) {
      var parts = card.name.trim().split(/\s+/);
      var firstInput = form.querySelector('input[name="firstName"]');
      var lastInput = form.querySelector('input[name="lastName"]');
      if (firstInput && parts.length > 0) firstInput.value = parts[0];
      if (lastInput && parts.length > 1) lastInput.value = parts.slice(1).join(' ');
      // Also set the hidden full-name field so the API sees it
      var hidden = document.getElementById('fullNameHidden');
      if (hidden) hidden.value = card.name;
    }

    // Populate nationality combobox visible input
    if (card.nationality) {
      var natInput = document.getElementById('nationalityInput');
      if (natInput) natInput.value = card.nationality;
    }
    if (card.firstCourseCountry) {
      var fcInput = document.getElementById('firstCourseCountryInput');
      if (fcInput) fcInput.value = card.firstCourseCountry;
    }

    // Reset wizard to step 1 on edit
    if (typeof _showStep === 'function') _showStep(1);

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
