import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/dictionaries";
import { LegalPage } from "@/components/storefront/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "الشروط والأحكام" : "Terms & Conditions" };
}

const content = {
  ar: {
    title: "الشروط والأحكام",
    lastUpdated: "آخر تحديث: 2026",
    sections: [
      {
        heading: "1. عن المتجر",
        body: "هذا المتجر الإلكتروني يقدم منتجات للبيع داخل الإمارات العربية المتحدة ودول الخليج. باستخدامك للموقع وإتمام أي عملية شراء، فإنك توافق على الالتزام بهذه الشروط والأحكام.",
      },
      {
        heading: "2. الطلبات والأسعار",
        body: "جميع الأسعار المعروضة تشمل الضرائب المعمول بها ما لم يُذكر غير ذلك، وهي قابلة للتغيير دون إشعار مسبق. نحتفظ بالحق في رفض أو إلغاء أي طلب لأي سبب، بما في ذلك خطأ في السعر أو نفاد المخزون أو الاشتباه في عملية احتيال.",
      },
      {
        heading: "3. الدفع",
        body: "نقبل الدفع عبر بطاقات الائتمان/الخصم وApple Pay وGoogle Pay من خلال مزود الدفع الآمن Stripe. لا نقوم بتخزين بيانات بطاقتك المصرفية على خوادمنا.",
      },
      {
        heading: "4. الشحن والتوصيل",
        body: "تخضع عمليات الشحن والتوصيل لسياسة الشحن الخاصة بنا، والتي يمكنك مراجعتها في صفحة 'سياسة الشحن'.",
      },
      {
        heading: "5. الإرجاع والاستبدال",
        body: "تخضع طلبات الإرجاع والاستبدال لسياسة الإرجاع الخاصة بنا، والتي يمكنك مراجعتها في صفحة 'سياسة الإرجاع والاستبدال'.",
      },
      {
        heading: "6. الملكية الفكرية",
        body: "جميع المحتويات الموجودة على هذا الموقع (النصوص، الصور، الشعارات، التصاميم) مملوكة للمتجر أو لمورديه، ولا يجوز استخدامها أو نسخها دون إذن خطي مسبق.",
      },
      {
        heading: "7. حدود المسؤولية",
        body: "نسعى لضمان دقة المعلومات المعروضة على الموقع، إلا أننا لا نضمن خلوها التام من الأخطاء. لا نتحمل المسؤولية عن أي أضرار غير مباشرة ناتجة عن استخدام الموقع أو المنتجات ضمن الحدود التي يسمح بها القانون.",
      },
      {
        heading: "8. التواصل والشكاوى",
        body: "لأي استفسار أو شكوى، يمكنك التواصل معنا عبر واتساب أو البريد الإلكتروني الموضح في صفحة 'تواصل معنا'.",
      },
      {
        heading: "9. التعديلات على الشروط",
        body: "نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت، وسيتم نشر أي تحديثات على هذه الصفحة.",
      },
    ],
  },
  en: {
    title: "Terms & Conditions",
    lastUpdated: "Last updated: 2026",
    sections: [
      {
        heading: "1. About This Store",
        body: "This online store offers products for sale within the United Arab Emirates and the GCC region. By using this site and completing a purchase, you agree to be bound by these Terms & Conditions.",
      },
      {
        heading: "2. Orders & Pricing",
        body: "All displayed prices include applicable taxes unless stated otherwise and are subject to change without notice. We reserve the right to refuse or cancel any order for any reason, including pricing errors, stock unavailability, or suspected fraud.",
      },
      {
        heading: "3. Payment",
        body: "We accept payment via credit/debit cards, Apple Pay, and Google Pay through our secure payment provider, Stripe. We never store your card details on our own servers.",
      },
      {
        heading: "4. Shipping & Delivery",
        body: "Shipping and delivery are governed by our Shipping Policy, which you can review on the 'Shipping Policy' page.",
      },
      {
        heading: "5. Returns & Exchanges",
        body: "Returns and exchanges are governed by our Returns Policy, which you can review on the 'Returns & Refunds Policy' page.",
      },
      {
        heading: "6. Intellectual Property",
        body: "All content on this site (text, images, logos, designs) is owned by the store or its suppliers and may not be used or copied without prior written permission.",
      },
      {
        heading: "7. Limitation of Liability",
        body: "We strive to ensure the accuracy of information on this site but do not guarantee it is error-free. We are not liable for any indirect damages arising from use of the site or products, to the extent permitted by law.",
      },
      {
        heading: "8. Contact & Complaints",
        body: "For any inquiry or complaint, please contact us via WhatsApp or the email address listed on our 'Contact Us' page.",
      },
      {
        heading: "9. Changes to These Terms",
        body: "We reserve the right to modify these Terms & Conditions at any time. Any updates will be posted on this page.",
      },
    ],
  },
};

export default async function TermsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <LegalPage {...content[locale]} />;
}
