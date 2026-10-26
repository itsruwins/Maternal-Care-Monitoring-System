"use client";

import { LogoutIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useDictionary } from "@/i18n/dictionary-provider";
import { logout } from "../actions/login";

export function LogoutButton() {
  const { t } = useDictionary();
  return (
    <form action={logout}>
      <Button type="submit" variant="secondary" size="sm">
        <LogoutIcon weight="bold" aria-hidden />
        {t.auth.logout}
      </Button>
    </form>
  );
}
