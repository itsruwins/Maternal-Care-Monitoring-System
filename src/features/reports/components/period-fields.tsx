"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { useDictionary } from "@/i18n/dictionary-provider";
import { REPORT_PERIODS } from "../period";
import type { ReportPeriod } from "../types";

// The Period select, and From / To beside it only while "Custom dates" is
// picked. Hidden date fields are disabled, so they don't go with the form.
export function PeriodFields({ period, from, to }: { period: ReportPeriod; from: string; to: string }) {
  const { t } = useDictionary();
  const f = t.reports.filters;
  const [chosen, setChosen] = useState<ReportPeriod>(period);
  const custom = chosen === "custom";

  return (
    <>
      <div className="flex flex-col gap-2 xl:min-w-48 xl:flex-1">
        <Label htmlFor="reports-period">{f.period}</Label>
        <NativeSelect id="reports-period" name="period" value={chosen} onChange={(event) => setChosen(event.target.value as ReportPeriod)}>
          {REPORT_PERIODS.map((value) => (
            <option key={value} value={value}>
              {f.periods[value]}
            </option>
          ))}
        </NativeSelect>
      </div>
      {custom && (
        <>
          <div className="flex flex-col gap-2 xl:min-w-48 xl:flex-1">
            <Label htmlFor="reports-from">{f.from}</Label>
            <Input id="reports-from" name="from" type="date" required defaultValue={from} />
          </div>
          <div className="flex flex-col gap-2 xl:min-w-48 xl:flex-1">
            <Label htmlFor="reports-to">{f.to}</Label>
            <Input id="reports-to" name="to" type="date" required defaultValue={to} />
          </div>
        </>
      )}
    </>
  );
}
