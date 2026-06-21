import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "../globals.css";

const cairo = Cairo({ variable: "--font-cairo", subsets: ["latin", "arabic"] });

export const metadata: Metadata = { title: "Admin | InGifts" };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-100 font-sans text-gray-900">{children}</body>
    </html>
  );
}
