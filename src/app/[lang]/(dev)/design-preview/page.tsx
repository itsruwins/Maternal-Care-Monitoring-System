import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import {
  AppointmentIcon,
  ArrowRightIcon,
  CheckupIcon,
  DangerIcon,
  EducationIcon,
  HealthCenterIcon,
  HeartIcon,
  HomeIcon,
  LabTestIcon,
  LocationIcon,
  PlusIcon,
  PregnancyIcon,
  ProfileIcon,
  RecordsIcon,
  ReminderIcon,
  SmsIcon,
  SupplementIcon,
  VaccineIcon,
  WellbeingIcon,
  type Icon,
} from "@/components/icons";
import { BrandMark } from "@/components/shared/brand-mark";
import { LanguageSwitch } from "@/components/shared/language-switch";
import { Button } from "@/components/ui/button";
import { CurvedHero } from "@/components/ui/curved-hero";
import { FormField } from "@/components/ui/form-field";
import { IconCircle } from "@/components/ui/icon-circle";
import { InsightCard, InsightRow } from "@/components/ui/insight-card";
import { Input } from "@/components/ui/input";
import { WeekStrip, type WeekDay } from "@/components/ui/week-strip";
import { LoginDialog } from "@/features/auth/components/login-dialog";

export const metadata = { title: "Style preview", robots: { index: false } };

// Development-only style sheet for Phase 1R step 1 (not built in production).
// Shows the new tokens, type, icons and base components together.

const COLORS = [
  { name: "Leaf", hex: "#3E5A4D", role: "Buttons, links", className: "bg-leaf", dark: true },
  { name: "Fern (client)", hex: "#769382", role: "Icon circles, charts", className: "bg-fern", dark: true },
  { name: "Mint", hex: "#E3EAE4", role: "Soft green fills", className: "bg-mint" },
  { name: "Sage (client)", hex: "#C0C3B9", role: "Soft borders", className: "bg-sage" },
  { name: "Beige (client)", hex: "#E8DDC9", role: "Warm sections", className: "bg-beige" },
  { name: "Cream (client)", hex: "#F3EFE3", role: "Quiet fills", className: "bg-cream" },
  { name: "Milk", hex: "#FBF8F3", role: "Page background", className: "bg-milk ring-1 ring-line ring-inset" },
  { name: "Rose (new)", hex: "#D9A5A0", role: "Hearts, hero tint", className: "bg-rose" },
  { name: "Blush", hex: "#F6E6E1", role: "Danger-sign cards", className: "bg-blush" },
  { name: "Rose deep", hex: "#9C4F4A", role: "Danger text, errors", className: "bg-rose-deep", dark: true },
  { name: "Ink", hex: "#1F2D27", role: "Text", className: "bg-ink", dark: true },
  { name: "Ink soft", hex: "#56665D", role: "Secondary text", className: "bg-ink-soft", dark: true },
];

const TYPE = [
  { label: "Display · 48 bold", className: "text-display font-bold", sample: "24 weeks, 3 days" },
  { label: "Title · 32 bold", className: "text-title font-bold", sample: "Never miss a checkup" },
  { label: "Heading · 24 bold", className: "text-2xl font-bold tracking-[-0.015em]", sample: "How it works" },
  { label: "Subhead · 20 semibold", className: "text-xl font-semibold", sample: "Prenatal checkup" },
  { label: "Lead · 18 regular", className: "text-lg text-ink-soft", sample: "We send you a text before every visit." },
  { label: "Body · 16 regular", className: "text-base", sample: "Sign up with your phone number. No email needed." },
  { label: "Small · 14 medium", className: "text-sm font-medium text-ink-soft", sample: "Clinic opens at 8:00 AM" },
  { label: "Caption · 12 medium", className: "text-caption font-medium uppercase tracking-[0.02em] text-ink-soft", sample: "Mon Tue Wed" },
];

