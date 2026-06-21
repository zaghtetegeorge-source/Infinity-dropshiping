import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const reviewSchema = z.object({
  productId: z.string(),
  authorName: z.string().min(2).max(60),
  rating: z.number().int().min(1).max(5),
  titleText: z.string().max(120).optional(),
  bodyText: z.string().min(2).max(2000),
});

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { productId, approved: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest) {
  const parsed = reviewSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const review = await prisma.review.create({ data: parsed.data });
  return NextResponse.json({ review }, { status: 201 });
}
