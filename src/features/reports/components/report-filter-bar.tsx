"use client";

import Form from "next/form";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SpinnerIcon } from "@/components/icons";
import type { ToolbarSelect } from "@/components/shared/filter-toolbar";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils/cn";
import { REPORT_PERIODS } from "../period";
import type { ReportPeriod } from "../types";

/** A short pause after a period chip is picked, so arrowing through them doesn't load each one. */
const CHIP_PAUSE_MS = 250;

const LABEL = "text-caption font-semibold text-ink-soft";

// The report's filters in one card, over the report itself (children): the
// period as chips (This month, Last month, This year, Custom dates; Custom
// adds From and To), then the purok and the tab's own choices, in one row
// that wraps. Everything
// applies at once: a chip after a short pause, a select or date on change.
// It stays a GET form (next/form), so the filters live in the address and it
// works before the page's script loads. While the new report loads, it dims
// and a spinner shows.
export function ReportFilterBar({
  tab,
  period,
  from,
  to,
  selects,
  values,
  labels,
  clearHref,
  children,
}: {
  /** The tab to stay on ("" for Summary). */
  tab: string;
  period: ReportPeriod;
  from: string;
  to: string;
  selects: ToolbarSelect[];
  /** Each select's value from the address, by name. */
  values: Record<string, string>;
  labels: {
    form: string;
    period: string;
    periods: Record<ReportPeriod, string>;
    from: string;
    to: string;
    clear: string;
    updating: string;
  };
  /** Shown when a filter is set. */
  clearHref: string | null;
  children: ReactNode;
}) {
  const form = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [pending, setPending] = useState(false);
  const [chosen, setChosen] = useState<ReportPeriod>(period);
  const shown = JSON.stringify({ tab, period, from, to, values });
  const [settled, setSettled] = useState(shown);

  // The new report arrived (or Clear / a tab changed the filters): stop the
  // pending look and show the address's period and values.
  if (settled !== shown) {
    setSettled(shown);
    setPending(false);
    setChosen(period);
  }
  useEffect(() => {
    const box = form.current;
    if (!box) return;
    const fields: Record<string, string> = { ...values, from, to };
    for (const [name, value] of Object.entries(fields)) {
      const field = box.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
      if (field && "value" in field && document.activeElement !== field) field.value = value;
    }
  }, [values, from, to, chosen]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const submit = () => {
    clearTimeout(timer.current);
    form.current?.requestSubmit();
  };
  const custom = chosen === "custom";

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-white shadow-[var(--shadow-soft)] print:hidden">
        <Form
          ref={form}
          action=""
          replace
          scroll={false}
          aria-label={labels.form}
          onSubmit={() => {
            clearTimeout(timer.current);
            setPending(true);
          }}
          className="p-5 sm:p-6"
        >
          {tab && <input type="hidden" name="tab" value={tab} />}
          <div className="flex flex-wrap items-end gap-x-3 gap-y-4">
            <fieldset className="min-w-0">
              <legend className={cn(LABEL, "mb-1.5")}>{labels.period}</legend>
              <div className="flex flex-wrap gap-1.5">
                {REPORT_PERIODS.map((value) => (
                  <label
                    key={value}
                    className={cn(
                      "inline-flex min-h-12 cursor-pointer items-center rounded-full border border-line bg-white px-4 text-sm font-medium whitespace-nowrap text-ink-soft transition-colors select-none",
                      "hover:border-sage hover:text-ink",
                      "has-checked:border-leaf has-checked:bg-mint has-checked:font-semibold has-checked:text-leaf",
                      "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-leaf has-focus-visible:outline-solid",
                    )}
                  >
                    <input
                      type="radio"
                      name="period"
                      value={value}
                      checked={chosen === value}
                      onChange={() => {
                        setChosen(value);
                        clearTimeout(timer.current);
                        // Custom waits for its dates (they start at the period shown).
                        if (value !== "custom") timer.current = setTimeout(submit, CHIP_PAUSE_MS);
                      }}
                      className="sr-only"
                    />
                    {labels.periods[value]}
                  </label>
                ))}
              </div>
            </fieldset>
            {custom && (
              <div className="grid grid-cols-2 gap-2.5 max-sm:w-full sm:w-[21.5rem]">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <label htmlFor="reports-from" className={LABEL}>
                    {labels.from}
                  </label>
                  <Input id="reports-from" name="from" type="date" required defaultValue={from} onChange={submit} className="tnum" />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <label htmlFor="reports-to" className={LABEL}>
                    {labels.to}
                  </label>
                  <Input id="reports-to" name="to" type="date" required defaultValue={to} onChange={submit} className="tnum" />
                </div>
              </div>
            )}
            {selects.map((select) => (
              <div key={select.name} className="flex min-w-0 grow basis-full flex-col gap-1.5 sm:basis-52 sm:max-w-80">
                <label htmlFor={`reports-${select.name}`} className={LABEL}>
                  {select.label}
                </label>
                <NativeSelect id={`reports-${select.name}`} name={select.name} defaultValue={values[select.name] ?? ""} onChange={submit}>
                  {select.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            ))}
            <div className={cn("ml-auto flex min-h-12 items-center gap-3", !pending && !clearHref && "max-sm:hidden")}>
              <span role="status" className="inline-flex items-center gap-2 text-sm text-ink-soft">
                {pending && (
                  <>
                    <SpinnerIcon aria-hidden className="size-4 animate-spin text-leaf" />
                    <span className="sm:sr-only">{labels.updating}</span>
                  </>
                )}
              </span>
              {clearHref && (
                <Link
                  href={clearHref}
                  scroll={false}
                  replace
                  className="inline-flex min-h-11 items-center rounded-sm px-1 text-sm font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid"
                >
                  {labels.clear}
                </Link>
              )}
            </div>
          </div>
          {/* Enter submits even before the script loads; hidden, as the fields apply themselves. */}
          <button type="submit" hidden tabIndex={-1} />
        </Form>
      </div>
      <div aria-busy={pending} className={cn("transition-opacity duration-200", pending && "opacity-55")}>
        {children}
      </div>
    </div>
  );
}
