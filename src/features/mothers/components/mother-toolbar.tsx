"use client";

import Form from "next/form";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SpinnerIcon, UserIcon } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { InputIcon } from "@/components/ui/input-icon";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils/cn";

/** How long after the last key the search runs. */
const SEARCH_PAUSE_MS = 350;

type Option = { value: string; label: string };

// The registry card: the filter toolbar on top, then the list (children).
// Filters apply at once: a select on change, the search after a short pause
// in typing or on Enter. It stays a GET form (next/form), so the filters live
// in the address and it still works before the page's script loads (Enter
// submits). While the new list loads, the list dims and a spinner shows.
export function MotherToolbar({
  values,
  hidden,
  puroks,
  dueMonths,
  labels,
  clearHref,
  children,
}: {
  values: { q: string; purok: string; due: string };
  /** The tab and sort, carried along with every search. */
  hidden: Record<string, string>;
  puroks: Option[];
  /** Null on tabs where a due month means nothing (Due within 30 days, Not pregnant). */
  dueMonths: Option[] | null;
  labels: { form: string; search: string; placeholder: string; purok: string; due: string; clear: string; updating: string };
  /** Shown when a search, purok or due month is set. */
  clearHref: string | null;
  children: ReactNode;
}) {
  const form = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [pending, setPending] = useState(false);
  const shown = `${values.q}|${values.purok}|${values.due}|${JSON.stringify(hidden)}`;
  const [settled, setSettled] = useState(shown);

  // A new list arrived (or Clear / a tab changed the filters): stop the
  // pending look and show the address's values, except in a field she is
  // typing in. Adjusted during render, as React advises for derived state.
  if (settled !== shown) {
    setSettled(shown);
    setPending(false);
  }
  useEffect(() => {
    const box = form.current;
    if (!box) return;
    const field = (name: string) => box.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
    const q = field("q");
    if (q && document.activeElement !== q) q.value = values.q;
    const purok = field("purok");
    if (purok) purok.value = values.purok;
    const due = field("due");
    if (due) due.value = values.due;
  }, [values.q, values.purok, values.due]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const submit = () => {
    clearTimeout(timer.current);
    form.current?.requestSubmit();
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)]">
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
        className={cn(
          // Phones: one column. From 640px the search takes the first row and the selects
          // share the second with Clear; from 1280px everything is one row.
          "grid grid-cols-1 gap-2.5 border-b border-line p-4 sm:p-5",
          dueMonths
            ? "sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] xl:grid-cols-[minmax(0,1fr)_11rem_13rem_auto]"
            : "sm:grid-cols-[minmax(0,1fr)_auto] xl:grid-cols-[minmax(0,1fr)_13rem_auto]",
        )}
      >
        {Object.entries(hidden).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <div className={cn(dueMonths ? "sm:col-span-3" : "sm:col-span-2", "xl:col-span-1")}>
          <label htmlFor="mothers-q" className="sr-only">
            {labels.search}
          </label>
          <InputIcon icon={UserIcon}>
            <Input
              id="mothers-q"
              name="q"
              type="search"
              defaultValue={values.q}
              placeholder={labels.placeholder}
              autoComplete="off"
              enterKeyHint="search"
              onChange={() => {
                clearTimeout(timer.current);
                timer.current = setTimeout(submit, SEARCH_PAUSE_MS);
              }}
              className="pl-11 [&::-webkit-search-cancel-button]:hidden"
            />
          </InputIcon>
        </div>
        <div className="min-w-0">
          <label htmlFor="mothers-purok" className="sr-only">
            {labels.purok}
          </label>
          <NativeSelect id="mothers-purok" name="purok" defaultValue={values.purok} onChange={submit}>
            {puroks.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </div>
        {dueMonths && (
          <div className="min-w-0">
            <label htmlFor="mothers-due" className="sr-only">
              {labels.due}
            </label>
            <NativeSelect id="mothers-due" name="due" defaultValue={values.due} onChange={submit}>
              {dueMonths.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        )}
        <div
          className={cn(
            "flex min-h-11 items-center justify-between gap-3 sm:justify-end",
            !pending && !clearHref && "max-sm:hidden",
          )}
        >
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
        {/* Enter submits even before the script loads; hidden, as the fields apply themselves. */}
        <button type="submit" hidden tabIndex={-1} />
      </Form>
      <div aria-busy={pending} className={cn("transition-opacity duration-200", pending && "opacity-55")}>
        {children}
      </div>
    </div>
  );
}
