# Launch Setup Guide

Everything in this codebase is already built and wired together — storefront,
cart, Stripe checkout (with Apple Pay / Google Pay), bilingual (AR/EN)
pages, admin dashboard, product feeds, server-side + client-side tracking,
abandoned-cart recovery emails, and SEO. The only work left is **filling in
your own business accounts' credentials** in `.env` and clicking through a
handful of dashboards. None of it requires touching code.

Copy `.env.example` to `.env` and work through the sections below in order.

```bash
cp .env.example .env
```

---

## 1. Database

SQLite is the default and is fine for launch:

```bash
DATABASE_URL="file:./dev.db"
```

Then run migrations and seed the demo catalog + first admin user:

```bash
npx prisma migrate deploy
npm run db:seed
```

`db:seed` prints the admin login it created (default
`admin@infinitystore.com` / `ChangeMe123!` unless you set `ADMIN_SEED_EMAIL`
/ `ADMIN_SEED_PASSWORD` first). **Log in and change the password immediately
after launch.** The seed also re-creates demo categories/products every time
it runs — replace them with real products from `/admin/products` before
going live, or just edit the demo ones in place.

If you outgrow SQLite, point `DATABASE_URL` at Postgres/MySQL and change the
`provider` in `prisma/schema.prisma`'s `datasource` block, then re-run
`npx prisma migrate deploy`.

---

## 2. Site basics

```bash
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"   # real production domain, no trailing slash
NEXT_PUBLIC_DEFAULT_CURRENCY="AED"               # AED, SAR, or USD
NEXT_PUBLIC_WHATSAPP_NUMBER="9715XXXXXXXX"       # international format, no + or spaces
```

`NEXT_PUBLIC_SITE_URL` feeds the sitemap, JSON-LD, Stripe redirect URLs, and
every tracking event's `sourceUrl` — get this right before launch. The
WhatsApp button (bottom corner of every page) auto-hides until a number is
set.

---

## 3. Stripe — card payments + Apple Pay + Google Pay

