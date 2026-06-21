import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n/dictionaries";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (pathnameHasLocale) return NextResponse.next();

  const acceptLanguage = req.headers.get("accept-language") || "";
  const preferred = acceptLanguage.toLowerCase().includes("en") ? "en" : defaultLocale;

  const url = req.nextUrl.clone();
  url.pathname = `/${preferred}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|admin|_next|favicon.ico|robots.txt|sitemap.xml|images).*)"],
};
