import "server-only";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { AREA_ROLES } from "@/lib/auth/roles";
import { getCurrentUser } from "@/lib/auth/session";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import type { UserRole } from "@/types/database";
import { parseReportFilters } from "../period";
import { getReportRows } from "../queries/details";
import { getReportSummary, listReportServices } from "../queries/summary";
import { csvFileName, reportCsv } from "./csv";

// GET /api/reports/csv?tab=&period=&…&lang=: the tab the page shows, as a CSV.
// The proxy skips /api, so the role is checked here: staff only, and the SMS
// tab for admins only. The queries read every row in 1,000-row batches.
export async function downloadReportCsv(request: Request): Promise<Response> {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const locale = isLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
  const t = await getDictionary(locale);
  const plain = (text: string, status: number) =>
    new Response(text, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });

  const user = await getCurrentUser();
  if (!user || user.mustChangePassword) return plain(t.reports.csv.denied, 401);
  const isAdmin = user.role === "ADMIN";
  if (!(AREA_ROLES.staff as readonly UserRole[]).includes(user.role) || (params.tab === "sms" && !isAdmin)) return plain(t.reports.csv.denied, 403);

  const filters = parseReportFilters(params, manilaTodayISO(), { isAdmin });
  try {
    let body: string;
    if (filters.tab === "summary") {
      const services = await listReportServices();
      body = reportCsv(t, locale, { summary: await getReportSummary(filters, { isAdmin }, services) });
    } else {
      const rows = await getReportRows(filters, { isAdmin });
      if (!rows) return plain(t.reports.csv.denied, 403);
      body = reportCsv(t, locale, { rows });
    }
    return new Response(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${csvFileName(filters)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return plain(t.reports.csv.failed, 500);
  }
}
