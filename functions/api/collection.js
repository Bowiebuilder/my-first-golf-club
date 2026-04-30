import { json, error, requireAuth, parseBody, awardXP, addFeedItem } from './_helpers.js';

// POST /api/collection - mark a course as played
export async function onRequestPost({ request, env }) {
  const { user, response } = await requireAuth(request, env.DB);
  if (response) return response;

  const body = await parseBody(request);
  if (!body || !body.courseName) return error('courseName is required');

  const db = env.DB;
  const courseName = body.courseName;

  // Parse current played courses
  let playedCourses = [];
  try { playedCourses = JSON.parse(user.played_courses || '[]'); } catch {}

  // Check if already played
  const alreadyPlayed = playedCourses.some(c => c.toLowerCase() === courseName.toLowerCase());
  if (alreadyPlayed) {
    return json({ message: 'Already marked as played', playedCourses });
  }

  // Add course
  playedCourses.push(courseName);
  await db.prepare('UPDATE users SET played_courses = ? WHERE id = ?')
    .bind(JSON.stringify(playedCourses), user.id).run();

  // Award XP
  const xpResult = await awardXP(db, user.id, 50);

  // Feed item
  await addFeedItem(db, 'course_played', user.id, user.name, { courseName });

  return json({ playedCourses, xp: xpResult });
}

// GET /api/collection - get user's played courses
export async function onRequestGet({ request, env }) {
  const { user, response } = await requireAuth(request, env.DB);
  if (response) return response;

  let playedCourses = [];
  try { playedCourses = JSON.parse(user.played_courses || '[]'); } catch {}

  return json({ playedCourses });
}
