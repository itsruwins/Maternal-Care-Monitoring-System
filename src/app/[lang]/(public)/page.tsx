import type { Viewport } from "next";
import { CurvedHero } from "@/components/ui/curved-hero";
import { ClosingCta } from "@/features/landing/components/closing-cta";
import { HealthCenter } from "@/features/landing/components/health-center";
import { Hero } from "@/features/landing/components/hero";
import { HowItWorks } from "@/features/landing/components/how-it-works";
import { QuickFacts } from "@/features/landing/components/quick-facts";
import { RecordsSection } from "@/features/landing/components/records-section";
import { Services } from "@/features/landing/components/services";
import { SiteFooter } from "@/features/landing/components/site-footer";
import { SiteHeader } from "@/features/landing/components/site-header";
import { Tips } from "@/features/landing/components/tips";
import { AuthDialogProvider } from "@/features/auth/components/auth-dialog";
import { getServerI18n } from "@/i18n/server";
import { getShownPuroks } from "@/lib/puroks/shown-puroks";

// The browser bar matches the top of the rose hero.
export const viewport: Viewport = { themeColor: "#f6e6e1" };

export default async function LandingPage() {
  const [{ t, locale }, puroks] = await Promise.all([getServerI18n(), getShownPuroks()]);

  return (
    <AuthDialogProvider puroks={puroks}>
    <div className="relative">
      {/* The header sits on top of the rose hero */}
      <SiteHeader className="absolute inset-x-0 top-0 z-20" />
      <main id="main" tabIndex={-1} className="outline-none">
        <CurvedHero tone="rose" curve="lg" className="pt-16 pb-16 sm:pt-18 lg:pb-24">
          <Hero />
        </CurvedHero>
        <QuickFacts t={t} />
        <HowItWorks t={t} />
        <Services t={t} />
        <RecordsSection t={t} />
        <HealthCenter t={t} locale={locale} />
        <Tips t={t} />
        <ClosingCta />
      </main>
      <SiteFooter t={t} locale={locale} />
    </div>
    </AuthDialogProvider>
  );
}
