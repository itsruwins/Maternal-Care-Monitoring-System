"use client";

import { LogoutIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useDictionary } from "@/i18n/dictionary-provider";
import { logout } from "../actions/login";

// A quiet "Log out" button, for pages outside the app shell (the forced
// change-password page), so a user who isn't ready can still leave.
export function LogoutButton() {
  const { t } = useDictionary();
  return (
    <form action={logout} className="flex justify-center">
      <Button type="submit" variant="ghost" className="text-ink-soft">
        <LogoutIcon aria-hidden />
        {t.auth.logout}
      </Button>
    </form>
  );
}
