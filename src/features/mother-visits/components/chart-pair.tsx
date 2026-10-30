"use client";

import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { formatSlotDate } from "@/lib/appointments/format";
import { TrendChart } from "./trend-chart";

// Colours checked with the dataviz validator: green and soft rose stay apart
// for colour-blind readers; the rose is light, so the lines carry direct
// labels and every value is in "Show as table".
const GREEN = "#16805F";
const ROSE = "#E08F82";

// Weight and blood pressure across this pregnancy's visits (oldest first).
export function ChartPair({ points }: { points: { week: number; at: string; weight: number; top: number; bottom: number }[] }) {
  const { t, locale } = useDictionary();
  const m = t.myVisits;
  const weekLabel = (weeks: number) => format(m.week, { weeks });
  const label = (at: string) => formatSlotDate(at, locale, "short");
  return (
    <>
      <TrendChart
        title={m.weight}
        unit="kg"
        series={[{ name: m.weight, color: GREEN }]}
        points={points.map((p) => ({ week: p.week, label: label(p.at), values: [p.weight] }))}
        weekLabel={weekLabel}
        weekAxis={m.weekAxis}
        tableLabel={m.showTable}
      />
      <TrendChart
        title={m.bp}
        unit="mmHg"
        series={[
          { name: m.top, color: GREEN },
          { name: m.bottom, color: ROSE },
        ]}
        points={points.map((p) => ({ week: p.week, label: label(p.at), values: [p.top, p.bottom] }))}
        weekLabel={weekLabel}
        weekAxis={m.weekAxis}
        tableLabel={m.showTable}
      />
    </>
  );
}
