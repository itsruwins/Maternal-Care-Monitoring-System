"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDictionary } from "@/i18n/dictionary-provider";
import { logout } from "../actions/login";

export function LogoutButton() {
  const { t } = useDictionary();
  return (
    <form action={logout}>
      <Button type="submit" variant="outline" size="sm">
        <LogOut aria-hidden />
        {t.auth.logout}
      </Button>
    </form>
  );
}
