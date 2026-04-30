import { json, error, requireAuth, awardXP, addFeedItem } from './_helpers.js';

// Badge definitions (server-side conditions)
const BADGES = [
  { id: 'origin_story', name: 'Origin Story', description: 'Created your first playing card',
    check: (user) => user.card_id !== null },
  { id: 'first_round', name: 'First Tee', description: 'Logged your first round',
    check: (user, roundCount) => roundCount >= 1 },
  { id: 'five_rounds', name: 'Getting the Bug', description: 'Logged 5 rounds',
    check: (user, roundCount) => roundCount >= 5 },
  { id: 'ten_rounds', name: 'Regular', description: 'Logged 10 rounds',
    check: (user, roundCount) => roundCount >= 10 },
  { id: 'twenty_five_rounds', name: 'Dedicated', description: 'Logged 25 rounds',
    check: (user, roundCount) => roundCount >= 25 },
  { id: 'century_club', name: 'Century Club', description: 'Logged 100 rounds',
    check: (user, roundCount) => roundCount >= 100 },
  { id: 'under_par', name: 'Under Par', description: 'Shot under par in a round',
    check: (user, roundCount, rounds) => rounds.some(r => r.score < r.par) },
  { id: 'top100_first', name: 'Bucket List', description: 'Played your first Top 100 course',
    check: (user) => { const c = JSON.parse(user.played_courses || '[]'); return c.length >= 1; } },
  { id: 'top100_five', name: 'Course Collector', description: 'Played 5 Top 100 courses',
    check: (user) => { const c = JSON.parse(user.played_courses || '[]'); return c.length >= 5; } },
  { id: 'top100_ten', name: 'Globetrotter', description: 'Played 10 Top 100 courses',
    check: (user) => { const c = JSON.parse(user.played_courses || '[]'); return c.length >= 10; } },
  { id: 'tipped', name: 'Respected', description: 'Received your first Tip of the Cap',
    check: (user, roundCount, rounds, tipCount) => tipCount >= 1 },
  { id: 'best_round', name: 'Personal Best', description: 'Beat your previous best score',
    check: (user, roundCount, rounds) => {
      if (rounds.length < 2) return false;
      const scores = rounds.map(r => r.score);
      const best = Math.min(...scores);
      return scores.indexOf(best) > 0; // Best isn't the first round
    }
  },
];

// POST /api/badges - check and award badges for current user
export async function onRequestPost({ request, env }) {
  const { user, response } = await requireAuth(request, env.DB, env);
  if (response) return response;

  const db = env.DB;

  // Get user's rounds
  const { results: rounds } = await db.prepare(
    'SELECT * FROM rounds WHERE user_id = ? ORDER BY created_at ASC'
  ).bind(user.id).all();

  // Get tip count for user's card
  let tipCount = 0;
  if (user.card_id) {
    const card = await db.prepare('SELECT tips FROM cards WHERE id = ?').bind(user.card_id).first();
    if (card) tipCount = card.tips || 0;
  }

  const currentBadges = JSON.parse(user.unlocked_badges || '[]');
  const newlyUnlocked = [];

  for (const badge of BADGES) {
    if (currentBadges.includes(badge.id)) continue;
    if (badge.check(user, rounds.length, rounds, tipCount)) {
      currentBadges.push(badge.id);
      newlyUnlocked.push({ id: badge.id, name: badge.name, description: badge.description });
    }
  }

  if (newlyUnlocked.length > 0) {
    // Save updated badges
    await db.prepare('UPDATE users SET unlocked_badges = ? WHERE id = ?')
      .bind(JSON.stringify(currentBadges), user.id).run();

    // Award XP and feed for each
    for (const badge of newlyUnlocked) {
      await awardXP(db, user.id, 50);
      await addFeedItem(db, 'badge_unlocked', user.id, user.name, { badgeName: badge.name, badgeId: badge.id });
    }
  }

  return json({
    badges: currentBadges,
    newlyUnlocked,
    total: BADGES.length,
  });
}

// GET /api/badges - get badge definitions and user progress
export async function onRequestGet({ request, env }) {
  const { user, response } = await requireAuth(request, env.DB, env);
  if (response) return response;

  const userBadges = JSON.parse(user.unlocked_badges || '[]');

  return json({
    badges: BADGES.map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
      unlocked: userBadges.includes(b.id),
    })),
    unlocked: userBadges.length,
    total: BADGES.length,
  });
}
