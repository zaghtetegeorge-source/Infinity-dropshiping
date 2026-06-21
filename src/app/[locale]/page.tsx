import Link from "next/link";
import { Truck, ShieldCheck, MessageCircle, RotateCcw } from "lucide-react";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/storefront/ProductCard";
import { siteConfig } from "@/lib/siteConfig";

// Stock/pricing/featured flags change from the admin dashboard at any time,
// and the build environment has no DB connection — render per-request
// instead of prerendering at build time.
export const dynamic = "force-dynamic";

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  const products = await prisma.product.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 8,
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true, reviews: true },
  });

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: siteConfig.name,
    url: siteConfig.url,
    areaServed: ["AE", "SA", "KW", "QA", "BH", "OM"],
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />

      <section className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand to-brand px-4 py-24 text-center text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]" />
        <div className="relative">
          <h1 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight sm:text-6xl">
            {dict.home.heroTitle}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">{dict.home.heroSubtitle}</p>
          <Link
            href={`/${locale}/products`}
            className="mt-10 inline-block rounded-full bg-white px-9 py-3.5 font-bold text-brand-dark shadow-lg shadow-black/10 transition hover:scale-105 hover:bg-white/90"
          >
            {dict.home.shopNow}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-center text-sm font-bold uppercase tracking-widest text-gray-400">
          {dict.home.whyUs}
        </h2>
        <div className="grid gap-6 sm:grid-cols-4">
          <Feature icon={<Truck />} title={dict.home.fastShipping} desc={dict.home.fastShippingDesc} />
          <Feature icon={<ShieldCheck />} title={dict.home.securePayment} desc={dict.home.securePaymentDesc} />
          <Feature icon={<MessageCircle />} title={dict.home.support} desc={dict.home.supportDesc} />
          <Feature icon={<RotateCcw />} title={dict.home.easyReturns} desc={dict.home.easyReturnsDesc} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold">{dict.home.featured}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              locale={locale}
              currency={siteConfig.defaultCurrency}
              product={{
                id: p.id,
                slug: p.slug,
                titleEn: p.titleEn,
                titleAr: p.titleAr,
                price: p.price,
                compareAtPrice: p.compareAtPrice,
                image: p.images[0]?.url,
                categoryName: p.category?.nameEn,
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand">
        {icon}
      </div>
      <h3 className="font-bold">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
    </div>
  );
}
