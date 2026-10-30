import { Suspense } from "react";
import { notFound } from "next/navigation";
import { FollowUpsView } from "@/features/follow-ups/components/follow-ups-screen";
import { parseFollowUpFilters } from "@/features/follow-ups/queries/follow-ups";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";
import { PreviewOffer } from "./preview-offer";
import { SAMPLE_CLOSED, SAMPLE_OPEN, SAMPLE_PUROKS, SAMPLE_TODAY } from "./sample";

export const metadata = { title: "Follow-ups preview", robots: { index: false } };

// Development only (preview): the staff Follow-ups page with sample data.
// ?tab=closed, ?admin=1 (Delete in the log), ?empty=1, ?show=offer (the
// "Book a new appointment?" step).
export default function FollowUpsPreview({ searchParams }: PageProps<"/[lang]/design-preview/follow-ups">) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Suspense fallback={null}>
      <Preview searchParams={searchParams} />
    </Suspense>
  );
}

async function Preview({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { t, locale } = await getServerI18n();
  const params = await searchParams;
  const filters = parseFollowUpFilters(params);
  const isAdmin = params.admin === "1";
  const sample = params.empty === "1" ? [] : filters.tab === "closed" ? SAMPLE_CLOSED : SAMPLE_OPEN;
  // Admins may change any follow-up (the real list works this out per entry).
  const items = isAdmin ? sample.map((item) => ({ ...item, entries: item.entries.map((entry) => ({ ...entry, canEdit: true })) })) : sample;
  const user = isAdmin
    ? { username: "taysan.admin", role: "ADMIN" as const, firstName: "Liza", fullName: "Liza Ramos" }
    : { username: "joy.dela.cruz", role: "HEALTH_WORKER" as const, firstName: "Joy", fullName: "Joy Dela Cruz" };
  return (
    <StaffShell user={user}>
      <FollowUpsView
        t={t}
        locale={locale}
        items={items}
        total={items.length}
        openCount={SAMPLE_OPEN.length}
        filters={filters}
        puroks={SAMPLE_PUROKS}
        today={SAMPLE_TODAY}
        isAdmin={isAdmin}
      />
      {params.show === "offer" && <PreviewOffer item={SAMPLE_OPEN[2]} />}
    </StaffShell>
  );
}
