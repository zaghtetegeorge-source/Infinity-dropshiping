"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ImageRow {
  url: string;
  alt: string;
}

interface VariantRow {
  nameEn: string;
  nameAr: string;
  sku: string;
  priceDelta: number;
  stock: number;
}

interface ProductFormValues {
  slug: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  brand: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  videoUrl: string;
  published: boolean;
  featured: boolean;
  categoryId: string;
  metaTitleEn: string;
  metaTitleAr: string;
  metaDescEn: string;
  metaDescAr: string;
  images: ImageRow[];
  variants: VariantRow[];
}

const EMPTY: ProductFormValues = {
  slug: "",
  titleEn: "",
  titleAr: "",
  descriptionEn: "",
  descriptionAr: "",
  brand: "Infinity Store",
  price: 0,
  compareAtPrice: null,
  stock: 100,
  videoUrl: "",
  published: true,
  featured: false,
  categoryId: "",
  metaTitleEn: "",
  metaTitleAr: "",
  metaDescEn: "",
  metaDescAr: "",
  images: [{ url: "", alt: "" }],
  variants: [],
};

const inputClass = "w-full rounded-lg border px-3 py-2 text-sm";

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

export function ProductForm({
  productId,
  initial,
  categories,
}: {
  productId?: string;
  initial?: Partial<ProductFormValues>;
  categories: { id: string; nameEn: string }[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>({ ...EMPTY, ...initial });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function updateImage(i: number, patch: Partial<ImageRow>) {
    setValues((v) => ({ ...v, images: v.images.map((img, idx) => (idx === i ? { ...img, ...patch } : img)) }));
  }
  function addImage() {
    setValues((v) => ({ ...v, images: [...v.images, { url: "", alt: "" }] }));
  }
  function removeImage(i: number) {
    setValues((v) => ({ ...v, images: v.images.filter((_, idx) => idx !== i) }));
  }

  function updateVariant(i: number, patch: Partial<VariantRow>) {
    setValues((v) => ({ ...v, variants: v.variants.map((row, idx) => (idx === i ? { ...row, ...patch } : row)) }));
  }
  function addVariant() {
    setValues((v) => ({
      ...v,
      variants: [...v.variants, { nameEn: "", nameAr: "", sku: "", priceDelta: 0, stock: 100 }],
    }));
  }
  function removeVariant(i: number) {
    setValues((v) => ({ ...v, variants: v.variants.filter((_, idx) => idx !== i) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      ...values,
      categoryId: values.categoryId || null,
      compareAtPrice: values.compareAtPrice || null,
      videoUrl: values.videoUrl || null,
      metaTitleEn: values.metaTitleEn || null,
      metaTitleAr: values.metaTitleAr || null,
      metaDescEn: values.metaDescEn || null,
      metaDescAr: values.metaDescAr || null,
      images: values.images.filter((img) => img.url.trim()),
      variants: values.variants.filter((row) => row.sku.trim()),
    };

    const res = await fetch(productId ? `/api/admin/products/${productId}` : "/api/admin/products", {
      method: productId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Failed to save product");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 font-bold">Basics</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug">
            <input className={inputClass} required value={values.slug} onChange={(e) => update("slug", e.target.value)} />
          </Field>
          <Field label="Brand">
            <input className={inputClass} value={values.brand} onChange={(e) => update("brand", e.target.value)} />
          </Field>
          <Field label="Title (English)">
            <input
              className={inputClass}
              required
              value={values.titleEn}
              onChange={(e) => update("titleEn", e.target.value)}
            />
          </Field>
          <Field label="Title (Arabic)">
            <input
              className={inputClass}
              required
              dir="rtl"
              value={values.titleAr}
              onChange={(e) => update("titleAr", e.target.value)}
            />
          </Field>
          <Field label="Description (English)" full>
            <textarea
              className={inputClass}
              rows={3}
              value={values.descriptionEn}
              onChange={(e) => update("descriptionEn", e.target.value)}
            />
          </Field>
          <Field label="Description (Arabic)" full>
            <textarea
              className={inputClass}
              rows={3}
              dir="rtl"
              value={values.descriptionAr}
              onChange={(e) => update("descriptionAr", e.target.value)}
            />
          </Field>
          <Field label="Category">
            <select className={inputClass} value={values.categoryId} onChange={(e) => update("categoryId", e.target.value)}>
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameEn}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Video URL">
            <input className={inputClass} value={values.videoUrl} onChange={(e) => update("videoUrl", e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 font-bold">Pricing & Stock</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Price (AED)">
            <input
              type="number"
              step="0.01"
              className={inputClass}
              required
              value={values.price}
              onChange={(e) => update("price", Number(e.target.value))}
            />
          </Field>
          <Field label="Compare-at price (AED)">
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={values.compareAtPrice ?? ""}
              onChange={(e) => update("compareAtPrice", e.target.value ? Number(e.target.value) : null)}
            />
          </Field>
          <Field label="Stock">
            <input
              type="number"
              className={inputClass}
              required
              value={values.stock}
              onChange={(e) => update("stock", Number(e.target.value))}
            />
          </Field>
        </div>
        <div className="mt-4 flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={values.published} onChange={(e) => update("published", e.target.checked)} />
            Published
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={values.featured} onChange={(e) => update("featured", e.target.checked)} />
            Featured
          </label>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Images</h2>
          <button type="button" onClick={addImage} className="text-sm font-medium text-brand hover:underline">
            + Add image
          </button>
        </div>
        <div className="space-y-3">
          {values.images.map((img, i) => (
            <div key={i} className="flex gap-2">
              <input
                className={inputClass}
                placeholder="Image URL"
                value={img.url}
                onChange={(e) => updateImage(i, { url: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Alt text"
                value={img.alt}
                onChange={(e) => updateImage(i, { alt: e.target.value })}
              />
              <button type="button" onClick={() => removeImage(i)} className="px-2 text-red-600">
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Variants</h2>
          <button type="button" onClick={addVariant} className="text-sm font-medium text-brand hover:underline">
            + Add variant
          </button>
        </div>
        <div className="space-y-3">
          {values.variants.map((row, i) => (
            <div key={i} className="grid grid-cols-5 gap-2">
              <input
                className={inputClass}
                placeholder="Name (EN)"
                value={row.nameEn}
                onChange={(e) => updateVariant(i, { nameEn: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Name (AR)"
                dir="rtl"
                value={row.nameAr}
                onChange={(e) => updateVariant(i, { nameAr: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="SKU"
                value={row.sku}
                onChange={(e) => updateVariant(i, { sku: e.target.value })}
              />
              <input
                type="number"
                className={inputClass}
                placeholder="Price delta"
                value={row.priceDelta}
                onChange={(e) => updateVariant(i, { priceDelta: Number(e.target.value) })}
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  className={inputClass}
                  placeholder="Stock"
                  value={row.stock}
                  onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })}
                />
                <button type="button" onClick={() => removeVariant(i)} className="px-2 text-red-600">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 font-bold">SEO (optional)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Meta title (EN)">
            <input className={inputClass} value={values.metaTitleEn} onChange={(e) => update("metaTitleEn", e.target.value)} />
          </Field>
          <Field label="Meta title (AR)">
            <input
              className={inputClass}
              dir="rtl"
              value={values.metaTitleAr}
              onChange={(e) => update("metaTitleAr", e.target.value)}
            />
          </Field>
          <Field label="Meta description (EN)">
            <textarea
              className={inputClass}
              rows={2}
              value={values.metaDescEn}
              onChange={(e) => update("metaDescEn", e.target.value)}
            />
          </Field>
          <Field label="Meta description (AR)">
            <textarea
              className={inputClass}
              rows={2}
              dir="rtl"
              value={values.metaDescAr}
              onChange={(e) => update("metaDescAr", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <button type="submit" disabled={saving} className="rounded-lg bg-black px-6 py-3 font-bold text-white disabled:opacity-50">
        {saving ? "Saving..." : productId ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}
