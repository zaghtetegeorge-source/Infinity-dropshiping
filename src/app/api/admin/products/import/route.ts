import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";

// CSV cells are always strings, and blank cells come through as "" rather
// than missing keys — coerce those to undefined so optional/default schemas
// treat them as absent instead of as 0 / an invalid URL / `true`.
const blankToUndefined = (val: unknown) => (val === "" || val == null ? undefined : val);
const optionalNumber = (schema: z.ZodType<number>) => z.preprocess(blankToUndefined, schema.optional().nullable());
const optionalUrl = () => z.preprocess(blankToUndefined, z.string().url().optional());
const csvBoolean = (defaultValue: boolean) =>
  z.preprocess(blankToUndefined, z.boolean().or(z.string().transform((s) => ["true", "1", "yes"].includes(s.toLowerCase()))).default(defaultValue));

const rowSchema = z.object({
  slug: z.string().min(2),
  titleEn: z.string().min(1),
  titleAr: z.string().min(1),
  descriptionEn: z.string().optional().default(""),
  descriptionAr: z.string().optional().default(""),
  price: z.coerce.number().positive(),
  compareAtPrice: optionalNumber(z.coerce.number().positive()),
  stock: z.preprocess(blankToUndefined, z.coerce.number().int().min(0).optional().default(100)),
  categoryName: z.string().optional(),
  imageUrl1: optionalUrl(),
  imageUrl2: optionalUrl(),
  imageUrl3: optionalUrl(),
  published: csvBoolean(true),
  featured: csvBoolean(false),
});

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const rows = Array.isArray(body?.rows) ? body.rows : null;
  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }

  const categoryCache = new Map<string, string>();
  let created = 0;
  const failed: { row: number; error: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const parsed = rowSchema.safeParse(rows[i]);
    if (!parsed.success) {
      failed.push({ row: i + 1, error: parsed.error.issues.map((e) => e.message).join(", ") });
      continue;
    }
    const { categoryName, imageUrl1, imageUrl2, imageUrl3, ...data } = parsed.data;

    try {
      let categoryId: string | null = null;
      if (categoryName?.trim()) {
        const key = categoryName.trim().toLowerCase();
        categoryId = categoryCache.get(key) ?? null;
        if (!categoryId) {
          const slug = slugify(categoryName);
          const category = await prisma.category.upsert({
            where: { slug },
            update: {},
            create: { slug, nameEn: categoryName.trim(), nameAr: categoryName.trim() },
          });
          categoryId = category.id;
          categoryCache.set(key, categoryId);
        }
      }

      const images = [imageUrl1, imageUrl2, imageUrl3]
        .filter((url): url is string => Boolean(url))
        .map((url, position) => ({ url, alt: "", position }));

      await prisma.product.create({ data: { ...data, categoryId, images: { create: images } } });
      created++;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      failed.push({ row: i + 1, error: message.includes("Unique constraint") ? "Slug already exists" : message });
    }
  }

  return NextResponse.json({ created, failed });
}
