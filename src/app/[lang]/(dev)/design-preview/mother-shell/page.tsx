import { notFound } from "next/navigation";
import { MotherShell } from "@/features/shell/components/mother-shell";

export const metadata = { title: "Mother shell preview", robots: { index: false } };

// Development only: the mother portal shell with a sample user (no login needed).
export default function MotherShellPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <MotherShell previewPath="/mother" user={{ username: "ana.reyes", role: "MOTHER", firstName: "Ana", fullName: "Ana Reyes" }}>
      <section className="rounded-3xl bg-white p-8 shadow-[var(--shadow-soft)] sm:p-10">
        <h1 className="text-title font-extrabold">Hello, Ana</h1>
        <p className="mt-3 max-w-[56ch] text-lg leading-7 text-ink-soft">Sample content area (preview only).</p>
      </section>
    </MotherShell>
  );
}