const ICONS: { name: string; meaning: string; icon: Icon; tone: "fern" | "leaf" | "mint" | "blush" | "beige" | "rose" }[] = [
  { name: "Pregnancy", meaning: "pregnancy, weeks", icon: PregnancyIcon, tone: "blush" },
  { name: "Appointment", meaning: "visits, booking", icon: AppointmentIcon, tone: "mint" },
  { name: "Checkup", meaning: "prenatal checkup", icon: CheckupIcon, tone: "fern" },
  { name: "Vaccine", meaning: "tetanus toxoid", icon: VaccineIcon, tone: "beige" },
  { name: "Supplement", meaning: "iron / folic acid", icon: SupplementIcon, tone: "mint" },
  { name: "Lab test", meaning: "laboratory test", icon: LabTestIcon, tone: "fern" },
  { name: "Education", meaning: "health education", icon: EducationIcon, tone: "beige" },
  { name: "SMS", meaning: "text messages", icon: SmsIcon, tone: "leaf" },
  { name: "Reminder", meaning: "SMS reminder", icon: ReminderIcon, tone: "rose" },
  { name: "Danger sign", meaning: "urgent, missed", icon: DangerIcon, tone: "blush" },
  { name: "Health center", meaning: "the clinic", icon: HealthCenterIcon, tone: "mint" },
  { name: "Location", meaning: "address, purok", icon: LocationIcon, tone: "beige" },
  { name: "Wellbeing", meaning: "tips", icon: WellbeingIcon, tone: "rose" },
  { name: "Heart", meaning: "care, favourite", icon: HeartIcon, tone: "blush" },
];


const WEEK: WeekDay[] = [
  { key: "1", weekday: "S", day: 1, label: "" },
  { key: "2", weekday: "M", day: 2, state: "done", label: "" },
  { key: "3", weekday: "T", day: 3, state: "missed", label: "" },
  { key: "4", weekday: "Today", day: 4, isToday: true, label: "" },
  { key: "5", weekday: "T", day: 5, state: "requested", label: "" },
  { key: "6", weekday: "F", day: 6, state: "appointment", label: "" },
  { key: "7", weekday: "S", day: 7, label: "" },
];

