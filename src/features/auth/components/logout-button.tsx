"use client";

import { useDictionary } from "@/i18n/dictionary-provider";
import { logout } from "../actions";

export function LogoutButton() {
  const { t } = useDictionary();
  return (
    <form action={logout}>
      <button type="submit" className="rounded-md border px-3 py-1.5 text-sm">
        {t.auth.logout}
      </button>
    </form>
  );
}
