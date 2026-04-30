import { json, error, getAuthUser, clearSessionCookie } from '../_helpers.js';

// GET /api/auth/me - get current user
export async function onRequestGet({ request, env }) {
  const user = await getAuthUser(request, env.DB);
  if (!user) return error('Not authenticated', 401);

  return json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      xp: user.xp,
      level: user.level,
      card_id: user.card_id,
      played_courses: JSON.parse(user.played_courses || '[]'),
      unlocked_badges: JSON.parse(user.unlocked_badges || '[]'),
      created_at: user.created_at,
    }
  });
}

// DELETE /api/auth/me - sign out
export async function onRequestDelete({ request, env }) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/mfgc_session=([a-f0-9]+)/);
  if (match) {
    await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(match[1]).run();
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearSessionCookie(),
    },
  });
}
