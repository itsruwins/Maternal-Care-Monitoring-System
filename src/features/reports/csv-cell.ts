// One CSV cell (used by server/csv.ts; its own file so the unit tests can load it).

export type Cell = string | number | null;

/** Quotes a cell when needed, and defuses text a spreadsheet would run as a formula. */
export function csvCell(value: Cell): string {
  let text = value === null ? "" : String(value);
  if (typeof value === "string" && /^[=+@\t\r]|^-(?!\d)/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
