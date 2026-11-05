"use client";

import { useActionState, type ReactNode } from "react";
import { toast } from "sonner";
import { DangerIcon, SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useDictionary } from "@/i18n/dictionary-provider";
import { submitWithoutReset } from "@/lib/forms/submit-without-reset";
import { updateStaffProfile } from "../actions/manage-account";
import type { FormState, StaffField } from "../types";
import { StaffFields, type StaffDefaults } from "./staff-fields";

// Admin edits a staff member's name, position and mobile number: a
// full-width card (its heading, the fields in rows), with Save changes on the
// right of a milk footer.
export function StaffProfileForm({ userId, defaults, heading }: { userId: string; defaults: StaffDefaults; heading: ReactNode }) {
  const { t } = useDictionary();
  const d = t.accounts.detail;
  const [state, formAction, pending] = useActionState<FormState<StaffField>, FormData>(async (previous, formData) => {
    const result = await updateStaffProfile(userId, previous, formData);
    if (result.ok) toast.success(d.saved);
    return result;
  }, {});

  return (
    <form
      action={formAction}
      onSubmit={submitWithoutReset(formAction)}
      noValidate
      className="overflow-hidden rounded-3xl bg-white shadow-[var(--shadow-soft)]"
    >
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        {heading}
        <StaffFields idPrefix="edit-staff" defaults={defaults} errors={state.fieldErrors} wide />
        {state.error && (
          <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3 text-sm leading-5 text-rose-deep">
            <DangerIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
            {t.accounts.errors[state.error]}
          </p>
        )}
      </div>
      <div className="flex justify-end border-t border-line bg-milk px-5 py-4 sm:px-6">
        <Button type="submit" disabled={pending} aria-busy={pending} className="w-full sm:w-auto">
          {pending && <SpinnerIcon className="animate-spin" aria-hidden />}
          {pending ? d.saving : d.save}
        </Button>
      </div>
    </form>
  );
}
