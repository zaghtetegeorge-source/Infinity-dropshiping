import Stripe from "stripe";
import { stripeConfig } from "@/lib/env";

// Apple Pay & Google Pay need no extra domain registration when using
// Stripe Checkout (hosted page) — Stripe auto-detects the wallet and
// verifies the domain itself, which is why Checkout (not a custom Payment
// Element form) is used for `/checkout`.
export const stripe = new Stripe(stripeConfig.secretKey || "sk_test_placeholder", {
  apiVersion: "2026-05-27.dahlia",
});
