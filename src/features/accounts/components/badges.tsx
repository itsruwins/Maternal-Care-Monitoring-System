import type { AccountStatus, UserRole } from "@/types/database";
import { cn } from "@/lib/utils/cn";

// Small pills for an account's role and status.

const ROLE_STYLE: Record<UserRole, string> = {
  ADMIN: "bg-beige text-ink",
  HEALTH_WORKER: "bg-mint text-leaf",
  MOTHER: "bg-blush text-rose-deep",
};

export function RoleBadge({ role, label }: { role: UserRole; label: string }) {
  return (
    <span className={cn("inline-flex h-7 items-center rounded-full px-2.5 text-caption font-semibold whitespace-nowrap", ROLE_STYLE[role])}>
      {label}
    </span>
  );
}

export function StatusBadge({ status, label }: { status: AccountStatus; label: string }) {
  const active = status === "ACTIVE";
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-caption font-semibold whitespace-nowrap",
        active ? "bg-mint text-leaf" : "bg-cream text-ink-soft"
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", active ? "bg-leaf" : "bg-ink-soft")} />
      {label}
    </span>
  );
}
