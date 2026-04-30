import { json, error, requireAuth, parseBody, awardXP, addFeedItem } from './_helpers.js';

// POST /api/tips - tip your cap to a card
export async function onRequestPost({ request, env }) {
  const { user, response } = await requireAuth(request, env.DB);
  if (response) return response;

  const body = await parseBody(request);
  if (!body || !body.cardId) return error('cardId is required');

  const db = env.DB;
  const card = await db.prepare('SELECT * FROM cards WHERE id = ?').bind(body.cardId).first();
  if (!card) return error('Card not found', 404);

  // Increment tips
  await db.prepare('UPDATE cards SET tips = tips + 1 WHERE id = ?').bind(body.cardId).run();

  // Award XP to card owner (not the tipper)
  if (card.user_id) {
    await awardXP(db, card.user_id, 10);
  }

  // Feed item
  await addFeedItem(db, 'tip', user.id, user.name, { targetName: card.name, cardId: body.cardId });

  return json({ tips: (card.tips || 0) + 1 });
}
