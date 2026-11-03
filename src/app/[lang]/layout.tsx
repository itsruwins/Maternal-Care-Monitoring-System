import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { Toaster } from "sonner";
import { SITE } from "@/config/site";
import { isLocale, LOCALES } from "@/i18n/config";
import { DictionaryProvider } from "@/i18n/dictionary-provider";
import { getDictionary } from "@/i18n/get-dictionary";
import "../globals.css";

// Inter, like Flo. The optical-size axis tightens large headings automatically.
// Only "latin" is preloaded (English and Filipino need nothing else); the other
// sets still load on demand if a page ever shows one of their characters.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: `${SITE.fullTitle}, ${SITE.location}`,
  icons: {
    icon: [
      { url: "/brand/seal-96.png", sizes: "96x96", type: "image/png" },
      { url: "/brand/seal-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/brand/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf8f3",
};

// Cache Components needs every root parameter value listed ahead of time.
export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await lang();
  if (!isLocale(locale)) notFound();
  const dictionary = await getDictionary(locale);

  return (
    <html lang={locale} className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        {/* Hidden until the first Tab press; jumps past the header and menus to <main id="main">. */}
        <a
          href="#main"
          className="sr-only rounded-full bg-white font-semibold text-ink shadow-[var(--shadow-raised)] focus:not-sr-only focus:fixed focus:px-5 focus:py-3 focus:top-3 focus:left-3 focus:z-[100] focus:outline-2 focus:outline-offset-2 focus:outline-leaf focus:outline-solid"
        >
          {dictionary.common.skipToContent}
        </a>
        <DictionaryProvider locale={locale} dictionary={dictionary}>
          {children}
        </DictionaryProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              toast: "!bg-white !text-ink !border-line !rounded-2xl !shadow-[var(--shadow-raised)] !font-sans",
            },
          }}
        />
      </body>
    </html>
  );
}
