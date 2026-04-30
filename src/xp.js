/* ============================================
   XP & LEVEL SYSTEM - src/xp.js
   Depends on: storage.js, auth.js, toasts.js, feed.js
   ============================================ */

var LEVELS = [
  { name: 'Starter',         minXP: 0,    color: '#999' },
  { name: 'Weekend Warrior',  minXP: 200,  color: '#2d8a5e' },
  { name: 'Club Regular',     minXP: 500,  color: '#1b2a4a' },
  { name: 'Single Digit',     minXP: 1000, color: '#6b1d2a' },
  { name: 'Scratch Player',   minXP: 2000, color: '#c9a84c' },
  { name: 'Tour Card',        minXP: 5000, color: '#2c3e8c' }
];

function getLevel(xp) {
  var lvl = LEVELS[0];
  for (var i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].minXP) lvl = LEVELS[i];
  }
  return lvl;
}

function getNextLevel(xp) {
  for (var i = 0; i < LEVELS.length; i++) {
    if (xp < LEVELS[i].minXP) return LEVELS[i];
  }
  return null;
}

function getLevelProgress(xp) {
  var current = getLevel(xp);
  var next = getNextLevel(xp);
  if (!next) return 1;
  var range = next.minXP - current.minXP;
  return (xp - current.minXP) / range;
}

function awardXP(amount, reason) {
  var user = getCurrentUser();
  if (!user) return;

  var oldLevel = getLevel(user.xp);
  user.xp += amount;
  var newLevel = getLevel(user.xp);
  user.level = newLevel.name;
  saveCurrentUser(user);

  showToast('xp', '+' + amount + ' XP', reason);

  if (newLevel.name !== oldLevel.name) {
    setTimeout(function() {
      showToast('level', 'Level Up!', 'You reached ' + newLevel.name);
      addFeedItem('level_up', { level: newLevel.name });
    }, 600);
  }
}
