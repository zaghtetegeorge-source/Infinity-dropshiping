import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/dictionaries";
import { LegalPage } from "@/components/storefront/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy" };
}

const content = {
  ar: {
    title: "سياسة الخصوصية",
    lastUpdated: "آخر تحديث: 2026",
    sections: [
      {
        heading: "1. المعلومات التي نجمعها",
        body: "نجمع المعلومات التي تقدمها لنا مباشرة عند إنشاء طلب، مثل الاسم الكامل، البريد الإلكتروني، رقم الهاتف، وعنوان الشحن. كما نجمع تلقائياً بيانات تقنية مثل عنوان IP، نوع المتصفح والجهاز، والصفحات التي تزورها على متجرنا.",
      },
      {
        heading: "2. ملفات تعريف الارتباط وأدوات التتبع",
        body: "نستخدم ملفات تعريف الارتباط (Cookies) وأدوات تتبع مثل Meta Pixel وTikTok Pixel وGoogle Analytics 4 وGoogle Tag Manager لفهم كيفية استخدامك للمتجر، وقياس فعالية حملاتنا الإعلانية على Meta وTikTok وGoogle، وعرض إعلانات مخصصة لك (إعادة التوجيه/Remarketing). يمكنك تعطيل ملفات تعريف الارتباط من إعدادات متصفحك في أي وقت.",
      },
      {
        heading: "3. مشاركة المعلومات مع جهات خارجية",
        body: "نشارك بعض بياناتك (مثل البريد الإلكتروني المُشفّر ورقم الهاتف المُشفّر) مع منصات Meta وTikTok وGoogle عبر واجهات Conversions API / Events API بهدف قياس التحويلات وتحسين الحملات الإعلانية. نستخدم Stripe لمعالجة الدفع بشكل آمن، ولا نحتفظ ببيانات بطاقتك المصرفية على خوادمنا.",
      },
      {
        heading: "4. كيف نستخدم معلوماتك",
        body: "نستخدم معلوماتك لتنفيذ طلباتك وتوصيلها، للتواصل معك بخصوص حالة الطلب، لتحسين تجربتك في المتجر، ولإرسال عروض تسويقية إذا وافقت على ذلك (بما في ذلك رسائل تذكير بالسلة المهجورة).",
      },
      {
        heading: "5. حقوقك",
        body: "يمكنك طلب الوصول إلى بياناتك الشخصية أو تعديلها أو حذفها في أي وقت عبر التواصل معنا. سنستجيب لطلبك ضمن فترة زمنية معقولة وفقاً للقوانين المعمول بها.",
      },
      {
        heading: "6. أمان البيانات",
        body: "نتخذ إجراءات تقنية وتنظيمية معقولة لحماية بياناتك من الوصول غير المصرّح به أو الفقدان أو الإفشاء.",
      },
      {
        heading: "7. التواصل معنا",
        body: "لأي استفسار بخصوص هذه السياسة، يمكنك التواصل معنا عبر واتساب أو البريد الإلكتروني الموضح في صفحة 'تواصل معنا'.",
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: 2026",
    sections: [
      {
        heading: "1. Information We Collect",
        body: "We collect information you provide directly when placing an order, such as your full name, email address, phone number, and shipping address. We also automatically collect technical data such as IP address, browser/device type, and the pages you visit on our store.",
      },
      {
        heading: "2. Cookies & Tracking Tools",
        body: "We use cookies and tracking technologies such as Meta Pixel, TikTok Pixel, Google Analytics 4, and Google Tag Manager to understand how you use the store, measure the performance of our Meta, TikTok and Google advertising campaigns, and show you relevant ads (remarketing). You can disable cookies in your browser settings at any time.",
      },
      {
        heading: "3. Sharing Information with Third Parties",
        body: "We share limited data (such as hashed email and hashed phone number) with Meta, TikTok, and Google via their Conversions API / Events API to measure ad conversions and improve campaign performance. We use Stripe to process payments securely; we never store your card details on our own servers.",
      },
      {
        heading: "4. How We Use Your Information",
        body: "We use your information to fulfil and deliver your orders, communicate with you about order status, improve your shopping experience, and send marketing messages if you opt in (including abandoned-cart reminder emails).",
      },
      {
        heading: "5. Your Rights",
        body: "You may request access to, correction of, or deletion of your personal data at any time by contacting us. We will respond within a reasonable timeframe in accordance with applicable law.",
      },
      {
        heading: "6. Data Security",
        body: "We take reasonable technical and organizational measures to protect your data against unauthorized access, loss, or disclosure.",
      },
      {
        heading: "7. Contact Us",
        body: "For any questions about this policy, please contact us via WhatsApp or the email address listed on our 'Contact Us' page.",
      },
    ],
  },
};

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <LegalPage {...content[locale]} />;
}
