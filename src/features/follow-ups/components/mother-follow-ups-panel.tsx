import Link from "next/link";
import { AppointmentIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { formatSlot } from "@/lib/appointments/format";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { rebookHref } from "../paths";
import { listMotherFollowUps } from "../queries/follow-ups";
import type { FollowUpItem } from "../types";
import { EndingChip, MissedAgo, shortDay } from "./follow-up-bits";
import { FollowUpEntries, LogFollowUpButton } from "./follow-up-dialogs";

type Shared = { t: Dictionary; locale: Locale; today: string; isAdmin: boolean };

// The Follow-ups tab on a mother's record: her missed visits (open ones
// first), each with its whole follow-up log. Loads its own data (the page has
// already checked the staff role).
export async function MotherFollowUpsPanel({ motherId, isAdmin }: { motherId: number; isAdmin: boolean }) {
  const today = manilaTodayISO();
  const [{ t, locale }, items] = await Promise.all([getServerI18n(), listMotherFollowUps(motherId, { isAdmin }, today)]);
  return <MotherFollowUpsPanelView t={t} locale={locale} items={items} today={today} isAdmin={isAdmin} />;
}

export function MotherFollowUpsPanelView({ items, ...shared }: Shared & { items: FollowUpItem[] }) {
  const r = shared.t.followUps.record;
  const open = items.filter((item) => item.isOpen);
  const closed = items.filter((item) => !item.isOpen);

  if (items.length === 0) {
    return <p className="rounded-2xl bg-white px-6 py-10 text-center text-ink-soft shadow-[var(--shadow-soft)]">{r.empty}</p>;
  }
  return (
    <div className="flex flex-col gap-6">
      {[
        { id: "her-open-follow-ups", title: r.open, list: open },
        { id: "her-closed-follow-ups", title: r.closed, list: closed },
      ].map(
        (group) =>
          group.list.length > 0 && (
            <section key={group.id} aria-labelledby={group.id} className="flex flex-col gap-3">
              <h2 id={group.id} className="text-lg font-bold">
                {group.title}
              </h2>
              <ul className="grid gap-3 xl:grid-cols-2">
                {group.list.map((item) => (
                  <li key={item.appointmentId}>
                    <MissedVisitCard {...shared} item={item} />
                  </li>
                ))}
              </ul>
            </section>
          ),
      )}
    </div>
  );
}

function MissedVisitCard({ t, locale, today, isAdmin, item }: Shared & { item: FollowUpItem }) {
  const f = t.followUps;
  const which = { service: item.service, date: shortDay(item.missedDate, locale) };
  return (
    <article className="flex h-full flex-col gap-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <div className="flex flex-col gap-1">
        {item.isOpen && <MissedAgo t={t} daysAgo={item.daysAgo} />}
        <h3 className="font-semibold break-words">{item.service}</h3>
        <p className="tnum text-sm text-ink-soft">{formatSlot(item.missedAt, locale, "short")}</p>
      </div>
      {item.ending && (
        <div>
          <EndingChip t={t} locale={locale} ending={item.ending} />
        </div>
      )}
      <div className="flex flex-col gap-3 border-t border-line pt-3">
        <h4 className="text-sm font-semibold text-ink-soft">{f.logDialog.title}</h4>
        <FollowUpEntries item={item} today={today} isAdmin={isAdmin} />
      </div>
      {item.isOpen && (
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <LogFollowUpButton item={item} today={today} from="record" label={format(f.record.logFor, which)} className="h-11 grow basis-36" />
          <Button asChild size="sm" variant="secondary" className="h-11 grow basis-36">
            <Link href={rebookHref(item.appointmentId, "record")} aria-label={format(f.record.rebookFor, which)}>
              <AppointmentIcon weight="bold" aria-hidden />
              {f.rebook}
            </Link>
          </Button>
        </div>
      )}
    </article>
  );
}
