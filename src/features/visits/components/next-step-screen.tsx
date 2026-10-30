import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/icon-circle";
import { NextCheckupPanel } from "@/features/appointments/components/next-checkup-panel";
import { format } from "@/i18n/format";
import { getServerI18n } from "@/i18n/server";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { getSavedVisit } from "../queries/visits";

// /staff/visits/[visitId]/next: "Visit saved", then the optional "Book her
// next checkup?" step. Reads the session: render inside <Suspense>.
export async function NextStepScreen({ params }: { params: Promise<{ visitId: string }> }) {
  await requireRole(AREA_ROLES.staff);
  const { visitId } = await params;
  const visit = /^[1-9]\d{0,9}$/.test(visitId) ? await getSavedVisit(Number(visitId)) : null;
  if (!visit) notFound();
  const { t } = await getServerI18n();
  const n = t.visits.next;
  const recordHref = `/staff/visits/${visitId}`;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center gap-4 rounded-3xl bg-white p-5 shadow-[var(--shadow-raised)] sm:p-6" aria-live="polite">
        <IconCircle icon={CheckCircleIcon} tone="mint" size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="text-title font-extrabold">{n.savedTitle}</h1>
          <p className="mt-1 text-ink-soft">{format(n.savedBody, { name: visit.name, weeks: visit.weeks })}</p>
        </div>
        <Button asChild variant="secondary">
          <Link href={recordHref}>{n.skip}</Link>
        </Button>
      </section>
      <NextCheckupPanel motherId={visit.motherId} weeks={visit.weeks} doneHref={`/staff/mothers/${visit.motherId}?tab=appointments`} />
    </div>
  );
}
