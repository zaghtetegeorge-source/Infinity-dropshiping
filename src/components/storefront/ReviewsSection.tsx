"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { StarRating } from "@/components/storefront/StarRating";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getDictionary } from "@/lib/i18n/dictionaries";

interface Review {
  id: string;
  authorName: string;
  rating: number;
  titleText: string | null;
  bodyText: string;
  createdAt: string;
}

export function ReviewsSection({ locale, productId, initialReviews }: { locale: Locale; productId: string; initialReviews: Review[] }) {
  const dict = getDictionary(locale);
  const [reviews, setReviews] = useState(initialReviews);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ authorName: "", rating: 5, titleText: "", bodyText: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...form }),
      });
      if (!res.ok) throw new Error("failed");
      const { review } = await res.json();
      setReviews((prev) => [review, ...prev]);
      setForm({ authorName: "", rating: 5, titleText: "", bodyText: "" });
      setOpen(false);
      toast.success(locale === "ar" ? "شكراً لتقييمك!" : "Thanks for your review!");
    } catch {
      toast.error(locale === "ar" ? "حدث خطأ، حاول مرة أخرى" : "Something went wrong, try again");
    } finally {
      setSubmitting(false);
    }
  }

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">{dict.product.reviews}</h2>
          {reviews.length > 0 ? (
            <span className="flex items-center gap-2 text-sm text-gray-600">
              <StarRating rating={avg} /> ({reviews.length})
            </span>
          ) : null}
        </div>
        <button onClick={() => setOpen((v) => !v)} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">
          {dict.product.writeReview}
        </button>
      </div>

      {open ? (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-xl border p-4">
          <input
            required
            placeholder={locale === "ar" ? "الاسم" : "Name"}
            value={form.authorName}
            onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm">{locale === "ar" ? "التقييم" : "Rating"}</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} onClick={() => setForm((f) => ({ ...f, rating: n }))}>
                <StarRating rating={n <= form.rating ? 5 : 0} size={20} />
              </button>
            ))}
          </div>
          <input
            placeholder={locale === "ar" ? "عنوان التقييم (اختياري)" : "Review title (optional)"}
            value={form.titleText}
            onChange={(e) => setForm((f) => ({ ...f, titleText: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2"
          />
          <textarea
            required
            placeholder={locale === "ar" ? "اكتب تقييمك..." : "Write your review..."}
            value={form.bodyText}
            onChange={(e) => setForm((f) => ({ ...f, bodyText: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2"
            rows={3}
          />
          <button disabled={submitting} className="rounded-lg bg-black px-5 py-2 font-bold text-white disabled:opacity-50">
            {submitting ? "..." : dict.product.writeReview}
          </button>
        </form>
      ) : null}

      {reviews.length === 0 ? (
        <p className="text-gray-500">{dict.product.noReviews}</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border p-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-bold">{r.authorName}</span>
                <StarRating rating={r.rating} />
              </div>
              {r.titleText ? <p className="font-medium">{r.titleText}</p> : null}
              <p className="text-sm text-gray-600">{r.bodyText}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
