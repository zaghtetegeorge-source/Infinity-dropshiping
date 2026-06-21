import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = { title: "Admin | Infinity Store" };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-100 font-sans text-gray-900">{children}</body>
    </html>
  );
}
