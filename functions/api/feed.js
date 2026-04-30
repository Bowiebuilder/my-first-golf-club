import { json } from './_helpers.js';

// GET /api/feed - list recent activity (public)
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit')) || 15, 50);

  const { results } = await env.DB.prepare(
    'SELECT * FROM feed ORDER BY created_at DESC LIMIT ?'
  ).bind(limit).all();

  // Parse the JSON data field
  const items = results.map(item => ({
    ...item,
    data: JSON.parse(item.data || '{}'),
  }));

  return json({ feed: items });
}
