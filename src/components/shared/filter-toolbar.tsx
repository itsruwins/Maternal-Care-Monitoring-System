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

const LABEL = "text-caption font-semibold text-ink-soft";

type Values = { q: string; from: string; to: string; select?: string };
type Select = { name: string; label: string; options: { value: string; label: string }[] };

// A list card with its filter toolbar on top and the rows (children) under
// it: a search by mother, an optional select, and a date range. Filters apply
// at once: the select and dates on change, the search after a short pause in
// typing or on Enter. It stays a GET form (next/form), so the filters live in
// the address and it works before the page's script loads. While the new
// rows load, they dim and a spinner shows.
export function FilterToolbar({
  id,
  values,
  hidden,
  select,
  labels,
  clearHref,
  children,
}: {
  /** Prefix for the fields' ids (unique on the page). */
  id: string;
  values: Values;
  /** Other address values (a view, a tab), carried along with every search. */
  hidden: Record<string, string>;
  select?: Select;
  labels: { form: string; search: string; placeholder: string; from: string; to: string; clear: string; updating: string };
  /** Shown when a filter is set. */
  clearHref: string | null;
  children: ReactNode;
}) {
  const form = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [pending, setPending] = useState(false);
  const shown = `${JSON.stringify(values)}|${JSON.stringify(hidden)}`;
  const [settled, setSettled] = useState(shown);

  // New rows arrived (or Clear / a tab changed the filters): stop the pending
  // look and show the address's values, except in the field being typed in.
  if (settled !== shown) {
    setSettled(shown);
    setPending(false);
  }
  useEffect(() => {
    const box = form.current;
    if (!box) return;
    const fields: [string, string][] = [
      ["q", values.q],
      ["from", values.from],
      ["to", values.to],
    ];
    if (select) fields.push([select.name, values.select ?? ""]);
    for (const [name, value] of fields) {
      const field = box.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
      if (field && document.activeElement !== field) field.value = value;
    }
  }, [values, select]);
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
        // Phones: the search, then the select, then the two dates side by side.
        // From 640px the search takes the first row; from 1280px one row.
        className={cn(
          "grid grid-cols-2 items-end gap-x-2.5 gap-y-3 border-b border-line p-4 sm:p-5",
          select
            ? "sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)_10.5rem_10.5rem_auto]"
            : "sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] xl:grid-cols-[minmax(0,1.6fr)_10.5rem_10.5rem_auto]",
        )}
      >
        {Object.entries(hidden).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <div className={cn("col-span-2 flex flex-col gap-1.5 xl:col-span-1", select ? "sm:col-span-4" : "sm:col-span-3")}>
          <label htmlFor={`${id}-q`} className={LABEL}>
            {labels.search}
          </label>
          <InputIcon icon={UserIcon}>
            <Input
              id={`${id}-q`}
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
        {select && (
          <div className="col-span-2 flex min-w-0 flex-col gap-1.5 sm:col-span-1">
            <label htmlFor={`${id}-${select.name}`} className={LABEL}>
              {select.label}
            </label>
            <NativeSelect id={`${id}-${select.name}`} name={select.name} defaultValue={values.select} onChange={submit}>
              {select.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor={`${id}-from`} className={LABEL}>
            {labels.from}
          </label>
          <Input id={`${id}-from`} name="from" type="date" defaultValue={values.from} onChange={submit} className="tnum" />
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor={`${id}-to`} className={LABEL}>
            {labels.to}
          </label>
          <Input id={`${id}-to`} name="to" type="date" defaultValue={values.to} onChange={submit} className="tnum" />
        </div>
        <div className={cn("col-span-2 flex min-h-12 items-center justify-between gap-3 sm:col-span-1 sm:justify-end", !pending && !clearHref && "max-sm:hidden")}>
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
