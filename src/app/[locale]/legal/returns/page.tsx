import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/dictionaries";
import { LegalPage } from "@/components/storefront/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "سياسة الإرجاع والاستبدال" : "Returns & Refunds Policy" };
}

const content = {
  ar: {
    title: "سياسة الإرجاع والاستبدال",
    lastUpdated: "آخر تحديث: 2026",
    sections: [
      {
        heading: "1. فترة الإرجاع",
        body: "يمكنك إرجاع أي منتج خلال 7 أيام من تاريخ استلامه، بشرط أن يكون المنتج بحالته الأصلية، غير مستخدم، وفي تغليفه الأصلي مع جميع الملحقات والفواتير.",
      },
      {
        heading: "2. المنتجات غير القابلة للإرجاع",
        body: "لا يمكن إرجاع المنتجات الشخصية (مثل العناية الشخصية) بعد فتحها، أو المنتجات المخصصة حسب الطلب، لأسباب تتعلق بالسلامة والصحة العامة.",
      },
      {
        heading: "3. كيفية طلب الإرجاع",
        body: "تواصل معنا عبر واتساب أو البريد الإلكتروني مع ذكر رقم الطلب وسبب الإرجاع، وسنقوم بإرشادك خلال خطوات الإرجاع وترتيب استلام المنتج.",
      },
      {
        heading: "4. استرداد المبلغ",
        body: "بعد استلام المنتج المرتجع وفحصه، يتم استرداد المبلغ إلى وسيلة الدفع الأصلية خلال 5-10 أيام عمل. في حال الدفع عبر بطاقة عبر Stripe، يظهر المبلغ المسترد في كشف حسابك حسب سياسة البنك المصدر للبطاقة.",
      },
      {
        heading: "5. المنتجات التالفة أو الخاطئة",
        body: "إذا استلمت منتجاً تالفاً أو مختلفاً عن طلبك، تواصل معنا فوراً مع صور للمنتج وسنقوم باستبداله أو استرداد كامل المبلغ مجاناً دون أي تكلفة إضافية عليك.",
      },
    ],
  },
  en: {
    title: "Returns & Refunds Policy",
    lastUpdated: "Last updated: 2026",
    sections: [
      {
        heading: "1. Return Window",
        body: "You may return any item within 7 days of delivery, provided it is unused, in its original condition and packaging, with all accessories and invoices included.",
      },
      {
        heading: "2. Non-Returnable Items",
        body: "Personal care items cannot be returned once opened, and custom/made-to-order items cannot be returned, for health and safety reasons.",
      },
      {
        heading: "3. How to Request a Return",
        body: "Contact us via WhatsApp or email with your order number and reason for return, and we'll guide you through the return steps and arrange pickup.",
      },
      {
        heading: "4. Refunds",
        body: "Once we receive and inspect the returned item, your refund will be issued to the original payment method within 5–10 business days. For card payments via Stripe, the refunded amount appears on your statement according to your card issuer's policy.",
      },
      {
        heading: "5. Damaged or Incorrect Items",
        body: "If you receive a damaged or incorrect item, contact us immediately with photos and we will replace it or issue a full refund at no extra cost to you.",
      },
    ],
  },
};

export default async function ReturnsPolicyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <LegalPage {...content[locale]} />;
}