const LEGEND = [
  { label: "Visit done", className: "bg-mint text-leaf" },
  { label: "Today", className: "bg-white font-semibold shadow-[var(--shadow-soft)]" },
  { label: "Visit booked", className: "bg-leaf text-white" },
  { label: "Visit requested", className: "border-2 border-dashed border-leaf text-leaf" },
  { label: "Visit missed", className: "bg-blush text-rose-deep" },
];

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-8">
      <h2 className="text-2xl font-bold tracking-[-0.015em]">{title}</h2>
      {note && <p className="mt-1.5 max-w-[60ch] text-[0.95rem] text-ink-soft">{note}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function DesignPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="flex-1 pb-20">
      <CurvedHero tone="rose" curve="lg" className="pb-16">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pt-4 sm:px-6">
          <BrandMark />
          <LanguageSwitch />
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 sm:px-6 md:grid-cols-[1fr_auto] md:pt-14">
          <div>
            <h1 className="text-display max-w-[14ch] font-bold">Style preview: soft, round, feminine</h1>
            <p className="mt-4 max-w-[48ch] text-lg text-ink-soft">
              Phase 1R step 1. Your palette with a dusty-rose accent, Inter at Flo&apos;s sizes, and Phosphor icons in
              Flo&apos;s three styles. The landing page shows them together on the mother&apos;s Today screen.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg">
                Sign up <ArrowRightIcon weight="bold" />
              </Button>
              <LoginDialog>
                <Button size="lg" variant="secondary">
                  Open the login sheet
                </Button>
              </LoginDialog>
            </div>
          </div>
        </div>
      </CurvedHero>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-6 px-4 sm:px-6">
        <Section title="Colors" note="Fern, sage and rose are for fills and icons only (too light for text). Text uses ink, ink soft, leaf or rose deep.">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {COLORS.map((c) => (
              <li key={c.name} className="flex flex-col gap-2">
                <span className={`h-16 rounded-xl ${c.className}`} />
                <span className="text-sm font-semibold">{c.name}</span>
                <span className="tnum -mt-1.5 text-caption text-ink-soft">
                  {c.hex} · {c.role}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Type: Inter" note="Flo's scale. Bold for headings and big numbers, regular for reading text.">
          <ul className="flex flex-col divide-y divide-line">
            {TYPE.map((t) => (
              <li key={t.label} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:items-baseline sm:gap-6">
                <span className="text-caption font-medium text-ink-soft">{t.label}</span>
                <span className={t.className}>{t.sample}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="Icons: Phosphor"
          note="Each meaning has one icon. Shown as navigation (outline), selected (filled) and feature icon (in a soft circle)."
        >
          <ul className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {ICONS.map(({ name, meaning, icon: Glyph, tone }) => (
              <li key={name} className="flex items-center gap-4 border-b border-line py-3">
                <Glyph weight="regular" aria-hidden className="size-6 text-ink-soft" />
                <Glyph weight="fill" aria-hidden className="size-6 text-ink" />
                <IconCircle icon={Glyph} tone={tone} />
                <span className="flex flex-col">
                  <span className="text-[0.95rem] font-semibold">{name}</span>
                  <span className="text-sm text-ink-soft">{meaning}</span>
                </span>
              </li>
            ))}
          </ul>

          <h3 className="mt-10 text-lg font-semibold">Bottom tab bar (mother portal, Phase 2)</h3>
          <div className="mt-3 max-w-md rounded-2xl border border-line bg-white">
            <div className="grid grid-cols-5 px-1 pt-2.5 pb-3">
              {[
                { label: "Today", icon: HomeIcon, active: true },
                { label: "Visits", icon: RecordsIcon },
                { label: "Book", icon: AppointmentIcon },
                { label: "SMS", icon: SmsIcon },
                { label: "Me", icon: ProfileIcon },
              ].map(({ label, icon: TabIcon, active }) => (
                <span key={label} className={`flex flex-col items-center gap-1 ${active ? "text-ink" : "text-ink-soft"}`}>
                  <TabIcon weight={active ? "fill" : "regular"} aria-hidden className="size-7" />
                  <span className={`text-[0.6875rem] ${active ? "font-semibold" : "font-medium"}`}>{label}</span>
                </span>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Buttons" note="Pills. One primary (leaf) per screen; white secondary like Flo's 'Edit period dates'.">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Cancel request</Button>
            <Button variant="link">Text link</Button>
            <Button disabled>Disabled</Button>
            <Button size="icon-lg" aria-label="Add">
              <PlusIcon weight="bold" />
            </Button>
          </div>
          <div className="mt-6 inline-flex flex-wrap items-center gap-3 rounded-2xl bg-cream p-4">
            <Button size="sm">Small</Button>
            <Button>Default 44px</Button>
            <Button size="lg">Large 52px</Button>
          </div>
        </Section>

        <Section title="Form fields" note="48px tall, rounded, white. Green glow on focus; rose glow and an icon on error.">
          <div className="grid max-w-3xl gap-6 sm:grid-cols-2">
            <FormField id="pv-username" label="Username" hint="3 to 30 letters, numbers, dots or underscores.">
              {(describedBy) => <Input id="pv-username" placeholder="e.g. maria.santos" aria-describedby={describedBy} />}
            </FormField>
            <FormField id="pv-lmp" label="First day of your last period">
              {(describedBy) => <Input id="pv-lmp" type="date" aria-describedby={describedBy} />}
            </FormField>
            <FormField id="pv-mobile" label="Mobile number" error="Enter an 11-digit number starting with 09.">
              {(describedBy) => (
                <Input id="pv-mobile" defaultValue="0917 12" aria-invalid aria-describedby={describedBy} inputMode="tel" />
              )}
            </FormField>
            <FormField id="pv-disabled" label="Barangay">
              {(describedBy) => <Input id="pv-disabled" value="Taysan" disabled readOnly aria-describedby={describedBy} />}
            </FormField>
          </div>
        </Section>

        <Section title="Cards and the week strip" note="Flo's insight cards (swipe sideways on phones) and the date circles.">
          <InsightRow className="sm:mx-0 sm:px-0">
            <InsightCard
              title="Next visit"
              selected
              visual={
                <>
                  <span className="tnum text-2xl font-bold tracking-[-0.02em]">Nov 6</span>
                  <IconCircle icon={CheckupIcon} tone="leaf" size="sm" />
                </>
              }
            />
            <InsightCard title="Take your iron daily" tone="mint" visual={<IconCircle icon={SupplementIcon} tone="fern" />} />
            <InsightCard title="Tetanus vaccine due" tone="beige" visual={<IconCircle icon={VaccineIcon} tone="white" />} />
            <InsightCard
              title="Danger signs to watch"
              tone="blush"
              visual={<IconCircle icon={DangerIcon} tone="white" className="text-rose-deep" />}
            />
            <InsightCard
              title="Request a visit"
              visual={
                <span className="grid size-11 place-items-center rounded-full bg-leaf text-white">
                  <PlusIcon weight="bold" aria-hidden className="size-5" />
                </span>
              }
            />
          </InsightRow>

          <div className="mt-8 grid items-center gap-6 md:grid-cols-[minmax(0,26rem)_1fr]">
            <div className="rounded-2xl bg-blush/60 px-3 py-4">
              <WeekStrip days={WEEK} />
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-3">
              {LEGEND.map((l) => (
                <li key={l.label} className="flex items-center gap-2 text-sm text-ink-soft">
                  <span aria-hidden className={`grid size-7 place-items-center rounded-full text-caption ${l.className}`}>
                    4
                  </span>
                  {l.label}
                </li>
              ))}
            </ul>
          </div>
        </Section>
      </div>
    </main>
  );
}
