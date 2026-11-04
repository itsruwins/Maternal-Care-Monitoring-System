import type { ReactNode } from "react";
import { HeartIcon, PhoneIcon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import { isPlaceholder, SITE } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatSlotDate } from "@/lib/appointments/format";
import { cn } from "@/lib/utils/cn";
import type { MissedVisit } from "../types";

// The gentle notice while she has missed visits the health center hasn't
// sorted out yet (her Appointments page, and the Next visit card on Today).
// One: "We missed you at your Prenatal Checkup on Tue, Nov 3." Several: "We
// missed you" and a list (any new booking closes them all). `children` adds
// more below, e.g. Request a visit on Today.
export function MissedVisitNotice({
  t,
  locale,
  missed,
  className,
  children,
}: {
  t: Dictionary;
  locale: Locale;
  missed: MissedVisit[];
  className?: string;
  children?: ReactNode;
}) {
  if (missed.length === 0) return null;
  const m = t.myAppointments.missed;
  const phone = SITE.healthCenter.contactNumber;
  const day = (visit: MissedVisit) => formatSlotDate(visit.at, locale, "short");

  return (
    <section aria-labelledby="missed-visits" className={cn("flex flex-col gap-3 rounded-3xl bg-blush/70 p-6", className)}>
      <div className="flex items-start gap-3">
        <IconCircle icon={HeartIcon} tone="white" size="sm" className="text-rose-deep" />
        <h2 id="missed-visits" className="mt-1 min-w-0 text-lg font-bold text-pretty break-words">
          {missed.length === 1 ? format(m.one, { service: missed[0].service, date: day(missed[0]) }) : m.several}
        </h2>
      </div>
      {missed.length > 1 && (
        <ul className="flex flex-col gap-1.5">
          {missed.map((visit) => (
            <li key={visit.id} className="flex items-start gap-2.5 text-[0.95rem] leading-6">
              <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-rose-deep" />
              <span className="min-w-0 break-words">
                <span className="font-semibold">{visit.service}</span> · <span className="tnum">{day(visit)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-[0.95rem] text-ink-soft">{m.body}</p>
      {!isPlaceholder(phone) && (
        <a
          href={`tel:${phone.replace(/[^\d+]/g, "")}`}
          className="inline-flex items-center gap-2 self-start font-semibold text-rose-deep underline decoration-1 underline-offset-4"
        >
          <PhoneIcon aria-hidden className="size-4" />
          {phone}
        </a>
      )}
      {children}
    </section>
  );
}
