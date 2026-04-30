import { json, error, requireAuth, getAuthUser, parseBody, generateId, awardXP, addFeedItem } from './_helpers.js';

// GET /api/rounds - list rounds for current user
export async function onRequestGet({ request, env }) {
  const { user, response } = await requireAuth(request, env.DB);
  if (response) return response;

  const db = env.DB;
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 200);

  const { results } = await db.prepare(
    'SELECT * FROM rounds WHERE user_id = ? ORDER BY date DESC LIMIT ?'
  ).bind(user.id, limit).all();

  // Compute stats
  let best = null;
  let totalScore = 0;
  for (const r of results) {
    totalScore += r.score;
    if (!best || r.score < best.score) best = r;
  }

  return json({
    rounds: results,
    stats: {
      total: results.length,
      bestScore: best ? best.score : null,
      bestCourse: best ? best.course_name : null,
      avgScore: results.length > 0 ? Math.round(totalScore / results.length) : null,
    }
  });
}

// POST /api/rounds - log a new round
export async function onRequestPost({ request, env }) {
  const { user, response } = await requireAuth(request, env.DB);
  if (response) return response;

  const body = await parseBody(request);
  if (!body) return error('Invalid JSON body');

  const { courseName, date, score } = body;
  if (!courseName || !date || !score) return error('courseName, date, and score are required');

  const par = parseInt(body.par) || 72;
  const scoreInt = parseInt(score);
  if (isNaN(scoreInt) || scoreInt < 40 || scoreInt > 200) return error('Score must be between 40 and 200');

  const db = env.DB;
  const roundId = generateId();

  await db.prepare(
    'INSERT INTO rounds (id, user_id, course_name, date, score, par, conditions, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(roundId, user.id, courseName, date, scoreInt, par, body.conditions || null, body.notes || null).run();

  // Award XP
  let totalXP = 25;
  const xpResult = await awardXP(db, user.id, 25);

  // Feed item
  await addFeedItem(db, 'round_logged', user.id, user.name, { courseName, score: scoreInt, par });

  const round = await db.prepare('SELECT * FROM rounds WHERE id = ?').bind(roundId).first();

  return json({ round, xp: xpResult }, 201);
}
