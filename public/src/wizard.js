/* ============================================
   FORM WIZARD - src/wizard.js
   Multi-step form wizard for card creation
   Depends on: forms.js, storage.js
   ============================================ */

var WIZARD_TOTAL_STEPS = 7;
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
  _showStep(1);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _initWizard);
} else {
  _initWizard();
}
