import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AmbientBackground } from "@/components/ambient-background";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { dictionaries, defaultLocale } from "@/lib/i18n/dictionaries";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Static metadata can't react to the client-side language toggle, so it's
// pinned to the site's main language (Italian).
export const metadata: Metadata = {
  title: dictionaries[defaultLocale].meta.title,
  description: dictionaries[defaultLocale].meta.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={defaultLocale}
      className={cn("dark h-full antialiased", geistSans.variable, geistMono.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LanguageProvider>
          <AmbientBackground />
          <LanguageSwitcher />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
