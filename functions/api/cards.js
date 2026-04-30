import { json, error, requireAuth, getAuthUser, parseBody, generateId, awardXP, addFeedItem } from './_helpers.js';

// GET /api/cards - list all cards (public)
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const db = env.DB;

  if (id) {
    const card = await db.prepare('SELECT * FROM cards WHERE id = ?').bind(id).first();
    if (!card) return error('Card not found', 404);
    return json({ card });
  }

  const type = url.searchParams.get('type');
  const search = url.searchParams.get('search');
  const sort = url.searchParams.get('sort') || 'newest';
  const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 100);
  const offset = parseInt(url.searchParams.get('offset')) || 0;

  let query = 'SELECT * FROM cards WHERE 1=1';
  const params = [];

  if (type && (type === 'player' || type === 'org')) {
    query += ' AND type = ?';
    params.push(type);
  }

  if (search) {
    query += ' AND (name LIKE ? OR location LIKE ? OR first_course LIKE ? OR story LIKE ? OR signature_course LIKE ?)';
    const s = '%' + search + '%';
    params.push(s, s, s, s, s);
  }

  switch (sort) {
    case 'oldest-start': query += ' ORDER BY year_started ASC'; break;
    case 'latest-start': query += ' ORDER BY year_started DESC'; break;
    case 'alpha': query += ' ORDER BY name ASC'; break;
    default: query += ' ORDER BY created_at DESC';
  }

  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const { results } = await db.prepare(query).bind(...params).all();

  // Get total count
  let countQuery = 'SELECT COUNT(*) as total FROM cards WHERE 1=1';
  const countParams = [];
  if (type && (type === 'player' || type === 'org')) {
    countQuery += ' AND type = ?';
    countParams.push(type);
  }
  if (search) {
    countQuery += ' AND (name LIKE ? OR location LIKE ? OR first_course LIKE ? OR story LIKE ? OR signature_course LIKE ?)';
    const s = '%' + search + '%';
    countParams.push(s, s, s, s, s);
  }
  const countResult = await db.prepare(countQuery).bind(...countParams).first();

  return json({ cards: results, total: countResult.total });
}

// POST /api/cards - create or update a card
export async function onRequestPost({ request, env }) {
  const { user, response } = await requireAuth(request, env.DB, env);
  if (response) return response;

  const body = await parseBody(request);
  if (!body) return error('Invalid JSON body');

  const { type, name, yearStarted, story, location } = body;
  if (!type || !name || !yearStarted || !story || !location) {
    return error('Missing required fields: type, name, yearStarted, story, location');
  }

  const db = env.DB;
  const isEdit = !!user.card_id;

  if (isEdit) {
    // Update existing card
    await db.prepare(`
      UPDATE cards SET
        type = ?, name = ?, year_started = ?, age_started = ?, first_course = ?,
        location = ?, handicap = ?, introduced_by = ?, fav_club = ?, story = ?,
        card_color = ?, photo_url = ?, org_type = ?, signature_course = ?,
        member_count = ?, holes = ?, founder = ?
      WHERE id = ?
    `).bind(
      type, name, yearStarted, body.ageStarted || null, body.firstCourse || null,
      location, body.handicap || null, body.introducedBy || null, body.favClub || null,
      story, body.cardColor || 'green', body.photoUrl || null, body.orgType || null,
      body.signatureCourse || null, body.memberCount || null, body.holes || null,
      body.founder || null, user.card_id
    ).run();

    const card = await db.prepare('SELECT * FROM cards WHERE id = ?').bind(user.card_id).first();
    return json({ card, updated: true });
  }

  // Create new card
  const cardId = generateId();
  await db.prepare(`
    INSERT INTO cards (id, user_id, type, name, year_started, age_started, first_course,
      location, handicap, introduced_by, fav_club, story, card_color, photo_url,
      org_type, signature_course, member_count, holes, founder)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    cardId, user.id, type, name, yearStarted, body.ageStarted || null,
    body.firstCourse || null, location, body.handicap || null,
    body.introducedBy || null, body.favClub || null, story,
    body.cardColor || 'green', body.photoUrl || null, body.orgType || null,
    body.signatureCourse || null, body.memberCount || null, body.holes || null,
    body.founder || null
  ).run();

  // Link card to user
  await db.prepare('UPDATE users SET card_id = ? WHERE id = ?').bind(cardId, user.id).run();

  // Award XP
  const xpResult = await awardXP(db, user.id, 100);

  // Feed item
  await addFeedItem(db, 'card_created', user.id, user.name, { cardType: type, cardName: name });

  const card = await db.prepare('SELECT * FROM cards WHERE id = ?').bind(cardId).first();
  return json({ card, xp: xpResult }, 201);
}
