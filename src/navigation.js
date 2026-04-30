/* ============================================
   NAVIGATION - src/navigation.js
   Section routing, mobile nav, hero stats
   Depends on: storage.js, auth.js
   ============================================ */

function showSection(section) {
  var sections = ['hero', 'submit', 'community', 'top100', 'about', 'clubhouse'];

  // Auth gate: only clubhouse requires login
  if (section === 'clubhouse' && !getCurrentUser()) {
    openAuth('signup');
    return;
  }

  sections.forEach(function(s) {
    var el = document.getElementById('section-' + s);
    if (el) el.style.display = (s === section) ? '' : 'none';
  });

  // Update nav active states
  document.querySelectorAll('.nav-link').forEach(function(link) {
    var ds = link.getAttribute('data-section');
    if (ds) link.classList.toggle('active', ds === section);
  });

  // Section-specific rendering
  if (section === 'community' && typeof renderCommunity === 'function') renderCommunity();
  if (section === 'top100' && typeof renderTop100 === 'function') renderTop100();
  if (section === 'clubhouse' && typeof renderClubhouse === 'function') renderClubhouse();
  if (section === 'hero') updateHeroStats();
  if (section === 'submit' && typeof renderPreviewCard === 'function') renderPreviewCard();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileNav() {
  var nav = document.getElementById('navMobile');
  if (nav) nav.classList.toggle('open');
}

function updateHeroStats() {
  var cards = getCards();
  var players = cards.filter(function(c) { return c.type === 'player'; }).length;
  var orgs = cards.filter(function(c) { return c.type === 'org'; }).length;
  var countries = [];
  cards.forEach(function(c) {
    var loc = (c.location || '').split(',').pop().trim();
    if (loc && countries.indexOf(loc) < 0) countries.push(loc);
  });

  animateNumber('statPlayers', players);
  animateNumber('statOrgs', orgs);
  animateNumber('statCountries', countries.length);
}
