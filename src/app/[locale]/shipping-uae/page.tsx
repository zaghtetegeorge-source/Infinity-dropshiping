import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/dictionaries";
import { LegalPage } from "@/components/storefront/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "الشحن داخل الإمارات" : "Shipping in the UAE" };
}

const content = {
  ar: {
    title: "الشحن داخل الإمارات",
    lastUpdated: "آخر تحديث: 2026",
    sections: [
      {
        heading: "1. التغطية في جميع الإمارات",
        body: "نوصل الطلبات إلى جميع الإمارات السبع: دبي، أبوظبي، الشارقة، عجمان، أم القيوين، رأس الخيمة، والفجيرة. لا توجد مناطق مستثناة من التوصيل داخل الدولة.",
      },
      {
        heading: "2. مدة التوصيل حسب الإمارة",
        body: "دبي والشارقة وعجمان: 1-2 يوم عمل بعد الشحن.\nأبوظبي وأم القيوين: 2-3 أيام عمل.\nرأس الخيمة والفجيرة: 2-4 أيام عمل.\nقد تختلف هذه المدة حسب توفر المنتج لدى المورد.",
      },
      {
        heading: "3. رسوم الشحن",
        body: "رسوم الشحن داخل الإمارات: 15 درهماً للطلب الواحد، وتصبح مجانية تلقائياً للطلبات التي يتجاوز إجمالي قيمتها 200 درهم.",
      },
      {
        heading: "4. طرق الدفع المتاحة",
        body: "الدفع إلكترونياً عبر بطاقة الائتمان/الخصم، Apple Pay، أو Google Pay وقت إتمام الطلب. جميع المدفوعات تتم بشكل آمن عبر Stripe.",
      },
      {
        heading: "5. التواصل بخصوص طلبك",
        body: "لأي استفسار عن حالة طلبك داخل الإمارات، يمكنك التواصل معنا مباشرة عبر واتساب وسنقوم بالرد عليك في أقرب وقت.",
      },
    ],
  },
  en: {
    title: "Shipping in the UAE",
    lastUpdated: "Last updated: 2026",
    sections: [
      {
        heading: "1. Coverage Across All Emirates",
        body: "We deliver to all seven emirates: Dubai, Abu Dhabi, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, and Fujairah. No areas within the UAE are excluded from delivery.",
      },
      {
        heading: "2. Delivery Time by Emirate",
        body: "Dubai, Sharjah & Ajman: 1–2 business days after shipping.\nAbu Dhabi & Umm Al Quwain: 2–3 business days.\nRas Al Khaimah & Fujairah: 2–4 business days.\nActual times may vary depending on product availability from our supplier.",
      },
      {
        heading: "3. Shipping Fees",
        body: "Shipping within the UAE costs AED 15 per order, and is automatically free for orders totaling more than AED 200.",
      },
      {
        heading: "4. Available Payment Methods",
        body: "Pay securely online via credit/debit card, Apple Pay, or Google Pay at checkout. All payments are processed securely through Stripe.",
      },
      {
        heading: "5. Questions About Your Order",
        body: "For any questions about your order status within the UAE, contact us directly via WhatsApp and we'll respond as soon as possible.",
      },
    ],
  },
};

export default async function ShippingUaePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <LegalPage {...content[locale]} />;
}
