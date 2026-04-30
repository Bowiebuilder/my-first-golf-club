// ============================================
// SHARED API HELPERS
// Prefixed with _ so Pages doesn't route to it
// ============================================

// --- Response helpers ---
export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function error(message, status = 400) {
  return json({ error: message }, status);
}

// --- Password hashing (using Web Crypto API) ---
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  // Add a static salt prefix (in production, use per-user salts)
  const data = encoder.encode('mfgc_salt_' + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password, hash) {
  const computed = await hashPassword(password);
  return computed === hash;
}

// --- Session token generation ---
export function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- Auth middleware: extract user from session token ---
export async function getAuthUser(request, db) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/mfgc_session=([a-f0-9]+)/);
  if (!match) return null;

  const token = match[1];
  const session = await db.prepare(
    "SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime('now')"
  ).bind(token).first();

  if (!session) return null;

  const user = await db.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).bind(session.user_id).first();

  return user || null;
}

// --- Require auth (returns user or error response) ---
export async function requireAuth(request, db) {
  const user = await getAuthUser(request, db);
  if (!user) return { user: null, response: error('Not authenticated', 401) };
  return { user, response: null };
}

// --- Session cookie helper ---
export function sessionCookie(token, maxAge = 60 * 60 * 24 * 30) {
  return `mfgc_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookie() {
  return 'mfgc_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
}

// --- Generate unique ID ---
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// --- Parse JSON body safely ---
export async function parseBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// --- XP level calculation ---
const LEVELS = [
  { name: 'Starter', minXP: 0 },
  { name: 'Weekend Warrior', minXP: 200 },
  { name: 'Club Regular', minXP: 500 },
  { name: 'Single Digit', minXP: 1000 },
  { name: 'Scratch Player', minXP: 2000 },
  { name: 'Tour Card', minXP: 5000 },
];

export function getLevel(xp) {
  let lvl = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXP) lvl = l;
  }
  return lvl.name;
}

// --- Add XP to user and return new level ---
export async function awardXP(db, userId, amount) {
  const user = await db.prepare('SELECT xp FROM users WHERE id = ?').bind(userId).first();
  if (!user) return null;

  const newXP = (user.xp || 0) + amount;
  const newLevel = getLevel(newXP);

  await db.prepare('UPDATE users SET xp = ?, level = ? WHERE id = ?')
    .bind(newXP, newLevel, userId)
    .run();

  return { xp: newXP, level: newLevel, awarded: amount };
}

// --- Add feed item ---
export async function addFeedItem(db, type, userId, userName, data = {}) {
  await db.prepare(
    'INSERT INTO feed (type, user_id, user_name, data) VALUES (?, ?, ?, ?)'
  ).bind(type, userId, userName, JSON.stringify(data)).run();
}