1. Create/sign in to a [Stripe](https://dashboard.stripe.com) account and
   complete business verification (required before you can accept live
   payments).
2. **Dashboard → Developers → API keys** — copy the publishable and secret
   keys into:
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
   STRIPE_SECRET_KEY="sk_..."
   ```
3. **Webhook** — the order is only marked `PAID` (stock decremented, Purchase
   event fired) when Stripe calls `POST /api/checkout/webhook`.
   - In dev: run `stripe listen --forward-to localhost:3000/api/checkout/webhook`
     and copy the `whsec_...` it prints.
   - In production: **Dashboard → Developers → Webhooks → Add endpoint**,
     URL = `https://yourdomain.com/api/checkout/webhook`, event =
     `checkout.session.completed`. Copy its signing secret.
   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```
4. **Apple Pay / Google Pay** — both ride on Stripe Checkout's hosted page
   and need zero code changes. Apple Pay requires one extra step: **Dashboard
   → Settings → Payment methods → Apple Pay → Add a new domain**, enter
   `yourdomain.com`. Google Pay has no domain-verification step. Both
   buttons appear automatically for eligible buyers/devices once the keys
   above are set and the domain is verified.

Stripe Checkout's hosted page has no Arabic locale option (confirmed in
Stripe's SDK types) — Arabic shoppers get the browser auto-detected locale
instead of a forced one; this is expected, not a bug.

---

## 4. Meta (Facebook/Instagram) — Pixel, Conversions API, Catalog

1. **[Meta Events Manager](https://business.facebook.com/events_manager)**
   → connect a Pixel (or create one) → copy the Pixel ID:
   ```bash
   NEXT_PUBLIC_META_PIXEL_ID="..."
   ```
2. **Events Manager → your Pixel → Settings → Conversions API → Generate
   access token**:
   ```bash
   META_CONVERSIONS_API_TOKEN="..."
   ```
   This powers server-side `Purchase` events fired from the Stripe webhook
   (`src/app/api/checkout/webhook/route.ts`) — they land reliably even if a
   buyer closes the tab right after paying, which the browser pixel alone
   can't guarantee. Client-side `PageView` / `ViewContent` / `AddToCart` /
   `InitiateCheckout` / `Purchase` fire alongside it for Meta's deduplication
   (same `eventId` is sent both ways).
3. To verify events while testing: Events Manager → Test Events tab → copy
   the test code into `META_TEST_EVENT_CODE`, place a test order, confirm
   events appear, then **remove this variable before launch**.
4. **[Commerce Manager](https://business.facebook.com/commerce)** → create a
   catalog → copy its ID:
   ```bash
   META_CATALOG_ID="..."
   ```
   Then **Catalog → Data Sources → Add Items → Scheduled feed**, paste:
   ```
   https://yourdomain.com/api/feed/meta?token=YOUR_FEED_ACCESS_TOKEN
   ```
   (see §8 for `FEED_ACCESS_TOKEN`). Set the fetch schedule to daily. This
   feed is what Catalog Sales / Advantage+ Shopping campaigns read from.

---

## 5. TikTok — Pixel, Events API, Catalog

1. **[TikTok Events Manager](https://ads.tiktok.com/i18n/events_manager)** →
   create a Pixel → copy its ID:
   ```bash
   NEXT_PUBLIC_TIKTOK_PIXEL_ID="..."
   ```
2. Same page → **Events API → Generate access token**:
   ```bash
   TIKTOK_EVENTS_API_TOKEN="..."
   ```
   Powers server-side `Purchase` events the same way as Meta CAPI above.
3. **Assets → Catalogs → Create catalog** → copy its ID:
   ```bash
   TIKTOK_CATALOG_ID="..."
   ```
   Then **Catalog → Data Feeds → Schedule a feed**, paste:
   ```
   https://yourdomain.com/api/feed/tiktok?token=YOUR_FEED_ACCESS_TOKEN
   ```
   This is a CSV feed (TikTok's catalog spec uses CSV, not XML) for Catalog
   Sales / Smart Performance campaigns.

---

## 6. Google — GA4, GTM, Merchant Center, Performance Max

1. **[Google Tag Manager](https://tagmanager.google.com)** → create a
   container → copy the `GTM-XXXXXXX` ID:
   ```bash
   NEXT_PUBLIC_GTM_ID="GTM-..."
   ```
2. **[GA4](https://analytics.google.com)** → create a property/data stream →
   copy the `G-XXXXXXX` measurement ID:
   ```bash
   NEXT_PUBLIC_GA4_MEASUREMENT_ID="G-..."
   ```
   Both GTM and gtag.js load automatically when these are set
   (`src/components/tracking/Trackers.tsx`); the `dataLayer` receives the
   same ViewContent/AddToCart/InitiateCheckout/Purchase events as Meta/TikTok
   so you can wire up GA4 ecommerce events or additional GTM tags without
   touching app code.
3. **[Google Merchant Center](https://merchants.google.com)** → Business
   info → verify & claim your domain → copy the Merchant Center ID:
   ```bash
   GOOGLE_MERCHANT_CENTER_ID="..."
   ```
   Then **Products → Feeds → Add feed → Scheduled fetch**, paste:
   ```
   https://yourdomain.com/api/feed/google?token=YOUR_FEED_ACCESS_TOKEN
   ```
   (XML/RSS feed per Google's product feed spec.)
4. **Performance Max**: in Google Ads, create a Performance Max campaign and
   link the Merchant Center account above — the synced catalog feeds the
   campaign automatically. No further app changes needed.

---

## 7. Email — order confirmations & abandoned-cart recovery

1. **[Resend](https://resend.com)** → add & verify your sending domain (DNS
   records they give you) → create an API key:
   ```bash
   RESEND_API_KEY="re_..."
   EMAIL_FROM="orders@yourdomain.com"   # must be on the verified domain
   ```
2. **Abandoned cart recovery** is a cron-triggered endpoint, not a background
   worker — `GET /api/cron/abandoned-cart` finds carts with an email that
   stalled at checkout for over an hour, emails a recovery link, and stops
   after 3 reminders per cart. Schedule it to run hourly with any external
   scheduler, for example:
   - **Vercel Cron** (if deploying on Vercel) — add to `vercel.json`:
     ```json
     { "crons": [{ "path": "/api/cron/abandoned-cart", "schedule": "0 * * * *" }] }
     ```
     Vercel signs cron requests automatically; the route additionally checks
     `Authorization: Bearer ${CRON_SECRET}`, so also add `CRON_SECRET` as a
     Vercel env var and a matching header isn't needed for Vercel's own
     cron caller — only for any *other* scheduler.
   - **Any other host** (cron-job.org, GitHub Actions cron, etc.) — call:
     ```
     GET https://yourdomain.com/api/cron/abandoned-cart
     Authorization: Bearer YOUR_CRON_SECRET
     ```
     hourly.
   ```bash
   CRON_SECRET="<openssl rand -hex 24>"
   ```

---

## 8. Admin dashboard & feed protection

```bash
ADMIN_JWT_SECRET="<openssl rand -base64 48>"   # signs admin session cookies — required
FEED_ACCESS_TOKEN="<openssl rand -hex 24>"      # appended as ?token=... to feed URLs above
```

Generate both with:

```bash
openssl rand -base64 48   # ADMIN_JWT_SECRET
openssl rand -hex 24      # FEED_ACCESS_TOKEN and CRON_SECRET
```

Log in at `/admin/login` with the credentials `npm run db:seed` printed.
From there you can manage products (images, video, variants, pricing,
SEO meta), view/manage orders, and see abandoned carts — no code changes
needed to run the store day-to-day.

If `FEED_ACCESS_TOKEN` is left blank, the feed endpoints stay public
(required for ad-platform crawlers anyway) — set it once you've registered
the feed URLs above so randoms can't scrape your catalog.

---

## 9. Pre-launch checklist

- [ ] Real `NEXT_PUBLIC_SITE_URL` (production domain, HTTPS)
- [ ] Stripe live keys + webhook configured + Apple Pay domain verified
- [ ] Meta Pixel + CAPI token + Catalog feed registered
- [ ] TikTok Pixel + Events API token + Catalog feed registered
- [ ] GA4 + GTM containers added
- [ ] Google Merchant Center domain verified + feed registered + Performance
      Max campaign linked
- [ ] Resend domain verified, `EMAIL_FROM` matches it
- [ ] Abandoned-cart cron scheduled hourly with `CRON_SECRET` set
- [ ] `ADMIN_JWT_SECRET` set to a real random value (not the dev default)
- [ ] Logged into `/admin`, changed the seeded admin password
- [ ] Replaced demo products in `/admin/products` with real catalog (or
      confirmed the demo ones are intentionally being used to start)
- [ ] `FEED_ACCESS_TOKEN` set once all three feeds are registered with it
