/* ============================================
   CELEBRATION - src/celebrate.js
   Card creation success celebration, confetti, sharing
   Depends on: storage.js, cards.js, toasts.js
   ============================================ */

var _celebrationCardData = null;

// --- Launch the celebration ---
function showCelebration(card, isEdit) {
  _celebrationCardData = card;

  var modal = document.getElementById('successModal');
  var cardContainer = document.getElementById('modalCard');
  var xpEl = document.getElementById('successXP');
  var titleEl = document.getElementById('celebrationTitle');
  var subtitleEl = document.getElementById('celebrationSubtitle');
  var badgeEl = document.getElementById('celebrationBadge');

  if (!modal) return;

  // Set content based on create vs update
  if (isEdit) {
    if (titleEl) titleEl.textContent = 'Card Updated!';
    if (subtitleEl) subtitleEl.textContent = 'Your changes have been saved. Looking sharp.';
    if (badgeEl) badgeEl.textContent = '\u2728'; // sparkles
    if (xpEl) xpEl.innerHTML = '';
  } else {
    if (titleEl) titleEl.textContent = "You're in the Club!";
    if (subtitleEl) subtitleEl.textContent = 'Your card has joined the global registry of golf origin stories.';
    if (badgeEl) badgeEl.textContent = '\u26F3'; // golf flag
    if (xpEl) xpEl.innerHTML =
      '<div class="xp-earned">' +
        '<span>+100 XP</span>' +
        '<span class="xp-earned-label">for creating your card</span>' +
      '</div>';
  }

  // Render the card
  if (cardContainer) cardContainer.innerHTML = renderCardHTML(card);

  // Show the overlay
  modal.style.display = 'flex';

  // Launch confetti
  launchConfetti();
}

function closeModal() {
  var modal = document.getElementById('successModal');
  if (modal) modal.style.display = 'none';
  _celebrationCardData = null;

  // Clear confetti
  var confetti = document.getElementById('celebrationConfetti');
  if (confetti) confetti.innerHTML = '';
}

// --- Confetti ---
function launchConfetti() {
  var container = document.getElementById('celebrationConfetti');
  if (!container) return;
  container.innerHTML = '';

  var colors = ['#c9a84c', '#e8d48b', '#1a5e3a', '#2d8a5e', '#fff', '#6b1d2a', '#1b2a4a', '#ff6b6b', '#ffd93d'];
  var shapes = ['square', 'circle', 'strip'];

  for (var i = 0; i < 80; i++) {
    var particle = document.createElement('div');
    particle.className = 'confetti-particle';

    var color = colors[Math.floor(Math.random() * colors.length)];
    var shape = shapes[Math.floor(Math.random() * shapes.length)];
    var left = Math.random() * 100;
    var delay = Math.random() * 2;
    var duration = 2 + Math.random() * 3;
    var size = 6 + Math.random() * 10;

    particle.style.left = left + '%';
    particle.style.animationDelay = delay + 's';
    particle.style.animationDuration = duration + 's';
    particle.style.background = color;
    particle.style.width = size + 'px';

    if (shape === 'circle') {
      particle.style.height = size + 'px';
      particle.style.borderRadius = '50%';
    } else if (shape === 'strip') {
      particle.style.height = (size * 2.5) + 'px';
      particle.style.width = (size * 0.4) + 'px';
      particle.style.borderRadius = '2px';
    } else {
      particle.style.height = size + 'px';
    }

    container.appendChild(particle);
  }

  // Clean up after animation
  setTimeout(function() {
    if (container) container.innerHTML = '';
  }, 6000);
}

// --- Share to X / Twitter ---
function shareToX() {
  if (!_celebrationCardData) return;
  var card = _celebrationCardData;
  var isPlayer = card.type === 'player';

  var text = isPlayer
    ? 'I just created my Player Card on My First Golf Club! \u26F3\n\nMy golf journey started in ' + (card.yearStarted || '?') + ' at ' + (card.firstCourse || 'the course') + '.\n\nCreate yours:'
    : (card.name || 'Our organization') + ' just joined My First Golf Club! \u26F3\n\nEst. ' + (card.yearStarted || '?') + '.\n\nCreate your card:';

  var url = 'https://myfirstgolf.club';
  var shareUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url);
  window.open(shareUrl, '_blank', 'width=600,height=400');
}

// --- Copy link ---
function copyCardLink() {
  var url = 'https://myfirstgolf.club';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(function() {
      showToast('success', 'Link copied!', 'Paste it anywhere to share');
    });
  } else {
    // Fallback
    var input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast('success', 'Link copied!', 'Paste it anywhere to share');
  }
}

// --- Download card as image ---
function downloadCard() {
  // Use html2canvas if available, otherwise prompt screenshot
  if (typeof html2canvas !== 'undefined') {
    var cardEl = document.querySelector('#modalCard .golf-card');
    if (!cardEl) return;
    html2canvas(cardEl, { backgroundColor: null, scale: 2 }).then(function(canvas) {
      var link = document.createElement('a');
      link.download = 'my-first-golf-club-card.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  } else {
    // No html2canvas - give screenshot instructions
    showToast('success', 'Screenshot time!', 'Take a screenshot of your card to save and share it');
  }
}
