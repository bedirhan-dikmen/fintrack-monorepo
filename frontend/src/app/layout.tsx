import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers"; // <-- Mutlak yol (Alias) ile güvenceye aldık!

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinTrack Dashboard",
  description: "Manage your cards and finances seamlessly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${geist.className} antialiased bg-slate-900 text-slate-100`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}