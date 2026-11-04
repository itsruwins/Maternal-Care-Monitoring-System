import Link from "next/link";
import { CaretLeftIcon, CaretRightIcon, PlusIcon } from "@/components/icons";
import { Pager } from "@/components/shared/pager";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { addMonths, isWeekday } from "@/lib/appointments/slots";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { formatDate, parseISODate, toISODate } from "@/lib/utils/pregnancy";
import { cn } from "@/lib/utils/cn";
import { appointmentsListHref } from "../paths";
import {
  APPOINTMENTS_PAGE_SIZE,
  getHubCounts,
  getStaffSlotData,
  listAppointments,
  listMonth,
  listRequests,
  listServices,
  parseAppointmentFilters,
} from "../queries/appointments";
import type { AppointmentFilters, HubCounts as Counts, ListTabCounts, Service, SlotData, StaffAppointment } from "../types";
import { AppointmentRows } from "./appointment-rows";
import { AppointmentToolbar } from "./appointment-toolbar";
import { HubCounts } from "./hub-counts";
import { ListTabs } from "./list-tabs";
import { RequestCard } from "./request-card";

const VIEWS = ["queue", "list", "calendar"] as const;
type View = (typeof VIEWS)[number];

type Params = Record<string, string | string[] | undefined>;
const one = (params: Params, key: string) => {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value) ?? "";
};

// /staff/appointments?view=queue|list|calendar. Reads the session and the
// address: render inside <Suspense>.
export async function AppointmentsScreen({ searchParams }: { searchParams: Promise<Params> }) {
  const user = await requireRole(AREA_ROLES.staff);
  const isAdmin = user.role === "ADMIN";
  const params = await searchParams;
  const view: View = VIEWS.includes(one(params, "view") as View) ? (one(params, "view") as View) : "queue";
  const today = manilaTodayISO();
  const now = new Date().toISOString();
  const [{ t, locale }, slots, counts] = await Promise.all([getServerI18n(), getStaffSlotData(today), getHubCounts(today)]);

  let body;
  if (view === "queue") {
    body = <QueueView t={t} locale={locale} items={await listRequests()} slots={slots} today={today} now={now} />;
  } else if (view === "list") {
    const filters = parseAppointmentFilters(params);
    const [{ items, total, counts: tabCounts }, services] = await Promise.all([listAppointments(filters, today), listServices()]);
    body = (
      <ListView
        t={t}
        locale={locale}
        items={items}
        total={total}
        counts={tabCounts}
        filters={filters}
        services={services}
        slots={slots}
        today={today}
        now={now}
        isAdmin={isAdmin}
      />
    );
  } else {
    const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(one(params, "month")) ? one(params, "month") : today.slice(0, 7);
    const day = /^\d{4}-\d{2}-\d{2}$/.test(one(params, "day")) && one(params, "day").startsWith(month) ? one(params, "day") : month === today.slice(0, 7) ? today : `${month}-01`;
    const { byDay, closedDays } = await listMonth(month);
    body = (
      <CalendarView t={t} locale={locale} month={month} day={day} today={today} byDay={byDay} closedDays={closedDays} slots={slots} now={now} isAdmin={isAdmin} />
    );
  }

  return (
    <AppointmentsView t={t} view={view} counts={counts} today={today}>
      {body}
    </AppointmentsView>
  );
}

