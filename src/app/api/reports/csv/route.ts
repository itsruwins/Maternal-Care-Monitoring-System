import { downloadReportCsv } from "@/features/reports/server/csv-download";

// A report tab as a CSV download (see the feature for the rules).
export async function GET(request: Request) {
  return downloadReportCsv(request);
}
