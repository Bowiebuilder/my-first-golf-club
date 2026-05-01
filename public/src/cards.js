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
  var border = card.borderStyle || 'gold';
  var isPlayer = card.type === 'player';

  // Country flag (uses ISO code -> SVG flag from flagcdn.com for crisp rendering)
  var natCode = (card.nationalityCode || '').toLowerCase();
  var flagHTML = natCode
    ? '<img class="card-flag" src="https://flagcdn.com/w80/' + natCode + '.png" srcset="https://flagcdn.com/w160/' + natCode + '.png 2x" alt="' + (card.nationality || '') + ' flag" loading="lazy">'
    : '';
  var yearLabel = isPlayer
    ? 'Since ' + (card.yearStarted || '----')
    : 'Est. ' + (card.yearStarted || '----');

  // Top 100 badge check
  var hasTop100 = isPlayer && typeof isTop100Course === 'function' && isTop100Course(card.firstCourse);

  // Photo > Avatar > Initials (in priority order)
  var photoHTML;
  if (card.photo) {
    photoHTML = '<img class="card-photo" src="' + card.photo + '" alt="' + (card.name || '') + '">';
  } else if (card.avatarId && typeof renderAvatarSVG === 'function' && typeof getAvatarColorHex === 'function') {
    var avColor = getAvatarColorHex(card.avatarColor || 'gold');
    photoHTML = '<div class="card-avatar-wrap" style="border-color:' + avColor + ';">' +
                  renderAvatarSVG(card.avatarId, avColor, 100) +
                '</div>';
  } else {
    photoHTML = '<div class="card-initials">' + initials + '</div>';
  }

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

  // Social icons (back of card) - only render those with values
  function _socialUrl(network, value) {
    if (!value) return null;
    var v = String(value).trim().replace(/^@+/, '');
    if (!v) return null;
    switch (network) {
      case 'instagram': return 'https://instagram.com/' + encodeURIComponent(v);
      case 'x':         return 'https://x.com/' + encodeURIComponent(v);
      case 'facebook':  return 'https://facebook.com/' + encodeURIComponent(v);
      case 'linkedin':  return 'https://linkedin.com/in/' + encodeURIComponent(v);
    }
    return null;
  }
  var socialIcons = {
    instagram: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
    x: '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>'
  };
  var socialList = ['instagram','x','facebook','linkedin'].map(function(n) {
    var key = 'social' + n.charAt(0).toUpperCase() + n.slice(1);
    var url = _socialUrl(n, card[key]);
    if (!url) return '';
    return '<a class="card-social-icon" href="' + url + '" target="_blank" rel="noopener" onclick="event.stopPropagation();" data-network="' + n + '" aria-label="' + n + '">' + socialIcons[n] + '</a>';
  }).join('');
  var socialsHTML = socialList ? '<div class="card-socials">' + socialList + '</div>' : '';

  return '' +
    '<div class="golf-card card-theme-' + theme + ' card-border-' + border + '" onclick="this.classList.toggle(\'flipped\')">' +
      '<div class="golf-card-face card-front">' +
        '<div class="card-top-bar">' +
          '<span class="card-type-badge">' + (isPlayer ? 'PLAYER CARD' : 'CLUB CARD') + '</span>' +
          '<div class="card-top-right">' +
            (hasTop100 ? '<span class="top100-verified-badge" style="font-size:8px;padding:2px 6px;">TOP 100</span>' : '') +
            flagHTML +
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
        socialsHTML +
        '<div class="card-back-footer"><div class="card-back-logo">My First Golf Club</div></div>' +
      '</div>' +
    '</div>';
}
