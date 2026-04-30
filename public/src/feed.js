/* ============================================
   ACTIVITY FEED - src/feed.js
   Depends on: storage.js, api.js, auth.js
   ============================================ */

function addFeedItem(type, data) {
  // Only add locally in localStorage mode - API adds feed items server-side
  if (USE_API) return;
  var user = getCurrentUser();
  var feed = getFeed();
  feed.unshift({
    type: type,
    user_name: user ? user.name : 'System',
    data: data || {},
    created_at: new Date().toISOString()
  });
  if (feed.length > 200) feed = feed.slice(0, 200);
  saveFeed(feed);
}

async function renderActivityFeed() {
  var container = document.getElementById('feedItems');
  if (!container) return;

  var items;
  try {
    if (USE_API) {
      var result = await API.getFeed(8);
      items = result.feed;
    } else {
      items = getFeed().slice(0, 8);
    }
  } catch (e) {
    items = getFeed().slice(0, 8);
  }

  if (!items || items.length === 0) {
    container.innerHTML = '<p class="feed-empty">No activity yet. Be the first!</p>';
    return;
  }

  container.innerHTML = items.map(function(item) {
    var icon = '';
    var text = '';
    var name = '<strong>' + (item.user_name || item.userName || 'Someone') + '</strong>';
    var data = item.data || {};

    switch (item.type) {
      case 'card_created':
        icon = '&#127183;';
        text = name + ' created their ' + ((data.cardType === 'org') ? 'Club Card' : 'Player Card'); break;
      case 'round_logged':
        icon = '&#9971;';
        text = name + ' shot ' + (data.score || '?') + ' at ' + (data.courseName || 'a course'); break;
      case 'badge_unlocked':
        icon = '&#127942;';
        text = name + ' earned the <strong>' + (data.badgeName || '') + '</strong> badge'; break;
      case 'tip':
        icon = '&#127913;';
        text = name + ' tipped their cap to <strong>' + (data.targetName || 'someone') + '</strong>'; break;
      case 'level_up':
        icon = '&#128640;';
        text = name + ' reached <strong>' + (data.level || '') + '</strong> level!'; break;
      case 'course_played':
        icon = '&#127757;';
        text = name + ' played Top 100 course <strong>' + (data.courseName || '') + '</strong>'; break;
      default:
        icon = '&#9971;';
        text = name + ' joined the community';
    }

    return '<div class="feed-item">' +
      '<span class="feed-icon">' + icon + '</span>' +
      '<span class="feed-item-text">' + text + '</span>' +
      '<span class="feed-item-time">' + timeAgo(item.created_at || item.createdAt) + '</span>' +
    '</div>';
  }).join('');
}
