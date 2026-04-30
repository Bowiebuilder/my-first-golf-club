/* ============================================
   CARD RENDERING - src/cards.js
   The collector card HTML generator
   Depends on: storage.js, top100.js (isTop100Course)
   ============================================ */

function renderCardHTML(card) {
  var era = getEra(card.yearStarted);
  var eraLabel = getEraLabel(era);
  var serial = generateSerial(card);
  var initials = getInitials(card.name);
  var theme = card.cardColor || 'green';
  var isPlayer = card.type === 'player';
  var yearLabel = isPlayer
    ? 'Since ' + (card.yearStarted || '----')
    : 'Est. ' + (card.yearStarted || '----');

  // Top 100 badge check
  var hasTop100 = isPlayer && typeof isTop100Course === 'function' && isTop100Course(card.firstCourse);

  // Photo or initials
  var photoHTML = card.photo
    ? '<img class="card-photo" src="' + card.photo + '" alt="' + (card.name || '') + '">'
    : '<div class="card-initials">' + initials + '</div>';

  // Front stats
  var statsHTML = '';
  if (isPlayer) {
    statsHTML =
      '<div class="card-stat"><div class="card-stat-value">' + (card.yearStarted || '----') + '</div><div class="card-stat-label">Year Started</div></div>' +
      '<div class="card-stat"><div class="card-stat-value">' + (card.handicap || '---') + '</div><div class="card-stat-label">Handicap</div></div>' +
      '<div class="card-stat"><div class="card-stat-value">' + (card.favClub || '---') + '</div><div class="card-stat-label">Fav Club</div></div>' +
      '<div class="card-stat"><div class="card-stat-value">' + (card.ageStarted ? card.ageStarted + ' yrs' : '---') + '</div><div class="card-stat-label">Age Started</div></div>';
  } else {
    statsHTML =
      '<div class="card-stat"><div class="card-stat-value">' + (card.yearStarted || '----') + '</div><div class="card-stat-label">Established</div></div>' +
      '<div class="card-stat"><div class="card-stat-value">' + (card.orgType || '---') + '</div><div class="card-stat-label">Type</div></div>' +
      '<div class="card-stat"><div class="card-stat-value">' + (card.memberCount || '---') + '</div><div class="card-stat-label">Members</div></div>' +
      '<div class="card-stat"><div class="card-stat-value">' + (card.holes ? card.holes + 'H' : '---') + '</div><div class="card-stat-label">Holes</div></div>';
  }

  // Back details
  var details = [];
  if (isPlayer) {
    if (card.firstCourse) details.push({ l: 'First Course', v: card.firstCourse });
    if (card.introducedBy) details.push({ l: 'Introduced By', v: card.introducedBy });
    if (card.location) details.push({ l: 'Location', v: card.location });
    if (card.favClub) details.push({ l: 'Favorite Club', v: card.favClub });
  } else {
    if (card.signatureCourse) details.push({ l: 'Signature Course', v: card.signatureCourse });
    if (card.founder) details.push({ l: 'Founder', v: card.founder });
    if (card.location) details.push({ l: 'Location', v: card.location });
    if (card.memberCount) details.push({ l: 'Members', v: card.memberCount });
  }

  var backDetailsHTML = details.length > 0
    ? details.map(function(d) {
        return '<div class="card-back-detail">' +
          '<span class="card-back-detail-label">' + d.l + '</span>' +
          '<span class="card-back-detail-value">' + d.v + '</span>' +
        '</div>';
      }).join('')
    : '<div class="card-back-detail"><span class="card-back-detail-label">Details</span><span class="card-back-detail-value">Fill in the form</span></div>';

  var top100BadgeHTML = hasTop100
    ? '<span class="top100-verified-badge" style="font-size:8px;padding:2px 6px;">TOP 100</span>'
    : '';

  return '' +
    '<div class="golf-card card-theme-' + theme + '" onclick="this.classList.toggle(\'flipped\')">' +
      '<div class="golf-card-face card-front">' +
        '<div class="card-top-bar">' +
          '<span class="card-type-badge">' + (isPlayer ? 'PLAYER CARD' : 'CLUB CARD') + '</span>' +
          '<div style="display:flex;gap:6px;align-items:center;">' +
            top100BadgeHTML +
            '<span class="card-era-badge card-era-' + era + '">' + eraLabel + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="card-photo-area">' + photoHTML + '</div>' +
        '<div class="card-name-area">' +
          '<div class="card-player-name">' + (card.name || (isPlayer ? 'Your Name' : 'Organization Name')) + '</div>' +
          '<div class="card-location">' + (card.location || 'Location') + ' &bull; ' + yearLabel + '</div>' +
        '</div>' +
        '<div class="card-divider"></div>' +
        '<div class="card-stats">' + statsHTML + '</div>' +
        '<div class="card-bottom-bar"><span class="card-serial">' + serial + '</span></div>' +
      '</div>' +
      '<div class="golf-card-face card-back">' +
        '<div class="card-back-header">' +
          '<div class="card-back-title">' + (isPlayer ? 'ORIGIN STORY' : 'FOUNDING STORY') + '</div>' +
          '<div class="card-back-subtitle">' + (card.name || 'Name') + '</div>' +
        '</div>' +
        '<div class="card-divider"></div>' +
        '<div class="card-back-story"><p>&ldquo;' + (card.story || 'Your story will appear here...') + '&rdquo;</p></div>' +
        '<div class="card-divider"></div>' +
        '<div class="card-back-details">' + backDetailsHTML + '</div>' +
        '<div class="card-back-footer"><div class="card-back-logo">My First Golf Club</div></div>' +
      '</div>' +
    '</div>';
}
