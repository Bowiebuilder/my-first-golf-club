import { json } from '../_helpers.js';

// Signup is now handled by Clerk - this endpoint is deprecated
export async function onRequestPost({ request }) {
  return json({ message: 'Signup is handled by Clerk. Use the frontend sign-up flow.' }, 410);
}
