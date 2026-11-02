import type { ReportSummary } from "../types";

const GREEN = "#16805F";

// Services given, most first: ranked horizontal bars in chart green, each
// with its name above and its count written beside it. One series, so no
// legend; a service given 0 times shows just its "0".
export function ServicesBars({ services }: { services: ReportSummary["services"] }) {
  const max = Math.max(1, ...services.map((service) => service.count));
  return (
    <ul className="flex flex-col gap-3 pt-2">
      {services.map((service) => (
        <li key={service.id}>
          <p className="text-[0.95rem] break-words text-ink">{service.name}</p>
          <div className="mt-1 flex items-center gap-2">
            {service.count > 0 && (
              <span
                aria-hidden
                className="block h-4 rounded-r-[4px]"
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
