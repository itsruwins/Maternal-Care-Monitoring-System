import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

// A soft white card for the account pages (log in, sign up, passwords) when
// opened by their own address: title, optional subtitle, then the form.
export function AuthCard({
  title,
  subtitle,
  wide = false,
  bare = false,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  wide?: boolean;
  /** Children draw their own padding (e.g. the multi-step sign-up form). */
  bare?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full", wide ? "max-w-2xl" : "max-w-md")}>
      <div className="overflow-hidden rounded-3xl bg-white shadow-[var(--shadow-raised)]">
        <div className="px-6 pt-8 pb-3 sm:px-8">
          <h1 className="text-title font-extrabold">{title}</h1>
          {subtitle && <p className="mt-2 text-[0.95rem] leading-6 text-ink-soft">{subtitle}</p>}
        </div>
        {bare ? children : <div className="px-6 pt-4 pb-8 sm:px-8">{children}</div>}
      </div>
    </div>
  );
}
