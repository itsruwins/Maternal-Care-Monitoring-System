// Plain lists for the follow-up form. Kept apart from schemas.ts so the form
// (a Client Component) doesn't pull Zod into the browser.
export const FOLLOW_UP_METHODS = ["CALL", "SMS", "HOME_VISIT"] as const;
export const FOLLOW_UP_RESULTS = ["REACHED", "NOT_REACHED"] as const;
export const CLOSE_REASONS = ["MOVED_AWAY", "CARE_ELSEWHERE", "OTHER"] as const;
export const NOTES_MAX = 500;

/** Missed visits on one page of the Follow-ups list. */
export const FOLLOW_UPS_PAGE_SIZE = 20;

/** Open follow-ups missed more days ago than this are "over a week". */
export const OVER_A_WEEK_DAYS = 7;
