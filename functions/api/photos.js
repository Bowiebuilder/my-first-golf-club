import { json, error, requireAuth, generateId } from './_helpers.js';

// POST /api/photos - upload a photo to R2
export async function onRequestPost({ request, env }) {
  const { user, response } = await requireAuth(request, env.DB, env);
  if (response) return response;

  const contentType = request.headers.get('Content-Type') || '';

  // Accept either multipart form or raw binary
  let imageData;
  let ext = 'jpg';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const file = formData.get('photo');
    if (!file) return error('No photo file provided');

    imageData = await file.arrayBuffer();
    const fileName = file.name || '';
    if (fileName.endsWith('.png')) ext = 'png';
    else if (fileName.endsWith('.webp')) ext = 'webp';
  } else {
    imageData = await request.arrayBuffer();
    if (contentType.includes('png')) ext = 'png';
    else if (contentType.includes('webp')) ext = 'webp';
  }

  if (!imageData || imageData.byteLength === 0) return error('Empty file');
  if (imageData.byteLength > 5 * 1024 * 1024) return error('File too large (max 5MB)');

  const key = 'photos/' + user.id + '/' + generateId() + '.' + ext;

  await env.PHOTOS.put(key, imageData, {
    httpMetadata: { contentType: 'image/' + ext },
  });

  // The public URL depends on your R2 custom domain or bucket config
  // For now return the key which can be served via a worker or custom domain
  const photoUrl = '/api/photos/' + key;

  return json({ photoUrl, key });
}

// GET /api/photos/photos/:userId/:filename - serve a photo from R2
export async function onRequestGet({ request, env, params }) {
  // Extract the path after /api/photos/
  const url = new URL(request.url);
  const key = url.pathname.replace('/api/photos/', '');

  if (!key) return error('No photo key', 404);

  const object = await env.PHOTOS.get(key);
  if (!object) return new Response('Not found', { status: 404 });

  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}
