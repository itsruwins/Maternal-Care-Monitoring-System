"use client";

import Link from "next/link";
import { ProfileIcon } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutMenuItem } from "@/features/auth/components/logout-menu-item";
import { useDictionary } from "@/i18n/dictionary-provider";
import type { ShellUser } from "../queries/get-shell-user";

// Initials avatar in the top bar; opens Profile and Log out.
export function ProfileMenu({ user, profileHref }: { user: ShellUser; profileHref: string }) {
  const { t } = useDictionary();
  const initials = user.fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        // "JD, Account menu": the visible initials first, for voice control.
        aria-label={`${initials}, ${t.shell.accountMenu}`}
        className="grid size-11 place-items-center rounded-full bg-blush text-sm font-bold text-rose-deep transition-shadow outline-none hover:shadow-[var(--shadow-soft)] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-leaf"
      >
        {initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          <span className="block text-[0.95rem] font-semibold">{user.fullName}</span>
          <span className="mt-0.5 block text-caption text-ink-soft">
            {t.shell.roles[user.role]} · @{user.username}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={profileHref}>
            <ProfileIcon aria-hidden />
            {t.shell.nav.profile}
          </Link>
        </DropdownMenuItem>
        <LogoutMenuItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
