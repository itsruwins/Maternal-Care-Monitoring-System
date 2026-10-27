import type { Dictionary } from "@/i18n/get-dictionary";

export type ProfileErrorKey = keyof Dictionary["profile"]["errors"];

export type ProfileFormState<Field extends string> = {
  ok?: boolean;
  error?: ProfileErrorKey;
  fieldErrors?: Partial<Record<Field, ProfileErrorKey>>;
};

export type MyProfile = {
  username: string;
  kind: "staff" | "mother";
  /** Real recovery email, or null (none / placeholder). */
  email: string | null;
  details: {
    firstName: string;
    middleName: string;
    lastName: string;
    contactNumber: string;
    /** Staff only. */
    position?: string;
    /** Mothers only. */
    /** Purok id as text ("" when not set yet). */
    purokId?: string;
    street?: string;
    emergencyName?: string;
    emergencyNumber?: string;
  };
};
