import Image from "next/image";
import { CallIcon, ClockIcon, LocationIcon, LockIcon, type Icon } from "@/components/icons";
import { isPlaceholder, SITE } from "@/config/site";
import { AuthDialogTrigger } from "@/features/auth/components/auth-dialog";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

const SECTIONS = ["how", "services", "center", "tips"] as const;

const linkClass =
  "text-[0.95rem] text-ink-soft no-underline transition-colors hover:text-leaf hover:underline hover:underline-offset-4";

// Website footer: who runs it, quick links to the sections, the health
// center's details, account actions, then a quiet bar with privacy and credits.
export function SiteFooter({ t, locale }: { t: Dictionary; locale: Locale }) {
  const f = t.landing.footer;
  const c = t.landing.center;
  const details: { label: string; value: string; icon: Icon }[] = [
    { label: c.addressLabel, value: SITE.healthCenter.address, icon: LocationIcon },
    { label: c.hoursLabel, value: SITE.healthCenter.clinicHours[locale], icon: ClockIcon },
    { label: c.contactLabel, value: SITE.healthCenter.contactNumber, icon: CallIcon },
  ];

  return (
    <footer className="bg-white px-4 pt-14 pb-8 sm:px-6 lg:pt-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] md:gap-8">
          {/* Brand (phones: full width; Explore + Account side by side, Visit us below) */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3">
              <Image src="/brand/seal-96.png" alt="" width={48} height={48} className="size-12 rounded-full" />
              <p className="text-lg leading-6 font-extrabold tracking-[-0.015em]">{SITE.name}</p>
            </div>
            <p className="mt-4 max-w-[34ch] text-[0.95rem] leading-6 text-ink-soft">
              {SITE.fullTitle}, {SITE.location}.
            </p>
          </div>

          {/* Quick links */}
          <nav aria-labelledby="footer-explore">
            <h2 id="footer-explore" className="text-sm font-bold text-ink">
              {f.explore}
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {SECTIONS.map((id) => (
                <li key={id}>
                  <a href={`#${id}`} className={linkClass}>
                    {t.landing.nav[id]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Health center */}
          <div className="order-last col-span-2 md:order-none md:col-span-1">
            <h2 className="text-sm font-bold text-ink">{f.visit}</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {details.map(({ label, value, icon: DetailIcon }) => (
                <li key={label} className="flex gap-2.5 text-[0.95rem] leading-6 text-ink-soft">
                  <DetailIcon weight="regular" aria-hidden className="mt-0.5 size-5 shrink-0 text-leaf" />
                  <span className="text-balance">
                    <span className="sr-only">{label}: </span>
                    {isPlaceholder(value) ? `${label}: ${t.common.tbd}` : value}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h2 className="text-sm font-bold text-ink">{f.account}</h2>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <AuthDialogTrigger mode="signup">
                  <button type="button" className={linkClass}>
                    {t.nav.signup}
                  </button>
                </AuthDialogTrigger>
              </li>
              <li>
                <AuthDialogTrigger mode="login">
                  <button type="button" className={linkClass}>
                    {t.nav.login}
                  </button>
                </AuthDialogTrigger>
              </li>
            </ul>
            <p className="mt-5 max-w-[30ch] text-sm leading-5 text-ink-soft">{f.staff}</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-sm leading-5 text-ink-soft md:flex-row md:items-start md:justify-between md:gap-10">
          <p className="flex items-start gap-2">
            <LockIcon weight="regular" aria-hidden className="mt-0.5 size-4 shrink-0 text-leaf" />
            {f.privacy}
          </p>
          <p className="md:max-w-[46ch] md:text-right">{f.credits}</p>
        </div>
      </div>
    </footer>
  );
}
