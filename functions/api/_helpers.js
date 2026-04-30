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
// Properly verifies a Clerk-issued JWT:
//   1. Parses header + payload
//   2. Validates exp / nbf / iss
//   3. Fetches Clerk's JWKS (cached) and finds the matching key by `kid`
//   4. Verifies the RS256 signature using Web Crypto

// In-memory JWKS cache (per Worker isolate). Cache for 1 hour.
const _jwksCache = { data: null, fetchedAt: 0 };
const JWKS_TTL_MS = 60 * 60 * 1000;

// Base64url -> Uint8Array
function b64urlToBytes(b64url) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(b64url.length / 4) * 4, '=');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// Base64url -> JSON
function b64urlToJson(b64url) {
  const bytes = b64urlToBytes(b64url);
  return JSON.parse(new TextDecoder().decode(bytes));
}

// Resolve the JWKS URL for this Clerk instance.
// Priority: env.CLERK_JWKS_URL > env.CLERK_ISSUER + "/.well-known/jwks.json" > derive from token issuer
function resolveJwksUrl(env, issuer) {
  if (env && env.CLERK_JWKS_URL) return env.CLERK_JWKS_URL;
  if (env && env.CLERK_ISSUER) return env.CLERK_ISSUER.replace(/\/+$/, '') + '/.well-known/jwks.json';
  if (issuer) return issuer.replace(/\/+$/, '') + '/.well-known/jwks.json';
  return null;
}

async function fetchJwks(jwksUrl) {
  const now = Date.now();
  if (_jwksCache.data && (now - _jwksCache.fetchedAt) < JWKS_TTL_MS) {
    return _jwksCache.data;
  }
  const res = await fetch(jwksUrl, { cf: { cacheTtl: 3600, cacheEverything: true } });
  if (!res.ok) throw new Error('Failed to fetch JWKS: ' + res.status);
  const jwks = await res.json();
  _jwksCache.data = jwks;
  _jwksCache.fetchedAt = now;
  return jwks;
}

async function importJwk(jwk) {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
}

async function verifyClerkToken(token, env) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  let header, payload;
  try {
    header = b64urlToJson(parts[0]);
    payload = b64urlToJson(parts[1]);
  } catch {
    return null;
  }

  // Algorithm must be RS256 (Clerk's default)
  if (header.alg !== 'RS256' || !header.kid) return null;

  const now = Math.floor(Date.now() / 1000);

  // exp / nbf / iat checks (with 30s clock skew)
  const skew = 30;
  if (payload.exp && payload.exp + skew < now) return null;
  if (payload.nbf && payload.nbf - skew > now) return null;

  // Issuer check (if configured)
  const expectedIssuer = env && env.CLERK_ISSUER ? env.CLERK_ISSUER.replace(/\/+$/, '') : null;
  if (expectedIssuer && payload.iss !== expectedIssuer) return null;

  // Issuer sanity: must look like a Clerk instance URL
  if (!payload.iss || !/^https:\/\/[^/]+/.test(payload.iss)) return null;

  // Fetch JWKS
  const jwksUrl = resolveJwksUrl(env, payload.iss);
  if (!jwksUrl) return null;

  let jwks;
  try {
    jwks = await fetchJwks(jwksUrl);
  } catch {
    return null;
  }

  const jwk = (jwks.keys || []).find(k => k.kid === header.kid);
  if (!jwk) {
    // Bust cache once in case keys rotated, retry
    _jwksCache.data = null;
    try {
      jwks = await fetchJwks(jwksUrl);
    } catch {
      return null;
    }
    const jwk2 = (jwks.keys || []).find(k => k.kid === header.kid);
    if (!jwk2) return null;
    return verifyWithJwk(parts, payload, jwk2);
  }

  return verifyWithJwk(parts, payload, jwk);
}

async function verifyWithJwk(parts, payload, jwk) {
  let key;
  try {
    key = await importJwk(jwk);
  } catch {
    return null;
  }

  const data = new TextEncoder().encode(parts[0] + '.' + parts[1]);
  const signature = b64urlToBytes(parts[2]);

  let valid = false;
  try {
    valid = await crypto.subtle.verify(
      { name: 'RSASSA-PKCS1-v1_5' },
      key,
      signature,
      data
    );
  } catch {
    return null;
  }

  if (!valid) return null;
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
    clerkPayload = await verifyClerkToken(token, env || {});
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
