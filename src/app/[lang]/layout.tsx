import type { Metadata, Viewport } from "next";
import { Archivo, Kalam } from "next/font/google";
import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { Toaster } from "sonner";
import { SITE } from "@/config/site";
import { isLocale, LOCALES } from "@/i18n/config";
import { DictionaryProvider } from "@/i18n/dictionary-provider";
import { getDictionary } from "@/i18n/get-dictionary";
import "../globals.css";

// Printed card text: Archivo with its width axis (condensed labels, normal body).
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
});

// Values written in by hand on the card.
const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
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
  themeColor: "#e8ddc9",
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
    <html lang={locale} className={`${archivo.variable} ${kalam.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <DictionaryProvider locale={locale} dictionary={dictionary}>
          {children}
        </DictionaryProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              toast: "!bg-card-stock !text-ink !border-rule !shadow-[var(--shadow-card)] !font-sans",
            },
          }}
        />
      </body>
    </html>
  );
}
