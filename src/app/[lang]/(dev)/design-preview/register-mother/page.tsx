import { notFound } from "next/navigation";
import { RegisterMotherView } from "@/features/mothers/components/register-mother-screen";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";

export const metadata = { title: "Register a mother preview", robots: { index: false } };

// Development only (preview): the registration form. Saving needs a real login.
export default async function RegisterMotherPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const { t } = await getServerI18n();
  return (
    <StaffShell user={{ username: "joy.dela.cruz", role: "HEALTH_WORKER", firstName: "Joy", fullName: "Joy Dela Cruz" }}>
      <RegisterMotherView t={t} puroks={Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Purok ${i + 1}` }))} today="2026-10-27" />
    </StaffShell>
  );
}
