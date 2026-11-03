import Link from "next/link";
import { CaretLeftIcon, PregnancyIcon, UserIcon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatDateTime } from "@/lib/utils/date-time";
import type { AccountDetail } from "../queries/get-account";
import { AccountSecurity } from "./account-security";
import { RoleBadge, StatusBadge } from "./badges";
import { StaffProfileForm } from "./staff-profile-form";

// /admin/accounts/[userId] layout: who it is, login & security actions, and
// the staff profile editor (mothers are managed in Phase 3). No data loading,
// so the dev preview can render it with sample data.
export function AccountDetailView({
  t,
  locale,
  account,
  isSelf,
}: {
  t: Dictionary;
  locale: Locale;
  account: AccountDetail;
  isSelf: boolean;
}) {
  const a = t.accounts;
  const d = a.detail;

  const name = account.staff
    ? [account.staff.firstName, account.staff.middleName, account.staff.lastName].filter(Boolean).join(" ")
    : account.mother
      ? `${account.mother.firstName} ${account.mother.lastName}`
      : account.username;

  const rows: [string, string][] = [
    [d.created, formatDateTime(account.createdAt, locale)],
    [d.lastLogin, account.lastLoginAt ? formatDateTime(account.lastLoginAt, locale) : a.never],
    [d.email, account.email ?? d.noEmail],
  ];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/accounts"
        className="-my-3 inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2"
      >
        <CaretLeftIcon weight="bold" aria-hidden className="size-4" />
        {d.back}
      </Link>

      {/* Who */}
      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:p-8">
        <IconCircle
          icon={account.role === "MOTHER" ? PregnancyIcon : UserIcon}
          tone={account.role === "MOTHER" ? "blush" : "mint"}
          size="lg"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h1 className="text-title font-extrabold break-words">{name}</h1>
          <p className="text-ink-soft">@{account.username}</p>
          <div className="flex flex-wrap gap-2">
            <RoleBadge role={account.role} label={t.shell.roles[account.role]} />
            <StatusBadge status={account.status} label={a.statuses[account.status]} />
            {account.mustChangePassword && (
              <span className="inline-flex h-7 items-center rounded-full bg-beige px-2.5 text-caption font-semibold text-ink-soft">
                {d.pendingPassword}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-start">
        {/* Login & security */}
        <section aria-labelledby="security-title" className="rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <h2 id="security-title" className="text-xl font-bold">{d.security}</h2>
          <dl className="mt-5 flex flex-col divide-y divide-line">
            {rows.map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5 py-3 first:pt-0">
                <dt className="text-sm text-ink-soft">{label}</dt>
                <dd className="tnum font-medium break-words">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5">
            <AccountSecurity userId={account.userId} username={account.username} status={account.status} isSelf={isSelf} />
          </div>
        </section>

        {/* Staff profile / mother note */}
        <section aria-labelledby="profile-title" className="rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <h2 id="profile-title" className="text-xl font-bold">{account.staff ? d.profile : t.shell.roles.MOTHER}</h2>
          <div className="mt-5">
            {account.staff && !isSelf ? (
              <StaffProfileForm userId={account.userId} defaults={account.staff} />
            ) : account.staff ? (
              <p className="text-sm text-ink-soft">{d.self}</p>
            ) : (
              <p className="text-ink-soft">{d.motherNote}</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
