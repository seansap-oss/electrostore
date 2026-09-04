# Electrostore — Technology • Appliances • Home • Everyday

Production-quality e-commerce platform. Next.js 14 App Router · TypeScript (strict) · Tailwind · Prisma (SQLite dev / PostgreSQL prod) · PWA · full admin CMS.

> **Powering Your Everyday.** Original Electrostore branding (electric yellow `#FFD600` + charcoal `#151515`). No third-party retailer assets.

## Quick start

```bash
npm install
cp .env.example .env   # set JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npx prisma db push
npm run db:seed        # ~90 products, categories, brands, coupons, homepage, navigation, pages, settings
npm run dev            # http://localhost:3000
```

Admin: `http://localhost:3000/admin` (seeded from `ADMIN_EMAIL` / `ADMIN_PASSWORD`).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Prisma generate + production build |
| `npm start` | Serve production build |
| `npm run db:push` | Sync Prisma schema to DB |
| `npm run db:seed` | Seed catalogue + CMS + admin |
| `npm run db:studio` | Visual DB browser |

## Architecture

- **Frontend** `src/app` — App Router storefront (`/`, `/search`, `/category/[slug]`, `/brand/[slug]`, `/product/[slug]`, `/cart`, `/checkout`, auth, `/account/*`, `/help`, `/contact`, `/page/[slug]`) + admin (`/admin/*`).
- **Backend services** `src/lib` — `db` (Prisma), `auth` (JWT sessions, throttling, RBAC), `pricing` (GST-inclusive AUD), `search` (typo-tolerant; swap for Meilisearch/Algolia without UI changes), `payments` (Stripe/PayPal/Apple/Google abstraction + webhook verification + idempotency), `storage` (local now, S3/Supabase later), `settings` (admin-controlled theme).
- **DB** `prisma/schema.prisma` — 40+ entities: users/roles/addresses, brands/categories/products/variants/images/attributes, warehouses/inventory/movements, carts/wishlists, coupons/promotions, orders/items/payments/shipments/returns/reviews, banners/homepage/navigation/media/pages/settings/notifications/audit/recently-viewed/price-alerts/tickets.
- **PWA** — `manifest.webmanifest`, service worker (`/sw.js`, offline fallback `/offline`), installable, safe-area + mobile bottom nav.
- **Capacitor-ready** — no blocking web APIs; deep-link/push/biometric hooks documented for Phase 2 (`/docs` notes in code).

## PostgreSQL (production)

```bash
# .env
DATABASE_URL="postgresql://user:pass@host:5432/electrostore"
```

Change `datasource db { provider = "postgresql" }` in `prisma/schema.prisma`, then `npx prisma migrate dev`.

## Deploy (Vercel)

1. Push repo, import into Vercel.
2. Set env vars (`DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_SITE_URL`, Stripe keys…).
3. Build command `npm run build`. Uploads move to Supabase/S3 via `STORAGE_PROVIDER` when configured.

## Admin coverage

Dashboard · Orders (timeline, tracking, refund) · Products (CRUD, duplicate-ready, CSV-ready) · Categories · Brands · Inventory (movements log, multi-warehouse) · Customers · Promotions · Coupons (`WELCOME10`, `FREESHIP99`) · Homepage builder · Hero manager (image + MP4) · Navigation · Media (validated uploads) · Reviews (moderation) · Returns · Pages · Reports · Settings (theme live, no code) · Users & Roles · Audit Log.

## QA checklist

- [ ] Register → verify → login → logout; admin login + role gate
- [ ] Browse → search (typo e.g. `coffe machne`) → filter (`?brand=samsung&price_max=1500&sort=price_asc`) → product → wishlist → cart → guest checkout → confirmation → track → return
- [ ] Admin: create product → upload photo → hero MP4 → banner → coupon → process + refund order
- [ ] Responsive 320 → 1920, no sideways scroll; Lighthouse targets documented in code
