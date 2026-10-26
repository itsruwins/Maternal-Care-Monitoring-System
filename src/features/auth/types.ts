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
