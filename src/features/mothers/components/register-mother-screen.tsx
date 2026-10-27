import Link from "next/link";
import { CaretLeftIcon } from "@/components/icons";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { getShownPuroks } from "@/lib/puroks/shown-puroks";
import type { PurokOption } from "@/lib/puroks/types";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { RegisterMother } from "./register-mother-form";

// /staff/mothers/new. Reads the session: render inside <Suspense>.
export async function RegisterMotherScreen() {
  await requireRole(AREA_ROLES.staff);
  const [{ t }, puroks] = await Promise.all([getServerI18n(), getShownPuroks()]);
  return <RegisterMotherView t={t} puroks={puroks} today={manilaTodayISO()} />;
}

// The page layout, without data loading (also used by the dev preview).
export function RegisterMotherView({ t, puroks, today }: { t: Dictionary; puroks: PurokOption[]; today: string }) {
  const r = t.mothers.register;
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Link
        href="/staff/mothers"
        className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2"
      >
        <CaretLeftIcon weight="bold" aria-hidden className="size-4" />
        {r.back}
      </Link>
      <div>
        <h1 className="text-title font-extrabold">{r.title}</h1>
        <p className="mt-2 max-w-[60ch] text-ink-soft">{r.intro}</p>
      </div>
      <RegisterMother puroks={puroks} today={today} />
    </div>
  );
}
