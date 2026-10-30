import Link from "next/link";
import { CaretLeftIcon, CaretRightIcon, PlusIcon } from "@/components/icons";
import { Pager } from "@/components/shared/pager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { formatSlot } from "@/lib/appointments/format";
import { addMonths, isWeekday, manilaSlot } from "@/lib/appointments/slots";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { formatDate, parseISODate, toISODate } from "@/lib/utils/pregnancy";
import { cn } from "@/lib/utils/cn";
import type { AppointmentStatus } from "@/types/database";
import {
  APPOINTMENTS_PAGE_SIZE,
  countRequests,
  getStaffSlotData,
  listAppointments,
  listMonth,
  listRequests,
  listServices,
  parseAppointmentFilters,
} from "../queries/appointments";
import type { AppointmentFilters, Service, SlotData, StaffAppointment } from "../types";
import { AppointmentActions } from "./appointment-actions";
import { DatePassedLine, FollowUpsLink, ReminderLine, StatusChip, requestPassed } from "./appointment-bits";
import { AppointmentCard } from "./appointment-card";

const VIEWS = ["queue", "list", "calendar"] as const;
type View = (typeof VIEWS)[number];
const STATUSES: AppointmentStatus[] = ["REQUESTED", "CONFIRMED", "RESCHEDULED", "COMPLETED", "MISSED", "CANCELLED"];

type Params = Record<string, string | string[] | undefined>;
const one = (params: Params, key: string) => {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value) ?? "";
};

// /staff/appointments?view=queue|list|calendar. Reads the session and the
// address: render inside <Suspense>.
export async function AppointmentsScreen({ searchParams }: { searchParams: Promise<Params> }) {
  await requireRole(AREA_ROLES.staff);
  const params = await searchParams;
  const view: View = VIEWS.includes(one(params, "view") as View) ? (one(params, "view") as View) : "queue";
  const today = manilaTodayISO();
  const now = new Date().toISOString();
  const [{ t, locale }, slots, requestCount] = await Promise.all([getServerI18n(), getStaffSlotData(today), countRequests()]);

  let body;
  if (view === "queue") {
    body = <QueueView t={t} locale={locale} items={await listRequests()} slots={slots} now={now} />;
  } else if (view === "list") {
    const filters = parseAppointmentFilters(params);
    const [{ items, total }, services] = await Promise.all([listAppointments(filters), listServices()]);
    body = <ListView t={t} locale={locale} items={items} total={total} filters={filters} services={services} slots={slots} today={today} now={now} />;
  } else {
    const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(one(params, "month")) ? one(params, "month") : today.slice(0, 7);
    const day = /^\d{4}-\d{2}-\d{2}$/.test(one(params, "day")) && one(params, "day").startsWith(month) ? one(params, "day") : month === today.slice(0, 7) ? today : `${month}-01`;
    const { byDay, closedDays } = await listMonth(month);
    body = <CalendarView t={t} locale={locale} month={month} day={day} today={today} byDay={byDay} closedDays={closedDays} slots={slots} now={now} />;
  }

  return <AppointmentsView t={t} view={view} requestCount={requestCount}>{body}</AppointmentsView>;
}

