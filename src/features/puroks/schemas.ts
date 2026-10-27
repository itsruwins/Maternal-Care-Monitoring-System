import { z } from "zod";

// Error messages are dictionary keys (puroks.errors.*).
export const purokSchema = z.object({
  name: z.string().trim().min(1, "required").max(60, "tooLong"),
});

export type PurokField = keyof z.input<typeof purokSchema>;
