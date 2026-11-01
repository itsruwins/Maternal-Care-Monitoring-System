import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { listMotherSms } from "../queries/sms-log";
import type { SmsLogItem } from "../types";
import { SmsCard } from "./sms-log-list";

// The SMS log tab on a mother's record: her texts, newest first; Retry for
// admins. Loads its own data (the page has already checked the staff role).
export async function MotherSmsPanel({ motherId, isAdmin }: { motherId: number; isAdmin: boolean }) {
  const [{ t, locale }, items] = await Promise.all([getServerI18n(), listMotherSms(motherId)]);
  return <MotherSmsPanelView t={t} locale={locale} items={items} canRetry={isAdmin} />;
}

export function MotherSmsPanelView({ t, locale, items, canRetry }: { t: Dictionary; locale: Locale; items: SmsLogItem[]; canRetry: boolean }) {
  const r = t.sms.record;
  if (items.length === 0) {
    return <p className="rounded-2xl bg-white px-6 py-10 text-center text-ink-soft shadow-[var(--shadow-soft)]">{r.empty}</p>;
  }
  return (
    <section aria-labelledby="her-texts" className="flex flex-col gap-3">
      <h2 id="her-texts" className="text-lg font-bold">
        {r.title}
      </h2>
      <ul className="grid gap-3 xl:grid-cols-2">
        {items.map((item) => (
          <li key={item.id}>
            <SmsCard t={t} locale={locale} canRetry={canRetry} item={item} showMother={false} />
          </li>
        ))}
      </ul>
    </section>
  );
}
