// Keys of auth.errors in the dictionaries.
export type LoginErrorCode = "invalid" | "locked" | "inactive" | "generic";
export type LoginFieldErrorCode = "usernameRequired" | "passwordRequired";

export type LoginState = {
  error?: LoginErrorCode;
  lockMinutes?: number;
  fieldErrors?: {
    username?: LoginFieldErrorCode;
    password?: LoginFieldErrorCode;
  };
  // Echo the typed username back so the field isn't cleared on error.
  username?: string;
};

// Keys of register.errors. `field` says which input the error belongs to.
export type RegisterResult =
  | { ok: true }
  | {
      ok: false;
      error: "usernameTaken" | "emailTaken" | "generic" | "invalid" | "tooMany";
      field?: "username" | "email";
      /** With "tooMany": minutes to wait. */
      minutes?: number;
    };

export type ForgotPasswordState = { sent?: boolean; error?: "required" | "tooMany"; minutes?: number };

export type NewPasswordState = {
  error?: "passwordShort" | "passwordLong" | "passwordMismatch" | "sameAsUsername" | "generic";
  field?: "password" | "confirm";
};

export type ResetPasswordState = {
  error?: "passwordShort" | "passwordLong" | "passwordMismatch" | "generic" | "expired";
  field?: "password" | "confirm";
};
