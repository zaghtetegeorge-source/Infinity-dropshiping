"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass = "w-full rounded-lg border px-3 py-2 text-sm";

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

export function QuickAddProductForm({ categories }: { categories: { id: string; nameEn: string }[] }) {
  const router = useRouter();

  const [supplierUrl, setSupplierUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchMessage, setFetchMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  function applyTitleEn(value: string) {
    setTitleEn(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleFetch() {
    if (!supplierUrl.trim()) return;
    setFetching(true);
    setFetchMessage(null);
    try {
      const res = await fetch("/api/admin/products/fetch-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: supplierUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFetchMessage({ tone: "error", text: `${data.error ?? "Couldn't fetch that link."} You can still fill in the fields below yourself.` });
        return;
      }
      if (data.titleEn) applyTitleEn(data.titleEn);
      if (data.descriptionEn) setDescriptionEn(data.descriptionEn);
      if (data.imageUrl) setImageUrl(data.imageUrl);
      if (data.price) setPrice(String(data.price));
      setFetchMessage({
        tone: "success",
        text: "Pulled what we could from that link. Double-check the price and add the Arabic title/description below.",
      });
    } catch {
      setFetchMessage({ tone: "error", text: "Couldn't fetch that link. You can still fill in the fields below yourself." });
    } finally {
      setFetching(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError("");
    setSaving(true);

    const payload = {
      slug,
      titleEn,
      titleAr,
      descriptionEn,
      descriptionAr,
      price: Number(price),
      categoryId: categoryId || null,
      images: imageUrl.trim() ? [{ url: imageUrl.trim(), alt: "" }] : [],
    };

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setSaveError(typeof data.error === "string" ? data.error : "Failed to save product — check the fields above.");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-1 font-bold">1. Paste the supplier link</h2>
        <p className="mb-3 text-sm text-gray-500">
          Paste the AliExpress/Alibaba (or any) product page link and we&apos;ll try to pull the title, image and
          price for you.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className={inputClass}
            placeholder="https://www.aliexpress.com/item/..."
            value={supplierUrl}
            onChange={(e) => setSupplierUrl(e.target.value)}
          />
          <button
            type="button"
            onClick={handleFetch}
            disabled={fetching || !supplierUrl.trim()}
            className="shrink-0 rounded-lg bg-black px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            {fetching ? "Fetching..." : "Fetch details"}
          </button>
        </div>
        {fetchMessage ? (
          <p className={`mt-2 text-sm ${fetchMessage.tone === "success" ? "text-green-700" : "text-red-600"}`}>
            {fetchMessage.text}
          </p>
        ) : null}
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-xl border bg-white p-5">
          <h2 className="mb-4 font-bold">2. Check the details</h2>
          {saveError ? <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</p> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title (English)">
              <input className={inputClass} required value={titleEn} onChange={(e) => applyTitleEn(e.target.value)} />
            </Field>
            <Field label="Title (Arabic) — type this yourself">
              <input
                className={inputClass}
                required
                dir="rtl"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
              />
            </Field>
            <Field label="Price (AED)">
              <input
                type="number"
                step="0.01"
                className={inputClass}
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Field>
            <Field label="Category">
              <select className={inputClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameEn}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Image URL">
              <input className={inputClass} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </Field>
            <Field label="Slug (used in the product link)">
              <input
                className={inputClass}
                required
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
              />
            </Field>
            <Field label="Description (English)" full>
              <textarea
                className={inputClass}
                rows={3}
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
              />
            </Field>
            <Field label="Description (Arabic) — type this yourself" full>
              <textarea
                className={inputClass}
                rows={3}
                dir="rtl"
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
              />
            </Field>
          </div>
        </section>

        <button type="submit" disabled={saving} className="rounded-lg bg-black px-6 py-3 font-bold text-white disabled:opacity-50">
          {saving ? "Saving..." : "Add product"}
        </button>
      </form>
    </div>
  );
}
