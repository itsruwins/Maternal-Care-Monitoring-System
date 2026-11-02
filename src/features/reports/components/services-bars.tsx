import type { ReportSummary } from "../types";

const GREEN = "#16805F";

// Services given, most first: ranked horizontal bars in chart green, each
// with its name above and its count written beside it. One series, so no
// legend; a service given 0 times shows just its "0". On paper, name and
// count rows like the other cards.
export function ServicesBars({ services }: { services: ReportSummary["services"] }) {
  const max = Math.max(1, ...services.map((service) => service.count));
  return (
    <ul className="flex flex-col gap-3 pt-2 print:gap-0 print:divide-y print:divide-line">
      {services.map((service) => (
        <li key={service.id} className="print:flex print:min-h-11 print:items-center print:justify-between print:gap-4 print:py-2">
          <p className="text-[0.95rem] break-words text-ink">{service.name}</p>
          <div className="mt-1 flex items-center gap-2 print:mt-0">
            {service.count > 0 && (
              <span
                aria-hidden
                className="block h-4 rounded-r-[4px] print:hidden"
                style={{ width: `calc((100% - 3rem) * ${service.count / max})`, background: GREEN }}
              />
            )}
            <span className="tnum text-sm font-bold text-ink">{service.count}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
