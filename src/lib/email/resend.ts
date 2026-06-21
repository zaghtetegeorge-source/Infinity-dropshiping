import { Resend } from "resend";
import { emailConfig } from "@/lib/env";

let client: Resend | null = null;

export function getResendClient(): Resend | null {
  if (!emailConfig.resendApiKey) return null;
  if (!client) client = new Resend(emailConfig.resendApiKey);
  return client;
}
