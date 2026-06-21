# Infinity Store

A bilingual (Arabic/English) dropshipping storefront built with Next.js, ready
for Meta, TikTok, and Google Ads — Stripe checkout with Apple Pay/Google Pay,
server + client conversion tracking, product catalog feeds, an admin
dashboard, and abandoned-cart recovery emails.

## Getting started

```bash
npm install
cp .env.example .env       # then fill in real values — see SETUP.md
npx prisma migrate deploy
npm run db:seed            # creates demo products + first admin login
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront and
[http://localhost:3000/admin/login](http://localhost:3000/admin/login) for
the admin dashboard (credentials are printed by `npm run db:seed`).

## Launching for real

See **[SETUP.md](./SETUP.md)** for the full checklist of business-account
steps (Stripe, Meta, TikTok, Google Merchant Center/Ads, Resend, cron
scheduling) needed to go live — no code changes required, only filling in
`.env`.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint the codebase
- `npm run db:seed` — seed demo categories/products + first admin user
