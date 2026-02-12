import type { Metadata } from "next";
import { Nunito, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LearnNest - Gamified Learning for Kids",
  description: "A fun, gamified learning platform for children",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} ${inter.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
