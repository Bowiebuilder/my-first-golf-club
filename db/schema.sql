-- ============================================
-- MY FIRST GOLF CLUB - D1 DATABASE SCHEMA
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT DEFAULT '',
  clerk_id TEXT UNIQUE,
  xp INTEGER DEFAULT 0,
  level TEXT DEFAULT 'Starter',
  card_id TEXT,
  played_courses TEXT DEFAULT '[]',
  unlocked_badges TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_clerk ON users(clerk_id);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  type TEXT NOT NULL CHECK(type IN ('player', 'org')),
  name TEXT NOT NULL,
  year_started INTEGER,
  age_started INTEGER,
  first_course TEXT,
  location TEXT,
  handicap TEXT,
  introduced_by TEXT,
  fav_club TEXT,
  story TEXT,
  card_color TEXT DEFAULT 'green',
  border_style TEXT DEFAULT 'gold',
  photo_url TEXT,
  avatar_id TEXT,
  avatar_color TEXT,
  -- Player extras (added in migration 002)
  nationality TEXT,
  nationality_code TEXT,
  first_course_country TEXT,
  first_course_lat REAL,
  first_course_lon REAL,
  local_course TEXT,
  local_course_lat REAL,
  local_course_lon REAL,
  dream_partner TEXT,
  dream_course TEXT,
  social_instagram TEXT,
  social_x TEXT,
  social_facebook TEXT,
  social_linkedin TEXT,
  -- Org-only fields
  org_type TEXT,
  signature_course TEXT,
  member_count TEXT,
  holes TEXT,
  founder TEXT,
  tips INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cards_user ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(type);

-- Rounds table
CREATE TABLE IF NOT EXISTS rounds (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  course_name TEXT NOT NULL,
  date TEXT NOT NULL,
  score INTEGER NOT NULL,
  par INTEGER DEFAULT 72,
  conditions TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rounds_user ON rounds(user_id);

-- Activity feed table
CREATE TABLE IF NOT EXISTS feed (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id),
  user_name TEXT,
  data TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_feed_created ON feed(created_at DESC);

-- Sessions table (token-based auth)
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
