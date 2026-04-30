/* ============================================
   ACTIVITY FEED - src/feed.js
   Depends on: storage.js, auth.js
   ============================================ */

function addFeedItem(type, data) {
  var user = getCurrentUser();
  var feed = getFeed();
  feed.unshift({
    type: type,
    userId: user ? user.email : 'system',
    userName: user ? user.name : 'System',
    data: data || {},
    createdAt: new Date().toISOString()
  });
  // Keep feed to 200 items max
  if (feed.length > 200) feed = feed.slice(0, 200);
  saveFeed(feed);
}

function renderActivityFeed() {
  var container = document.getElementById('feedItems');
  if (!container) return;

  var feed = getFeed();
  var items = feed.slice(0, 8);

  if (items.length === 0) {
    container.innerHTML = '<p class="feed-empty">No activity yet. Be the first!</p>';
    return;
  }

  container.innerHTML = items.map(function(item) {
    var icon = '';
    var text = '';
    var name = '<strong>' + (item.userName || 'Someone') + '</strong>';

    switch (item.type) {
      case 'card_created':
        icon = '&#127183;';
        var cardType = (item.data && item.data.cardType === 'org') ? 'Club Card' : 'Player Card';
        text = name + ' created their ' + cardType;
        break;
      case 'round_logged':
        icon = '&#9971;';
        text = name + ' shot ' + (item.data.score || '?') + ' at ' + (item.data.courseName || 'a course');
        break;
      case 'badge_unlocked':
        icon = '&#127942;';
        text = name + ' earned the <strong>' + (item.data.badgeName || '') + '</strong> badge';
        break;
      case 'tip':
        icon = '&#127913;';
        text = name + ' tipped their cap to <strong>' + (item.data.targetName || 'someone') + '</strong>';
        break;
      case 'level_up':
        icon = '&#128640;';
        text = name + ' reached <strong>' + (item.data.level || '') + '</strong> level!';
        break;
      case 'course_played':
        icon = '&#127757;';
        text = name + ' played Top 100 course <strong>' + (item.data.courseName || '') + '</strong>';
        break;
      default:
        icon = '&#9971;';
        text = name + ' did something awesome';
    }

    return '<div class="feed-item">' +
      '<span class="feed-icon">' + icon + '</span>' +
      '<span class="feed-item-text">' + text + '</span>' +
      '<span class="feed-item-time">' + timeAgo(item.createdAt) + '</span>' +
    '</div>';
  }).join('');
}