// The page frame around the chosen view: title, intro and Book appointment,
// the four counts, then the Requests / List / Calendar tabs (Requests with
// its rose count while any wait).
export function AppointmentsView({ t, view, counts, today, children }: { t: Dictionary; view: View; counts: Counts; today: string; children: React.ReactNode }) {
  const a = t.appointments;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-title font-extrabold">{a.title}</h1>
          <p className="mt-2 text-ink-soft">{a.intro}</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/staff/appointments/new" className="no-underline">
            <PlusIcon weight="bold" aria-hidden />
            {a.book}
          </Link>
        </Button>
      </div>
      <HubCounts t={t} counts={counts} today={today} />
      <nav aria-label={a.viewsLabel} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-1 rounded-full bg-white p-1.5 shadow-[var(--shadow-soft)]">
          {VIEWS.map((key) => {
            const active = key === view;
            return (
              <li key={key}>
                <Link
                  href={key === "queue" ? "?" : `?view=${key}`}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-full px-4 text-[0.95rem] whitespace-nowrap no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid",
                    active ? "bg-mint font-semibold text-leaf" : "font-medium text-ink-soft hover:bg-cream hover:text-ink",
                  )}
                >
                  {a.views[key]}
                  {key === "queue" && counts.requests > 0 && (
                    <span className="tnum grid h-6 min-w-6 place-items-center rounded-full bg-rose-deep px-1.5 text-caption font-bold text-white">{counts.requests}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {children}
    </div>
  );
}

/** Waiting requests, oldest first, as booking tickets (two across from 1280px). */
export function QueueView({
  t,
  locale,
  items,
  slots,
  today,
  now,
}: {
  t: Dictionary;
  locale: Locale;
  items: StaffAppointment[];
  slots: SlotData;
  today: string;
  now: string;
}) {
  const a = t.appointments;
  if (items.length === 0) {
    return <p className="rounded-2xl bg-white px-6 py-10 text-center text-ink-soft shadow-[var(--shadow-soft)]">{a.queueEmpty}</p>;
  }
  return (
    <section aria-labelledby="queue-title" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <h2 id="queue-title" className="text-lg font-bold">
          {items.length === 1 ? a.queue.countOne : format(a.queue.count, { count: items.length })}
        </h2>
        <p className="text-sm text-ink-soft">{a.queueIntro}</p>
      </div>
      <ul className="grid gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <li key={item.id}>
            <RequestCard t={t} locale={locale} appointment={item} slots={slots} today={today} now={now} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The status tabs, then one card: the toolbar, the rows by day, and the pager. */
export function ListView({
  t,
  locale,
  items,
  total,
  counts,
  filters,
  services,
  slots,
  today,
  now,
  isAdmin = false,
}: {
  t: Dictionary;
  locale: Locale;
  items: StaffAppointment[];
  total: number;
  counts: ListTabCounts;
  filters: AppointmentFilters;
  services: Service[];
  slots: SlotData;
  /** Manila date. */
  today: string;
  /** The current instant (ISO), for "Date passed" on requests. */
  now: string;
  /** Admins: failed reminders link to the SMS log. */
  isAdmin?: boolean;
}) {
  const l = t.appointments.list;
  const hasFilters = Boolean(filters.q || filters.service || filters.from || filters.to);
  const pages = Math.max(1, Math.ceil(total / APPOINTMENTS_PAGE_SIZE));
  const hidden: Record<string, string> = { view: "list" };
  if (filters.status) hidden.status = filters.status;
  const first = (filters.page - 1) * APPOINTMENTS_PAGE_SIZE + 1;

  return (
    <div className="flex flex-col gap-4">
      <ListTabs t={t} filters={filters} counts={counts} />
      <AppointmentToolbar
        values={{ q: filters.q, service: String(filters.service), from: filters.from, to: filters.to }}
        hidden={hidden}
        services={[{ value: "", label: l.allServices }, ...services.map((service) => ({ value: String(service.id), label: service.name }))]}
        labels={{
          form: l.filtersLabel,
          search: l.search,
          placeholder: l.searchPlaceholder,
          service: l.service,
          from: l.from,
          to: l.to,
          clear: l.clear,
          updating: l.updating,
        }}
        clearHref={hasFilters ? appointmentsListHref(filters, { q: "", service: "", from: "", to: "" }) : null}
      >
        {items.length === 0 ? (
          <p className="px-6 py-12 text-center text-ink-soft">{hasFilters ? l.empty : l.emptyTab}</p>
        ) : (
          <>
            <AppointmentRows t={t} locale={locale} items={items} slots={slots} today={today} now={now} isAdmin={isAdmin} />
            <div className="flex flex-col gap-3 border-t border-line bg-milk px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="tnum text-sm text-ink-soft">{format(l.showing, { from: first, to: first + items.length - 1, total })}</p>
              <Pager page={filters.page} pages={pages} hrefFor={(page) => appointmentsListHref(filters, { page })} labels={{ prev: l.prev, next: l.next, page: l.page }} />
            </div>
          </>
        )}
      </AppointmentToolbar>
    </div>
  );
}

export function CalendarView({
  t,
  locale,
  month,
  day,
  today,
  byDay,
  closedDays,
  slots,
  now,
  isAdmin = false,
}: {
  t: Dictionary;
  locale: Locale;
  month: string;
  day: string;
  today: string;
  byDay: Record<string, StaffAppointment[]>;
  closedDays: string[];
  slots: SlotData;
  /** The current instant (ISO), for "Date passed" on requests. */
  now: string;
  /** Admins: failed reminders link to the SMS log. */
  isAdmin?: boolean;
}) {
  const c = t.appointments.calendar;
  const tag = locale === "fil" ? "fil-PH" : "en-PH";
  const start = parseISODate(`${month}-01`)!;
  const daysInMonth = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)).getUTCDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: start.getUTCDay() }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => toISODate(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), i + 1)))),
  ];
  const weekdays = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(tag, { timeZone: "UTC", weekday: "short" }).format(new Date(Date.UTC(2023, 0, 1 + i))));
  const title = new Intl.DateTimeFormat(tag, { timeZone: "UTC", month: "long", year: "numeric" }).format(start);
  const closed = new Set(closedDays);
  const monthHref = (m: string) => `?view=calendar&month=${m}`;
  const dayItems = byDay[day] ?? [];
  const countLabel = (count: number) => (count === 1 ? c.bookedOne : format(c.booked, { count }));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
      <section aria-labelledby="calendar-title" className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <Link href={monthHref(addMonths(`${month}-01`, -1).slice(0, 7))} scroll={false} aria-label={c.prevMonth} className="grid size-10 place-items-center rounded-full text-ink hover:bg-cream">
            <CaretLeftIcon weight="bold" aria-hidden className="size-5" />
          </Link>
          <h2 id="calendar-title" className="text-lg font-bold">
            {title}
          </h2>
          <Link href={monthHref(addMonths(`${month}-01`, 1).slice(0, 7))} scroll={false} aria-label={c.nextMonth} className="grid size-10 place-items-center rounded-full text-ink hover:bg-cream">
            <CaretRightIcon weight="bold" aria-hidden className="size-5" />
          </Link>
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {weekdays.map((name, i) => (
            <span key={i} aria-hidden className="pb-1 text-center text-caption font-semibold text-ink-soft">
              {name}
            </span>
          ))}
          {cells.map((date, i) => {
            if (!date) return <span key={`blank-${i}`} />;
            const count = byDay[date]?.length ?? 0;
            const isClosed = closed.has(date);
            const selected = date === day;
            const weekend = !isWeekday(date);
            return (
              <Link
                key={date}
                href={`?view=calendar&month=${month}&day=${date}`}
                scroll={false}
                aria-current={selected ? "date" : undefined}
                aria-label={`${formatDate(date, locale)}${isClosed ? `, ${c.closed}` : count ? `, ${countLabel(count)}` : ""}`}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-start gap-1 rounded-xl px-0.5 pt-1.5 pb-1 no-underline transition-colors sm:min-h-20",
                  selected ? "bg-leaf text-white" : "text-ink hover:bg-cream",
                  !selected && (weekend || isClosed) && "text-ink-soft/50",
                  !selected && date === today && "ring-2 ring-leaf ring-inset",
                )}
              >
                <span className="tnum text-[0.95rem] font-semibold">{Number(date.slice(8))}</span>
                {isClosed ? (
                  <span className={cn("text-caption leading-none font-semibold", selected ? "text-white" : "text-rose-deep")}>{c.closed}</span>
                ) : count > 0 ? (
                  <span className={cn("tnum grid h-6 min-w-6 place-items-center rounded-full px-1 text-caption font-bold", selected ? "bg-white text-leaf" : "bg-mint text-leaf")}>
                    {count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="day-title" className="flex flex-col gap-3">
        <h2 id="day-title" className="text-lg font-bold">
          {formatDate(day, locale)}
          {closed.has(day) && <span className="ml-2 text-sm font-semibold text-rose-deep">· {c.closed}</span>}
        </h2>
        {dayItems.length === 0 ? (
          <p className="rounded-2xl bg-white px-6 py-8 text-center text-ink-soft shadow-[var(--shadow-soft)]">{c.dayEmpty}</p>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)]">
            <AppointmentRows t={t} locale={locale} items={dayItems} slots={slots} today={today} now={now} isAdmin={isAdmin} grouped={false} stacked />
          </div>
        )}
      </section>
    </div>
  );
}
