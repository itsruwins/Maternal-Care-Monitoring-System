"use client";

import { useState } from "react";
import { PhoneIcon } from "@/components/icons";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { InputIcon } from "@/components/ui/input-icon";
import { NativeSelect } from "@/components/ui/native-select";
import { useDictionary } from "@/i18n/dictionary-provider";
import { MAX_LENGTH } from "@/lib/validation/account-rules";
import { POSITION_KEYS, positionKeyOf } from "../constants";
import type { AccountErrorKey, StaffField } from "../types";

export type StaffDefaults = {
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  position?: string;
  contactNumber?: string;
};

// Name, position (list + "Other") and mobile number: shared by "New staff
// account" and the staff profile editor. Field names match the server schema.
export function StaffFields({
  idPrefix,
  defaults = {},
  errors = {},
}: {
  idPrefix: string;
  defaults?: StaffDefaults;
  errors?: Partial<Record<StaffField, AccountErrorKey>>;
}) {
  const { t } = useDictionary();
  const c = t.accounts.create;
  const startKey = defaults.position ? positionKeyOf(defaults.position) : "midwife";
  const [position, setPosition] = useState<string>(startKey);
  const err = (field: StaffField) => (errors[field] ? t.accounts.errors[errors[field]] : null);
  const id = (field: string) => `${idPrefix}-${field}`;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <FormField id={id("firstName")} label={c.firstName} error={err("firstName")}>
        {(describedBy) => (
          <Input id={id("firstName")} name="firstName" maxLength={MAX_LENGTH.namePart} defaultValue={defaults.firstName} autoComplete="off" aria-invalid={Boolean(errors.firstName)} aria-describedby={describedBy} />
        )}
      </FormField>
      <FormField id={id("middleName")} label={c.middleName} error={err("middleName")}>
        {(describedBy) => (
          <Input id={id("middleName")} name="middleName" maxLength={MAX_LENGTH.namePart} defaultValue={defaults.middleName ?? ""} autoComplete="off" aria-describedby={describedBy} />
        )}
      </FormField>
      <FormField id={id("lastName")} label={c.lastName} error={err("lastName")} className="sm:col-span-2">
        {(describedBy) => (
          <Input id={id("lastName")} name="lastName" maxLength={MAX_LENGTH.namePart} defaultValue={defaults.lastName} autoComplete="off" aria-invalid={Boolean(errors.lastName)} aria-describedby={describedBy} />
        )}
      </FormField>
      <FormField id={id("position")} label={c.position} error={err("position")} className="sm:col-span-2">
        {(describedBy) => (
          <NativeSelect id={id("position")} name="position" value={position} onChange={(e) => setPosition(e.target.value)} aria-describedby={describedBy}>
            {POSITION_KEYS.map((key) => (
              <option key={key} value={key}>
                {t.accounts.positions[key]}
              </option>
            ))}
            <option value="other">{t.accounts.positions.other}</option>
          </NativeSelect>
        )}
      </FormField>
      {position === "other" ? (
        <FormField id={id("positionOther")} label={c.positionOther} error={err("positionOther")} className="sm:col-span-2">
          {(describedBy) => (
            <Input
              id={id("positionOther")}
              name="positionOther"
              maxLength={MAX_LENGTH.position}
              defaultValue={startKey === "other" ? defaults.position : ""}
              aria-invalid={Boolean(errors.positionOther)}
              aria-describedby={describedBy}
            />
          )}
        </FormField>
      ) : (
        <input type="hidden" name="positionOther" value="" />
      )}
      <FormField id={id("contactNumber")} label={c.contact} hint={c.contactHint} error={err("contactNumber")} className="sm:col-span-2">
        {(describedBy) => (
          <InputIcon icon={PhoneIcon}>
            <Input
              id={id("contactNumber")}
              name="contactNumber"
              type="tel"
              inputMode="tel"
              defaultValue={defaults.contactNumber}
              aria-invalid={Boolean(errors.contactNumber)}
              aria-describedby={describedBy}
              className="pl-11"
            />
          </InputIcon>
        )}
      </FormField>
    </div>
  );
}
