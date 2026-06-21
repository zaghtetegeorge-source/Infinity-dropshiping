import Link from "next/link";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { siteConfig } from "@/lib/siteConfig";

export function Footer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <footer className="mt-16 border-t bg-gray-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <h3 className="mb-3 text-lg font-bold">{siteConfig.name}</h3>
          <p className="text-sm text-gray-600">{dict.footer.about}</p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase text-gray-500">{dict.footer.legal}</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href={`/${locale}/legal/privacy`} className="hover:text-blue-600">
                {dict.footer.privacy}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/legal/returns`} className="hover:text-blue-600">
                {dict.footer.returns}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/legal/shipping`} className="hover:text-blue-600">
                {dict.footer.shipping}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/legal/terms`} className="hover:text-blue-600">
                {dict.footer.terms}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/shipping-uae`} className="hover:text-blue-600">
                {dict.footer.shippingUae}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase text-gray-500">{dict.footer.contact}</h3>
          {siteConfig.whatsappNumber ? (
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#1ea952] hover:underline"
            >
              WhatsApp: +{siteConfig.whatsappNumber}
            </a>
          ) : null}
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} {siteConfig.name} — {dict.footer.rights}
      </div>
    </footer>
  );
}
