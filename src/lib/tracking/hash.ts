import crypto from "crypto";

// Meta Conversions API & TikTok Events API both require PII (email, phone)
// to be normalized and SHA-256 hashed before being sent server-side.
export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export function normalizeEmail(email?: string | null): string | undefined {
  if (!email) return undefined;
  return sha256(email);
}

export function normalizePhone(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  const digitsOnly = phone.replace(/[^\d]/g, "");
  return sha256(digitsOnly);
}
