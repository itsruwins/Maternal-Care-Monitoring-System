import Link from "next/link";
import type { ReactNode } from "react";
import { CheckCircleIcon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import { recordFollowUpsHref } from "@/features/follow-ups/paths";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatMonthDay, formatSlotClock } from "@/lib/appointments/format";
import { DASHBOARD_LINKS, motherAppointmentsHref, SMS_LINKS } from "../paths";
import type { DashboardCounts, FollowUpItem, RequestItem } from "../types";
import { CardLink, DashCard } from "./dash-card";

/** Admins also see text problems here. */
export type SmsAttention = { failed: number; phoneOffline: boolean };

// "Needs attention": the people waiting on staff, grouped. Waiting requests
// (first come first served) and missed visits still to follow up (oldest
// first), a few of each with "See all N" for the rest; for admins, failed
// texts and an offline SMS phone. Only what needs someone is shown; with
// nothing waiting, one calm "All caught up".
export function AttentionCard({
  t,
  locale,
  counts,
  requests,
  followUps,
  sms,
}: {
  t: Dictionary;
  locale: Locale;
  counts: DashboardCounts;
  requests: RequestItem[];
  followUps: FollowUpItem[];
  sms: SmsAttention | null;
}) {
  const a = t.dashboard.attention;
  const day = (iso: string) => formatMonthDay(iso, locale).replace(/ /g, " ");
  const smsRows = sms ? smsLines(t, sms) : [];
  const total = counts.requests + counts.followUps + smsRows.length;

  return (
    <DashCard
      id="dash-attention"
      title={a.title}
      badge={
        total > 0 ? (
          <span className="tnum inline-grid h-6 min-w-6 place-items-center rounded-full bg-rose-deep px-1.5 text-caption font-semibold text-white">
            {total}
          </span>
        ) : undefined
      }
    >
      {total === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 pt-4 pb-8 text-center">
          <IconCircle icon={CheckCircleIcon} tone="mint" size="md" />
          <p className="mt-1 font-semibold text-ink">{a.clear}</p>
          <p className="text-sm text-ink-soft">{a.clearBody}</p>
        </div>
      ) : (
        <div className="@container divide-y divide-line px-5 pb-2 sm:px-6 sm:pb-3">
          {counts.requests > 0 && (
            <Group
              title={t.dashboard.counts.requests}
              count={counts.requests}
              shown={requests.length}
              href={DASHBOARD_LINKS.requests}
              seeAll={a.seeAll}
              open={a.open}
            >
              {requests.map((item) => (
                <Row
                  key={item.appointmentId}
                  href={motherAppointmentsHref(item.motherId)}
                  name={item.name}
                  detail={item.service}
                  aside={format(a.requestFor, { date: `${day(item.at)}, ${formatSlotClock(item.at, locale)}` })}
                />
              ))}
            </Group>
          )}
          {counts.followUps > 0 && (
            <Group
              title={t.dashboard.counts.followUps}
              count={counts.followUps}
              shown={followUps.length}
              href={DASHBOARD_LINKS.followUps}
              seeAll={a.seeAll}
              open={a.open}
            >
              {followUps.map((item) => (
                <Row
                  key={item.appointmentId}
                  href={recordFollowUpsHref(item.motherId)}
                  name={item.name}
                  detail={item.service}
                  aside={format(a.missedOn, { date: day(item.missedAt) })}
                  alert
                />
              ))}
            </Group>
          )}
          {smsRows.length > 0 && (
            <section aria-label={a.sms} className="py-3">
              <h3 className="flex min-h-11 items-center text-sm font-semibold text-ink">{a.sms}</h3>
              <ul className="flex flex-col gap-1">
                {smsRows.map((row) => (
                  <li key={row.href + row.text}>
                    <Link
                      href={row.href}
                      className="-mx-2 flex min-h-11 items-center gap-2.5 rounded-xl px-2 text-[0.95rem] font-medium text-rose-deep no-underline transition-colors hover:bg-milk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid"
                    >
                      <span aria-hidden className="size-2 shrink-0 rounded-full bg-rose-deep" />
                      {row.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </DashCard>
  );
}

function smsLines(t: Dictionary, sms: SmsAttention) {
  const a = t.dashboard.attention;
  const rows: { text: string; href: string }[] = [];
  if (sms.phoneOffline) rows.push({ text: a.phoneOffline, href: SMS_LINKS.page });
  if (sms.failed > 0) rows.push({ text: sms.failed === 1 ? a.failedOne : format(a.failed, { count: sms.failed }), href: SMS_LINKS.failed });
  return rows;
}

function Group({
  title,
  count,
  shown,
  href,
  seeAll,
  open,
  children,
}: {
  title: string;
  count: number;
  shown: number;
  href: string;
  seeAll: string;
  open: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={title} className="py-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
          {title}
          <span className="tnum font-bold text-rose-deep">{count}</span>
        </h3>
        <CardLink href={href}>{count > shown ? format(seeAll, { count }) : open}</CardLink>
      </div>
      <ul className="flex flex-col">{children}</ul>
    </section>
  );
}

function Row({ href, name, detail, aside, alert = false }: { href: string; name: string; detail: string; aside: string; alert?: boolean }) {
  return (
    <li className="flex flex-col gap-x-4 gap-y-0.5 py-2 @[22rem]:flex-row @[22rem]:items-start @[22rem]:justify-between">
      <span className="min-w-0 @[22rem]:min-w-[50%] @[22rem]:flex-1">
        <Link href={href} className="block font-semibold break-words text-ink no-underline hover:text-leaf hover:underline">
          {name}
        </Link>
        <span className="block text-sm break-words text-ink-soft">{detail}</span>
      </span>
      <span className={`tnum min-w-0 text-sm @[22rem]:pt-0.5 @[22rem]:text-right ${alert ? "font-medium text-rose-deep" : "text-ink-soft"}`}>{aside}</span>
    </li>
  );
}
