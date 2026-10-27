import { notFound } from "next/navigation";
import { PuroksView } from "@/features/puroks/components/puroks-screen";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";

export const metadata = { title: "Puroks preview", robots: { index: false } };

// Development only (preview): the purok list with sample data.
export default async function PuroksPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const { t } = await getServerI18n();
  return (
    <StaffShell user={{ username: "taysan.admin", role: "ADMIN", firstName: "Maria", fullName: "Maria Santos" }}>
      <PuroksView
        t={t}
        puroks={[
          ...Array.from({ length: 9 }, (_, i) => ({ id: i + 1, name: `Purok ${i + 1}`, isActive: true })),
          { id: 10, name: "Purok 10", isActive: false },
          { id: 11, name: "Sitio Upper Tico-tico", isActive: true },
        ]}
      />
    </StaffShell>
  );
}