// Header, Book button and the view tabs around the chosen view.
export function AppointmentsView({ t, view, requestCount, children }: { t: Dictionary; view: View; requestCount: number; children: React.ReactNode }) {
  const a = t.appointments;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-title font-extrabold">{a.title}</h1>
          <p className="mt-2 text-ink-soft">{a.intro}</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/staff/appointments/new">
            <PlusIcon weight="bold" aria-hidden />
            {a.book}
          </Link>
        </Button>
      </div>
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
                    "flex h-10 items-center gap-2 rounded-full px-4 text-[0.95rem] whitespace-nowrap no-underline transition-colors",
                    active ? "bg-mint font-semibold text-leaf" : "font-medium text-ink-soft hover:bg-cream hover:text-ink",
                  )}
                >
                  {a.views[key]}
                  {key === "queue" && requestCount > 0 && (
                    <span className="tnum grid h-6 min-w-6 place-items-center rounded-full bg-rose-deep px-1.5 text-caption font-bold text-white">{requestCount}</span>
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

export function QueueView({ t, locale, items, slots, now }: { t: Dictionary; locale: Locale; items: StaffAppointment[]; slots: SlotData; now: string }) {
  const a = t.appointments;
  if (items.length === 0) {
    return <p className="rounded-2xl bg-white px-6 py-10 text-center text-ink-soft shadow-[var(--shadow-soft)]">{a.queueEmpty}</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink-soft">{a.queueIntro}</p>
      <ul className="grid gap-3 lg:grid-cols-2">
        {items.map((item) => (
          <li key={item.id}>
            <AppointmentCard t={t} locale={locale} appointment={item} slots={slots} now={now} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ListView({
  t,
  locale,
  items,
  total,
  filters,
  services,
  slots,
  today,
  now,
}: {
  t: Dictionary;
  locale: Locale;
  items: StaffAppointment[];
  total: number;
  filters: AppointmentFilters;
  services: Service[];
  slots: SlotData;
  today?: string;
  /** The current instant (ISO), for "Date passed" on requests. */
  now: string;
}) {
  const l = t.appointments.list;
  const hasFilters = Boolean(filters.status || filters.service || filters.from || filters.to);
  const pages = Math.max(1, Math.ceil(total / APPOINTMENTS_PAGE_SIZE));
  const pageHref = (page: number) => {
    const params = new URLSearchParams({ view: "list" });
    if (filters.status) params.set("status", filters.status);
    if (filters.service) params.set("service", String(filters.service));
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (page > 1) params.set("page", String(page));
    return `?${params.toString()}`;
  };

  return (
    <div className="flex flex-col gap-4">
      <form method="get" className="grid gap-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] sm:grid-cols-2 sm:p-5 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end">
        <input type="hidden" name="view" value="list" />
        <div className="flex flex-col gap-2">
          <Label htmlFor="appt-status">{l.status}</Label>
          <NativeSelect id="appt-status" name="status" defaultValue={filters.status}>
            <option value="">{l.allStatuses}</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {t.appointments.statuses[status]}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="appt-service">{l.service}</Label>
          <NativeSelect id="appt-service" name="service" defaultValue={String(filters.service)}>
            <option value="">{l.allServices}</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="appt-from">{l.from}</Label>
          <Input id="appt-from" name="from" type="date" defaultValue={filters.from} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="appt-to">{l.to}</Label>
          <Input id="appt-to" name="to" type="date" defaultValue={filters.to} />
        </div>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
          <Button type="submit" className="h-12 flex-1 lg:flex-none">
            {l.submit}
          </Button>
          {hasFilters && (
            <Button asChild variant="ghost" className="h-12">
              <a href="?view=list">{l.clear}</a>
            </Button>
          )}
        </div>
      </form>

      {items.length === 0 ? (
        <p className="rounded-2xl bg-white px-6 py-10 text-center text-ink-soft shadow-[var(--shadow-soft)]">{l.empty}</p>
      ) : (
        <>
          <p className="text-sm text-ink-soft">{total === 1 ? l.resultsOne : format(l.results, { count: total })}</p>
          {/* Table from 1280px (room for the actions beside the sidebar) */}
          <div className="hidden overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)] xl:block">
            <table className="w-full text-left text-[0.95rem]">
              <thead className="border-b border-line text-caption font-semibold text-ink-soft">
                <tr>
                  <th scope="col" className="px-5 py-3.5 font-semibold">{l.columns.when}</th>
                  <th scope="col" className="px-3 py-3.5 font-semibold">{l.columns.mother}</th>
                  <th scope="col" className="px-3 py-3.5 font-semibold">{l.columns.service}</th>
                  <th scope="col" className="px-3 py-3.5 font-semibold">{l.columns.status}</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold"><span className="sr-only">{t.appointments.cancel}</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((item) => {
                  const passed = requestPassed(item, now);
                  return (
                    <tr key={item.id} className="align-top">
                      <td className="tnum px-5 py-3 whitespace-nowrap">{formatSlot(item.at, locale, "short")}</td>
                      <td className="px-3 py-3">
                        <Link href={`/staff/mothers/${item.mother.id}?tab=appointments`} className="font-semibold text-ink no-underline hover:text-leaf hover:underline">
                          {item.mother.name}
                        </Link>
                      </td>
                      <td className="px-3 py-3">{item.service}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col items-start gap-1.5">
                          <StatusChip t={t} status={item.status} />
                          {passed && <DatePassedLine t={t} />}
                          <ReminderLine t={t} locale={locale} appointment={item} />
                        </div>
                      </td>
                      <td className="w-px px-5 py-3">
                        {item.status === "MISSED" ? (
                          <div className="flex justify-end">
                            <FollowUpsLink t={t} mother={item.mother} />
                          </div>
                        ) : (
                          <AppointmentActions
                            appointment={{ id: item.id, status: item.status, at: item.at, hasLogin: item.mother.hasLogin }}
                            slots={slots}
                            className="flex-nowrap justify-end"
                            recordHref={
                              today && ["CONFIRMED", "RESCHEDULED"].includes(item.status) && manilaSlot(item.at).date === today
                                ? `/staff/visits/new?appointment=${item.id}`
                                : undefined
                            }
                            datePassed={passed}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Cards below 1280px */}
          <ul className="flex flex-col gap-3 xl:hidden">
            {items.map((item) => (
              <li key={item.id}>
                <AppointmentCard t={t} locale={locale} appointment={item} slots={slots} today={today} now={now} />
              </li>
            ))}
          </ul>
          <Pager page={filters.page} pages={pages} hrefFor={pageHref} labels={{ prev: l.prev, next: l.next, page: l.page }} />
        </>
      )}
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
      <section aria-labelledby="calendar-title" className="rounded-3xl bg-white p-4 shadow-[var(--shadow-soft)] sm:p-6">
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
          <ul className="flex flex-col gap-3">
            {dayItems.map((item) => (
              <li key={item.id}>
                <AppointmentCard t={t} locale={locale} appointment={item} slots={slots} showDate={false} today={today} now={now} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
