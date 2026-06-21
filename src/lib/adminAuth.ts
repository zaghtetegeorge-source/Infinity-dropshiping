import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { authConfig } from "@/lib/env";

const COOKIE_NAME = "admin_session";
const secretKey = new TextEncoder().encode(authConfig.jwtSecret);

export interface AdminSession {
  adminId: string;
  email: string;
  name: string;
}

export async function createAdminSessionToken(session: AdminSession): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyAdminSessionToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminSessionToken(token);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
