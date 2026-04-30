# Clerk + Cloudflare Setup

## Required Environment Variable

Set this in Cloudflare Pages → your project → Settings → Environment variables (Production AND Preview):

| Variable | Value | Notes |
|---|---|---|
| `CLERK_ISSUER` | `https://noted-sturgeon-84.clerk.accounts.dev` | Your Clerk Frontend API URL (no trailing slash). Replace with your prod instance when ready. |

That's the only one **strictly required** for JWT verification.

### Optional

| Variable | Value | Notes |
|---|---|---|
| `CLERK_JWKS_URL` | `https://noted-sturgeon-84.clerk.accounts.dev/.well-known/jwks.json` | Override JWKS URL. If not set, derived from `CLERK_ISSUER`. |
| `CLERK_SECRET_KEY` | `sk_test_...` | Only needed if you call Clerk's Backend API directly (not used for JWT verify). Store as a **secret**, not a plain env var. |

---

## How to set them

### Via Cloudflare dashboard (easiest)
1. Go to https://dash.cloudflare.com/
2. Pages → `my-first-golf-club` → Settings → Environment variables
3. Add `CLERK_ISSUER` for both Production and Preview
4. Redeploy (Deployments → Retry deployment)

### Via Wrangler CLI
```bash
# Plain env var
npx wrangler pages secret put CLERK_ISSUER --project-name my-first-golf-club

# Or for secret keys (encrypted)
npx wrangler pages secret put CLERK_SECRET_KEY --project-name my-first-golf-club
```

---

## Switching Clerk to Production

When `myfirstgolf.club` goes live:

1. **In Clerk dashboard**:
   - Create a Production instance (or promote your dev instance)
   - Add `myfirstgolf.club` and `www.myfirstgolf.club` to allowed origins
   - Configure social providers (Google, Apple, Facebook) for production

2. **Update `index.html`**:
   - Replace `pk_test_...` publishable key with `pk_live_...`
   - Update both `<script>` `src` URLs to point to your prod Clerk instance (not `noted-sturgeon-84.clerk.accounts.dev`)

3. **Update `CLERK_ISSUER` env var** in Cloudflare to the prod URL

---

## How the verification works

The backend now properly verifies every API request:

1. Extracts the Bearer token from the `Authorization` header
2. Decodes JWT header + payload
3. Validates `exp`, `nbf`, `iss` (with 30s clock skew)
4. Fetches Clerk's JWKS (cached 1 hour in-memory + edge cache)
5. Finds the public key by `kid`
6. Verifies the RSASSA-PKCS1-v1_5 signature using Web Crypto

If any step fails → request is unauthenticated.

This closes the security hole where forged JWTs could impersonate any user.
