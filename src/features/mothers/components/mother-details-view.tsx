import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatDate } from "@/lib/utils/pregnancy";
import type { MotherRecord } from "../types";

// Her details as two groups of labelled facts: about her, then her address and
// who to call in an emergency. Numbers are call links; empty answers read
// "Not given" in italic ink-soft.
export function MotherDetailsView({
  t,
  locale,
  mother,
  name,
  age,
  origin,
}: {
  t: Dictionary;
  locale: Locale;
  mother: MotherRecord;
  name: string;
  age: number | null;
  origin: string;
}) {
  const v = t.mothers.record.detailsView;
  const birthday = formatDate(mother.dateOfBirth, locale);
  return (
    <div className="flex flex-col gap-6">
      <Group title={v.about}>
        <Row label={v.fullName}>{name}</Row>
        <Row label={v.birthday}>{age !== null ? format(v.birthdayAge, { date: birthday, age }) : birthday}</Row>
        <Row label={v.mobile}>
          <Phone number={mother.contactNumber} label={format(v.callNumber, { number: mother.contactNumber })} />
        </Row>
        <Row label={v.registered}>{origin}</Row>
      </Group>
      <hr className="border-line" />
      <Group title={v.address}>
        <Row label={v.purok}>{mother.purokName ?? <Empty>{t.mothers.noPurokYet}</Empty>}</Row>
        <Row label={v.street}>{mother.street || <Empty>{v.notGiven}</Empty>}</Row>
        <Row label={v.emergency}>
          {mother.emergencyName || mother.emergencyNumber ? (
            <span className="flex flex-col gap-0.5">
              {mother.emergencyName && <span>{mother.emergencyName}</span>}
              {mother.emergencyNumber && (
                <Phone number={mother.emergencyNumber} label={format(v.callNumber, { number: mother.emergencyNumber })} />
              )}
            </span>
          ) : (
            <Empty>{v.notGiven}</Empty>
          )}
        </Row>
      </Group>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[0.95rem] font-semibold text-ink">{title}</h3>
      <dl className="grid gap-x-6 gap-y-3 text-[0.95rem] sm:grid-cols-[12rem_minmax(0,1fr)]">{children}</dl>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-0.5 sm:col-span-2 sm:grid-cols-subgrid">
      <dt className="text-sm text-ink-soft sm:pt-px sm:text-[0.95rem]">{label}</dt>
      <dd className="min-w-0 font-medium break-words text-ink">{children}</dd>
    </div>
  );
}

function Phone({ number, label }: { number: string; label: string }) {
  return (
    <a
      href={`tel:${number.replace(/[^\d+]/g, "")}`}
      aria-label={label}
      className="tnum self-start font-medium text-leaf underline decoration-1 underline-offset-4 hover:decoration-2"
    >
      {number}
    </a>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <span className="font-normal text-ink-soft italic">{children}</span>;
}
