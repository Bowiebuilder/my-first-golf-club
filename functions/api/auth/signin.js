import { json, error, verifyPassword, generateToken, sessionCookie, parseBody } from '../_helpers.js';

export async function onRequestPost({ request, env }) {
  const body = await parseBody(request);
  if (!body) return error('Invalid JSON body');

  const { email, password } = body;
  if (!email || !password) return error('Email and password are required');

  const db = env.DB;
  const user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  if (!user) return error('Invalid email or password', 401);

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return error('Invalid email or password', 401);

  // Create session
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  await db.prepare(
    'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)'
  ).bind(token, user.id, expiresAt).run();

  return new Response(JSON.stringify({
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
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': sessionCookie(token),
    },
  });
}
