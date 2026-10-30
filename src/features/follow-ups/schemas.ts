import { z } from "zod";

// Error messages are dictionary keys (followUpErrors.*). The database checks
// the same rules again, plus the date range (migration 0015).
export const FOLLOW_UP_METHODS = ["CALL", "SMS", "HOME_VISIT"] as const;
export const FOLLOW_UP_RESULTS = ["REACHED", "NOT_REACHED"] as const;
export const CLOSE_REASONS = ["MOVED_AWAY", "CARE_ELSEWHERE", "OTHER"] as const;
export const NOTES_MAX = 500;

export const followUpSchema = z
  .object({
    method: z.enum(FOLLOW_UP_METHODS, "method_required"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date_required"),
    result: z.enum(FOLLOW_UP_RESULTS, "result_required"),
    notes: z.string().trim().max(NOTES_MAX, "notes_too_long"),
    /** null: keep following up. "" means the box is ticked without a reason. */
    closeReason: z.enum(CLOSE_REASONS, "reason_required").nullable(),
  })
  .refine((value) => value.closeReason !== "OTHER" || value.notes.length > 0, { path: ["notes"], message: "close_note_required" });

export type FollowUpField = keyof z.input<typeof followUpSchema>;

/** What the form sends (unchecked strings; "" when nothing is picked). */
export type FollowUpValues = Record<Exclude<FollowUpField, "closeReason">, string> & { closeReason: string | null };
