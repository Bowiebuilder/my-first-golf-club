/* ============================================
   SEED DATA - src/seed.js
   Demo data for first-time visitors
   Depends on: storage.js
   ============================================ */

function seedDemoData() {
  // Only seed if no cards exist
  if (getCards().length > 0) return;

  // Demo users (not logged in - just for card ownership display)
  var demoUsers = [
    { email: 'james@demo.com', name: 'James de Villiers', passwordHash: 'demo', createdAt: '2026-01-15T08:00:00Z', xp: 450, level: 'Club Regular', cardId: null, playedCourses: ['Leopard Creek Country Club'], unlockedBadges: ['origin_story', 'first_round', 'five_rounds', 'top100_first'] },
    { email: 'amara@demo.com', name: 'Amara Okafor', passwordHash: 'demo', createdAt: '2026-02-10T08:00:00Z', xp: 225, level: 'Weekend Warrior', cardId: null, playedCourses: [], unlockedBadges: ['origin_story', 'first_round'] },
    { email: 'kenji@demo.com', name: 'Kenji Tanaka', passwordHash: 'demo', createdAt: '2026-01-20T08:00:00Z', xp: 875, level: 'Club Regular', cardId: null, playedCourses: ['Hirono Golf Club', 'Royal Melbourne Golf Club (West)'], unlockedBadges: ['origin_story', 'first_round', 'five_rounds', 'ten_rounds', 'top100_first'] },
    { email: 'sofia@demo.com', name: 'Sofia Martinez', passwordHash: 'demo', createdAt: '2026-03-01T08:00:00Z', xp: 175, level: 'Starter', cardId: null, playedCourses: [], unlockedBadges: ['origin_story', 'first_round'] },
    { email: 'callum@demo.com', name: 'Callum McLeod', passwordHash: 'demo', createdAt: '2026-01-05T08:00:00Z', xp: 1200, level: 'Single Digit', cardId: null, playedCourses: ['St Andrews Old Course', 'Muirfield', 'Royal Dornoch Golf Club', 'Carnoustie Golf Links', 'Turnberry (Ailsa)'], unlockedBadges: ['origin_story', 'first_round', 'five_rounds', 'ten_rounds', 'under_par', 'top100_first', 'top100_five', 'best_round'] },
    { email: 'rcgc@demo.com', name: 'Royal Cape Golf Club', passwordHash: 'demo', createdAt: '2026-01-10T08:00:00Z', xp: 100, level: 'Starter', cardId: null, playedCourses: [], unlockedBadges: ['origin_story'] },
    { email: 'accenture@demo.com', name: 'Accenture Golf Society', passwordHash: 'demo', createdAt: '2026-02-20T08:00:00Z', xp: 100, level: 'Starter', cardId: null, playedCourses: [], unlockedBadges: ['origin_story'] }
  ];

  // Demo cards
  var demoCards = [
    { type: 'player', name: 'James de Villiers', yearStarted: 1998, ageStarted: 10, firstCourse: 'Durbanville Golf Club', location: 'Cape Town, South Africa', handicap: '12', introducedBy: 'My father', favClub: 'Driver', story: 'My dad took me to the driving range one Saturday morning. I couldn\'t even hold the club properly, but the sound of that first clean contact - I was hooked from that moment on.', cardColor: 'green', ownerEmail: 'james@demo.com' },
    { type: 'player', name: 'Amara Okafor', yearStarted: 2015, ageStarted: 24, firstCourse: 'Ibom Golf Course', location: 'Lagos, Nigeria', handicap: '22', introducedBy: 'A colleague at work', favClub: 'Iron', story: 'My boss invited me to a corporate golf day. I showed up in jeans. By the 9th hole, I\'d already booked my first lesson. The game chose me.', cardColor: 'navy', ownerEmail: 'amara@demo.com' },
    { type: 'org', name: 'Royal Cape Golf Club', yearStarted: 1885, orgType: 'Golf Club', location: 'Cape Town, South Africa', signatureCourse: 'Royal Cape Championship', memberCount: '1,200', holes: '18', founder: 'Sir David Gill', story: 'Founded in the shadow of Table Mountain, Royal Cape is the oldest golf club in Africa. What started as a few holes on the Waterfront commons has become a 139-year institution.', cardColor: 'maroon', ownerEmail: 'rcgc@demo.com' },
    { type: 'player', name: 'Kenji Tanaka', yearStarted: 1972, ageStarted: 18, firstCourse: 'Hirono Golf Club', location: 'Kobe, Japan', handicap: '8', introducedBy: 'University golf team tryouts', favClub: 'Putter', story: 'I tried out for the university golf team on a dare. Fifty years later, the dare hasn\'t worn off. The short game is where the real magic happens.', cardColor: 'black', ownerEmail: 'kenji@demo.com' },
    { type: 'org', name: 'Accenture Golf Society', yearStarted: 2008, orgType: 'Corporate', location: 'Dublin, Ireland', signatureCourse: 'K Club Palmer Course', memberCount: '340', holes: '18', founder: 'Patrick Brennan', story: 'Started as four consultants sneaking out for Friday afternoon rounds. Now a 340-member society that hosts an annual tournament across three countries.', cardColor: 'royal', ownerEmail: 'accenture@demo.com' },
    { type: 'player', name: 'Sofia Martinez', yearStarted: 2021, ageStarted: 31, firstCourse: 'Trump National Doral', location: 'Miami, USA', handicap: 'Beginner', introducedBy: 'YouTube videos during lockdown', favClub: 'Hybrid', story: 'Pandemic lockdown + YouTube algorithm = new obsession. I watched every Rick Shiels video and showed up at the range the day restrictions lifted. Haven\'t stopped since.', cardColor: 'green', ownerEmail: 'sofia@demo.com' },
    { type: 'player', name: 'Callum McLeod', yearStarted: 1985, ageStarted: 14, firstCourse: 'St Andrews Old Course', location: 'Edinburgh, Scotland', handicap: '4', introducedBy: 'My grandfather walked me round the Old Course', favClub: 'Iron', story: 'Grandad took me to St Andrews on my 14th birthday. Standing on the Swilcan Bridge, he said: "This is where it all began." He meant golf. He meant everything.', cardColor: 'navy', ownerEmail: 'callum@demo.com' }
  ];

  // Add cards and link to users
  demoCards.forEach(function(cardData) {
    var ownerEmail = cardData.ownerEmail;
    delete cardData.ownerEmail;
    var card = addCard(cardData);

    // Link card to demo user
    var userIdx = demoUsers.findIndex(function(u) { return u.email === ownerEmail; });
    if (userIdx >= 0) {
      demoUsers[userIdx].cardId = card.id;
    }
  });

  // Save demo users
  saveUsers(demoUsers);

  // Demo rounds
  var demoRounds = [
    { id: 'dr1', userId: 'james@demo.com', courseName: 'Durbanville Golf Club', date: '2026-03-15', score: 88, par: 72, conditions: 'Good', notes: 'First time breaking 90!', createdAt: '2026-03-15T14:00:00Z' },
    { id: 'dr2', userId: 'james@demo.com', courseName: 'Leopard Creek Country Club', date: '2026-02-20', score: 94, par: 72, conditions: 'Windy', notes: 'Saw hippos on the 13th. Incredible experience.', createdAt: '2026-02-20T14:00:00Z' },
    { id: 'dr3', userId: 'james@demo.com', courseName: 'Royal Cape Golf Club', date: '2026-04-02', score: 85, par: 72, conditions: 'Perfect', notes: 'New personal best. The putter was hot today.', createdAt: '2026-04-02T14:00:00Z' },
    { id: 'dr4', userId: 'kenji@demo.com', courseName: 'Hirono Golf Club', date: '2026-01-28', score: 76, par: 72, conditions: 'Good', notes: 'Beautiful winter day in Kobe.', createdAt: '2026-01-28T14:00:00Z' },
    { id: 'dr5', userId: 'kenji@demo.com', courseName: 'Royal Melbourne Golf Club (West)', date: '2026-02-14', score: 79, par: 71, conditions: 'Windy', notes: 'MacKenzie bunkers are works of art.', createdAt: '2026-02-14T14:00:00Z' },
    { id: 'dr6', userId: 'callum@demo.com', courseName: 'St Andrews Old Course', date: '2026-01-10', score: 74, par: 72, conditions: 'Windy', notes: 'Two over at the Home of Golf. Not bad.', createdAt: '2026-01-10T14:00:00Z' },
    { id: 'dr7', userId: 'callum@demo.com', courseName: 'Muirfield', date: '2026-02-05', score: 71, par: 71, conditions: 'Perfect', notes: 'Level par at Muirfield. Career highlight.', createdAt: '2026-02-05T14:00:00Z' },
    { id: 'dr8', userId: 'callum@demo.com', courseName: 'Carnoustie Golf Links', date: '2026-03-20', score: 78, par: 72, conditions: 'Rainy', notes: 'The Barry Burn nearly got me on 18.', createdAt: '2026-03-20T14:00:00Z' },
    { id: 'dr9', userId: 'sofia@demo.com', courseName: 'Trump National Doral', date: '2026-03-10', score: 102, par: 72, conditions: 'Perfect', notes: 'Still learning but loved every minute.', createdAt: '2026-03-10T14:00:00Z' },
    { id: 'dr10', userId: 'amara@demo.com', courseName: 'Ibom Golf Course', date: '2026-03-25', score: 95, par: 72, conditions: 'Good', notes: 'Getting more consistent off the tee.', createdAt: '2026-03-25T14:00:00Z' }
  ];
  saveRounds(demoRounds);

  // Demo feed items
  var demoFeed = [
    { type: 'card_created', userId: 'callum@demo.com', userName: 'Callum McLeod', data: { cardType: 'player' }, createdAt: '2026-01-05T09:00:00Z' },
    { type: 'round_logged', userId: 'callum@demo.com', userName: 'Callum McLeod', data: { courseName: 'St Andrews Old Course', score: 74 }, createdAt: '2026-01-10T15:00:00Z' },
    { type: 'badge_unlocked', userId: 'callum@demo.com', userName: 'Callum McLeod', data: { badgeName: 'Under Par' }, createdAt: '2026-02-05T16:00:00Z' },
    { type: 'card_created', userId: 'james@demo.com', userName: 'James de Villiers', data: { cardType: 'player' }, createdAt: '2026-01-15T09:00:00Z' },
    { type: 'round_logged', userId: 'james@demo.com', userName: 'James de Villiers', data: { courseName: 'Leopard Creek Country Club', score: 94 }, createdAt: '2026-02-20T15:00:00Z' },
    { type: 'course_played', userId: 'kenji@demo.com', userName: 'Kenji Tanaka', data: { courseName: 'Royal Melbourne Golf Club (West)' }, createdAt: '2026-02-14T15:00:00Z' },
    { type: 'card_created', userId: 'sofia@demo.com', userName: 'Sofia Martinez', data: { cardType: 'player' }, createdAt: '2026-03-01T10:00:00Z' },
    { type: 'round_logged', userId: 'amara@demo.com', userName: 'Amara Okafor', data: { courseName: 'Ibom Golf Course', score: 95 }, createdAt: '2026-03-25T15:00:00Z' },
    { type: 'round_logged', userId: 'james@demo.com', userName: 'James de Villiers', data: { courseName: 'Royal Cape Golf Club', score: 85 }, createdAt: '2026-04-02T15:00:00Z' },
    { type: 'level_up', userId: 'callum@demo.com', userName: 'Callum McLeod', data: { level: 'Single Digit' }, createdAt: '2026-04-10T12:00:00Z' }
  ];
  saveFeed(demoFeed);
}
