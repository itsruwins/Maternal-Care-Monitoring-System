"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "@/lib/utils/cn";

export type TrendSeries = { name: string; color: string };
export type TrendPoint = { week: number; label: string; values: number[] };

// A small line chart across pregnancy weeks (display only). Thin 2px lines,
// 8px dots with a white ring, one y-axis, recessive grid. Two or more series
// get a legend and a direct label at the line end. Hover or arrow keys move a
// crosshair with one readout for every series; "Show as table" lists every
// value. Colours were checked for colour-blind separation (dataviz validator).
export function TrendChart({
  title,
  unit,
  series,
  points,
  weekLabel,
  weekAxis,
  tableLabel,
}: {
  title: string;
  unit: string;
  series: TrendSeries[];
  points: TrendPoint[];
  /** "Week {weeks}" */
  weekLabel: (weeks: number) => string;
  weekAxis: string;
  tableLabel: string;
}) {
  const id = useId();
  const [active, setActive] = useState<number | null>(null);
  // Draw at the real width, so labels stay 13px on phones and desktops.
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(600);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setW(Math.max(260, Math.round(entry.contentRect.width))));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const H = 200;
  const pad = { top: 16, right: series.length > 1 ? 64 : 20, bottom: 32, left: 44 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const weeks = points.map((p) => p.week);
  const minWeek = Math.min(...weeks);
  const maxWeek = Math.max(...weeks);
  const all = points.flatMap((p) => p.values);
  const [lo, hi, step] = niceRange(Math.min(...all), Math.max(...all));
  const x = (week: number) => pad.left + (maxWeek === minWeek ? innerW / 2 : ((week - minWeek) / (maxWeek - minWeek)) * innerW);
  const y = (value: number) => pad.top + innerH - ((value - lo) / (hi - lo)) * innerH;
  const ticks = Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, i) => lo + i * step);
  const weekTicks = [...new Set([minWeek, Math.round((minWeek + maxWeek) / 2), maxWeek])];

  const nearest = (clientX: number, rect: DOMRect) => {
    const svgX = ((clientX - rect.left) / rect.width) * W;
    let best = 0;
    points.forEach((p, i) => {
      if (Math.abs(x(p.week) - svgX) < Math.abs(x(points[best].week) - svgX)) best = i;
    });
    return best;
  };
  const onMove = (event: PointerEvent<SVGSVGElement>) => setActive(nearest(event.clientX, event.currentTarget.getBoundingClientRect()));
  const onKey = (event: KeyboardEvent<SVGSVGElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const from = active ?? (event.key === "ArrowRight" ? -1 : points.length);
      setActive(Math.min(points.length - 1, Math.max(0, from + (event.key === "ArrowRight" ? 1 : -1))));
    }
  };
  const current = active === null ? null : points[active];

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="font-bold">
          {title} <span className="text-sm font-medium text-ink-soft">({unit})</span>
        </span>
        {series.length > 1 && (
          <span className="flex gap-4 text-sm text-ink-soft">
            {series.map((s) => (
              <span key={s.name} className="inline-flex items-center gap-1.5">
                <span aria-hidden className="h-0.5 w-4 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name}
              </span>
            ))}
          </span>
        )}
      </figcaption>

      <div ref={box} className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ height: H }}
          className="block w-full touch-pan-y overflow-visible outline-none focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-leaf"
          role="img"
          aria-labelledby={`${id}-desc`}
          tabIndex={0}
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setActive(null)}
          onKeyDown={onKey}
          onBlur={() => setActive(null)}
        >
          <desc id={`${id}-desc`}>
            {title}, {points.map((p) => `${weekLabel(p.week)}: ${p.values.join(" / ")} ${unit}`).join("; ")}
          </desc>
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={pad.left} x2={W - pad.right} y1={y(tick)} y2={y(tick)} className="stroke-line" strokeWidth={1} />
              <text x={pad.left - 8} y={y(tick)} textAnchor="end" dominantBaseline="middle" className="fill-ink-soft text-[13px] tabular-nums">
                {tick}
              </text>
            </g>
          ))}
          {weekTicks.map((week) => (
            <text key={week} x={x(week)} y={H - 8} textAnchor="middle" className="fill-ink-soft text-[13px] tabular-nums">
              {week}
            </text>
          ))}
          <text x={W - pad.right} y={H - 8} textAnchor="end" className="sr-only">
            {weekAxis}
          </text>

          {current && <line x1={x(current.week)} x2={x(current.week)} y1={pad.top} y2={pad.top + innerH} className="stroke-ink-soft/50" strokeWidth={1} />}

          {series.map((s, si) => {
            const path = points.map((p, i) => `${i ? "L" : "M"}${x(p.week)},${y(p.values[si])}`).join(" ");
            const last = points[points.length - 1];
            return (
              <g key={s.name}>
                <path d={path} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                {points.map((p, i) => (
                  <circle
                    key={p.week + "-" + i}
                    cx={x(p.week)}
                    cy={y(p.values[si])}
                    r={active === i ? 6 : 4}
                    fill={s.color}
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
                {series.length > 1 && (
                  <text x={x(last.week) + 10} y={y(last.values[si])} dominantBaseline="middle" className="fill-ink-soft text-[13px] font-semibold">
                    {s.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {current && (
          <div
            aria-live="polite"
            className="pointer-events-none absolute top-0 rounded-xl border border-line bg-white px-3 py-2 text-sm shadow-[var(--shadow-soft)]"
            style={{
              left: `${(x(current.week) / W) * 100}%`,
              transform: `translateX(${x(current.week) > W * 0.6 ? "calc(-100% - 12px)" : "12px"})`,
            }}
          >
            <p className="font-medium whitespace-nowrap text-ink-soft">
              {weekLabel(current.week)} · {current.label}
            </p>
            {series.map((s, si) => (
              <p key={s.name} className="flex items-center gap-2 whitespace-nowrap">
                <span aria-hidden className="h-0.5 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="tnum font-bold text-ink">{current.values[si]}</span>
                {series.length > 1 && <span className="text-ink-soft">{s.name}</span>}
              </p>
            ))}
          </div>
        )}
      </div>

      <details className="group text-sm">
        <summary className="cursor-pointer font-semibold text-leaf underline decoration-1 underline-offset-4">{tableLabel}</summary>
        <table className="mt-3 w-full text-left">
          <thead className="text-caption text-ink-soft">
            <tr>
              <th scope="col" className="py-1.5 font-semibold">
                {weekAxis}
              </th>
              {series.map((s) => (
                <th key={s.name} scope="col" className="py-1.5 font-semibold">
                  {series.length > 1 ? s.name : `${title} (${unit})`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={cn("tnum divide-y divide-line")}>
            {points.map((p, i) => (
              <tr key={i}>
                <td className="py-1.5">
                  {weekLabel(p.week)} <span className="text-ink-soft">· {p.label}</span>
                </td>
                {p.values.map((value, vi) => (
                  <td key={vi} className="py-1.5 font-semibold">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/** Rounded axis bounds and step (about four gridlines). */
function niceRange(min: number, max: number): [number, number, number] {
  const span = Math.max(max - min, 1);
  const raw = span / 3;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? raw;
  const lo = Math.floor((min - span * 0.1) / step) * step;
  const hi = Math.ceil((max + span * 0.1) / step) * step;
  return [lo, hi, step];
}
