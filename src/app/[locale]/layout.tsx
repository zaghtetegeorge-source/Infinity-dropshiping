import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { locales, type Locale } from "@/lib/i18n/dictionaries";
import { siteConfig } from "@/lib/siteConfig";
import { CartProvider } from "@/components/storefront/CartContext";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { WhatsAppButton } from "@/components/storefront/WhatsAppButton";
import { Trackers } from "@/components/tracking/Trackers";

const cairo = Cairo({ variable: "--font-cairo", subsets: ["latin", "arabic"] });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: isAr ? `${siteConfig.name} | تسوق أفضل المنتجات` : `${siteConfig.name} | Shop the best products`,
      template: `%s | ${siteConfig.name}`,
    },
    description: isAr
      ? "متجر إلكتروني موثوق يقدم أفضل المنتجات بأسعار منافسة وشحن سريع لجميع الإمارات ودول الخليج."
      : "A trusted online store offering the best products at competitive prices with fast shipping across the UAE & GCC.",
    alternates: {
      languages: { ar: "/ar", en: "/en" },
    },
    openGraph: {
      siteName: siteConfig.name,
      locale: isAr ? "ar_AE" : "en_US",
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!locales.includes(rawLocale as Locale)) notFound();
  const locale = rawLocale as Locale;

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`${cairo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Trackers />
        <CartProvider>
          <Header locale={locale} />
          <main className="flex-1">{children}</main>
          <Footer locale={locale} />
          <WhatsAppButton locale={locale} />
        </CartProvider>
      </body>
    </html>
  );
}
