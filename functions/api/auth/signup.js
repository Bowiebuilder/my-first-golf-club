import { json, error, hashPassword, generateToken, sessionCookie, parseBody, awardXP, addFeedItem } from '../_helpers.js';

export async function onRequestPost({ request, env }) {
  const body = await parseBody(request);
  if (!body) return error('Invalid JSON body');

  const { name, email, password } = body;
  if (!name || !email || !password) return error('Name, email, and password are required');
  if (password.length < 6) return error('Password must be at least 6 characters');

  const db = env.DB;

  // Check if email exists
  const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) return error('An account with this email already exists', 409);

  // Hash password and create user
  const passwordHash = await hashPassword(password);
  const result = await db.prepare(
    'INSERT INTO users (email, name, password_hash, xp, level) VALUES (?, ?, ?, ?, ?)'
  ).bind(email, name, passwordHash, 100, 'Starter').run();

  const userId = result.meta.last_row_id;

  // Create session
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  await db.prepare(
    'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)'
  ).bind(token, userId, expiresAt).run();

  // Add feed item
  await addFeedItem(db, 'signup', userId, name, {});

  // Get created user
  const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();

  return new Response(JSON.stringify({
    user: sanitizeUser(user),
    xp: { awarded: 100, total: 100, level: 'Starter', reason: 'Joining the club' }
  }), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': sessionCookie(token),
    },
  });
}

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    xp: user.xp,
    level: user.level,
    card_id: user.card_id,
    played_courses: JSON.parse(user.played_courses || '[]'),
    unlocked_badges: JSON.parse(user.unlocked_badges || '[]'),
    created_at: user.created_at,
  };
}
