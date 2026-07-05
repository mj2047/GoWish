import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { NavBar } from "@/components/NavBar";
import { LanguageProvider } from "@/components/LanguageProvider";

const fraunces = Fraunces({
  variable: "--font-display-raw",
  subsets: ["latin"],
  weight: ["600", "700", "900"],
});

const inter = Inter({
  variable: "--font-sans-raw",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GoWish",
  description: "Your gifts. No duplicates. No spoilers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} dark h-full antialiased`}>
      <body className="bg-app relative min-h-full flex flex-col">
        <LanguageProvider>
          <Providers>
            <NavBar />
            {children}
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}
