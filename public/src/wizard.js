/* ============================================
   FORM WIZARD - src/wizard.js
   Multi-step form wizard for card creation
   Depends on: forms.js, storage.js
   ============================================ */

var WIZARD_TOTAL_STEPS = 8;
var _currentStep = 1;

// Country list with flag emoji + ISO code (sorted by name)
var COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czechia', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'TR', name: 'Türkiye', flag: '🇹🇷' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' }
];

function _populateAgeAndYearDropdowns() {
  var ageSelect = document.getElementById('ageStartedSelect');
  if (ageSelect && ageSelect.options.length <= 1) {
    // Common ranges: 1-12 (kids), 13-25 (teens/young adults), then bands
    var ages = [];
    for (var i = 1; i <= 99; i++) ages.push(i);
    ages.forEach(function(a) {
      var opt = document.createElement('option');
      opt.value = a;
      opt.textContent = a + (a === 1 ? ' year old' : ' years old');
      ageSelect.appendChild(opt);
    });
  }

  var yearSelect = document.getElementById('yearStartedSelect');
  if (yearSelect && yearSelect.options.length <= 1) {
    var nowYear = new Date().getFullYear();
    // Most recent first
    for (var y = nowYear; y >= 1930; y--) {
      var opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      yearSelect.appendChild(opt);
    }
    // Add an "Earlier" option for older players
    var earlier = document.createElement('option');
    earlier.value = '1929';
    earlier.textContent = 'Before 1930';
    yearSelect.appendChild(earlier);
  }
}

// --- Country combobox (searchable, allows custom entry) ---
function _setupCountryCombobox(opts) {
  var input = document.getElementById(opts.inputId);
  var list = document.getElementById(opts.listId);
  var codeHidden = opts.codeHiddenId ? document.getElementById(opts.codeHiddenId) : null;
  var nameHidden = opts.nameHiddenId ? document.getElementById(opts.nameHiddenId) : null;
  if (!input || !list) return;

  var sorted = COUNTRIES.slice().sort(function(a, b) { return a.name.localeCompare(b.name); });

  function render(filter) {
    filter = (filter || '').toLowerCase().trim();
    var matches = filter
      ? sorted.filter(function(c) { return c.name.toLowerCase().indexOf(filter) >= 0; })
      : sorted;

    if (matches.length === 0) {
      list.innerHTML = '<div class="combobox-empty">No matches &mdash; press Enter to use "' + escapeHtml(filter) + '"</div>';
    } else {
      list.innerHTML = matches.slice(0, 80).map(function(c) {
        return '<div class="combobox-item" data-name="' + escapeHtml(c.name) + '" data-code="' + c.code + '">' +
               '<span class="combobox-flag">' + c.flag + '</span>' +
               '<span class="combobox-name">' + escapeHtml(c.name) + '</span>' +
               '</div>';
      }).join('');
    }
    list.style.display = 'block';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(ch) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch];
    });
  }

  function pick(name, code) {
    input.value = name;
    if (codeHidden) codeHidden.value = code || '';
    if (nameHidden) nameHidden.value = name;
    list.style.display = 'none';
    if (typeof renderPreviewCard === 'function') renderPreviewCard();
  }

  input.addEventListener('focus', function() { render(input.value); });
  input.addEventListener('input', function() {
    // User typed: clear any previously stored ISO code unless an exact match
    var typed = input.value.trim().toLowerCase();
    var exact = sorted.find(function(c) { return c.name.toLowerCase() === typed; });
    if (codeHidden) codeHidden.value = exact ? exact.code : '';
    if (nameHidden) nameHidden.value = input.value;
    render(input.value);
    if (typeof renderPreviewCard === 'function') renderPreviewCard();
  });

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If a single match in the list, pick it; otherwise keep what user typed
      var first = list.querySelector('.combobox-item');
      if (first) {
        pick(first.dataset.name, first.dataset.code);
      } else {
        list.style.display = 'none';
        if (nameHidden) nameHidden.value = input.value;
      }
    } else if (e.key === 'Escape') {
      list.style.display = 'none';
    }
  });

  list.addEventListener('mousedown', function(e) {
    var item = e.target.closest('.combobox-item');
    if (!item) return;
    e.preventDefault();
    pick(item.dataset.name, item.dataset.code);
  });

  document.addEventListener('click', function(e) {
    if (!input.contains(e.target) && !list.contains(e.target)) {
      list.style.display = 'none';
    }
  });
}

