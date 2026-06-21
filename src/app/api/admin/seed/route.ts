import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/env";
import { seedDatabase } from "@/lib/seedDatabase";

// One-time bootstrap for a freshly connected production database (no local
// DB access needed): creates the first admin login and the demo catalog.
// Trigger with `GET /api/admin/seed` + `Authorization: Bearer ${SEED_SECRET}`,
// or by visiting `/api/admin/seed?secret=${SEED_SECRET}` from a phone browser
// once after connecting a database — see SETUP.md "Database". Re-running it
// wipes and recreates the demo catalog, so don't call it again once real
// products/orders exist.
export async function GET(req: NextRequest) {
  if (!authConfig.seedSecret) {
    return NextResponse.json({ error: "SEED_SECRET not configured" }, { status: 400 });
  }
  const authHeader = req.headers.get("authorization");
  const secretParam = req.nextUrl.searchParams.get("secret");
  const authorized =
    authHeader === `Bearer ${authConfig.seedSecret}` || secretParam === authConfig.seedSecret;
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { adminEmail, productCount, categoryCount } = await seedDatabase(prisma);

  return NextResponse.json({
    seeded: true,
    adminEmail,
    productCount,
    categoryCount,
    note: "Admin password is whatever ADMIN_SEED_PASSWORD is set to (or the default) — log in at /admin/login and change it.",
  });
}
