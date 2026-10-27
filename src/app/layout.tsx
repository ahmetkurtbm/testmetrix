import type { Metadata } from "next";
import { Outfit, Work_Sans } from "next/font/google";
import { cookies } from "next/headers";

import { THEME_COOKIE, SYSTEM_THEME_SCRIPT, parseTheme } from "@/lib/theme";

import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TestMetrix",
    template: "%s — TestMetrix",
  },
  description:
    "Çoktan seçmeli sınavlar için madde ve test analizi: güçlük, ayırt edicilik, " +
    "KR-20/KR-21 güvenirlik katsayıları ve raporlama.",
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <html lang="tr" className={theme === "dark" ? "dark" : undefined} suppressHydrationWarning>
      <head>
        {theme === "system" ? <script dangerouslySetInnerHTML={{ __html: SYSTEM_THEME_SCRIPT }} /> : null}
      </head>
      <body className={`${outfit.variable} ${workSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
