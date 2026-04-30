import { json } from '../_helpers.js';

// Signin is now handled by Clerk - this endpoint is deprecated
export async function onRequestPost({ request }) {
  return json({ message: 'Sign-in is handled by Clerk. Use the frontend sign-in flow.' }, 410);
}
