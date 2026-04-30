import { json, error, getAuthUser } from '../_helpers.js';

// GET /api/auth/me - get current user (syncs Clerk user to D1)
export async function onRequestGet({ request, env }) {
  const user = await getAuthUser(request, env.DB, env);
  if (!user) return error('Not authenticated', 401);

  return json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      xp: user.xp,
      level: user.level,
      card_id: user.card_id,
      clerk_id: user.clerk_id,
      played_courses: JSON.parse(user.played_courses || '[]'),
      unlocked_badges: JSON.parse(user.unlocked_badges || '[]'),
      created_at: user.created_at,
    }
  });
}