function _populateCountryDropdowns() {
  _setupCountryCombobox({
    inputId: 'nationalityInput',
    listId: 'nationalityList',
    codeHiddenId: 'nationalityCodeHidden',
    nameHiddenId: 'nationalityHidden'
  });
  _setupCountryCombobox({
    inputId: 'firstCourseCountryInput',
    listId: 'firstCourseCountryList'
  });
}

function _showStep(step) {
  _currentStep = step;
  var steps = document.querySelectorAll('.wizard-step');
  steps.forEach(function(el) {
    el.classList.toggle('active', parseInt(el.dataset.step) === step);
  });

  var fill = document.getElementById('wizardProgressFill');
  if (fill) fill.style.width = ((step / WIZARD_TOTAL_STEPS) * 100) + '%';

  var num = document.getElementById('wizardStepNum');
  if (num) num.textContent = step;
  var totalNum = document.querySelector('.wizard-progress-label');
  if (totalNum && !totalNum.textContent.match(/of ' + WIZARD_TOTAL_STEPS + '/)) {
    // Already rendered in HTML, no-op
  }

  var backBtn = document.getElementById('wizardBackBtn');
  if (backBtn) backBtn.style.visibility = step === 1 ? 'hidden' : 'visible';

  var nextBtn = document.getElementById('wizardNextBtn');
  var submitBtn = document.getElementById('playerSubmitBtn');
  if (step === WIZARD_TOTAL_STEPS) {
    if (nextBtn) nextBtn.style.display = 'none';
    if (submitBtn) submitBtn.style.display = '';
  } else {
    if (nextBtn) nextBtn.style.display = '';
    if (submitBtn) submitBtn.style.display = 'none';
  }

  // Scroll wizard area to top of step
  var firstStep = document.querySelector('.wizard-step.active');
  if (firstStep) firstStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function _validateCurrentStep() {
  var stepEl = document.querySelector('.wizard-step.active');
  if (!stepEl) return true;

  var firstInvalid = null;

  function markInvalid(input) {
    var grp = input.closest('.form-group');
    if (grp) grp.classList.add('has-error');
    if (!firstInvalid) firstInvalid = input;
  }
  function markValid(input) {
    var grp = input.closest('.form-group');
    if (grp) grp.classList.remove('has-error');
  }

  // Generic required check (any input/select/textarea with required attr)
  stepEl.querySelectorAll('input[required], select[required], textarea[required]').forEach(function(inp) {
    if (!inp.value || inp.value.trim() === '') markInvalid(inp);
    else markValid(inp);
  });

  // Step-specific validation
  if (_currentStep === 2) {
    var year = stepEl.querySelector('select[name="yearStarted"]');
    if (year && !year.value) markInvalid(year);
  }

  if (_currentStep === 5) {
    // First name + last name both required (Step 5)
    var first = stepEl.querySelector('input[name="firstName"]');
    var last = stepEl.querySelector('input[name="lastName"]');
    if (first && (!first.value || first.value.trim().length < 1)) markInvalid(first);
    else if (first) markValid(first);
    if (last && (!last.value || last.value.trim().length < 1)) markInvalid(last);
    else if (last) markValid(last);
  }

  if (_currentStep === 7) {
    // Story required
    var story = stepEl.querySelector('textarea[name="story"]');
    if (story && (!story.value || story.value.trim().length < 10)) markInvalid(story);
    else if (story) markValid(story);
  }

  if (firstInvalid) {
    firstInvalid.focus();
    if (typeof showToast === 'function') {
      showToast('error', 'Hold on', 'Please fill in the highlighted field');
    }
    return false;
  }
  return true;
}

function wizardNext() {
  if (!_validateCurrentStep()) return;
  if (_currentStep < WIZARD_TOTAL_STEPS) {
    _showStep(_currentStep + 1);
  }
}

function wizardBack() {
  if (_currentStep > 1) {
    _showStep(_currentStep - 1);
  }
}

function _resetWizard() {
  _showStep(1);
}

// ============================================
// Mapbox course autocomplete (Step 4 + Step 5)
// ============================================
function _setupCourseAutocomplete(opts) {
  // opts: { inputName, latName, lonName, getCountry, type }
  var form = document.getElementById('playerForm');
  if (!form) return;
  var input = form.querySelector('input[name="' + opts.inputName + '"]');
  var latInput = form.querySelector('input[name="' + opts.latName + '"]');
  var lonInput = form.querySelector('input[name="' + opts.lonName + '"]');
  if (!input) return;

  // Wrap input + add a results dropdown
  if (!input.parentElement.classList.contains('combobox')) {
    var wrap = document.createElement('div');
    wrap.className = 'combobox';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    var list = document.createElement('div');
    list.className = 'combobox-list';
    list.style.display = 'none';
    wrap.appendChild(list);
  }
  var listEl = input.parentElement.querySelector('.combobox-list');

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function(ch) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch];
    });
  }

  function clearGeo() {
    if (latInput) latInput.value = '';
    if (lonInput) lonInput.value = '';
  }

  function pick(result) {
    input.value = result.name;
    if (latInput) latInput.value = result.lat || '';
    if (lonInput) lonInput.value = result.lon || '';
    listEl.style.display = 'none';
    if (typeof renderPreviewCard === 'function') renderPreviewCard();
  }

  function renderResults(results, queryText) {
    if (!results.length) {
      listEl.innerHTML = '<div class="combobox-empty">No matches &mdash; you can keep "' + escapeHtml(queryText) + '"</div>';
    } else {
      listEl.innerHTML = results.map(function(r) {
        var loc = [r.city, r.region, r.country].filter(Boolean).join(', ');
        return '<div class="combobox-item" data-id="' + escapeHtml(r.id) + '">' +
          '<span class="combobox-course-name">' + escapeHtml(r.name) + '</span>' +
          (loc ? '<span class="combobox-course-loc">' + escapeHtml(loc) + '</span>' : '') +
          '</div>';
      }).join('');
    }
    listEl.style.display = 'block';
  }

  // Cache so we can match a click back to its data
  var lastResults = [];

  // Debounced search
  var debounceTimer = null;
  var inflightController = null;

  async function search(q) {
    if (q.length < 2) { listEl.style.display = 'none'; return; }
    if (inflightController) inflightController.abort();
    inflightController = new AbortController();

    var country = '';
    if (typeof opts.getCountry === 'function') country = opts.getCountry() || '';

    var url = '/api/places/search?q=' + encodeURIComponent(q) +
      (country ? '&country=' + encodeURIComponent(country) : '') +
      (opts.type ? '&type=' + opts.type : '');

    try {
      var res = await fetch(url, { signal: inflightController.signal });
      if (!res.ok) {
        listEl.style.display = 'none';
        return;
      }
      var data = await res.json();
      lastResults = data.results || [];
      renderResults(lastResults, q);
    } catch (e) {
      // Aborted or network — ignore
    }
  }

  input.addEventListener('input', function() {
    clearGeo();
    var q = input.value.trim();
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function() { search(q); }, 220);
    if (typeof renderPreviewCard === 'function') renderPreviewCard();
  });

  input.addEventListener('focus', function() {
    if (input.value.trim().length >= 2 && lastResults.length) {
      listEl.style.display = 'block';
    }
  });

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') listEl.style.display = 'none';
    if (e.key === 'Enter') {
      var firstItem = listEl.querySelector('.combobox-item');
      if (firstItem && listEl.style.display !== 'none') {
        e.preventDefault();
        var id = firstItem.dataset.id;
        var match = lastResults.find(function(r) { return r.id === id; });
        if (match) pick(match);
      }
    }
  });

  listEl.addEventListener('mousedown', function(e) {
    var item = e.target.closest('.combobox-item');
    if (!item) return;
    e.preventDefault();
    var id = item.dataset.id;
    var match = lastResults.find(function(r) { return r.id === id; });
    if (match) pick(match);
  });

  document.addEventListener('click', function(e) {
    if (!input.contains(e.target) && !listEl.contains(e.target)) {
      listEl.style.display = 'none';
    }
  });
}

