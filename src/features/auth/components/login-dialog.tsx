"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDictionary } from "@/i18n/dictionary-provider";
import { LoginForm } from "./login-form";

// The login modal. `children` is the trigger (any button-like element).
export function LoginDialog({ children }: { children: ReactNode }) {
  const { t } = useDictionary();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent closeLabel={t.common.close}>
        <DialogHeader>
          <DialogTitle>{t.auth.loginTitle}</DialogTitle>
          <DialogDescription>{t.auth.loginSubtitle}</DialogDescription>
        </DialogHeader>
        <div className="px-6 pt-5 pb-6">
          <LoginForm onNavigate={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
