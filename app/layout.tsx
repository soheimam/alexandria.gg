import { Providers } from "@/providers/providers";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import '@coinbase/onchainkit/styles.css'; 
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alexandria",
  description: "Turn any link into a lesson.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased  mx-auto`}
      >
        <Providers>
          {children}
        </Providers>
        <div className="text-center text-xs text-[var(--secondary)]">
        © {new Date().getFullYear()} Alexandria. Turn any link into a lesson.
      </div>
      </body>
    </html>
  );
}
