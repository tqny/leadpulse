import type { Metadata } from "next";
import { Oxanium } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const oxanium = Oxanium({
  subsets: ["latin"],
  variable: "--font-oxanium",
});

export const metadata: Metadata = {
  title: "LeadPulse",
  description:
    "Lightweight lead intake and follow-up CRM for epoxy flooring contractors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${oxanium.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
