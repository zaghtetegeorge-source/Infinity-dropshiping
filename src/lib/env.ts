// Central place that reads every integration credential from environment
// variables. Nothing here is hardcoded — see SETUP.md for where to obtain
// each value. Every integration degrades gracefully (silently disabled) when
// its env vars are missing, so the store still runs end-to-end before any
// marketing accounts are connected.
//
// This module is server-only (it holds secrets) — client components must
// import { siteConfig } from "@/lib/siteConfig" instead.

export { siteConfig } from "@/lib/siteConfig";

export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  secretKey: process.env.STRIPE_SECRET_KEY || "",
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
};

export const metaConfig = {
  pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
  accessToken: process.env.META_CONVERSIONS_API_TOKEN || "",
  testEventCode: process.env.META_TEST_EVENT_CODE || "",
  catalogId: process.env.META_CATALOG_ID || "",
};

export const tiktokConfig = {
  pixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "",
  accessToken: process.env.TIKTOK_EVENTS_API_TOKEN || "",
  catalogId: process.env.TIKTOK_CATALOG_ID || "",
};

export const googleConfig = {
  ga4MeasurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "",
  gtmContainerId: process.env.NEXT_PUBLIC_GTM_ID || "",
  merchantCenterId: process.env.GOOGLE_MERCHANT_CENTER_ID || "",
};

export const emailConfig = {
  resendApiKey: process.env.RESEND_API_KEY || "",
  fromAddress: process.env.EMAIL_FROM || "orders@example.com",
};

export const authConfig = {
  jwtSecret: process.env.ADMIN_JWT_SECRET || "dev-only-insecure-secret-change-me",
  feedSecret: process.env.FEED_ACCESS_TOKEN || "",
  cronSecret: process.env.CRON_SECRET || "",
  seedSecret: process.env.SEED_SECRET || "",
};
