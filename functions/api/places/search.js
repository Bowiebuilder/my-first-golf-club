// ============================================
// GET /api/places/search?q=...&country=US&type=course
// Edge proxy for Mapbox geocoding.
// Keeps the public token off the static HTML so we can rotate it,
// and biases results toward golf courses when type=course.
// ============================================

import { json, error } from '../_helpers.js';

// Simple in-memory rate limit (per Worker isolate)
const RL = new Map();
const RL_WINDOW_MS = 60 * 1000;
const RL_MAX = 60; // 60 requests / minute / IP

function rateLimit(ip) {
  const now = Date.now();
  let bucket = RL.get(ip);
  if (!bucket || now - bucket.start > RL_WINDOW_MS) {
    bucket = { start: now, count: 0 };
    RL.set(ip, bucket);
  }
  bucket.count += 1;
  return bucket.count <= RL_MAX;
}

// ISO-3166-1 alpha-2 country code lookup from a country name (small subset; expand as needed)
const COUNTRY_NAME_TO_CODE = {
  'united states': 'us', 'usa': 'us', 'america': 'us',
  'united kingdom': 'gb', 'uk': 'gb', 'england': 'gb', 'scotland': 'gb', 'wales': 'gb',
  'ireland': 'ie',
  'south africa': 'za',
  'australia': 'au', 'new zealand': 'nz',
  'canada': 'ca',
  'japan': 'jp', 'south korea': 'kr', 'korea': 'kr',
  'germany': 'de', 'france': 'fr', 'italy': 'it', 'spain': 'es', 'portugal': 'pt',
  'netherlands': 'nl', 'belgium': 'be',
  'sweden': 'se', 'norway': 'no', 'denmark': 'dk', 'finland': 'fi',
  'switzerland': 'ch', 'austria': 'at',
  'poland': 'pl', 'czechia': 'cz', 'czech republic': 'cz', 'hungary': 'hu',
  'greece': 'gr', 'turkey': 'tr', 'türkiye': 'tr',
  'israel': 'il', 'united arab emirates': 'ae', 'uae': 'ae', 'saudi arabia': 'sa',
  'india': 'in', 'china': 'cn', 'thailand': 'th', 'singapore': 'sg',
  'malaysia': 'my', 'philippines': 'ph', 'indonesia': 'id', 'vietnam': 'vn',
  'hong kong': 'hk', 'taiwan': 'tw',
  'argentina': 'ar', 'brazil': 'br', 'mexico': 'mx', 'chile': 'cl',
  'colombia': 'co', 'peru': 'pe',
  'kenya': 'ke', 'egypt': 'eg', 'morocco': 'ma', 'nigeria': 'ng'
};

function normalizeCountry(value) {
  if (!value) return '';
  const v = String(value).trim().toLowerCase();
  if (v.length === 2) return v; // already a code
  return COUNTRY_NAME_TO_CODE[v] || '';
}

export async function onRequestGet({ request, env }) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (!rateLimit(ip)) return error('Rate limited', 429);

  if (!env.MAPBOX_TOKEN) {
    return error('Search not configured', 503);
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  const countryRaw = url.searchParams.get('country') || '';
  const type = url.searchParams.get('type') || 'place'; // "course" biases toward golf courses
  const limit = Math.min(parseInt(url.searchParams.get('limit')) || 6, 10);

  if (q.length < 2) return json({ results: [] });

  const country = normalizeCountry(countryRaw);

  // Build Mapbox geocoding URL
  const params = new URLSearchParams({
    access_token: env.MAPBOX_TOKEN,
    autocomplete: 'true',
    limit: String(limit),
    language: 'en'
  });
  if (country) params.set('country', country);

  // For courses, don't over-restrict — Mapbox's POI DB is incomplete for golf.
  // We let any place type through and re-rank in code so we get hits like
  // "St Andrews" + "St Andrews Links" rather than nothing.
  if (type === 'course') {
    params.set('types', 'poi,place,locality,neighborhood,address');
  }

  const mbUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
    encodeURIComponent(q) + '.json?' + params.toString();

  let upstream;
  try {
    upstream = await fetch(mbUrl, {
      cf: { cacheTtl: 300, cacheEverything: true }
    });
  } catch (e) {
    return error('Search upstream error', 502);
  }

  if (!upstream.ok) {
    return error('Search upstream error: ' + upstream.status, 502);
  }

  const data = await upstream.json();
  const features = Array.isArray(data.features) ? data.features : [];

  // Map to a small, stable shape
  const results = features.map(f => {
    const ctx = Array.isArray(f.context) ? f.context : [];
    const findCtx = (prefix) => {
      const m = ctx.find(c => typeof c.id === 'string' && c.id.startsWith(prefix));
      return m ? m.text : '';
    };
    return {
      id: f.id,
      name: f.text || f.place_name || '',
      placeName: f.place_name || '',
      lon: f.center && f.center[0],
      lat: f.center && f.center[1],
      country: findCtx('country'),
      countryCode: (f.properties && f.properties.short_code) ||
                   (ctx.find(c => c.id && c.id.startsWith('country')) || {}).short_code || '',
      city: findCtx('place'),
      region: findCtx('region'),
      category: (f.properties && f.properties.category) || '',
      type: (f.place_type && f.place_type[0]) || ''
    };
  });

  // For "course" type, prefer results that look golf-ish (best-effort)
  let final = results;
  if (type === 'course') {
    final = results.sort((a, b) => {
      const aGolf = /(golf|club|course|links)/i.test(a.name) ? 1 : 0;
      const bGolf = /(golf|club|course|links)/i.test(b.name) ? 1 : 0;
      return bGolf - aGolf;
    });
  }

  return json({ results: final });
}
