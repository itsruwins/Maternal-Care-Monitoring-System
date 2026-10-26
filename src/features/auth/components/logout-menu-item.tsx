"use client";

import { LogoutIcon } from "@/components/icons";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useDictionary } from "@/i18n/dictionary-provider";
import { logout } from "../actions/login";

// "Log out" as a row in a dropdown menu (the profile menu in the app shell).
export function LogoutMenuItem() {
  const { t } = useDictionary();
  return (
    <DropdownMenuItem
      onSelect={() => {
        void logout();
      }}
      className="text-rose-deep [&_svg]:text-rose-deep"
    >
      <LogoutIcon aria-hidden />
      {t.auth.logout}
    </DropdownMenuItem>
  );
}
