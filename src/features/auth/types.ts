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
      error: "usernameTaken" | "emailTaken" | "generic" | "invalid";
      field?: "username" | "email";
    };

export type ForgotPasswordState = { sent?: boolean; error?: "required" };

export type ResetPasswordState = {
  error?: "passwordShort" | "passwordMismatch" | "generic" | "expired";
  field?: "password" | "confirm";
};
