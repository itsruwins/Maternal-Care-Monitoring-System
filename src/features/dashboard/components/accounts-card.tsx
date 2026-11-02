import { AccountsIcon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatMonthOf } from "../format";
import { ACCOUNT_LINKS } from "../paths";
import type { AccountCounts } from "../types";
import { CountRow } from "./count-row";

// Admin: mothers (with and without a login, website sign-ups this month),
// health workers, admins and inactive logins. Rows with a list open it.
export function AccountsCard({ t, locale, counts, today }: { t: Dictionary; locale: Locale; counts: AccountCounts; today: string }) {
  const a = t.dashboard.admin.accounts;
  return (
    <section aria-labelledby="dash-accounts" className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="mb-2 flex items-center gap-3">
        <IconCircle icon={AccountsIcon} tone="mint" size="sm" />
        <h3 id="dash-accounts" className="text-lg font-bold">
          {a.title}
        </h3>
      </div>
      <ul className="divide-y divide-line">
        <CountRow label={a.mothers} count={counts.mothers} href={ACCOUNT_LINKS.mothers} />
        <CountRow label={a.withLogin} count={counts.mothersWithLogin} href={ACCOUNT_LINKS.mothersWithLogin} sub />
        <CountRow label={a.withoutLogin} count={counts.mothersWithoutLogin} sub />
        <CountRow label={format(a.signedUp, { month: formatMonthOf(today, locale) })} count={counts.signedUpThisMonth} sub />
        <CountRow label={a.healthWorkers} count={counts.healthWorkers} href={ACCOUNT_LINKS.healthWorkers} />
        <CountRow label={a.admins} count={counts.admins} href={ACCOUNT_LINKS.admins} />
        <CountRow label={a.inactive} count={counts.inactive} href={ACCOUNT_LINKS.inactive} />
      </ul>
    </section>
  );
}
