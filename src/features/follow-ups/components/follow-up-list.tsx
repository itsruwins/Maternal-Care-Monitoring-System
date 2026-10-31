import Link from "next/link";
import { AppointmentIcon, CallIcon, LocationIcon, PhoneIcon } from "@/components/icons";
import { Pager } from "@/components/shared/pager";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatSlot } from "@/lib/appointments/format";
import { followUpsHref, rebookHref, recordFollowUpsHref } from "../paths";
import { FOLLOW_UPS_PAGE_SIZE } from "../queries/follow-ups";
import type { FollowUpFilters, FollowUpItem } from "../types";
import { EndingChip, MissedAgo, TriesSummary } from "./follow-up-bits";
import { FollowUpLogButton, LogFollowUpButton } from "./follow-up-dialogs";

type Shared = { t: Dictionary; locale: Locale; today: string; isAdmin: boolean };

// Missed visits: a table from 1280px (room for the actions beside the
// sidebar), cards below (two columns from 768px). Paging keeps the filters.
export function FollowUpList({ items, total, filters, ...shared }: Shared & { items: FollowUpItem[]; total: number; filters: FollowUpFilters }) {
  const { t, locale } = shared;
  const f = t.followUps;
  const open = filters.tab === "open";
  const hasFilters = Boolean(filters.q || filters.purok || filters.from || filters.to || filters.tried);
  const pages = Math.max(1, Math.ceil(total / FOLLOW_UPS_PAGE_SIZE));

  if (items.length === 0) {
    return (
      <p className="rounded-2xl bg-white px-6 py-10 text-center text-ink-soft shadow-[var(--shadow-soft)]">
        {hasFilters ? f.empty : open ? f.emptyOpen : f.emptyClosed}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-soft">{total === 1 ? f.countOne : format(f.count, { count: total })}</p>

      <div className="hidden overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)] xl:block">
        <table className="w-full text-left text-[0.95rem]">
          <thead className="border-b border-line text-caption font-semibold text-ink-soft">
            <tr>
              <th scope="col" className="px-5 py-3.5 font-semibold">{f.columns.mother}</th>
              <th scope="col" className="px-3 py-3.5 font-semibold">{f.columns.missed}</th>
              <th scope="col" className="px-3 py-3.5 font-semibold">{f.columns.tries}</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">
                {open ? <span className="sr-only">{f.columns.actions}</span> : f.columns.ending}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((item) => (
              <tr key={item.appointmentId} className="align-top">
                <td className="px-5 py-4">
                  <div className="flex flex-col items-start gap-1">
                    <Link href={recordFollowUpsHref(item.mother.id)} className="font-semibold text-ink no-underline hover:text-leaf hover:underline">
                      {item.mother.name}
                    </Link>
                    <a
                      href={`tel:${item.mother.contactNumber}`}
                      className="tnum inline-flex items-center gap-1.5 text-sm text-leaf underline decoration-1 underline-offset-4 hover:decoration-2"
                    >
                      <CallIcon aria-hidden className="size-4" />
                      <span className="sr-only">{format(f.call, { name: item.mother.name })}: </span>
                      {item.mother.contactNumber}
                    </a>
                    <span className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
                      <LocationIcon aria-hidden className="size-4" />
                      {item.mother.purok ?? f.noPurokYet}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-4">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{item.service}</p>
                    <p className="tnum text-sm text-ink-soft">{formatSlot(item.missedAt, locale, "short")}</p>
                    {open && <MissedAgo t={t} daysAgo={item.daysAgo} />}
                  </div>
                </td>
                <td className="px-3 py-4">
                  <div className="flex flex-col gap-0.5">
                    <TriesSummary t={t} locale={locale} entries={item.entries} />
                    <FollowUpLogButton item={item} today={shared.today} isAdmin={shared.isAdmin} />
                  </div>
                </td>
                <td className={open ? "w-px px-5 py-4" : "px-5 py-4"}>
                  {open ? (
                    <div className="flex justify-end gap-2">
                      <LogFollowUpButton item={item} today={shared.today} />
                      <Button asChild size="sm" variant="soft">
                        <Link href={rebookHref(item.appointmentId)} aria-label={format(f.rebookFor, { name: item.mother.name })}>
                          <AppointmentIcon weight="bold" aria-hidden />
                          {f.rebook}
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    item.ending && <EndingChip t={t} locale={locale} ending={item.ending} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 md:grid-cols-2 xl:hidden">
        {items.map((item) => (
          <li key={item.appointmentId}>
            <FollowUpCard {...shared} item={item} open={open} />
          </li>
        ))}
      </ul>

      <Pager
        page={filters.page}
        pages={pages}
        hrefFor={(page) => followUpsHref(filters, { page })}
        labels={{ prev: f.prev, next: f.next, page: f.page }}
      />
    </div>
  );
}

function FollowUpCard({ t, locale, today, isAdmin, item, open }: Shared & { item: FollowUpItem; open: boolean }) {
  const f = t.followUps;
  return (
    <article className="flex h-full flex-col gap-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
      {open && <MissedAgo t={t} daysAgo={item.daysAgo} />}
      <div className="flex flex-col gap-1">
        <Link href={recordFollowUpsHref(item.mother.id)} className="self-start font-semibold break-words text-ink no-underline hover:text-leaf hover:underline">
          {item.mother.name}
        </Link>
        <p className="font-medium break-words">{item.service}</p>
        <p className="tnum text-sm text-ink-soft">{formatSlot(item.missedAt, locale, "short")}</p>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
          <span className="tnum inline-flex items-center gap-1.5">
            <PhoneIcon aria-hidden className="size-4" />
            {item.mother.contactNumber}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <LocationIcon aria-hidden className="size-4" />
            {item.mother.purok ?? f.noPurokYet}
          </span>
        </p>
      </div>
      <div className="flex flex-col gap-0.5 border-t border-line pt-3">
        <TriesSummary t={t} locale={locale} entries={item.entries} />
        <FollowUpLogButton item={item} today={today} isAdmin={isAdmin} />
      </div>
      {open ? (
        <div className="mt-auto grid grid-cols-2 gap-2">
          <LogFollowUpButton item={item} today={today} className="col-span-2 h-11" />
          <Button asChild variant="secondary" className="px-4">
            <a href={`tel:${item.mother.contactNumber}`} aria-label={format(f.call, { name: item.mother.name })}>
              <CallIcon weight="bold" aria-hidden />
              {f.callButton}
            </a>
          </Button>
          <Button asChild variant="soft" className="px-4">
            <Link href={rebookHref(item.appointmentId)} aria-label={format(f.rebookFor, { name: item.mother.name })}>
              <AppointmentIcon weight="bold" aria-hidden />
              {f.rebook}
            </Link>
          </Button>
        </div>
      ) : (
        item.ending && (
          <div className="mt-auto">
            <EndingChip t={t} locale={locale} ending={item.ending} />
          </div>
        )
      )}
    </article>
  );
}
