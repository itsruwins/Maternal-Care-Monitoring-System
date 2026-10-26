import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

// A card on the folder for account pages (log in, sign up, passwords):
// tab label, printed title, then the form.
export function AuthCard({
  tab,
  tabShort,
  title,
  subtitle,
  wide = false,
  bare = false,
  children,
}: {
  tab: string;
  /** Shorter tab text for narrow phones (under 420px). */
  tabShort?: string;
  title: string;
  subtitle?: string;
  wide?: boolean;
  /** Children draw their own padding (e.g. the multi-step sign-up form). */
  bare?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full", wide ? "max-w-3xl" : "max-w-md")}>
      <div className="card-stock label-print ml-5 inline-flex max-w-[calc(100%-2.5rem)] items-center rounded-t-lg border border-b-0 border-rule px-4 pt-2.5 pb-2 text-[0.66rem] sm:text-[0.7rem]">
        {tabShort ? (
          <>
            <span className="min-[420px]:hidden">{tabShort}</span>
            <span className="hidden min-[420px]:inline">{tab}</span>
          </>
        ) : (
          tab
        )}
      </div>
      <div className="card-stock overflow-hidden rounded-lg rounded-tl-none border border-rule shadow-[var(--shadow-card-lifted)]">
        <div className="border-b border-rule px-6 pt-7 pb-5 sm:px-10">
          <h1 className="display-print text-[clamp(2rem,5.5vw,2.75rem)] leading-[1]">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-ink/80">{subtitle}</p>}
        </div>
        {bare ? children : <div className="px-6 py-7 sm:px-10">{children}</div>}
      </div>
    </div>
  );
}
