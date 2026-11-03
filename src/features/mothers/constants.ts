export const MOTHERS_PAGE_SIZE = 20;

// The due-month filter offers last month through 10 months ahead.
export const DUE_MONTHS_BACK = 1;
export const DUE_MONTHS_AHEAD = 10;

// How a pregnancy ended. Here (not in schemas.ts) so the pregnancy dialogs
// don't pull Zod into the browser.
export const OUTCOMES = ["LIVE_BIRTH", "STILLBIRTH", "MISCARRIAGE", "OTHER"] as const;
