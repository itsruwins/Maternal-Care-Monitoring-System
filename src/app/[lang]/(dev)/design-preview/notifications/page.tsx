import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MotherShell } from "@/features/shell/components/mother-shell";
import { StaffShell } from "@/features/shell/components/staff-shell";
import type { UserRole } from "@/types/database";
import { BellDemo, KindList, type DemoState } from "./bell-demo";
import { ADMIN_KINDS, ADMIN_SAMPLE, HEALTH_WORKER_KINDS, HEALTH_WORKER_SAMPLE, MOTHER_KINDS, MOTHER_SAMPLE, NOW } from "./sample";

export const metadata = { title: "Notification bell preview", robots: { index: false } };

const ROLES = {
  admin: { role: "ADMIN", user: { username: "taysan.admin", role: "ADMIN", firstName: "Maria", fullName: "Maria Santos" }, items: ADMIN_SAMPLE, kinds: ADMIN_KINDS },
  health: { role: "HEALTH_WORKER", user: { username: "bhw.cruz", role: "HEALTH_WORKER", firstName: "Lorna", fullName: "Lorna Cruz" }, items: HEALTH_WORKER_SAMPLE, kinds: HEALTH_WORKER_KINDS },
  mother: { role: "MOTHER", user: { username: "ana.reyes", role: "MOTHER", firstName: "Ana", fullName: "Ana Reyes" }, items: MOTHER_SAMPLE, kinds: MOTHER_KINDS },
} as const;

const STATES: DemoState[] = ["default", "many", "empty", "loading", "error"];

// Development only (Phase 10 step 2): the notification bell on sample data,
// in the real staff and mother headers. ?role=admin (default), health or
// mother; ?state=many (every one unread, "9+"), empty, loading or error;
// ?open=0 starts with the panel closed. "Now" is Thu, Nov 5, 11:00 AM.
export default function NotificationsPreview({ searchParams }: PageProps<"/[lang]/design-preview/notifications">) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Suspense fallback={null}>
      <Preview searchParams={searchParams} />
    </Suspense>
  );
}

async function Preview({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const roleKey = (["admin", "health", "mother"] as const).find((key) => key === query.role) ?? "admin";
  const state = STATES.find((each) => each === query.state) ?? "default";
  const open = query.open !== "0";
  const { role, user, items, kinds } = ROLES[roleKey];

  const bell = <BellDemo key={`${roleKey}-${state}`} role={role as UserRole} items={[...items]} state={state} now={NOW} open={open} />;
  const link = (params: Record<string, string>) => `/design-preview/notifications?${new URLSearchParams({ role: roleKey, state, ...params })}`;

  const content = (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <h1 className="text-title font-extrabold tracking-[-0.02em]">Notification bell</h1>
        <p className="mt-2 max-w-[60ch] text-ink-soft">
          Sample notifications (preview only). &ldquo;Now&rdquo; is Thu, Nov 5, 11:00 AM. Clicking a row marks it read until the page is reloaded.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {(["admin", "health", "mother"] as const).map((key) => (
            <PreviewPill key={key} href={`/design-preview/notifications?role=${key}`} current={key === roleKey}>
              {key === "admin" ? "Admin" : key === "health" ? "Health worker" : "Mother"}
            </PreviewPill>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {STATES.map((each) => (
            <PreviewPill key={each} href={link({ state: each })} current={each === state}>
              {each === "default" ? "Sample list" : each === "many" ? "All unread (9+)" : each[0].toUpperCase() + each.slice(1)}
            </PreviewPill>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-[var(--shadow-soft)] sm:p-6">
        <h2 className="px-3 text-xl font-bold tracking-[-0.01em]">Every kind ({kinds.length})</h2>
        <p className="mt-1 px-3 text-sm text-ink-soft">Each notification this role can get, as its row reads.</p>
        <div className="mt-3">
          <KindList role={role as UserRole} items={[...kinds]} now={NOW} />
        </div>
      </section>
    </div>
  );

  return roleKey === "mother" ? (
    <MotherShell previewPath="/mother" user={user} notifications={bell}>
      {content}
    </MotherShell>
  ) : (
    <StaffShell user={user} notifications={bell}>
      {content}
    </StaffShell>
  );
}

function PreviewPill({ href, current, children }: { href: string; current: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={
        current
          ? "inline-flex min-h-11 items-center rounded-full bg-mint px-4 text-sm font-semibold text-leaf no-underline"
          : "inline-flex min-h-11 items-center rounded-full bg-cream px-4 text-sm font-medium text-ink no-underline hover:bg-beige"
      }
    >
      {children}
    </Link>
  );
}
