import { notFound } from "next/navigation";
import { StaffShell } from "@/features/shell/components/staff-shell";

export const metadata = { title: "Staff shell preview", robots: { index: false } };

// Development only: the staff shell with a sample admin user (no login needed).
export default function StaffShellPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <StaffShell user={{ username: "taysan.admin", role: "ADMIN", firstName: "Maria", fullName: "Maria Santos" }}>
      <section className="rounded-3xl bg-white p-8 shadow-[var(--shadow-soft)] sm:p-10">
        <h1 className="text-title font-extrabold">Hello, Maria</h1>
        <p className="mt-3 max-w-[56ch] text-lg leading-7 text-ink-soft">Sample content area (preview only).</p>
      </section>
    </StaffShell>
  );
}
