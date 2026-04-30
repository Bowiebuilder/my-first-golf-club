/* ============================================
   BADGE SYSTEM - src/badges.js
   Depends on: storage.js, auth.js, xp.js, feed.js, toasts.js
   ============================================ */

var BADGES = [
  {
    id: 'origin_story', name: 'Origin Story',
    description: 'Created your first playing card', icon: '&#127183;',
    check: function(user) { return user.cardId !== null; }
  },
  {
    id: 'first_round', name: 'First Tee',
    description: 'Logged your first round', icon: '&#9971;',
    check: function(user, rounds) { return rounds.length >= 1; }
  },
  {
    id: 'five_rounds', name: 'Getting the Bug',
    description: 'Logged 5 rounds', icon: '&#128293;',
    check: function(user, rounds) { return rounds.length >= 5; }
  },
  {
    id: 'ten_rounds', name: 'Regular',
    description: 'Logged 10 rounds', icon: '&#11088;',
    check: function(user, rounds) { return rounds.length >= 10; }
  },
  {
    id: 'twenty_five_rounds', name: 'Dedicated',
    description: 'Logged 25 rounds', icon: '&#127942;',
    check: function(user, rounds) { return rounds.length >= 25; }
  },
  {
    id: 'century_club', name: 'Century Club',
    description: 'Logged 100 rounds', icon: '&#128175;',
    check: function(user, rounds) { return rounds.length >= 100; }
  },
  {
    id: 'under_par', name: 'Under Par',
    description: 'Shot under par in a round', icon: '&#127881;',
    check: function(user, rounds) {
      return rounds.some(function(r) { return r.score < r.par; });
    }
  },
  {
    id: 'top100_first', name: 'Bucket List',
    description: 'Played your first Top 100 course', icon: '&#127757;',
    check: function(user) { return (user.playedCourses || []).length >= 1; }
  },
  {
    id: 'top100_five', name: 'Course Collector',
    description: 'Played 5 Top 100 courses', icon: '&#127776;',
    check: function(user) { return (user.playedCourses || []).length >= 5; }
  },
  {
    id: 'top100_ten', name: 'Globetrotter',
    description: 'Played 10 Top 100 courses', icon: '&#9992;',
    check: function(user) { return (user.playedCourses || []).length >= 10; }
  },
  {
    id: 'tipped', name: 'Respected',
    description: 'Received your first Tip of the Cap', icon: '&#127913;',
    check: function(user, rounds, cards) {
      var card = cards.find(function(c) { return c.id === user.cardId; });
      return card && (card.tips || 0) >= 1;
    }
  },
  {
    id: 'best_round', name: 'Personal Best',
    description: 'Beat your previous best score', icon: '&#128170;',
    check: function(user, rounds) {
      if (rounds.length < 2) return false;
      var scores = rounds.map(function(r) { return r.score; });
      var best = Math.min.apply(null, scores);
      // Best wasn't the first round logged
      return scores.indexOf(best) > 0;
    }
  }
];

async function checkBadges() {
  var user = getCurrentUser();
  if (!user) return [];

  var newlyUnlocked = [];

  try {
    if (USE_API) {
      var result = await API.checkBadges();
      newlyUnlocked = (result.newlyUnlocked || []).map(function(b) {
        // Find matching badge definition for the icon
        var def = BADGES.find(function(d) { return d.id === b.id; });
        return { id: b.id, name: b.name, description: b.description, icon: def ? def.icon : '&#127942;' };
      });
      // Refresh user (badges + XP updated server-side)
      await API.getMe();
    } else {
      // localStorage mode
      var userRounds = getRounds().filter(function(r) { return r.userId === user.email; });
      var cards = getCards();

      BADGES.forEach(function(badge) {
        if (user.unlockedBadges.indexOf(badge.id) >= 0) return;
        if (badge.check(user, userRounds, cards)) {
          user.unlockedBadges.push(badge.id);
          newlyUnlocked.push(badge);
        }
      });

      if (newlyUnlocked.length > 0) {
        saveCurrentUser(user);
        newlyUnlocked.forEach(function(badge, i) {
          setTimeout(function() {
            addFeedItem('badge_unlocked', { badgeName: badge.name, badgeId: badge.id });
            var u = getCurrentUser();
            if (u) {
              u.xp += 50;
              u.level = getLevel(u.xp).name;
              saveCurrentUser(u);
              showToast('xp', '+50 XP', 'Badge unlocked: ' + badge.name);
            }
          }, (i + 1) * 800);
        });
      }
    }
  } catch (e) {
    // Silently fail - badges will be checked next time
    return [];
  }

  // Show badge unlock UI for each new badge
  if (newlyUnlocked.length > 0) {
    newlyUnlocked.forEach(function(badge, i) {
      setTimeout(function() { showBadgeUnlock(badge); }, (i + 1) * 800);
    });
  }

  return newlyUnlocked;
}

function showBadgeUnlock(badge) {
  var content = document.getElementById('badgeModalContent');
  if (!content) return;

  content.innerHTML =
    '<div style="font-size:64px;margin-bottom:16px;">' + badge.icon + '</div>' +
    '<h3 class="modal-title" style="color:var(--green-dark);">Badge Unlocked!</h3>' +
    '<p style="font-family:var(--font-display);font-size:24px;font-weight:900;margin:8px 0;">' + badge.name + '</p>' +
    '<p style="color:var(--text-light);margin-bottom:8px;">' + badge.description + '</p>' +
    '<p style="font-family:var(--font-accent);color:var(--gold);font-size:18px;letter-spacing:0.1em;">+50 XP</p>';

  // Generate confetti particles
  var confettiContainer = document.getElementById('badgeConfetti');
  if (confettiContainer) {
    confettiContainer.innerHTML = '';
    for (var i = 0; i < 40; i++) {
      var particle = document.createElement('div');
      particle.className = 'badge-confetti-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = (Math.random() * 1.5) + 's';
      particle.style.animationDuration = (1.5 + Math.random() * 2) + 's';
      confettiContainer.appendChild(particle);
    }
  }

  document.getElementById('badgeModal').style.display = 'flex';
}

function closeBadgeModal() {
  document.getElementById('badgeModal').style.display = 'none';
}
