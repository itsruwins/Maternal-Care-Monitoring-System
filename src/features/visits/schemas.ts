import { z } from "@/lib/validation/zod";
import { HARD, type VitalKey } from "@/lib/visits/vitals";

// Error messages are dictionary keys (visits.errors.*).

/** A vital sign typed as text: a number inside the typo limits. */
const vital = (key: VitalKey, { required, integer }: { required: boolean; integer: boolean }) =>
  z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (value === "") {
        if (required) ctx.addIssue({ code: "custom", message: "required" });
        return;
      }
      const number = Number(value.replace(",", "."));
      if (!Number.isFinite(number) || (integer && !Number.isInteger(number))) {
        ctx.addIssue({ code: "custom", message: "number" });
      } else if (number < HARD[key].min) {
        ctx.addIssue({ code: "custom", message: "tooLow" });
      } else if (number > HARD[key].max) {
        ctx.addIssue({ code: "custom", message: "tooHigh" });
      }
    })
    .transform((value) => (value === "" ? null : Number(value.replace(",", "."))));

export const visitSchema = z
  .object({
    bpSystolic: vital("bpSystolic", { required: true, integer: true }),
    bpDiastolic: vital("bpDiastolic", { required: true, integer: true }),
    weightKg: vital("weightKg", { required: true, integer: false }),
    temperatureC: vital("temperatureC", { required: true, integer: false }),
    pulseRate: vital("pulseRate", { required: true, integer: true }),
    fundalHeightCm: vital("fundalHeightCm", { required: false, integer: false }),
    fetalHeartRate: vital("fetalHeartRate", { required: false, integer: true }),
    notes: z.string().trim().max(1000, "tooLong"),
    services: z
      .array(
        z.object({
          serviceId: z.number().int().positive(),
          details: z.string().trim().max(120, "tooLong"),
          resultNotes: z.string().trim().max(300, "tooLong"),
        }),
      )
      .max(20),
  })
  .superRefine((data, ctx) => {
    if (data.bpSystolic != null && data.bpDiastolic != null && data.bpSystolic <= data.bpDiastolic) {
      ctx.addIssue({ code: "custom", path: ["bpDiastolic"], message: "bpOrder" });
    }
  });
