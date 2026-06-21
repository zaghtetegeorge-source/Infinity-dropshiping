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
  // Skip API/admin routes, Next internals, and any request for a static file
  // (anything with a file extension, e.g. /logo.png, /favicon.ico) — only
  // actual pages need a locale prefix.
  matcher: ["/((?!api|admin|_next|.*\\..*).*)"],
};
