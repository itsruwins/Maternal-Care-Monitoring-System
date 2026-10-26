"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Slot } from "radix-ui";
import { HeartIcon } from "@/components/icons";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IconCircle } from "@/components/ui/icon-circle";
import { useDictionary } from "@/i18n/dictionary-provider";
import { cn } from "@/lib/utils/cn";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

type Mode = "login" | "signup";

const AuthDialogContext = createContext<((mode: Mode) => void) | null>(null);

// One dialog for both Log in and Sign up. "No account yet? Sign up" (and back)
// switches the form inside the same dialog. On phones it is a bottom sheet;
// the longer sign-up scrolls with its Back / Next bar pinned at the bottom.
// Wrap a page in <AuthDialogProvider>, then use <AuthDialogTrigger mode="...">.
// The /login and /register pages stay for direct links.
export function AuthDialogProvider({ children }: { children: ReactNode }) {
  const { t } = useDictionary();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const contentRef = useRef<HTMLDivElement>(null);

  const show = useCallback((next: Mode) => {
    setMode(next);
    setOpen(true);
  }, []);

  // Put the cursor in the first field: when the dialog opens, and after a switch.
  const focusFirstField = () => {
    requestAnimationFrame(() => contentRef.current?.querySelector<HTMLInputElement>("input")?.focus());
  };
  const switchTo = (next: Mode) => {
    setMode(next);
    contentRef.current?.scrollTo({ top: 0 });
    focusFirstField();
  };

  return (
    <AuthDialogContext value={show}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          ref={contentRef}
          closeLabel={t.common.close}
          className={cn(mode === "signup" && "sm:max-w-2xl")}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            focusFirstField();
          }}
        >
          {mode === "login" ? (
            <>
              <DialogHeader className="items-center px-14 pt-6 text-center sm:px-14 sm:pt-9">
                <IconCircle icon={HeartIcon} tone="blush" size="lg" />
                <DialogTitle className="mt-3">{t.auth.welcome}</DialogTitle>
                <DialogDescription>{t.auth.loginSubtitle}</DialogDescription>
              </DialogHeader>
              <div className="px-6 pt-5 pb-7 sm:px-8">
                <LoginForm onNavigate={() => setOpen(false)} onSwitchToSignup={() => switchTo("signup")} />
              </div>
            </>
          ) : (
            <>
              <DialogHeader className="px-6 pt-5 pr-16 sm:px-8 sm:pt-8 sm:pr-16">
                <DialogTitle>{t.register.dialogTitle}</DialogTitle>
                <DialogDescription>
                  {t.register.subtitle}{" "}
                  <span className="whitespace-nowrap">
                    {t.register.haveAccount}{" "}
                    <button
                      type="button"
                      onClick={() => switchTo("login")}
                      className="font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2"
                    >
                      {t.register.login}
                    </button>
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="pt-3">
                <RegisterForm />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AuthDialogContext>
  );
}

// Opens the auth dialog in the given mode. Wraps one button-like child.
export function AuthDialogTrigger({ mode, children }: { mode: Mode; children: ReactNode }) {
  const show = useContext(AuthDialogContext);
  if (!show) throw new Error("AuthDialogTrigger must be inside <AuthDialogProvider>.");
  return (
    <Slot.Root aria-haspopup="dialog" onClick={() => show(mode)}>
      {children}
    </Slot.Root>
  );
}
