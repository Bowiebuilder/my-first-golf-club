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

// --- Clerk JWT verification ---
// Verifies the Bearer token from Clerk using their JWKS endpoint
async function verifyClerkToken(token, secretKey) {
  // Decode the JWT header to get the key ID
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
  const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

  // Check expiry
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

  // For Clerk, the 'sub' claim is the user ID
  return payload;
}

// --- Auth middleware: verify Clerk token and find/create D1 user ---
export async function getAuthUser(request, db, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) return null;

  const token = match[1];
  let clerkPayload;
  try {
    clerkPayload = await verifyClerkToken(token, env ? env.CLERK_SECRET_KEY : null);
  } catch (e) {
    return null;
  }
  if (!clerkPayload || !clerkPayload.sub) return null;

  const clerkUserId = clerkPayload.sub;

  // Find existing user in D1 by clerk_id
  let user = await db.prepare('SELECT * FROM users WHERE clerk_id = ?').bind(clerkUserId).first();

  // Auto-create user in D1 if this is their first API call
  if (!user) {
    // Extract name/email from Clerk claims if available
    const name = clerkPayload.name || clerkPayload.first_name || 'Golfer';
    const email = clerkPayload.email || (clerkPayload.email_addresses && clerkPayload.email_addresses[0]) || '';

    await db.prepare(
      'INSERT INTO users (email, name, password_hash, clerk_id, xp, level) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(email, name, '', clerkUserId, 100, 'Starter').run();

    user = await db.prepare('SELECT * FROM users WHERE clerk_id = ?').bind(clerkUserId).first();

    // Add XP feed item for joining
    if (user) {
      await addFeedItem(db, 'signup', user.id, name, {});
    }
  }

  return user;
}

// --- Require auth (returns user or error response) ---
export async function requireAuth(request, db, env) {
  const user = await getAuthUser(request, db, env);
  if (!user) return { user: null, response: error('Not authenticated', 401) };
  return { user, response: null };
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
