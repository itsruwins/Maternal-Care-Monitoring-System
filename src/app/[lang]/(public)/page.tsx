import { BalikCard } from "@/features/landing/components/balik-card";
import { HealthCenter } from "@/features/landing/components/health-center";
import { HowItWorks } from "@/features/landing/components/how-it-works";
import { RecordsSection } from "@/features/landing/components/records-section";
import { ServicesSchedule } from "@/features/landing/components/services-schedule";
import { SiteFooter } from "@/features/landing/components/site-footer";
import { SiteHeader } from "@/features/landing/components/site-header";
import { TipsSlip } from "@/features/landing/components/tips-slip";
import { getServerI18n } from "@/i18n/server";

export default async function LandingPage() {
  const { t } = await getServerI18n();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <BalikCard />
        {/* The rest of the folder: tabbed cards, each laid over the one before. */}
        <div className="mx-auto flex max-w-6xl flex-col px-4 pb-16 sm:px-6 sm:pb-24">
          <HowItWorks t={t} />
          <ServicesSchedule t={t} />
          <RecordsSection t={t} />
          <HealthCenter t={t} />
          <TipsSlip t={t} />
        </div>
      </main>
      <SiteFooter t={t} />
    </>
  );
}
