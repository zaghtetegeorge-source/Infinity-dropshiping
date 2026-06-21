import Link from "next/link";
import { Truck, ShieldCheck, MessageCircle, RotateCcw } from "lucide-react";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/storefront/ProductCard";
import { siteConfig } from "@/lib/siteConfig";

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

      <section className="bg-gradient-to-b from-gray-900 to-gray-700 px-4 py-20 text-center text-white">
        <h1 className="mx-auto max-w-2xl text-3xl font-extrabold sm:text-5xl">{dict.home.heroTitle}</h1>
        <p className="mx-auto mt-4 max-w-xl text-gray-300">{dict.home.heroSubtitle}</p>
        <Link
          href={`/${locale}/products`}
          className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-bold text-gray-900 transition hover:bg-gray-100"
        >
          {dict.home.shopNow}
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-2 text-center text-sm font-bold uppercase tracking-wide text-gray-500">
          {dict.home.whyUs}
        </h2>
        <div className="grid gap-6 sm:grid-cols-4">
          <Feature icon={<Truck />} title={dict.home.fastShipping} desc={dict.home.fastShippingDesc} />
          <Feature icon={<ShieldCheck />} title={dict.home.securePayment} desc={dict.home.securePaymentDesc} />
          <Feature icon={<MessageCircle />} title={dict.home.support} desc={dict.home.supportDesc} />
          <Feature icon={<RotateCcw />} title={dict.home.easyReturns} desc={dict.home.easyReturnsDesc} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
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
    <div className="rounded-xl border p-5 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        {icon}
      </div>
      <h3 className="font-bold">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
    </div>
  );
}
