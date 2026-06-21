import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const categories = await prisma.category.findMany({ orderBy: { nameEn: "asc" } });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug, nameEn, nameAr } = await req.json();
  const category = await prisma.category.create({ data: { slug, nameEn, nameAr } });
  return NextResponse.json({ category }, { status: 201 });
}
