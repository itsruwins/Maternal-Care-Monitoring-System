import Link from "next/link";
import type { ReactNode } from "react";
import {
  CalendarIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ClockIcon,
  EmailIcon,
  IdIcon,
  LocationIcon,
  type Icon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { motherRecordHref } from "@/features/mothers/paths";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatSlotClock } from "@/lib/appointments/format";
import { manilaSlot } from "@/lib/appointments/slots";
import { formatDateTime } from "@/lib/utils/date-time";
import { formatDate } from "@/lib/utils/pregnancy";
import { positionKeyOf } from "../constants";
import { ACCOUNTS_PATH } from "../paths";
import type { AccountDetail } from "../queries/get-account";
import { AccountInitials, loginText } from "./account-bits";
import { AccessAction, ResetPasswordAction } from "./account-security";
import { RoleBadge, StatusBadge } from "./badges";
import { StaffProfileForm } from "./staff-profile-form";

const CARD = "rounded-3xl bg-white shadow-[var(--shadow-soft)]";

// /admin/accounts/[userId] layout (no data loading, so the dev preview can
// render it with sample data), in the mother record's pattern:
// - the header: initials in the role's tint, name, @username and chips, with
//   Reset password under the name; a milk strip of four facts closes it
//   (position or purok with the mobile number, created, last login, recovery
//   email);
// - a staff member's profile, full width, or a mother's link to her record;
// - Account access last, on its own: Deactivate (rose) or Activate, away
//   from the everyday actions.
// Your own account has no actions here (your Profile page has them).
export function AccountDetailView({
  t,
  locale,
  account,
  isSelf,
  today,
}: {
  t: Dictionary;
  locale: Locale;
  account: AccountDetail;
  isSelf: boolean;
  /** Manila "YYYY-MM-DD", for "Today" and "Yesterday" logins. */
  today: string;
}) {
  const a = t.accounts;
  const d = a.detail;
  const off = account.status === "INACTIVE";

  const name = account.staff
    ? [
        account.staff.firstName,
        account.staff.middleName,
        account.staff.lastName,
      ]
        .filter(Boolean)
        .join(" ")
    : account.mother
      ? `${account.mother.firstName} ${account.mother.lastName}`
      : account.username;
  const positionKey = account.staff
    ? positionKeyOf(account.staff.position)
    : null;
  const position =
    !account.staff || !positionKey
      ? null
      : positionKey === "other"
        ? account.staff.position
        : a.positions[positionKey];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={ACCOUNTS_PATH}
        className="-my-3 inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2"
      >
        <CaretLeftIcon weight="bold" aria-hidden className="size-4" />
        {d.back}
      </Link>

      {/* Who */}
      <section
        aria-labelledby="account-name"
        className={`overflow-hidden ${CARD}`}
      >
        <div className="flex flex-col gap-5 p-5 sm:p-8">
          <div className="flex min-w-0 items-start gap-4 sm:gap-5">
            <AccountInitials
              name={name}
              role={account.role}
              off={off}
              size="lg"
            />
            <div className="flex min-w-0 flex-col gap-2">
              <h1
                id="account-name"
                className="text-title font-extrabold tracking-[-0.01em] text-balance break-words"
              >
                {name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="text-[0.95rem] break-all text-ink-soft">
                  @{account.username}
                </span>
                <RoleBadge
                  role={account.role}
                  label={t.shell.roles[account.role]}
                />
                <StatusBadge
                  status={account.status}
                  label={a.statuses[account.status]}
                />
                {account.mustChangePassword && (
                  <span className="inline-flex h-7 items-center rounded-full bg-beige px-2.5 text-caption font-semibold text-ink">
                    {d.pendingPassword}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="sm:pl-[5.25rem]">
            {isSelf ? (
              <p className="text-sm text-ink-soft">{d.self}</p>
            ) : (
              <div
                role="group"
                aria-label={d.actions}
                className="flex flex-wrap gap-2"
              >
                <ResetPasswordAction
                  userId={account.userId}
                  username={account.username}
                />
              </div>
            )}
          </div>
        </div>

        <dl
          aria-label={d.facts}
          className="grid grid-cols-1 gap-px border-t border-line bg-line sm:grid-cols-2 xl:grid-cols-4"
        >
          {account.mother ? (
            <Fact
              icon={LocationIcon}
              label={d.purok}
              value={account.mother.purok ?? t.mothers.noPurokYet}
              line={
                <span className="tnum">{account.mother.contactNumber}</span>
              }
            />
          ) : (
            <Fact
              icon={IdIcon}
              label={a.columns.position}
              value={position ?? "—"}
              line={
                account.staff && (
                  <span className="tnum">{account.staff.contactNumber}</span>
                )
              }
            />
          )}
          <Fact
            icon={CalendarIcon}
            label={d.created}
            value={formatDate(
              manilaSlot(account.createdAt).date,
              locale,
              "short",
            )}
            line={
              <span className="tnum">
                {formatSlotClock(account.createdAt, locale)}
              </span>
            }
          />
          <Fact
            icon={ClockIcon}
            label={d.lastLogin}
            value={
              account.lastLoginAt ? (
                loginText(t, locale, account.lastLoginAt, today)
              ) : (
                <span className="text-ink-soft">{a.login.never}</span>
              )
            }
            line={
              account.lastLoginAt && (
                <span className="tnum">
                  {formatDateTime(account.lastLoginAt, locale)}
                </span>
              )
            }
          />
          <Fact
            icon={EmailIcon}
            label={d.email}
            value={
              account.email ? (
                <span className="text-base [overflow-wrap:anywhere]">
                  {/* If it must wrap, it wraps at the @, not mid-word. */}
                  {account.email.split("@")[0]}
                  <wbr />@{account.email.split("@").slice(1).join("@")}
                </span>
              ) : (
                <span className="text-ink-soft">{d.emailNone}</span>
              )
            }
            line={!account.email && d.emailNoneNote}
          />
        </dl>
      </section>

      {/* A staff member's profile, or a mother's link to her record */}
      {account.staff && !isSelf && (
        <StaffProfileForm
          userId={account.userId}
          defaults={account.staff}
          heading={
            <h2 id="profile-title" className="text-lg font-bold">
              {d.profile}
            </h2>
          }
        />
      )}
      {account.mother && (
        <section
          aria-labelledby="record-title"
          className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 ${CARD}`}
        >
          <div className="min-w-0">
            <h2 id="record-title" className="text-lg font-bold">
              {d.herRecord}
            </h2>
            <p className="mt-1 text-[0.95rem] text-ink-soft">{d.motherNote}</p>
          </div>
          <Button asChild variant="soft" className="shrink-0 max-sm:w-full">
            <Link
              href={motherRecordHref(account.mother.id)}
              className="no-underline"
            >
              {d.openRecord}
              <CaretRightIcon weight="bold" aria-hidden />
            </Link>
          </Button>
        </section>
      )}

      {/* Account access, last */}
      {!isSelf && (
        <section
          aria-labelledby="access-title"
          className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 ${CARD}`}
        >
          <div className="min-w-0">
            <h2 id="access-title" className="text-lg font-bold">
              {d.access}
            </h2>
            <p className="mt-1 max-w-prose text-[0.95rem] text-ink-soft">
              {off ? d.accessOff : d.accessOn}
            </p>
          </div>
          <div className="shrink-0">
            <AccessAction userId={account.userId} status={account.status} />
          </div>
        </section>
      )}
    </div>
  );
}

/** One fact in the header's milk strip: an icon and label, the value, then a quieter line. */
function Fact({
  icon: Glyph,
  label,
  value,
  line,
}: {
  icon: Icon;
  label: string;
  value: ReactNode;
  line?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 bg-milk px-5 py-4 sm:px-6 sm:py-5">
      <dt className="flex items-center gap-1.5 text-sm font-medium text-ink-soft">
        <Glyph weight="bold" aria-hidden className="size-4 text-leaf" />
        {label}
      </dt>
      <dd className="flex min-w-0 flex-col gap-0.5">
        <span className="text-lg leading-snug font-bold break-words text-ink">
          {value}
        </span>
        {line && <span className="text-sm text-ink-soft">{line}</span>}
      </dd>
    </div>
  );
}
