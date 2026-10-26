import { z } from "zod";

// Error messages are dictionary keys (auth.errors.*), translated in the UI.
export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "usernameRequired")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, "passwordRequired"),
});

export type LoginInput = z.input<typeof loginSchema>;
