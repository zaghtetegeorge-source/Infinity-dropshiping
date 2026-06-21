import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/dictionaries";
import { LegalPage } from "@/components/storefront/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "سياسة الشحن" : "Shipping Policy" };
}

const content = {
  ar: {
    title: "سياسة الشحن",
    lastUpdated: "آخر تحديث: 2026",
    sections: [
      {
        heading: "1. مناطق التوصيل",
        body: "نقوم بالشحن إلى جميع إمارات الدولة، بالإضافة إلى السعودية والكويت وقطر والبحرين وعُمان. لمزيد من التفاصيل الخاصة بالإمارات، راجع صفحة 'الشحن داخل الإمارات'.",
      },
      {
        heading: "2. مدة التوصيل",
        body: "يتم تجهيز الطلبات خلال 1-2 يوم عمل، ويستغرق التوصيل من 2 إلى 5 أيام عمل داخل الإمارات، ومن 4 إلى 8 أيام عمل لباقي دول الخليج، حسب المنتج والموقع.",
      },
      {
        heading: "3. رسوم الشحن",
        body: "رسوم الشحن داخل الإمارات تبدأ من 15 درهماً وتصبح مجانية للطلبات التي تتجاوز 200 درهم. لباقي دول الخليج، تبدأ الرسوم من 25 درهماً (أو ما يعادلها) وتصبح مجانية للطلبات التي تتجاوز 300 درهم.",
      },
      {
        heading: "4. تتبع الطلب",
        body: "بعد شحن طلبك، ستصلك رسالة تحتوي على رقم تتبع الشحنة لمتابعة حالة التوصيل حتى استلامها.",
      },
      {
        heading: "5. التأخير في التوصيل",
        body: "قد تتأخر بعض الشحنات بسبب عوامل خارجة عن إرادتنا (مثل الأعياد أو الظروف الجوية). سنبقيك على اطلاع دائم بأي تأخير محتمل.",
      },
    ],
  },
  en: {
    title: "Shipping Policy",
    lastUpdated: "Last updated: 2026",
    sections: [
      {
        heading: "1. Delivery Areas",
        body: "We ship to all Emirates of the UAE, as well as Saudi Arabia, Kuwait, Qatar, Bahrain, and Oman. For UAE-specific details, see our 'Shipping in the UAE' page.",
      },
      {
        heading: "2. Delivery Time",
        body: "Orders are processed within 1–2 business days. Delivery takes 2–5 business days within the UAE, and 4–8 business days for other GCC countries, depending on the product and location.",
      },
      {
        heading: "3. Shipping Fees",
        body: "Shipping within the UAE starts at AED 15 and is free for orders over AED 200. For other GCC countries, fees start at AED 25 equivalent and are free for orders over AED 300.",
      },
      {
        heading: "4. Order Tracking",
        body: "Once your order ships, you'll receive a tracking number to follow your delivery status until it arrives.",
      },
      {
        heading: "5. Delivery Delays",
        body: "Some shipments may be delayed due to factors beyond our control (holidays, weather, etc). We will keep you updated on any potential delay.",
      },
    ],
  },
};

export default async function ShippingPolicyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <LegalPage {...content[locale]} />;
}
