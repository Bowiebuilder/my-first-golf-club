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

function _populateCountryDropdowns() {
  var sorted = COUNTRIES.slice().sort(function(a, b) { return a.name.localeCompare(b.name); });

  var natSelect = document.getElementById('nationalitySelect');
  var firstSelect = document.getElementById('firstCourseCountrySelect');

  if (natSelect && natSelect.options.length <= 1) {
    sorted.forEach(function(c) {
      var opt = document.createElement('option');
      opt.value = c.name;
      opt.dataset.code = c.code;
      opt.textContent = c.flag + '  ' + c.name;
      natSelect.appendChild(opt);
    });
  }

  if (firstSelect && firstSelect.options.length <= 1) {
    sorted.forEach(function(c) {
      var opt = document.createElement('option');
      opt.value = c.name;
      opt.dataset.code = c.code;
      opt.textContent = c.flag + '  ' + c.name;
      firstSelect.appendChild(opt);
    });
  }
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

  var requiredInputs = stepEl.querySelectorAll('input[required], select[required], textarea[required]');
  var firstInvalid = null;
  requiredInputs.forEach(function(inp) {
    if (!inp.value || inp.value.trim() === '') {
      var grp = inp.closest('.form-group');
      if (grp) grp.classList.add('has-error');
      if (!firstInvalid) firstInvalid = inp;
    } else {
      var grp = inp.closest('.form-group');
      if (grp) grp.classList.remove('has-error');
    }
  });

  // Step-specific validation
  if (_currentStep === 2) {
    var year = stepEl.querySelector('input[name="yearStarted"]');
    if (year && (!year.value || parseInt(year.value) < 1800 || parseInt(year.value) > new Date().getFullYear())) {
      var grp = year.closest('.form-group');
      if (grp) grp.classList.add('has-error');
      if (!firstInvalid) firstInvalid = year;
    }
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

// Initialize on DOM ready
function _initWizard() {
  _populateCountryDropdowns();
  _showStep(1);

  // When nationality changes, store the country code for flag rendering on card
  var natSelect = document.getElementById('nationalitySelect');
  if (natSelect) {
    natSelect.addEventListener('change', function() {
      var opt = natSelect.options[natSelect.selectedIndex];
      var code = opt ? opt.dataset.code : '';
      // Stash on the form so getFormData can pick it up
      var form = document.getElementById('playerForm');
      if (form) {
        var hidden = form.querySelector('input[name="nationalityCode"]');
        if (!hidden) {
          hidden = document.createElement('input');
          hidden.type = 'hidden';
          hidden.name = 'nationalityCode';
          form.appendChild(hidden);
        }
        hidden.value = code || '';
        // Also stash nationality name (for backward compat)
        var natHidden = form.querySelector('input[name="nationality"]');
        if (!natHidden) {
          natHidden = document.createElement('input');
          natHidden.type = 'hidden';
          natHidden.name = 'nationality';
          form.appendChild(natHidden);
        }
        natHidden.value = natSelect.value;
      }
      if (typeof renderPreviewCard === 'function') renderPreviewCard();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _initWizard);
} else {
  _initWizard();
}
