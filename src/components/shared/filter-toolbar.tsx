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

type Values = { q: string; from: string; to: string } & Record<string, string>;
export type ToolbarSelect = {
  name: string;
  label: string;
  options: { value: string; label: string }[];
};

// The grid for none, one or two selects. Phones: the search, the selects
// (side by side when two), then the two dates side by side. Larger: the
// search on its own row, the rest on the next; then one row.
const LAYOUT = {
  0: {
    grid: "sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] xl:grid-cols-[minmax(0,1.6fr)_10.5rem_10.5rem_auto]",
    search: "sm:col-span-3",
    select: "",
  },
  1: {
    grid: "sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)_10.5rem_10.5rem_auto]",
    search: "sm:col-span-4",
    select: "col-span-2 sm:col-span-1",
  },
  // Two selects: pairs below 1280px, the search over one row of four from
  // 1280px, all on one row from 1536px.
  2: {
    grid: "xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] 2xl:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)_minmax(0,1fr)_9.75rem_9.75rem_auto]",
    search: "xl:col-span-5 2xl:col-span-1",
    select: "col-span-1",
  },
} as const;

// A list card with its filter toolbar on top and the rows (children) under
// it (or, detached, the toolbar card alone with the children below it, for
// cards): a search by mother, up to two selects, and a date range. Filters apply
// at once: the select and dates on change, the search after a short pause in
// typing or on Enter. It stays a GET form (next/form), so the filters live in
// the address and it works before the page's script loads. While the new
// rows load, they dim and a spinner shows.
export function FilterToolbar({
  id,
  values,
  hidden,
  selects = [],
  labels,
  clearHref,
  detached = false,
  children,
}: {
  /** Prefix for the fields' ids (unique on the page). */
  id: string;
  values: Values;
  /** Other address values (a view, a tab), carried along with every search. */
  hidden: Record<string, string>;
  selects?: ToolbarSelect[];
  labels: {
    form: string;
    search: string;
    placeholder: string;
    from: string;
    to: string;
    clear: string;
    updating: string;
  };
  /** Shown when a filter is set. */
  clearHref: string | null;
  /** The toolbar in its own card, the children below it (not inside). */
  detached?: boolean;
  children: ReactNode;
}) {
  const layout = LAYOUT[Math.min(selects.length, 2) as 0 | 1 | 2];
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
    for (const name of ["q", "from", "to", ...selects.map((select) => select.name)]) {
      const field = box.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
      if (field && document.activeElement !== field) field.value = values[name] ?? "";
    }
  }, [values, selects]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const submit = () => {
    clearTimeout(timer.current);
    form.current?.requestSubmit();
  };

  const toolbar = (
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
      className={cn("grid grid-cols-2 items-end gap-x-2.5 gap-y-3 p-4 sm:p-5", !detached && "border-b border-line", layout.grid)}
    >
      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <div className={cn("col-span-2 flex flex-col gap-1.5", selects.length < 2 && "xl:col-span-1", layout.search)}>
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
      {selects.map((select) => (
        <div key={select.name} className={cn("flex min-w-0 flex-col gap-1.5", layout.select)}>
          <label htmlFor={`${id}-${select.name}`} className={LABEL}>
            {select.label}
          </label>
          <NativeSelect id={`${id}-${select.name}`} name={select.name} defaultValue={values[select.name]} onChange={submit}>
            {select.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </div>
      ))}
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
      <div
        className={cn(
          "col-span-2 flex min-h-12 items-center justify-between gap-3 sm:justify-end",
          selects.length < 2 ? "sm:col-span-1" : "xl:col-span-1",
          !pending && !clearHref && (selects.length < 2 ? "max-sm:hidden" : "max-xl:hidden"),
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
  );
  const rows = (
    <div aria-busy={pending} className={cn("transition-opacity duration-200", pending && "opacity-55")}>
      {children}
    </div>
  );

  if (detached) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl bg-white shadow-[var(--shadow-soft)]">{toolbar}</div>
        {rows}
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)]">
      {toolbar}
      {rows}
    </div>
  );
}
