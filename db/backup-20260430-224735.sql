PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE submissions (   id TEXT PRIMARY KEY,   created_at TEXT NOT NULL DEFAULT (datetime('now')),   name TEXT NOT NULL,   last_initial TEXT,   city TEXT,   country TEXT NOT NULL,   course_name TEXT NOT NULL,   first_round_date TEXT,   story TEXT,   photo_key TEXT,   lat REAL,   lng REAL,   status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')) , homeCountry TEXT, startedYear TEXT);
INSERT INTO "submissions" ("id","created_at","name","last_initial","city","country","course_name","first_round_date","story","photo_key","lat","lng","status","homeCountry","startedYear") VALUES('e19f0fd5-2485-4781-b239-cc092e29f8bc','2025-10-09 19:35:13','Graham','T','Nairobi','Kenya','sdf','2020-06','jhkjnkjn','submissions/e19f0fd5-2485-4781-b239-cc092e29f8bc/IMG_5496.PNG',NULL,NULL,'pending',NULL,NULL);
INSERT INTO "submissions" ("id","created_at","name","last_initial","city","country","course_name","first_round_date","story","photo_key","lat","lng","status","homeCountry","startedYear") VALUES('fea1bfb9-0deb-43d9-b335-70072fe742e4','2025-10-09 20:02:54','Graham','T','Nairobi',' kenya','sad','','',NULL,NULL,NULL,'pending',NULL,NULL);
INSERT INTO "submissions" ("id","created_at","name","last_initial","city","country","course_name","first_round_date","story","photo_key","lat","lng","status","homeCountry","startedYear") VALUES('2f5b1b88-b02e-40c4-8734-ac632422fa2f','2025-10-09 21:28:38','Graham','T','Liphook','United Kingdom','Liphook golf club','2025-04','',NULL,54.7023545,-3.2765753,'pending',NULL,NULL);
INSERT INTO "submissions" ("id","created_at","name","last_initial","city","country","course_name","first_round_date","story","photo_key","lat","lng","status","homeCountry","startedYear") VALUES('6a20a9fa10b1d181a418202126777494','2025-10-09 23:04:51','Sam','B','St Andrews','United Kingdom','St Andrews Old Course',NULL,'First full round with dad!',NULL,56.3429,-2.8035,'approved','United Kingdom','2005');
INSERT INTO "submissions" ("id","created_at","name","last_initial","city","country","course_name","first_round_date","story","photo_key","lat","lng","status","homeCountry","startedYear") VALUES('9a7c7ac5-51e4-4198-bf21-09d4ec4116c1','2025-10-09 23:38:49','Graham','T','Liphook','United Kingdom','Liphook golf club',NULL,'Boys trip in South Africa.',NULL,51.5074456,-0.1277653,'approved','United Kingdom','2025');
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  xp INTEGER DEFAULT 0,
  level TEXT DEFAULT 'Starter',
  card_id TEXT,
  played_courses TEXT DEFAULT '[]',
  unlocked_badges TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now'))
, clerk_id TEXT);
INSERT INTO "users" ("id","email","name","password_hash","xp","level","card_id","played_courses","unlocked_badges","created_at","clerk_id") VALUES(1,'live@test.com','Live Test','4d6c3e178bd8d4f9ee5154ac3cc5a04cd2380faf68914c2e17ec3ab701b8d0ec',100,'Starter',NULL,'[]','[]','2026-04-30 19:22:36',NULL);
INSERT INTO "users" ("id","email","name","password_hash","xp","level","card_id","played_courses","unlocked_badges","created_at","clerk_id") VALUES(2,'grahamturnbullwork@gmail.com','Graham Turnbull','333511650eb82f661adb58e9a352ab52eb4ed24746892b69322931ddef984adf',100,'Starter',NULL,'[]','[]','2026-04-30 19:34:28',NULL);
INSERT INTO "users" ("id","email","name","password_hash","xp","level","card_id","played_courses","unlocked_badges","created_at","clerk_id") VALUES(3,'','Golfer','',250,'Weekend Warrior','molxv2dazytj','[]','["origin_story"]','2026-04-30 20:23:28','user_3D5n4UooN6Niks1lnHUTQlifibO');
CREATE TABLE cards (
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
  photo_url TEXT,
  org_type TEXT,
  signature_course TEXT,
  member_count TEXT,
  holes TEXT,
  founder TEXT,
  tips INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
INSERT INTO "cards" ("id","user_id","type","name","year_started","age_started","first_course","location","handicap","introduced_by","fav_club","story","card_color","photo_url","org_type","signature_course","member_count","holes","founder","tips","created_at") VALUES('molxv2dazytj',3,'player','Graham Turnbull',1997,12,'Highbury','South Africa','18','My Dad','Driver','kjakdaskjdn.askdjasd','green',NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-04-30 20:30:52');
CREATE TABLE rounds (
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
CREATE TABLE feed (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id),
  user_name TEXT,
  data TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now'))
);
INSERT INTO "feed" ("id","type","user_id","user_name","data","created_at") VALUES(1,'signup',1,'Live Test','{}','2026-04-30 19:22:36');
INSERT INTO "feed" ("id","type","user_id","user_name","data","created_at") VALUES(2,'signup',2,'Graham Turnbull','{}','2026-04-30 19:34:28');
INSERT INTO "feed" ("id","type","user_id","user_name","data","created_at") VALUES(3,'signup',3,'Golfer','{}','2026-04-30 20:23:28');
INSERT INTO "feed" ("id","type","user_id","user_name","data","created_at") VALUES(4,'card_created',3,'Golfer','{"cardType":"player","cardName":"Graham Turnbull"}','2026-04-30 20:30:52');
INSERT INTO "feed" ("id","type","user_id","user_name","data","created_at") VALUES(5,'badge_unlocked',3,'Golfer','{"badgeName":"Origin Story","badgeId":"origin_story"}','2026-04-30 20:30:54');
CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);
INSERT INTO "sessions" ("token","user_id","created_at","expires_at") VALUES('c9a228e77e72023d7ed37030b7cb07876694bf9ee0978fd4c838b1c8055952da',1,'2026-04-30 19:22:36','2026-05-30T19:22:36.768Z');
INSERT INTO "sessions" ("token","user_id","created_at","expires_at") VALUES('051ffdfef1ecfbf3e4a304abbf0be33137ca84d27da643991648a32c0ad9cd50',2,'2026-04-30 19:34:28','2026-05-30T19:34:28.529Z');
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('users',3);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('feed',5);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_country ON submissions(country);
CREATE INDEX idx_submissions_latlng ON submissions(lat, lng);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_cards_user ON cards(user_id);
CREATE INDEX idx_cards_type ON cards(type);
CREATE INDEX idx_rounds_user ON rounds(user_id);
CREATE INDEX idx_feed_created ON feed(created_at DESC);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_users_clerk ON users(clerk_id);