function _setupAllCourseAutocompletes() {
  // First course — biased by Step 4 country (or nationality fallback)
  _setupCourseAutocomplete({
    inputName: 'firstCourse',
    latName: 'firstCourseLat',
    lonName: 'firstCourseLon',
    type: 'course',
    getCountry: function() {
      var fcc = document.getElementById('firstCourseCountryInput');
      var nat = document.getElementById('nationalityInput');
      var v = (fcc && fcc.value) || (nat && nat.value) || '';
      return v;
    }
  });

  // Local course — biased by nationality
  _setupCourseAutocomplete({
    inputName: 'localCourse',
    latName: 'localCourseLat',
    lonName: 'localCourseLon',
    type: 'course',
    getCountry: function() {
      var nat = document.getElementById('nationalityInput');
      return (nat && nat.value) || '';
    }
  });
}

// --- Social handle normalizer ---
// Accepts pasted URLs and strips them to the handle so the card looks consistent
function _setupSocialHandleInputs() {
  function clean(value, network) {
    if (!value) return '';
    value = value.trim();
    // Strip leading @ if any
    value = value.replace(/^@+/, '');
    // Strip protocol + domain prefixes for each network
    var patterns = {
      instagram: /^(https?:\/\/)?(www\.)?instagram\.com\//i,
      x: /^(https?:\/\/)?(www\.)?(x|twitter)\.com\//i,
      facebook: /^(https?:\/\/)?(www\.)?facebook\.com\//i,
      linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/(in\/|pub\/|company\/)?/i
    };
    var p = patterns[network];
    if (p) value = value.replace(p, '');
    // Strip trailing slashes/params
    value = value.replace(/[\/?#].*$/, '');
    return value;
  }

  ['Instagram', 'X', 'Facebook', 'Linkedin'].forEach(function(net) {
    var inp = document.querySelector('input[name="social' + net + '"]');
    if (!inp) return;
    var key = net.toLowerCase();
    inp.addEventListener('blur', function() {
      var cleaned = clean(inp.value, key);
      if (cleaned !== inp.value) {
        inp.value = cleaned;
      }
      if (typeof renderPreviewCard === 'function') renderPreviewCard();
    });
    inp.addEventListener('input', function() {
      if (typeof renderPreviewCard === 'function') renderPreviewCard();
    });
  });
}

// --- Avatar picker ---
function _setupAvatarPicker() {
  var grid = document.getElementById('avatarGrid');
  var swatches = document.getElementById('avatarColorSwatches');
  var idHidden = document.getElementById('avatarIdHidden');
  var colorHidden = document.getElementById('avatarColorHidden');
  if (!grid || !swatches || !idHidden || !colorHidden) return;
  if (typeof AVATAR_IDS === 'undefined') return;

  // Render avatar tile for each animal
  grid.innerHTML = AVATAR_IDS.map(function(id) {
    var color = getAvatarColorHex(colorHidden.value || 'gold');
    return '<button type="button" class="avatar-tile" data-avatar="' + id + '" aria-label="' + id + '">' +
      renderAvatarSVG(id, color, 56) +
      '<span class="avatar-tile-name">' + id.charAt(0).toUpperCase() + id.slice(1) + '</span>' +
      '</button>';
  }).join('');

  // Render color swatches
  swatches.innerHTML = AVATAR_COLORS.map(function(c) {
    return '<button type="button" class="avatar-color-swatch' + (c.id === colorHidden.value ? ' active' : '') + '" data-color="' + c.id + '" style="background:' + c.hex + ';" aria-label="' + c.name + '"></button>';
  }).join('');

  function refreshTileColors() {
    var color = getAvatarColorHex(colorHidden.value);
    grid.querySelectorAll('.avatar-tile').forEach(function(btn) {
      var avId = btn.dataset.avatar;
      btn.querySelector('svg').remove();
      btn.insertAdjacentHTML('afterbegin', renderAvatarSVG(avId, color, 56));
    });
  }

  grid.addEventListener('click', function(e) {
    var tile = e.target.closest('.avatar-tile');
    if (!tile) return;
    var avId = tile.dataset.avatar;
    // Toggle: clicking the active tile clears it
    if (idHidden.value === avId) {
      idHidden.value = '';
      grid.querySelectorAll('.avatar-tile').forEach(function(b) { b.classList.remove('active'); });
    } else {
      idHidden.value = avId;
      grid.querySelectorAll('.avatar-tile').forEach(function(b) {
        b.classList.toggle('active', b.dataset.avatar === avId);
      });
    }
    if (typeof renderPreviewCard === 'function') renderPreviewCard();
  });

  swatches.addEventListener('click', function(e) {
    var sw = e.target.closest('.avatar-color-swatch');
    if (!sw) return;
    colorHidden.value = sw.dataset.color;
    swatches.querySelectorAll('.avatar-color-swatch').forEach(function(b) {
      b.classList.toggle('active', b === sw);
    });
    refreshTileColors();
    if (typeof renderPreviewCard === 'function') renderPreviewCard();
  });
}

// Show/hide avatar picker based on whether a photo is uploaded
function _toggleAvatarPickerVisibility() {
  var group = document.getElementById('avatarPickerGroup');
  var divider = document.getElementById('orDivider');
  if (!group) return;
  var hasPhoto = !!(window._playerPhotoFile || (typeof playerPhotoData !== 'undefined' && playerPhotoData));
  group.style.display = hasPhoto ? 'none' : '';
  if (divider) divider.style.display = hasPhoto ? 'none' : 'flex';
  // If a photo was uploaded, clear any avatar selection
  if (hasPhoto) {
    var idHidden = document.getElementById('avatarIdHidden');
    if (idHidden && idHidden.value) {
      idHidden.value = '';
      var grid = document.getElementById('avatarGrid');
      if (grid) grid.querySelectorAll('.avatar-tile').forEach(function(b) { b.classList.remove('active'); });
      if (typeof renderPreviewCard === 'function') renderPreviewCard();
    }
  }
}

// Combine first+last name into the hidden "name" field for backend compatibility
function _setupFullNameSync() {
  var first = document.querySelector('#playerForm input[name="firstName"]');
  var last = document.querySelector('#playerForm input[name="lastName"]');
  var hidden = document.getElementById('fullNameHidden');
  if (!first || !last || !hidden) return;

  function update() {
    var full = (first.value.trim() + ' ' + last.value.trim()).trim();
    hidden.value = full;
    if (typeof renderPreviewCard === 'function') renderPreviewCard();
  }
  first.addEventListener('input', update);
  last.addEventListener('input', update);
}

// Initialize on DOM ready
function _initWizard() {
  _populateAgeAndYearDropdowns();
  _populateCountryDropdowns();
  _setupFullNameSync();
  _setupAvatarPicker();
  _toggleAvatarPickerVisibility();
  _setupSocialHandleInputs();
  _setupAllCourseAutocompletes();
  _showStep(1);

  // Re-toggle visibility when a photo is uploaded/removed
  var photoInput = document.getElementById('playerPhoto');
  if (photoInput) {
    photoInput.addEventListener('change', function() {
      // forms.js handlePhotoUpload sets the file/data; defer one tick so it has run
      setTimeout(_toggleAvatarPickerVisibility, 50);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _initWizard);
} else {
  _initWizard();
}
