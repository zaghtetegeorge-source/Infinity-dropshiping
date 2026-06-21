import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";

const productSchema = z.object({
  slug: z.string().min(2),
  titleEn: z.string().min(1),
  titleAr: z.string().min(1),
  descriptionEn: z.string().default(""),
  descriptionAr: z.string().default(""),
  brand: z.string().default("Infinity Store"),
  gtin: z.string().optional().nullable(),
  mpn: z.string().optional().nullable(),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0).default(100),
  videoUrl: z.string().url().optional().nullable(),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
  metaTitleEn: z.string().optional().nullable(),
  metaTitleAr: z.string().optional().nullable(),
  metaDescEn: z.string().optional().nullable(),
  metaDescAr: z.string().optional().nullable(),
  images: z.array(z.object({ url: z.string().url(), alt: z.string().default("") })).default([]),
  variants: z
    .array(
      z.object({
        nameEn: z.string(),
        nameAr: z.string(),
        sku: z.string(),
        priceDelta: z.number().default(0),
        stock: z.number().int().default(100),
      })
    )
    .default([]),
});

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    include: { images: true, category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = productSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { images, variants, ...data } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...data,
      images: { create: images.map((img, i) => ({ ...img, position: i })) },
      variants: { create: variants },
    },
    include: { images: true, variants: true },
  });

  return NextResponse.json({ product }, { status: 201 });
}
