import { siteConfig } from "@/lib/siteConfig";
import type { Locale } from "@/lib/i18n/dictionaries";

interface Props {
  locale: Locale;
  message?: string;
}

// Floating click-to-chat WhatsApp button. Configure NEXT_PUBLIC_WHATSAPP_NUMBER
// in .env.local (international format, no + or spaces, e.g. 9715XXXXXXXX) to
// enable it — it renders nothing until that's set.
export function WhatsAppButton({ locale, message }: Props) {
  if (!siteConfig.whatsappNumber) return null;

  const defaultMessage =
    locale === "ar" ? "مرحباً، أريد الاستفسار عن منتج في متجركم" : "Hi, I have a question about a product";
  const text = encodeURIComponent(message || defaultMessage);
  const href = `https://wa.me/${siteConfig.whatsappNumber}?text=${text}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform hover:scale-110 end-5"
    >
      <svg viewBox="0 0 32 32" className="h-8 w-8 fill-white">
        <path d="M16.04 2.667C8.62 2.667 2.667 8.62 2.667 16.04c0 2.61.73 5.04 2 7.12L2.667 29.33l6.36-1.97a13.31 13.31 0 0 0 7.013 1.99c7.42 0 13.373-5.953 13.373-13.373S23.46 2.667 16.04 2.667zm0 24.346a11 11 0 0 1-5.667-1.56l-.407-.24-3.76 1.16 1.187-3.654-.267-.42a10.95 10.95 0 0 1-1.706-5.86c0-6.06 4.933-10.993 11.013-10.993S27.053 9.98 27.053 16.04 22.12 27.013 16.04 27.013zm6.027-8.227c-.327-.167-1.94-.96-2.24-1.067-.3-.107-.52-.167-.74.167-.22.327-.846 1.066-1.04 1.286-.193.22-.386.246-.713.08-.327-.167-1.38-.507-2.627-1.62-.973-.866-1.627-1.94-1.82-2.266-.187-.327-.02-.507.16-.673.166-.16.366-.413.553-.62.187-.207.247-.353.373-.587.127-.233.066-.42-.027-.587-.093-.166-.84-2.026-1.153-2.773-.307-.733-.62-.633-.84-.646h-.72c-.234 0-.614.087-.94.42-.327.333-1.247 1.22-1.247 2.973 0 1.753 1.273 3.447 1.453 3.687.18.24 2.473 3.793 6.06 5.16 3.587 1.367 3.587.913 4.233.853.647-.06 1.94-.793 2.213-1.56.273-.767.273-1.42.193-1.56-.08-.14-.3-.22-.627-.387z" />
      </svg>
    </a>
  );
}
