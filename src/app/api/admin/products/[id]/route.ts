import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";

const updateSchema = z.object({
  slug: z.string().min(2).optional(),
  titleEn: z.string().min(1).optional(),
  titleAr: z.string().min(1).optional(),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  brand: z.string().optional(),
  gtin: z.string().optional().nullable(),
  mpn: z.string().optional().nullable(),
  price: z.number().positive().optional(),
  compareAtPrice: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0).optional(),
  videoUrl: z.string().url().optional().nullable(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  categoryId: z.string().optional().nullable(),
  metaTitleEn: z.string().optional().nullable(),
  metaTitleAr: z.string().optional().nullable(),
  metaDescEn: z.string().optional().nullable(),
  metaDescAr: z.string().optional().nullable(),
  images: z.array(z.object({ url: z.string().url(), alt: z.string().default("") })).optional(),
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
    .optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, variants: true, category: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { images, variants, ...data } = parsed.data;

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      ...(images
        ? { images: { deleteMany: {}, create: images.map((img, i) => ({ ...img, position: i })) } }
        : {}),
      ...(variants ? { variants: { deleteMany: {}, create: variants } } : {}),
    },
    include: { images: true, variants: true },
  });

  return NextResponse.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
