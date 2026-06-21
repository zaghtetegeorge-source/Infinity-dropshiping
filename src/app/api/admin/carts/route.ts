import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const carts = await prisma.cart.findMany({
    where: { status: { in: ["CHECKOUT_STARTED", "ABANDONED"] } },
    include: { items: { include: { product: true } } },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ carts });
}
