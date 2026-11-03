import Link from "next/link";
import { CaretLeftIcon, PhoneIcon, PregnancyIcon, UserIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/icon-circle";
import { Input } from "@/components/ui/input";
import { InputIcon } from "@/components/ui/input-icon";
import { Label } from "@/components/ui/label";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { findBookableMothers, getStaffSlotData, listServices } from "../queries/appointments";
import type { BookableMother, Service, SlotData } from "../types";
import { BookAppointmentForm } from "./book-appointment-form";

type Params = Record<string, string | string[] | undefined>;

// /staff/appointments/new?mother=ID (or ?q= to search). Reads the session:
// render inside <Suspense>.
export async function BookAppointmentScreen({ searchParams }: { searchParams: Promise<Params> }) {
  await requireRole(AREA_ROLES.staff);
  const params = await searchParams;
  const value = (key: string) => {
    const raw = params[key];
    return (Array.isArray(raw) ? raw[0] : raw) ?? "";
  };
  const today = manilaTodayISO();
  const motherId = /^[1-9]\d{0,9}$/.test(value("mother")) ? Number(value("mother")) : null;
  const q = value("q").slice(0, 60);
  const [{ t }, services, slots, found] = await Promise.all([
    getServerI18n(),
    listServices(),
    getStaffSlotData(today),
    motherId ? findBookableMothers({ id: motherId }, today) : q ? findBookableMothers({ q }, today) : Promise.resolve([]),
  ]);
  return (
    <BookAppointmentView
      t={t}
      q={q}
      mother={motherId ? (found[0] ?? null) : null}
      results={motherId ? [] : found}
      searched={!motherId && Boolean(q)}
      services={services}
      slots={slots}
    />
  );
}

// The page layout, without data loading (also used by the dev preview).
export function BookAppointmentView({
  t,
  q,
  mother,
  results,
  searched,
  services,
  slots,
}: {
  t: Dictionary;
  q: string;
  mother: BookableMother | null;
  results: BookableMother[];
  searched: boolean;
  services: Service[];
  slots: SlotData;
}) {
  const b = t.appointments.bookPage;
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/staff/appointments"
        className="-my-3 inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2"
      >
        <CaretLeftIcon weight="bold" aria-hidden className="size-4" />
        {b.back}
      </Link>
      <div>
        <h1 className="text-title font-extrabold">{b.title}</h1>
        <p className="mt-2 max-w-[60ch] text-ink-soft">{b.intro}</p>
      </div>

      <section aria-labelledby="book-mother" className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
        <h2 id="book-mother" className="mb-4 text-lg font-bold">
          {b.mother}
        </h2>
        {mother ? (
          <div className="flex flex-wrap items-center gap-4">
            <IconCircle icon={PregnancyIcon} tone="blush" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold break-words">{mother.name}</p>
              <p className="tnum flex flex-wrap gap-x-3 text-sm text-ink-soft">
                <span className="inline-flex items-center gap-1">
                  <PhoneIcon aria-hidden className="size-4" />
                  {mother.contactNumber}
                </span>
                {mother.weeks !== null && <span>{format(b.week, { weeks: mother.weeks })}</span>}
              </p>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href="/staff/appointments/new">{b.change}</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <form method="get" className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor="book-q">{b.searchLabel}</Label>
                <InputIcon icon={UserIcon}>
                  <Input id="book-q" name="q" defaultValue={q} placeholder={b.searchPlaceholder} className="pl-11" />
                </InputIcon>
              </div>
              <Button type="submit" className="h-12">
                {b.search}
              </Button>
            </form>
            {searched &&
              (results.length === 0 ? (
                <p className="text-ink-soft">{b.noMatches}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-ink-soft">{b.pickMother}</p>
                  <ul className="divide-y divide-line rounded-2xl border border-line">
                    {results.map((result) => (
                      <li key={result.id}>
                        <Link
                          href={`?mother=${result.id}`}
                          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 no-underline hover:bg-milk"
                        >
                          <span className="font-semibold text-ink">{result.name}</span>
                          <span className="tnum text-sm text-ink-soft">
                            {result.contactNumber}
                            {result.weeks !== null && ` · ${format(b.week, { weeks: result.weeks })}`}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        )}
      </section>

      {mother && <BookAppointmentForm mother={mother} services={services} slots={slots} />}
    </div>
  );
}
