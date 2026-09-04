# Electrostore — Admin Access & Editing Guide

## 1. How to open the admin panel

- **Live site:** https://electrostore-seven.vercel.app/admin
- **Local (your PC):** http://localhost:3000/admin (run `npm run dev` in `D:\electrostore` first)

The public shop never links to the admin — `/admin` is the only door.

## 2. Login credentials

| Field | Value |
|---|---|
| URL | `/admin` (links above) |
| Email / username | `admin@electrostore.com.au` |
| Password | `ChangeMe123!` |
| Role | Super Admin (full access) |

Type the email and password, press **Sign In**. You land on the **Dashboard**
(revenue, orders, products, stock alerts). Use **Logout** from My Account or any
admin page when finished. Five wrong attempts in a row locks logins for 15 minutes.

> Change the password after first login (local DB: edit the user in Prisma Studio
> `npm run db:studio`, or add a password-change flow before handing to staff).

## 3. Updating photos (3 places)

### A. Media Library — `/admin/media`
- **Upload:** choose a file → Upload (JPG/PNG/WebP/AVIF/SVG/GIF/MP4, max 25MB).
- **Add by URL link:** paste any `https://…` image link + optional name → Add URL.
  Unreachable links are rejected with an error.
- **Rename:** Rename → edit → Save.
- **Copy URL:** copies the direct link for use anywhere.
- **Delete with warnings:** Delete first checks every product, category, brand,
  setting and homepage block using the file. If it is in use you see:
  `⚠ Used in N places: Product: …; Category: …` with **Delete anyway** / **Keep**.
  Nothing is ever silently removed.

### B. Product photos — `/admin/products` → Edit
- The **Photos** panel lists every photo. The first is the **Primary** (card + gallery).
- **Upload photo**, **Add URL**, edit **alt text** (Save), **Delete** (two-step
  confirm; the last remaining photo cannot be deleted — add a replacement first).

### C. Hero images — `/admin/homepage/hero`
- Paste a **URL link** or **Upload** for Image 1 / Image 2, edit badge, headline,
  copy and both buttons → **Publish hero**. Live on the homepage immediately.

## 4. Names, logo & fonts (no code)

**`/admin/settings`:**
- **Store name & announcements** — store name (header, footer, copyright),
  tagline, announcement-bar text, free-shipping threshold.
- **Logo Manager** — main logo, light-on-dark logo, favicon: paste a URL or
  upload; live preview shown under each field.
- **Theme** — **font** (Inter / System UI / Georgia / Verdana / Trebuchet MS)
  plus primary, secondary, accent, header, footer, button, link, sale-badge and
  announcement colours. **Save settings** applies instantly.

**`/admin/homepage/hero`** — hero copy + images (above).
**`/admin/navigation`** — announcement bar, menus, mega-menu, footer links.
**`/admin/pages`** — About, Shipping, Returns, Warranty, Privacy, Terms, FAQs.

## 5. Catalogue editing

- **Products** (`/admin/products`): Create Product, full edit, archive/restore,
  search by title or SKU.
- **Categories** (`/admin/categories`), **Brands** (`/admin/brands`),
  **Inventory** (`/admin/inventory`, every change is logged),
  **Coupons** (`/admin/coupons`, e.g. `WELCOME10`), **Orders** (status, tracking,
  refunds with timeline), **Reviews** (approve/reject), **Returns**, **Reports**,
  **Users & Roles**, **Audit Log** (who changed what, with before/after values).

## 6. Important: live preview vs local

- **Local (`npm run dev`): everything saves** — uploads, deletes, edits, orders.
- **Live preview site:** browsing, search and filters are fully live, and you can
  **log in** and explore the whole admin, but **saves/uploads are disabled**
  (serverless hosting has no writable disk). Write actions show a clear
  read-only message instead of failing silently.
- **To unlock full online editing + checkout:** connect a Postgres database
  (free Neon/Supabase/Vercel Postgres), set it as `DATABASE_URL`, redeploy —
  no code changes needed. Sign-ups and checkout activate with it.
