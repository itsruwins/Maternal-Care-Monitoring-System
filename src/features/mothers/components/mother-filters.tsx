import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { PurokOption } from "@/lib/puroks/types";
import { formatMonth } from "@/lib/utils/manila-date";
import { mothersHref, tabKeepsDueMonth } from "../paths";
import type { MotherFilters } from "../types";
import { MotherToolbar } from "./mother-toolbar";

// The registry card: builds the toolbar's choices and words here on the
// server (so the browser gets only what it shows) around the list.
export function MotherFiltersCard({
  t,
  locale,
  filters,
  puroks,
  dueMonths,
  children,
}: {
  t: Dictionary;
  locale: Locale;
  filters: MotherFilters;
  puroks: PurokOption[];
  dueMonths: string[];
  children: ReactNode;
}) {
  const s = t.mothers.search;
  const hidden: Record<string, string> = {};
  if (filters.status) hidden.status = filters.status;
  if (filters.sort !== "name") hidden.sort = filters.sort;
  const hasFilters = Boolean(filters.q || filters.purok || filters.due);

  return (
    <MotherToolbar
      values={{ q: filters.q, purok: String(filters.purok), due: filters.due }}
      hidden={hidden}
      puroks={[
        { value: "", label: s.allPuroks },
        ...puroks.map((purok) => ({ value: String(purok.id), label: purok.name })),
        { value: "none", label: s.noPurok },
      ]}
      dueMonths={
        tabKeepsDueMonth(filters.status)
          ? [
              { value: "", label: s.anyDueMonth },
              ...dueMonths.map((month) => ({ value: month, label: format(s.dueIn, { month: formatMonth(month, locale) }) })),
            ]
          : null
      }
      labels={{
        form: t.mothers.toolbarLabel,
        search: s.label,
        placeholder: s.placeholder,
        purok: s.purok,
        due: s.due,
        clear: s.clear,
        updating: t.mothers.updating,
      }}
      clearHref={hasFilters ? mothersHref(filters, { q: "", purok: "", due: "" }) : null}
    >
      {children}
    </MotherToolbar>
  );
}
