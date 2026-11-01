# Proxima Marketplace

Three independent projects. Each one is installed and run on its own, in its own terminal.

| Folder | What it is | Port |
|---|---|---|
| `backend` | REST API: Express 5, Mongoose, MongoDB | 5000 |
| `frontend` | Storefront: Next.js 16, bilingual (English / বাংলা) | 3000 |
| `admin` | Admin panel: Vite + React | 5173 |

Requirements: Node.js 20.9 or newer, and pnpm.

## 1. Backend

```bash
cd backend
pnpm install
```

Fill in the empty values in `backend/.env`:

| Key | Notes |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string (required) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First admin account, created by the seed script |
| `R2_PRIVATE_BUCKET` | Optional. A bucket **without** public access for product zips. Falls back to `R2_BUCKET` |
| `SMTP_*`, `MAIL_FROM` | Optional. Without them, password-reset links are printed in the API log |
| `COOKIE_DOMAIN` | Leave empty. The storefront and admin call the API through their own domains, so cookies are already first-party |

Then:

```bash
pnpm seed      # indexes, admin user, categories, sample products, membership, coupon, settings, pages
pnpm r2:cors   # lets the admin at ADMIN_URL upload source zips straight to R2
pnpm dev       # http://localhost:5000/api/v1/health
```

The API refuses to start if a required variable is missing and lists what is wrong.

## 2. Storefront

```bash
cd frontend
pnpm install
pnpm dev    # http://localhost:3000
```

`frontend/.env.local` is already set for local development. `REVALIDATE_SECRET` must match the backend value, because the API uses it to refresh cached pages after admin changes.

## 3. Admin panel

```bash
cd admin
pnpm install
pnpm dev    # http://localhost:5173
```

Sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Uploads (Cloudflare R2)

- **Images** (JPG, PNG, WebP, AVIF, GIF, up to 10 MB) are resized to at most 1920 px wide and converted to WebP in the browser, then the API checks them and stores them in the public bucket. A 20 MB PNG screenshot typically uploads as about 0.5 MB.
- **Source zips** (up to 2 GB) go from the browser straight to `R2_PRIVATE_BUCKET` (or `R2_BUCKET` when that is empty) with a signed URL, so they never pass through the API. This needs a CORS rule on that bucket: run `pnpm r2:cors` in `backend`. It allows `ADMIN_URL`; add more origins as arguments, e.g. `pnpm r2:cors http://localhost:5173`. Use a private bucket in production.

## Payments

PayStation sandbox credentials are in `backend/.env`. `PAYSTATION_CALLBACK_URL` must point at `/api/v1/payments/callback` on the public API URL. Switch the base URL and credentials to live values before launch.

## Product delivery

- In admin, add each product's **GitHub link** and, optionally, a **source zip**.
- Buyers (and lifetime members) see them in **My Products**. Public pages never expose them.
- Repository permissions on GitHub are managed by the team.

## Deploying to Vercel

Each folder is its own Vercel project, with its settings in its `vercel.json`. Create three projects from the repository and set each one's **Root Directory**:

| Project | Root Directory | Runs as |
|---|---|---|
| API | `backend` | One Express function (`dist/app.js`) |
| Storefront | `frontend` | Next.js |
| Admin | `admin` | Static site; `/api/*` is proxied to the API |

pnpm 11 is pinned in each project's install command, so no extra Vercel setting is needed.

**1. Create the three projects first** so you know their domains. Then add the environment variables below and redeploy.

**2. API environment variables:** everything from `backend/.env`, with production values:

- `CLIENT_URL` and `ADMIN_URL`: the storefront and admin domains.
- `PAYSTATION_CALLBACK_URL`: the API domain followed by `/api/v1/payments/callback`.
- `COOKIE_DOMAIN`: leave empty.
- `R2_PRIVATE_BUCKET`: set it to a bucket without public access.
- `NODE_ENV`: no need to set it; Vercel uses `production`.

**3. Storefront environment variables:**

- `API_URL`: the API domain.
- `NEXT_PUBLIC_SITE_URL`: the storefront's public domain. It is used for canonical links, the sitemap and share images. Without it, the Vercel production domain is used.
- `NEXT_PUBLIC_R2_PUBLIC_URL`
- `REVALIDATE_SECRET`: the same value as the API.
- `NEXT_PUBLIC_ADMIN_URL`

The API must be live while the storefront builds.

**4. Admin:** the API address is the `/api/:path*` rewrite in `admin/vercel.json`. If the API moves to another domain, change it there. Environment variables:

- `VITE_STOREFRONT_URL`
- `VITE_API_URL`: leave unset, so calls stay on the admin domain.
- `VITE_API_PROXY`: not needed on Vercel; it is only for local development.

**5. One-time setup** from your machine, with `backend/.env` pointing at the production database and buckets:

```bash
cd backend
pnpm db:indexes   # production skips automatic index builds to keep cold starts fast (pnpm seed also runs this)
pnpm r2:cors      # allows zip uploads from the production ADMIN_URL
```

**Good to know**

- **Region:** functions run in `iad1` (Washington, D.C.), next to the MongoDB Atlas cluster in AWS us-east-1. Each database round trip is then about 1 ms instead of hundreds. If the database moves, change `regions` in `backend/vercel.json` and `frontend/vercel.json` to match.
- **Atlas network access:** Vercel functions have no fixed IP addresses, so Atlas must allow `0.0.0.0/0` (or use Vercel Secure Compute).
- **Request size:** Vercel functions accept request bodies of at most 4.5 MB. Images are compressed in the browser first, and zips skip the API entirely.
- **Rate limits:** limits are kept in memory per function instance, so they are approximate on Vercel.

## Other hosts

| Project | Commands |
|---|---|
| backend | `pnpm build` then `pnpm start` (runs `dist/server.js`) |
| frontend | `pnpm build` then `pnpm start` (the API must be running during the build) |
| admin | `pnpm build`, then serve `admin/dist` as a static site with SPA fallback to `index.html`. Proxy `/api/*` to the API on the same domain, as `admin/vercel.json` does |

## Shared code

`src/shared` (types, validation schemas, constants) is the same in all three projects. When you change an API contract, update all three copies.

In storefront code that runs in the browser (`'use client'` files and anything they import), import values from `@/shared/utils` or `@/shared/constants`, and only types from `@/shared`. A value import from the `@/shared` barrel ships every zod schema to the browser.
